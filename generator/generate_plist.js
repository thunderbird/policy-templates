/**
 * Generate the macOS template (<output>/policies/<branch>/plist/: the plist file) of
 * the branches of a product from their policy schema.
 */

import { runTool } from "./modules/branches.mjs";
import { generateMacTemplate } from "./modules/generate_plist.mjs";

await runTool({
    usage: `
Usage:

    node generate_plist.js [options]

Options:`,
    outputs: [
        (branchData, values, sources, output) => generateMacTemplate(branchData, { output }),
    ],
});
