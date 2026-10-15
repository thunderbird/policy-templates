import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import pathUtils from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

import { CommitGraph } from "../modules/commit_graph.mjs";

const execFileAsync = promisify(execFile);

/**
 * Run a test with an origin repository (one commit on main, filters allowed
 * for the treeless clone), and the path of the clone of its commit graph.
 */
async function withOrigin(fn) {
    const dir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "graph-"));
    const origin = pathUtils.join(dir, "origin");
    const git = async (...args) => (await execFileAsync("git", [
        "-C", origin, "-c", "user.name=Test", "-c", "user.email=test@example.com", ...args,
    ])).stdout.trim();
    try {
        await fs.mkdir(origin);
        await git("init", "--quiet", "--initial-branch=main");
        await git("config", "uploadpack.allowFilter", "true");
        await git("commit", "--quiet", "--allow-empty", "-m", "first");
        await fn({ git, url: `file://${origin}`, clone: pathUtils.join(dir, "graph.git") });
    } finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
}

// A file inside the clone: it survives an update, but not a new clone.
const MARKER = "marker";
const hasMarker = clone => fs.access(pathUtils.join(clone, MARKER)).then(() => true, () => false);

test("a valid clone of the commit graph is updated", async () => {
    await withOrigin(async ({ git, url, clone }) => {
        await CommitGraph.open(url, clone);
        await fs.writeFile(pathUtils.join(clone, MARKER), "");
        await git("commit", "--quiet", "--allow-empty", "-m", "second");

        const graph = await CommitGraph.open(url, clone);
        assert.ok(await hasMarker(clone));
        assert.equal(await graph.resolveBranch("main"), await git("rev-parse", "main"));
    });
});

test("a missing, broken or foreign clone of the commit graph is cloned again", async () => {
    await withOrigin(async ({ git, url, clone }) => {
        const head = await git("rev-parse", "main");
        const breakages = {
            "a folder which is no repository": async () => {
                await fs.rm(clone, { recursive: true });
                await fs.mkdir(clone);
                await fs.writeFile(pathUtils.join(clone, "junk"), "");
            },
            "a repository without objects and refs": async () => {
                await fs.rm(pathUtils.join(clone, "objects"), { recursive: true });
                await fs.rm(pathUtils.join(clone, "refs"), { recursive: true });
            },
            "a clone of another repository": async () => {
                await execFileAsync("git", [`--git-dir=${clone}`, "remote", "set-url", "origin", "https://example.org/other.git"]);
            },
            "a clone whose update fails": async () => {
                await execFileAsync("git", [`--git-dir=${clone}`, "config", "remote.origin.fetch", "+refs/heads/*:invalid refspec"]);
            },
        };
        for (const [name, breakClone] of Object.entries(breakages)) {
            await CommitGraph.open(url, clone);
            await breakClone();
            await fs.writeFile(pathUtils.join(clone, MARKER), "");

            const graph = await CommitGraph.open(url, clone);
            assert.ok(!await hasMarker(clone), `${name}: cloned again`);
            assert.equal(await graph.resolveBranch("main"), head, `${name}: usable`);
        }

        // Without a clone at all.
        await fs.rm(clone, { recursive: true });
        assert.equal(await (await CommitGraph.open(url, clone)).resolveBranch("main"), head);
    });
});
