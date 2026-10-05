/**
 * Checks of the product's policy schemas (overrides/<branch>.schema.json in
 * the product folder), used by the tools in this folder, not by the generator:
 * - checkDocumentation(): the rules of the documentation,
 * - findDrift(): what the schema of the product's repository (e.g. comm) has
 *   and the product's file doesn't, e.g. a new policy upstream.
 */

import { findForm, getForms, resolveRef } from "../../generator/modules/schema_settings.mjs";

// The fields of the docs sections which are not part of the texts, see
// checkDocumentation().
const SECTION_FIELDS = ["x-preferences-affected", "x-cck2-equivalent"];

const FREE_TEXT_TYPES = ["string", "URL", "URLorEmpty", "origin"];

const isObject = value => !!value && typeof value == "object" && !Array.isArray(value);
// A JSON value, also with the JSON type of older schemas (["object", "JSON"]).
const isJson = node => node?.contentMediaType == "application/json" || [node?.type].flat().includes("JSON");
const same = (a, b) => JSON.stringify(a) == JSON.stringify(b);

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

const getTypes = node => (node?.type ? [node.type].flat() : []);
const isChoice = node => !!getValues(node) || "const" in (node ?? {});
const isFreeText = node => !isChoice(node) && getTypes(node).some(type => FREE_TEXT_TYPES.includes(type));
// The entries of a list are given resolved.
const isTextList = (node, items) => getTypes(node).length == 1 && getTypes(node)[0] == "array" && !!items
    && isFreeText(items);

/**
 * Check the documentation of a branch against the rules of the policy schema
 * (the same as comm's test_policy_documentation.js): hand-written examples
 * exactly where they can't be generated (of a setting with several forms, an
 * example of each form which can't be generated), a description on every setting
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

    // Whether the example of a node (of a single form) can't be generated.
    const needsExample = node => !!node.patternProperties || isFreeText(node) || isTextList(node, resolve(node.items));

    function checkExamples(node, where, covered) {
        node = resolve(node);
        const own = Array.isArray(node.examples) && !!node.examples.length;
        const forms = getForms(schema, node);
        if (node["x-examples-gpo"] && !own) {
            problems.push(`${where}: x-examples-gpo without examples`);
        }
        if (own && covered) {
            problems.push(`${where}: needless example, a setting above it has examples`);
        } else if (own && !forms.some(form => needsExample(form.node))) {
            problems.push(`${where}: needless example, it can be generated`);
        } else if (!covered && forms.length > 1) {
            // Of a setting with several forms, each form which can't be
            // generated needs an example of its own.
            for (const form of forms.filter(form => needsExample(form.node))) {
                if (!(node.examples ?? []).some(example => findForm(forms, example) == form)) {
                    problems.push(`${where}: missing example of the ${form.kind} form`);
                }
            }
        } else if (!own && !covered && needsExample(node)) {
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
        // The settings of the forms (a type list keeps them on the node).
        for (const container of forms.length > 1 ? forms.map(form => form.node) : [node]) {
            for (const [name, child] of Object.entries(container.properties ?? {})) {
                checkExamples(child, `${where}.${name}`, childCovered);
            }
            for (const [pattern, child] of Object.entries(container.patternProperties ?? {})) {
                checkExamples(child, `${where}.<${pattern}>`, childCovered);
            }
            if (isObject(container.items)) {
                checkExamples(container.items, `${where}[]`, childCovered);
            }
        }
    }

    // The parts of an example which the schema doesn't have.
    function findUnknownParts(value, node, path) {
        node = resolve(node);
        const found = [];
        // Of a setting with several forms, the form of the value.
        const forms = getForms(schema, node);
        if (forms.length > 1) {
            const form = findForm(forms, value);
            if (!form) {
                return [`uses a value of none of the forms${path && ` at ${path}`}`];
            }
            node = form.node;
        }
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

    // The node which holds the settings of a node: the entries of a list, the
    // object form of a setting with several forms.
    function getContainer(node) {
        const forms = getForms(schema, node);
        const structured = forms.length > 1
            ? forms.find(form => form.kind == "Object")?.node ?? forms.find(form => form.kind == "List")?.node ?? node
            : node;
        return [structured.type].flat().includes("array") && isObject(structured.items) ? resolve(structured.items) : structured;
    }

    function checkDescriptions(node, where, inJson) {
        node = resolve(node);
        const container = getContainer(node);
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
        const childInJson = inJson || isJson(node);
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
        // The choices of the node, and those of its alternatives.
        const choices = [node, ...(node.anyOf ?? []).map(resolve)].flatMap(choiceNode => choiceNode?.oneOf ?? []);
        for (const choice of choices) {
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
        const container = getContainer(resolved);
        const inJson = isJson(resolved);
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

// The keys which define what a setting accepts. A different value of one of
// them upstream is drift; other keys (texts, examples, "x-" hints) may differ,
// the product's files are the authority for them.
const STRUCTURE_KEYS = [
    "type", "enum", "const", "pattern", "$ref", "required", "additionalProperties",
    "contentMediaType", "minimum", "maximum", "format",
];
// The keys whose values are schema nodes, walked by findDrift().
const NODE_MAPS = ["properties", "patternProperties", "definitions"];

/**
 * Find what the schema of the product's repository has and the product's own
 * schema of the branch doesn't:
 * - a node (a policy, a setting, a definition) which is missing,
 * - a key of a node which is missing (e.g. a new "enum", or a "description"),
 * - a different value of a key which defines what a setting accepts (see
 *   STRUCTURE_KEYS), e.g. a new value of an "enum". The values of the choices
 *   ("oneOf" with "const") are compared, not their texts.
 *
 * @param {Object} params
 * @param {Object} params.upstream - The schema of the product's repository.
 * @param {Object} params.ours - The product's schema of the branch.
 * @returns {string[]} the differences
 */
export function findDrift({ upstream, ours }) {
    const found = [];
    const constValues = node => (node.oneOf ?? []).filter(choice => "const" in choice).map(choice => choice.const);

    function compare(up, own, where) {
        for (const [key, value] of Object.entries(up)) {
            if (!(key in own)) {
                found.push(`${where}: missing "${key}"`);
                continue;
            }
            if (NODE_MAPS.includes(key) && isObject(value)) {
                for (const [name, child] of Object.entries(value)) {
                    const childWhere = key == "properties" ? `${where}.${name}`.replace(/^\./, "")
                        : `${where}.<${name}>`.replace(/^\./, "");
                    if (!(name in own[key])) {
                        found.push(`${childWhere}: missing`);
                    } else if (isObject(child) && isObject(own[key][name])) {
                        compare(child, own[key][name], childWhere);
                    } else if (!same(child, own[key][name])) {
                        // Not a node, e.g. a misplaced "required" list in
                        // "properties" of an old schema.
                        found.push(`${childWhere}: is ${JSON.stringify(own[key][name])}, upstream ${JSON.stringify(child)}`);
                    }
                }
            } else if (key == "items" && isObject(value) && isObject(own.items)) {
                compare(value, own.items, `${where}[]`);
            } else if (key == "oneOf" && Array.isArray(value)) {
                const missing = constValues(up).filter(v => !constValues(own).some(o => same(o, v)));
                if (missing.length) {
                    found.push(`${where}: missing values ${missing.map(v => JSON.stringify(v)).join(", ")}`);
                }
            } else if (STRUCTURE_KEYS.includes(key) && !same(value, own[key])) {
                found.push(`${where}: "${key}" is ${JSON.stringify(own[key])}, upstream ${JSON.stringify(value)}`);
            }
        }
    }
    compare(upstream, ours, "");
    return found.map(entry => entry.replace(/^: /, "(root): "));
}
