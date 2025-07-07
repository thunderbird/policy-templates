import {
    YAML_CONFIG_PATH, GIT_CHECKOUT_DIR_PATH,
    MOZILLA_TEMPLATE_DIR_PATH, UPSTREAM_README_PATH, TREE_TEMPLATE,
} from "./constants.mjs";
import { pullGitRepository } from "./git.mjs";
import { getCachedCompatibilityInformation } from "./mercurial.mjs";
import { ensureDir, fileExists, sortObjectByKeys, writePrettyJSONFile, writePrettyYAMLFile } from "./tools.mjs";

import commentJson from "comment-json";
import fs from "node:fs/promises";
import convert from "xml-js";
import pathUtils from "path";
import plist from "plist";
import yaml from 'yaml';
import GithubSlugger from 'github-slugger';

/**
 * Parse the README files of a given mozilla policy template, or creates it if
 * missing (cloned from comm-central, if possible).
 * 
 * @param {object} revisionData
 * @param {string} revisionData.name - Name of the template (e.g. Thunderbird 139).
 * @param {string} revisionData.tree - The tree to process (e.g. "release",
 *    "central").
 * @returns {string[]} Array of changes
 */
export async function getDocumentationChanges(revisionData) {
    const changeLog = [];

    // Pull the current master of Thunderbird's policy-templates repository, and use
    // the state stored in /state as the last known state to compare against the most
    // recent state. When the script runs, it will update the local /state folder to
    // report upstream changes. As long as the updated /state folder is not pushed
    // back to the repository, a new run of this script will report the same "new"
    // findings again. Pushing the updated /state folder will acknowledge the findings
    // and not report them again.
    // Note: This allows us to monitor Mozilla policies and get notified about changes.
    //       We can then decide if the additions need to be ported for Thunderbird.
    await pullGitRepository(
        "https://github.com/thunderbird/policy-templates", "master", GIT_CHECKOUT_DIR_PATH
    );
    return [];

    const updatedUpstreamTemplateConfig = {
        tree: revisionData.tree,
        version: revisionData.version,
        mozillaReferenceTemplates: revisionData.mozillaReferenceTemplates,
        readmeData: {},
    }
    // Get the upstream config data for this template.
    const UPSTREAM_TEMPLATE_CONFIG_FILE_NAME = pathUtils.join(
        GIT_CHECKOUT_DIR_PATH,
        UPSTREAM_README_PATH.replace("#tree#", revisionData.tree)
    );
    let upstreamTemplateConfig = await fileExists(UPSTREAM_TEMPLATE_CONFIG_FILE_NAME)
        ? commentJson.parse(await fs.readFile(UPSTREAM_TEMPLATE_CONFIG_FILE_NAME, 'utf8'))
        : {};
    if (!upstreamTemplateConfig.readmeData) upstreamTemplateConfig.readmeData = {};


    // Read README files from Mozilla policy-templates repository.
    let ref = revisionData.mozillaReferenceTemplates;
    let dir = `${MOZILLA_TEMPLATE_DIR_PATH}/${ref}`;
    await pullGitRepository("https://github.com/mozilla/policy-templates/", ref, dir);

    // Later revisions moved the file into the /docs folder.
    let paths = [`${dir}/docs/index.md`, `${dir}/README.md`];

    // This parsing highly depends on the structure of the README and needs to be
    // adjusted when its layout is changing. In the intro section we have lines like 
    // | **[`3rdparty`](#3rdparty)** |
    // Detailed descriptions are below level 3 headings (###) with potential subsections.

    // Split on ### heading to get chunks of policy descriptions.
    let file;
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
    let data = file.split("\n### ");

    // Shift out the header and process it.
    for (let h of data.shift().split("\n").filter(e => e.startsWith("| **[`"))) {
        let name = h
            .match(/\*\*\[(.*?)\]/)[1] // extract name from the markdown link
            .replace(/`/g, "") // unable to fix the regex to exclude those
            .replace(" -> ", "_"); // flat hierarchy

        // Merge upstream Readme toc into jsonTemplateConfig.readmeData.
        if (!jsonTemplateConfig.readmeData[name]) {
            jsonTemplateConfig.readmeData[name] = {};
        };
        if (!jsonTemplateConfig.readmeData[name].toc) {
            jsonTemplateConfig.readmeData[name].toc = h;
        };

        // Update upstream state.
        const isSupported = supportedPolicies.some(e => e.policies.includes(name));
        if (isSupported) {
            if (!updatedUpstreamTemplateConfig.readmeData[name]) {
                updatedUpstreamTemplateConfig.readmeData[name] = {};
            };
            updatedUpstreamTemplateConfig.readmeData[name].toc = h;
        }
    }

    // Process policies.
    for (let p of data) {
        let lines = p.split("\n");
        let name = lines[0];
        lines[0] = `## ${name}`;

        name = name.replace(" | ", "_"); // flat hierarchy
        if (
            upstreamTemplateConfig.readmeData[name]?.content &&
            upstreamTemplateConfig.readmeData[name].content.join("\n") != lines.join("\n")
        ) {
            changeLog.push(` * \`${name}\``);
        }

        // Merge upstream Readme content into jsonTemplateConfig.readmeData.
        if (!jsonTemplateConfig.readmeData[name]) {
            jsonTemplateConfig.readmeData[name] = {};
        };
        if (!jsonTemplateConfig.readmeData[name].content) {
            jsonTemplateConfig.readmeData[name].content = lines;
        }

        // Update upstream state.
        const isSupported = supportedPolicies.some(e => e.policies.includes(name));
        if (isSupported) {
            if (!updatedUpstreamTemplateConfig.readmeData[name]) {
                updatedUpstreamTemplateConfig.readmeData[name] = {};
            };
            updatedUpstreamTemplateConfig.readmeData[name].content = lines;
        }
    }

    const UPDATED_UPSTREAM_TEMPLATE_CONFIG_FILE_NAME = pathUtils.join(
        "..",
        UPSTREAM_README_PATH.replace("#tree#", revisionData.tree)
    );
    updatedUpstreamTemplateConfig.readmeData = sortObjectByKeys(updatedUpstreamTemplateConfig.readmeData);
    await writePrettyJSONFile(UPDATED_UPSTREAM_TEMPLATE_CONFIG_FILE_NAME, updatedUpstreamTemplateConfig);

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
