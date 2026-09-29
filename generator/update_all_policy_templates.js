/**
 * Generate the enterprise policy documentation and templates for all current
 * Thunderbird branches: beta, release, all ESR branches starting with MIN_ESR,
 * and main (which also updates the overview of all templates).
 */

import { generateBranch } from "./modules/generate_branch.mjs";
import { SOURCE_OPTIONS, SOURCE_USAGE, createSources } from "./modules/sources.mjs";
import { runCommandLine } from "./modules/tools.mjs";

import { parseArgs } from "node:util";

// The oldest ESR branch to generate the documentation for.
const MIN_ESR = 115;

// Files used instead of the branch's policies.yaml, until the in-tree files
// include all changes. Paths are relative to the generator folder.
const POLICIES_YAML_OVERRIDES = new Map([
    ["main", "../config/central.yaml"],
    ["release", "../config/release.yaml"],
    ["esr140", "../config/esr140.yaml"],
    ["esr128", "../config/esr128.yaml"],
    ["esr115", "../config/esr115.yaml"],
]);

const USAGE = `
Usage:

    node update_all_policy_templates.js [options]

Options:
${SOURCE_USAGE}
`;

await runCommandLine(USAGE, async () => {
    const { values } = parseArgs({ options: SOURCE_OPTIONS });
    const { tb, ff } = await createSources(values);

    const available = await tb.listBranches();
    const esrBranches = available
        .map(branch => branch.match(/^esr(\d+)$/))
        .filter(match => match && Number(match[1]) >= MIN_ESR)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .map(match => match[0]);

    // Process main last, as it updates the overview of all generated templates.
    const branches = ["beta", "release", ...esrBranches, "main"]
        .filter(branch => available.includes(branch));

    for (const branch of branches) {
        await generateBranch({
            tb,
            ff,
            branch,
            policiesYamlPath: POLICIES_YAML_OVERRIDES.get(branch),
        });
    }
});
