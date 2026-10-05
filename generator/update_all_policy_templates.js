/**
 * Generate the Markdown docs, the Windows templates and the macOS template of
 * all branches of a product (main, beta, release and the ESR branches from
 * OLDEST_ESR on, see getSupportedBranches()) (what generate_docs.js, generate_admx.js
 * and generate_plist.js do for one branch), loading the data of each branch
 * only once, and the overview of all templates. The files of the product's
 * site/ folder are added unchanged.
 *
 * Everything is built in a temporary folder next to the target (<output>.temp)
 * first. Only if the whole run succeeded, it replaces the whole target, which
 * then has exactly these branches, so a failed run leaves the target as it
 * was. The temporary folder is deleted when the run ends, however it ends.
 */

import fsSync from "node:fs";
import fs from "node:fs/promises";
import pathUtils from "node:path";

import { runAllBranches } from "./modules/branches.mjs";
import { generateWindowsTemplates } from "./modules/generate_admx.mjs";
import { generateDocs, generateOverview } from "./modules/generate_markdown.mjs";
import { generateMacTemplate } from "./modules/generate_plist.mjs";
import { InputError, ensureDir } from "./modules/tools.mjs";

let main;
await runAllBranches({
    usage: `
Usage:

    node update_all_policy_templates.js [options]

It builds all branches of the product's repository: main, beta, release and
the ESR branches from OLDEST_ESR (constants.mjs) on. All of the target
(--output) is replaced: it then has the overview, these branches and the
files of the product's site/ folder.

Options:`,
    async prepare(output, branches) {
        if (!branches.includes("main")) {
            throw new InputError("The overview needs the main branch (its compatibility data), which the product's repository doesn't have.");
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
