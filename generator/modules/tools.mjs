import fs from "node:fs/promises";

import { DOWNLOAD_CACHE_FILE } from "./constants.mjs";

// The cached values, read from the cache file on first use.
let DOWNLOAD_CACHE = null;
let downloadCacheFile = DOWNLOAD_CACHE_FILE;

/**
 * Use another cache file, e.g. in tests. The cache is read again from it on
 * the next use.
 *
 * @param {?string} path - The file, or nothing for the default one.
 */
export function setDownloadCacheFile(path) {
    downloadCacheFile = path ?? DOWNLOAD_CACHE_FILE;
    DOWNLOAD_CACHE = null;
}

/**
 * Error caused by invalid input (command line arguments, local repositories or
 * branches). Command line scripts exit with code 2 on these errors.
 */
export class InputError extends Error { }

/**
 * Error in the content of the inputs (e.g. the documentation in the policy
 * schema). Command line scripts exit with code 2 on these
 * errors, without printing the usage information.
 */
export class ContentError extends InputError { }

/**
 * Run the main function of a command line script. Invalid input exits the script
 * with code 2 and prints the usage information (except for errors in the
 * content of the inputs, see ContentError).
 *
 * @param {string} usage - The usage information of the script.
 * @param {function} main - The async main function of the script.
 */
export async function runCommandLine(usage, main) {
    try {
        await main();
    } catch (ex) {
        if (ex instanceof InputError || ex.code?.startsWith("ERR_PARSE_ARGS")) {
            console.error(`Error: ${ex.message}`);
            if (!(ex instanceof ContentError)) {
                console.error(usage);
            }
            process.exit(2);
        }
        throw ex;
    }
}

/**
 * Asynchronously ensures that the specified directory exists. If the directory
 * structure does not exist, it is created recursively.
 *
 * @param {string} path - The path to the directory to ensure.
 * @returns {Promise<void>} Resolves when the directory has been created or
 *    already exists.
 */
export async function ensureDir(path) {
    return fs.mkdir(path, { recursive: true });
}

/**
 * fetch based request variant with hard timeout on client side.
 * 
 * @param {string} url - url to GET
 * @returns - text content, or null if the url does not exist or could not be
 *    downloaded
 */
export async function request(url) {
    console.log(` - downloading ${url}`);
    // Retry on error, using a hard timeout enforced from the client side.
    for (let i = 0; i < 5; i++) {
        if (i > 0) {
            console.error("Retry", i);
        }
        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
            if (response.status == 404) {
                return null;
            }
            if (response.ok) {
                return await response.text();
            }
            console.error('Error in request', response.status, response.statusText);
        } catch (err) {
            console.error('Error in request', err);
        }
    }
    return null;
}

/**
 * Simple helper function to produce pretty JSON files.
 *
 * @param {string} filePath - The path to write the JSON to.
 * @param {obj} json - The obj to write into the file.
 */
export async function writePrettyJSONFile(filePath, json) {
    try {
        return await fs.writeFile(filePath, JSON.stringify(json, null, 2));
    } catch (err) {
        console.error("Error in writePrettyJSONFile()", filePath, err);
        throw err;
    }
}

/**
 * Simple helper function to cache a value in DOWNLOAD_CACHE. Reading the same key
 * at a later time will retrieve the value from the cache.
 *
 * @param {string} key
 * @param {function} producer - async function returning the value (a string)
 *    for the given key, or null if there is none (which is not cached)
 *
 * @returns {?string} the value, null if the producer has none
 */
export async function readCachedValue(key, producer) {
    await loadDownloadCache();
    if (!DOWNLOAD_CACHE.has(key)) {
        const value = await producer();
        if (!value) {
            return null;
        };
        DOWNLOAD_CACHE.set(key, value);
        await writeDownloadCache();
    }
    return DOWNLOAD_CACHE.get(key);
}

async function loadDownloadCache() {
    if (!DOWNLOAD_CACHE) {
        try {
            DOWNLOAD_CACHE = new Map(JSON.parse(await fs.readFile(downloadCacheFile, "utf-8")));
        } catch (ex) {
            // Cache file does not yet exist.
            DOWNLOAD_CACHE = new Map();
        }
    }
    return DOWNLOAD_CACHE;
}

async function writeDownloadCache() {
    await writePrettyJSONFile(downloadCacheFile, Array.from(DOWNLOAD_CACHE.entries()));
}

/**
 * Simple helper function to download a URL and cache its content in DOWNLOAD_CACHE.
 * Reading the same URL at a later time will retrieve the content from the cache.
 *
 * @param {string} url
 *
 * @returns {string} content of url
 */
export async function readCachedUrl(url) {
    return readCachedValue(url, () => request(url));
}

/**
 * Download a URL whose content may change (e.g. a file on a branch), with the
 * cache: the content is stored with its ETag / Last-Modified, and every call
 * asks the server conditionally whether it changed (304 Not Modified keeps the
 * cached content). A server without these headers sends the content each
 * time. If the server can't be reached, the cached content is used. Used for
 * the cachedFetch() of the product extensions.
 *
 * @param {string} url
 * @returns {Promise<?string>} the content, or null if the URL does not exist
 */
export async function readRevalidatedUrl(url) {
    const cache = await loadDownloadCache();
    const key = `revalidated:${url}`;
    const cached = cache.has(key) ? JSON.parse(cache.get(key)) : null;
    const headers = {};
    if (cached?.etag) {
        headers["If-None-Match"] = cached.etag;
    }
    if (cached?.lastModified) {
        headers["If-Modified-Since"] = cached.lastModified;
    }
    for (let i = 0; i < 5; i++) {
        try {
            const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
            if (response.status == 304 && cached) {
                return cached.text;
            }
            if (response.status == 404) {
                return null;
            }
            if (response.ok) {
                const text = await response.text();
                const entry = JSON.stringify({
                    text,
                    etag: response.headers.get("etag") ?? undefined,
                    lastModified: response.headers.get("last-modified") ?? undefined,
                });
                if (entry != cache.get(key)) {
                    console.log(` - downloaded ${url}`);
                    cache.set(key, entry);
                    await writeDownloadCache();
                }
                return text;
            }
            console.error("Error in request", url, response.status, response.statusText);
        } catch (err) {
            console.error("Error in request", url, err.message);
        }
    }
    if (cached) {
        console.warn(` - ${url} could not be downloaded, using the cached content`);
        return cached.text;
    }
    throw new Error(`${url} could not be downloaded.`);
}
