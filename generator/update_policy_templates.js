/**
 * See https://bugzilla.mozilla.org/show_bug.cgi?id=1732258
 */

import { 
    generateAdmxTemplates
 } from "./modules/generate_admx.mjs";
import {
    generatePolicyReadme,
    generateReadmeCompatibilityTable,
} from "./modules/generate_markdown.mjs";
import {
    generatePlistFile,
} from "./modules/generate_plist.mjs";
import {
    MAIN_TEMPLATE,
    DOCS_TEMPLATES_DIR_PATH, DOCS_README_PATH,
    TEMPORARY_SCHEMA_CACHE_FILE,
    YAML_CONFIG_PATH,
} from "./modules/constants.mjs";
import {
    getPolicySchemaRevisions,
    getRevisionVersion,
    generateCompatibilityInformationCache,
    getCachedCompatibilityInformation,
    gCompatibilityData
} from "./modules/mercurial.mjs";
import { getThunderbirdVersions } from "./modules/tools.mjs";

import fs from "node:fs/promises";
import pathUtils from "path";
import yaml from 'yaml';

// Start with a clean environment.
await fs.rm(DOCS_TEMPLATES_DIR_PATH, { recursive: true, force: true });
await fs.rm(TEMPORARY_SCHEMA_CACHE_FILE, { force: true });


// Determine for which major versions of Thunderbird we should build the docs.
const THUNDERBIRD_VERSIONS = await getThunderbirdVersions();
const treesData = THUNDERBIRD_VERSIONS.ESR.filter(v => v >= 91).map(version => {
    return {
        prefix: "Thunderbird ESR",
        tree: `esr${version}`,
        majorVersion: version,
    }
})
treesData.push({
    prefix: "Thunderbird",
    tree: `release`,
    majorVersion: THUNDERBIRD_VERSIONS.RELEASE
});
treesData.push({
    prefix: "Thunderbird Daily",
    tree: `central`,
    majorVersion: THUNDERBIRD_VERSIONS.DAILY,
});


const MAIN_README_ENTRIES = [];

// Process each Thunderbird version.
for (let treeData of treesData) {
    // Download schema revisions from https://hg.mozilla.org/.
    let revisionsData = await getPolicySchemaRevisions(treeData.tree);
    if (!revisionsData) {
        continue;
    }

    // Find supported policies.
    generateCompatibilityInformationCache(revisionsData);
    let supportedPolicies =
        getCachedCompatibilityInformation(
            /* distinct */ true,
            revisionsData.tree
        ).filter(e => e.first != "");

    // Generate the docs.
    let thunderbirdPolicies = Object.keys(gCompatibilityData)
        .filter(p => !gCompatibilityData[p].unsupported)
        .sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
    let output_dir = pathUtils.join(DOCS_TEMPLATES_DIR_PATH, revisionsData.tree);
    const THUNDERBIRD_YAML_CONFIG_FILE_NAME = YAML_CONFIG_PATH.replace("#tree#", `${revisionsData.tree}`)
    let template = yaml.parseDocument(await fs.readFile(THUNDERBIRD_YAML_CONFIG_FILE_NAME, 'utf8')).toJSON();

    template.mozillaReferenceTemplates = treeData.mozillaReferenceTemplates;
    template.tree = revisionsData.tree;
    template.version = await getRevisionVersion("comm", template.tree, "tip");
    template.name = `${treeData.prefix} ${template.version}`;

    await generatePolicyReadme(template, thunderbirdPolicies, output_dir);
    await generatePlistFile(template, thunderbirdPolicies, output_dir);
    await generateAdmxTemplates(
        template,
        supportedPolicies,
        output_dir
    );

    MAIN_README_ENTRIES.unshift(
        ` * [${template.name}](templates/${template.tree})`
    );
}

// Build the main README of https://thunderbird.github.io/policy-templates/, which
// gives a compatibility overview.
let compatInfo = getCachedCompatibilityInformation(/* distinct */ false, "central");
compatInfo.sort((a, b) => {
    let aa = a.policies.join(", ");
    let bb = b.policies.join(", ");
    if (aa < bb) return -1;
    if (aa > bb) return 1;
    return 0;
});

// Write the main Readme file.
await fs.writeFile(DOCS_README_PATH, MAIN_TEMPLATE
    .replace("__list__", MAIN_README_ENTRIES.join("\n"))
    .replace("__compatibility__", generateReadmeCompatibilityTable(compatInfo).join("\n"))
);
