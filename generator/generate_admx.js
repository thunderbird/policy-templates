/**
 * Generate the Windows templates (<output>/policies/<branch>/admx/: the ADMX
 * and ADML files) of the branches of a product from their policy schema.
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
