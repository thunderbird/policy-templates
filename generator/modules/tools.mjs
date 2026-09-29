import fs from "node:fs/promises";

import {
    PERSISTENT_SCHEMA_CACHE_FILE, TEMPORARY_SCHEMA_CACHE_FILE
} from "./constants.mjs";

// The temporary cache is still written to disc, but can be easily cleared
// without interfering with the persistent cache.
const SCHEMA_CACHE = {};

// Debug logging (0 - errors and basic logs only, 1 - verbose debug)
const DEBUG_LEVEL = 0;

function debug(...args) {
    if (DEBUG_LEVEL > 0) {
        console.debug(...args);
    }
}

/**
 * Error caused by invalid input (command line arguments, local repositories or
 * branches). Command line scripts exit with code 2 on these errors.
 */
export class InputError extends Error { }

/**
 * Run the main function of a command line script. Invalid input exits the script
 * with code 2 and prints the usage information.
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
            console.error(usage);
            process.exit(2);
        }
        throw ex;
    }
}

/**
 * Returns a new object with the same key-value pairs as the input object,
 * but with keys sorted in ascending alphabetical order.
 *
 * @param {Object} obj - The input object to sort.
 * @returns {Object} A new object with keys sorted alphabetically.
 */
export function sortObjectByKeys(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((sorted, key) => {
            sorted[key] = obj[key];
            return sorted;
        }, {});
}

/**
 * Asynchronously checks whether a given file or directory exists.
 *
 * @param {string} path - The path to the file or directory to check.
 * @returns {Promise<boolean>} - Resolves to `true` if the path exists,
 *    otherwise `false`.
 */
export async function fileExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
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
 * Simple helper function save an array of strings to a file.
 *
 * @param {string} filePath - The path to write the JSON to.
 * @param {string[]} arr - The array of strings to write into the file.
 */
export async function writeArrayOfStringsToFile(filePath, arr) {
    try {
        return await fs.writeFile(filePath, arr.join("\n"));
    } catch (err) {
        console.error("Error in writeArrayOfStringsToFile()", filePath, err);
        throw err;
    }
}

/**
 * Simple helper function to download a URL and cache its content in SCHEMA_CACHE.
 * Reading the same URL at a later time will retrieve the content from the cache.
 *
 * @param {string} url
 * @param {boolean} temporary - if the temporary cache is used, which is stored
 *    in a separate file and can be easily cleared independently of the persistent
 *    cache
 *
 * @returns {string} content of url
 */
export async function readCachedUrl(url, options) {
    const temporary = options?.temporary ?? false;
    const cache = temporary
        ? { type: 'temporary', file: TEMPORARY_SCHEMA_CACHE_FILE }
        : { type: 'persistent', file: PERSISTENT_SCHEMA_CACHE_FILE };

    if (!SCHEMA_CACHE[cache.type]) {
        try {
            const data = await fs.readFile(cache.file, 'utf-8');
            SCHEMA_CACHE[cache.type] = new Map(JSON.parse(data));
        } catch (ex) {
            // Cache file does not yet exist.
            SCHEMA_CACHE[cache.type] = new Map();
        }
    }

    if (!SCHEMA_CACHE[cache.type].has(url)) {
        const rev = await request(url);
        if (!rev) {
            return null;
        };
        SCHEMA_CACHE[cache.type].set(url, rev);
        await writePrettyJSONFile(
            cache.file,
            Array.from(SCHEMA_CACHE[cache.type].entries())
        );
    }
    return SCHEMA_CACHE[cache.type].get(url);
}