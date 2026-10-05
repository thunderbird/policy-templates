import assert from "node:assert/strict";
import { test } from "node:test";

import { generateReadmeCompatibilityTable, generateReadmeMarkdown, renderSettingTree } from "../modules/generate_markdown.mjs";


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

test("a section whose setting accepts several forms shows it above its settings", () => {
    const tree = {
        name: "Sanitize",
        type: "boolean or object",
        severalForms: true,
        choices: null,
        children: [node("Cache", "Clear the cache.", [], { type: "boolean" })],
    };
    assert.deepEqual(renderSettingTree(tree).slice(4, -3), [
        "`Sanitize` (boolean or object)",
        "",
        "`Cache` (boolean)",
        "> *Clear the cache.*",
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

test("the table of contents shows the description, the heading the title", () => {
    const section = (fields) => ({ description: "", settingTree: { choices: null, children: [] }, json: null, gpo: [], plist: null, ...fields });
    const data = generateReadmeMarkdown({
        AppAutoUpdate: section({ title: "Automatic updates", summary: "Enable automatic updates.", description: "Enable automatic updates.\n\nMore." }),
        SearchEngines_Add: section({ title: null, summary: "Add search\nengines | more.", description: "Add search engines." }),
        Old: section({ title: null, summary: "Old.", deprecated: true }),
    });
    assert.equal(data.AppAutoUpdate.toc, "| **[`AppAutoUpdate`](#appautoupdate)** | Enable automatic updates.");
    assert.equal(data.AppAutoUpdate.content[0], "## AppAutoUpdate: Automatic updates {#appautoupdate}");
    // Without a title, the heading is the name, and its anchor is the same.
    assert.equal(data.SearchEngines_Add.toc, "| **[`SearchEngines -> Add`](#searchengines--add)** | Add search engines \\| more.");
    assert.equal(data.SearchEngines_Add.content[0], "## SearchEngines | Add");
    assert.equal(data.Old.toc, "| **[`Old`](#old)** | **Deprecated.** Old.");
});

test("each CCK2 equivalent and each preference affected is shown as inline code", () => {
    const section = (fields) => ({ description: "", settingTree: { choices: null, children: [] }, json: null, gpo: [], plist: null, ...fields });
    const data = generateReadmeMarkdown({
        Search: section({ cck2Equivalent: ["defaultSearchEngine", "removeDefaultSearchEngines"], preferencesAffected: ["a.b", "c.d"] }),
        Single: section({ cck2Equivalent: "disableAboutConfig" }),
    });
    assert.ok(data.Search.content.includes("**CCK2 Equivalent:** `defaultSearchEngine`, `removeDefaultSearchEngines`\\"));
    assert.ok(data.Search.content.includes("**Preferences Affected:** `a.b`, `c.d`"));
    assert.ok(data.Single.content.includes("**CCK2 Equivalent:** `disableAboutConfig`\\"));
});
