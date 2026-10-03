import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import pathUtils from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

import { LocalGitSource, WORKING_TREE, createSources } from "../modules/sources.mjs";

const execFileAsync = promisify(execFile);

test("in a local checkout, main is the working tree", async () => {
    const dir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "sources-"));
    const git = (...args) => execFileAsync("git", [
        "-C", dir, "-c", "user.name=Test", "-c", "user.email=test@example.com", ...args,
    ]);
    try {
        // A branch "esr", and a checked out branch with another name than main
        // with one commit and an uncommitted change.
        await git("init", "--quiet", "--initial-branch=esr");
        await fs.writeFile(pathUtils.join(dir, "schema.json"), "esr\n");
        await git("add", "schema.json");
        await git("commit", "--quiet", "-m", "esr");
        await git("checkout", "--quiet", "-b", "feature");
        await fs.writeFile(pathUtils.join(dir, "schema.json"), "committed\n");
        await git("commit", "--quiet", "-am", "feature");
        await fs.writeFile(pathUtils.join(dir, "schema.json"), "uncommitted\n");

        const source = await new LocalGitSource(dir).init();
        const main = await source.resolveBranch("main");
        assert.equal(main, WORKING_TREE);
        assert.equal(await source.readFile(main, "schema.json"), "uncommitted\n");
        assert.equal(await source.readFile(main, "missing.json"), null);

        const history = await source.getFileHistory(main, "schema.json");
        assert.equal(history.length, 3);
        assert.equal(history[0], WORKING_TREE);
        assert.equal(await source.readFile(history[1], "schema.json"), "committed\n");

        const esr = await source.resolveBranch("esr");
        assert.notEqual(esr, WORKING_TREE);
        assert.equal(await source.readFile(esr, "schema.json"), "esr\n");
        assert.equal(await source.resolveBranch("unknown"), null);
    } finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
});

test("--checkout is a local checkout of the product's repository, with no other source of the product", async () => {
    const dir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "sources-"));
    try {
        await execFileAsync("git", ["-C", dir, "init", "--quiet"]);
        const sources = await createSources({ checkout: dir }, { source: { repository: "example/product" } });
        assert.ok(sources.app instanceof LocalGitSource);
        assert.deepEqual(Object.keys(sources).sort(), ["app", "mozilla", "product"]);
    } finally {
        await fs.rm(dir, { recursive: true });
    }
});
