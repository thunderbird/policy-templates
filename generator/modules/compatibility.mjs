
import commentJson from "comment-json";

import {
    THUNDERBIRD_POLICIES_SCHEMA_PATH, THUNDERBIRD_VERSION_PATH
} from "./constants.mjs";

/**
 * @typedef {Object} PolicySchemaData
 * @property {string} version - The version string belonging to this schema data
 *    (e.g., "91.0", "92.0a1").
 * @property {string} revision - The git commit belonging to this schema data.
 * @property {Object} properties - The properties object belonging to this schema
 *    data (directly taken from the policy schema file).
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
 * @typedef {Object.<string, {
 *   min?: string,
 *   max?: string,
 *   supportedSince?: string,
 *   unsupported?: boolean
 * }>} CompatibilityData
 *
 * Represents compatibility information for the policies of a single branch.
 *
 * - Keys are policy names (e.g., "Handlers", "DefaultBrowser").
 * - Values define the `min` and optional `max` version of the policy and the
 *   formatted `supportedSince` version (see addSupportedSince()), or the
 *   `unsupported` flag if the policy is only supported by Firefox.
 *
 * Example:
 * {
 *   "SomePolicy": { min: "136.0a1", supportedSince: "136.0, 128.8.0esr" },
 *   "OtherPolicy": { unsupported: true }
 * }
 */

/**
 * @typedef {Object} PolicyCompatibilityEntry
 * @property {string} key - A string in the format "minVersion - maxVersion"
 * @property {string} first - The earliest Thunderbird version where the policy is supported
 * @property {string} last - The last version where the policy is supported
 * @property {string[]} policies - A list of policy keys that share this compatibility range
 */

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
 * @param {PolicySchemaData} data - Object returned by getSchemaRevisions(),
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

// Revisions already read, keyed by source and commit. Every generated branch
// needs the history of the release and ESR branches as well.
const SCHEMA_REVISIONS_CACHE = new Map();

/**
 * Get all revisions of Thunderbird's policy schema file in the history of the
 * given commit, newest first.
 *
 * @param {LocalGitSource|GitHubSource} source - The Thunderbird source.
 * @param {string} commit - The commit to read the history from.
 *
 * @returns {Promise<PolicySchemaData[]>}
 */
export function getSchemaRevisions(source, commit) {
    const key = `${source.description}:${commit}`;
    if (!SCHEMA_REVISIONS_CACHE.has(key)) {
        SCHEMA_REVISIONS_CACHE.set(key, readSchemaRevisions(source, commit));
    }
    return SCHEMA_REVISIONS_CACHE.get(key);
}

async function readSchemaRevisions(source, commit) {
    let revisions = [];
    for (let revision of await source.getFileHistory(commit, THUNDERBIRD_POLICIES_SCHEMA_PATH)) {
        let data = commentJson.parse(await source.readFile(revision, THUNDERBIRD_POLICIES_SCHEMA_PATH));
        data.version = (await source.readFile(revision, THUNDERBIRD_VERSION_PATH)).trim();
        data.revision = revision;
        revisions.push(data);
    }
    return revisions;
}

/**
 * Normalize a version for display and comparison: the version of a Daily build
 * is shown as the version of the release it becomes ("92.0a1" -> "92.0").
 *
 * @param {string} version
 * @returns {string}
 */
function normalizeVersion(version) {
    return version.replace(".0a1", ".0");
}

/**
 * Build the compatibility data of a single branch from the revisions of its
 * policy schema file.
 *
 * This function determines the minimum and maximum Thunderbird versions in
 * which each policy is supported.
 *
 * @param {PolicySchemaData[]} revisions - Array returned by getSchemaRevisions().
 *
 * @returns {CompatibilityData}
 */
export function buildCompatibilityData(revisions) {
    let compatData = {};

    let absolute_max = 0;
    for (let revision of revisions) {
        let policies = extractFlatPolicyNamesFromPolicySchema(revision);

        // Track the highest seen version, to suppress redundant max values that
        // simply mean “still supported.”
        if (compareVersion(revision.version, absolute_max) > 0) {
            absolute_max = revision.version;
        }

        for (let raw_policy of policies) {
            let policy = raw_policy.trim().replace(/'/g, "");
            if (!compatData[policy]) {
                compatData[policy] = {};
            }
            let min = compatData[policy].min || 10000;
            let max = compatData[policy].max || 0;

            if (compareVersion(revision.version, min) < 0)
                compatData[policy].min = revision.version;
            if (compareVersion(revision.version, max) > 0)
                compatData[policy].max = revision.version;
        }
    }

    // If the last version a policy was seen is the latest known version,
    // max is removed — implying it's still supported and not deprecated.
    for (let policy of Object.keys(compatData)) {
        if (compatData[policy].max == absolute_max)
            delete compatData[policy].max;
    }

    return compatData;
}

/**
 * Add the formatted version in which each policy became supported
 * (`supportedSince`) to the compatibility data of a branch.
 *
 * The base version is the version of the release branch, or the version of the
 * given branch, if the policy is not yet part of the release branch. If a
 * policy was backported to an ESR, the ESR version is added:
 * - for ESR branches, if the branch's own version differs from the base version
 * - for all other branches, from the first ESR branch with a version which
 *   differs from the base version
 *
 * @param {CompatibilityData} compatData - Object returned by buildCompatibilityData().
 * @param {Object} options
 * @param {string} options.branch - The branch of compatData, e.g. "main" or "esr153".
 * @param {CompatibilityData|null} options.release - The compatibility data of
 *    the release branch.
 * @param {{branch: string, data: CompatibilityData}[]} options.esrs - The
 *    compatibility data of all ESR branches, sorted by version.
 */
export function addSupportedSince(compatData, { branch, release, esrs }) {
    const isEsrBranch = /^esr\d+$/.test(branch);
    for (let [policy, entry] of Object.entries(compatData)) {
        let releaseVersion = release?.[policy]?.min;
        let base = normalizeVersion(releaseVersion ?? entry.min);

        if (isEsrBranch) {
            let own = normalizeVersion(entry.min);
            entry.supportedSince = !releaseVersion
                ? `${own}esr`
                : own == base ? base : `${base}, ${own}esr`;
        } else {
            let esr = esrs
                .map(e => e.data[policy]?.min)
                .filter(Boolean)
                .map(normalizeVersion)
                .find(v => v != base);
            entry.supportedSince = esr ? `${base}, ${esr}esr` : base;
        }
    }
}

/**
 * Add the policies of Firefox's policy schema, which are not supported by
 * Thunderbird, to the given compatibility data.
 *
 * @param {CompatibilityData} compatData - Object returned by buildCompatibilityData().
 * @param {Object} firefoxSchema - Firefox's policy schema.
 *
 * @returns {CompatibilityData} a new object including the unsupported policies
 */
export function addUnsupportedPolicies(compatData, firefoxSchema) {
    let rv = { ...compatData };
    for (let raw_policy of extractFlatPolicyNamesFromPolicySchema(firefoxSchema)) {
        let policy = raw_policy.trim().replace(/'/g, "");
        if (!rv[policy]) {
            rv[policy] = {
                unsupported: true
            };
        }
    }
    return rv;
}

/**
 * Retrieves and groups policy compatibility information.
 *
 * This function organizes entries of the given compatibility data to determine
 * when specific policies were introduced or became unsupported. It optionally
 * groups entries with identical compatibility ranges.
 *
 * @param {CompatibilityData} compatData - Object returned by buildCompatibilityData().
 * @param {Object} options
 * @param {boolean} options.distinct - If true, policies sharing the same version
 *    range are grouped together. If false, each policy is listed on its own.
 * @param {string} [options.policyName] - (Optional) A specific policy name to
 *    filter results by. If provided, includes only that policy and any nested
 *    entries (e.g., `policy_subKey`). If omitted, processes all entries.
 *
 * @returns {PolicyCompatibilityEntry[]} An array of policy compatibility entries.
 */
export function getCompatibilityInformation(compatData, { distinct, policyName }) {
    // Get all entries found in compatData which are related to policy.
    let entries = policyName
        ? Object.keys(compatData).filter(k => k == policyName || k.startsWith(policyName + "_"))
        : Object.keys(compatData)

    // Group filtered entries by identical compat data.
    let compatInfo = [];
    for (let entry of entries) {
        // Skip unsupported policy properties, if the root policy itself is not supported as well.
        let root = entry.split("_").shift();
        if (root != entry && compatData[entry].unsupported && compatData[root]?.unsupported) continue;

        let first = "";
        let last = "";
        if (compatData[entry].supportedSince) {
            first = compatData[entry].supportedSince;
        }
        if (!compatData[entry].unsupported) {
            last = compatData[entry].max ? normalizeVersion(compatData[entry].max) : "";
        }

        let key = `${first} - ${last}`;
        let distinctEntry = compatInfo.find(e => e.key == key);
        if (!distinct || !distinctEntry) {
            compatInfo.push({
                key,
                first,
                last,
                policies: [entry],
            })
        } else {
            distinctEntry.policies.push(entry);
        }
    }
    return compatInfo;
}
