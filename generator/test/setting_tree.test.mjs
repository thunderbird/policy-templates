import assert from "node:assert/strict";
import { test } from "node:test";

import { SchemaL10n } from "../modules/l10n.mjs";
import { getSettingTree } from "../modules/schema_settings.mjs";

const L10N = new SchemaL10n([]);

const SCHEMA = {
    properties: {
        Handlers: {
            type: "object",
            contentMediaType: "application/json",
            description: "Handlers.",
            patternProperties: {
                "^(mimeTypes|schemes)$": {
                    type: "object",
                    description: "The kind of handler.",
                    patternProperties: {
                        "^.*$": {
                            type: "object",
                            description: "One type.",
                            properties: {
                                action: {
                                    type: "string",
                                    description: "What to do.",
                                    oneOf: [
                                        { const: "save", title: "Save", description: "Save it." },
                                        { const: "open", title: "Open" },
                                    ],
                                },
                                handlers: {
                                    type: "array",
                                    description: "The applications.",
                                    items: { type: "object", properties: { path: { type: "string", description: "A path." } } },
                                },
                            },
                        },
                    },
                },
            },
        },
        Types: {
            type: "array",
            items: { type: "string", enum: ["a", "b"] },
        },
    },
};

// The tree as lines, e.g. "  [name]: One type.".
const lines = (node, indent = "") => [
    ...(node.choices ?? []).map(c => `${indent}= ${c.value}: ${c.title ?? "-"} / ${c.description ?? "-"}`),
    ...node.children.flatMap(child => [
        `${indent}${child.name}${child.json ? " (JSON)" : ""}: ${child.description ?? "-"}`,
        ...lines(child, `${indent}  `),
    ]),
];

test("the tree of a policy walks into JSON values, open names and lists", () => {
    const tree = getSettingTree(SCHEMA, "Handlers", L10N);
    assert.equal(tree.json, true);
    assert.equal(tree.description, "Handlers.");
    // A pattern of alternatives is one setting.
    assert.deepEqual(lines(tree), [
        "(mimeTypes|schemes): The kind of handler.",
        "  [name]: One type.",
        "    action: What to do.",
        "      = save: Save / Save it.",
        "      = open: Open / -",
        "    handlers: The applications.",
        "      path: A path.",
    ]);
    assert.deepEqual(tree.children[0].children[0].path, ["Handlers", "(mimeTypes|schemes)", "[name]"]);
});

test("the choices of a list are the choices of its entries", () => {
    const tree = getSettingTree(SCHEMA, "Types", L10N);
    assert.deepEqual(tree.choices.map(c => c.value), ["a", "b"]);
    assert.deepEqual(tree.children, []);
});

test("a policy which is not in the schema has no tree", () => {
    assert.equal(getSettingTree(SCHEMA, "Unknown", L10N), null);
});

test("the type of each setting is described", () => {
    const schema = {
        definitions: { url: { type: "string", format: "moz-url" } },
        properties: {
            P: {
                type: "object",
                properties: {
                    Flag: { type: "boolean" },
                    Url: { $ref: "#/definitions/url" },
                    Old: { type: "URLorEmpty" },
                    Origins: { type: "array", items: { type: "string", format: "moz-url", pattern: "^[Hh][Tt][Tt][Pp][Ss]?://[^/]+/?$" } },
                    Names: { type: "array", items: { type: "string" } },
                    Mode: { type: "string", oneOf: [{ const: "a", description: "The a." }, { const: "b" }] },
                    Version: { type: "string", enum: ["tls1", "tls1.2"] },
                    Single: { type: "number", enum: [5] },
                    Kinds: { type: "array", items: { type: "string", enum: ["a", "b", "c"] } },
                    Value: { type: ["number", "boolean", "string"] },
                    Json: { type: "object", contentMediaType: "application/json" },
                },
            },
        },
    };
    const tree = getSettingTree(schema, "P", L10N);
    assert.deepEqual(Object.fromEntries(tree.children.map(child => [child.name, child.type])), {
        Flag: "boolean",
        Url: "string, URL",
        Old: "string, URL",
        Origins: "list of origins",
        Names: "list of strings",
        Mode: "string: `a` or `b`",
        Version: "string: `tls1` or `tls1.2`",
        Single: "number: `5`",
        Kinds: "list of strings: `a`, `b` or `c`",
        Value: "number, boolean or string",
        Json: "JSON",
    });
});
