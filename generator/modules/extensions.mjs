/**
 * The context of the product extensions: the data a template's __js:<name>__
 * passes to extensions/<name>.mjs of the product folder (see loadExtensions()
 * in product.mjs). It is a documented contract of plain, frozen data, so the
 * extensions need nothing from the generator, and the generator's internals
 * can change behind it:
 *
 *  - product: the name of the product folder, e.g. "thunderbird",
 *  - branch: the branch being rendered ("main" for the overview),
 *  - branches: all branches of the run, sorted as in the overview, as
 *    [{ branch, name, version, docsUrl }],
 *  - schema(locale = "en-US"): the policy schema of the branch (its
 *    override, see loadBranch()), with every Fluent ID ("x-description-l10n-id") replaced by its
 *    text ("description") in the given locale: the translation the branch
 *    ships, from the commit of the l10n repository which the branch pins for
 *    the locale (l10n.changesets in product.yaml),
 *  - compatibility: the product's own compatibility, one row per flat policy
 *    name, as [{ name, first, last }],
 *  - cachedFetch(url): the content of a URL (null for a 404), through the
 *    download cache, see readRevalidatedUrl().
 */

import { GITHUB_RAW_URL } from "./constants.mjs";
import { getCompatibilityInformation } from "./compatibility.mjs";
import { SchemaL10n, getL10nIdField } from "./l10n.mjs";
import { ContentError, readCachedUrl, readRevalidatedUrl } from "./tools.mjs";

// The text fields which may be given as Fluent IDs.
const TEXT_FIELDS = ["title", "description", "x-help"];

function deepFreeze(value) {
    if (value && typeof value == "object" && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.values(value).forEach(deepFreeze);
    }
    return value;
}

/**
 * Get the SchemaL10n of a locale for a branch: en-US are the branch's own
 * Fluent files. Other locales are read from the product's l10n repository (l10n
 * in product.yaml) at the commit which the branch pins for the locale in its
 * changesets file (e.g. mail/locales/l10n-changesets.json), the translation
 * the branch ships, with the en-US messages as fallback.
 *
 * @param {BranchData} branchData - See loadBranch().
 * @param {string} locale
 * @param {LocalGitSource|GitHubSource} app - The product's source, to read the
 *    changesets file of the branch.
 * @returns {Promise<SchemaL10n>}
 */
async function getLocaleL10n(branchData, locale, app) {
    if (locale == "en-US") {
        return branchData.l10n;
    }
    const { branch, commit, product } = branchData;
    const l10n = product.l10n;
    if (!l10n) {
        throw new ContentError(`The locale ${locale} is not available: the product has no "l10n" in its product.yaml.`);
    }
    const text = await app.readFile(commit, l10n.changesets);
    if (text === null) {
        throw new ContentError(`The branch ${branch} has no ${l10n.changesets}, which pins the commits of the locales.`);
    }
    const pins = JSON.parse(text);
    const revision = pins[locale]?.revision;
    if (revision === undefined) {
        throw new ContentError(`The locale ${locale} is not available on ${branch}, its locales are: ${Object.keys(pins).join(", ")}.`);
    }
    if (!/^[0-9a-f]{40}$/.test(revision)) {
        throw new ContentError(`The locale ${locale} is pinned to "${revision}" on ${branch}, which is not a commit.`);
    }
    const files = [];
    for (const path of l10n.fluent) {
        const name = path.replaceAll("{locale}", locale);
        // A commit's files never change, so they are cached for good.
        const source = await readCachedUrl(`${GITHUB_RAW_URL}/${l10n.repository}/${revision}/${name}`);
        if (source !== null) {
            files.push({ name, source });
        }
    }
    if (!files.length) {
        throw new ContentError(`The locale ${locale} has none of its files in ${l10n.repository} at ${revision}.`);
    }
    return new SchemaL10n(files, { locale, fallback: branchData.l10n });
}

/**
 * Replace the Fluent IDs of the text fields of all nodes by their texts.
 *
 * @param {any} node - Modified in place.
 * @param {SchemaL10n} l10n
 * @param {string} where - The path, for error messages.
 */
function resolveTexts(node, l10n, where) {
    if (Array.isArray(node)) {
        node.forEach((child, index) => resolveTexts(child, l10n, `${where}[${index}]`));
        return;
    }
    if (!node || typeof node != "object") {
        return;
    }
    for (const field of TEXT_FIELDS) {
        const idField = getL10nIdField(field);
        if (idField in node) {
            node[field] = l10n.get(node, field, where);
            delete node[idField];
        }
    }
    for (const [key, child] of Object.entries(node)) {
        resolveTexts(child, l10n, where ? `${where}.${key}` : key);
    }
}

/**
 * Build the context of the extensions for a branch.
 *
 * @param {BranchData} branchData - See loadBranch().
 * @param {Object[]} branches - See getBranchList().
 * @param {LocalGitSource|GitHubSource} app - The product's source.
 * @returns {Object}
 */
export function getExtensionContext(branchData, branches, app) {
    const schemas = new Map();
    return Object.freeze({
        product: branchData.product.name,
        branch: branchData.branch,
        branches: deepFreeze(structuredClone(branches)),
        schema(locale = "en-US") {
            if (!schemas.has(locale)) {
                schemas.set(locale, getLocaleL10n(branchData, locale, app).then(l10n => {
                    const schema = structuredClone(branchData.schema);
                    resolveTexts(schema, l10n, "");
                    return deepFreeze(schema);
                }));
            }
            return schemas.get(locale);
        },
        compatibility: deepFreeze(getCompatibilityInformation(branchData.compatData, { distinct: false })
            .map(({ policies: [name], first, last }) => ({ name, first, last }))),
        cachedFetch: url => readRevalidatedUrl(url),
    });
}
