/**
 * Validate generated ADMX/ADML templates against the official schemas and check
 * the references between them (see generator/modules/validate_admx.mjs).
 */

import { loadProduct } from "../generator/modules/product.mjs";
import { formatProblems, validateAdmx } from "../generator/modules/validate_admx.mjs";
import { InputError, runCommandLine } from "../generator/modules/tools.mjs";

import fs from "node:fs/promises";
import pathUtils from "node:path";
import { parseArgs } from "node:util";

const USAGE = `
Usage:

    node validate_templates.js --product-config=path [--output=path] [folder ...]

Validates the ADMX template of the product and its en-US ADML file (named
after the product, e.g. thunderbird.admx) in each given folder, or in all admx/
folders of the branches in a docs folder.

Options:
   --product-config=path
                      - The product folder (required), e.g.
                        products/thunderbird.
   --output=path      - A docs folder: validates the templates of all its
                        branches (<path>/policies/<branch>/admx/).
`;

async function getFolders(output, file) {
    const policiesDir = pathUtils.join(output, "policies");
    const folders = [];
    for (const dir of await fs.readdir(policiesDir, { withFileTypes: true })) {
        const folder = pathUtils.join(policiesDir, dir.name, "admx");
        const files = [
            pathUtils.join(folder, `${file}.admx`),
            pathUtils.join(folder, "en-US", `${file}.adml`),
        ];
        if (dir.isDirectory() && (await Promise.all(files.map(f => fs.access(f).then(() => true, () => false)))).every(Boolean)) {
            folders.push(folder);
        }
    }
    return folders;
}

await runCommandLine(USAGE, async () => {
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        options: { "product-config": { type: "string" }, "output": { type: "string" } },
    });
    const product = await loadProduct(values["product-config"]);
    if (!values.output && !positionals.length) {
        throw new InputError("Give the folders to validate, or a docs folder with --output.");
    }
    const folders = [...positionals, ...(values.output ? await getFolders(values.output, product.admx.file) : [])];

    let invalid = 0;
    for (const folder of folders) {
        const problems = await validateAdmx({
            admx: pathUtils.join(folder, `${product.admx.file}.admx`),
            adml: pathUtils.join(folder, "en-US", `${product.admx.file}.adml`),
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
