/**
 * See https://bugzilla.mozilla.org/show_bug.cgi?id=1732258
 */

import {
    adjustFirefoxReadmeFileForThunderbird,
    adjustFirefoxAdmxFilesForThunderbird,
    adjustFirefoxPlistFilesForThunderbird,
    generateReadmeCompatibilityTable,
    parseMozillaPolicyTemplate,
} from "./modules/build.mjs";
import {
    MAIN_TEMPLATE,
    DOCS_TEMPLATES_DIR_PATH, DOCS_README_PATH,
    UPSTREAM_REVISIONS_PATH, GIT_CHECKOUT_DIR_PATH,
    TEMPORARY_SCHEMA_CACHE_FILE
} from "./modules/constants.mjs";
import { pullGitRepository } from "./modules/git.mjs";
import {
    downloadMissingPolicySchemaFiles,
    generateCompatibilityInformationCache,
    getCachedCompatibilityInformation,
    getDifferencesBetweenPolicySchemas,
    getHgDownloadUrl,
    gCompatibilityData
} from "./modules/mercurial.mjs";
import {
    fileExists, getFirstRevisionFromBuildHub,
    getThunderbirdVersions, writePrettyJSONFile
} from "./modules/tools.mjs";

import { parse } from "comment-json";
import fs from "node:fs/promises";
import pathUtils from "path";

// Start with a clean environment.
await fs.rm(DOCS_TEMPLATES_DIR_PATH, { recursive: true, force: true });
await fs.rm(TEMPORARY_SCHEMA_CACHE_FILE, { force: true });

// We currently do not generate our own templates (Readme files, PLIST files for
// Mac, ADMX files for Windows) from our policies-schema.json file, but clone and
// adjust the templates published by Mozilla. We then delete policies we do not
// support, and add our own Thunderbird-only policies.
// TODO: We should switch to an approach, which annotates our policies-schema.json
//       file with all the required information and no longer clone the Mozilla
//       templates, but truly generate our own templates.
const mozilla_policy_template_releases = await fetch(
    "https://api.github.com/repos/mozilla/policy-templates/releases"
).then(res => res.json()).then(data =>
    // Create an array of GitHub release entries of the following data structure,
    // sorted by major, minor (of the mozilla policy github release tag):
    //  {
    //    title: 'Policy templates for Firefox 139 and Firefox ESR 128.11',
    //    major: 6,
    //    minor: 11
    //  },
    // Only keep the major version entry with the highest minor version.
    data.flatMap(e => {
        const match = e.tag_name.match(/^v(\d+)\.(\d+)$/);
        if (!match) return [];

        const [_, major, minor] = match;
        return [{
            title: e.name,
            major: parseInt(major, 10),
            minor: parseInt(minor, 10),
        }];
    }).sort((a, b) =>
        b.major !== a.major
            ? b.major - a.major
            : b.minor - a.minor
    ).reduce((acc, entry) => {
        if (!acc.find(e => e.major === entry.major)) {
            acc.push(entry);
        }
        return acc;
    }, [])
);

// Match the policy template versions published by Mozilla against the available
// Thunderbird versions.
// Note: This depends on the convention of the published release titles used by
//       https://github.com/mozilla/policy-templates/releases. Expected is this:
//       "Policy templates for Firefox 139 and Firefox ESR 128.11"
let THUNDERBIRD_VERSIONS = await getThunderbirdVersions();
// Create an array of revision entries of the following data structure:
// {
//    name: 'Thunderbird ESR 128',
//    tree: 'esr128',
//    version: 128,
//    mozillaReferenceTemplates: 'v6.11'
//},
let allRevisionData = THUNDERBIRD_VERSIONS.ESR.flatMap(version => {
    let matching_esr = mozilla_policy_template_releases.find(
        // Use RegExp instead of a simple .includes() to tolerate flexible spacing
        // and increase the probability to correctly match the used version format
        // (e.g., "Firefox ESR 128.11").
        r => new RegExp(`Firefox ESR\\s+${version}\\.`).test(r.title)
    )
    if (!matching_esr) {
        return []
    }
    let mozillaReferenceTemplates = `v${matching_esr.major}.${matching_esr.minor}`;
    return {
        name: `Thunderbird ESR ${version}`,
        tree: `esr${version}`,
        version,
        mozillaReferenceTemplates,
    }
})
let matching_release = mozilla_policy_template_releases.find(
    r => r.title.includes(`Firefox ${THUNDERBIRD_VERSIONS.RELEASE}`)
)
if (matching_release) {
    let mozillaReferenceTemplates = `v${matching_release.major}.${matching_release.minor}`;
    allRevisionData.push({
        name: `Thunderbird ${THUNDERBIRD_VERSIONS.RELEASE}`,
        tree: `release`,
        version: THUNDERBIRD_VERSIONS.RELEASE,
        mozillaReferenceTemplates,
    })
}
let matching_central = mozilla_policy_template_releases[0];
if (matching_central) {
    let mozillaReferenceTemplates = `v${matching_central.major}.${matching_central.minor}`;
    allRevisionData.push({
        name: `Thunderbird Daily ${THUNDERBIRD_VERSIONS.DAILY}`,
        tree: `central`,
        version: THUNDERBIRD_VERSIONS.DAILY,
        mozillaReferenceTemplates,
    })
}

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
let stateDirRevisionsPath = pathUtils.join(GIT_CHECKOUT_DIR_PATH, UPSTREAM_REVISIONS_PATH);
let lastKnownStateData = await fileExists(stateDirRevisionsPath)
    ? parse(await fs.readFile(stateDirRevisionsPath, 'utf8'))
    : [];
// Tracks the highest ESR version seen so far during the loop.
// Needed to determine the revision to use for entries with unknown last state.
let currently_highest_known_esr = 0
for (let entry of allRevisionData) {
    if (entry.version > currently_highest_known_esr && entry.tree.startsWith("esr")) {
        currently_highest_known_esr = entry.version;
    }

    // Either use the mozillaReferencePolicyRevision from the last known revision
    // state, or extract the first changeset from the given tree which is from a
    // version which matches the highest ESR version seen so far.
    let knownState = lastKnownStateData.find(r => r.tree == entry.tree);
    if (knownState) {
        entry.mozillaReferencePolicyRevision = knownState.mozillaReferencePolicyRevision;
    } else {
        entry.mozillaReferencePolicyRevision = await getFirstRevisionFromBuildHub(
            "mozilla",
            entry.tree,
            `${currently_highest_known_esr}.*`
        )
    }
}

// Build the Thunderbird templates.
const gMainTemplateEntries = [];
const GITHUB_REPORTS = [];
for (let revisionData of allRevisionData) {
    // Keep track of changes for the final report.
    let report = {
        title: null,
        description: [],
        added: [],
        removed: [],
        changed: [],
        changedDocumentation: [],
    }

    // Download schema from https://hg.mozilla.org/
    let data = await downloadMissingPolicySchemaFiles(
        revisionData.tree,
        revisionData.mozillaReferencePolicyRevision,
    );
    if (!data) {
        continue;
    }

    let output_dir = pathUtils.join(DOCS_TEMPLATES_DIR_PATH, revisionData.tree);
    let mozillaReferencePolicyFile = data.mozilla.revisions.find(r => r.revision == revisionData.mozillaReferencePolicyRevision);
    if (!mozillaReferencePolicyFile) {
        console.error(`Unknown policy revision ${revisionData.mozillaReferencePolicyRevision} set for mozilla-${revisionData.tree}.`);
        console.error(`Check ${getHgDownloadUrl("mozilla", revisionData.tree)}`);
        continue;
    }

    // Find supported policies.
    generateCompatibilityInformationCache(data, revisionData.tree);
    let supportedPolicies =
        getCachedCompatibilityInformation(
            /* distinct */ true, revisionData.tree
        ).filter(e => e.first != "");

    // Get changes in the schema files and report them.
    if (mozillaReferencePolicyFile.revision != data.mozilla.revisions[0].revision) {
        revisionData.mozillaReferencePolicyRevision = data.mozilla.revisions[0].revision;
        let m_m_changes = getDifferencesBetweenPolicySchemas(mozillaReferencePolicyFile, data.mozilla.revisions[0]);
        if (m_m_changes) {
            for (const { title, data, require_supported, log } of [
                {
                    title: "New unsupported policies:",
                    data: m_m_changes.added,
                    require_supported: false,
                    log: report.added,
                },
                {
                    title: "Removed policies:",
                    data: m_m_changes.removed,
                    require_supported: true,
                    log: report.removed,
                },
                {
                    title: "Policies with changed properties:",
                    data: m_m_changes.changed,
                    require_supported: true,
                    log: report.changed,
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

    // Clone the Mozilla templates.
    let template = await parseMozillaPolicyTemplate(revisionData, supportedPolicies, report.changedDocumentation);
    if (report.changedDocumentation.length) {
        report.changedDocumentation.unshift("Policies with changed documentation:")
    }
    let thunderbirdPolicies = Object.keys(gCompatibilityData)
        .filter(p => !gCompatibilityData[p].unsupported)
        .sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

    await adjustFirefoxReadmeFileForThunderbird(revisionData.tree, template, thunderbirdPolicies, output_dir);
    await adjustFirefoxAdmxFilesForThunderbird(revisionData.tree, template, thunderbirdPolicies, output_dir);
    await adjustFirefoxPlistFilesForThunderbird(template, thunderbirdPolicies, output_dir);

    gMainTemplateEntries.unshift(
        ` * [${revisionData.name}](templates/${revisionData.tree})`
    );

    const reports = [
        report.description,
        report.added,
        report.removed,
        report.changed,
        report.changedDocumentation
    ];
    if (reports.some(log => log.length > 0)) {
        report.title = `Mozilla has updated the policies for mozilla-${revisionData.tree} (${data.mozilla.revisions[0].version})!`;
        report.description.push(`The following changes have been detected since the last check.`);

        const body = [];
        for (const log of reports) {
            if (log.length) {
                body.push("");
                log.forEach(e => body.push(e));
            }
        }

        GITHUB_REPORTS.push({
            title: report.title,
            body: body.join("\n").trim(),
        });

        console.log("");
        console.log(`| ${report.title}`);
        body.forEach(e => console.log(`| ${e}`));
        console.log("");
    }
}

// Update /state folder with latest revisions.
await writePrettyJSONFile(pathUtils.join("..", UPSTREAM_REVISIONS_PATH), allRevisionData);

// Build the main README of https://thunderbird.github.io/policy-templates/, which
// gives a compatibility overview.
let compatInfo = getCachedCompatibilityInformation(/* distinct */ false, "central");
compatInfo.sort((a, b) => {
    let aa = a.policies.join("<br>");
    let bb = b.policies.join("<br>");
    if (aa < bb) return -1;
    if (aa > bb) return 1;
    return 0;
});

// Write the main Readme file.
await fs.writeFile(DOCS_README_PATH, MAIN_TEMPLATE
    .replace("__list__", gMainTemplateEntries.join("\n"))
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
