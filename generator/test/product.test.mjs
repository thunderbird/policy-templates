import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import pathUtils from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { formatBranchName } from "../modules/branches.mjs";
import { getBranchKind, getChannelLabel, getSchemaOverlay, loadProduct, parseBranches, preprocess } from "../modules/product.mjs";
import { ContentError, InputError } from "../modules/tools.mjs";

const PRODUCT_DIR = pathUtils.join(pathUtils.dirname(fileURLToPath(import.meta.url)), "fixtures", "product");

test("a product folder is loaded with its templates", async () => {
    const product = await loadProduct(PRODUCT_DIR);
    assert.equal(product.registryKey, "Software\\Policies\\Example\\Product");
    assert.deepEqual(product.admx, { file: "product", prefix: "product", namespace: "Example.Policies.Product" });
    assert.deepEqual(product.plist, { domain: "org.example.product" });
    assert.deepEqual(product.source.fluent, ["locales/brand.ftl"]);
    assert.equal(product.name, "product");
    assert.deepEqual(product.l10n, {
        repository: "example/l10n",
        changesets: "locales/l10n-changesets.json",
        fluent: ["{locale}/brand.ftl", "{locale}/policies.ftl"],
    });
    assert.deepEqual([...product.extensions.keys()], ["echo"]);
    assert.match(product.templates.branch, /^%ifdef MAIN$/m);
    assert.equal(product.overridesDir, pathUtils.join(PRODUCT_DIR, "overrides"));
});

test("--product-config is required, and every key of product.yaml", async () => {
    await assert.rejects(loadProduct(undefined), InputError);
    const parent = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "product-"));
    const dir = pathUtils.join(parent, "product");
    try {
        await fs.cp(PRODUCT_DIR, dir, { recursive: true });
        const file = pathUtils.join(dir, "product.yaml");
        const valid = await fs.readFile(file, "utf8");
        await fs.writeFile(file, valid.replace(/^  registry-key:.*\n/m, ""));
        await assert.rejects(loadProduct(dir), /needs "admx.registry-key"/);
        // Keys which are no longer used are rejected.
        await fs.writeFile(file, `${valid}registry-key: x\n`);
        await assert.rejects(loadProduct(dir), /"registry-key", which moved to "admx.registry-key"/);
        await fs.writeFile(file, `${valid}compare-with:\n  name: Other\n`);
        await assert.rejects(loadProduct(dir), /"compare-with", which is no longer used/);
        await fs.writeFile(file, valid);
        await fs.writeFile(file, valid.replace("  changesets:", "  branch: main\n  changesets:"));
        await assert.rejects(loadProduct(dir), /"l10n.branch", which is no longer used/);
        await fs.writeFile(file, valid);
        await fs.writeFile(file, valid.replace("admx:\n", "admx:\n  file: product\n"));
        await assert.rejects(loadProduct(dir), /"admx.file", which is no longer used/);
        await fs.writeFile(file, valid.replace("plist:\n  domain: org.example.product\n", "plist: org.example.product\n"));
        await assert.rejects(loadProduct(dir), /"plist" as a string, use "plist.domain"/);
        await fs.writeFile(file, valid);
        await fs.rm(pathUtils.join(dir, "templates", "branch.md"));
        await assert.rejects(loadProduct(dir), InputError);
        // The directives of the templates are checked when they are loaded.
        await fs.writeFile(pathUtils.join(dir, "templates", "branch.md"), "%ifdef MAIN\nText\n");
        await assert.rejects(loadProduct(dir), /%ifdef without %endif in .*branch.md/);
    } finally {
        await fs.rm(parent, { recursive: true });
    }
});

test("--branches is required and takes full branch names only", async () => {
    const product = await loadProduct(PRODUCT_DIR);
    assert.throws(() => parseBranches(undefined, product), /--branches is required/);
    assert.deepEqual(parseBranches("main, beta,esr140,main", product), ["main", "beta", "esr140"]);
    assert.throws(() => parseBranches("main,140", product), /Unknown branch "140"/);
    assert.throws(() => parseBranches("esr", product), /Unknown branch "esr"/);
});

test("the name of a branch is the brand name, the channel label and the version", async () => {
    const product = await loadProduct(PRODUCT_DIR);
    assert.equal(getChannelLabel(product, "esr140"), "ESR");
    assert.equal(formatBranchName(product, "main", "Product", "153.0a1"), "Product Nightly 153.0a1");
    assert.equal(formatBranchName(product, "esr140", "Product", "140.3.0"), "Product ESR 140.3.0");
    // No label for release, without a double space.
    assert.equal(formatBranchName(product, "release", "Product", "152.0"), "Product 152.0");
});

test("the schema overlay of a branch is used if it exists", async () => {
    const product = await loadProduct(PRODUCT_DIR);
    assert.equal(await getSchemaOverlay(product, "beta"), pathUtils.join(PRODUCT_DIR, "overrides", "beta.schema.json"));
    assert.equal(await getSchemaOverlay(product, "main"), null);
});

test("a branch defines its kind for the %ifdef blocks", () => {
    assert.deepEqual(["main", "beta", "release", "esr140"].map(getBranchKind), ["MAIN", "BETA", "RELEASE", "ESR"]);
    assert.throws(() => getBranchKind("esr"), /Unknown branch "esr"/);
});

test("%ifdef blocks keep or remove their lines, and the directive lines are removed", () => {
    const text = [
        "a",
        "%ifdef MAIN",
        "main",
        "%ifndef ESR",
        "main, not esr",
        "%endif",
        "%else",
        "other",
        "%endif",
        "%ifndef MAIN",
        "not main",
        "%endif",
        "b",
        "",
    ].join("\n");
    assert.equal(preprocess(text, ["MAIN"], "t"), "a\nmain\nmain, not esr\nb\n");
    assert.equal(preprocess(text, ["ESR"], "t"), "a\nother\nnot main\nb\n");
    // Without a trailing line break.
    assert.equal(preprocess("%ifdef BETA\nbeta\n%endif", ["BETA"], "t"), "beta\n");
    assert.equal(preprocess("x\n%ifdef BETA\nbeta\n%endif", [], "t"), "x\n");
});

test("errors in %ifdef blocks", () => {
    for (const [text, message] of [
        ["%ifdef DAILY\n%endif\n", /Unknown name "DAILY" in t, line 1/],
        ["%ifdef\n%endif\n", /Unknown name "" in t, line 1/],
        ["%if MAIN\n%endif\n", /Unknown directive "%if MAIN" in t, line 1/],
        ["a\n%comment\n", /Unknown directive "%comment" in t, line 2/],
        ["%endif\n", /%endif without %ifdef in t, line 1/],
        ["%else\n", /%else without %ifdef in t, line 1/],
        ["%ifdef MAIN\n%else\n%else\n%endif\n", /A second %else in t, line 3/],
        ["%ifdef MAIN\n", /%ifdef without %endif in t/],
    ]) {
        assert.throws(() => preprocess(text, ["MAIN"], "t"), error => error instanceof ContentError && message.test(error.message), text);
    }
});

test("the name of the product folder must be usable as the name of the ADMX template", async () => {
    const parent = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "product-"));
    try {
        const dir = pathUtils.join(parent, "Bad_Name");
        await fs.cp(PRODUCT_DIR, dir, { recursive: true });
        await assert.rejects(loadProduct(dir), /The product folder "Bad_Name" can not be used as the name of the ADMX template/);
    } finally {
        await fs.rm(parent, { recursive: true });
    }
});
