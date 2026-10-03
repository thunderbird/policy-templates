/**
 * The documentation of the branches other than main: their schema overlays
 * (<branch>.schema.json in the product's overrides/ folder) are derived from
 * main (see syncOverlay()), and checked against main (see compareWithMain())
 * and against the rules of the documentation (see checkDocumentation()).
 * Where a branch behaves differently from main, the node in the overlay keeps
 * its own texts and states why with "x-differs-from-main". Used by the tools
 * in this folder, not by the generator.
 */

import { CATCH_ALL_PATTERN } from "../../generator/modules/compatibility.mjs";
import { resolveRef } from "../../generator/modules/schema_settings.mjs";

// The fields of a schema node which document it. Texts may be Fluent
// messages on main (see l10n.mjs), the overlays hold them as plain English.
const TEXT_FIELDS = ["title", "description", "x-help"];
const VALUE_FIELDS = ["examples", "x-examples-gpo", "x-formats", "x-expand-env-vars", "x-deprecated"];
// Fields which are always taken from main, also on nodes with
// "x-differs-from-main": they don't depend on the behaviour of the branch.
const MAIN_FIELDS = ["x-category"];
// The fields of the docs sections which are not part of the texts, see
// checkDocumentation(). They are facts about each branch's code, so they are
// not derived from main: each overlay keeps its own.
const SECTION_FIELDS = ["x-preferences-affected", "x-cck2-equivalent"];
export const DOC_FIELDS = [...TEXT_FIELDS, ...VALUE_FIELDS];
const CHOICE_FIELDS = ["title", "description"];
export const DIFFERS_KEY = "x-differs-from-main";

const FREE_TEXT_TYPES = ["string", "URL", "URLorEmpty", "origin"];

const isObject = value => !!value && typeof value == "object" && !Array.isArray(value);
const same = (a, b) => JSON.stringify(a) == JSON.stringify(b);

/**
 * The documentation fields of a node, with the texts resolved.
 *
 * @param {Object} node - Resolved, see resolveRef().
 * @param {SchemaL10n} l10n
 * @param {string} where
 * @returns {Object} field → value (undefined if not set)
 */
function getDocFields(node, l10n, where) {
    const fields = {};
    for (const field of TEXT_FIELDS) {
        fields[field] = l10n.get(node, field, where) || undefined;
    }
    for (const field of [...VALUE_FIELDS, ...MAIN_FIELDS]) {
        fields[field] = node?.[field];
    }
    return fields;
}

/**
 * The values of a node with a fixed set of them (from "oneOf" with "const",
 * or "enum").
 *
 * @param {Object} node - Resolved.
 * @returns {?Array}
 */
function getValues(node) {
    if (node?.oneOf?.length && node.oneOf.every(choice => "const" in choice)) {
        return node.oneOf.map(choice => choice.const);
    }
    return node?.enum ?? null;
}

/**
 * The texts of the values of a node: value (as JSON) → { title, description }.
 *
 * @param {Object} node - Resolved.
 * @param {SchemaL10n} l10n
 * @param {string} where
 * @returns {Map<string, Object>}
 */
function getChoiceTexts(node, l10n, where) {
    const texts = new Map();
    if (node?.oneOf?.every(choice => "const" in choice)) {
        for (const choice of node.oneOf) {
            const entry = {};
            for (const field of CHOICE_FIELDS) {
                const text = l10n.get(choice, field, `${where}=${choice.const}`);
                if (text) {
                    entry[field] = text;
                }
            }
            texts.set(JSON.stringify(choice.const), entry);
        }
    }
    return texts;
}

/**
 * The child nodes of a raw schema node which a branch and main have in
 * common: the same property name, the same pattern (or both a catch-all), or
 * the entries of a list. Children of a "$ref" are not visited, the shared
 * definitions only hold types.
 *
 * @param {Object} node - The raw node of the branch.
 * @param {Object} mainNode - The raw node of main.
 * @returns {Array<{keys: string[], name: string, node: Object, mainNode: ?Object}>}
 *    keys: the path from the node to the child in the schema
 */
function getChildPairs(node, mainNode) {
    const pairs = [];
    for (const [name, child] of Object.entries(node?.properties ?? {})) {
        pairs.push({ keys: ["properties", name], name, node: child, mainNode: mainNode?.properties?.[name] ?? null });
    }
    const mainPatterns = Object.entries(mainNode?.patternProperties ?? {});
    for (const [pattern, child] of Object.entries(node?.patternProperties ?? {})) {
        const match = mainPatterns.find(([mainPattern]) =>
            mainPattern == pattern || (CATCH_ALL_PATTERN.test(mainPattern) && CATCH_ALL_PATTERN.test(pattern))
        );
        pairs.push({ keys: ["patternProperties", pattern], name: `<${pattern}>`, node: child, mainNode: match?.[1] ?? null });
    }
    if (isObject(node?.items)) {
        pairs.push({ keys: ["items"], name: "[]", node: node.items, mainNode: isObject(mainNode?.items) ? mainNode.items : null });
    }
    return pairs;
}

/**
 * Get the overlay of a branch derived from main: for every node which main has
 * too, main's documentation fields and the texts of the values the branch has.
 * Nodes with "x-differs-from-main" keep their fields from the current
 * overlay (except "x-category", which is always main's), as do nodes main
 * doesn't have. Other keywords of the current
 * overlay (e.g. "contentMediaType") are kept.
 *
 * @param {Object} params
 * @param {Object} params.base - The policy schema of the branch, without
 *    overlay.
 * @param {Object} params.overlay - The current overlay (not modified).
 * @param {{schema: Object, l10n: SchemaL10n}} params.main
 * @param {SchemaL10n} params.l10n - The texts of the branch (its schema has
 *    no Fluent messages, but is read the same way).
 * @returns {Object} the new overlay
 */
export function syncOverlay({ base, overlay, main, l10n }) {
    const result = structuredClone(overlay);

    function sync(node, mainNode, target, where) {
        const resolved = resolveRef(base, node);
        const mainResolved = resolveRef(main.schema, mainNode);
        const own = getDocFields(resolved, l10n, where);
        const wanted = getDocFields(mainResolved, main.l10n, where);
        for (const field of [...(target[DIFFERS_KEY] ? [] : DOC_FIELDS), ...MAIN_FIELDS]) {
            if (wanted[field] === undefined) {
                // Main has no such field: remove the branch's own.
                if (own[field] === undefined) {
                    delete target[field];
                } else {
                    target[field] = null;
                }
            } else if (same(own[field], wanted[field])) {
                delete target[field];
            } else {
                target[field] = wanted[field];
            }
        }
        if (!target[DIFFERS_KEY]) {
            syncChoices(resolved, mainResolved, target, where);
        }
        for (const child of getChildPairs(node, mainNode)) {
            if (!child.mainNode) {
                continue;
            }
            let childTarget = target;
            for (const key of child.keys) {
                childTarget[key] ??= {};
                childTarget = childTarget[key];
            }
            sync(child.node, child.mainNode, childTarget, `${where}.${child.name}`);
        }
    }

    // The values keep their order and keywords, with main's texts. A "oneOf"
    // is only added to an "enum" if main has texts for the values.
    function syncChoices(resolved, mainResolved, target, where) {
        const values = getValues(resolved);
        if (!values) {
            delete target.oneOf;
            return;
        }
        const mainTexts = getChoiceTexts(mainResolved, main.l10n, where);
        const ownChoices = resolved.oneOf?.every(choice => "const" in choice) ? resolved.oneOf : null;
        const oneOf = values.map((value, index) => {
            const { title, description, ...rest } = ownChoices?.[index] ?? { const: value };
            return { ...rest, ...mainTexts.get(JSON.stringify(value)) };
        });
        const hasTexts = oneOf.some(choice => choice.title || choice.description);
        if (ownChoices ? same(ownChoices, oneOf) : !hasTexts) {
            delete target.oneOf;
        } else {
            target.oneOf = oneOf;
        }
    }

    result.properties ??= {};
    for (const [name, node] of Object.entries(base.properties ?? {})) {
        const mainNode = main.schema.properties?.[name];
        if (mainNode) {
            result.properties[name] ??= {};
            sync(node, mainNode, result.properties[name], name);
        }
    }
    return prune(result);
}

// Remove empty objects (but not empty values of "x-" keywords).
function prune(value) {
    if (!isObject(value)) {
        return value;
    }
    for (const [key, child] of Object.entries(value)) {
        if (isObject(child) && !key.startsWith("x-") && key != "examples") {
            prune(child);
            if (!Object.keys(child).length) {
                delete value[key];
            }
        }
    }
    return value;
}

/**
 * Compare the documentation of a branch (with its overlay) with main.
 *
 * @param {{schema: Object, l10n: SchemaL10n}} branch
 * @param {{schema: Object, l10n: SchemaL10n}} main
 * @returns {string[]} the problems: fields which differ from main on nodes
 *    without "x-differs-from-main", and nodes with "x-differs-from-main"
 *    which don't differ
 */
export function compareWithMain(branch, main) {
    const problems = [];

    function compare(node, mainNode, where) {
        const resolved = resolveRef(branch.schema, node);
        const mainResolved = resolveRef(main.schema, mainNode);
        const own = getDocFields(resolved, branch.l10n, where);
        const wanted = getDocFields(mainResolved, main.l10n, where);
        const differing = DOC_FIELDS.filter(field => !same(own[field], wanted[field]));
        // Not covered by "x-differs-from-main".
        for (const field of MAIN_FIELDS.filter(field => !same(own[field], wanted[field]))) {
            problems.push(`${where}: differs from main in ${field}`);
        }
        const values = getValues(resolved) ?? [];
        const ownTexts = getChoiceTexts(resolved, branch.l10n, where);
        const mainTexts = getChoiceTexts(mainResolved, main.l10n, where);
        for (const value of values) {
            const key = JSON.stringify(value);
            if (mainTexts.size && !same(ownTexts.get(key) ?? {}, mainTexts.get(key) ?? {})) {
                differing.push(`value ${key}`);
            }
        }
        if (resolved?.[DIFFERS_KEY]) {
            if (!differing.length) {
                problems.push(`${where}: has "${DIFFERS_KEY}", but its documentation is the same as on main`);
            }
        } else if (differing.length) {
            problems.push(`${where}: differs from main in ${differing.join(", ")}`);
        }
        for (const child of getChildPairs(node, mainNode)) {
            if (child.mainNode) {
                compare(child.node, child.mainNode, `${where}.${child.name}`);
            }
        }
    }

    for (const [name, node] of Object.entries(branch.schema.properties ?? {})) {
        const mainNode = main.schema.properties?.[name];
        if (mainNode) {
            compare(node, mainNode, name);
        }
    }
    return problems;
}

const getTypes = node => (node?.type ? [node.type].flat() : []);
const isChoice = node => !!getValues(node) || "const" in (node ?? {});
const isFreeText = node => !isChoice(node) && getTypes(node).some(type => FREE_TEXT_TYPES.includes(type));
// The entries of a list are given resolved.
const isTextList = (node, items) => getTypes(node).length == 1 && getTypes(node)[0] == "array" && !!items
    && isFreeText(items);

/**
 * Check the documentation of a branch against the rules of the policy schema
 * (the same as comm's test_policy_documentation.js): hand-written examples
 * exactly where they can't be generated, a description on every setting
 * which groups other settings, on every setting inside a JSON value and on
 * every setting with an x-help (which must not repeat it), a title on every
 * value of a choice, "x-formats" only on policies, an "x-category" on every
 * policy, "x-preferences-affected" and "x-cck2-equivalent" only on the nodes
 * of docs sections (a policy, or a setting with an x-help) and as a string or
 * a list of strings, and examples which only use settings and values the
 * branch has.
 *
 * @param {{schema: Object, l10n: SchemaL10n}} branch
 * @returns {string[]} the problems
 */
export function checkDocumentation({ schema, l10n }) {
    const problems = [];
    const resolve = node => resolveRef(schema, node);
    const hasText = (node, field, where) => !!l10n.get(node, field, where);

    function checkExamples(node, where, covered) {
        node = resolve(node);
        const own = Array.isArray(node.examples) && !!node.examples.length;
        const needsExample = !!node.patternProperties || isFreeText(node) || isTextList(node, resolve(node.items));
        if (node["x-examples-gpo"] && !own) {
            problems.push(`${where}: x-examples-gpo without examples`);
        }
        if (own && covered) {
            problems.push(`${where}: needless example, a setting above it has examples`);
        } else if (own && !needsExample) {
            problems.push(`${where}: needless example, it can be generated`);
        } else if (!own && !covered && needsExample) {
            problems.push(`${where}: missing example`);
        }
        for (const field of ["examples", "x-examples-gpo"]) {
            for (const [index, example] of (node[field] ?? []).entries()) {
                for (const problem of findUnknownParts(example, node, "")) {
                    problems.push(`${where}: ${field}[${index}] ${problem}`);
                }
            }
        }
        const childCovered = covered || own || !!node.patternProperties;
        for (const [name, child] of Object.entries(node.properties ?? {})) {
            checkExamples(child, `${where}.${name}`, childCovered);
        }
        for (const [pattern, child] of Object.entries(node.patternProperties ?? {})) {
            checkExamples(child, `${where}.<${pattern}>`, childCovered);
        }
        if (isObject(node.items)) {
            checkExamples(node.items, `${where}[]`, childCovered);
        }
    }

    // The parts of an example which the schema doesn't have.
    function findUnknownParts(value, node, path) {
        node = resolve(node);
        const found = [];
        const values = getValues(node);
        if (values && !values.some(allowed => same(allowed, value))) {
            found.push(`uses the unknown value ${JSON.stringify(value)}${path && ` at ${path}`}`);
        } else if (Array.isArray(value) && isObject(node.items)) {
            value.forEach(entry => found.push(...findUnknownParts(entry, node.items, `${path}[]`)));
        } else if (isObject(value) && (node.properties || node.patternProperties)) {
            for (const [key, child] of Object.entries(value)) {
                const childNode = node.properties?.[key]
                    ?? Object.entries(node.patternProperties ?? {}).find(([pattern]) => new RegExp(pattern).test(key))?.[1]
                    ?? (isObject(node.additionalProperties) ? node.additionalProperties : null);
                if (!childNode) {
                    found.push(`uses the unknown setting ${path ? `${path}.` : ""}${key}`);
                } else {
                    found.push(...findUnknownParts(child, childNode, path ? `${path}.${key}` : key));
                }
            }
        }
        return found;
    }

    function checkDescriptions(node, where, inJson) {
        node = resolve(node);
        const container = node.type == "array" && isObject(node.items) ? resolve(node.items) : node;
        const children = [
            ...Object.entries(container.properties ?? {}),
            ...Object.entries(container.patternProperties ?? {}),
        ];
        const isGroup = !!children.length;
        // An x-help is an addition to the description, never a replacement.
        const hasHelp = hasText(node, "x-help", where);
        if ((isGroup || inJson || hasHelp) && !hasText(node, "description", where)) {
            problems.push(`${where}: missing description`);
        }
        const childInJson = inJson || node.contentMediaType == "application/json";
        for (const [name, child] of children) {
            checkDescriptions(child, `${where}.${name}`, childInJson);
        }
    }

    // An x-help must not repeat its description (it only adds to it), and
    // every value of a choice needs a title.
    function checkTexts(node, where) {
        node = resolve(node);
        if (!isObject(node)) {
            return;
        }
        const firstSentence = text => text.trim().split(/(?<=\.)\s/)[0];
        const description = l10n.get(node, "description", where);
        const help = l10n.get(node, "x-help", where);
        if (description && help && firstSentence(help) == firstSentence(description)) {
            problems.push(`${where}: x-help repeats the description`);
        }
        for (const choice of node.oneOf ?? []) {
            if ("const" in choice && !l10n.get(choice, "title", `${where}=${choice.const}`)) {
                problems.push(`${where}=${JSON.stringify(choice.const)}: value without title`);
            }
        }
        for (const [name, child] of Object.entries(node.properties ?? {})) {
            checkTexts(child, `${where}.${name}`);
        }
        for (const [pattern, child] of Object.entries(node.patternProperties ?? {})) {
            checkTexts(child, `${where}.<${pattern}>`);
        }
        if (isObject(node.items)) {
            checkTexts(node.items, `${where}[]`);
        }
    }

    function findNestedFormats(node, where) {
        if (!isObject(node) && !Array.isArray(node)) {
            return;
        }
        for (const [key, value] of Object.entries(node)) {
            if (key == "x-formats") {
                problems.push(`${where}: x-formats is only allowed on the policy itself`);
            } else if (key != "examples" && key != "x-examples-gpo") {
                findNestedFormats(value, `${where}.${key}`);
            }
        }
    }

    // The fields shown with a docs section: only on the node of a section (a
    // policy, or a setting with its own x-help), as a string or a list of
    // strings.
    function checkSectionFields(node, where, isSection) {
        if (!isObject(node) && !Array.isArray(node)) {
            return;
        }
        for (const [key, value] of Object.entries(node)) {
            if (SECTION_FIELDS.includes(key)) {
                if (!isSection) {
                    problems.push(`${where}: ${key} is only allowed on a policy or on a setting with an x-help`);
                }
                if (!(typeof value == "string" || (Array.isArray(value) && value.every(entry => typeof entry == "string")))) {
                    problems.push(`${where}: ${key} should be a string or a list of strings`);
                }
            } else if (key == "properties" || key == "patternProperties") {
                for (const [name, child] of Object.entries(isObject(value) ? value : {})) {
                    const childWhere = key == "properties" ? `${where}.${name}` : `${where}.<${name}>`;
                    checkSectionFields(child, childWhere, isObject(child) && hasText(child, "x-help", childWhere));
                }
            } else if (key != "examples" && key != "x-examples-gpo") {
                checkSectionFields(value, `${where}.${key}`, false);
            }
        }
    }

    for (const [name, policy] of Object.entries(schema.properties ?? {})) {
        checkExamples(policy, name, false);
        checkSectionFields(policy, name, true);
        const resolved = resolve(policy);
        if (!hasText(resolved, "description", name)) {
            problems.push(`${name}: missing description`);
        }
        checkTexts(policy, name);
        const container = resolved.type == "array" && isObject(resolved.items) ? resolve(resolved.items) : resolved;
        const inJson = resolved.contentMediaType == "application/json";
        for (const [childName, child] of [
            ...Object.entries(container.properties ?? {}),
            ...Object.entries(container.patternProperties ?? {}),
        ]) {
            checkDescriptions(child, `${name}.${childName}`, inJson);
        }
        if (!(typeof resolved["x-category"] == "string" && resolved["x-category"])) {
            problems.push(`${name}: missing x-category`);
        }
        const { "x-formats": formats, ...rest } = policy;
        if (formats !== undefined && !(Array.isArray(formats) && formats.length
            && formats.every(format => ["gpo", "plist", "json"].includes(format)))) {
            problems.push(`${name}: x-formats should be a non-empty list of gpo, plist, json`);
        }
        findNestedFormats(rest, name);
    }
    return problems;
}
