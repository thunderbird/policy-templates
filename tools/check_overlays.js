/**
 * Check the documentation of the branches without changing anything: the rules
 * of the policy schema for every branch, and for the other branches their
 * differences from main (see modules/branch_overlay.mjs). Exits with code 1 if
 * there are problems, e.g. before committing changes to the product's
 * overrides/ folder.
 */

import { parseArgs } from "node:util";

import { checkDocumentation, compareWithMain } from "./modules/branch_overlay.mjs";
import { BRANCHES_OPTION, BRANCHES_USAGE, loadBranch, parseCommonOptions } from "../generator/modules/branches.mjs";
import { SOURCE_OPTIONS, SOURCE_USAGE } from "../generator/modules/sources.mjs";
import { runCommandLine } from "../generator/modules/tools.mjs";

const usage = `
Usage:

    node check_overlays.js [options]

Options:${BRANCHES_USAGE}
                        The branches to check, main is always loaded.
${SOURCE_USAGE}
`;

await runCommandLine(usage, async () => {
    const { values } = parseArgs({
        options: { ...SOURCE_OPTIONS, ...BRANCHES_OPTION },
    });
    const { sources, branches } = await parseCommonOptions(values);
    const main = await loadBranch({ ...sources, branch: "main" });
    let failed = false;
    for (const branch of branches) {
        const branchData = branch == "main"
            ? main
            : await loadBranch({ ...sources, branch });
        const problems = [
            ...checkDocumentation(branchData),
            ...(branch == "main" ? [] : compareWithMain(branchData, main)),
        ];
        console.log(`${branch}: ${problems.length ? `${problems.length} problems` : "no problems"}`);
        for (const problem of problems) {
            console.log(` - ${problem}`);
        }
        failed ||= problems.length > 0;
    }
    if (failed) {
        process.exit(1);
    }
});
