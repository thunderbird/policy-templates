import assert from "node:assert/strict";
import { test } from "node:test";

import { checkDocumentation, findDrift } from "../modules/schema_checks.mjs";
import { SchemaL10n } from "../../generator/modules/l10n.mjs";

const L10N = new SchemaL10n([]);

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

// The schema of the product's repository, and the product's own copy with
// its documentation.
const UPSTREAM = {
    definitions: { url: { type: "string" } },
    properties: {
        Mode: { type: "string", enum: ["on", "off"] },
        Choice: { type: "string", oneOf: [{ const: "a" }, { const: "b" }] },
        Group: {
            type: "object",
            properties: { Flag: { type: "boolean" }, Url: { $ref: "#/definitions/url" } },
        },
        List: { type: "array", items: { type: "string", pattern: "^x" } },
    },
};

const ours = () => {
    const schema = structuredClone(UPSTREAM);
    schema.properties.Mode.description = "The mode.";
    schema.properties.Choice.oneOf = [{ const: "a", title: "A" }, { const: "b", title: "B" }];
    schema.properties.Group.examples = [{ Flag: true }];
    return schema;
};

test("no drift if the product's schema only adds documentation", () => {
    assert.deepEqual(findDrift({ upstream: UPSTREAM, ours: ours() }), []);
});

test("drift: what upstream has and the product's schema doesn't", () => {
    const upstream = structuredClone(UPSTREAM);
    upstream.properties.New = { type: "boolean" };
    upstream.properties.Group.properties.Extra = { type: "string" };
    upstream.properties.Mode.enum = ["on", "off", "auto"];
    upstream.properties.Choice.oneOf.push({ const: "c" });
    upstream.properties.Choice.description = "Added upstream.";
    upstream.properties.List.items.type = "number";
    upstream.properties.Group.properties.Flag.type = ["boolean", "string"];
    assert.deepEqual(findDrift({ upstream, ours: ours() }), [
        'Mode: "enum" is ["on","off"], upstream ["on","off","auto"]',
        'Choice: missing values "c"',
        'Choice: missing "description"',
        'Group.Flag: "type" is "boolean", upstream ["boolean","string"]',
        "Group.Extra: missing",
        'List[]: "type" is "string", upstream "number"',
        "New: missing",
    ]);
});

test("different documentation is not drift", () => {
    const upstream = structuredClone(UPSTREAM);
    upstream.properties.Mode.description = "Upstream's words.";
    const own = ours();
    own.properties.Mode.description = "Our words.";
    assert.deepEqual(findDrift({ upstream, ours: own }), []);
});
