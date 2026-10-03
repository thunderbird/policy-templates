
import commentJson from "comment-json";

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
 *   supportedSince?: string
 * }>} CompatibilityData
 *
 * Represents compatibility information for the policies of a single branch.
 *
 * - Keys are policy names (e.g., "Handlers", "DefaultBrowser").
 * - Values define the `min` and optional `max` version of the policy and the
 *   formatted `supportedSince` version (see addSupportedSince()).
 *
 * Example:
 * {
 *   "SomePolicy": { min: "136.0a1", supportedSince: "136.0, 128.8.0esr" }
 * }
 */

/**
 * @typedef {Object} PolicyCompatibilityEntry
 * @property {string} key - A string in the format "minVersion - maxVersion"
 * @property {string} first - The earliest version where the policy is supported
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

// A pattern of patternProperties matching any name, optionally excluding some
// names, e.g. "^.*$", "^(?!\*$).*$" or "^(?!Add$|Delete$).*$".
export const CATCH_ALL_PATTERN = /^\^(\(\?!.*\))?\.\*\$$/;

// The name of a setting whose key is chosen when configuring the policy, like
// the device name in SecurityDevices.Add, matched by a CATCH_ALL_PATTERN.
export const OPEN_NAME = "[name]";

/**
 * Get the names of the settings matched by a pattern of patternProperties: a
 * pattern matching any name (CATCH_ALL_PATTERN) is OPEN_NAME, a pattern of
 * plain alternatives like "^(mimeTypes|extensions|schemes)$" is each of its
 * names (so each is documented and tracked on its own, e.g. when a name is
 * added later), any other pattern is used as it is.
 *
 * @param {string} pattern
 * @returns {string[]}
 */
export function getPatternNames(pattern) {
    return getPatternAlternatives(pattern) ?? (CATCH_ALL_PATTERN.test(pattern) ? [OPEN_NAME] : [pattern]);
}

/**
 * Get the label of the settings matched by a pattern of patternProperties, for
 * the Settings of the docs: OPEN_NAME for a pattern matching any name, the
 * names of a pattern of plain alternatives in parentheses, e.g.
 * "(mimeTypes|extensions|schemes)" (one setting, as the schema has one node
 * and one description for them), else the pattern itself.
 *
 * @param {string} pattern
 * @returns {string}
 */
export function getPatternLabel(pattern) {
    const alternatives = getPatternAlternatives(pattern);
    return alternatives ? `(${alternatives.join("|")})` : getPatternNames(pattern)[0];
}

/**
 * Get the names of a pattern of plain alternatives like "^(a|b|c)$".
 *
 * @param {string} pattern
 * @returns {?string[]} null for other patterns
 */
function getPatternAlternatives(pattern) {
    if (CATCH_ALL_PATTERN.test(pattern)) {
        return null;
    }
    const alternatives = pattern.match(/^\^\(([\w-]+(?:\|[\w-]+)*)\)\$$/);
    return alternatives ? alternatives[1].split("|") : null;
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
            for (let [pattern, entry] of Object.entries(data[key])) {
                // Patterns matching any name are refined over time by excluding
                // names (e.g. "^.*$" became "^(?!\*$).*$"), which does not
                // change the policy itself. Use a single canonical name for
                // them, "[name]", which is also used by the docs sections of
                // such a setting (e.g. "SecurityDevices_[name]").
                // A pattern of alternatives is split into its names, so a name
                // added later gets its own version.
                let names = key == "patternProperties" ? getPatternNames(pattern) : [pattern];
                let subs = extractFlatPolicyNamesFromPolicySchema(entry);
                for (let name of names) {
                    properties.push(name);
                    properties.push(...subs.map(e => `${name}_${e}`));
                }
            }
        }
    }
    return properties;
}

// Revisions already read, keyed by source and commit. Every generated branch
// needs the history of the release and ESR branches as well.
const SCHEMA_REVISIONS_CACHE = new Map();

/**
 * Get all revisions of the product's policy schema file in the history of the
 * given commit, newest first.
 *
 * @param {LocalGitSource|GitHubSource} source - The product's source.
 * @param {string} commit - The commit to read the history from.
 * @param {Object} paths - The paths of the files in the source, see the
 *    source of loadProduct().
 * @param {string} paths.schema
 * @param {string} paths.version
 *
 * @returns {Promise<PolicySchemaData[]>}
 */
export function getSchemaRevisions(source, commit, paths) {
    const key = `${source.description}:${commit}:${paths.schema}`;
    if (!SCHEMA_REVISIONS_CACHE.has(key)) {
        SCHEMA_REVISIONS_CACHE.set(key, readSchemaRevisions(source, commit, paths));
    }
    return SCHEMA_REVISIONS_CACHE.get(key);
}

async function readSchemaRevisions(source, commit, paths) {
    let revisions = [];
    for (let revision of await source.getFileHistory(commit, paths.schema)) {
        let data = commentJson.parse(await source.readFile(revision, paths.schema));
        data.version = (await source.readFile(revision, paths.version)).trim();
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
 * This function determines the minimum and maximum versions in
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
    // max is removed, implying it's still supported and not deprecated.
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
 * Retrieves and groups policy compatibility information.
 *
 * This function organizes entries of the given compatibility data to determine
 * when specific policies were introduced and removed. It optionally
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
        const first = compatData[entry].supportedSince ?? "";
        const last = compatData[entry].max ? normalizeVersion(compatData[entry].max) : "";

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
