import { writeOutput } from "./branches.mjs";
import { getExample, getPolicyData, hasFormat } from "./schema_settings.mjs";
import { ensureDir } from "./tools.mjs";
import fs from "node:fs/promises";
import pathUtils from "node:path";
import plist from "plist";

/**
 * Sort the keys of all objects, also inside arrays.
 */
function sortKeysRecursively(value) {
    if (Array.isArray(value)) {
        return value.map(sortKeysRecursively);
    }
    if (value && typeof value == "object") {
        return Object.fromEntries(Object.keys(value)
            .sort((a, b) => a.localeCompare(b))
            .map(key => [key, sortKeysRecursively(value[key])]));
    }
    return value;
}

/**
 * Build the macOS template: a plist file with every supported policy of the
 * branch with the format "plist" (see "x-formats"), each with the first of its
 * "examples" in the policy schema.
 *
 * @param {Object} schema - The policy schema of the branch, see loadBranch().
 * @param {string[]} supportedPolicyNames - Flattened names of the supported
 *    policies, e.g. "InstallAddonsPermission_Allow".
 * @returns {string}
 */
export function buildPlistTemplate(schema, supportedPolicyNames) {
    const policies = {};
    for (const policyName of Object.keys(schema.properties ?? {})) {
        const policyData = getPolicyData(schema, policyName);
        if (!supportedPolicyNames.includes(policyName) || !hasFormat(policyData, "plist")) {
            continue;
        }
        policies[policyName] = getExample(schema, [policyName]);
    }
    return plist.build(sortKeysRecursively(policies));
}

/**
 * Generate the macOS template of a branch (its plist/ folder), see
 * buildPlistTemplate().
 *
 * @param {BranchData} branchData - See loadBranch().
 * @param {Object} options
 * @param {string} options.output - The docs folder, see writeOutput().
 */
export async function generateMacTemplate(branchData, { output }) {
    await writeOutput(output, branchData.branch, "plist", async dir => {
        await ensureDir(pathUtils.join(dir, "plist"));
        await fs.writeFile(
            pathUtils.join(dir, "plist", `${branchData.product.plist.domain}.plist`),
            buildPlistTemplate(branchData.schema, branchData.supportedPolicyNames)
        );
    });
}
