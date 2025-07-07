
import commentJson from "comment-json";

import { HG_URL, SOURCE_PATH_POLICIES_SCHEMA_JSON, SOURCE_PATH_VERSION_TXT } from "./constants.mjs";
import { readCachedUrl } from "./tools.mjs";

/**
 * @typedef {Object} PolicySchemaData
 * @property {string} version - The version string belonging to this schema data
 *    (e.g., "91.0", "92.0a1").
 * @property {string} revision - The mercurial changeset identifier belonging to
 *    this schema data.
 * @property {Object} properties - The properties object belonging to this schema
 *    data (directly taken from the downloaded policy schema file).
 *
 * @example
 * {
 *   version: "91.0",
 *   revision: "656d54876405369eba969d43385aaca5511315a8"
 *   properties: {
 *     "SomePolicy": {
 *       type: "boolean",
 *       description: "Enables some behavior."
 *     },
 *     "AnotherPolicy": {
 *       type: "string",
 *       enum: ["one", "two"],
 *       description: "Choose one of the options."
 *     }
 *   }
 * }
 */

/**
 * @typedef {Object} PolicySchemaRevisions
 * @param {string} tree - The tree to process (e.g. "release", "central").
 * @property {{ revisions: PolicySchemaData[] }} comm - Thunderbird-specific policy schema revisions.
 * @property {{ revisions: PolicySchemaData[] }} mozilla - Upstream Mozilla policy schema revisions.
 * 
 * @example
 * {
 *   comm: {
 *     revisions: [
 *       {
 *         version: "91.0",
 *         revision: "656d54876405369eba969d43385aaca5511315a8",
 *         properties: {
 *            ...
 *         }
 *       },
 *       {
 *         version: "92.0a1",
 *         revision: "9137f00be7b39e1174c62796fb64626bbf37a1d0",
 *         properties: {
 *            ...
 *         }
 *       }
 *     ]
 *   },
 *   mozilla: {
 *     revisions: [
 *       {
 *         version: "92.0a1",
 *         revision: "a8c4670b6ef144a0f3b6851c2a9d4bbd44fc032a",
 *         properties: {
 *            ...
 *         }
 *       }
 *     ]
 *   }
 * }
 */

/**
 * @typedef {Object.<string, {
 *   [tree: string]: {
 *     min: string,
 *     max?: string
 *   },
 *   unsupported?: boolean
 * }>} CompatibilityData
 *
 * Represents compatibility information for policies.
 * 
 * - Keys are policy names (e.g., "Handlers", "DefaultBrowser").
 * - Values are objects that map version trees ("release", "central", etc.)
 *   to a `min` and optional `max` version, and may include an `unsupported` flag
 *   if the policy exists only in mozilla-central.
 *
 * Example:
 * {
 *   "SomePolicy": {
 *     release: { min: "78.0", max: "91.0" },
 *     esr128:  { min: "78.0" }
 *   },
 *   "OtherPolicy": {
 *     central: { min: "115.0" },
 *     unsupported: true
 *   }
 * }
 */

/**
 * @typedef {Object} PolicyCompatibilityEntry
 * @property {string} key - A string in the format "minVersion - maxVersion"
 * @property {string} first - The earliest Thunderbird version where the policy is supported
 * @property {string} last - The last version where the policy is supported
 * @property {string} firstLong - Human-readable version of `first`, with backport info if applicable
 * @property {string} lastLong - Human-readable version of `last`
 * @property {string[]} policies - A list of policy keys that share this compatibility range
 */

/** @type {CompatibilityData} */
export const gCompatibilityData = {};

/**
 * Compare version numbers, taken from https://jsfiddle.net/vanowm/p7uvtbor/.
 */
function compareVersion(a, b) {
    function prep(t) {
        return ("" + t)
            // Treat non-numerical characters as lower version.
            // Replacing them with a negative number based on charcode of first character.
            .replace(/[^0-9\.]+/g, function (c) { return "." + ((c = c.replace(/[\W_]+/, "")) ? c.toLowerCase().charCodeAt(0) - 65536 : "") + "." })
            // Remove trailing "." and "0" if followed by non-numerical characters (1.0.0b).
            .replace(/(?:\.0+)*(\.-[0-9]+)(\.[0-9]+)?\.*$/g, "$1$2")
            .split('.');
    }
    a = prep(a);
    b = prep(b);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        // Convert to integer the most efficient way.
        a[i] = ~~a[i];
        b[i] = ~~b[i];
        if (a[i] > b[i])
            return 1;
        else if (a[i] < b[i])
            return -1;
    }
    return 0;
}

/**
 * Extract a flat list of policy names found in a schema file. Hierarchy is
 * preserved by joining levels with "_".
 * 
 * @param {PolicySchemaData} data - Object returned by downloadPolicySchemaData(),
 *   or a nested property (function calls itself recursively).
 * @returns {string[]} keys defined in the schema
 */
function extractFlatPolicyNamesFromPolicySchema(data) {
    let properties = [];
    for (let key of ["properties", "patternProperties"]) {
        if (data[key]) {
            for (let [name, entry] of Object.entries(data[key])) {
                properties.push(name)
                let subs = extractFlatPolicyNamesFromPolicySchema(entry);
                if (subs.length > 0) properties.push(...subs.map(e => `${name}_${e}`))
            }
        }
    }
    return properties;
}

/**
 * Check for changes in the policy schema files between two revisions.
 * 
 * @param {PolicySchemaData} data1 - Object returned by downloadPolicySchemaData()
 * @param {PolicySchemaData} data2 - Object returned by downloadPolicySchemaData()
 * 
 * @returns {object} diff
 * @param {string[]} diff.added - flat hierarchy names of added entries
 * @param {string[]} diff.removed - flat hierarchy names of removed entries
 * @param {string[]} diff.changed - flat hierarchy names of changed entries
 */
export function getDifferencesBetweenPolicySchemas(data1, data2) {
    if (!data1?.properties || !data2?.properties)
        return;

    let keys1 = extractFlatPolicyNamesFromPolicySchema(data1);
    let keys2 = extractFlatPolicyNamesFromPolicySchema(data2);

    let added = keys2.filter(e => !keys1.includes(e));
    let removed = keys1.filter(e => !keys2.includes(e));

    let changed = keys2.filter(e => keys1.includes(e) && JSON.stringify(data2.properties[e]) != JSON.stringify(data1.properties[e]));

    return { added, removed, changed }
}

/**
 * Retrieves and groups Thunderbird policy compatibility information from the
 * local cache.
 *
 * This function filters and organizes entries from the global `gCompatibilityData`
 * object to determine when specific policies were introduced or became unsupported.
 * It handles backported features and optionally groups entries with identical
 * compatibility ranges.
 *
 * @param {boolean} distinct - If true, each policy is listed with its exact
 *    compatibility range. If false, policies sharing the same version range are
 *    grouped together.
 * @param {string} tree - The tree to process (e.g. "release", "central").
 * @param {string} [policyName] - (Optional) A specific policy name to filter
 *    results by. If provided, includes only that policy and any nested entries
 *    (e.g., `policy_subKey`). If omitted, processes all entries.
 *
 * @returns {PolicyCompatibilityEntry[]} An array of policy compatibility entries.
 */
export function getCachedCompatibilityInformation(distinct, tree, policyName) {
    // Get all entries found in gCompatibilityData which are related to policy.
    let entries = policyName
        ? Object.keys(gCompatibilityData).filter(k => k == policyName || k.startsWith(policyName + "_"))
        : Object.keys(gCompatibilityData)

    // Group filtered entries by identical compat data.
    let compatInfo = [];
    for (let entry of entries) {
        // Skip unsupported policy properties, if the root policy itself is not supported as well.
        let root = entry.split("_").shift();
        if (root != entry && gCompatibilityData[entry].unsupported && gCompatibilityData[root].unsupported) continue;

        // Generate the compatibility information. Primary information is the one from this tree, 
        // but if it was backported to one version prior (92.0a1 -> 91.0) only list the backported one.
        let first = "";
        let last = "";
        let firstLong = "";
        let lastLong = "";
        if (gCompatibilityData[entry][tree]) {
            if (gCompatibilityData[entry][tree].min) {
                let added = gCompatibilityData[entry][tree].min.replace(".0a1", ".0");
                let added_parts = added.split(".");
                let backported = Object.keys(gCompatibilityData[entry])
                    .filter(e => e != tree)
                    .filter(e => gCompatibilityData[entry][e].min != gCompatibilityData[entry][tree].min)
                    .map(e => gCompatibilityData[entry][e].min)
                    .pop();

                if (backported
                    && added_parts.length == 2
                    && added_parts[1] == "0"
                    && `${parseInt(added_parts[0], 10) - 1}.0` == backported
                ) {
                    firstLong = `Thunderbird ${backported}`;
                    first = `${backported}`;
                } else if (backported) {
                    firstLong = `Thunderbird ${added}<br>(Thunderbird ${backported})`;
                    first = `${backported}, ${added}`;
                } else {
                    firstLong = `Thunderbird ${added}`;
                    first = `${added}`;
                }
            }
            last = (gCompatibilityData[entry][tree].max || "").replace(".0a1", ".0");
            lastLong = `Thunderbird ${last}`;
        }

        let key = `${first} - ${last}`;
        let distinctEntry = compatInfo.find(e => e.key == key);
        if (!distinct || !distinctEntry) {
            compatInfo.push({
                key,
                first,
                last,
                firstLong,
                lastLong,
                policies: [entry],
            })
        } else {
            distinctEntry.policies.push(entry);
        }
    }
    return compatInfo;
}


/**
 * Create cache of policy compatibility information generated from the policy
 * schema files.
 *
 * This function processes a set of Thunderbird policy schema data to determine
 * the minimum and maximum Thunderbird versions in which each policy is supported,
 * and stores this information in the global `gCompatibilityData` object.
 *
 * It also identifies policies that are only supported upstream (in mozilla-central
 * but not in comm-central) and marks them as unsupported.
 *
 * @param {PolicySchemaRevisions} revisionsData - Object returned by
 *    getPolicySchemaRevisions().
 */
export function generateCompatibilityInformationCache(revisionsData) {
    let tree = revisionsData.tree;

    let absolute_max = 0;
    for (let revision of revisionsData.comm.revisions) {
        let policies = extractFlatPolicyNamesFromPolicySchema(revision);

        // Track the highest seen version, to suppress redundant max values that
        // simply mean “still supported.”
        if (compareVersion(revision.version, absolute_max) > 0) {
            absolute_max = revision.version;
        }

        for (let raw_policy of policies) {
            let policy = raw_policy.trim().replace(/'/g, "");
            if (!gCompatibilityData[policy]) {
                gCompatibilityData[policy] = {};
            }
            if (!gCompatibilityData[policy][tree]) {
                gCompatibilityData[policy][tree] = {};
            }
            let min = gCompatibilityData[policy][tree].min || 10000;
            let max = gCompatibilityData[policy][tree].max || 0;

            if (compareVersion(revision.version, min) < 0)
                gCompatibilityData[policy][tree].min = revision.version;
            if (compareVersion(revision.version, max) > 0)
                gCompatibilityData[policy][tree].max = revision.version;
        }
    }

    // If the last version a policy was seen is the latest known version,
    // max is removed — implying it's still supported and not deprecated.
    for (let policy of Object.keys(gCompatibilityData)) {
        if (gCompatibilityData[policy][tree]?.max == absolute_max)
            delete gCompatibilityData[policy][tree].max;
    }

    // Compare comm-central against mozilla-central and find policies not yet
    // supported by Thunderbird.
    if (tree == "central") {
        let policies = extractFlatPolicyNamesFromPolicySchema(revisionsData.mozilla.revisions[0]);
        for (let raw_policy of policies) {
            let policy = raw_policy.trim().replace(/'/g, "");
            if (!gCompatibilityData[policy]) {
                gCompatibilityData[policy] = {
                    unsupported: true
                };
            }
        }
    }
}

/**
 * Returns the download URL for the requested file from Mozillas mercurial instance.
 * 
 * @param {string} branch - "mozilla" or "comm"
 * @param {string} tree - The tree to process (e.g. "release", "central").
 * @param {string} revision - A mercurial changeset identifier.
 * @param {string} mode - Mercurial API access mode, supported modes are "log",
 *    "json-log" and "raw-file".
 * @param {string} fileName - Name of the file to fetch, supported names are
 *    "version.txt" and "policies-schema.json".
 * 
 * @returns {string} path to the downloaded file
 */
export function getHgDownloadUrl(branch, tree, revision, mode, fileName) {
    let folder = branch == "mozilla" ? "browser" : "mail"
    let path = tree == "central" ? `${branch}-${tree}` : `releases/${branch}-${tree}`

    let filePath = "";
    switch (fileName) {
        case "version.txt":
            filePath = SOURCE_PATH_VERSION_TXT;
            break;
        case "policies-schema.json":
            filePath = SOURCE_PATH_POLICIES_SCHEMA_JSON;
            break;
        default:
            throw new Error(`Unknown file: ${fileName}`)
    }

    let query = ""
    switch (mode) {
        case "raw-file":
        case "log":
            break;
        case "json-log":
            query = "?revcount=125"
            break;
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
    return `${HG_URL}/${path}/${mode}/${revision}/${folder}/${filePath}${query}`;
}

/**
 * Extract the exact version corresponding to the specified revision.
 * 
 * @param {string} branch - "mozilla" or "comm"
 * @param {string} tree - The tree to process (e.g. "release", "central").
 * @param {string} revision - A mercurial changeset identifier.
 * 
 * @returns {string} The version string belonging to this schema data
 *    (e.g., "91.0", "92.0a1").
 */
export async function getRevisionVersion(branch, tree, revision) {
    let versionUrl = getHgDownloadUrl(branch, tree, revision, "raw-file", "version.txt");
    let version = (await readCachedUrl(versionUrl, { temporary: revision == "tip" })).trim();
    return version;
}

/**
 * Download a specific policies-schema.json file and returns its schema data.
 * 
 * @param {string} branch - "mozilla" or "comm"
 * @param {string} tree - The tree to process (e.g. "release", "central").
 * @param {string} revision - A mercurial changeset identifier.
 * 
 * @returns {PolicySchemaData}
 */
async function downloadPolicySchemaData(branch, tree, revision) {
    let schemaUrl = getHgDownloadUrl(branch, tree, revision, "raw-file", "policies-schema.json");
    let data = commentJson.parse(await readCachedUrl(schemaUrl, { temporary: revision == "tip" }));
    
    data.version = await getRevisionVersion(branch, tree, revision);
    data.revision = revision;
    
    return data;
}

/**
 * Get the PolicySchemaRevisions for the requested tree and download any missing
 * schema file. For Thunderbird all schema files are downloaded (or pulled from
 * the cache), for Mozilla only the newest ("tip") schema file and the one
 * corresponding to the last known state ("mozillaReferencePolicyRevision") are
 * downloaded.
 * 
 * @param {string} tree - The tree to process (e.g. "release", "central").
 * @param {string} mozillaReferencePolicyRevision - The mercurial changeset
 *    identifier of the last known mozilla version of their policies.json in the
 *    specified tree.
 * 
 * @returns {PolicySchemaRevisions}
 */
export async function getPolicySchemaRevisions(tree, mozillaReferencePolicyRevision) {
    let data = {
        tree,
        comm: {
            revisions: []
        },
        mozilla: {
            revisions: []
        },
    };

    console.log(`Processing ${tree}`);

    for (let branch of ["mozilla", "comm"]) {
        let logUrl = getHgDownloadUrl(branch, tree, "tip", "json-log", "policies-schema.json");
        let revisions = commentJson.parse(await readCachedUrl(logUrl, { temporary: true })).entries.map(e => e.node);

        // For mozilla, we just need the newest and the reference revision.
        // For comm, we need all revisions to be able to extract compatibility information.
        let neededRevisions = branch == "mozilla"
            ? [revisions[0], mozillaReferencePolicyRevision]
            : revisions.slice(0, 30)


        for (let revision of neededRevisions) {
            let schemaData = await downloadPolicySchemaData(branch, tree, revision);
            data[branch].revisions.push(schemaData);
        }
    }
    return data;
}