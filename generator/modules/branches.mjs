import {
    addSupportedSince,
    buildCompatibilityData,
    getCompatibilityInformation,
    getSchemaRevisions,
} from "./compatibility.mjs";
import { SchemaL10n } from "./l10n.mjs";
import { getChannelLabel, getSchemaOverlay, loadProduct, parseBranches } from "./product.mjs";
import { SOURCE_OPTIONS, SOURCE_USAGE, createSources } from "./sources.mjs";
import { InputError, ensureDir, runCommandLine } from "./tools.mjs";

import commentJson from "comment-json";
import fs from "node:fs/promises";
import pathUtils from "node:path";
import { parseArgs } from "node:util";

/**
 * Resolve a branch of the product's source.
 *
 * @param {LocalGitSource|GitHubSource} app - The product's source.
 * @param {string} branch
 * @returns {Promise<string>} the commit
 */
async function resolveBranch(app, branch) {
    const commit = await app.resolveBranch(branch);
    if (!commit) {
        throw new InputError(`Unknown branch "${branch}" in ${app.description}.`);
    }
    return commit;
}

/**
 * Load the Fluent files of the product (source.fluent in product.yaml) of a
 * commit. Files which the commit doesn't have are skipped.
 *
 * @param {LocalGitSource|GitHubSource} app - The product's source.
 * @param {Product} product
 * @param {string} commit
 * @returns {Promise<SchemaL10n>}
 */
async function loadL10n(app, product, commit) {
    return new SchemaL10n((await Promise.all(product.source.fluent.map(
        async name => ({ name, source: await app.readFile(commit, name) })
    ))).filter(({ source }) => source !== null));
}

/**
 * Format the name of a branch: the brand name, the label of its channel and
 * its version, e.g. "Thunderbird ESR 140.17.0" ("Thunderbird 153.0" for a
 * channel without label).
 *
 * @param {Product} product
 * @param {string} branch
 * @param {string} brandName - The short brand name (-brand-short-name).
 * @param {string} version
 * @returns {string}
 */
export function formatBranchName(product, branch, brandName, version) {
    return [brandName, getChannelLabel(product, branch), version].filter(Boolean).join(" ");
}

/**
 * Get the name and the version of a branch, e.g. "Thunderbird ESR 140.17.0"
 * and "140.17.0", without loading all its data.
 *
 * @param {LocalGitSource|GitHubSource} app - The product's source.
 * @param {Product} product
 * @param {string} branch
 * @returns {Promise<{name: string, version: string}>}
 */
async function getBranchInfo(app, product, branch) {
    const commit = await resolveBranch(app, branch);
    const l10n = await loadL10n(app, product, commit);
    const version = (await app.readFile(commit, product.source.version)).trim();
    return { name: formatBranchName(product, branch, l10n.term("brand-short-name"), version), version };
}

const BRANCH_LISTS = new Map();

/**
 * Get the branches of a run, sorted as in the overview (main, beta, release,
 * then the ESR branches, newest first), with their names, versions and the
 * URLs of their docs. Built once per run and set of branches.
 *
 * @param {Object} params
 * @param {LocalGitSource|GitHubSource} params.app - The product's source.
 * @param {Product} params.product
 * @param {string[]} params.branches
 * @returns {Promise<{branch: string, name: string, version: string, docsUrl: string}[]>}
 */
export function getBranchList({ app, product, branches }) {
    const key = `${app.description}|${product.dir}|${branches.join(",")}`;
    if (!BRANCH_LISTS.has(key)) {
        const sorted = [...branches].sort((a, b) => {
            const [a1, a2] = getBranchSortKey(a);
            const [b1, b2] = getBranchSortKey(b);
            return a1 - b1 || a2 - b2 || a.localeCompare(b);
        });
        BRANCH_LISTS.set(key, Promise.all(sorted.map(async branch => ({
            branch,
            ...await getBranchInfo(app, product, branch),
            docsUrl: `${product.docsUrl}/policies/${branch}`,
        }))));
    }
    return BRANCH_LISTS.get(key);
}

/**
 * Sort key for branches: main, beta, release, then ESRs (newest first).
 *
 * @param {string} branch
 * @returns {number[]}
 */
function getBranchSortKey(branch) {
    const esr = branch.match(/^esr(\d+)$/);
    if (esr) {
        return [3, -Number(esr[1])];
    }
    const idx = ["main", "beta", "release"].indexOf(branch);
    return [idx == -1 ? 4 : idx, 0];
}

/**
 * Merge an overlay onto a policy schema: the overlay has the structure of the
 * schema (e.g. { "properties": { "Cookies": { "description": … } } }) and adds
 * texts, examples and hints to its nodes, for branches whose schema doesn't
 * have them yet. Objects are merged, other values replaced.
 * The overlay can not add settings: every object of the overlay must exist in
 * the schema, except the values of keywords starting with "x-". A value null
 * removes the keyword (e.g. a text which main no longer has).
 *
 * @param {Object} schema - Modified in place.
 * @param {Object} overlay
 * @param {string} where - The path, for error messages.
 */
export function mergeSchemaOverlay(schema, overlay, where) {
    const isObject = value => !!value && typeof value == "object" && !Array.isArray(value);
    for (const [key, value] of Object.entries(overlay)) {
        if (isObject(value) && !key.startsWith("x-")) {
            if (!isObject(schema[key])) {
                throw new InputError(`The schema overlay ${where}.${key} has no counterpart in the policy schema.`);
            }
            mergeSchemaOverlay(schema[key], value, `${where}.${key}`);
        } else if (value === null) {
            delete schema[key];
        } else {
            schema[key] = value;
        }
    }
}

/**
 * Get the ESR branches of the product's repository, sorted by version. Their
 * history tells which policies were backported.
 *
 * @param {LocalGitSource|GitHubSource} app - The product's source.
 * @returns {Promise<string[]>} e.g. ["esr115", "esr128", "esr140"]
 */
async function getEsrBranches(app) {
    return (await app.listBranches())
        .map(branch => branch.match(/^esr(\d+)$/))
        .filter(Boolean)
        .sort((a, b) => Number(a[1]) - Number(b[1]))
        .map(match => match[0]);
}

/**
 * Get the compatibility data of a branch, based on the history of its policy
 * schema file.
 *
 * @param {LocalGitSource|GitHubSource} app - The product's source.
 * @param {Product} product
 * @param {string} branch
 * @returns {Promise<CompatibilityData|null>} null if the branch does not exist
 */
async function getBranchCompatibilityData(app, product, branch) {
    const commit = await app.resolveBranch(branch);
    if (!commit) {
        return null;
    }
    return buildCompatibilityData(await getSchemaRevisions(app, commit, product.source));
}

/**
 * Load what the docs and templates of a branch are generated from.
 *
 * @param {Object} params
 * @param {LocalGitSource|GitHubSource} params.app - The product's source.
 * @param {Product} params.product - See loadProduct().
 * @param {string} params.branch - The branch, e.g. "main", "release" or "esr140".
 * @param {?string} [params.schemaOverlayPath] - Path to a file with texts and
 *    examples for the policy schema of the branch, see mergeSchemaOverlay(). By
 *    default the overlay of the branch in the product's overrides/ folder, null
 *    for none.
 *
 * @returns {Promise<BranchData>} with
 *    - product, branch, commit, version and name (e.g. "Thunderbird ESR
 *      140.3.0"),
 *    - schema: the policy schema of the branch, with its overlay,
 *    - l10n: resolves the texts given as Fluent messages (Fluent files of the
 *      branch),
 *    - compatData: the compatibility data,
 *    - supportedPolicyNames: the flattened names of the supported policies,
 *    - supportedPolicies: the supported policies grouped by version.
 */
export async function loadBranch({ app, product, branch, schemaOverlayPath }) {
    const commit = await resolveBranch(app, branch);

    // Find supported policies. The version in which a policy became supported
    // is based on the release branch, backports are found in the ESR branches.
    const compatData = buildCompatibilityData(await getSchemaRevisions(app, commit, product.source));
    const esrs = [];
    for (const esrBranch of await getEsrBranches(app)) {
        esrs.push({
            branch: esrBranch,
            data: esrBranch == branch
                ? compatData
                : await getBranchCompatibilityData(app, product, esrBranch),
        });
    }
    addSupportedSince(compatData, {
        branch,
        release: branch == "release"
            ? compatData
            : await getBranchCompatibilityData(app, product, "release"),
        esrs,
    });
    const supportedPolicyNames = Object.keys(compatData)
        .sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

    const supportedPolicies = getCompatibilityInformation(compatData, { distinct: true })
        .filter(e => e.first != "");

    const schema = commentJson.parse(await app.readFile(commit, product.source.schema));
    if (schemaOverlayPath === undefined) {
        schemaOverlayPath = await getSchemaOverlay(product, branch);
    }
    if (schemaOverlayPath) {
        console.log(` - policy schema extended by ${pathUtils.relative(process.cwd(), schemaOverlayPath)}`);
        mergeSchemaOverlay(schema, JSON.parse(await fs.readFile(schemaOverlayPath, "utf8")), schemaOverlayPath);
    }
    const l10n = await loadL10n(app, product, commit);
    const version = (await app.readFile(commit, product.source.version)).trim();

    return {
        product,
        branch,
        commit,
        version,
        name: formatBranchName(product, branch, l10n.term("brand-short-name"), version),
        schema,
        l10n,
        compatData,
        supportedPolicyNames,
        supportedPolicies,
    };
}

/**
 * Generate one part of the folder of a branch (e.g. "admx" or "README.md")
 * in a docs folder: the part is deleted and written fresh, so nothing of a
 * previous run is left.
 *
 * @param {string} output - The docs folder, the branches are in its
 *    policies/ folder.
 * @param {string} branch
 * @param {string} part - The file or folder inside the folder of the branch.
 * @param {function(string): Promise} build - Writes the part into the given
 *    folder of the branch.
 */
export async function writeOutput(output, branch, part, build) {
    const branchDir = pathUtils.join(output, "policies", branch);
    await fs.rm(pathUtils.join(branchDir, part), { recursive: true, force: true });
    await ensureDir(branchDir);
    await build(branchDir);
}

/**
 * Parse the options which all tools have: the product (--product-config), the
 * branches (--branches) and the sources, see SOURCE_OPTIONS.
 *
 * @param {Object} values - The values returned by util.parseArgs().
 * @returns {Promise<{product: Product, branches: string[], sources: Object}>}
 *    sources: see createSources()
 */
export async function parseCommonOptions(values) {
    const product = await loadProduct(values["product-config"]);
    const branches = parseBranches(values.branches, product);
    const sources = await createSources(values, product);
    return { product, branches, sources };
}

export const BRANCHES_OPTION = { "branches": { type: "string" } };

export const BRANCHES_USAGE = `
   --branches=list    - The branches, separated by commas (required), e.g.
                        "main,beta,release,esr140".`;

/**
 * Run a generator tool on the command line: for each requested branch, load
 * its data and generate the given outputs into a docs folder (the branches go
 * to its policies/ folder).
 *
 * @param {Object} params
 * @param {string} params.usage - The description of the tool and its own
 *    options. The common options are added.
 * @param {Object} [params.options] - Further options (parseArgs format), which
 *    can only be used with a single branch.
 * @param {function(BranchData, Object, Object, string): Promise} params.outputs -
 *    Each called with the data of the branch, the option values, the sources
 *    (see createSources(), plus the branches of the run) and the docs folder.
 * @param {function(string, string[]): Promise<string>} [params.prepare] -
 *    Called with the value of --output and the branches before the first
 *    branch, returns the folder to write to (by default the --output folder).
 * @param {function(Object): Promise} [params.finish] - Called after all
 *    branches with { values, sources, branches, output, buildDir }.
 */
export async function runTool({ usage, options = {}, outputs, prepare, finish }) {
    const fullUsage = `${usage}
   --output=path      - The docs folder to write to (required). The files of
                        each branch go to <path>/policies/<branch>/.${BRANCHES_USAGE}
   --schema-overlay=path
                      - Path to a file with texts and examples which are merged
                        onto the policy schema of the branch (by default the
                        overlay of the branch in the product's overrides/
                        folder, <branch>.schema.json).
${SOURCE_USAGE}
`;
    await runCommandLine(fullUsage, async () => {
        const { values } = parseArgs({
            options: {
                ...SOURCE_OPTIONS,
                ...BRANCHES_OPTION,
                "schema-overlay": { type: "string" },
                "output": { type: "string" },
                ...options,
            },
        });
        if (!values.output) {
            throw new InputError("--output is required.");
        }
        const { sources, branches } = await parseCommonOptions(values);
        for (const option of ["schema-overlay", ...Object.keys(options)]) {
            if (values[option] && branches.length != 1) {
                throw new InputError(`--${option} can only be used with a single branch.`);
            }
        }

        const buildDir = prepare ? await prepare(values.output, branches) : values.output;
        for (const branch of branches) {
            console.log(`Processing ${branch}`);
            const branchData = await loadBranch({
                ...sources,
                branch,
                schemaOverlayPath: values["schema-overlay"],
            });
            for (const generate of outputs) {
                await generate(branchData, values, { ...sources, branches }, buildDir);
            }
        }
        await finish?.({ values, sources, branches, output: values.output, buildDir });
    });
}
