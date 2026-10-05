import {
    addSupportedSince,
    buildCompatibilityData,
    dropRemovedBefore,
    getCompatibilityInformation,
    getSchemaRevisions,
} from "./compatibility.mjs";
import { SchemaL10n } from "./l10n.mjs";
import { getChannelLabel, getSchemaFile, loadProduct, parseBranch, parseBranches } from "./product.mjs";
import { OLDEST_ESR } from "./constants.mjs";
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
 * Get the branches of the product's repository the docs are built for: main,
 * beta, release and the ESR branches from OLDEST_ESR on, sorted as in the
 * overview (other branches, e.g. autoland, are left out).
 *
 * @param {LocalGitSource|GitHubSource} app - The product's source.
 * @returns {Promise<string[]>} e.g. ["main", "beta", "release", "esr153", "esr140"]
 */
export async function getSupportedBranches(app) {
    return (await app.listBranches())
        .filter(branch => ["main", "beta", "release"].includes(branch) || isSupportedEsr(branch))
        .sort((a, b) => {
            const [a1, a2] = getBranchSortKey(a);
            const [b1, b2] = getBranchSortKey(b);
            return a1 - b1 || a2 - b2 || a.localeCompare(b);
        });
}

/**
 * Whether a branch is an ESR branch from OLDEST_ESR on.
 *
 * @param {string} branch
 * @returns {boolean}
 */
function isSupportedEsr(branch) {
    const esr = branch.match(/^esr(\d+)$/);
    return !!esr && Number(esr[1]) >= OLDEST_ESR;
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
 * Get the ESR branches of the product's repository from OLDEST_ESR on, sorted
 * by version. Their history tells which policies were backported.
 *
 * @param {LocalGitSource|GitHubSource} app - The product's source.
 * @returns {Promise<string[]>} e.g. ["esr128", "esr140", "esr153"]
 */
async function getEsrBranches(app) {
    return (await app.listBranches())
        .filter(isSupportedEsr)
        .sort((a, b) => Number(a.slice(3)) - Number(b.slice(3)));
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
 * Read the policy schema of a commit of the product's repository
 * (source.schema in product.yaml): not the product's own schema of the branch
 * (see loadBranch()), but the one it is compared with, e.g. by the drift check
 * of tools/check_schemas.js.
 *
 * @param {LocalGitSource|GitHubSource} app - The product's source.
 * @param {Product} product
 * @param {string} commit
 * @returns {Promise<?Object>} null if the commit has no schema
 */
export async function readRepositorySchema(app, product, commit) {
    const text = await app.readFile(commit, product.source.schema);
    return text === null ? null : commentJson.parse(text);
}

/**
 * Load what the docs and templates of a branch are generated from.
 *
 * @param {Object} params
 * @param {LocalGitSource|GitHubSource} params.app - The product's source.
 * @param {Product} params.product - See loadProduct().
 * @param {string} params.branch - The branch, e.g. "main", "release" or "esr140".
 *
 * @returns {Promise<BranchData>} with
 *    - product, branch, commit, version and name (e.g. "Thunderbird ESR
 *      140.3.0"),
 *    - schema: the policy schema of the branch, from the product folder
 *      (overrides/<branch>.schema.json), see getSchemaFile(),
 *    - l10n: resolves the texts given as Fluent messages (Fluent files of the
 *      branch),
 *    - compatData: the compatibility data,
 *    - supportedPolicyNames: the flattened names of the supported policies,
 *    - supportedPolicies: the supported policies grouped by version.
 */
export async function loadBranch({ app, product, branch }) {
    // The product's own schema of the branch, the authority for the docs and
    // the templates. The product's repository gives the version, the Fluent
    // files and the compatibility (the history of its schema).
    const schema = commentJson.parse(await fs.readFile(await getSchemaFile(product, branch), "utf8"));
    const commit = await resolveBranch(app, branch);

    // Find supported policies. The version in which a policy became supported
    // is based on the release branch, backports are found in the ESR branches.
    // Policies removed before OLDEST_ESR are of no branch of the docs.
    const compatData = buildCompatibilityData(await getSchemaRevisions(app, commit, product.source));
    dropRemovedBefore(compatData, OLDEST_ESR);
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

export const BRANCH_OPTION = { "branch": { type: "string" } };

export const BRANCH_USAGE = `
   --branch=name      - The branch (required), e.g. "main", "release" or
                        "esr140".`;

const OUTPUT_USAGE = `
   --output=path      - The docs folder to write to (required). The files of
                        each branch go to <path>/policies/<branch>/.`;

/**
 * Run a generator tool on the command line: load the data of the given branch
 * (--branch) and generate the given outputs into a docs folder (the branch
 * goes to its policies/ folder).
 *
 * @param {Object} params
 * @param {string} params.usage - The description of the tool. The common
 *    options are added.
 * @param {function(BranchData, Object, Object, string): Promise} params.outputs -
 *    Each called with the data of the branch, the option values, the sources
 *    (see createSources(), plus the branches of the run: the branch) and the
 *    docs folder.
 */
export async function runTool({ usage, outputs }) {
    const fullUsage = `${usage}${OUTPUT_USAGE}${BRANCH_USAGE}
${SOURCE_USAGE}
`;
    await runCommandLine(fullUsage, async () => {
        const { values } = parseArgs({
            options: { ...SOURCE_OPTIONS, ...BRANCH_OPTION, "output": { type: "string" } },
        });
        if (!values.output) {
            throw new InputError("--output is required.");
        }
        const product = await loadProduct(values["product-config"]);
        const branch = parseBranch(values.branch, product);
        const sources = await createSources(values, product);
        const branchData = await loadBranch({ ...sources, branch });
        for (const generate of outputs) {
            await generate(branchData, values, { ...sources, branches: [branch] }, values.output);
        }
    });
}

/**
 * Run the wrapper on the command line: for each branch of the product's
 * repository the docs are built for (see getSupportedBranches()), load its
 * data and generate the given outputs into a docs folder (the branches go to
 * its policies/ folder).
 *
 * @param {Object} params
 * @param {string} params.usage - The description of the wrapper. The common
 *    options are added.
 * @param {function(BranchData, Object, Object, string): Promise} params.outputs -
 *    Each called with the data of the branch, the option values, the sources
 *    (see createSources(), plus the branches of the run) and the docs folder.
 * @param {function(string, string[]): Promise<string>} [params.prepare] -
 *    Called with the value of --output and the branches before the first
 *    branch, returns the folder to write to (by default the --output folder).
 * @param {function(Object): Promise} [params.finish] - Called after all
 *    branches with { values, sources, branches, output, buildDir }.
 */
export async function runAllBranches({ usage, outputs, prepare, finish }) {
    const fullUsage = `${usage}${OUTPUT_USAGE}
${SOURCE_USAGE}
`;
    await runCommandLine(fullUsage, async () => {
        const { values } = parseArgs({
            options: { ...SOURCE_OPTIONS, "output": { type: "string" } },
        });
        if (!values.output) {
            throw new InputError("--output is required.");
        }
        const product = await loadProduct(values["product-config"]);
        const sources = await createSources(values, product);
        const branches = await getSupportedBranches(sources.app);
        const buildDir = prepare ? await prepare(values.output, branches) : values.output;
        for (const branch of branches) {
            console.log(`Processing ${branch}`);
            const branchData = await loadBranch({ ...sources, branch });
            for (const generate of outputs) {
                await generate(branchData, values, { ...sources, branches }, buildDir);
            }
        }
        await finish?.({ values, sources, branches, output: values.output, buildDir });
    });
}
