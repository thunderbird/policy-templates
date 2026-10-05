import assert from "node:assert/strict";
import { test } from "node:test";

import { checkDocumentation } from "../modules/schema_checks.mjs";
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

test("a setting with several forms needs an example of each form which can't be generated", () => {
    const schema = {
        properties: {
            Locales: {
                type: ["string", "array"],
                items: { type: "string" },
                description: "L.",
                examples: ["de"],
                "x-category": "Misc",
            },
            Both: {
                type: ["string", "array"],
                items: { type: "string" },
                description: "B.",
                examples: [["de"], "de", 5],
                "x-category": "Misc",
            },
            Menu: {
                anyOf: [{ type: "boolean" }, { type: "string", oneOf: [{ const: "always", title: "Always" }, { const: "never" }] }],
                description: "M.",
                "x-category": "Misc",
            },
            Old: {
                type: ["object", "JSON"],
                description: "O.",
                properties: { Field: { type: "boolean" } },
                "x-category": "Misc",
            },
        },
    };
    assert.deepEqual(checkDocumentation({ schema, l10n: L10N }), [
        "Locales: missing example of the List form",
        "Both: examples[2] uses a value of none of the forms",
        "Menu=\"never\": value without title",
        "Old.Field: missing description",
    ]);
});

test("policy and setting names outside JSON values only have letters, digits and _", () => {
    const schema = {
        properties: {
            Policy: {
                type: "object",
                description: "P.",
                "x-category": "Misc",
                properties: {
                    "Allow-List": { type: "string", examples: ["a"] },
                    Open: {
                        type: "object",
                        description: "O.",
                        patternProperties: { "^.*$": { type: "string" } },
                        examples: [{ "*": "a" }],
                    },
                },
            },
            Json: {
                type: "object",
                contentMediaType: "application/json",
                description: "J.",
                "x-category": "Misc",
                properties: { "Allow-List": { type: "boolean", description: "A." } },
            },
            "Mac-Only": { type: "boolean", description: "M.", "x-category": "Misc", "x-formats": ["plist"] },
        },
    };
    assert.deepEqual(checkDocumentation({ schema, l10n: L10N }), [
        "Policy.Allow-List: the name can't be part of an ADMX policy name",
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
