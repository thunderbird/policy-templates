/**
 * See https://bugzilla.mozilla.org/show_bug.cgi?id=1732258
 */

import {
    RELATIVE_COMPATIBILITY_JSON_PATH, RELATIVE_REVISIONS_JSON_PATH, STATE_DIR_PATH
} from "./modules/constants.mjs";
import { pullGitRepository } from "./modules/git.mjs";
import { gCompatibilityData } from "./modules/mercurial.mjs";
import { fileExists, getFirstRevisionFromBuildHub as getFirstRevisionFromBuildHub, getThunderbirdEsrVersions, writePrettyJSONFile } from "./modules/tools.mjs";
import { buildMainThunderbirdReadme, buildThunderbirdTemplates } from "./modules/build.mjs";

import { parse } from "comment-json";
import fs from "node:fs/promises";

// Pull the current state of Thunderbird's policy-templates repository, and use
// the state stored in /state as the last known state to compare the against the
// most recent state. When the script runs, it will update the local /state folder
// to report upstream changes. Until the updated /state folder is not pushed back
// to the repository, a new run of this script will report the same "new" findings
// again. Pushing the changed /state folder will acknowledge the findings and not
// report them again.
await pullGitRepository(
    "https://github.com/thunderbird/policy-templates", "master", STATE_DIR_PATH
);
let lastKnownStateData = await fileExists(`${STATE_DIR_PATH}/${RELATIVE_REVISIONS_JSON_PATH}`)
    ? parse(await fs.readFile(`${STATE_DIR_PATH}/${RELATIVE_REVISIONS_JSON_PATH}`, 'utf8'))
    : [];

// Pull the published ESR versions from product-details.mozilla.org. Ignore all
// ESR < 68.
// TODO: Enable support for 128.
let ESR_VERSIONS = await getThunderbirdEsrVersions().then(
    versions => versions.filter(v => !(v < 68) && v != 128).map(v => `esr${v}`)
);

// Use the last known revision state and calculate a new revision entry, in case
// a new ESR was published.
let revisionData = [];
for (let tree of [...ESR_VERSIONS, "central"]) {
    let knownState = lastKnownStateData.find(r => r.tree == tree);
    if (knownState) {
        revisionData.push(knownState)
    } else {
        revisionData.push({
            tree,
            "mozillaReferencePolicyRevision": await getFirstRevisionFromBuildHub("mozilla", tree)
        })
    }
}
for (let revision of revisionData) {
    await buildThunderbirdTemplates(revision.tree, revision.mozillaReferencePolicyRevision);
}

// Update /state folder with latest revisions.
await writePrettyJSONFile(`../${RELATIVE_COMPATIBILITY_JSON_PATH}`, gCompatibilityData);
await writePrettyJSONFile(`../${RELATIVE_REVISIONS_JSON_PATH}`, revisionData);

// Build the main README file.
await buildMainThunderbirdReadme();
