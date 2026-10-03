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

    // Names: the title (also from Fluent), else the raw name, never the
    // description.
    assert.equal(string(adml, "Auth_Sites"), "Sites allowed to authenticate");
    assert.equal(string(adml, "Auth_Locked"), "Lock it");
    assert.equal(string(adml, "Auth_Mode"), "Mode");
    assert.equal(string(adml, "Auth_Delegated"), "Delegated");
    assert.equal(string(adml, "Search_Add_2"), "Add (2)");
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

    // A setting with several ADMX policies gets a category, nested in the
    // category of its parent setting.
    assert.equal(parentCategory(admx, "policy", "Auth_Locked"), "Auth_category");
    assert.equal(parentCategory(admx, "policy", "Search_Add_1"), "Search_Add_category");
    assert.equal(parentCategory(admx, "category", "Search_Add_category"), "Search_category");
    assert.equal(parentCategory(admx, "policy", "Folder"), "product_category");
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

test("a policy is placed in the category of its x-category, with its own category inside", async () => {
    const { admx, adml } = await generate(
        {
            properties: {
                Proxy: {
                    type: "object",
                    "x-category": "Network security",
                    properties: { Locked: { type: "boolean" }, HTTPProxy: { type: "string" } },
                },
                Authentication: {
                    type: "object",
                    "x-category": "Authentication",
                    properties: { Locked: { type: "boolean" }, NTLM: { type: "boolean" } },
                },
                Flag: { type: "boolean", "x-category": "Network security" },
                Plain: { type: "boolean" },
            },
        },
        ["Proxy_Locked", "Proxy_HTTPProxy", "Authentication_Locked", "Authentication_NTLM", "Flag", "Plain"]
    );
    // The category of the policy, with the category of its settings inside.
    assert.equal(parentCategory(admx, "category", "cat_Network_security"), "product_category");
    assert.equal(string(adml, "cat_Network_security"), "Network security");
    assert.equal(parentCategory(admx, "category", "Proxy_category"), "cat_Network_security");
    assert.equal(parentCategory(admx, "policy", "Proxy_HTTPProxy"), "Proxy_category");
    assert.equal(parentCategory(admx, "policy", "Flag"), "cat_Network_security");
    // Not nested in a category of the same name.
    assert.equal(parentCategory(admx, "policy", "Authentication_NTLM"), "cat_Authentication");
    assert.equal(admx.includes('name="Authentication_category"'), false);
    // Without x-category, at the top level.
    assert.equal(parentCategory(admx, "policy", "Plain"), "product_category");
});
