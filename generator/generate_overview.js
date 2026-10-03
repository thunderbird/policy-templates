/**
 * Generate the overview of all templates (<output>/README.md): the list of the
 * given branches, and the compatibility table of main.
 */

import { parseArgs } from "node:util";

import { BRANCHES_OPTION, BRANCHES_USAGE, parseCommonOptions } from "./modules/branches.mjs";
import { generateOverview } from "./modules/generate_markdown.mjs";
import { SOURCE_OPTIONS, SOURCE_USAGE } from "./modules/sources.mjs";
import { InputError, runCommandLine } from "./modules/tools.mjs";

const usage = `
Usage:

    node generate_overview.js [options]

Options:
   --output=path      - The docs folder to write README.md to (required).${BRANCHES_USAGE}
                        The overview lists these branches, main is required.
${SOURCE_USAGE}
`;

await runCommandLine(usage, async () => {
    const { values } = parseArgs({
        options: { ...SOURCE_OPTIONS, ...BRANCHES_OPTION, "output": { type: "string" } },
    });
    if (!values.output) {
        throw new InputError("--output is required.");
    }
    const { sources, branches } = await parseCommonOptions(values);
    await generateOverview({ ...sources, branches }, values.output);
});
