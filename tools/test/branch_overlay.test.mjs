import assert from "node:assert/strict";
import { test } from "node:test";

import { checkDocumentation, compareWithMain, syncOverlay } from "../modules/branch_overlay.mjs";
import { mergeSchemaOverlay } from "../../generator/modules/branches.mjs";
import { SchemaL10n } from "../../generator/modules/l10n.mjs";

const L10N = new SchemaL10n([]);
const MAIN_L10N = new SchemaL10n([{ name: "main.ftl", source: "policy-Mode = Set the mode.\n" }]);

const MAIN = {
    properties: {
        P: {
            type: "object",
            "x-description-l10n-id": "policy-Mode",
            "x-help": "Main's help.",
            properties: {
                Mode: {
                    type: "string",
                    description: "The mode.",
                    oneOf: [
                        { const: "on", description: "Turned on." },
                        { const: "off", description: "Turned off." },
                        { const: "auto", description: "Automatic." },
                    ],
                },
                Name: { type: "string", description: "The name.", examples: ["Joe"] },
            },
        },
        OnlyMain: { type: "boolean", description: "New." },
    },
};

// A branch without "auto", with old texts and an own keyword in its overlay.
const BASE = {
    properties: {
        P: {
            type: "object",
            description: "Old description.",
            properties: {
                Mode: { type: "string", enum: ["on", "off"] },
                Name: { type: "string", description: "Old name.", examples: ["Joe"] },
                Gone: { type: "boolean", description: "Removed on main." },
            },
        },
    },
};

const main = { schema: MAIN, l10n: MAIN_L10N };
const merged = overlay => {
    const schema = structuredClone(BASE);
    mergeSchemaOverlay(schema, overlay, "overlay");
    return { schema, l10n: L10N };
};

test("the overlay gets main's documentation for the nodes the branch has", () => {
    const overlay = syncOverlay({
        base: BASE,
        overlay: { properties: { P: { contentMediaType: "application/json" } } },
        main,
        l10n: L10N,
    });
    assert.deepEqual(overlay, {
        properties: {
            P: {
                // Kept, it isn't documentation.
                contentMediaType: "application/json",
                description: "Set the mode.",
                "x-help": "Main's help.",
                properties: {
                    Mode: {
                        description: "The mode.",
                        // Only the values of the branch.
                        oneOf: [
                            { const: "on", description: "Turned on." },
                            { const: "off", description: "Turned off." },
                        ],
                    },
                    // The example is the same, so it isn't repeated.
                    Name: { description: "The name." },
                },
            },
        },
    });
    assert.deepEqual(compareWithMain(merged(overlay), main), []);
});

test("main's lack of a field removes the branch's own", () => {
    const base = { properties: { P: { type: "boolean", title: "Old title", description: "D." } } };
    const overlay = syncOverlay({ base, overlay: {}, main: { schema: { properties: { P: { type: "boolean", description: "D." } } }, l10n: L10N }, l10n: L10N });
    assert.deepEqual(overlay, { properties: { P: { title: null } } });
    const schema = structuredClone(base);
    mergeSchemaOverlay(schema, overlay, "overlay");
    assert.equal("title" in schema.properties.P, false);
});

test("a node which differs from main keeps its documentation", () => {
    const own = { "x-differs-from-main": "Ignored on this branch.", description: "Ignored." };
    const overlay = syncOverlay({ base: BASE, overlay: { properties: { P: { properties: { Name: own } } } }, main, l10n: L10N });
    assert.deepEqual(overlay.properties.P.properties.Name, own);
    assert.deepEqual(compareWithMain(merged(overlay), main), []);
});

test("differences from main are reported, as are needless exceptions", () => {
    assert.deepEqual(compareWithMain({ schema: BASE, l10n: L10N }, main), [
        "P: differs from main in description, x-help",
        "P.Mode: differs from main in description, value \"on\", value \"off\"",
        "P.Name: differs from main in description",
    ]);
    const overlay = syncOverlay({ base: BASE, overlay: {}, main, l10n: L10N });
    overlay.properties.P.properties.Name["x-differs-from-main"] = "No reason.";
    assert.deepEqual(compareWithMain(merged(overlay), main), [
        "P.Name: has \"x-differs-from-main\", but its documentation is the same as on main",
    ]);
});

test("the rules of the documentation are checked", () => {
    const schema = {
        properties: {
            Group: {
                type: "object",
                description: "A group.",
                properties: { Inner: { type: "object", properties: { Flag: { type: "boolean", examples: [true] } } } },
                "x-formats": ["gpo"],
                "x-category": "Misc",
            },
            Text: { type: "string", description: "A text." },
            Json: {
                type: "object",
                contentMediaType: "application/json",
                description: "A JSON value.",
                properties: { Field: { type: "boolean" } },
                examples: [{ Field: true, Unknown: 1 }],
                "x-category": "Misc",
            },
            Choice: { type: "string", description: "A choice.", enum: ["a"], "x-examples-gpo": ["b"], "x-category": "Misc" },
            Nested: { type: "object", description: "N.", "x-category": "Misc", properties: { Deep: { type: "boolean", description: "D.", "x-formats": ["gpo"] } } },
            Repeated: { type: "boolean", description: "Do it.", "x-help": "Do it. And more.", "x-category": "Misc" },
            HelpOnly: {
                type: "object",
                description: "H.",
                "x-category": "Misc",
                properties: { Inner: { type: "boolean", "x-help": "Only a help." } },
            },
            Untitled: { type: "string", description: "U.", oneOf: [{ const: "a", title: "A" }, { const: "b" }], "x-category": "Misc" },
        },
    };
    assert.deepEqual(checkDocumentation({ schema, l10n: L10N }), [
        "Group.Inner.Flag: needless example, it can be generated",
        "Group.Inner: missing description",
        "Text: missing example",
        "Text: missing x-category",
        "Json: needless example, it can be generated",
        "Json: examples[0] uses the unknown setting Unknown",
        "Json.Field: missing description",
        "Choice: x-examples-gpo without examples",
        "Choice: x-examples-gpo[0] uses the unknown value \"b\"",
        "Nested.properties.Deep: x-formats is only allowed on the policy itself",
        "Repeated: x-help repeats the description",
        "HelpOnly.Inner: missing description",
        "Untitled=\"b\": value without title",
    ]);
});

test("the preferences affected and the CCK2 equivalent of a branch are its own, not main's", () => {
    const mainSchema = structuredClone(MAIN);
    mainSchema.properties.P["x-preferences-affected"] = ["main.pref"];
    const own = { "x-preferences-affected": ["branch.pref"], "x-cck2-equivalent": "branch" };
    const overlay = syncOverlay({ base: BASE, overlay: { properties: { P: { ...own } } }, main: { schema: mainSchema, l10n: MAIN_L10N }, l10n: L10N });
    assert.deepEqual(overlay.properties.P["x-preferences-affected"], ["branch.pref"]);
    assert.equal(overlay.properties.P["x-cck2-equivalent"], "branch");
});

test("the preferences affected and the CCK2 equivalent are only on docs sections, as a string or a list of strings", () => {
    const schema = {
        properties: {
            P: {
                type: "object",
                description: "P.",
                "x-category": "Misc",
                "x-preferences-affected": ["a.pref", "b.pref"],
                "x-cck2-equivalent": "p",
                properties: {
                    Section: { type: "boolean", description: "S.", "x-help": "More.", "x-cck2-equivalent": ["s"] },
                    Plain: { type: "boolean", description: "Plain.", "x-preferences-affected": "Many" },
                },
            },
            Wrong: { type: "boolean", description: "W.", "x-category": "Misc", "x-preferences-affected": [1], "x-cck2-equivalent": { a: "b" } },
        },
    };
    assert.deepEqual(checkDocumentation({ schema, l10n: L10N }), [
        "P.Plain: x-preferences-affected is only allowed on a policy or on a setting with an x-help",
        "Wrong: x-preferences-affected should be a string or a list of strings",
        "Wrong: x-cck2-equivalent should be a string or a list of strings",
    ]);
});

test("the category is always main's, also on a node which differs from main", () => {
    const base = { properties: { P: { type: "boolean", description: "Own." } } };
    const main = { schema: { properties: { P: { type: "boolean", description: "Main.", "x-category": "Security" } } }, l10n: L10N };
    const overlay = syncOverlay({
        base,
        overlay: { properties: { P: { "x-differs-from-main": "Reason.", description: "Own." } } },
        main,
        l10n: L10N,
    });
    assert.deepEqual(overlay.properties.P, { "x-differs-from-main": "Reason.", description: "Own.", "x-category": "Security" });
    const schema = structuredClone(base);
    mergeSchemaOverlay(schema, { properties: { P: { "x-differs-from-main": "Reason.", description: "Own." } } }, "overlay");
    assert.deepEqual(compareWithMain({ schema, l10n: L10N }, main), ["P: differs from main in x-category"]);
});
