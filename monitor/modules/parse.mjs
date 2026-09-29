import {
    GIT_CHECKOUT_DIR_PATH, MONITOR_REPO_DIR,
    MOZILLA_TEMPLATE_DIR_PATH, UPSTREAM_README_PATH,
} from "./constants.mjs";
import { pullGitRepository } from "./git.mjs";
import { fileExists, writeArrayOfStringsToFile } from "./tools.mjs";

import fs from "node:fs/promises";
import pathUtils from "path";
import yaml from 'yaml';

/**
 * Parse the README files of a given mozilla policy template and compare it against
 * the version stored in /upstream.
 * 
 * @param {object} revisionData
 * @param {string} revisionData.name - Name of the template (e.g. Thunderbird 139).
 * @param {string} revisionData.tree - The tree to process (e.g. "release",
 *    "central").
 *  * @param {string[]} thunderbirdPolicies - Flattened policy names of supported
 *    policies, e.g. "InstallAddonsPermission_Allow".
 * @param {string} mozillaGithubTag - The tag of the release in Mozilla's 
 *    policy-templates repository, which should be used to compare against the
 *    last known state in /upstream.
 * @returns {string[]} Array of changes
 */
export async function getDocumentationChanges(revisionData, thunderbirdPolicies, mozillaGithubTag) {
    const changeLog = [];

    // Get the last known upstream README data.
    const UPSTREAM_LAST_KNOWN_README_PATH = pathUtils.join(
        GIT_CHECKOUT_DIR_PATH,
        MONITOR_REPO_DIR,
        UPSTREAM_README_PATH.replace("#tree#", revisionData.tree)
    );
    let lastKnownReadmeData = await fileExists(UPSTREAM_LAST_KNOWN_README_PATH)
        ? yaml.parseDocument(await fs.readFile(UPSTREAM_LAST_KNOWN_README_PATH, 'utf8')).toJSON()
        : null;

    // Pull the current upstream README data.
    const dir = `${MOZILLA_TEMPLATE_DIR_PATH}/${mozillaGithubTag}`;
    await pullGitRepository(
        "https://github.com/mozilla/policy-templates/",
        mozillaGithubTag,
        dir
    );
    // Later revisions moved the file into the /docs folder.
    let file;
    let paths = [`${dir}/docs/index.md`, `${dir}/README.md`];
    for (let p of paths) {
        try {
            file = await fs.readFile(p, 'utf8');
            break;
        } catch {
        }
    }
    if (!file) {
        throw new Error(`Did not find mozilla policy template for ${revisionData.tree}, ${mozillaGithubTag}`)
    }

    // Split on ### heading to get chunks of policy descriptions.
    // This parsing depends on the structure of the README. The first array entry
    // will be the TOC. All other entries will be the markdown of the documentation
    // of each policy, with the name of the policy in the first line.
    const yamlEntries = [];
    const data = file.split("\n### ");
    const tocLines = trimArray(data.shift().split("\n").map(e => e.trim()));
    const descriptions = data.map(policy => {
        const arr = policy.split("\n").map(e => e.trim());
        const name = arr.shift().replaceAll(" | ", "_");
        const lines = trimArray(arr);

        const isSupported = thunderbirdPolicies.some(e => e.policies.includes(name));
        if (isSupported && lastKnownReadmeData && lastKnownReadmeData[name]) {
            const lastKnownReadme = lastKnownReadmeData[name].split("\n").map(e => e.trim());
            if (lastKnownReadme.join("\n").trim() != lines.join("\n").trim()) {
                changeLog.push(` * \`${name}\``);
            }
        }
        return { name, lines }
    })

    descriptions.sort((a, b) => a.name.localeCompare(b.name));
    yamlEntries.push(`toc: |`)
    tocLines.forEach(line => yamlEntries.push(`  ${line}`))
    for (let policy of descriptions) {
        yamlEntries.push(`${policy.name}: |`);
        policy.lines.forEach(line => yamlEntries.push(`  ${line}`))
    }

    const UPDATED_UPSTREAM_TEMPLATE_CONFIG_FILE_NAME =
        UPSTREAM_README_PATH.replace("#tree#", revisionData.tree);
    await writeArrayOfStringsToFile(UPDATED_UPSTREAM_TEMPLATE_CONFIG_FILE_NAME, yamlEntries);

    return changeLog;
}


/**
 * Removes leading and trailing empty or whitespace-only string elements from an
 * array.
 *
 * This function is similar to String.prototype.trim(), but applies to arrays of
 * strings. It preserves the original order of elements and returns a new array
 * without modifying the input.
 *
 * Example:
 *   trimArray(['', '   ', 'foo', 'bar', '  ', '']) → ['foo', 'bar']
 *
 * @param {string[]} arr - The input array of strings to trim.
 * @returns {string[]} A new array with leading and trailing empty/whitespace-only
 *    elements removed.
 */
function trimArray(arr) {
    let start = 0;
    let end = arr.length - 1;

    while (start <= end && arr[start].trim() === '') start++;
    while (end >= start && arr[end].trim() === '') end--;

    return arr.slice(start, end + 1);
}
