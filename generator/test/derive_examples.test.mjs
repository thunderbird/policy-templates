import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveSections } from "../modules/derive_examples.mjs";
import { SchemaL10n } from "../modules/l10n.mjs";

const BASE_KEY = "Software\\Policies\\Mozilla\\Thunderbird";

const L10N = new SchemaL10n([
    { name: "brand.ftl", source: "-brand-short-name = Thunderbird\n" },
    { name: "policies.ftl", source: "policy-Auth = Configure authentication in { -brand-short-name }.\n" },
]);

// A small policy schema with the different kinds of values, with the texts and
// examples of each policy.
const SCHEMA = {
    definitions: {
        path: { type: "string" },
    },
    properties: {
        Flag: { type: "boolean", description: "A flag.", examples: [true] },
        WindowsFlag: { type: "boolean", description: "A Windows flag.", "x-formats": ["gpo", "json"], examples: [true] },
        Mode: { type: "string", enum: ["none", "manual", "auto"], description: "A mode.", examples: ["manual"] },
        Level: {
            type: "number",
            oneOf: [{ const: 1, title: "Low" }, { const: 2, title: "High" }],
            description: "A level.",
            examples: [2],
        },
        Path: {
            $ref: "#/definitions/path",
            "x-expand-env-vars": true,
            description: "A path.",
            examples: ["/home/user/file"],
            "x-examples-gpo": ["C:\\file"],
        },
        List: { type: "array", items: { type: "string" }, description: "A list.", examples: [["a", "b"]] },
        Settings: {
            type: "object",
            contentMediaType: "application/json",
            properties: { enabled: { type: "boolean" } },
            description: "Settings as JSON.",
            examples: [{ enabled: true }],
        },
        Auth: {
            type: "object",
            "x-description-l10n-id": "policy-Auth",
            "x-help": "Help of Auth.",
            properties: {
                Sites: { type: "array", items: { type: "string" }, description: "The sites." },
                AllowNonFQDN: {
                    type: "object",
                    title: "Non-FQDN hosts",
                    description: "Integrated authentication for non-FQDN hosts.",
                    properties: {
                        SPNEGO: { type: "boolean", description: "Allow SPNEGO." },
                        NTLM: { type: "boolean" },
                    },
                },
                Locked: { type: "boolean", title: "Lock it", description: "Locks it.", "x-help": "More about locking.", "x-deprecated": true },
            },
            examples: [{ Sites: ["example.com"], AllowNonFQDN: { SPNEGO: true, NTLM: false }, Locked: true }],
        },
        Downloads: {
            type: "object",
            description: "Downloads.",
            properties: {
                Folder: { type: "string", description: "The folder.", "x-expand-env-vars": true },
                Temp: { type: "string", "x-expand-env-vars": true },
                Ask: { type: "boolean", description: "Ask first." },
            },
            examples: [{ Folder: "/downloads", Temp: "/tmp", Ask: true }],
        },
        Devices: {
            type: "object",
            description: "Security devices.",
            properties: {
                Add: { type: "object", description: "Devices to add.", "x-help": "More about adding.", patternProperties: { "^.*$": { type: "string" } } },
            },
            patternProperties: {
                "^(?!Add$).*$": { type: "string", title: "Older form.", description: "The older form.", "x-help": "Still supported.", "x-deprecated": true },
            },
            examples: [
                { Add: { MyDevice: "/libs/my.so" } },
                { OldDevice: "/libs/old.so" },
            ],
        },
    },
};

/**
 * Derive the docs sections of a schema.
 *
 * @param {Object} [schema]
 * @returns {Object} the sections by name.
 */
function derive(schema = SCHEMA) {
    return deriveSections(schema, L10N, BASE_KEY);
}

// The tree of the settings of a docs section as lines, e.g. "  SPNEGO: Allow SPNEGO.".
const treeLines = (node, indent = "") => [
    ...(node.choices ?? []).map(choice => `${indent}= ${choice.value}: ${choice.description ?? "-"}`),
    ...node.children.flatMap(child => [
        `${indent}${child.name}${child.deprecated ? " (deprecated)" : ""}: ${child.description ?? "-"}`,
        ...treeLines(child, `${indent}  `),
    ]),
];

const gpoEntry = (policy, key) => policy.gpo.find(e => e.key == `${BASE_KEY}\\${key}`);

test("the example of a choice is its value, without the other choices", () => {
    const policies = derive();
    assert.deepEqual(
        [...policies.Flag.gpo, ...policies.Mode.gpo],
        [
            { key: `${BASE_KEY}\\Flag`, type: "REG_DWORD", value: "0x1" },
            { key: `${BASE_KEY}\\Mode`, type: "REG_SZ", value: "manual" },
        ]
    );
    assert.match(policies.Flag.plist, /<key>Flag<\/key>\n  <true\/>\n/);
    assert.match(policies.Mode.plist, /<key>Mode<\/key>\n  <string>manual<\/string>\n/);
    assert.match(policies.Mode.json, /"Mode": "manual"\n/);
    for (const policy of [policies.Flag, policies.Mode]) {
        assert.ok(![policy.plist, policy.json, ...policy.gpo.map(e => e.value)].some(text => text.includes(" | ")));
    }
});

test("the example of a oneOf is its first value", () => {
    const { Level } = derive();
    assert.equal(gpoEntry(Level, "Level").value, "0x2");
    assert.match(Level.json, /"Level": 2\n/);
});

test("arrays become numbered registry keys", () => {
    const { List } = derive();
    assert.deepEqual(List.gpo.map(e => [e.key, e.value]), [
        [`${BASE_KEY}\\List\\1`, "a"],
        [`${BASE_KEY}\\List\\2`, "b"],
    ]);
    assert.match(List.json, /"List": \["a", "b"\]/);
});

test("JSON values are written as JSON, and become a single REG_MULTI_SZ without added choices", () => {
    const { Settings } = derive();
    assert.equal(Settings.gpo.length, 1);
    assert.equal(Settings.gpo[0].type, "REG_MULTI_SZ");
    assert.equal(Settings.gpo[0].value, `{\n  "enabled": true\n}`);
    assert.doesNotMatch(Settings.json, /\|/);
});

test("x-examples-gpo is used for the GPO example, x-expand-env-vars next to a $ref", () => {
    const { Path } = derive();
    assert.equal(Path.description, "A path.\n\nEnvironment variables like %USERPROFILE% are only expanded when the policy is set via Group Policy.");
    assert.deepEqual(gpoEntry(Path, "Path"), { key: `${BASE_KEY}\\Path`, type: "REG_EXPAND_SZ", value: "C:\\file" });
    assert.match(Path.plist, /<string>\/home\/user\/file<\/string>/);
    assert.match(Path.json, /"Path": "\/home\/user\/file"/);
});

test("x-formats limits the examples", () => {
    const { WindowsFlag } = derive();
    assert.equal(WindowsFlag.gpo.length, 1);
    assert.equal(WindowsFlag.plist, null);
    assert.notEqual(WindowsFlag.json, null);
});

test("the texts of a policy are taken from the schema", () => {
    const { Auth, Flag } = derive();
    // No title: the ToC line shows only the name. The text is the description
    // followed by the x-help.
    assert.equal(Auth.title, null);
    assert.equal(Auth.description, "Configure authentication in Thunderbird.\n\nHelp of Auth.");
    assert.equal(Auth.deprecated, false);
    // The settings as blocks, following the nesting of the schema.
    assert.deepEqual(treeLines(Auth.settingTree), [
        "Sites: The sites.",
        "AllowNonFQDN: Integrated authentication for non-FQDN hosts.",
        "  SPNEGO: Allow SPNEGO.",
        "  NTLM: -",
    ]);
    assert.match(Auth.json, /"Auth": \{\n {6}"Sites": \["example.com"\],\n {6}"AllowNonFQDN": \{\n {8}"SPNEGO": true,/);
    // Without x-help, the description is the text.
    assert.equal(Flag.title, null);
    assert.equal(Flag.description, "A flag.");
});

test("a deprecated setting with open names has a deprecated section", () => {
    const policies = derive();
    assert.equal(policies["Devices_[name]"].deprecated, true);
    assert.equal(policies["Devices_[name]"].title, "Older form");
    assert.equal(policies.Devices.deprecated, false);
});

test("settings with x-expand-env-vars get a note in the docs", () => {
    const { Downloads } = derive();
    const NOTE = "Environment variables like %USERPROFILE% are only expanded when the policy is set via Group Policy.";
    assert.equal(Downloads.description, "Downloads.");
    assert.deepEqual(treeLines(Downloads.settingTree), [
        `Folder: The folder. ${NOTE}`,
        `Temp: ${NOTE}`,
        "Ask: Ask first.",
    ]);
    assert.equal(gpoEntry(Downloads, "Downloads\\Folder").type, "REG_EXPAND_SZ");
    assert.equal(gpoEntry(Downloads, "Downloads\\Ask").type, "REG_DWORD");
});

test("a section of a setting shows its part of the example and its own texts", () => {
    const { Auth, Auth_Locked } = derive();
    assert.match(Auth_Locked.json, /"Auth": \{\n {6}"Locked": true\n/);
    assert.equal(Auth_Locked.title, "Lock it");
    assert.equal(Auth_Locked.description, "Locks it.\n\nMore about locking.");
    assert.equal(Auth_Locked.deprecated, true);
    // A setting with its own x-help is described in its own section only.
    assert.deepEqual(Auth.settingTree.children.map(({ name }) => name), ["Sites", "AllowNonFQDN"]);
});

test("a section of open names shows the first example which has some", () => {
    const policies = derive();
    assert.match(policies.Devices.json, /"Add": \{\n {8}"MyDevice": /);
    assert.doesNotMatch(policies.Devices.json, /OldDevice/);
    assert.match(policies.Devices_Add.json, /"Devices": \{\n {6}"Add": \{\n {8}"MyDevice": /);
    assert.match(policies["Devices_[name]"].json, /"Devices": \{\n {6}"OldDevice": "\/libs\/old.so"\n/);
    assert.deepEqual(policies["Devices_[name]"].gpo.map(e => e.key), [`${BASE_KEY}\\Devices\\OldDevice`]);
});

test("a section of a setting without hand-written example gets a generated one", () => {
    const branch = structuredClone(SCHEMA);
    delete branch.properties.Auth.examples;
    branch.properties.Auth.properties.AllowNonFQDN["x-help"] = "More about non-FQDN hosts.";
    const { Auth_AllowNonFQDN } = derive(branch);
    assert.match(Auth_AllowNonFQDN.json, /"AllowNonFQDN": \{\n {8}"SPNEGO": true,\n {8}"NTLM": true\n/);
});

test("the sections come from the schema: every policy and every setting with an x-help", () => {
    const policies = derive();
    assert.ok(policies.Flag && policies.Auth && policies.Auth_Locked && policies.Devices_Add && policies["Devices_[name]"]);
    assert.equal(policies.Auth_Sites, undefined);
});

test("the CCK2 equivalent and the preferences affected are taken from the node of a section as they are", () => {
    const schema = structuredClone(SCHEMA);
    schema.properties.Auth["x-cck2-equivalent"] = "auth";
    schema.properties.Auth["x-preferences-affected"] = ["auth.a", "auth.b"];
    schema.properties.Auth.properties.Locked["x-preferences-affected"] = "Many";
    // Next to a $ref.
    schema.properties.Path["x-cck2-equivalent"] = ["path"];
    const { Auth, Auth_Locked, Path, Flag } = derive(schema);
    assert.equal(Auth.cck2Equivalent, "auth");
    assert.deepEqual(Auth.preferencesAffected, ["auth.a", "auth.b"]);
    assert.equal(Auth_Locked.cck2Equivalent, undefined);
    assert.equal(Auth_Locked.preferencesAffected, "Many");
    assert.deepEqual(Path.cck2Equivalent, ["path"]);
    assert.equal(Flag.preferencesAffected, undefined);
});
