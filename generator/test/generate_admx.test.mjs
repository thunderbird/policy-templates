import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import pathUtils from "node:path";
import { test } from "node:test";

import { generateAdmxTemplates, getExplainText } from "../modules/generate_admx.mjs";
import { SchemaL10n } from "../modules/l10n.mjs";
import { validateAdmx } from "../modules/validate_admx.mjs";

// A product with other names than Thunderbird, see generateAdmxTemplates().
const DOCS_URL = "https://example.org/docs";
const TEMPLATE = {
    version: "153.0",
    docsUrl: `${DOCS_URL}/policies/main`,
    registryKey: "Software\\Policies\\Example\\Product",
    admx: { file: "product", namespace: "Example.Policies.Product", prefix: "product" },
};

const L10N = new SchemaL10n([
    { name: "brand.ftl", source: "-brand-short-name = Product\n-brand-full-name = Example Product\n" },
    {
        name: "policies.ftl",
        source: [
            "policy-Auth = Configure authentication in { -brand-short-name }.",
            "policy-auth-help = Help from Fluent.",
            "policy-auth-locked = Lock it",
            "policy-mode-manual = Manual mode",
            "",
        ].join("\n"),
    },
]);

/**
 * Generate the ADMX and ADML files of a policy schema and check them against
 * the official schemas.
 *
 * @param {Object} schema - The policy schema, with the texts of the settings.
 * @param {string[]} supported - The IDs of the supported ADMX policies.
 * @returns {Promise<{admx: string, adml: string}>}
 */
async function generate(schema, supported) {
    const supportedPolicies = [{ key: "140", first: "140", last: "", policies: supported }];
    const dir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "generate-admx-"));
    try {
        await generateAdmxTemplates(TEMPLATE, supportedPolicies, dir, schema, L10N);
        const files = {
            admx: pathUtils.join(dir, "admx", "product.admx"),
            adml: pathUtils.join(dir, "admx", "en-US", "product.adml"),
        };
        assert.deepEqual(await validateAdmx(files), []);
        return {
            admx: await fs.readFile(files.admx, "utf8"),
            adml: await fs.readFile(files.adml, "utf8"),
        };
    } finally {
        await fs.rm(dir, { recursive: true });
    }
}

// The text of a string of the ADML.
const string = (adml, id) => adml.match(new RegExp(`<string id="${id}">([^<]*)</string>`))?.[1];
// The parent category of a policy or category of the ADMX.
const parentCategory = (admx, element, name) =>
    admx.match(new RegExp(`<${element} name="${name}"[^>]*>\\s*<parentCategory ref="([^"]+)"`))?.[1];
const docsLink = anchor => `For more information visit: ${DOCS_URL}/policies/main/#${anchor}`;

test("the explain text is the help text as plain text", () => {
    assert.equal(
        getExplainText("AppAutoUpdate", { help: "Enable **automatic** updates via `x`.\n" }, `${DOCS_URL}/policies/esr140`),
        "Enable automatic updates via x.\n"
    );
});

test("the explain text links to the documentation", () => {
    assert.equal(
        getExplainText("Certificates_Install", { help: "Install certificates.\n", link: true }, `${DOCS_URL}/policies/esr140`),
        `Install certificates.\n\nFor more information visit: ${DOCS_URL}/policies/esr140/#certificates--install\n`
    );
});

test("the explain text of a deprecated setting starts with a note", () => {
    assert.equal(
        getExplainText("Cookies_ExpireAtSessionEnd", { help: "No effect.\n", deprecated: true }, `${DOCS_URL}/policies/esr140`),
        "Deprecated.\n\nNo effect.\n"
    );
});

test("enum values with characters not allowed in string IDs give valid templates", async () => {
    const { admx, adml } = await generate(
        {
            properties: {
                Cookies: {
                    type: "object",
                    properties: { AcceptThirdParty: { type: "string", enum: ["always", "never", "from-visited"] } },
                },
            },
        },
        ["Cookies_AcceptThirdParty"]
    );
    assert.ok(admx.includes("$(string.Cookies_AcceptThirdParty_from_visited)"));
    assert.ok(admx.includes("<string>from-visited</string>"));
    // Without titles, the items are named after their values.
    assert.equal(string(adml, "Cookies_AcceptThirdParty_from_visited"), "from-visited");
});

test("settings with open names become lists of names and values", async () => {
    const { admx } = await generate(
        {
            properties: {
                SecurityDevices: {
                    type: "object",
                    properties: { Add: { type: "object", patternProperties: { "^.*$": { type: "string" } } } },
                },
                "3rdparty": {
                    type: "object",
                    properties: {
                        Extensions: {
                            type: "object",
                            patternProperties: { "^.*$": { type: "object", contentMediaType: "application/json" } },
                        },
                    },
                },
            },
        },
        ["SecurityDevices_Add_[name]", "3rdparty_Extensions_[name]"]
    );
    assert.ok(admx.includes(`<list id="SecurityDevices_Add_List" key="Software\\Policies\\Example\\Product\\SecurityDevices\\Add" explicitValue="true"/>`));
    assert.ok(admx.includes(`<list id="3rdparty_Extensions_List" key="Software\\Policies\\Example\\Product\\3rdparty\\Extensions" explicitValue="true"/>`));
});

test("a deprecated setting with open names is marked as deprecated", async () => {
    const { adml } = await generate(
        {
            properties: {
                Devices: {
                    type: "object",
                    properties: { Add: { type: "object", title: "Devices to add", patternProperties: { "^.*$": { type: "string" } } } },
                    patternProperties: {
                        "^(?!Add$).*$": { type: "string", title: "Older form.", "x-help": "Still supported.", "x-deprecated": true },
                    },
                },
            },
        },
        ["Devices_Add_[name]", "Devices_[name]"]
    );
    assert.equal(string(adml, "Devices"), "Older form (deprecated)");
    assert.match(string(adml, "Devices_Explain"), /^Deprecated\.\n\nStill supported\./);
    assert.equal(string(adml, "Devices_Add"), "Devices to add");
    assert.doesNotMatch(string(adml, "Devices_Add_Explain"), /Deprecated/);
});

test("the help text of a JSON value lists its fields", async () => {
    const { adml } = await generate(
        {
            properties: {
                Settings: {
                    type: "object",
                    contentMediaType: "application/json",
                    "x-help": "Settings as JSON.",
                    properties: {
                        mode: {
                            type: "string",
                            description: "The `mode`.",
                            oneOf: [{ const: "on", description: "Turned on." }, { const: "off", description: "Turned off." }],
                        },
                        group: { type: "object", description: "A group.", properties: { flag: { type: "boolean" } } },
                    },
                },
            },
        },
        ["Settings"]
    );
    assert.equal(
        string(adml, "Settings_Explain"),
        `Settings as JSON.\n\nmode: The mode.\n  on: Turned on.\n  off: Turned off.\ngroup: A group.\n  flag\n\n${docsLink("settings")}\n`
    );
});

test("a list of JSON values is one list box with one value per line, not numbered sets", async () => {
    const engine = (json) => ({
        type: "object",
        ...(json ? { contentMediaType: "application/json" } : {}),
        required: ["Name"],
        properties: {
            Name: { type: "string", description: "The name." },
            Url: { type: "string", description: "The URL." },
        },
    });
    const { admx, adml } = await generate(
        {
            properties: {
                Engines: { type: "array", title: "Search engines", description: "Add engines.", items: engine(true) },
                Old: { type: "array", description: "Add engines.", items: engine(false) },
            },
        },
        ["Engines", "Old"]
    );
    assert.match(admx, /<list id="Engines_List" key="Software\\Policies\\Example\\Product\\Engines" valuePrefix=""\/>/);
    assert.doesNotMatch(admx, /<policy name="Engines_1"/);
    assert.match(adml, /<listBox refId="Engines_List">Search engines \(one JSON value per line\)<\/listBox>/);
    assert.equal(
        string(adml, "Engines_Explain"),
        `Add engines.\n\nEach line of the list is one entry, as JSON.\n\nName: The name.\nUrl: The URL.\n\n${docsLink("engines")}\n`
    );
    // Without contentMediaType, a list of objects stays numbered sets.
    assert.match(admx, /<policy name="Old_1"/);
});

test("policies without the format gpo are left out", async () => {
    const { admx } = await generate(
        {
            properties: {
                AllPlatforms: { type: "string" },
                MacOnly: { type: "string", "x-formats": ["plist", "json"] },
                WindowsToo: { type: "string", "x-formats": ["gpo", "json"] },
            },
        },
        ["AllPlatforms", "MacOnly", "WindowsToo"]
    );
    assert.ok(admx.includes(`<policy name="AllPlatforms"`));
    assert.ok(!admx.includes("MacOnly"));
    assert.ok(admx.includes(`<policy name="WindowsToo"`));
});

test("every setting of the schema is part of the template, with its texts", async () => {
    const { admx, adml } = await generate(
        {
            definitions: {
                url: { type: "string" },
                requiredUrl: { type: "string", format: "moz-url" },
            },
            properties: {
                Auth: {
                    type: "object",
                    "x-description-l10n-id": "policy-Auth",
                    "x-help": "Long **help** of the policy.",
                    properties: {
                        Sites: {
                            type: "array",
                            items: { type: "string" },
                            title: "Sites allowed to authenticate",
                            description: "The **sites**.",
                        },
                        AllowNonFQDN: {
                            type: "object",
                            title: "Allow non-FQDN hosts",
                            properties: {
                                SPNEGO: { type: "boolean", title: "Allow SPNEGO", description: "Allows SPNEGO." },
                                NTLM: { type: "boolean" },
                            },
                        },
                        Locked: { type: "boolean", "x-title-l10n-id": "policy-auth-locked", "x-help-l10n-id": "policy-auth-help" },
                        Mode: {
                            type: "string",
                            description: "The mode.",
                            oneOf: [
                                { const: "none", title: "No mode" },
                                { const: "manual", "x-title-l10n-id": "policy-mode-manual" },
                                { const: "auto" },
                            ],
                        },
                        Delegated: { type: "array", items: { type: "string" } },
                    },
                },
                Search: {
                    type: "object",
                    description: "Add search engines.",
                    properties: {
                        Add: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["Name"],
                                properties: {
                                    Name: { type: "string", title: "Name of the engine" },
                                    URL: { $ref: "#/definitions/url", title: "Search URL" },
                                    Method: { type: "string", enum: ["GET", "POST"] },
                                },
                            },
                        },
                    },
                },
                Folder: { type: "string", title: "A folder.", description: "The folder.", "x-expand-env-vars": true },
                Url: { $ref: "#/definitions/requiredUrl", description: "A URL which is required." },
                // Like the urlOrEmpty definition of the policy schema.
                UrlOrEmpty: {
                    type: "string",
                    anyOf: [{ format: "moz-url" }, { maxLength: 0 }],
                    description: "A URL which may be empty.",
                },
                NotEmpty: { type: "string", minLength: 1, description: "A text which is required." },
                Code: { type: "string", pattern: "^[a-z]+$", description: "A code which is required." },
                // The string types of older schemas.
                OldUrl: { type: "URL", description: "A URL of an older schema." },
                OldUrlOrEmpty: { type: "URLorEmpty", description: "A URL of an older schema, which may be empty." },
                Locales: { type: ["string", "array"], items: { type: "string" } },
                Old: { type: "boolean", description: "An old flag, which has no effect anymore.", "x-deprecated": true },
            },
        },
        ["Auth_Sites", "Auth_AllowNonFQDN", "Auth_Locked", "Auth_Mode", "Auth_Delegated", "Search_Add", "Folder",
            "Url", "UrlOrEmpty", "NotEmpty", "Code", "OldUrl", "OldUrlOrEmpty", "Locales", "Old"]
    );

    // Names: the title (also from Fluent), else the raw name of a policy or
    // the path of a setting, never the description.
    assert.equal(string(adml, "Auth_Sites"), "Sites allowed to authenticate");
    assert.equal(string(adml, "Auth_Locked"), "Lock it");
    assert.equal(string(adml, "Auth_Mode"), "Auth › Mode");
    assert.equal(string(adml, "Auth_Delegated"), "Auth › Delegated");
    assert.equal(string(adml, "Search_Add_2"), "Search › Add (2)");
    assert.equal(string(adml, "Folder"), "A folder");
    assert.equal(string(adml, "Old"), "Old (deprecated)");

    // Help texts: the description followed by the x-help; a setting without
    // texts takes both from the nearest setting above it, up to the policy.
    // Always with a link to the documentation of the policy.
    assert.equal(string(adml, "Auth_Sites_Explain"), `The sites.\n\n${docsLink("auth")}\n`);
    assert.equal(string(adml, "Auth_Locked_Explain"), `Help from Fluent.\n\n${docsLink("auth")}\n`);
    assert.equal(
        string(adml, "Auth_Delegated_Explain"),
        `Configure authentication in Product.\n\nLong help of the policy.\n\n${docsLink("auth")}\n`
    );
    assert.equal(string(adml, "Folder_Explain").split("\n")[0], "The folder.");
    assert.match(string(adml, "Old_Explain"), /^Deprecated\.\n\nAn old flag/);

    // Choices: the titles of oneOf (also from Fluent), else the values.
    assert.equal(string(adml, "Auth_Mode_none"), "No mode");
    assert.equal(string(adml, "Auth_Mode_manual"), "Manual mode");
    assert.equal(string(adml, "Auth_Mode_auto"), "auto");
    assert.equal(string(adml, "Search_Add_1_Method_POST"), "POST");

    // The controls of a group: labels, and their descriptions in the help text.
    assert.ok(adml.includes(`<checkBox refId="Auth_AllowNonFQDN_SPNEGO_Bool">Allow SPNEGO</checkBox>`));
    assert.ok(adml.includes(`<checkBox refId="Auth_AllowNonFQDN_NTLM_Bool">NTLM</checkBox>`));
    assert.match(string(adml, "Auth_AllowNonFQDN_Explain"), /Allow SPNEGO: Allows SPNEGO\./);
    assert.match(adml, /<textBox refId="Search_Add_1_URL_Input">\s*<label>Search URL<\/label>/);

    // Required values: listed as required by the parent, or not accepting an
    // empty string; REG_EXPAND_SZ and lists from the schema.
    assert.match(admx, /<text id="Search_Add_1_Name_Input" valueName="Name" required="true"\/>/);
    assert.match(admx, /<text id="Search_Add_1_URL_Input" valueName="URL"\/>/);
    assert.match(admx, /<text id="Folder_Input" valueName="Folder" expandable="true"\/>/);
    // Only the help of a value with environment variables says so.
    assert.match(string(adml, "Folder_Explain"), /^The folder\.\n\nEnvironment variables like %USERPROFILE% are expanded\.\n\nFor more information visit: /);
    assert.doesNotMatch(string(adml, "Url_Explain"), /Environment variables/);
    assert.match(admx, /<text id="Url_Input" valueName="Url" required="true"\/>/);
    assert.match(admx, /<text id="UrlOrEmpty_Input" valueName="UrlOrEmpty"\/>/);
    assert.match(admx, /<text id="NotEmpty_Input" valueName="NotEmpty" required="true"\/>/);
    assert.match(admx, /<text id="Code_Input" valueName="Code" required="true"\/>/);
    assert.match(admx, /<text id="OldUrl_Input" valueName="OldUrl" required="true"\/>/);
    assert.match(admx, /<text id="OldUrlOrEmpty_Input" valueName="OldUrlOrEmpty"\/>/);
    assert.match(admx, /<list id="Locales_List" key="Software\\Policies\\Example\\Product\\Locales" valuePrefix=""\/>/);

    // The folders follow the setting paths, see the test of folders.
    assert.equal(parentCategory(admx, "policy", "Auth_Locked"), "Auth");
    assert.equal(parentCategory(admx, "policy", "Search_Add_1"), "Search_Add");
    assert.equal(parentCategory(admx, "category", "Search_Add"), "Search");
    assert.equal(parentCategory(admx, "policy", "Folder"), "product");
});

test("help texts in the schema must not contain tables", async () => {
    await assert.rejects(
        generate({ properties: { Flag: { type: "boolean", "x-help": "| a | b |\n| --- | --- |" } } }, ["Flag"]),
        /x-help of Flag in the policy schema contains a table or a code block/
    );
});

test("unknown Fluent messages are an error", async () => {
    await assert.rejects(
        generate({ properties: { Flag: { type: "boolean", "x-description-l10n-id": "policy-Unknown" } } }, ["Flag"]),
        /The Fluent message policy-Unknown of x-description-l10n-id of Flag does not exist/
    );
});

test("a list box is labelled with the title of its setting, a single text box with its name", async () => {
    const { adml } = await generate(
        {
            properties: {
                Cookies: {
                    type: "object",
                    properties: {
                        Allow: { type: "array", title: "Sites which may always set cookies.", items: { type: "string" } },
                        Block: { type: "array", items: { type: "string" } },
                    },
                },
                Proxy: {
                    type: "object",
                    properties: { HTTPProxy: { type: "string", title: "HTTP proxy" } },
                },
            },
        },
        ["Cookies_Allow", "Cookies_Block", "Proxy_HTTPProxy"]
    );
    // The title without its trailing period.
    assert.match(adml, /<listBox refId="Cookies_Allow_List">Sites which may always set cookies<\/listBox>/);
    // Without a title, the name of the setting.
    assert.match(adml, /<listBox refId="Cookies_Block_List">Block<\/listBox>/);
    // The title is already the name of the ADMX policy of a single control.
    assert.match(adml, /<textBox refId="Proxy_HTTPProxy_Input">\s*<label>HTTPProxy<\/label>/);
});

test("a control in a group is labelled with the title of its setting", async () => {
    const { adml } = await generate(
        {
            properties: {
                Authentication: {
                    type: "object",
                    properties: {
                        AllowProxies: {
                            type: "object",
                            title: "Allow integrated authentication for proxies",
                            properties: {
                                SPNEGO: { type: "boolean", title: "Allow SPNEGO" },
                                NTLM: { type: "boolean" },
                            },
                        },
                    },
                },
            },
        },
        ["Authentication_AllowProxies"]
    );
    assert.match(adml, /<checkBox refId="Authentication_AllowProxies_SPNEGO_Bool">Allow SPNEGO<\/checkBox>/);
    assert.match(adml, /<checkBox refId="Authentication_AllowProxies_NTLM_Bool">NTLM<\/checkBox>/);
});

test("a JSON value has its name above its box, and a taller box", async () => {
    const { adml } = await generate(
        { properties: { Settings: { type: "object", contentMediaType: "application/json", description: "Some JSON." } } },
        ["Settings"]
    );
    assert.match(adml, /<presentation id="Settings">\s*<text>Settings<\/text>\s*<multiTextBox refId="Settings_Input" defaultHeight="12"\/>/);
});

test("an ADMX policy is placed in the folders of its setting path, named by their titles", async () => {
    const { admx, adml } = await generate(
        {
            properties: {
                Proxy: {
                    type: "object",
                    title: "Proxy settings.",
                    "x-category": "Network security",
                    properties: { Locked: { type: "boolean" }, HTTPProxy: { type: "string" } },
                },
                Permissions: {
                    type: "object",
                    properties: {
                        Camera: { type: "object", title: "Camera", properties: { Allow: { type: "array", items: { type: "string" } }, Locked: { type: "boolean" } } },
                    },
                },
                Plain: { type: "boolean", "x-category": "Network security" },
            },
        },
        ["Proxy_Locked", "Proxy_HTTPProxy", "Permissions_Camera_Allow", "Permissions_Camera_Locked", "Plain"]
    );
    // A folder per policy with several settings, its id the setting path,
    // named by its title (without the period), below the product's folder.
    assert.equal(parentCategory(admx, "policy", "Proxy_HTTPProxy"), "Proxy");
    assert.equal(parentCategory(admx, "category", "Proxy"), "product");
    assert.equal(string(adml, "cat_Proxy"), "Proxy settings");
    // Nested for deeper settings, the name of a setting without title is its
    // name.
    assert.equal(parentCategory(admx, "policy", "Permissions_Camera_Allow"), "Permissions_Camera");
    assert.equal(parentCategory(admx, "category", "Permissions_Camera"), "Permissions");
    assert.equal(string(adml, "cat_Permissions_Camera"), "Camera");
    assert.equal(string(adml, "cat_Permissions"), "Permissions");
    // A policy with a single ADMX policy sits in the product's folder.
    // x-category is the category of the docs.
    assert.equal(parentCategory(admx, "policy", "Plain"), "product");
});

test("a new setting doesn't move the ADMX policies of a policy", async () => {
    const schema = settings => ({ properties: { Proxy: { type: "object", properties: settings } } });
    const before = await generate(schema({ Locked: { type: "boolean" }, Mode: { type: "string" } }), ["Proxy_Locked", "Proxy_Mode"]);
    const after = await generate(
        schema({ Locked: { type: "boolean" }, Mode: { type: "string" }, Port: { type: "string" } }),
        ["Proxy_Locked", "Proxy_Mode", "Proxy_Port"]
    );
    assert.equal(parentCategory(before.admx, "policy", "Proxy_Mode"), "Proxy");
    assert.equal(parentCategory(after.admx, "policy", "Proxy_Mode"), "Proxy");
});

test("a setting of several forms gets one ADMX policy per form, the others with the kind as suffix", async () => {
    const { admx, adml } = await generate(
        {
            properties: {
                Locales: {
                    type: ["string", "array"],
                    items: { type: "string" },
                    description: "The locales.",
                    "x-category": "Misc",
                },
            },
        },
        ["Locales"]
    );
    // The list keeps the plain name, the text is added, both in the product's
    // folder.
    assert.match(admx, /<list id="Locales_List" key="Software\\Policies\\Example\\Product\\Locales" valuePrefix=""\/>/);
    assert.match(admx, /<text id="LocalesString_Input" valueName="Locales"\/>/);
    assert.equal(parentCategory(admx, "policy", "Locales"), "product");
    assert.equal(parentCategory(admx, "policy", "LocalesString"), "product");
    assert.equal(string(adml, "LocalesString"), "Locales (string)");
    assert.equal(string(adml, "LocalesString_Explain"), `The locales.\n\n${docsLink("locales")}\n`);
});

test("forms which all have a fixed set of values are one dropdown, each value with its own registry type", async () => {
    const { admx, adml } = await generate(
        {
            properties: {
                Menu: {
                    description: "The menu bar.",
                    anyOf: [
                        { type: "boolean", description: "The old form.", "x-deprecated": true },
                        { type: "string", oneOf: [{ const: "always", title: "Always shown" }, { const: "never", title: "Never shown" }] },
                    ],
                },
            },
        },
        ["Menu"]
    );
    const policy = admx.match(/<policy name="Menu"[\s\S]*?<\/policy>/)[0];
    assert.match(policy, /<enum id="Menu_Enum" valueName="Menu">/);
    assert.match(policy, /<item displayName="\$\(string.Menu_always\)">\s*<value>\s*<string>always<\/string>/);
    assert.match(policy, /<item displayName="\$\(string.Menu_0x1\)">\s*<value>\s*<decimal value="1"\/>/);
    assert.match(policy, /<item displayName="\$\(string.Menu_0x0\)">\s*<value>\s*<decimal value="0"\/>/);
    assert.equal(string(adml, "Menu_always"), "Always shown");
    assert.equal(string(adml, "Menu_0x1"), "true");
    assert.match(adml, /<dropdownList refId="Menu_Enum">Menu<\/dropdownList>/);
    assert.doesNotMatch(admx, /<policy name="Menu_/);
});

test("a boolean or object setting gets the boolean and the ADMX policies of its settings", async () => {
    const { admx, adml } = await generate(
        {
            properties: {
                Sanitize: {
                    type: ["boolean", "object"],
                    description: "Clear data.",
                    "x-category": "Privacy",
                    properties: { Cache: { type: "boolean" }, Cookies: { type: "boolean" }, Except: { type: "string" } },
                },
            },
        },
        ["Sanitize", "Sanitize_Cache", "Sanitize_Cookies", "Sanitize_Except"]
    );
    assert.match(admx, /<policy name="Sanitize" [^>]*valueName="Sanitize">/);
    assert.match(admx, /<policy name="Sanitize_Cache" /);
    assert.match(admx, /<policy name="Sanitize_Cookies" /);
    // The boolean form sits in the product's folder, the settings of the
    // object form in the folder of the policy.
    assert.equal(parentCategory(admx, "policy", "Sanitize"), "product");
    assert.equal(parentCategory(admx, "policy", "Sanitize_Cache"), "Sanitize");
    assert.equal(string(adml, "Sanitize"), "Sanitize");
});

test("alternatives of one kind are a single form", async () => {
    const { admx } = await generate(
        { properties: { Url: { type: "string", anyOf: [{ format: "moz-url" }, { maxLength: 0 }] } } },
        ["Url"]
    );
    assert.match(admx, /<text id="Url_Input" valueName="Url"\/>/);
    assert.doesNotMatch(admx, /UrlString/);
});

test("two forms of the same kind, a policy without ADMX policy, and two ADMX policies of one name are errors", async () => {
    await assert.rejects(
        generate({ properties: { Two: { anyOf: [{ type: "string" }, { type: "string", format: "moz-url" }, { type: "boolean" }] } } }, ["Two"]),
        /The setting Two in the policy schema accepts two forms of the kind String/
    );
    await assert.rejects(
        generate({ properties: { Empty: { type: "object" } } }, ["Empty"]),
        /The policy Empty can not be represented in the ADMX template/
    );
    await assert.rejects(
        generate(
            { properties: { Foo: { type: ["string", "array"], items: { type: "string" } }, FooString: { type: "string" } } },
            ["Foo", "FooString"]
        ),
        /Two ADMX policies would be named FooString/
    );
});

test("the ADMX policy of a form gets the description of its alternative, and is marked if it is deprecated", async () => {
    const { adml } = await generate(
        {
            properties: {
                Locales: {
                    description: "The locales.",
                    anyOf: [
                        { type: "array", items: { type: "string" } },
                        { type: "string", description: "An empty text clears them.", "x-deprecated": true },
                    ],
                },
            },
        },
        ["Locales"]
    );
    assert.equal(string(adml, "LocalesString"), "Locales (string) (deprecated)");
    assert.match(string(adml, "LocalesString_Explain"), /The locales\.\n\nAn empty text clears them\./);
    assert.equal(string(adml, "Locales"), "Locales");
});

test("a setting name with other characters than letters, digits and _ is an error, except inside JSON and as open name", async () => {
    await assert.rejects(
        generate({ properties: { Policy: { type: "object", properties: { "Allow-List": { type: "string" } } } } }, ["Policy"]),
        /The setting Policy.Allow-List can't be part of an ADMX policy name/
    );
    const { admx } = await generate(
        {
            properties: {
                Json: {
                    type: "object",
                    contentMediaType: "application/json",
                    properties: { "Allow-List": { type: "string" } },
                },
                Open: { type: "object", patternProperties: { "^.*$": { type: "string" } } },
            },
        },
        ["Json", "Open_[name]"]
    );
    assert.match(admx, /<policy name="Json" /);
    assert.match(admx, /<policy name="Open" /);
});

test("a list of objects whose entries hold a list or an object is one JSON value, not numbered sets", async () => {
    const { admx, adml } = await generate(
        {
            properties: {
                Sites: {
                    type: "array",
                    description: "Policies for sites.",
                    items: {
                        type: "object",
                        properties: {
                            Match: { type: "array", items: { type: "string" }, description: "The sites." },
                            Policies: {
                                type: "object",
                                description: "The policies.",
                                properties: { Jit: { type: "boolean", description: "Disable the JIT." } },
                            },
                        },
                    },
                },
                Flat: {
                    type: "array",
                    description: "Flat entries.",
                    items: { type: "object", properties: { Name: { type: "string" }, Url: { type: "string" } } },
                },
            },
        },
        ["Sites", "Flat"]
    );
    assert.match(admx, /<policy name="Sites" [^>]*key="Software\\Policies\\Example\\Product"/);
    assert.match(admx, /<multiText id="Sites_Input" valueName="Sites"/);
    assert.doesNotMatch(admx, /<policy name="Sites_1"/);
    assert.equal(
        string(adml, "Sites_Explain"),
        `Policies for sites.\n\nThe whole list is one value, as JSON.\n\nMatch: The sites.\nPolicies: The policies.\n  Jit: Disable the JIT.\n\n${docsLink("sites")}\n`
    );
    // A list of objects with plain settings stays numbered sets.
    assert.match(admx, /<policy name="Flat_1"/);
});

test("a free number is a number box with the limits of the schema, a dropdown has no valueName of its policy", async () => {
    const { admx, adml } = await generate(
        {
            properties: {
                Timeout: { type: "number", description: "Seconds." },
                Hours: { type: "integer", minimum: 1, maximum: 24 },
                Restart: {
                    type: "object",
                    properties: { Time: { type: "object", properties: { Hour: { type: "number" }, Minute: { type: "number" } } } },
                },
                Version: { type: "number", oneOf: [{ const: 4, title: "SOCKS 4" }, { const: 5, title: "SOCKS 5" }] },
                Flag: { type: "boolean" },
            },
        },
        ["Timeout", "Hours", "Restart_Time", "Version", "Flag"]
    );
    const policy = name => admx.match(new RegExp(`<policy name="${name}"[^>]*>[\\s\\S]*?</policy>`))[0];
    assert.match(policy("Timeout"), /<decimal id="Timeout_Number" valueName="Timeout" minValue="0" maxValue="2147483647"\/>/);
    assert.match(policy("Hours"), /<decimal id="Hours_Number" valueName="Hours" minValue="1" maxValue="24"\/>/);
    assert.match(adml, /<decimalTextBox refId="Timeout_Number">Timeout<\/decimalTextBox>/);
    // In a group too.
    assert.match(policy("Restart_Time"), /<decimal id="Restart_Time_Hour_Number" valueName="Hour"/);
    // Only an on/off policy has a valueName of its own.
    assert.doesNotMatch(policy("Timeout"), /<policy [^>]*valueName=/);
    assert.doesNotMatch(policy("Version"), /<policy [^>]*valueName=/);
    assert.match(policy("Version"), /<enum id="Version_Enum" valueName="Version">/);
    assert.match(policy("Flag"), /<policy [^>]*valueName="Flag"/);
});

test("a list of names and values with x-expand-env-vars is expandable", async () => {
    const { admx } = await generate(
        {
            properties: {
                Devices: {
                    type: "object",
                    properties: {
                        Add: {
                            type: "object",
                            patternProperties: { "^.*$": { type: "string", "x-expand-env-vars": true } },
                        },
                        Delete: { type: "array", items: { type: "string" } },
                    },
                },
            },
        },
        ["Devices_Add_[name]", "Devices_Delete"]
    );
    assert.match(admx, /<list id="Devices_Add_List" key="Software\\Policies\\Example\\Product\\Devices\\Add" explicitValue="true" expandable="true"\/>/);
});
