/**
 * Generate the Markdown docs, the Windows templates and the macOS template of
 * the given branches of a product, and the overview of all templates: all of
 * generate_docs.js, generate_admx.js, generate_plist.js and
 * generate_overview.js in one run, which loads the data of each branch only
 * once. The files of the product's site/ folder are added unchanged.
 *
 * Everything is built in a temporary folder next to the target (<output>.temp)
 * first. Only if the whole run succeeded, it replaces the whole target, which
 * then has exactly the given branches, so a failed run leaves the target as
 * it was. The temporary folder is deleted when the run ends, however it ends.
 */

import fsSync from "node:fs";
import fs from "node:fs/promises";
import pathUtils from "node:path";

import { runTool } from "./modules/branches.mjs";
import { generateWindowsTemplates } from "./modules/generate_admx.mjs";
import { generateDocs, generateOverview } from "./modules/generate_markdown.mjs";
import { generateMacTemplate } from "./modules/generate_plist.mjs";
import { InputError, ensureDir } from "./modules/tools.mjs";

let main;
await runTool({
    usage: `
Usage:

    node update_all_policy_templates.js [options]

All of the target (--output) is replaced: it then has the overview, the given
branches (main is required, for the overview) and the files of the product's
site/ folder.

Options:`,
    async prepare(output, branches) {
        if (!branches.includes("main")) {
            throw new InputError("The overview needs the main branch (its compatibility data), add it to --branches.");
        }
        const buildDir = `${pathUtils.resolve(output)}.temp`;
        // Left over by a run which was killed hard (kill -9), which can't
        // clean up.
        await fs.rm(buildDir, { recursive: true, force: true });
        await ensureDir(buildDir);
        // Delete it however the run ends: normally, by process.exit()
        // (errors), or interrupted (Ctrl+C and kill end Node without the
        // "exit" event otherwise).
        process.on("exit", () => fsSync.rmSync(buildDir, { recursive: true, force: true }));
        process.on("SIGINT", () => process.exit(130));
        process.on("SIGTERM", () => process.exit(143));
        return buildDir;
    },
    outputs: [
        (branchData, values, { app, branches }, output) => generateDocs(branchData, { app, branches, output }),
        (branchData, values, { mozilla }, output) => generateWindowsTemplates(branchData, { mozilla, output }),
        (branchData, values, sources, output) => generateMacTemplate(branchData, { output }),
        branchData => {
            if (branchData.branch == "main") {
                main = branchData;
            }
        },
    ],
    async finish({ sources, branches, output, buildDir }) {
        await generateOverview({ ...sources, branches, main }, buildDir);
        await fs.cp(sources.product.siteDir, buildDir, { recursive: true });
        await fs.rm(output, { recursive: true, force: true });
        await fs.rename(buildDir, output);
    },
});
