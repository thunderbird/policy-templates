import bent from "bent";
import fs from "node:fs/promises";
import https from "https";
import { createWriteStream } from "node:fs";
import { parse } from "comment-json";

import { BUILD_HUB_URL } from "./constants.mjs";

const requestJson = bent('GET', 'json', 200);
const requestText = bent("GET", "string", 200);

// Debug logging (0 - errors and basic logs only, 1 - verbose debug)
const DEBUG_LEVEL = 0;

function debug(...args) {
    if (DEBUG_LEVEL > 0) {
        console.debug(...args);
    }
}

function filterUniqueEntries(arr) {
    return arr.reduce((acc, item) => {
        if (!acc.includes(item)) {
            acc.push(item);
        }
        return acc;
    }, []);
}

export async function getThunderbirdEsrVersions() {
    let { releases } = await requestJson("https://product-details.mozilla.org/1.0/thunderbird.json")
    let ESR_VERSIONS = Object.entries(releases)
        .filter(([name, value]) => name.endsWith("esr"))
        .map(([name, value]) => Number(value.version.split(".")[0]))
        .filter(v => v > 60);
    // ESR releases stopped after 38.* and resumed with 115.*, hardcode the
    // values in between.
    ESR_VERSIONS.push(45, 52, 60, 68, 78, 91, 102);
    return filterUniqueEntries(ESR_VERSIONS).sort((a, b) => a - b);
}

/**
 * Query BUILD_HUB_URL to get the first revision for a given release.
 *
 * @param {string} branch - "mozilla" or "comm"
 * @param {string} tree - for example "central", "esr91", "esr128", ...
 * @param {string} versionMatch - a string which is matched against the target
 *    version, for example "115.*"
 *
 * @returns {string} revision/changeset
 */
export async function getFirstRevisionFromBuildHub(branch, tree, versionMatch) {
    try {
        const postData = JSON.stringify({
            size: 1,
            query: {
                bool: {
                    must: [
                        { term: { "source.tree": `${branch}-${tree}` } },
                        { wildcard: { "target.version": versionMatch } },
                    ]
                }
            },
            sort: [{ "download.date": { order: "asc" } }],
        });

        const options = {
            hostname: BUILD_HUB_URL,
            port: 443,
            path: "/api/search",
            method: "POST",
        };

        // Create the HTTP request.
        const task = Promise.withResolvers();
        const req = https.request(options, (res) => {
            let responseData = "";

            // A chunk of data has been received.
            res.on("data", (chunk) => {
                responseData += chunk;
            });

            // The whole response has been received.
            res.on("end", () => {
                task.resolve(responseData);
            });
        });

        // Handle errors.
        req.on("error", (error) => {
            task.reject(error.message);
        });

        // Send the POST data.
        req.write(postData);
        req.end();

        let data = parse(await task.promise);
        return data.hits.hits[0]._source.source.revision;
    } catch (ex) {
        console.error(ex);
        throw new Error(`Failed to retrieve revision from ${BUILD_HUB_URL}`);
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