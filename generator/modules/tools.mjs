import bent from "bent";
import fs from "node:fs/promises";
import https from "https";

import { createWriteStream } from "node:fs";

const requestText = bent("GET", "string", 200);

// Debug logging (0 - errors and basic logs only, 1 - verbose debug)
const DEBUG_LEVEL = 0;

function debug(...args) {
    if (DEBUG_LEVEL > 0) {
        console.debug(...args);
    }
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
 * bent based request variant with hard timeout on client side.
 * 
 * @param {string} url - url to GET
 * @returns - text content
 */
export async function request(url) {
    debug(" -> ", url);
    // Retry on error, using a hard timeout enforced from the client side.
    let rv;
    for (let i = 0; (!rv && i < 5); i++) {
        if (i > 0) {
            console.error("Retry", i);
        }
        // Rate limit the first request already, otherwise hg.mozilla.org will block us.
        await new Promise(resolve => setTimeout(resolve, 2500));

        let killTimer;
        let killSwitch = new Promise((resolve, reject) => { killTimer = setTimeout(reject, 15000, "HardTimeout"); })
        rv = await Promise
            .race([requestText(url), killSwitch])
            .catch(err => {
                console.error('Error in  request', err);
                return null;
            });

        // node will continue to "wait" after the script finished, if we do not
        // clear the timeouts.
        clearTimeout(killTimer);
    }
    return rv;
}

/**
 * Simple helper function to download a URL and store its content on the user's
 * disc.
 *
 * @param {string} url - The URL to download.
 * @param {string} filePath - The path to write the downloaded file to.
 */
export async function downloadUrl(url, filePath) {
    console.log(` - downloading ${url} ...`);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return new Promise((resolve, reject) => {
        const file = createWriteStream(filePath);
        https
            .get(url, (response) => {
                response.pipe(file);
                file.on("finish", () => {
                    file.close(() => {
                        resolve(filePath);
                    });
                });
            })
            .on("error", (err) => {
                reject(err);
            });
    });
}

/**
 * Simple helper function to download a URL and return its content.
 *
 * @param {string} url
 * @returns {string} content
 */
export async function readUrl(url) {
    console.log(` - downloading ${url}`);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return requestText(url);
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
 * Simple helper function to parse command line arguments.
 *
 * @returns {object} command line arguments and their values
 */
export function parseArgs(argv = process.argv.slice(2)) {
    const args = {};
    for (const arg of argv) {
        if (arg.startsWith("--")) {
            const [key, value] = arg.slice(2).split("=");
            if (!value) {
                args[key] = true;
            } else {
                args[key] = value.toLowerCase();
            }
        }
    }
    return args;
}