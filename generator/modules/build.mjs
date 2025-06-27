import {
    gMainTemplate, gTreeTemplate,
    BUILD_DIR_PATH, MOZILLA_TEMPLATE_DIR_PATH,
    MAIN_README_PATH, README_JSON_PATH, REVISIONS_JSON_WRITE_PATH
} from "./constants.mjs";
import { pullGitRepository } from "./git.mjs";
import {
    downloadMissingPolicySchemaFiles,
    generateCompatibilityInformationCache,
    getCachedCompatibilityInformation,
    getDifferencesBetweenPolicySchemas,
    getHgDownloadUrl,
    getLocalPolicySchemaPath,
    gCompatibilityData
} from "./mercurial.mjs";
import { ensureDir, fileExists, writePrettyJSONFile } from "./tools.mjs";

import { parse, stringify } from "comment-json";
import fs from "node:fs/promises";
import pathUtils from "path";
import convert from "xml-js";
import plist from "plist";

var gMainTemplateEntries = [];

/**
 * Parse the README files of a given mozilla policy template.
 * 
 * @param {string} tree - for example "central", "esr91", "esr128", ...
 * @return - parsed data from readme.json, updated with upstream changes
 */
async function parseMozillaPolicyTemplate(tree) {
    let readme_file_name = README_JSON_PATH.replace("#tree#", tree);
    let readmeData = await fileExists(readme_file_name)
        ? parse(await fs.readFile(readme_file_name).then(f => f.toString()))
        : {};

    if (!readmeData) readmeData = {};
    if (!readmeData.headers) readmeData.headers = {};
    if (!readmeData.policies) readmeData.policies = {};

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
            file = await fs.readFile(p, 'utf8').then(f => f.toString());
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

    // Process MacOS readme.
    let mac = await fs.readFile(`${dir}/mac/README.md`, 'utf8').then(f => f.toString().split("\n"));

    if (!readmeData.macReadme) {
        readmeData.macReadme = { upstream: mac };
    } else if (!readmeData.macReadme.upstream || stringify(readmeData.macReadme.upstream) != stringify(mac)) {
        readmeData.macReadme.upstream = mac;
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
        lines = [lines.toString()];

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
function generateReadmeCompatibilityTable(compatInfo) {
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
 * Generate a markdown README file for a specific tree from the collected
 * compatibility information.
 * 
 * @param {string} tree - for example "central", "esr91", "esr128", ...
 * @param {*} template 
 * @param {string[]} thunderbirdPolicies - flattened policy names, e.g.
 *    "InstallAddonsPermission_Allow"
 * @param {string} output_dir - path to save the generated README file
 */
async function generateReadmeFile(tree, template, thunderbirdPolicies, output_dir) {
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

    let md = gTreeTemplate
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
 * @param {string} tree - for example "central", "esr91", "esr128", ...
 * @param {*} template 
 * @param {string[]} thunderbirdPolicies - flattened policy names, e.g.
 *    "InstallAddonsPermission_Allow"
 * @param {string} output_dir - path to save the adjusted ADMX files.
 */
async function adjustFirefoxAdmxFilesForThunderbird(tree, template, thunderbirdPolicies, output_dir) {
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
    let admx_file = await fs.readFile(`${MOZILLA_TEMPLATE_DIR_PATH}/${template.mozillaReferenceTemplates}/windows/firefox.admx`);
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
        let adml_file = await fs.readFile(`${MOZILLA_TEMPLATE_DIR_PATH}/${template.mozillaReferenceTemplates}/windows/${folder}/firefox.adml`);
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
 * @param {*} template 
 * @param {string[]} thunderbirdPolicies - flattened policy names, e.g.
 *    "InstallAddonsPermission_Allow"
 * @param {string} output_dir - path to save the adjusted PLIST files.
 */
async function adjustFirefoxPlistFilesForThunderbird(template, thunderbirdPolicies, output_dir) {
    // Read PLIST files - https://www.npmjs.com/package/plist.
    let plist_file = await fs.readFile(`${MOZILLA_TEMPLATE_DIR_PATH}/${template.mozillaReferenceTemplates}/mac/org.mozilla.firefox.plist`).then(f => f.toString());

    // See https://github.com/mozilla/policy-templates/pull/1088
    plist_file = plist_file.replaceAll("&rt;", "&gt;");

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
    await fs.writeFile(`${output_dir}/mac/README.md`, rebrand(template.macReadme.override || template.macReadme.upstream));
}

/**
 * Generate Thunderbird's policy template files for a specific tree.
 * 
 * @param {string} tree - for example "central", "esr91", "esr128", ...
 * @param {string} mozillaReferencePolicyRevision - mercurial changeset identifier
 *    of the last known version of policies.json from Firefox/Mozilla
 */
export async function buildThunderbirdTemplates(tree, mozillaReferencePolicyRevision) {
    // Download schema from https://hg.mozilla.org/
    let data = await downloadMissingPolicySchemaFiles(
        tree,
        mozillaReferencePolicyRevision,
    );
    if (!data) {
        return;
    }

    let output_dir = `${BUILD_DIR_PATH}/${tree}`;
    let mozillaReferencePolicyFile = data.mozilla.revisions.find(r => r.revision == mozillaReferencePolicyRevision);
    if (!mozillaReferencePolicyFile) {
        console.error(`Unknown policy revision ${mozillaReferencePolicyRevision} set for mozilla-${tree}.\nCheck ${getHgDownloadUrl("mozilla", tree)}`);
        return;
    }

    // Find supported policies.
    generateCompatibilityInformationCache(data, tree);
    let supportedPolicies =
        getCachedCompatibilityInformation(
            /* distinct */ true, tree
        ).filter(e => e.first != "");

    // Get changes in the schema files and log them.
    if (mozillaReferencePolicyFile.revision != data.mozilla.revisions[0].revision) {
        mozillaReferencePolicyRevision = data.mozilla.revisions[0].revision;
        let m_m_changes = getDifferencesBetweenPolicySchemas(mozillaReferencePolicyFile, data.mozilla.revisions[0]);
        if (m_m_changes) {
            console.log();
            console.log(` Mozilla has released a new policy revision for mozilla-${tree}!`);
            console.log(` Do those changes need to be ported to Thunderbird?`);
            if (m_m_changes.added.length > 0) {
                console.log(` - Mozilla added the following policies: [`);
                // Indicate if the current tree supports any of the added policies.
                // This can happen, if the revision config file has not yet been
                // committed, and an older revision was used to detect changes in
                // the policy files.
                for (let added of m_m_changes.added) {
                    let isSupported = supportedPolicies.find(e => e.policies.includes(added));
                    if (isSupported) {
                        console.log(`\x1b[32m     '${added}'\x1b[0m`)
                    } else {
                        console.log(`\x1b[31m     '${added}'\x1b[0m, \x1b[31m Not supported by ${tree} \x1b[0m`)
                    }
                }
                console.log(`   ]\n`);
            }
            if (m_m_changes.removed.length > 0) {
                console.log(` - Mozilla removed the following policies: [`);
                m_m_changes.removed.forEach(e => console.log(`\x1b[33m     '${e}'\x1b[0m`));
                console.log(`   ]\n`);
            }
            if (m_m_changes.changed.length > 0) {
                console.log(` - Mozilla changed properties of the following policies: [`);
                m_m_changes.changed.forEach(e => console.log(`\x1b[33m     '${e}'\x1b[0m`));
                console.log(`   ]\n`);
            }

            console.log();
            console.log(` - currently acknowledged policy revision (${mozillaReferencePolicyFile.revision} / ${mozillaReferencePolicyFile.version}): \n\t${pathUtils.resolve(getLocalPolicySchemaPath("mozilla", tree, mozillaReferencePolicyFile.revision))}\n`);
            console.log(` - latest available policy revision (${data.mozilla.revisions[0].revision} / ${data.mozilla.revisions[0].version}): \n\t${pathUtils.resolve(getLocalPolicySchemaPath("mozilla", tree, data.mozilla.revisions[0].revision))}\n`);
            console.log(` - hg change log for mozilla-${tree}: \n\t${getHgDownloadUrl("mozilla", tree, "tip", "log", "policies-schema.json")}\n`);
            console.log(`Create bugs on Bugzilla for all policies which should be ported to Thunderbird and then check-in the updated ${REVISIONS_JSON_WRITE_PATH} file to acknowledge the reported changes.`);
            console.log(`Once the reported changes are acknowledged, they will not be reported again.`);
            console.log();
        }
    }

    let template = await parseMozillaPolicyTemplate(tree);
    let thunderbirdPolicies = Object.keys(gCompatibilityData)
        .filter(p => !gCompatibilityData[p].unsupported)
        .sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

    await generateReadmeFile(tree, template, thunderbirdPolicies, output_dir);
    await adjustFirefoxAdmxFilesForThunderbird(tree, template, thunderbirdPolicies, output_dir);
    await adjustFirefoxPlistFilesForThunderbird(template, thunderbirdPolicies, output_dir);

    if (tree == "central") {
        gMainTemplateEntries.unshift(` * [${template.name}](templates/${tree})`);
    } else {
        gMainTemplateEntries.unshift(` * [${template.name}](templates/${tree}) (${template.mozillaReferenceTemplates}) `);
    }
}

/**
 * Generate the main README for Thunderbird, the page behind
 * https://thunderbird.github.io/policy-templates/
 */
export async function buildMainThunderbirdReadme() {
    // Retrieve the collected compatibility information (the version of Thunderbird
    // when support for each policy was added or removed), to report them on the
    // main Readme file.
    let compatInfo = getCachedCompatibilityInformation(/* distinct */ false, "central");
    compatInfo.sort((a, b) => {
        let aa = a.policies.join("<br>");
        let bb = b.policies.join("<br>");
        if (aa < bb) return -1;
        if (aa > bb) return 1;
        return 0;
    });

    // Write the main Readme file.
    await fs.writeFile(MAIN_README_PATH, gMainTemplate
        .replace("__list__", gMainTemplateEntries.join("\n"))
        .replace("__compatibility__", generateReadmeCompatibilityTable(compatInfo).join("\n"))
    );
}