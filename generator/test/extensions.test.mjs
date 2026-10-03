import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import pathUtils from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { getExtensionContext } from "../modules/extensions.mjs";
import { generateOverview } from "../modules/generate_markdown.mjs";
import { SchemaL10n } from "../modules/l10n.mjs";
import { loadProduct } from "../modules/product.mjs";
import { ContentError, setDownloadCacheFile } from "../modules/tools.mjs";

const PRODUCT_DIR = pathUtils.join(pathUtils.dirname(fileURLToPath(import.meta.url)), "fixtures", "product");

// The commit of the l10n repository which main pins for de.
const DE_COMMIT = "0123456789abcdef0123456789abcdef01234567";

// The product's repository: every branch has a version and a brand.ftl, and
// main pins the commits of its locales.
const APP = {
    description: "test",
    resolveBranch: async branch => `commit-${branch}`,
    readFile: async (commit, path) => ({
        "config/version.txt": commit == "commit-main" ? "153.0a1\n" : "140.3.0\n",
        "locales/brand.ftl": "-brand-short-name = Product\n",
        "locales/l10n-changesets.json": commit == "commit-main"
            ? JSON.stringify({ de: { revision: DE_COMMIT }, fr: { revision: "default" } })
            : null,
    })[path] ?? null,
};

const EN = [
    { name: "brand.ftl", source: "-brand-short-name = Product\n" },
    { name: "policies.ftl", source: "policy-Flag = A flag of { -brand-short-name }.\npolicy-Other = Only in English.\n" },
];

async function getMain(product) {
    return {
        product,
        branch: "main",
        commit: "commit-main",
        name: "Product Nightly 153.0a1",
        version: "153.0a1",
        schema: {
            properties: {
                Flag: { type: "boolean", "x-description-l10n-id": "policy-Flag" },
                Other: { type: "boolean", "x-description-l10n-id": "policy-Other" },
                Plain: { type: "boolean", description: "Plain text." },
            },
        },
        l10n: new SchemaL10n(EN),
        compatData: { Flag: { min: "140.0", supportedSince: "140.0" }, Old: { min: "78.0", max: "115.0", supportedSince: "78.0" } },
    };
}

async function withTempDir(fn) {
    const dir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "extensions-"));
    try {
        return await fn(dir);
    } finally {
        await fs.rm(dir, { recursive: true });
    }
}

test("an extension of a template gets the context and returns Markdown, which is inserted as it is", async () => {
    const product = await loadProduct(PRODUCT_DIR);
    await withTempDir(async dir => {
        await generateOverview({ app: APP, product, branches: ["esr140", "main"], main: await getMain(product) }, dir);
        const text = await fs.readFile(pathUtils.join(dir, "README.md"), "utf8");
        assert.equal(text, [
            "#  * [Product Nightly 153.0a1](policies/main)",
            " * [Product ESR 140.3.0](policies/esr140)",
            "",
            "",
            "| Policy/Property Name | Product | Removed after |",
            "|:--- | ---:| ---:|",
            "| `Flag` | 140.0 |  |",
            "| `Old` | 78.0 | 115.0 |",
            "",
            "product: product",
            "branch: main",
            "branches: main | Product Nightly 153.0a1 | 153.0a1 | https://example.org/docs/policies/main",
            "branches: esr140 | Product ESR 140.3.0 | 140.3.0 | https://example.org/docs/policies/esr140",
            "schema: A flag of Product. | false",
            'compatibility: {"name":"Flag","first":"140.0","last":""}',
            "frozen: true",
            "cachedFetch: function",
            "other keys: none",
            "__branches__",
            "",
            "",
        ].join("\n"));
    });
});

test("errors of extensions", async () => {
    await withTempDir(async tmp => {
        // The folder name is the product's name.
        const dir = pathUtils.join(tmp, "product");
        await fs.cp(PRODUCT_DIR, dir, { recursive: true });
        const overview = pathUtils.join(dir, "templates", "overview.md");
        // A missing file.
        await fs.writeFile(overview, "__js:missing__\n");
        await assert.rejects(loadProduct(dir), error => error instanceof ContentError && /extension missing of overview.md can not be loaded/.test(error.message));
        // No default export.
        await fs.writeFile(pathUtils.join(dir, "extensions", "nodefault.mjs"), "export const x = 1;\n");
        await fs.writeFile(overview, "__js:nodefault__\n");
        await assert.rejects(loadProduct(dir), /nodefault.mjs has no default export function/);
        // A result which is not Markdown.
        await fs.writeFile(pathUtils.join(dir, "extensions", "number.mjs"), "export default () => 42;\n");
        await fs.writeFile(overview, "__js:number__\n");
        const product = await loadProduct(dir);
        await assert.rejects(
            generateOverview({ app: APP, product, branches: ["main"], main: await getMain(product) }, pathUtils.join(dir, "out")),
            /The extension number of overview.md returned number instead of Markdown/
        );
    });
});

test("schema(locale) resolves the Fluent IDs in the locale pinned by the branch, with the English texts as fallback", async () => {
    const product = await loadProduct(PRODUCT_DIR);
    const context = getExtensionContext(await getMain(product), [], APP);
    const en = await context.schema();
    assert.deepEqual(en.properties.Flag, { type: "boolean", description: "A flag of Product." });

    await withTempDir(async dir => {
        setDownloadCacheFile(pathUtils.join(dir, "cache.json"));
        const realFetch = globalThis.fetch;
        const files = {
            [`https://raw.githubusercontent.com/example/l10n/${DE_COMMIT}/de/brand.ftl`]: "-brand-short-name = Produkt\n",
            [`https://raw.githubusercontent.com/example/l10n/${DE_COMMIT}/de/policies.ftl`]: "policy-Flag = Ein Schalter von { -brand-short-name }.\n",
        };
        globalThis.fetch = async url => files[url]
            ? new Response(files[url], { status: 200 })
            : new Response("", { status: 404 });
        try {
            const de = await context.schema("de");
            assert.equal(de.properties.Flag.description, "Ein Schalter von Produkt.");
            // Not translated: the English message, and plain texts.
            assert.equal(de.properties.Other.description, "Only in English.");
            assert.equal(de.properties.Plain.description, "Plain text.");
            await assert.rejects(context.schema("xx"), /The locale xx is not available on main, its locales are: de, fr\./);
            await assert.rejects(context.schema("fr"), /The locale fr is pinned to "default" on main, which is not a commit/);
        } finally {
            globalThis.fetch = realFetch;
            setDownloadCacheFile(undefined);
        }
    });

    // A branch without the changesets file.
    const esr = getExtensionContext({ ...await getMain(product), branch: "esr140", commit: "commit-esr140" }, [], APP);
    await assert.rejects(esr.schema("de"), /The branch esr140 has no locales\/l10n-changesets.json/);

    // A product without l10n has only en-US.
    const noL10n = getExtensionContext({ ...await getMain(product), product: { ...product, l10n: null } }, [], APP);
    await assert.rejects(noL10n.schema("de"), /The locale de is not available: the product has no "l10n"/);
});
