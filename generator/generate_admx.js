/**
 * Generate the Windows templates (<output>/policies/<branch>/admx/: the ADMX
 * and ADML files) of a branch of a product from its policy schema.
 */

import { runTool } from "./modules/branches.mjs";
import { generateWindowsTemplates } from "./modules/generate_admx.mjs";

await runTool({
    usage: `
Usage:

    node generate_admx.js [options]

Options:`,
    outputs: [
        (branchData, values, { mozilla }, output) => generateWindowsTemplates(branchData, { mozilla, output }),
    ],
});
