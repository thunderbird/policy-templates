/**
 * See https://bugzilla.mozilla.org/show_bug.cgi?id=1732258
 */

import {
    STATE_DIR_PATH,
    COMPATIBILITY_JSON_PATH, REVISIONS_JSON_READ_PATH, REVISIONS_JSON_WRITE_PATH
} from "./modules/constants.mjs";
import { pullGitRepository } from "./modules/git.mjs";
import { gCompatibilityData } from "./modules/mercurial.mjs";
import { fileExists, writePrettyJSONFile } from "./modules/tools.mjs";
import { buildMainThunderbirdReadme, buildThunderbirdTemplates } from "./modules/build.mjs";

import { parse } from "comment-json";
import fs from "node:fs/promises";

// Checkout the current state of the repo (stored in /state). When the script runs,
// it will update the local /state folder to report upstream changes. Until the
// updated /state folder is not pushed to the repo, a new run of this script will
// report the same "new" findings again. Pushing the changed /state folder will
// acknowledge the findings and not report them again.
await pullGitRepository(
    "https://github.com/thunderbird/policy-templates", "master", STATE_DIR_PATH
);

// Load revision data, to see if any new revisions have been added to the tree.
let revisionData = [];
let readRevisionData = await fileExists(REVISIONS_JSON_READ_PATH)
    ? parse(await fs.readFile(REVISIONS_JSON_READ_PATH).then(f => f.toString()))
    : [];
// A starter set, if the revision config file is missing or incomplete.
let defaultRevisionData = [
    {
        tree: "esr68",
        mozillaReferencePolicyRevision: "1b0a29b456b432d1c8bef09c233b84205ec9e13c",
    },
    {
        tree: "esr78",
        mozillaReferencePolicyRevision: "a8c4670b6ef144a0f3b6851c2a9d4bbd44fc032a",
    },
    {
        tree: "esr91",
        mozillaReferencePolicyRevision: "02bf5ca05376f55029da3645bdc6c8806e306e80",

    },
    {
        tree: "esr102",
        mozillaReferencePolicyRevision: "02bf5ca05376f55029da3645bdc6c8806e306e80",
    },
    {
        tree: "esr115",
        mozillaReferencePolicyRevision: "02bf5ca05376f55029da3645bdc6c8806e306e80",
    },
    {
        tree: "central",
        mozillaReferencePolicyRevision: "02bf5ca05376f55029da3645bdc6c8806e306e80",
    }
];

for (let defaultRevision of defaultRevisionData) {
    let readRevision = readRevisionData.find(r => r.tree == defaultRevision.tree);
    let revision = readRevision || defaultRevision;
    revisionData.push(revision);
    await buildThunderbirdTemplates(revision.tree, revision.mozillaReferencePolicyRevision);
}

// Update /state folder with latest revisions.
await writePrettyJSONFile(COMPATIBILITY_JSON_PATH, gCompatibilityData);
await writePrettyJSONFile(REVISIONS_JSON_WRITE_PATH, revisionData);

// Build the main README file.
await buildMainThunderbirdReadme();
