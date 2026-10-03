/**
 * Check the product's policy schemas (overrides/<branch>.schema.json in the
 * product folder) without changing anything, for each given branch:
 * - the rules of the documentation (see checkDocumentation()),
 * - the drift from the schema of the product's repository (e.g. comm) of
 *   the branch: what it has and the product's file doesn't, e.g. a new policy
 *   upstream (see findDrift()).
 * Exits with code 1 if there are problems, e.g. before committing changes to
 * the product's schemas.
 */

import { parseArgs } from "node:util";

import { checkDocumentation, findDrift } from "./modules/schema_checks.mjs";
import {
    BRANCHES_OPTION, BRANCHES_USAGE, loadBranch, parseCommonOptions, readRepositorySchema,
} from "../generator/modules/branches.mjs";
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
    const { product, sources, branches } = await parseCommonOptions(values);
    let failed = false;
    for (const branch of branches) {
        const branchData = await loadBranch({ ...sources, branch });
        const upstream = await readRepositorySchema(sources.app, product, branchData.commit);
        const drift = upstream
            ? findDrift({ upstream, ours: branchData.schema })
            : [`the product's repository has no ${product.source.schema}`];
        const problems = checkDocumentation(branchData);
        console.log(`${branch}: ${drift.length} drift, ${problems.length} documentation problems`);
        for (const entry of drift) {
            console.log(` - drift: ${entry}`);
        }
        for (const problem of problems) {
            console.log(` - ${problem}`);
        }
        failed ||= drift.length > 0 || problems.length > 0;
    }
    if (failed) {
        process.exit(1);
    }
});
