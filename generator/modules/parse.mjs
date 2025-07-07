import {
    GIT_CHECKOUT_DIR_PATH,
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
        throw new Error(`Did not find mozilla policy template for ${tree}, ${rev}`)
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

    const UPDATED_UPSTREAM_TEMPLATE_CONFIG_FILE_NAME = pathUtils.join(
        "..",
        UPSTREAM_README_PATH.replace("#tree#", revisionData.tree)
    );
    await writeArrayOfStringsToFile(UPDATED_UPSTREAM_TEMPLATE_CONFIG_FILE_NAME, yamlEntries);

    return changeLog;
}


/**
 * Rebrand from Firefox to Thunderbird.
 * 
 * @param {string} line
 * @returns {string} re-branded line
 */
function rebrand(line) {
    const replacements = [
        {
            reg: /\bFirefox\b/g,
            val: "Thunderbird",
        },
        {
            reg: /\bfirefox\b/g,
            val: "thunderbird", //TODO
        },
        {
            reg: /([\W_])FF(\d\d)/g,
            val: "\$1TB\$2",
        },
        {
            reg: /\bAMO\b/g,
            val: "ATN",
        },
        {
            reg: /addons.mozilla.org/g,
            val: "addons.thunderbird.net",
        },
        {	// Undo a wrong replace.
            reg: "https://support.mozilla.org/kb/setting-certificate-authorities-thunderbird",
            val: "https://support.mozilla.org/kb/setting-certificate-authorities-firefox" //TODO
        },
        {	// Undo a wrong replace.
            reg: "https://support.mozilla.org/en-US/kb/dom-events-changes-introduced-thunderbird-66",
            val: "https://support.mozilla.org/en-US/kb/dom-events-changes-introduced-firefox-66" //TODO
        }
    ]

    for (let r of replacements) {
        line = line.replace(r.reg, r.val);
    }

    return line;
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

/**
 * Converts a policy object containing Markdown-formatted documentation into a
 * structured YAML string.
 * 
 * This function was used to parse Mozilla's policy template README.md:
 * https://github.com/mozilla/policy-templates/blob/master/docs/index.md
 * 
 * It generated a YAML file that served as the foundation for Thunderbird's
 * own policy documentation and templates. Going forward, Thunderbird maintains
 * its policy documentation independently and no longer clones or inherits
 * from Mozilla's templates.
 *
 * The input object should have the following structure:
 * {
 *   name: string,         // Policy name (used as the top-level YAML key)
 *   toc: string,          // Markdown table row with the final column containing
 *                         // the description
 *   content: string[]     // Markdown lines describing the policy and per-platform
 *                         // settings
 * }
 *
 * The output YAML contains fields like:
 * - toc:               A short description extracted from the TOC
 * - content:           A brief textual description of the policy
 * - cck2Equivalent:    Optional string if provided in the content (or empty)
 * - preferencesAffected: Array of preference strings from the Markdown
 * - gpo:               List of GPO registry keys, types, and values
 * - intune:            List of OMA-URIs and values for Intune MDM
 * - plist:             macOS-compatible plist configuration (as a literal block)
 * - json:              policies.json structure (as a literal block)
 *
 * The YAML output uses `|` for multi-line string blocks to preserve formatting.
 *
 * @param {Object} policy - The policy object to convert
 * @param {string} policy.name - The name of the policy (used as key in YAML)
 * @param {string} policy.toc - A markdown string representing a TOC row
 * @param {string[]} policy.content - An array of markdown lines containing full policy documentation
 * @returns {string} A formatted YAML string representing the policy
 */
export function generatePolicyYaml(policy) {
    const indent = (level, lines) =>
        lines
            .split('\n')
            .map((line) => ' '.repeat(level) + rebrand(line))
            .join('\n');

    const extractListOrText = (content, markdownPrefix, yamlPrefix) => {
        const rv = []
        const prefsLine = content.find((line) =>
            line.startsWith(markdownPrefix)
        );
        if (!prefsLine || prefsLine.includes('N/A')) {
            rv.push(`${yamlPrefix}:`);
        } else if (prefsLine.includes("`")) {
            const prefs = prefsLine
                .split(markdownPrefix)[1]
                .split(',')
                .map((s) => s.trim().replace(/`/g, '').replace(/\\$/, ''));
            rv.push(`${yamlPrefix}:`);
            prefs.forEach((p) => {
                rv.push(`  - ${p}`);
            });
        } else {
            const text = prefsLine.split(markdownPrefix)[1].trim();
            rv.push(`${yamlPrefix}: '${text}'`);
        }
        return rv
    }

    const detectRegistryType = (value) => {
        // Clean up whitespace
        const v = value.trim();

        // Check for DWORD-style values: hex numbers, possibly OR-ed
        const isDword = /^0x[0-9a-fA-F]+(\s*\|\s*0x[0-9a-fA-F]+)*$/.test(v);

        return isDword ? 'REG_DWORD' : 'REG_SZ';
    }

    const pushLineOrBlock = (level1, level2, src, dst, yamlPrefix) => {
        let trimmedSrc = trimArray(src);
        if (trimmedSrc.length > 1) {
            dst.push(indent(level1, `${yamlPrefix}: |`));
            trimmedSrc.forEach((e) => {
                dst.push(indent(level2, e));
            });
        } else {
            dst.push(indent(level1, `${yamlPrefix}: '${trimmedSrc[0]}'`));
        }
    }

    const result = [];
    if (!policy.content || !policy.toc) {
        return result;
    }

    result.push(indent(2, `${policy.name}:`));

    // Extract TOC last column (after the last pipe)
    const tocParts = policy.toc.split('|').map((s) => s.trim());
    const tocText = tocParts[tocParts.length - 1];
    result.push(indent(4, `toc: '${tocText.replace(/'/g, "''")}'`));

    // Extract content description (usually right after title)
    const descriptionStart = policy.content.findIndex(
        (line, idx) => idx > 0 && line.trim() !== '' && !line.startsWith('**')
    );
    const descriptionEnd = policy.content.findIndex(
        (line, idx) => idx > 0 && [
            '**Compatibility:**',
            'CCK2 Equivalent:**',
            '**Preferences Affected:**',
            '##'
        ].some(prefix => line.startsWith(prefix))
    );
    let description = trimArray(policy.content.slice(descriptionStart, descriptionEnd));
    if (description.length) {
        result.push(indent(4, `content: |`));
        description.forEach(e => result.push(indent(6, e)))
    } else {
        result.push(indent(4, `content:`));
    }

    // Extract CCK2 Equivalent.
    let cck2 = extractListOrText(policy.content, '**CCK2 Equivalent:**', 'cck2Equivalent');
    cck2.forEach((e) => {
        result.push(indent(4, e));
    });

    // Extract Preferences Affected.
    let prefs = extractListOrText(policy.content, '**Preferences Affected:**', 'preferencesAffected');
    prefs.forEach((e) => {
        result.push(indent(4, e));
    });

    // GPO block
    const gpoSectionStart = policy.content.indexOf('#### Windows (GPO)');
    const gpoBlockStart = policy.content.indexOf('```', gpoSectionStart + 1);
    const gpoBlockEnd = policy.content.indexOf('```', gpoBlockStart + 1);
    if (gpoSectionStart >= 0 && gpoBlockStart > gpoSectionStart && gpoBlockEnd > gpoBlockStart) {
        result.push(indent(4, `gpo:`));
        const lines = policy.content.slice(gpoSectionStart + 1, gpoBlockStart);
        // Is this a REG_MULTI_SZ?
        if (lines.length == 1 && lines[0].includes("(REG_MULTI_SZ)")) {
            const key = lines[0].split('(REG_MULTI_SZ)')[0].trim();
            const type = "REG_MULTI_SZ";
            const value = policy.content.slice(gpoBlockStart + 1, gpoBlockEnd);
            result.push(indent(6, `- key: '${key}'`));
            result.push(indent(6, `  type: '${type}'`));
            result.push(indent(6, `  value: |`));
            trimArray(value).forEach((e) => {
                result.push(indent(10, e));
            });
        } else {
            const value = policy.content.slice(gpoBlockStart + 1, gpoBlockEnd);
            const entries = value.map(
                e => e.split("=").map(e => e.trim()).filter(Boolean)
            ).flatMap(e => {
                if (e.length != 2) {
                    console.log("[IGNORED GPO ENTRY]", e);
                    return []
                }
                const key = e[0];
                const type = detectRegistryType(e[1]);
                const value = e[1];
                return [{ key, value, type }]
            });
            entries.forEach((e) => {
                result.push(indent(6, `- key: '${e.key}'`));
                result.push(indent(6, `  type: '${e.type}'`));
                result.push(indent(6, `  value: '${e.value}'`));
            });
        }
    }

    // Intune block
    const intuneSectionStart = policy.content.indexOf('#### Windows (Intune)');
    if (intuneSectionStart >= 0) {
        let iBlockMarkers = [];
        let iBlockType;
        let iData = {}
        const iLines = [];
        for (let i = intuneSectionStart + 1; i < policy.content.length; i++) {
            const line = policy.content[i];
            if (line.startsWith('##')) {
                // We reached the next section.
                break;
            } else if (line.startsWith('OMA-URI')) {
                // A new OMA-URI block starts.
                iBlockType = "uri";
                iBlockMarkers = [];
                iData = {}
            } else if (line.startsWith('```') && iBlockType) {
                // An opening or closing code marker.
                iBlockMarkers.push(i);
                // Are we done with a block?
                if (iBlockMarkers.length == 2) {
                    iData[iBlockType] = policy.content.slice(
                        iBlockMarkers[0] + 1,
                        iBlockMarkers[1],
                    )
                    iBlockType = null;
                    // Are we done with an entry?
                    if (iData.type && iData.value && iData.uri) {
                        pushLineOrBlock(6, 10, iData.uri.filter(Boolean), iLines, '- oma-uri');
                        iLines.push(indent(8, `type: '${iData.type}'`));
                        pushLineOrBlock(8, 10, iData.value.filter(Boolean), iLines, 'value');
                        iData = {};
                    }
                }
            } else if (line.startsWith('Value (')) {
                // A new Value block starts.
                iBlockType = "value";
                iBlockMarkers = [];
                iData.type = line.split(/[()]/)[1]?.trim();
            } else if (iBlockMarkers.length == 1) {
                // Collect lines between code markers
            } else {
                console.log("[IGNORED INTUNE ENTRY]", line);
            }
        }

        if (iLines.length) {
            result.push(indent(4, `intune:`));
            iLines.forEach((e) => {
                result.push(e);
            });
        }
    }

    // macOS plist block
    const plistStart = policy.content.indexOf('#### macOS');
    if (plistStart >= 0) {
        const start = policy.content.indexOf('```', plistStart);
        const end = policy.content.indexOf('```', start + 1);
        const xml = policy.content.slice(start + 1, end).join('\n');
        result.push(indent(4, `plist: |`));
        result.push(indent(6, xml));
    }

    // JSON block
    const jsonStart = policy.content.indexOf('#### policies.json');
    if (jsonStart >= 0) {
        const start = policy.content.indexOf('```', jsonStart);
        const end = policy.content.indexOf('```', start + 1);
        const json = policy.content.slice(start + 1, end).join('\n');
        result.push(indent(4, `json: |`));
        result.push(indent(6, json));
    }

    return result.join('\n');
}
