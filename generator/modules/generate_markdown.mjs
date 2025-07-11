import {
    DESC_DEFAULT_DAILY_TEMPLATE,
    TREE_TEMPLATE,
} from "./constants.mjs";
import { getCachedCompatibilityInformation } from "./mercurial.mjs";
import { ensureDir } from "./tools.mjs";
import fs from "node:fs/promises";
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
                ...value.gpo.flatMap(e => {
                    // Multiple keys are given as a string, with a key on each
                    // line. Render each as its own full key/type/value entry.
                    let keys = e.key.split("\n").filter(Boolean);
                    return keys.map(key => `${key} (${e.type}) = ${e.type == "REG_MULTI_SZ" ? "\n" : ""}${e.value.trim()}`)
                }),
                "```",
            )
        }
        if (value.intune && value.intune.length > 0) {
            readmeData[key].content.push(
                "",
                "#### Windows (Intune)",
                // Multiple URIs are given as a string, with a URI on each line.
                // Simple put all URIs as-is in the OMA-URI section, rendering
                // type and value only once.
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
        .replace("__desc__", `${template.tree == "central" ? DESC_DEFAULT_DAILY_TEMPLATE : ""}${
            template.description
                .replaceAll(
                    `[thunderbird.admx]`,
                    `[thunderbird.admx](https://github.com/thunderbird/policy-templates/tree/master/docs/templates/${template.tree}/windows)`)
                .replaceAll(
                    `[org.mozilla.thunderbird.plist]`,
                    `[org.mozilla.thunderbird.plist](https://github.com/thunderbird/policy-templates/blob/master/docs/templates/${template.tree}/mac/org.mozilla.thunderbird.plist)`)
        }`)
        .replace("__list_of_policies__", header.join("\n"))
        .replace("__details__", details.join("\n"));

    await ensureDir(output_dir);
    await fs.writeFile(`${output_dir}/README.md`, md);
}
