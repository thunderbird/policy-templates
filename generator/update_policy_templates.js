/**
 * See https://bugzilla.mozilla.org/show_bug.cgi?id=1732258
 */

import {
    generatePolicyReadme,
    adjustFirefoxAdmxFilesForThunderbird,
    generatePlistFile,
    generateReadmeCompatibilityTable,
} from "./modules/build.mjs";
import {
    MAIN_TEMPLATE,
    DOCS_TEMPLATES_DIR_PATH, DOCS_README_PATH,
    UPSTREAM_REVISIONS_PATH, GIT_CHECKOUT_DIR_PATH,
    TEMPORARY_SCHEMA_CACHE_FILE,
    YAML_CONFIG_PATH,
} from "./modules/constants.mjs";
import {
    getPolicySchemaRevisions,
    getRevisionVersion,
    generateCompatibilityInformationCache,
    getCachedCompatibilityInformation,
    getDifferencesBetweenPolicySchemas,
    getHgDownloadUrl,
    gCompatibilityData
} from "./modules/mercurial.mjs";
import { getDocumentationChanges } from "./modules/parse.mjs"
import {
    fileExists, getFirstRevisionFromBuildHub,
    getThunderbirdVersions, writePrettyJSONFile
} from "./modules/tools.mjs";

import commentJson from "comment-json";
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
        prefix: "`Thunderbird ESR",
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


const STATE_DIR_REVISION_PATH = pathUtils.join(GIT_CHECKOUT_DIR_PATH, UPSTREAM_REVISIONS_PATH);
const lastKnownStateData = await fileExists(STATE_DIR_REVISION_PATH)
    ? commentJson.parse(await fs.readFile(STATE_DIR_REVISION_PATH, 'utf8'))
    : [];
const GITHUB_REPORTS = [];
const MAIN_README_ENTRIES = [];
let currently_highest_known_esr = 0

// Process each Thunderbird version.
for (let treeData of treesData) {
    // Tracks the highest ESR version seen so far during the loop.
    // Needed to determine the revision to use for entries with unknown last state.
    if (treeData.majorVersion > currently_highest_known_esr && treeData.tree.startsWith("esr")) {
        currently_highest_known_esr = treeData.majorVersion;
    }
    // Either use the mozillaReferencePolicyRevision from the last known revision
    // state, or extract the first changeset from the given tree which is from a
    // version which matches the highest ESR version seen so far.
    let knownState = lastKnownStateData.find(r => r.tree == treeData.tree);
    if (knownState) {
        treeData.mozillaReferencePolicyRevision = knownState.mozillaReferencePolicyRevision;
    } else {
        treeData.mozillaReferencePolicyRevision = await getFirstRevisionFromBuildHub(
            "mozilla",
            treeData.tree,
            `${currently_highest_known_esr}.*`
        )
    }

    // Download schema revisions from https://hg.mozilla.org/.
    let revisionsData = await getPolicySchemaRevisions(
        treeData.tree,
        treeData.mozillaReferencePolicyRevision,
    );
    if (!revisionsData) {
        continue;
    }

    if (!revisionsData.mozilla.revisions.find(r => r.revision == treeData.mozillaReferencePolicyRevision)) {
        console.error(`Unknown policy revision ${treeData.mozillaReferencePolicyRevision} set for mozilla-${treeData.tree}.`);
        console.error(`Check ${getHgDownloadUrl("mozilla", treeData.tree)}`);
        continue;
    }

    // Find supported policies.
    generateCompatibilityInformationCache(revisionsData);
    let supportedPolicies =
        getCachedCompatibilityInformation(
            /* distinct */ true,
            revisionsData.tree
        ).filter(e => e.first != "");

    // Find changes in the schema files and report them.
    const reports = {
        title: null,
        description: [],
        added: [],
        removed: [],
        changed: [],
        changedDocumentation: [],
    }
    if (treeData.mozillaReferencePolicyRevision != revisionsData.mozilla.revisions[0].revision) {
        treeData.mozillaReferencePolicyRevision = revisionsData.mozilla.revisions[0].revision;
        let m_m_changes = getDifferencesBetweenPolicySchemas(mozillaReferencePolicyFile, revisionsData.mozilla.revisions[0]);
        if (m_m_changes) {
            for (const { title, data, require_supported, log } of [
                {
                    title: "New unsupported policies:",
                    data: m_m_changes.added,
                    require_supported: false,
                    log: reports.added,
                },
                {
                    title: "Removed policies:",
                    data: m_m_changes.removed,
                    require_supported: true,
                    log: reports.removed,
                },
                {
                    title: "Policies with changed properties:",
                    data: m_m_changes.changed,
                    require_supported: true,
                    log: reports.changed,
                }
            ]) {
                if (data.length > 0) {
                    const entries = [];
                    for (let entry of data) {
                        let isSupported = supportedPolicies.some(e => e.policies.includes(entry));
                        if (isSupported == require_supported) {
                            entries.push(` * \`${entry}\``);
                        }
                    }
                    if (entries.length) {
                        log.push(title);
                        log.push(...entries);
                    }
                }
            }
        }
    }

    // Find changes in the upstream documentation and report them.
    reports.changedDocumentation = await getDocumentationChanges(revisionsData);
    if (reports.changedDocumentation.length) {
        reports.changedDocumentation.unshift("Policies with changed documentation:")
    }

    const reportTypes = Object.values(reports).filter(value => Array.isArray(value));
    if (reportTypes.some(log => log.length > 0)) {
        reports.title = `Mozilla has updated the policies for mozilla-${revisionsData.tree} (${revisionsData.mozilla.revisions[0].version})!`;
        reports.description.push(`The following changes have been detected since the last check.`);

        const body = [];
        for (const log of reportTypes) {
            if (log.length) {
                body.push("");
                log.forEach(e => body.push(e));
            }
        }

        GITHUB_REPORTS.push({
            title: reports.title,
            body: body.join("\n").trim(),
        });

        console.log("");
        console.log(`| ${reports.title}`);
        body.forEach(e => console.log(`| ${e}`));
        console.log("");
    }

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
    //await adjustFirefoxAdmxFilesForThunderbird(template, thunderbirdPolicies, output_dir);

    MAIN_README_ENTRIES.unshift(
        ` * [${template.name}](templates/${template.tree})`
    );
}

// Update /state folder with latest revisions.
await writePrettyJSONFile(pathUtils.join("..", UPSTREAM_REVISIONS_PATH), treesData);

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

// Pass reports back to github action workflow, to create issues.
const githubWorkflowOutput = process.env.GITHUB_OUTPUT;
if (githubWorkflowOutput) {
    await fs.appendFile(
        githubWorkflowOutput,
        `reports=${JSON.stringify(GITHUB_REPORTS)}\n`
    );
}
