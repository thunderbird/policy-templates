import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import pathUtils from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

import { CommitGraph } from "../modules/commit_graph.mjs";
import { GitHubSource, LocalGitSource, WORKING_TREE, createSources } from "../modules/sources.mjs";
import { setDownloadCacheFile } from "../modules/tools.mjs";

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

/**
 * Create a repository like the ones of the products: a policy "New" landed on
 * main for version 92 and was uplifted to the 91 line, which was then merged
 * into the 92 line on merge day, taking the whole content of the 92 line (like
 * "Promote beta to release"). The file history of the release branch only
 * includes the uplift if the merged in line is walked as well.
 *
 * @param {string} dir
 * @returns {Promise<{git: function, uplift: string, landing: string}>}
 */
async function createReleaseRepository(dir) {
    const git = async (...args) => (await execFileAsync("git", [
        "-C", dir, "-c", "user.name=Test", "-c", "user.email=test@example.com", ...args,
    ])).stdout.trim();
    const commit = async (version, policies, message) => {
        await fs.writeFile(pathUtils.join(dir, "version.txt"), `${version}\n`);
        await fs.writeFile(pathUtils.join(dir, "schema.json"), JSON.stringify({ properties: policies }));
        await git("add", "version.txt", "schema.json");
        await git("commit", "--quiet", "-m", message);
        return git("rev-parse", "HEAD");
    };
    await git("init", "--quiet", "--initial-branch=main");
    await commit("91.0a1", { Old: {} }, "base");
    await git("checkout", "--quiet", "-b", "release");
    const uplift = await commit("91.0", { Old: {}, New: {} }, "uplift of New to 91");
    await git("checkout", "--quiet", "main");
    const landing = await commit("92.0a1", { Old: {}, New: {} }, "New lands on main");
    // Merge day: the release branch continues with the content of the 92 line.
    await git("checkout", "--quiet", "-b", "promote");
    await git("merge", "--quiet", "-s", "ours", "-m", "Promote beta to release", "release");
    await git("branch", "--quiet", "-f", "release", "promote");
    await git("checkout", "--quiet", "main");
    return { git, uplift, landing };
}

test("the file history of a release branch includes lines merged in from outside of main", async () => {
    const dir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "sources-"));
    try {
        const { git, uplift, landing } = await createReleaseRepository(dir);
        // Plain git log does not walk the merged in 91 line.
        assert.ok(!(await git("rev-list", "release", "--", "schema.json")).includes(uplift));

        const source = await new LocalGitSource(dir).init();
        const release = await source.resolveBranch("release");
        const history = await source.getFileHistory(release, "schema.json");
        assert.ok(history.includes(uplift));
        assert.ok(history.includes(landing));
        assert.equal((await source.readFile(uplift, "version.txt")).trim(), "91.0");

        // Main has no lines merged in from outside of main.
        const main = await source.getFileHistory(await source.resolveBranch("main"), "schema.json");
        assert.ok(!main.includes(uplift));
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

/**
 * Replace fetch by an implementation of the GitHub API's file history
 * (/commits?sha=&path=), answered with plain git log of a local repository,
 * which follows the same parents at merges.
 *
 * @param {function} git - Runs git in the local repository.
 * @param {string[]} requests - Receives the requested URLs.
 * @returns {function} restores fetch
 */
function mockHistoryApi(git, requests) {
    const realFetch = globalThis.fetch;
    globalThis.fetch = async url => {
        requests.push(url);
        const query = new URL(url).searchParams;
        const size = Number(query.get("per_page"));
        const page = Number(query.get("page"));
        const log = (await git("rev-list", query.get("sha"), "--", query.get("path"))).split("\n").filter(Boolean);
        const body = log.slice((page - 1) * size, page * size).map(sha => ({ sha }));
        return new Response(JSON.stringify(body), { status: 200 });
    };
    return () => {
        globalThis.fetch = realFetch;
    };
}

test("the file history of a GitHub repository includes lines merged in from outside of main", async () => {
    const dir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "sources-"));
    const repo = pathUtils.join(dir, "repo");
    await fs.mkdir(repo);
    setDownloadCacheFile(pathUtils.join(dir, "cache.json"));
    const requests = [];
    let restoreFetch = () => {};
    try {
        const { git, uplift, landing } = await createReleaseRepository(repo);
        // Allow the treeless clone of the commit graph from the local repository.
        await git("config", "uploadpack.allowFilter", "true");
        restoreFetch = mockHistoryApi(git, requests);

        const graph = await CommitGraph.open(`file://${repo}`, pathUtils.join(dir, "graph.git"));
        const source = new GitHubSource("example/repo", { graph });
        assert.deepEqual((await source.listBranches()).sort(), ["main", "promote", "release"]);
        const release = await source.resolveBranch("release");
        assert.equal(release, await git("rev-parse", "release"));

        const history = await source.getFileHistory(release, "schema.json");
        assert.ok(history.includes(uplift));
        assert.ok(history.includes(landing));

        // Opening the commit graph again updates the existing clone.
        await CommitGraph.open(`file://${repo}`, pathUtils.join(dir, "graph.git"));
        assert.equal(await graph.resolveBranch("release"), release);
    } finally {
        restoreFetch();
        setDownloadCacheFile(undefined);
        await fs.rm(dir, { recursive: true, force: true });
    }
});

test("file histories are cached, and a request stops at the first known commit", async () => {
    const dir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "cache-"));
    setDownloadCacheFile(pathUtils.join(dir, "cache.json"));
    const git = async (...args) => (await execFileAsync("git", [
        "-C", dir, "-c", "user.name=Test", "-c", "user.email=test@example.com", ...args,
    ])).stdout.trim();
    const requests = [];
    let restoreFetch = () => {};
    try {
        // A linear history with five changes of the file.
        await git("init", "--quiet", "--initial-branch=main");
        const commits = [];
        for (let i = 1; i <= 5; i++) {
            await fs.writeFile(pathUtils.join(dir, "schema.json"), `${i}\n`);
            await git("add", "schema.json");
            await git("commit", "--quiet", "-m", `change ${i}`);
            commits.push(await git("rev-parse", "HEAD"));
        }
        restoreFetch = mockHistoryApi(git, requests);

        const source = new GitHubSource("example/repo");
        assert.deepEqual(await source.getFileHistory(commits[2], "schema.json"), commits.slice(0, 3).reverse());
        assert.equal(requests.length, 1);

        // From the head: the history continues with a known commit, the rest
        // comes from the cache.
        assert.deepEqual(await source.getFileHistory(commits[4], "schema.json"), [...commits].reverse());
        assert.equal(requests.length, 2);

        // Cached, also for a new source.
        assert.deepEqual(await new GitHubSource("example/repo").getFileHistory(commits[4], "schema.json"), [...commits].reverse());
        assert.equal(requests.length, 2);
    } finally {
        restoreFetch();
        setDownloadCacheFile(undefined);
        await fs.rm(dir, { recursive: true, force: true });
    }
});
