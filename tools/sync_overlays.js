/**
 * Derive the schema overlays of the branches other than main
 * (<branch>.schema.json in the product's overrides/ folder) from main: every node which main has too gets
 * main's documentation (texts, examples, hints), except the nodes marked with
 * "x-differs-from-main", which document where the branch behaves differently.
 * See modules/branch_overlay.mjs.
 */

import fs from "node:fs/promises";
import { parseArgs } from "node:util";

import { checkDocumentation, compareWithMain, syncOverlay } from "./modules/branch_overlay.mjs";
import { BRANCHES_OPTION, BRANCHES_USAGE, loadBranch, parseCommonOptions } from "../generator/modules/branches.mjs";
import { getSchemaOverlay } from "../generator/modules/product.mjs";
import { SOURCE_OPTIONS, SOURCE_USAGE } from "../generator/modules/sources.mjs";
import { InputError, runCommandLine } from "../generator/modules/tools.mjs";

const usage = `
Usage:

    node sync_overlays.js [options]

Options:${BRANCHES_USAGE}
                        The branches whose overlay is derived (main, which has
                        no overlay, is skipped).
${SOURCE_USAGE}
`;

await runCommandLine(usage, async () => {
    const { values } = parseArgs({
        options: { ...SOURCE_OPTIONS, ...BRANCHES_OPTION },
    });
    const { product, sources, branches: requested } = await parseCommonOptions(values);
    const branches = requested.filter(branch => branch != "main");
    const main = await loadBranch({ ...sources, branch: "main" });
    for (const branch of branches) {
        const overlayPath = await getSchemaOverlay(product, branch);
        if (!overlayPath) {
            throw new InputError(`The branch "${branch}" has no schema overlay.`);
        }
        console.log(`Processing ${branch}`);
        const overlay = JSON.parse(await fs.readFile(overlayPath, "utf8"));
        const base = await loadBranch({ ...sources, branch, schemaOverlayPath: null });
        const result = syncOverlay({ base: base.schema, overlay, main, l10n: base.l10n });
        await fs.writeFile(overlayPath, `${JSON.stringify(result, null, 2)}\n`);

        const synced = await loadBranch({ ...sources, branch, schemaOverlayPath: overlayPath });
        const problems = [...compareWithMain(synced, main), ...checkDocumentation(synced)];
        for (const problem of problems) {
            console.log(` - ${problem}`);
        }
    }
});
