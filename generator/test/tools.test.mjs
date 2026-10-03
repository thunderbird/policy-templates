import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import pathUtils from "node:path";
import { test } from "node:test";

import { readRevalidatedUrl, setDownloadCacheFile } from "../modules/tools.mjs";

const URL = "https://example.org/file.json";

/**
 * Run a test with a fresh cache file and a stubbed fetch(), which answers
 * with the next of the given responses and records the request headers.
 */
async function withServer(responses, fn) {
    const dir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), "cache-"));
    const realFetch = globalThis.fetch;
    const requests = [];
    setDownloadCacheFile(pathUtils.join(dir, "cache.json"));
    globalThis.fetch = async (url, options) => {
        requests.push(options?.headers ?? {});
        const next = responses.shift();
        if (next instanceof Error) {
            throw next;
        }
        return next;
    };
    try {
        await fn(requests);
    } finally {
        globalThis.fetch = realFetch;
        setDownloadCacheFile(undefined);
        await fs.rm(dir, { recursive: true });
    }
}

test("a revalidated URL is stored, and a 304 returns the cached content", async () => {
    await withServer([
        new Response("v1", { status: 200, headers: { ETag: '"1"', "Last-Modified": "Mon, 01 Jan 2026 00:00:00 GMT" } }),
        new Response(null, { status: 304 }),
        new Response("v2", { status: 200, headers: { ETag: '"2"' } }),
    ], async requests => {
        assert.equal(await readRevalidatedUrl(URL), "v1");
        assert.deepEqual(requests[0], {});
        assert.equal(await readRevalidatedUrl(URL), "v1");
        assert.deepEqual(requests[1], { "If-None-Match": '"1"', "If-Modified-Since": "Mon, 01 Jan 2026 00:00:00 GMT" });
        assert.equal(await readRevalidatedUrl(URL), "v2");
    });
});

test("without validators the fresh content is used, and offline the cached one", async () => {
    const offline = Array.from({ length: 5 }, () => new Error("offline"));
    await withServer([
        new Response("v1", { status: 200 }),
        new Response("v2", { status: 200 }),
        ...offline,
    ], async requests => {
        assert.equal(await readRevalidatedUrl(URL), "v1");
        assert.equal(await readRevalidatedUrl(URL), "v2");
        assert.deepEqual(requests[1], {});
        assert.equal(await readRevalidatedUrl(URL), "v2");
    });
});

test("a 404 is null, and offline without a cached content is an error", async () => {
    await withServer([
        new Response("", { status: 404 }),
        ...Array.from({ length: 5 }, () => new Error("offline")),
    ], async () => {
        assert.equal(await readRevalidatedUrl(URL), null);
        await assert.rejects(readRevalidatedUrl(URL), /could not be downloaded/);
    });
});
