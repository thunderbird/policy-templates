import fs from "node:fs/promises";

import { PERSISTENT_SCHEMA_CACHE_FILE } from "./constants.mjs";

// The cached values, read from PERSISTENT_SCHEMA_CACHE_FILE on first use.
let SCHEMA_CACHE = null;

/**
 * Error caused by invalid input (command line arguments, local repositories or
 * branches). Command line scripts exit with code 2 on these errors.
 */
export class InputError extends Error { }

/**
 * Error in the content of a policies.yaml file. Command line scripts exit with
 * code 2 on these errors, without printing the usage information.
 */
export class PolicyYamlError extends InputError { }

/**
 * Run the main function of a command line script. Invalid input exits the script
 * with code 2 and prints the usage information (except for errors in the
 * content of a policies.yaml file).
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
            if (!(ex instanceof PolicyYamlError)) {
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
 * Simple helper function to cache a value in SCHEMA_CACHE. Reading the same key
 * at a later time will retrieve the value from the cache.
 *
 * @param {string} key
 * @param {function} producer - async function returning the value (a string)
 *    for the given key, or null if there is none (which is not cached)
 *
 * @returns {string} the value
 */
export async function readCachedValue(key, producer) {
    if (!SCHEMA_CACHE) {
        try {
            const data = await fs.readFile(PERSISTENT_SCHEMA_CACHE_FILE, 'utf-8');
            SCHEMA_CACHE = new Map(JSON.parse(data));
        } catch (ex) {
            // Cache file does not yet exist.
            SCHEMA_CACHE = new Map();
        }
    }

    if (!SCHEMA_CACHE.has(key)) {
        const value = await producer();
        if (!value) {
            return null;
        };
        SCHEMA_CACHE.set(key, value);
        await writePrettyJSONFile(
            PERSISTENT_SCHEMA_CACHE_FILE,
            Array.from(SCHEMA_CACHE.entries())
        );
    }
    return SCHEMA_CACHE.get(key);
}

/**
 * Simple helper function to download a URL and cache its content in SCHEMA_CACHE.
 * Reading the same URL at a later time will retrieve the content from the cache.
 *
 * @param {string} url
 *
 * @returns {string} content of url
 */
export async function readCachedUrl(url) {
    return readCachedValue(url, () => request(url));
}
