import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import pathUtils from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { validateAdmx } from "../modules/validate_admx.mjs";

const FIXTURES = pathUtils.join(pathUtils.dirname(fileURLToPath(import.meta.url)), "fixtures");
const ADMX = await fs.readFile(pathUtils.join(FIXTURES, "thunderbird.admx"), "utf8");
const ADML = await fs.readFile(pathUtils.join(FIXTURES, "en-US", "thunderbird.adml"), "utf8");

/**
 * Validate the fixture with the given replacements applied.
 *
 * @param {Object} changes
 * @param {Array<[string, string]>} [changes.admx] - Replacements in the ADMX.
 * @param {Array<[string, string]>} [changes.adml] - Replacements in the ADML.
 * @returns {Promise<string[]>} the messages of the problems
 */
async function validateChanged({ admx = [], adml = [] } = {}) {
    const apply = (text, replacements) => replacements.reduce((result, [from, to]) => {
        assert.ok(result.includes(from), `The fixture should contain ${from}`);
        return result.replace(from, to);
    }, text);
    const dir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "validate-admx-"));
    try {
        await fs.mkdir(pathUtils.join(dir, "en-US"));
        await fs.writeFile(pathUtils.join(dir, "thunderbird.admx"), apply(ADMX, admx));
        await fs.writeFile(pathUtils.join(dir, "en-US", "thunderbird.adml"), apply(ADML, adml));
        const problems = await validateAdmx({
            admx: pathUtils.join(dir, "thunderbird.admx"),
            adml: pathUtils.join(dir, "en-US", "thunderbird.adml"),
        });
        return problems.map(p => p.message);
    } finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
}

function assertProblems(messages, expected) {
    assert.equal(messages.length, expected.length, `Unexpected problems:\n${messages.join("\n")}`);
    for (const pattern of expected) {
        assert.ok(messages.some(m => pattern.test(m)), `Expected a problem matching ${pattern}, got:\n${messages.join("\n")}`);
    }
}

test("the fixture is valid", async () => {
    assertProblems(await validateChanged(), []);
});

test("schema: an attribute which does not exist", async () => {
    assertProblems(await validateChanged({
        adml: [["<label>Homepage</label>", `<label refId="Homepage_Label"/>`]],
    }), [/Schemas validity error.*label.*The attribute 'refId' is not allowed/]);
});

test("schema: a revision with three parts", async () => {
    assertProblems(await validateChanged({
        admx: [[`revision="1.0" schemaVersion`, `revision="1.0.1" schemaVersion`]],
    }), [/Schemas validity error.*revision/]);
});

test("a string which does not exist in the ADML", async () => {
    assertProblems(await validateChanged({
        adml: [[`<string id="Locked_Explain">Locks the settings.</string>`, ""]],
    }), [/the string "Locked_Explain" does not exist/]);
});

test("a presentation which does not exist in the ADML", async () => {
    assertProblems(await validateChanged({
        admx: [[`presentation="$(presentation.Mode)"`, `presentation="$(presentation.Missing)"`]],
    }), [/the presentation "Missing" does not exist/]);
});

test("a control which refers to no element", async () => {
    assertProblems(await validateChanged({
        adml: [[`<textBox refId="Homepage_Input">`, `<textBox refId="Homepage_Wrong">`]],
    }), [
        /refId="Homepage_Wrong".*matches no element of policy "Homepage"/,
        /Element "Homepage_Input" of policy "Homepage" has no control/,
    ]);
});

test("a control which refers to an element of another type", async () => {
    assertProblems(await validateChanged({
        adml: [[
            `<textBox refId="Homepage_Input">\n          <label>Homepage</label>\n        </textBox>`,
            `<checkBox refId="Homepage_Input">Homepage</checkBox>`,
        ]],
    }), [/<checkBox refId="Homepage_Input">.*refers to a <text> element.*expected <boolean>/]);
});

test("an element without control", async () => {
    assertProblems(await validateChanged({
        adml: [[`<listBox refId="Allow_List">Allow</listBox>`, ""]],
    }), [/Element "Allow_List" of policy "Allow" has no control/]);
});

test("a policy with elements, but without presentation", async () => {
    assertProblems(await validateChanged({
        admx: [[` presentation="$(presentation.Mode)"`, ""]],
    }), [/Policy "Mode" has elements, but no presentation/]);
});

test("a parent category which does not exist", async () => {
    assertProblems(await validateChanged({
        admx: [[`<parentCategory ref="Test_category"/>\n    </category>`, `<parentCategory ref="Missing_category"/>\n    </category>`]],
    }), [/parentCategory "Missing_category" does not exist/]);
});

test("a prefix without using declaration", async () => {
    assertProblems(await validateChanged({
        admx: [[`<parentCategory ref="Test_category"/>\n    </category>`, `<parentCategory ref="Mozilla:Cat_Mozilla"/>\n    </category>`]],
    }), [/the prefix "Mozilla" is not declared by a <using> element/]);
});

test("a prefix with using declaration", async () => {
    assertProblems(await validateChanged({
        admx: [
            [`<target prefix="test" namespace="Test.Policies.Fixture"/>`, `<target prefix="test" namespace="Test.Policies.Fixture"/>\n    <using prefix="Mozilla" namespace="Mozilla.Policies"/>`],
            [`<category name="Test_category" displayName="$(string.Test_category)"/>`, `<category name="Test_category" displayName="$(string.Test_category)">\n      <parentCategory ref="Mozilla:Cat_Mozilla"/>\n    </category>`],
        ],
    }), []);
});

test("a supportedOn definition which does not exist", async () => {
    assertProblems(await validateChanged({
        admx: [[`<supportedOn ref="SUPPORTED_1"/>`, `<supportedOn ref="SUPPORTED_2"/>`]],
    }), [/supportedOn "SUPPORTED_2" does not exist/]);
});

test("duplicate policy names", async () => {
    assertProblems(await validateChanged({
        admx: [[`<policy name="Mode"`, `<policy name="Homepage"`]],
    }), [/Duplicate policy "Homepage"/]);
});

test("duplicate category names", async () => {
    assertProblems(await validateChanged({
        admx: [[
            `<category name="Test_category" displayName="$(string.Test_category)"/>`,
            `<category name="Test_category" displayName="$(string.Test_category)"/>\n    <category name="Test_category" displayName="$(string.Test_category)"/>`,
        ]],
    }), [/Duplicate category "Test_category"/]);
});

test("duplicate string ids", async () => {
    assertProblems(await validateChanged({
        adml: [[`<string id="Mode">Mode</string>`, `<string id="Mode">Mode</string>\n      <string id="Mode">Mode</string>`]],
    }), [/Duplicate string "Mode"/]);
});

test("duplicate presentation ids", async () => {
    assertProblems(await validateChanged({
        adml: [[
            `<presentation id="Allow">`,
            `<presentation id="Allow">\n        <listBox refId="Allow_List">Allow</listBox>\n      </presentation>\n      <presentation id="Allow">`,
        ]],
    }), [/Duplicate presentation "Allow"/]);
});

test("an ADML revision lower than required by the ADMX", async () => {
    assertProblems(await validateChanged({
        admx: [[`<resources minRequiredRevision="1.0"/>`, `<resources minRequiredRevision="1.1"/>`]],
    }), [/The revision 1.0 is lower than the minRequiredRevision 1.1/]);
});
