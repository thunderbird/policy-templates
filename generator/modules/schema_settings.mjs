/**
 * The settings of a policy, read from the policy schema, for the ADMX
 * template: the registry values each setting needs, and the texts of each
 * setting. Texts are the standard "title" and "description" keywords of JSON
 * Schema, the long help text "x-help", and the titles of the choices of
 * "oneOf". Each is either plain English or a Fluent message (see l10n.mjs).
 * Further: "x-deprecated", and "x-expand-env-vars" for values in which
 * Windows expands environment variables (REG_EXPAND_SZ). A text value is required if the schema does not accept an
 * empty string, or if its parent lists it as required.
 */

import { CATCH_ALL_PATTERN, OPEN_NAME, getPatternLabel, getPatternNames } from "./compatibility.mjs";

// Placeholder for the index of a list entry, and for an open name, in the
// registry keys of the settings.
const LIST_ENTRY = "1";
const NAME_PLACEHOLDER = "NAME";
// The string types of older schemas, before they used standard JSON Schema.
const STRING_TYPES = ["string", "URL", "URLorEmpty", "origin"];

function isPlainObject(value) {
    return !!value && typeof value == "object" && !Array.isArray(value);
}

/**
 * Resolve a JSON Schema `$ref` like "#/definitions/url", keeping the keywords
 * next to it (e.g. the title of a setting whose type is a shared definition).
 */
export function resolveRef(schema, node) {
    let annotations = {};
    while (node?.$ref) {
        const { $ref, ...rest } = node;
        annotations = { ...rest, ...annotations };
        node = $ref.replace(/^#\//, "").split("/").reduce((obj, part) => obj?.[part], schema);
    }
    return node ? { ...node, ...annotations } : node;
}

/**
 * A setting of the policy schema of a branch (with its overlay, see
 * mergeSchemaOverlay()).
 */
class SchemaSetting {
    constructor(schema, l10n, node) {
        this.schema = schema;
        this.l10n = l10n;
        this.node = node;
    }

    static forPolicy(schema, l10n, name) {
        return new SchemaSetting(schema, l10n, resolveRef(schema, schema?.properties?.[name]));
    }

    child(key) {
        const node = this.node;
        let child = null;
        if (node?.properties?.[key]) {
            child = node.properties[key];
        } else {
            child = Object.entries(node?.patternProperties ?? {}).find(([pattern]) =>
                key == OPEN_NAME ? CATCH_ALL_PATTERN.test(pattern) : new RegExp(pattern).test(key)
            )?.[1] ?? null;
        }
        return new SchemaSetting(this.schema, this.l10n, child && resolveRef(this.schema, child));
    }

    item() {
        return new SchemaSetting(this.schema, this.l10n, this.node?.items ? resolveRef(this.schema, this.node.items) : null);
    }

    get types() {
        return this.node?.type ? [this.node.type].flat() : [];
    }

    get isJson() {
        return this.node?.contentMediaType == "application/json" || this.node?.type == "JSON";
    }

    // A prose field, plain or from its Fluent message.
    text(field, where) {
        return this.l10n.get(this.node, field, where) || undefined;
    }

    // A field which is no prose.
    field(field) {
        return this.node?.[field];
    }

    // Whether Windows expands environment variables in the value (for a list:
    // in its entries).
    get expandEnvVars() {
        return !!this.field("x-expand-env-vars");
    }

    // The values of a choice (oneOf with const, or enum) and their titles and
    // descriptions.
    getChoices(where) {
        const oneOf = this.node.oneOf?.every(choice => "const" in choice) ? this.node.oneOf : null;
        const values = oneOf?.map(choice => choice.const) ?? this.node.enum;
        if (!values) {
            return null;
        }
        return values.map(value => {
            const choice = oneOf?.find(choice => choice.const === value);
            return {
                value,
                title: (choice && this.l10n.get(choice, "title", `${where} = ${value}`)) || undefined,
                description: (choice && this.l10n.get(choice, "description", `${where} = ${value}`)) || undefined,
            };
        });
    }

    get isString() {
        return this.types.some(type => STRING_TYPES.includes(type));
    }

    get openNameChild() {
        return Object.keys(this.node?.patternProperties ?? {}).some(pattern => CATCH_ALL_PATTERN.test(pattern))
            ? this.child(OPEN_NAME)
            : null;
    }
}

/**
 * Whether a schema accepts an empty string: not with a minLength of at least 1,
 * a format (e.g. "moz-url") or the types URL and origin of older schemas, with
 * a pattern only if it matches "", and with anyOf/oneOf if one of its
 * alternatives does (e.g. "urlOrEmpty").
 *
 * @param {Object} schema - The schema, to resolve $refs.
 * @param {Object} node
 * @returns {boolean}
 */
export function acceptsEmptyString(schema, node) {
    node = resolveRef(schema, node);
    if (!node) {
        return true;
    }
    for (const keyword of ["anyOf", "oneOf"]) {
        if (Array.isArray(node[keyword])) {
            return node[keyword].some(alternative => acceptsEmptyString(schema, alternative));
        }
    }
    if ((node.minLength ?? 0) >= 1 || node.format) {
        return false;
    }
    // The string types of older schemas: only URLorEmpty may be empty.
    if ([node.type].flat().some(type => ["URL", "origin"].includes(type))) {
        return false;
    }
    if (node.pattern && !new RegExp(node.pattern).test("")) {
        return false;
    }
    return true;
}

const toDword = value => typeof value == "boolean"
    ? (value ? "0x1" : "0x0")
    : `0x${value.toString(16)}`;

/**
 * Get the settings of a policy from the schema: the registry values of its
 * settings (in the form of the GPO entries of derive_examples.mjs, with all
 * choices of the schema as value, and keys relative to the product's registry
 * key, e.g. "Cookies\\Behavior"), and the texts of each setting by path.
 *
 * @param {Object} schema - The policy schema of the branch (with its overlay).
 * @param {string} policyName
 * @param {SchemaL10n} l10n - Resolves the texts given as Fluent messages.
 * @returns {{entries: Object[], texts: Map<string, Object>}}
 */
export function getSchemaSettings(schema, policyName, l10n) {
    const entries = [];
    const texts = new Map();

    function walk(setting, { keyParts, path, required, expandable, deprecated, listEntry = false }) {
        if (!setting.node) {
            return;
        }
        const where = path.join(".");
        deprecated = deprecated || !!setting.field("x-deprecated");
        const title = setting.text("title", where);
        const description = setting.text("description", where);
        const help = setting.text("x-help", where);
        // The texts are the help texts of the ADMX template, which are shown
        // as plain text.
        for (const [field, text] of [["description", description], ["x-help", help]]) {
            if (/^\s*(\||```)/m.test(text ?? "")) {
                throw new Error(`The ${field} of ${where} in the policy schema contains a table or a code block.`);
            }
        }
        const expandEnvVars = setting.expandEnvVars;
        if (title || description || help || deprecated || expandEnvVars) {
            texts.set(path.join("/"), { title, description, help, deprecated, expandEnvVars });
        }
        expandable = expandable || expandEnvVars;
        const key = keyParts.join("\\");
        const entry = (type, value, extra = {}) => entries.push({
            key,
            type,
            value,
            ...(required && { required: true }),
            ...extra,
        });

        if (setting.isJson) {
            entry("REG_MULTI_SZ", "");
            return;
        }
        const node = setting.node;
        const types = setting.types;
        if (types.includes("array") && node.items) {
            // A list, which is preferred for settings which can also be a
            // single value (e.g. RequestedLocales).
            const item = setting.item();
            if (item.node?.properties) {
                for (const [name] of Object.entries(item.node.properties)) {
                    walk(item.child(name), {
                        keyParts: [...keyParts, LIST_ENTRY, name],
                        path: [...path, name],
                        required: (item.node.required ?? []).includes(name),
                        expandable: false,
                        deprecated,
                    });
                }
            } else {
                walk(item, { keyParts: [...keyParts, LIST_ENTRY], path, required, expandable, deprecated, listEntry: true });
            }
            return;
        }
        const choices = setting.getChoices(where);
        if (choices) {
            const numbers = choices.every(({ value }) => typeof value == "number");
            const render = numbers ? toDword : String;
            entry(numbers ? "REG_DWORD" : "REG_SZ", choices.map(({ value }) => render(value)).join(" | "), {
                choiceTitles: Object.fromEntries(choices.map(({ value, title }) => [render(value), title ?? String(value)])),
            });
            return;
        }
        if (types.includes("boolean")) {
            entry("REG_DWORD", "0x1 | 0x0");
            return;
        }
        if (setting.isString) {
            // A text which may not be empty must be entered (list entries are
            // never empty).
            const mustBeEntered = !listEntry && !acceptsEmptyString(setting.schema, node);
            entry(expandable ? "REG_EXPAND_SZ" : "REG_SZ", "", mustBeEntered ? { required: true } : {});
            return;
        }
        if (types.includes("number") || types.includes("integer")) {
            entry("REG_DWORD", "0x0");
            return;
        }
        if (isPlainObject(node.properties) || isPlainObject(node.patternProperties)) {
            for (const name of Object.keys(node.properties ?? {})) {
                walk(setting.child(name), {
                    keyParts: [...keyParts, name],
                    path: [...path, name],
                    required: (node.required ?? []).includes(name),
                    expandable: false,
                    deprecated,
                });
            }
            // Settings with open names become a list of names and values. Below
            // an open name, an ADMX template can only represent a value.
            const openName = setting.openNameChild;
            if (openName?.node) {
                const openPath = [...path, OPEN_NAME];
                const openWhere = openPath.join(".");
                const title = openName.text("title", openWhere);
                const description = openName.text("description", openWhere);
                const help = openName.text("x-help", openWhere);
                const expandEnvVars = openName.expandEnvVars;
                const openDeprecated = deprecated || !!openName.field("x-deprecated");
                if (title || description || help || expandEnvVars || openDeprecated) {
                    texts.set(openPath.join("/"), { title, description, help, deprecated: openDeprecated, expandEnvVars });
                }
                const openKey = [...keyParts, NAME_PLACEHOLDER].join("\\");
                if (openName.isJson) {
                    entries.push({ key: openKey, type: "REG_MULTI_SZ", value: "", explicitName: true });
                } else if (openName.isString) {
                    entries.push({
                        key: openKey,
                        type: expandEnvVars ? "REG_EXPAND_SZ" : "REG_SZ",
                        value: "",
                        explicitName: true,
                    });
                } else {
                    console.warn(`The setting ${openPath.join(".")} can not be represented in an ADMX template.`);
                }
            }
        }
    }

    walk(SchemaSetting.forPolicy(schema, l10n, policyName), {
        keyParts: [policyName],
        path: [policyName],
        required: false,
        expandable: false,
        deprecated: false,
    });
    return { entries, texts };
}

/**
 * Get the kind of a string setting for the docs: "URL" or "origin" (from its
 * format, or the string types of older schemas), else null.
 */
function getStringKind(node) {
    const types = node?.type ? [node.type].flat() : [];
    if (types.includes("origin") || (node?.format && /\[Hh\]\[Tt\]\[Tt\]\[Pp\]/.test(node?.pattern ?? ""))) {
        return "origin";
    }
    const formats = [node?.format, ...(node?.anyOf ?? []).map(alternative => alternative.format)];
    if (types.includes("URL") || types.includes("URLorEmpty") || formats.some(format => ["moz-url", "uri"].includes(format))) {
        return "URL";
    }
    return null;
}

/**
 * Get the type of a setting for the docs, e.g. "boolean", "list of strings",
 * "string, URL", "number, boolean or string", "JSON", with its values if it
 * has a fixed set of them, e.g. "number: `4` or `5`".
 *
 * @param {SchemaSetting} setting
 * @param {?Object[]} choices - The values of the setting (of its entries for
 *    a list), see SchemaSetting.getChoices().
 * @returns {string}
 */
function getTypeLabel(setting, choices) {
    const type = getBaseTypeLabel(setting);
    if (!choices?.length) {
        return type;
    }
    const values = choices.map(choice => `\`${choice.value}\``);
    return `${type}: ${values.length > 1 ? `${values.slice(0, -1).join(", ")} or ${values.at(-1)}` : values[0]}`;
}

/**
 * Get the type of a setting without its values, see getTypeLabel().
 *
 * @param {SchemaSetting} setting
 * @returns {string}
 */
function getBaseTypeLabel(setting) {
    const node = setting.node;
    if (setting.isJson) {
        return "JSON";
    }
    const types = setting.types.map(type => ["URL", "URLorEmpty", "origin"].includes(type) ? "string" : type);
    if (types.length > 1) {
        return `${types.slice(0, -1).join(", ")} or ${types.at(-1)}`;
    }
    const type = types[0] ?? "string";
    if (type == "array" && node.items) {
        const item = setting.item();
        const kind = getStringKind(item.node);
        const itemType = kind ?? item.types[0] ?? "string";
        return `list of ${itemType}s`;
    }
    const kind = type == "string" ? getStringKind(node) : null;
    return kind ? `string, ${kind}` : type;
}

/**
 * Get a policy as a tree of its settings, for the docs and the help texts of
 * the ADMX template: each node with its name, its setting path, its
 * "description", whether it is deprecated, whether Windows expands
 * environment variables in it, whether it holds a JSON value, its choices
 * (with their descriptions) and its child settings. Unlike getSchemaSettings(),
 * it also walks into JSON values. The settings of the entries of a list are
 * the children of the list.
 *
 * @param {Object} schema - The policy schema of the branch (with its overlay).
 * @param {string} policyName
 * @param {SchemaL10n} l10n - Resolves the texts given as Fluent messages.
 * @returns {?Object} the node of the policy, null if it is not in the schema
 */
export function getSettingTree(schema, policyName, l10n) {
    function build(setting, name, path, parentDeprecated) {
        if (!setting.node) {
            return null;
        }
        const node = setting.node;
        const where = path.join(".");
        const deprecated = parentDeprecated || !!setting.field("x-deprecated");
        // The settings of a list are the settings of its entries.
        const container = setting.types.includes("array") && node.items ? setting.item() : setting;
        const children = [];
        for (const key of Object.keys(container.node?.properties ?? {})) {
            children.push(build(container.child(key), key, [...path, key], deprecated));
        }
        // A pattern of alternatives is one setting, e.g.
        // "(mimeTypes|extensions|schemes)".
        for (const [pattern, child] of Object.entries(container.node?.patternProperties ?? {})) {
            const childName = getPatternLabel(pattern);
            children.push(build(
                new SchemaSetting(schema, l10n, resolveRef(schema, child)), childName, [...path, childName], deprecated
            ));
        }
        const choices = container.node?.properties || container.node?.patternProperties
            ? null
            : container.getChoices(where);
        return {
            name,
            path,
            type: getTypeLabel(setting, choices),
            title: setting.text("title", where),
            description: setting.text("description", where),
            deprecated,
            expandEnvVars: setting.expandEnvVars,
            json: setting.isJson,
            choices,
            children: children.filter(Boolean),
        };
    }
    return build(SchemaSetting.forPolicy(schema, l10n, policyName), policyName, [policyName], false);
}

/**
 * A text shown as a name (the title of a setting, else its description, which
 * is a sentence), without a trailing full stop.
 *
 * @param {string} text
 * @returns {string}
 */
export function withoutTrailingPeriod(text) {
    return text.replace(/\.$/, "");
}

// The placeholders of a generated example for a string and for an open name
// without hand-written example, see getExample().
export const STRING_PLACEHOLDER = "<a string value>";
export const NAME_PLACEHOLDER_EXAMPLE = "<a name>";

/**
 * Get the hand-written examples of a schema node: "x-examples-gpo" for the
 * Windows (GPO) format if given, else "examples".
 *
 * @param {Object} node
 * @param {string} [format] - "gpo" for the Windows variant.
 * @returns {?any[]}
 */
function getOwnExamples(node, format) {
    if (format == "gpo" && Array.isArray(node?.["x-examples-gpo"]) && node["x-examples-gpo"].length) {
        return node["x-examples-gpo"];
    }
    return Array.isArray(node?.examples) && node.examples.length ? node.examples : null;
}

/**
 * Generate the example of a schema node: its own first example if it has
 * hand-written ones, else from its type: booleans are true, a choice its first
 * value, an object the examples of its settings (without the deprecated ones),
 * a list one entry, and of several types the first one. A free-text string
 * without example is STRING_PLACEHOLDER, an open name without example
 * NAME_PLACEHOLDER_EXAMPLE (the CI test of the schema reports both as missing
 * examples).
 *
 * @param {Object} schema
 * @param {Object} node - The node, resolved (see resolveRef()).
 * @param {string} [format] - "gpo" for the Windows variant.
 * @returns {any}
 */
function generateExample(schema, node, format) {
    const own = getOwnExamples(node, format);
    if (own) {
        return own[0];
    }
    const choice = node.oneOf?.every(c => "const" in c) ? node.oneOf[0].const : node.enum?.[0];
    if (choice !== undefined) {
        return choice;
    }
    if ("const" in node) {
        return node.const;
    }
    // Of several alternatives, the first one.
    const alternatives = node.anyOf ?? (node.oneOf?.every(c => "const" in c) ? null : node.oneOf);
    if (alternatives && !node.type) {
        return generateExample(schema, resolveRef(schema, alternatives[0]), format);
    }
    const type = [node.type].flat()[0];
    switch (type) {
        case "boolean":
            return true;
        case "number":
        case "integer":
            return 0;
        case "array":
            return node.items ? [generateExample(schema, resolveRef(schema, node.items), format)] : [];
        case "object":
        case "JSON": {
            const value = {};
            for (const [name, child] of Object.entries(node.properties ?? {})) {
                const resolved = resolveRef(schema, child);
                if (!resolved["x-deprecated"]) {
                    value[name] = generateExample(schema, resolved, format);
                }
            }
            for (const [pattern, child] of Object.entries(node.patternProperties ?? {})) {
                const resolved = resolveRef(schema, child);
                if (!resolved["x-deprecated"]) {
                    // A pattern of alternatives gives one key per name.
                    for (const name of getPatternNames(pattern)) {
                        value[name == OPEN_NAME ? NAME_PLACEHOLDER_EXAMPLE : name] = generateExample(schema, resolved, format);
                    }
                }
            }
            return value;
        }
        default:
            return STRING_PLACEHOLDER;
    }
}

/**
 * Get the part of a value at a setting path: an OPEN_NAME step selects the
 * names which are no fixed setting of the object.
 *
 * @returns {any} undefined if the value doesn't have the part
 */
function getValuePart(value, node, schema, path) {
    for (const name of path) {
        if (!isPlainObject(value)) {
            return undefined;
        }
        if (name == OPEN_NAME) {
            const fixed = Object.keys(node?.properties ?? {});
            const open = Object.entries(value).filter(([key]) => !fixed.includes(key));
            value = open.length ? Object.fromEntries(open) : undefined;
            node = resolveRef(schema, Object.entries(node?.patternProperties ?? {})
                .find(([pattern]) => CATCH_ALL_PATTERN.test(pattern))?.[1]);
        } else {
            value = value[name];
            node = resolveRef(schema, node?.properties?.[name]);
        }
        if (value === undefined) {
            return undefined;
        }
    }
    return value;
}

/**
 * Get the example of a policy or of one of its settings. If a node on the path
 * has hand-written examples (e.g. a policy with open names), the example is the
 * part at the setting of the first of them which has it. Else it is generated
 * from the setting (see generateExample()), which uses the hand-written
 * examples of the settings below it. For an open name (OPEN_NAME), the value
 * is the object of the open names.
 *
 * @param {Object} schema - The policy schema of the branch (with its overlay).
 * @param {string[]} path - The policy name, followed by the setting names.
 * @param {Object} [options]
 * @param {string} [options.format] - "gpo" for the Windows (GPO) variant.
 * @returns {any} undefined if the policy or setting is not in the schema
 */
export function getExample(schema, path, { format } = {}) {
    // The nodes along the path.
    const nodes = [resolveRef(schema, schema?.properties?.[path[0]])];
    for (const name of path.slice(1)) {
        const parent = nodes.at(-1);
        const child = name == OPEN_NAME
            ? Object.entries(parent?.patternProperties ?? {}).find(([pattern]) => CATCH_ALL_PATTERN.test(pattern))?.[1]
            : parent?.properties?.[name];
        nodes.push(child && resolveRef(schema, child));
    }
    if (!nodes.at(-1)) {
        return undefined;
    }
    // The nearest node with hand-written examples on the path.
    for (let i = nodes.length - 1; i >= 0; i--) {
        const examples = getOwnExamples(nodes[i], format);
        if (examples) {
            for (const example of examples) {
                const part = getValuePart(example, nodes[i], schema, path.slice(i + 1));
                if (part !== undefined) {
                    return part;
                }
            }
            break;
        }
    }
    if (path.at(-1) == OPEN_NAME) {
        return { [NAME_PLACEHOLDER_EXAMPLE]: generateExample(schema, nodes.at(-1), format) };
    }
    return generateExample(schema, nodes.at(-1), format);
}

// The formats of the "x-formats" hint of a policy.
export const FORMATS = ["gpo", "plist", "json"];

/**
 * Get the formats and the category of a policy from the schema: "x-formats"
 * (the formats the policy is used with: "gpo" for the Windows templates,
 * "plist" for the macOS template, "json" for policies.json files, all formats
 * if not given), and "x-category" (the category it is listed under, like in
 * Firefox's schema). The examples of a policy come from getExample().
 *
 * @param {Object} schema - The policy schema of the branch (with its overlay).
 * @param {string} policyName
 * @returns {{formats: ?string[], category: ?string}}
 */
export function getPolicyData(schema, policyName) {
    const node = resolveRef(schema, schema?.properties?.[policyName]);
    const find = field => Array.isArray(node?.[field]) ? node[field] : undefined;
    return {
        formats: find("x-formats"),
        // The category the policy is listed under, like in Firefox's schema.
        category: typeof node?.["x-category"] == "string" && node["x-category"] ? node["x-category"] : undefined,
    };
}

/**
 * Whether a policy is used with the given format, see getPolicyData().
 *
 * @param {{formats: ?string[]}} policyData
 * @param {string} format - One of FORMATS.
 * @returns {boolean}
 */
export function hasFormat({ formats }, format) {
    return !formats || formats.includes(format);
}
