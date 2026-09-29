/**
 * Generate the enterprise policy documentation and templates for a single
 * Thunderbird branch.
 *
 * See https://bugzilla.mozilla.org/show_bug.cgi?id=1732258
 */

import { generateBranch } from "./modules/generate_branch.mjs";
import { SOURCE_OPTIONS, SOURCE_USAGE, createSources } from "./modules/sources.mjs";
import { InputError, runCommandLine } from "./modules/tools.mjs";

import { parseArgs } from "node:util";

const USAGE = `
Usage:

    node update_policy_templates.js --branch=name [options]

Options:
   --branch=name    - The Thunderbird branch to generate the documentation for,
                      e.g. "main", "beta", "release" or "esr140".
   --policies-yaml=path
                    - Path to a file to be used instead of the policies.yaml file
                      of the branch.
${SOURCE_USAGE}
`;

await runCommandLine(USAGE, async () => {
    const { values } = parseArgs({
        options: {
            ...SOURCE_OPTIONS,
            "branch": { type: "string" },
            "policies-yaml": { type: "string" },
        },
    });
    if (!values.branch) {
        throw new InputError("Missing --branch.");
    }

    const { tb, ff } = await createSources(values);
    await generateBranch({
        tb,
        ff,
        branch: values.branch,
        policiesYamlPath: values["policies-yaml"],
    });
});
