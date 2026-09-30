/**
 * Validate generated ADMX/ADML templates against the official schemas and check
 * the references between them (see modules/validate_admx.mjs).
 */

import { DOCS_TEMPLATES_DIR_PATH } from "./modules/constants.mjs";
import { formatProblems, validateAdmx } from "./modules/validate_admx.mjs";
import { runCommandLine } from "./modules/tools.mjs";

import fs from "node:fs/promises";
import pathUtils from "node:path";
import { parseArgs } from "node:util";

const USAGE = `
Usage:

    node validate_templates.js [folder ...]

Validates thunderbird.admx and en-US/thunderbird.adml in each given folder, by
default in all windows/ folders of ${DOCS_TEMPLATES_DIR_PATH}.
`;

async function getDefaultFolders() {
    const folders = [];
    for (const dir of await fs.readdir(DOCS_TEMPLATES_DIR_PATH, { withFileTypes: true })) {
        const folder = pathUtils.join(DOCS_TEMPLATES_DIR_PATH, dir.name, "windows");
        const files = [
            pathUtils.join(folder, "thunderbird.admx"),
            pathUtils.join(folder, "en-US", "thunderbird.adml"),
        ];
        if (dir.isDirectory() && (await Promise.all(files.map(f => fs.access(f).then(() => true, () => false)))).every(Boolean)) {
            folders.push(folder);
        }
    }
    return folders;
}

await runCommandLine(USAGE, async () => {
    const { positionals } = parseArgs({ allowPositionals: true });
    const folders = positionals.length ? positionals : await getDefaultFolders();

    let invalid = 0;
    for (const folder of folders) {
        const problems = await validateAdmx({
            admx: pathUtils.join(folder, "thunderbird.admx"),
            adml: pathUtils.join(folder, "en-US", "thunderbird.adml"),
        });
        if (problems.length) {
            invalid++;
            console.log(`${folder}: ${problems.length} problems\n${formatProblems(problems)}`);
        } else {
            console.log(`${folder}: valid`);
        }
    }
    if (invalid) {
        process.exit(1);
    }
});
