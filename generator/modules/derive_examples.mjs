import { CATCH_ALL_PATTERN, OPEN_NAME } from "./compatibility.mjs";
import {
    getExamples, getPolicyData, getSchemaSettings, getSettingTree, hasFormat, isJsonList, isJsonNode, isJsonObject,
    withoutTrailingPeriod,
} from "./schema_settings.mjs";

// The fields of a docs section which are taken from the schema node of the
// section as they are (a string or a list of strings), by schema key.
const SECTION_FIELDS = {
    "x-cck2-equivalent": "cck2Equivalent",
    "x-preferences-affected": "preferencesAffected",
};

function isPlainObject(value) {
    return !!value && typeof value == "object" && !Array.isArray(value);
}

function isScalar(value) {
    return value === null || typeof value != "object" || !!value.$oneOf;
}

/**
 * Resolve a JSON Schema `$ref` like "#/definitions/origin".
 */
function resolveRef(schema, node) {
    while (node?.$ref) {
        node = node.$ref
            .replace(/^#\//, "")
            .split("/")
            .reduce((obj, part) => obj?.[part], schema);
    }
    return node;
}

/**
 * Schema lookups along the path of an example value, in the policy schema of
 * the branch.
 */
class SchemaPath {
    /**
     * @param {Object} schema
     * @param {?Object} rawNode - The node of the step, before resolving a `$ref`
     *    (which may have annotations like "x-expand-env-vars" next to it).
     * @param {boolean} expandable - Whether a parent has "x-expand-env-vars".
     * @param {Object} [options] - See getSchemaOptions().
     */
    constructor(schema, rawNode, expandable = false, options = {}) {
        this.schema = schema;
        this.options = options;
        this.rawNode = rawNode ?? null;
        this.node = resolveRef(schema, rawNode) ?? null;
        // A text value is REG_EXPAND_SZ if it or a parent has
        // "x-expand-env-vars". (The ADMX template only passes the flag on to
        // the entries of a list, not to the settings of an object.)
        this.expandable = expandable || !!rawNode?.["x-expand-env-vars"] || !!this.node?.["x-expand-env-vars"];
    }

    static forPolicy(schema, name, options = {}) {
        return new SchemaPath(schema, schema?.properties?.[name], false, options);
    }

    property(key) {
        const node = this.node;
        let child = null;
        if (node?.properties?.[key]) {
            child = node.properties[key];
        } else if (node) {
            child = Object.entries(node.patternProperties ?? {}).find(([pattern]) => new RegExp(pattern).test(key))?.[1] ??
                (isPlainObject(node.additionalProperties) ? node.additionalProperties : null);
        }
        return new SchemaPath(this.schema, child, this.expandable, this.options);
    }

    item() {
        return new SchemaPath(this.schema, this.node?.items ?? null, this.expandable, this.options);
    }

    /**
     * The names of the child settings: the fixed properties, and OPEN_NAME if
     * the names of some children are chosen when configuring the policy.
     */
    get childNames() {
        const node = this.node;
        if (!node) {
            return [];
        }
        const names = Object.keys(node.properties ?? {});
        if (Object.keys(node.patternProperties ?? {}).some(pattern => CATCH_ALL_PATTERN.test(pattern)) ||
            isPlainObject(node.additionalProperties)) {
            names.push(OPEN_NAME);
        }
        return names;
    }

    // A JSON value, or a list or an object which the ADMX template offers as
    // one JSON value (see isJsonList() and isJsonObject()).
    get isJson() {
        return isJsonNode(this.node) || isJsonList(this.schema, this.node)
            || (!!this.options.jsonObjects && isJsonObject(this.schema, this.node));
    }
}

/**
 * Render a value as JSON: two spaces indentation, arrays of scalars on a single
 * line.
 */
function toJson(value, indent = "") {
    const inner = indent + "  ";
    if (Array.isArray(value)) {
        if (value.every(isScalar)) {
            return `[${value.map(v => toJson(v)).join(", ")}]`;
        }
        return `[\n${value.map(v => inner + toJson(v, inner)).join(",\n")}\n${indent}]`;
    }
    if (isPlainObject(value)) {
        const entries = Object.entries(value);
        if (entries.length == 0) {
            return "{}";
        }
        return `{\n${entries.map(([k, v]) => `${inner}${JSON.stringify(k)}: ${toJson(v, inner)}`).join(",\n")}\n${indent}}`;
    }
    return JSON.stringify(value);
}

function escapeXml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function toPlistScalar(value) {
    if (typeof value == "boolean") {
        return `<${value}/>`;
    }
    if (typeof value == "number") {
        return Number.isInteger(value) ? `<integer>${value}</integer>` : `<real>${value}</real>`;
    }
    return `<string>${escapeXml(value)}</string>`;
}

/**
 * Render a value as a plist fragment.
 */
function toPlist(value, indent = "") {
    const inner = indent + "  ";
    if (isScalar(value)) {
        return indent + toPlistScalar(value);
    }
    if (Array.isArray(value)) {
        return [
            `${indent}<array>`,
            ...value.map(v => toPlist(v, inner)),
            `${indent}</array>`,
        ].join("\n");
    }
    return [
        `${indent}<dict>`,
        ...Object.entries(value).flatMap(([k, v]) => [
            `${inner}<key>${escapeXml(k)}</key>`,
            toPlist(v, inner),
        ]),
        `${indent}</dict>`,
    ].join("\n");
}

function toDword(value) {
    return typeof value == "boolean"
        ? (value ? "0x1" : "0x0")
        : `0x${value.toString(16)}`;
}

/**
 * Build the GPO entries of a value: objects become subkeys, array entries
 * numbered subkeys, values declared as JSON in the schema a single REG_MULTI_SZ.
 */
function toGpo(value, { key, schemaPath }) {
    const entry = (type, entryValue) => ({ key, type, value: entryValue });

    if (schemaPath.isJson) {
        return [entry("REG_MULTI_SZ", toJson(value))];
    }
    if (isScalar(value)) {
        if (typeof value == "boolean" || typeof value == "number") {
            return [entry("REG_DWORD", toDword(value))];
        }
        const type = schemaPath.expandable ? "REG_EXPAND_SZ" : "REG_SZ";
        return [entry(type, String(value))];
    }
    if (Array.isArray(value)) {
        return value.flatMap((item, i) => toGpo(item, {
            key: `${key}\\${i + 1}`,
            schemaPath: schemaPath.item(),
        }));
    }
    return Object.entries(value).flatMap(([property, item]) => toGpo(item, {
        key: `${key}\\${property}`,
        schemaPath: schemaPath.property(property),
    }));
}

/**
 * Get the setting path of a docs section from its name, e.g. ["SearchEngines", "Add"]
 * for "SearchEngines_Add" or ["SecurityDevices", "[name]"] for
 * "SecurityDevices_[name]". The names of settings may contain "_" themselves
 * (e.g. the ciphers of DisabledCiphers), so they are matched against the schema.
 *
 * @returns {{path: string[], schemaPath: SchemaPath}}
 */
function resolveEntryPath(name, schema) {
    const [policy, ...rest] = name.split("_");
    let schemaPath = SchemaPath.forPolicy(schema, policy);
    if (!schemaPath.node) {
        throw new Error(`The section ${name} is not named after a policy of the schema.`);
    }
    const path = [policy];
    let remaining = rest.join("_");
    while (remaining) {
        const match = schemaPath.childNames
            .filter(child => remaining == child || remaining.startsWith(`${child}_`))
            .sort((a, b) => b.length - a.length)[0];
        if (!match) {
            throw new Error(`The section ${name} is not named after a policy or one of its settings.`);
        }
        path.push(match);
        schemaPath = schemaPath.property(match);
        remaining = remaining.slice(match.length + 1);
    }
    return { path, schemaPath };
}

/**
 * Put the example value of an entry at its setting path, e.g.
 * { SearchEngines: { Add: value } }. An OPEN_NAME segment holds the object of
 * names and values itself.
 */
function wrapExample(path, value) {
    let wrapped = value;
    for (let i = path.length - 1; i > 0; i--) {
        if (path[i] != OPEN_NAME) {
            wrapped = { [path[i]]: wrapped };
        }
    }
    return { [path[0]]: wrapped };
}

// The note for settings with "x-expand-env-vars": the docs describe all
// formats, but only Windows expands environment variables (in REG_EXPAND_SZ
// values set via Group Policy).
const EXPAND_ENV_VARS_NOTE = "Environment variables like %USERPROFILE% are only expanded when the policy is set via Group Policy.";

/**
 * Add the note for settings with "x-expand-env-vars" to a text.
 */
function withEnvVarsNote(text, { expandEnvVars }, separator) {
    return expandEnvVars ? [text, EXPAND_ENV_VARS_NOTE].filter(Boolean).join(separator) : text;
}

/**
 * Get the settings of a docs section as a tree (see getSettingTree()), for
 * the blocks of the docs: the child settings of the section's setting, without
 * the settings which have a docs section of their own. Settings with
 * "x-expand-env-vars" get a note, choices are only kept if they have
 * descriptions, and a setting is only marked as deprecated if its parent is
 * not.
 *
 * @param {Object} node - A node of the tree of the policy.
 * @param {string[]} sections - The setting paths of all docs sections, joined by "/".
 * @returns {{name: string, type: string, severalForms: boolean, choices: ?Object[], children: Object[]}}
 */
function getSectionTree(node, sections) {
    const convert = (child, parentDeprecated) => ({
        name: child.name,
        title: child.title ? withoutTrailingPeriod(child.title) : null,
        type: child.type,
        description: withEnvVarsNote(child.description?.trimEnd(), child, " "),
        deprecated: child.deprecated && !parentDeprecated,
        ...getSectionTree(child, sections),
    });
    return {
        name: node.name,
        type: node.type,
        severalForms: node.severalForms,
        choices: node.choices?.some(choice => choice.description) ? node.choices : null,
        children: node.children
            .filter(child => !sections.includes(child.path.join("/")))
            .map(child => convert(child, node.deprecated)),
    };
}

/**
 * Get the texts of a docs section from the texts of the settings in the
 * schema (see getSchemaSettings()): the name for its heading ("title", none
 * without it), the line in the table of contents (its "description" alone),
 * the text ("description" followed by "x-help"), whether it is deprecated, and
 * the tree of its settings which have no docs section of their own (see
 * getSectionTree()).
 *
 * @param {Map<string, Object>} texts - The texts of the policy by path.
 * @param {Object} tree - The tree of the policy, see getSettingTree().
 * @param {string[]} path - The setting path of the section.
 * @param {string[]} sections - The setting paths of all docs sections, joined by "/".
 */
function getSectionTexts(texts, tree, path, sections) {
    const own = texts.get(path.join("/"));
    let node = tree;
    for (const name of path.slice(1)) {
        node = node.children.find(child => child.name == name);
    }
    return {
        // The name in the heading, without a trailing full stop.
        title: own?.title ? withoutTrailingPeriod(own.title) : null,
        // The line in the table of contents.
        summary: own?.description?.trim() || null,
        description: withEnvVarsNote(
            [own?.description, own?.help].filter(Boolean).map(text => text.trim()).join("\n\n"),
            own ?? {},
            "\n\n"
        ),
        deprecated: !!own?.deprecated,
        settingTree: getSectionTree(node, sections),
    };
}

/**
 * Get the docs sections of a policy: the policy itself, and each of its
 * settings with an "x-help" of its own (a long text needs a section), named
 * by their setting path, joined by "_" (e.g. "SearchEngines_Add").
 *
 * @param {Map<string, Object>} texts - The texts of the policy by path.
 * @returns {string[]}
 */
function getSectionNames(texts) {
    return [...texts].filter(([key, own]) => !key.includes("/") || own.help)
        .map(([key]) => key.replaceAll("/", "_"));
}

/**
 * Derive the docs sections from the policy schema: every policy, and every
 * setting with an "x-help" of its own. Each gets its texts, the fields of
 * SECTION_FIELDS of its node, and its json, gpo and plist examples with the
 * choices given by the schema. The example of a section is the example of its
 * policy or setting (e.g. SearchEngines_Add), see getExample(): generated from
 * the schema and the hand-written examples of its settings ("x-examples-gpo"
 * for the GPO example, e.g. with Windows paths). A setting with several forms
 * has one example per form, see getExamples(). The "x-formats" of a policy
 * limit the examples.
 *
 * Each section has: `title`, `summary`, `description`, `deprecated`, `settingTree`,
 * `cck2Equivalent`, `preferencesAffected`, `json`, `gpo` and `plist`.
 *
 * @param {Object} schema - The policy schema of the branch, see loadBranch().
 * @param {SchemaL10n} l10n - Resolves the texts given as Fluent messages.
 * @param {string} registryKey - The registry key of the product's policies
 *    (admx.registry-key in product.yaml), for the GPO examples.
 * @param {Object} [options] - See getSchemaOptions().
 * @returns {Object<string, Object>} the sections by name, e.g.
 *    "SearchEngines_Add"
 */
export function deriveSections(schema, l10n, registryKey, options = {}) {
    const policies = {};
    const entries = Object.keys(schema.properties ?? {})
        .flatMap(policyName => getSectionNames(getSchemaSettings(schema, policyName, l10n, options).texts))
        .map(name => {
            policies[name] = {};
            return { name, policy: policies[name], ...resolveEntryPath(name, schema) };
        });
    const sections = entries.map(({ path }) => path.join("/"));
    const textsByPolicy = new Map();
    const treeByPolicy = new Map();

    for (const { policy, path, schemaPath } of entries) {
        if (!textsByPolicy.has(path[0])) {
            textsByPolicy.set(path[0], getSchemaSettings(schema, path[0], l10n, options).texts);
            treeByPolicy.set(path[0], getSettingTree(schema, path[0], l10n, options));
        }
        Object.assign(policy, getSectionTexts(textsByPolicy.get(path[0]), treeByPolicy.get(path[0]), path, sections));
        for (const [key, field] of Object.entries(SECTION_FIELDS)) {
            policy[field] = schemaPath.rawNode?.[key];
        }

        const policyData = getPolicyData(schema, path[0]);
        // One example per form of the setting, see getExamples().
        const examples = {
            json: getExamples(schema, path).map(value => wrapExample(path, value)),
            gpo: getExamples(schema, path, { format: "gpo" }).map(value => wrapExample(path, value)),
        };
        examples.plist = examples.json;

        // Only the examples of the formats of the policy (see "x-formats").
        // The examples of the forms follow each other.
        policy.gpo = hasFormat(policyData, "gpo")
            ? examples.gpo.flatMap(example => Object.entries(example).flatMap(([key, value]) => toGpo(value, {
                key: `${registryKey}\\${key}`,
                schemaPath: SchemaPath.forPolicy(schema, key, options),
            })))
            : [];
        policy.plist = hasFormat(policyData, "plist") ? examples.plist.map(example => toPlist(example)).join("\n\n") : null;
        policy.json = hasFormat(policyData, "json")
            ? examples.json.map(example => toJson({ policies: example })).join("\n\n")
            : null;
    }
    return policies;
}
