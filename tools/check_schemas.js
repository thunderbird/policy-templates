/**
 * Check the product's policy schemas (overrides/<branch>.schema.json in the
 * product folder) against the rules of the documentation (see
 * checkDocumentation()), for each given branch, without changing anything.
 * Exits with code 1 if there are problems, e.g. before committing changes to
 * the product's schemas.
 */

import { parseArgs } from "node:util";

import { checkDocumentation } from "./modules/schema_checks.mjs";
import { BRANCHES_OPTION, BRANCHES_USAGE, loadBranch, parseCommonOptions } from "../generator/modules/branches.mjs";
import { SOURCE_OPTIONS, SOURCE_USAGE } from "../generator/modules/sources.mjs";
import { runCommandLine } from "../generator/modules/tools.mjs";

const usage = `
Usage:

    node check_schemas.js [options]

Options:${BRANCHES_USAGE}
                        The branches to check.
${SOURCE_USAGE}
`;

await runCommandLine(usage, async () => {
    const { values } = parseArgs({
        options: { ...SOURCE_OPTIONS, ...BRANCHES_OPTION },
    });
    const { sources, branches } = await parseCommonOptions(values);
    let failed = false;
    for (const branch of branches) {
        const branchData = await loadBranch({ ...sources, branch });
        const problems = checkDocumentation(branchData);
        console.log(`${branch}: ${problems.length} documentation problems`);
        for (const problem of problems) {
            console.log(` - ${problem}`);
        }
        failed ||= problems.length > 0;
    }
    if (failed) {
        process.exit(1);
    }
});
