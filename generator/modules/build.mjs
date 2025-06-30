import {
    DESC_DEFAULT_DAILY_TEMPLATE, DESC_DEFAULT_TEMPLATE,
    MOZILLA_TEMPLATE_DIR_PATH, README_JSON_PATH, TREE_TEMPLATE,
} from "./constants.mjs";
import { pullGitRepository } from "./git.mjs";
import { getCachedCompatibilityInformation } from "./mercurial.mjs";
import { ensureDir, fileExists, writePrettyJSONFile } from "./tools.mjs";

import { parse, stringify } from "comment-json";
import fs from "node:fs/promises";
import convert from "xml-js";
import plist from "plist";

/**
 * Parse the README files of a given mozilla policy template.
 * 
 * @param {object} revisionData
 * @param {string} revisionData.name - Name of the template (e.g. Thunderbird 139).
 * @param {string} revisionData.tree - The tree to process (e.g. "release",
 *    "central").
 * @param {integer} revisionData.version - Associated Thunderbird version.
 * @param {string} revisionData.mozillaReferenceTemplates - GitHub tag of the 
 *    associated Mozilla policy release.
 *
 * @return {TemplateData} - The parsed data from upstream readme.json, merged
 *    with data in the current /state folder.
 */
export async function parseMozillaPolicyTemplate(revisionData) {
    let readme_file_name = README_JSON_PATH.replace("#tree#", revisionData.tree);
    let readmeData = await fileExists(readme_file_name)
        ? parse(await fs.readFile(readme_file_name, 'utf8'))
        : {};

    const daily_template_lines = DESC_DEFAULT_DAILY_TEMPLATE
        .replaceAll("#tree#", revisionData.tree).split("\n");
    const normal_template_lines = DESC_DEFAULT_TEMPLATE
        .replaceAll("#tree#", revisionData.tree).split("\n");

    if (!readmeData) readmeData = {};
    if (!readmeData.headers) readmeData.headers = {};
    if (!readmeData.policies) readmeData.policies = {};
    if (!readmeData.desc) readmeData.desc = revisionData.tree == "central"
        ? [...daily_template_lines, "", ...normal_template_lines]
        : normal_template_lines

    // Always update the provided revision name and mozillaReferenceTemplates.
    readmeData.name = revisionData.name;
    readmeData.mozillaReferenceTemplates = revisionData.mozillaReferenceTemplates;

    let ref = readmeData.mozillaReferenceTemplates;
    let dir = `${MOZILLA_TEMPLATE_DIR_PATH}/${ref}`;
    await pullGitRepository("https://github.com/mozilla/policy-templates/", ref, dir);

    // Later revisions moved the file.
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

        if (!readmeData.headers[name]) {
            readmeData.headers[name] = { upstream: h };
        } else if (!readmeData.headers[name].upstream || readmeData.headers[name].upstream != h) {
            readmeData.headers[name].upstream = h;
        }
    }

    // Process policies.
    for (let p of data) {
        let lines = p.split("\n");
        let name = lines[0];
        lines[0] = `## ${name}`;

        name = name.replace(" | ", "_"); // flat hierarchy
        if (!readmeData.policies[name]) {
            readmeData.policies[name] = { upstream: lines };
        } else if (!readmeData.policies[name].upstream || stringify(readmeData.policies[name].upstream) != stringify(lines)) {
            readmeData.policies[name].upstream = lines;
        }
    }

    await writePrettyJSONFile(readme_file_name, readmeData);
    return readmeData;
}

//------------------------------------------------------------------------------

/**
 * Escape pipes, which may break markdown tables.
 * 
 * @param {string} str
 * @returns {string} string with escaped pipes
 */
function escape_pipes(str) {
    return str.replaceAll('|', '\\|');
}

/**
 * Rebrand from Firefox to Thunderbird.
 * 
 * @param {string|string[]} lines - string or array of strings
 * @returns {string} re-branded string (input array is joined by \n)
 */
function rebrand(lines) {
    if (!Array.isArray(lines))
        lines = [lines];

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

    for (let i = 0; i < lines.length; i++) {
        for (let r of replacements) {
            lines[i] = lines[i].replace(r.reg, r.val);
        }
    }

    return lines.join("\n");
}

/**
 * Generate a markdown compatibility table based on the provided compatInfo.
 * 
 * @param {PolicyCompatibilityEntry} compatInfo - see getCompatibilityInformation()
 * @returns {string[]} lines of markdown code of the generated compatibility table
 * 
 * @example
 * [
 *   '',
 *   '| Policy/Property Name | supported since | deprecated after |',
 *   '|:--- | ---:| ---:|',
 *   '| `SSLVersionMin` | 68.0 |  |',
 *   ''
 * ]
 */
export function generateReadmeCompatibilityTable(compatInfo) {
    let details = [];

    const humanReadableEntry = entry => {
        return "`" + escape_pipes(entry
            .replace("^.*$", "[name]")
            .replace("^(", "(")
            .replace(")$", ")")) + "`";
    }

    details.push("", "| Policy/Property Name | supported since | deprecated after |", "|:--- | ---:| ---:|");
    for (let entry of compatInfo) {
        let format = entry.first ? "" : "*";
        details.push(`| ${format}${entry.policies.map(humanReadableEntry).join("<br>")}${format} | ${entry.first} | ${entry.last} |`);
    }
    details.push("");
    return details;
}

/**
 * Adjust the markdown README file downloaded from the Firefox policy repository
 * to include Thunderbird's compatibility information.
 * 
 * @param {string} tree - The tree to process (e.g. "release", "central").
 * @param {TemplateData} template 
 * @param {string[]} thunderbirdPolicies - Flattened policy names, e.g.
 *    "InstallAddonsPermission_Allow".
 * @param {string} output_dir - Path to save the generated README file.
 */
export async function adjustFirefoxReadmeFileForThunderbird(tree, template, thunderbirdPolicies, output_dir) {
    let header = [];
    let details = [];
    let printed_main_policies = [];
    let skipped_main_policies = [];
    // Loop over all policies found in the thunderbird policy schema file and rebuild the readme.
    for (let policy of thunderbirdPolicies) {
        // Get the policy header from the template (or its override).
        if (template.headers[policy]) {
            let content = template.headers[policy].override || template.headers[policy].upstream;
            if (content && content != "skip") {
                header.push(content);
            }
            printed_main_policies.push(policy.split("_").shift());
        } else {
            // Keep track of policies which are not mentioned directly in the readme.
            let skipped = policy.split("_").shift();
            if (!skipped_main_policies.includes(skipped)) skipped_main_policies.push(skipped);
        }

        // Get the policy details from the template (or its override).
        if (template.policies[policy]) {
            let content = template.policies[policy].override || template.policies[policy].upstream;
            if (content && content != "skip") {
                details.push(...content.filter(e => !e.includes("**Compatibility:**")));
                details.push("#### Compatibility");
                let distinctCompatInfo = getCachedCompatibilityInformation(/* distinct */ true, tree, policy);
                details.push(...generateReadmeCompatibilityTable(distinctCompatInfo));
                details.push("<br>", "");
            }
        }
    }

    for (let skipped of skipped_main_policies) {
        if (!printed_main_policies.includes(skipped)) {
            console.log(`  --> WARNING: Supported policy not present in readme: \x1b[31m '${skipped}'\x1b[0m`);
        }
    }

    let md = TREE_TEMPLATE
        .replace("__name__", template.name)
        .replace("__desc__", template.desc.join("\n"))
        .replace("__list_of_policies__", rebrand(header))
        .replace("__details__", rebrand(details));

    await ensureDir(output_dir);
    await fs.writeFile(`${output_dir}/README.md`, md);
}

/**
 * Adjust the ADMX files downloaded from the Firefox policy repository to include
 * only the policies supported by Thunderbird.
 * 
 * @param {string} tree - The tree to process (e.g. "release", "central").
 * @param {TemplateData} template 
 * @param {string[]} thunderbirdPolicies - Flattened policy names, e.g.
 *    "InstallAddonsPermission_Allow".
 * @param {string} output_dir - Path to save the adjusted ADMX files.
 */
export async function adjustFirefoxAdmxFilesForThunderbird(tree, template, thunderbirdPolicies, output_dir) {
    function getNameFromKey(key) {
        const key_prefix = "Software\\Policies\\Mozilla\\Thunderbird\\";
        const key_prefix_length = key_prefix.length;
        if (key && key.length > key_prefix_length) {
            return key.substring(key_prefix_length).split("\\").join("_");
        }
    }
    function getThunderbirdPolicy(policy, element) {
        let parts = [];
        let name = getNameFromKey(policy?.attributes?.key);
        if (name) {
            parts.push(name);
        }

        if (policy?.attributes?.valueName) {
            parts.push(policy.attributes.valueName);
        }

        if (element) {
            if (element?.attributes?.key) parts = [getNameFromKey(element.attributes.key)];
            else if (element?.attributes?.valueName) parts.push(element.attributes.valueName);
        }
        let flat_policy_name = parts.join("_");
        if (thunderbirdPolicies.includes(flat_policy_name)) {
            return flat_policy_name;
        }
        return false;
    }

    // Read ADMX files - https://www.npmjs.com/package/xml-js
    let admx_file = await fs.readFile(`${MOZILLA_TEMPLATE_DIR_PATH}/${template.mozillaReferenceTemplates}/windows/firefox.admx`, 'utf8');
    let admx_obj = convert.xml2js(
        rebrand(admx_file).replace(/">">/g, '">'), // issue https://github.com/mozilla/policy-templates/issues/801
        { compact: false }
    );

    let admxPolicies = admx_obj
        .elements.find(e => e.name == "policyDefinitions")
        .elements.find(e => e.name == "policies")
        .elements;
    let distinctCompatInfo = getCachedCompatibilityInformation(/* distinct */ true, tree);
    let used_supported_on = {};

    for (let policy of admxPolicies) {
        // Identify unsupported policies (remember, we work with flattened policy_property names here).
        // A single ADMX policy entry can include multiple elements, we need to check those individually.
        let compatInfo = [];

        let flat_policy_name = getThunderbirdPolicy(policy);
        if (!flat_policy_name) {
            policy.unsupported = true
        }

        if (policy.elements && policy.elements.find(e => e.name == "elements") && Array.isArray(policy.elements.find(e => e.name == "elements").elements)) {
            // The elements member is a structure from the xml parser, we need the elements object of
            // the elements obj with name elements here.
            let elements = policy.elements.find(e => e.name == "elements").elements.filter(e => !!getThunderbirdPolicy(policy, e));
            if (elements.length == 0) {
                delete policy.elements.find(e => e.name == "elements").elements;
                policy.unsupported = true;
            } else {
                delete policy.unsupported;
                compatInfo.push(...elements.map(e => distinctCompatInfo.findIndex(i => i.policies.includes(getThunderbirdPolicy(policy, e)))));
            }
        } else {
            compatInfo.push(distinctCompatInfo.findIndex(e => e.policies.includes(flat_policy_name)));
        }

        // Adjust supportedOn.
        // A single policy entry can contain multiple policy elements which potentially could have a different compat setting.
        // Todo: Check wether all members of policy.compatInfo are identical.
        let compatInfoIndex = compatInfo.length > 0
            ? compatInfo[0]
            : -1

        if (compatInfoIndex != -1) {
            let name = `SUPPORTED_ID_${compatInfoIndex}`;
            policy.elements.find(e => e.name == "supportedOn").attributes.ref = name;

            if (!used_supported_on[name]) {
                used_supported_on[name] = {
                    admx: {
                        type: 'element',
                        name: 'definition',
                        attributes: { name, displayName: `$(string.${name})` },
                    },
                    adml: {
                        type: 'element',
                        name: 'string',
                        attributes: { id: name },
                        elements: [{ type: 'text', text: `${distinctCompatInfo[compatInfoIndex].firstLong} - ${distinctCompatInfo[compatInfoIndex].last ? distinctCompatInfo[compatInfoIndex].lastLong : "*"}` }]
                    },
                }
            }
        }
    }

    // Update policies.
    admx_obj
        .elements.find(e => e.name == "policyDefinitions")
        .elements.find(e => e.name == "policies")
        .elements = admxPolicies.filter(p => !p.unsupported);

    // Update supportedOn definitions.
    admx_obj
        .elements.find(e => e.name == "policyDefinitions")
        .elements.find(e => e.name == "supportedOn")
        .elements.find(e => e.name == "definitions")
        .elements = Object.keys(used_supported_on).sort().map(e => used_supported_on[e].admx);

    // Rebuild thunderbird.admx file.
    let admx_xml = convert.js2xml(admx_obj, { compact: false, spaces: 2 });
    await ensureDir(`${output_dir}/windows`);
    await fs.writeFile(`${output_dir}/windows/thunderbird.admx`, admx_xml);

    // Copy mozilla.admx file.
    let file = await fs.readFile(`${MOZILLA_TEMPLATE_DIR_PATH}/${template.mozillaReferenceTemplates}/windows/mozilla.admx`);
    await fs.writeFile(`${output_dir}/windows/mozilla.admx`, file);



    // Handle translation files.
    let folders = (await fs.readdir(`${MOZILLA_TEMPLATE_DIR_PATH}/${template.mozillaReferenceTemplates}/windows`, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    for (let folder of folders) {
        let adml_file = await fs.readFile(`${MOZILLA_TEMPLATE_DIR_PATH}/${template.mozillaReferenceTemplates}/windows/${folder}/firefox.adml`, 'utf8');
        let adml_obj = convert.xml2js(rebrand(adml_file), { compact: false });

        let strings = adml_obj
            .elements.find(e => e.name == "policyDefinitionResources")
            .elements.find(e => e.name == "resources")
            .elements.find(e => e.name == "stringTable")
            .elements.filter(e => !e.attributes || !e.attributes.id.startsWith("SUPPORTED_TB"));

        strings.unshift(...Object.keys(used_supported_on).sort().map(e => used_supported_on[e].adml));

        adml_obj
            .elements.find(e => e.name == "policyDefinitionResources")
            .elements.find(e => e.name == "resources")
            .elements.find(e => e.name == "stringTable")
            .elements = strings;

        let adml_xml = convert.js2xml(adml_obj, { compact: false, spaces: 2 });
        await ensureDir(`${output_dir}/windows/${folder}`);
        await fs.writeFile(`${output_dir}/windows/${folder}/thunderbird.adml`, adml_xml);
    }
}

/**
 * Adjust the MasOS PLIST files downloaded from the Firefox policy repository to
 * include only the policies supported by Thunderbird.
 * 
 * @param {TemplateData} template 
 * @param {string[]} thunderbirdPolicies - flattened policy names, e.g.
 *    "InstallAddonsPermission_Allow"
 * @param {string} output_dir - path to save the adjusted PLIST files.
 */
export async function adjustFirefoxPlistFilesForThunderbird(template, thunderbirdPolicies, output_dir) {
    // Read PLIST files - https://www.npmjs.com/package/plist.
    let plist_file = await fs.readFile(`${MOZILLA_TEMPLATE_DIR_PATH}/${template.mozillaReferenceTemplates}/mac/org.mozilla.firefox.plist`, 'utf8');


    plist_file = plist_file
        // See https://github.com/mozilla/policy-templates/pull/1088
        .replaceAll("&rt;", "&gt;")
        // Malformed in TB115.
        .replaceAll("</false>", "<false/>");

    let plist_obj = plist.parse(plist_file);

    function isObject(v) {
        return typeof v === 'object' && !Array.isArray(v) && v !== null;
    }
    function removeUnsupportedEntries(plist, base_name = "") {
        for (let key of Object.keys(plist)) {
            let policy_name = base_name
                ? `${base_name}_${key}`
                : key;

            if (!isObject(plist[key])) {
                // This is a final entry, check if this is a supported policy.
                if (!thunderbirdPolicies.includes(policy_name) && policy_name != "EnterprisePoliciesEnabled") {
                    delete plist[key];
                }
            } else {
                removeUnsupportedEntries(plist[key], policy_name);
                if (Object.keys(plist[key]).length == 0) {
                    delete plist[key];
                }
            }
        }
    }

    removeUnsupportedEntries(plist_obj);
    let plist_tb = plist.build(plist_obj);
    await ensureDir(`${output_dir}/mac`);
    await fs.writeFile(`${output_dir}/mac/org.mozilla.thunderbird.plist`, rebrand(plist_tb));
}
