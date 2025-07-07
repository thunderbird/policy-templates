import {
    DESC_DEFAULT_DAILY_TEMPLATE,
    MOZILLA_TEMPLATE_DIR_PATH, TREE_TEMPLATE,
} from "./constants.mjs";
import { getCachedCompatibilityInformation } from "./mercurial.mjs";
import { ensureDir } from "./tools.mjs";
import fs from "node:fs/promises";
import convert from "xml-js";
import plist from "plist";
import GithubSlugger from 'github-slugger';

/**
 * Escape pipes, which may break markdown tables.
 * 
 * @param {string} str
 * @returns {string} string with escaped pipes
 */
function escape_pipes(str) {
    return str.replaceAll('|', '\\|');
}

function generateReadmeMarkdown(policies) {
    // Build the JSON readmeData.
    const readmeData = {}
    for (let [key, value] of Object.entries(policies)) {
        readmeData[key] = {}
        const slugger = new GithubSlugger();
        readmeData[key].toc = `| **[\`${key.replaceAll("_", " -> ")
            }\`](#${slugger.slug(key.replaceAll("_", " | "))
            })** | ${value.toc}`;

        //console.log(value);
        readmeData[key].content = [
            `## ${key.replaceAll("_", " | ")}`,
            ``,
            ...(value.content?.split("\n") || []),
            `**CCK2 Equivalent:** ${value.cck2Equivalent ? `\`${value.cck2Equivalent}\`` : "N/A"}\\`,
            `**Preferences Affected:** ${Array.isArray(value.preferencesAffected)
                ? value.preferencesAffected.map(e => `\`${e}\``).join(", ")
                : value.preferencesAffected ?? "N/A"
            }`
        ];
        if (value.gpo && value.gpo.length > 0) {
            readmeData[key].content.push(
                "",
                "#### Windows (GPO)",
                "```",
                ...value.gpo.map(e => `${e.key} (${e.type}) = ${e.type == "REG_MULTI_SZ" ? "\n" : ""}${e.value.trim()}`),
                "```",
            )
        }
        if (value.intune && value.intune.length > 0) {
            readmeData[key].content.push(
                "",
                "#### Windows (Intune)",
                ...value.intune.flatMap(e => [
                    "OMA-URI:",
                    "```",
                    e['oma-uri'].trim(),
                    "```",
                    `Value (${e.type}):`,
                    "```",
                    e.value.trim(),
                    "```",
                ])
            )
        }
        if (value.plist && value.plist.length > 0) {
            readmeData[key].content.push(
                "",
                "#### macOS",
                "```",
                value.plist.trim(),
                "```"
            )
        }
        if (value.json && value.json.length > 0) {
            readmeData[key].content.push(
                "",
                "#### policies.json",
                "```",
                value.json.trim(),
                "```"
            )
        }

    }
    return readmeData;
}

/**
 * Rebrand from Firefox to Thunderbird. Kept here only until ADMX/L files are generated.
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
 * Generate the markdown for Thunderbird's README file and save it in the specified
 * folder.
 * 
 * @param {TemplateData} template 
 * @param {string[]} thunderbirdPolicies - Flattened policy names of supported
 *    policies, e.g. "InstallAddonsPermission_Allow".
 * @param {string} output_dir - Path to save the generated README file.
 */
export async function generatePolicyReadme(template, thunderbirdPolicies, output_dir) {
    let tree = template.tree;
    let thunderbirdReadmeData = generateReadmeMarkdown(template.policies);

    let header = [];
    let details = [];
    let printed_main_policies = [];
    let skipped_main_policies = [];
    // Loop over all policies found in the thunderbird policy schema file and rebuild the readme.
    for (let policy of thunderbirdPolicies) {
        // Get the policy header from the template.
        if (thunderbirdReadmeData[policy]) {
            let readmeData = thunderbirdReadmeData[policy];
            if (readmeData.toc) {
                header.push(readmeData.toc);
            }
            printed_main_policies.push(policy.split("_").shift());
        } else {
            // Keep track of policies which are not mentioned directly in the readme.
            let skipped = policy.split("_").shift();
            if (!skipped_main_policies.includes(skipped)) skipped_main_policies.push(skipped);
        }

        // Get the policy details from the template.
        if (thunderbirdReadmeData[policy]) {
            let readmeData = thunderbirdReadmeData[policy];
            if (readmeData.content) {
                details.push(...readmeData.content.filter(e => !e.includes("**Compatibility:**")));
                details.push("");
                details.push("#### Compatibility");
                let distinctCompatInfo = getCachedCompatibilityInformation(/* distinct */ true, tree, policy);
                details.push(...generateReadmeCompatibilityTable(distinctCompatInfo));
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
        .replace("__desc__", `${template.tree == "central" ? DESC_DEFAULT_DAILY_TEMPLATE : ""}${template.description}`)
        .replace("__list_of_policies__", header.join("\n"))
        .replace("__details__", details.join("\n"));

    await ensureDir(output_dir);
    await fs.writeFile(`${output_dir}/README.md`, md);
}

/**
 * Adjust the ADMX files downloaded from the Firefox policy repository to include
 * only the policies supported by Thunderbird.
 * 
 * @param {TemplateData} template 
 * @param {string[]} thunderbirdPolicies - Flattened policy names, e.g.
 *    "InstallAddonsPermission_Allow".
 * @param {string} output_dir - Path to save the adjusted ADMX files.
 */
export async function adjustFirefoxAdmxFilesForThunderbird(template, thunderbirdPolicies, output_dir) {
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

    let tree = template.tree;

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
    let file = await fs.readFile(`${MOZILLA_TEMPLATE_DIR_PATH}/${template.mozillaReferenceTemplates}/windows/mozilla.admx`, 'utf8');
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
        await fs.writeFile(`${output_dir}/windows/${folder}/mozilla.adml`, adml_file);
    }
}

/**
 * Generate the example plist file policies support by Thunderbird on MacOs.
 * 
 * @param {TemplateData} template
 * @param {string[]} thunderbirdPolicies - Flattened policy names of supported
 *    policies, e.g. "InstallAddonsPermission_Allow".
 * @param {string} output_dir - path to save the adjusted PLIST files.
 */
export async function generatePlistFile(template, thunderbirdPolicies, output_dir) {
    function sortKeysRecursively(obj) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            // Sort the keys and rebuild object
            const sorted = {};
            Object.keys(obj)
                .sort((a, b) => a.localeCompare(b))
                .forEach(key => {
                    sorted[key] = sortKeysRecursively(obj[key]);
                });
            return sorted;
        } else if (Array.isArray(obj)) {
            // Recursively sort dicts inside arrays
            return obj.map(item => sortKeysRecursively(item));
        } else {
            // Primitive value, return as is
            return obj;
        }
    }
    function deepMerge(target, source) {
        for (const key of Object.keys(source)) {
            if (
                typeof target[key] === 'object' &&
                typeof source[key] === 'object' &&
                !Array.isArray(target[key]) &&
                !Array.isArray(source[key])
            ) {
                // Recursively merge nested dictionaries
                deepMerge(target[key], source[key]);
            } else {
                // For arrays or primitives, overwrite
                target[key] = source[key];
            }
        }
        return target;
    }

    const plistEntries = Object.entries(template.policies)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .filter(e => thunderbirdPolicies.includes(e[0]))
        .map(e => e[1].plist)
        .filter(Boolean);

    const mergedObject = {};
    for (const entry of plistEntries) {
        try {
            // Use only the first XML tag before the pipe for each value, and also
            // only keep the first provided string value.
            const cleaned = entry.replace(/(<[^>]+>\s*\|\s*<[^>]+>)/g, match => {
                // For XML tags separated by |
                return match.split('|')[0].trim();
            }).replace(/<string>([^<]+)<\/string>/g, (match, content) => {
                // For <string> that contains multiple options separated by '|'
                const firstOption = content.split('|')[0].trim();
                return `<string>${firstOption}</string>`;
            });

            // Wrap into a valid plist structure.
            const wrapped = `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
    ${cleaned}
  </plist>`;

            // Parse the cleaned plist fragment.
            const parsed = plist.parse(wrapped);

            // Merge keys into the result.
            deepMerge(mergedObject, sortKeysRecursively(parsed));
        } catch (err) {
            console.error(`Invalid plist entry:\n${entry}`);
            console.error(`Error: ${err.message}`);
        }
    }

    // Convert merged object back to plist string.
    const plist_tb = plist.build(mergedObject);
    await ensureDir(`${output_dir}/mac`);
    await fs.writeFile(`${output_dir}/mac/org.mozilla.thunderbird.plist`, plist_tb);
}
