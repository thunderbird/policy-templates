import assert from "node:assert/strict";
import { test } from "node:test";

import { generateReadmeCompatibilityTable, renderSettingTree } from "../modules/generate_markdown.mjs";


const node = (name, description, children = [], extra = {}) => ({ name, description, deprecated: false, choices: null, children, ...extra });

test("each setting is its name and type, followed by its description as a quoted block", () => {
    const tree = {
        choices: null,
        children: [
            node("*", "The defaults.", [
                node("mode", "The mode.", [], {
                    type: "string: `on` or `off`",
                    choices: [{ value: "on", description: "Turned on." }, { value: "off" }],
                }),
                node("message", undefined, [], { type: "string" }),
            ], { type: "object" }),
            node("Locked", "Locks it.\nReally.\n\nAnother paragraph.", [], { type: "boolean", deprecated: true }),
            node("Plain", undefined, [], { type: "boolean" }),
        ],
    };
    assert.deepEqual(renderSettingTree(tree), [
        "### Settings",
        "",
        `<div class="settings" markdown="1">`,
        "",
        "`*` (object)",
        "> *The defaults.*",
        "- `mode` (string: `on` or `off`)",
        "  > *The mode.*\\",
        "  > *`on`: Turned on.*",
        "- `message` (string)",
        "",
        "`Locked` (boolean) **Deprecated.**",
        "> *Locks it.*\\",
        "> *Really.*",
        ">",
        "> *Another paragraph.*",
        "",
        "`Plain` (boolean)",
        "",
        "</div>",
        "",
    ]);
});

test("a setting without a description still describes its values", () => {
    const tree = {
        choices: null,
        children: [node("mode", undefined, [], { type: "number: `4` or `5`", choices: [{ value: 4, description: "Four." }, { value: 5 }] })],
    };
    assert.deepEqual(renderSettingTree(tree).slice(4, -3), ["`mode` (number: `4` or `5`)", "> *`4`: Four.*"]);
});

test("the values of the section's own setting come first", () => {
    const tree = { choices: [{ value: "a", description: "The a." }], children: [node("x", "The x.", [], { type: "boolean" })] };
    assert.deepEqual(renderSettingTree(tree), [
        "### Settings",
        "",
        `<div class="settings" markdown="1">`,
        "",
        "> *`a`: The a.*",
        "",
        "`x` (boolean)",
        "> *The x.*",
        "",
        "</div>",
        "",
    ]);
});

test("a section whose setting has no settings shows the setting itself", () => {
    const tree = {
        name: "SSLVersionMin",
        type: "string: `tls1` or `tls1.2`",
        choices: [{ value: "tls1", description: "Old." }],
        children: [],
    };
    assert.deepEqual(renderSettingTree(tree), [
        "### Settings",
        "",
        `<div class="settings" markdown="1">`,
        "",
        "`SSLVersionMin` (string: `tls1` or `tls1.2`)",
        "> *`tls1`: Old.*",
        "",
        "</div>",
        "",
    ]);
});

test("the compatibility table shows the versions of the product", () => {
    const entries = [
        { first: "78.0", last: "115.0", policies: ["Old"] },
        { first: "140.0", last: "", policies: ["New", "Newer_^(a|b)$"] },
    ];
    assert.deepEqual(generateReadmeCompatibilityTable(entries, "Product"), [
        "",
        "| Policy/Property Name | Product | Removed after |",
        "|:--- | ---:| ---:|",
        "| `Old` | 78.0 | 115.0 |",
        "| `New`<br>`Newer_(a\\|b)` | 140.0 |  |",
        "",
    ]);
});

test("a setting with a title shows it after its name", () => {
    const tree = { choices: null, children: [node("Mode", "The mode.", [], { title: "Proxy method", type: "string" })] };
    assert.deepEqual(renderSettingTree(tree).slice(4, 6), ["`Mode` Proxy method (string)", "> *The mode.*"]);
});
