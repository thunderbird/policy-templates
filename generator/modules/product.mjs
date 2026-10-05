/**
 * The product definition: everything which is specific to the product whose
 * policy templates are generated (e.g. products/thunderbird/), given with
 * --product-config. The generator itself knows no product.
 *
 * A product folder holds:
 * - product.yaml: the identity of the product (see loadProduct()),
 * - overrides/: per branch, the full policy schema (<branch>.schema.json),
 *   which the generator uses instead of the schema of the product's
 *   repository, see getSchemaFile(),
 * - templates/: the frame texts of the docs (overview.md, branch.md), with
 *   placeholders (e.g. __name__) and %ifdef blocks, see preprocess(),
 * - site/: files copied unchanged into the docs folder (e.g. a stylesheet),
 * - extensions/: JavaScript modules which the templates call with
 *   __js:<name>__, see loadExtensions().
 */

import fs from "node:fs/promises";
import pathUtils from "node:path";
import { pathToFileURL } from "node:url";
import yaml from "yaml";

import { OLDEST_ESR } from "./constants.mjs";
import { ContentError, InputError } from "./tools.mjs";

const TEMPLATES = { overview: "overview.md", branch: "branch.md" };

// The names the templates can test with %ifdef: the kind of the branch, see
// getBranchKind().
const KINDS = ["MAIN", "BETA", "RELEASE", "ESR"];

/**
 * Read a product folder.
 *
 * @param {string} dir - The product folder, e.g. "products/thunderbird".
 * @returns {Promise<Product>} with
 *    - dir, overridesDir, siteDir: the folders,
 *    - name: the name of the product folder, e.g. "thunderbird",
 *    - source: { repository, schema, version, fluent }: where the inputs are
 *      in the product's repository,
 *    - l10n: { repository, changesets, fluent } or null: the l10n
 *      repository, the file of the product's repository which pins its
 *      commit per locale for each branch (e.g. l10n-changesets.json), and the
 *      localized Fluent files, "{locale}" in their paths stands for the
 *      locale,
 *    - channels: the label of each kind of branch (main, beta, release, esr),
 *    - registryKey (admx.registry-key), admx: { file, prefix, namespace },
 *      plist: { domain }: the identity of the templates (file and prefix are
 *      the product's name),
 *    - docsUrl, templatesRepository: for links,
 *    - templates: { overview, branch }: the frame texts,
 *    - extensions: Map of the extensions the templates use, by name.
 */
export async function loadProduct(dir) {
    if (!dir) {
        throw new InputError("--product-config is required.");
    }
    const file = pathUtils.join(dir, "product.yaml");
    let text;
    try {
        text = await fs.readFile(file, "utf8");
    } catch (ex) {
        throw new InputError(`Cannot read the product definition ${file}: ${ex.message}`);
    }
    const data = yaml.parse(text) ?? {};
    for (const key of ["compare-with"]) {
        if (key in data) {
            throw new InputError(`${file} has "${key}", which is no longer used: a comparison with another product is an extension of the product.`);
        }
    }
    if (data.source && "checkout-subfolder" in data.source) {
        throw new InputError(`${file} has "source.checkout-subfolder", which is no longer used: --checkout is the product's own repository.`);
    }
    for (const key of ["file", "prefix"]) {
        if (data.admx && key in data.admx) {
            throw new InputError(`${file} has "admx.${key}", which is no longer used: the product's name (the name of its folder) is used.`);
        }
    }
    if ("registry-key" in data) {
        throw new InputError(`${file} has "registry-key", which moved to "admx.registry-key".`);
    }
    if (typeof data.plist == "string") {
        throw new InputError(`${file} has "plist" as a string, use "plist.domain" instead.`);
    }
    // The name of the product folder is the file name and the prefix of the
    // ADMX template, like firefox.admx.
    const name = pathUtils.basename(pathUtils.resolve(dir));
    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
        throw new InputError(`The product folder "${name}" can not be used as the name of the ADMX template: use lowercase letters, digits and "-".`);
    }
    const get = (path, type = "string") => {
        const value = path.split(".").reduce((node, key) => node?.[key], data);
        const ok = type == "list"
            ? Array.isArray(value) && value.length && value.every(entry => typeof entry == "string")
            : typeof value == "string";
        if (!ok) {
            throw new InputError(`${file} needs "${path}" (${type == "list" ? "a list of strings" : "a string"}).`);
        }
        return value;
    };

    const templates = {};
    for (const [key, name] of Object.entries(TEMPLATES)) {
        const path = pathUtils.join(dir, "templates", name);
        try {
            templates[key] = await fs.readFile(path, "utf8");
        } catch (ex) {
            throw new InputError(`Cannot read the template ${path}: ${ex.message}`);
        }
        // Check the directives now, not after building the first branches.
        preprocess(templates[key], [], path);
    }

    let l10n = null;
    if (data.l10n !== undefined) {
        if (data.l10n && "branch" in data.l10n) {
            throw new InputError(`${file} has "l10n.branch", which is no longer used: the commit of each locale is pinned in "l10n.changesets".`);
        }
        l10n = {
            repository: get("l10n.repository"),
            changesets: get("l10n.changesets"),
            fluent: get("l10n.fluent", "list"),
        };
        if (!l10n.fluent.every(path => path.includes("{locale}"))) {
            throw new InputError(`${file}: every path of "l10n.fluent" needs "{locale}".`);
        }
    }

    return {
        dir,
        name,
        overridesDir: pathUtils.join(dir, "overrides"),
        siteDir: pathUtils.join(dir, "site"),
        source: {
            repository: get("source.repository"),
            schema: get("source.schema"),
            version: get("source.version"),
            fluent: get("source.fluent", "list"),
        },
        channels: {
            main: get("channels.main"),
            beta: get("channels.beta"),
            release: get("channels.release"),
            esr: get("channels.esr"),
        },
        registryKey: get("admx.registry-key"),
        admx: {
            file: name,
            prefix: name,
            namespace: get("admx.namespace"),
        },
        plist: {
            domain: get("plist.domain"),
        },
        docsUrl: get("docs-url"),
        templatesRepository: get("templates-repository"),
        l10n,
        templates,
        extensions: await loadExtensions(dir, templates),
    };
}

// An extension placeholder in a template, e.g. __js:compatibility_table__.
export const EXTENSION_PLACEHOLDER = /__js:([a-z_]+)__/g;

/**
 * Load the extensions which the templates use: __js:<name>__ calls the default
 * export of extensions/<name>.mjs in the product folder, which gets a context
 * (see extensions.mjs) and returns Markdown.
 *
 * @param {string} dir - The product folder.
 * @param {Object<string, string>} templates - The texts of the templates.
 * @returns {Promise<Map<string, function(Object): Promise<string>>>}
 */
async function loadExtensions(dir, templates) {
    const extensions = new Map();
    for (const [name, text] of Object.entries(templates)) {
        for (const [, extension] of text.matchAll(EXTENSION_PLACEHOLDER)) {
            if (extensions.has(extension)) {
                continue;
            }
            const path = pathUtils.resolve(dir, "extensions", `${extension}.mjs`);
            let module;
            try {
                module = await import(pathToFileURL(path).href);
            } catch (ex) {
                throw new ContentError(`The extension ${extension} of ${TEMPLATES[name]} can not be loaded from ${path}: ${ex.message}`);
            }
            if (typeof module.default != "function") {
                throw new ContentError(`The extension ${path} has no default export function.`);
            }
            extensions.set(extension, module.default);
        }
    }
    return extensions;
}

/**
 * Get the product's policy schema of a branch (overrides/<branch>.schema.json),
 * the full schema: the generator uses it instead of the schema of the
 * product's repository.
 *
 * @param {Product} product
 * @param {string} branch
 * @returns {Promise<string>} the path
 */
export async function getSchemaFile(product, branch) {
    const path = pathUtils.join(product.overridesDir, `${branch}.schema.json`);
    try {
        await fs.access(path);
    } catch {
        throw new InputError(`The product has no schema for ${branch} (${path}).`);
    }
    return path;
}

/**
 * Get the kind of a branch, the name it defines for the %ifdef blocks of the
 * templates (see preprocess()).
 *
 * @param {string} branch - e.g. "main" or "esr140"
 * @returns {string} "MAIN", "BETA", "RELEASE" or "ESR"
 */
export function getBranchKind(branch) {
    if (/^esr\d+$/.test(branch)) {
        return "ESR";
    }
    if (!["main", "beta", "release"].includes(branch)) {
        throw new InputError(`Unknown branch "${branch}": the branches are main, beta, release and esr<version>.`);
    }
    return branch.toUpperCase();
}

/**
 * Process the %ifdef blocks of a template, a subset of Mozilla's build
 * preprocessor (python/mozbuild/mozbuild/preprocessor.py) with the "%" marker,
 * as in comm's CSS files: the directives %ifdef NAME, %ifndef NAME, %else and
 * %endif, each on a line of its own, which is removed with its line break.
 * Blocks can be nested. The names are the kinds of branches (MAIN, BETA,
 * RELEASE, ESR), any other name is an error, so a typo is never silently
 * false, as is any other line starting with "%".
 *
 * @param {string} text
 * @param {string[]} defines - The defined names, e.g. ["MAIN"].
 * @param {string} where - The name of the template, for error messages.
 * @returns {string}
 */
export function preprocess(text, defines, where) {
    const output = [];
    // For each open block: whether its lines are kept, and whether it had
    // an %else.
    const stack = [];
    const active = () => stack.every(block => block.active);
    const lines = text.split(/(?<=\n)/);
    for (const [index, line] of lines.entries()) {
        if (!line.startsWith("%")) {
            if (active()) {
                output.push(line);
            }
            continue;
        }
        const at = `${where}, line ${index + 1}`;
        const [, directive, args] = line.trimEnd().match(/^%(\S*)\s*(.*)$/);
        if (directive == "ifdef" || directive == "ifndef") {
            if (!KINDS.includes(args)) {
                throw new ContentError(`Unknown name "${args}" in ${at}: the names are ${KINDS.join(", ")}.`);
            }
            stack.push({ active: defines.includes(args) == (directive == "ifdef"), hadElse: false });
        } else if (directive == "else" && !args) {
            const block = stack.at(-1);
            if (!block) {
                throw new ContentError(`%else without %ifdef in ${at}.`);
            }
            if (block.hadElse) {
                throw new ContentError(`A second %else in ${at}.`);
            }
            block.active = !block.active;
            block.hadElse = true;
        } else if (directive == "endif" && !args) {
            if (!stack.pop()) {
                throw new ContentError(`%endif without %ifdef in ${at}.`);
            }
        } else {
            throw new ContentError(`Unknown directive "${line.trimEnd()}" in ${at}: the directives are %ifdef, %ifndef, %else and %endif.`);
        }
    }
    if (stack.length) {
        throw new ContentError(`%ifdef without %endif in ${where}.`);
    }
    return output.join("");
}

/**
 * Get the label of the channel of a branch (e.g. "ESR" for "esr140").
 *
 * @param {Product} product
 * @param {string} branch
 * @returns {string}
 */
export function getChannelLabel(product, branch) {
    if (/^esr\d+$/.test(branch)) {
        return product.channels.esr;
    }
    if (!(branch in product.channels) || branch == "esr") {
        throw new InputError(`Unknown branch "${branch}": the branches are main, beta, release and esr<version>.`);
    }
    return product.channels[branch];
}

/**
 * Parse the value of --branch: one full branch name.
 *
 * @param {string} value
 * @param {Product} product
 * @returns {string}
 */
export function parseBranch(value, product) {
    const branch = value?.trim();
    if (!branch) {
        throw new InputError("--branch is required, e.g. --branch=main.");
    }
    if (branch.includes(",")) {
        throw new InputError(`--branch takes one branch, not a list: "${branch}".`);
    }
    getChannelLabel(product, branch);
    const esr = branch.match(/^esr(\d+)$/);
    if (esr && Number(esr[1]) < OLDEST_ESR) {
        throw new InputError(`The branch ${branch} is older than the oldest ESR of the docs (OLDEST_ESR = ${OLDEST_ESR} in constants.mjs).`);
    }
    return branch;
}

/**
 * Parse the value of --branches: full branch names, separated by commas.
 *
 * @param {string} value
 * @param {Product} product
 * @returns {string[]}
 */
export function parseBranches(value, product) {
    if (!value) {
        throw new InputError("--branches is required, e.g. --branches=main,beta,release,esr140.");
    }
    const branches = [...new Set(value.split(",").map(branch => branch.trim()).filter(Boolean))];
    for (const branch of branches) {
        getChannelLabel(product, branch);
    }
    return branches;
}
