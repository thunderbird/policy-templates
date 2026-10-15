// Tests of the code shared with webext-annotated-schemas-generator
// (modules/common/), see HISTORY.md. That repository has no test framework,
// so the shared code is tested here.

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import pathUtils from "node:path";
import { test } from "node:test";

import { BloblessClone, fetchSingleRevision } from "../modules/common/blobless_clone.mjs";
import { TreelessClone } from "../modules/common/treeless_clone.mjs";
import { getCachedValue, setCachedValues, setDownloadCacheFile } from "../modules/tools.mjs";
import { createReleaseRepository, gitIn, mockHistoryApi } from "./git_repositories.mjs";

/**
 * Run a test with the merge-day repository of createReleaseRepository() as
 * origin, a fresh download cache, and the GitHub API mocked with that
 * repository.
 */
async function withOrigin(fn) {
    const dir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "common-"));
    const origin = pathUtils.join(dir, "origin");
    await fs.mkdir(origin);
    setDownloadCacheFile(pathUtils.join(dir, "cache.json"));
    const requests = [];
    let restoreFetch = () => {};
    try {
        const repository = await createReleaseRepository(origin);
        restoreFetch = mockHistoryApi(repository.git, requests);
        await fn({ ...repository, url: `file://${origin}`, clone: pathUtils.join(dir, "clone.git"), requests });
    } finally {
        restoreFetch();
        setDownloadCacheFile(undefined);
        await fs.rm(dir, { recursive: true, force: true });
    }
}

/**
 * The two kinds of clones, opened the same way apart from the options of the
 * treeless clone. The treeless clone downloads files with readUrl(), here
 * answered from the origin repository.
 */
const KINDS = {
    BloblessClone: (url, dir) => BloblessClone.open(url, dir),
    TreelessClone: (url, dir) => TreelessClone.open(url, dir, {
        repository: "example/repo",
        cache: { get: getCachedValue, set: setCachedValues },
        readUrl: async rawUrl => {
            const [, commit, ...path] = new URL(rawUrl).pathname.split("/").slice(2);
            try {
                return await gitIn(new URL(url).pathname)("show", `${commit}:${path.join("/")}`);
            } catch {
                return null;
            }
        },
    }),
};

// A file inside the clone: it survives an update, but not a new clone.
const MARKER = "marker";
const hasMarker = clone => fs.access(pathUtils.join(clone, MARKER)).then(() => true, () => false);

for (const [kind, open] of Object.entries(KINDS)) {
    test(`${kind}: a valid clone is updated`, async () => {
        await withOrigin(async ({ git, url, clone }) => {
            await open(url, clone);
            await fs.writeFile(pathUtils.join(clone, MARKER), "");
            await git("commit", "--quiet", "--allow-empty", "-m", "new");

            const source = await open(url, clone);
            assert.ok(await hasMarker(clone));
            assert.equal(await source.resolveBranch("main"), await git("rev-parse", "main"));
        });
    });

    test(`${kind}: a missing, broken or foreign clone is cloned again`, async () => {
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
                "a clone of another repository": () =>
                    gitIn(clone)("remote", "set-url", "origin", "https://example.org/other.git"),
                "a clone whose update fails": () =>
                    gitIn(clone)("config", "remote.origin.fetch", "+refs/heads/*:invalid refspec"),
            };
            for (const [name, breakClone] of Object.entries(breakages)) {
                await open(url, clone);
                await breakClone();
                await fs.writeFile(pathUtils.join(clone, MARKER), "");

                const source = await open(url, clone);
                assert.ok(!await hasMarker(clone), `${name}: cloned again`);
                assert.equal(await source.resolveBranch("main"), head, `${name}: usable`);
            }
            await fs.rm(clone, { recursive: true });
            assert.equal(await (await open(url, clone)).resolveBranch("main"), head);
        });
    });

    test(`${kind}: the history includes lines merged in from outside of main`, async () => {
        await withOrigin(async ({ git, url, clone, uplift, landing }) => {
            // Plain git log does not walk the merged in 91 line.
            assert.ok(!(await git("rev-list", "release", "--", "schema.json")).includes(uplift));

            const source = await open(url, clone);
            assert.deepEqual((await source.listBranches()).sort(), ["main", "promote", "release"]);
            const release = await source.resolveBranch("release");
            for (const refs of [release, ["refs/heads/release"]]) {
                const history = await source.getFileHistory(refs, "schema.json");
                assert.ok(history.includes(uplift), `${refs}: uplift`);
                assert.ok(history.includes(landing), `${refs}: landing`);
            }
            await source.prefetchHistory(["refs/heads/release"], ["schema.json", "version.txt"]);
            assert.equal((await source.readFile(uplift, "version.txt")).trim(), "91.0");
            assert.equal(await source.readFile(uplift, "missing.json"), null);
            assert.deepEqual(await source.listFiles(release, "."), ["schema.json", "version.txt"]);
            source.close();
        });
    });
}

test("BloblessClone: refs which are not updated by open() are fetched once", async () => {
    await withOrigin(async ({ git, url, clone, uplift }) => {
        await git("tag", "OLD_RELEASE", uplift);
        const source = await BloblessClone.open(url, clone);
        assert.equal(await source.resolveRef("refs/tags/OLD_RELEASE"), null);
        await source.fetchRefs(["refs/tags/OLD_RELEASE"]);
        assert.equal(await source.resolveRef("refs/tags/OLD_RELEASE"), uplift);
        source.close();
    });
});

test("TreelessClone: histories are cached, a request stops at the first known commit", async () => {
    await withOrigin(async ({ git, url, clone, requests }) => {
        // Four more changes of the file on main.
        const repo = new URL(url).pathname;
        const commits = [];
        for (let i = 1; i <= 4; i++) {
            await fs.writeFile(pathUtils.join(repo, "schema.json"), `${i}\n`);
            await git("commit", "--quiet", "-am", `change ${i}`);
            commits.push(await git("rev-parse", "HEAD"));
        }
        const source = await KINDS.TreelessClone(url, clone);
        const before = await source.getFileHistory(commits[1], "schema.json");
        assert.equal(requests.length, 1);

        // From the head: the history continues with a known commit, the rest
        // comes from the cache.
        const head = await source.getFileHistory(commits[3], "schema.json");
        assert.deepEqual(head, [commits[3], commits[2], ...before]);
        assert.equal(requests.length, 2);

        // Cached, also for a new clone object.
        assert.deepEqual(await (await KINDS.TreelessClone(url, clone)).getFileHistory(commits[3], "schema.json"), head);
        assert.equal(requests.length, 2);
    });
});

test("fetchSingleRevision: a single commit is fetched, its files are read on demand", async () => {
    await withOrigin(async ({ url, clone, uplift }) => {
        const { source, commit } = await fetchSingleRevision(url, "release", clone);
        assert.notEqual(commit, uplift);
        assert.deepEqual(await source.listFiles(commit, "."), ["schema.json", "version.txt"]);
        await source.prefetchFiles(commit, ["schema.json"]);
        assert.equal((await source.readFile(commit, "version.txt")).trim(), "92.0a1");
        source.close();
    });
});
