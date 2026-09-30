import { PolicyYamlError } from "./tools.mjs";

const GPO_BASE_KEY = "Software\\Policies\\Mozilla\\Thunderbird";
const FORMATS = ["gpo", "plist", "json"];

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
 * Schema lookups along the path of an example value. Each step keeps the
 * matching node of every given schema: the branch schema first, then the
 * schema of main, which also marks the JSON values of older branches.
 */
class SchemaPath {
    constructor(schemas, nodes, dynamic = false) {
        this.schemas = schemas;
        this.nodes = nodes;
        // Whether the path runs through a patternProperties name, like the
        // extension id in 3rdparty.Extensions.<id>.
        this.dynamic = dynamic;
    }

    static forPolicy(schemas, name) {
        return new SchemaPath(
            schemas,
            schemas.map(schema => resolveRef(schema, schema?.properties?.[name]))
        );
    }

    property(key) {
        let dynamic = this.dynamic;
        const nodes = this.nodes.map((node, i) => {
            if (!node) {
                return null;
            }
            if (node.properties?.[key]) {
                return resolveRef(this.schemas[i], node.properties[key]);
            }
            for (const [pattern, child] of Object.entries(node.patternProperties ?? {})) {
                if (new RegExp(pattern).test(key)) {
                    dynamic = true;
                    return resolveRef(this.schemas[i], child);
                }
            }
            if (isPlainObject(node.additionalProperties)) {
                dynamic = true;
                return resolveRef(this.schemas[i], node.additionalProperties);
            }
            return null;
        });
        return new SchemaPath(this.schemas, nodes, dynamic);
    }

    item() {
        return new SchemaPath(
            this.schemas,
            this.nodes.map((node, i) => node?.items ? resolveRef(this.schemas[i], node.items) : null),
            this.dynamic
        );
    }

    get node() {
        return this.nodes.find(Boolean);
    }

    get types() {
        return this.node?.type ? [this.node.type].flat() : [];
    }

    get isJson() {
        return this.nodes.some(node =>
            node?.contentMediaType == "application/json" || node?.type == "JSON"
        );
    }
}

/**
 * Add the choices given by the schema: every accepted value of a boolean or of
 * an enum, starting with the value of the example. Values which the schema
 * declares as JSON are kept as they are, since their examples use single
 * values on purpose (e.g. the installation_mode of each extension).
 */
function addChoices(value, schemaPath) {
    if (schemaPath.isJson) {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(item => addChoices(item, schemaPath.item()));
    }
    if (isPlainObject(value)) {
        return Object.fromEntries(Object.entries(value).map(
            ([key, item]) => [key, addChoices(item, schemaPath.property(key))]
        ));
    }
    const choices = schemaPath.node?.enum ??
        (typeof value == "boolean" && schemaPath.types.includes("boolean") ? [true, false] : null);
    if (choices?.includes(value) && choices.length > 1) {
        return { $oneOf: [value, ...choices.filter(choice => choice !== value)] };
    }
    return value;
}

function renderChoice(value, render) {
    return value?.$oneOf ? value.$oneOf.map(render).join(" | ") : render(value);
}

/**
 * Render a value as JSON: two spaces indentation, arrays of scalars on a single
 * line, choices as `a | b`.
 */
function toJson(value, indent = "") {
    const inner = indent + "  ";
    if (value?.$oneOf) {
        return renderChoice(value, v => JSON.stringify(v));
    }
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
 * Render a value as a plist fragment, choices as `<true/> | <false/>`.
 */
function toPlist(value, indent = "") {
    const inner = indent + "  ";
    if (isScalar(value)) {
        return indent + renderChoice(value, toPlistScalar);
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

/**
 * Check whether an example path (e.g. ["SearchEngines", "Add", "0", "Name"])
 * matches one of the given path patterns (e.g. "SearchEngines/Add/*\/Name").
 */
function matchesPath(path, patterns = []) {
    return patterns.some(pattern => {
        const parts = pattern.split("/");
        return parts.length == path.length &&
            parts.every((part, i) => part == "*" || part == path[i]);
    });
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
function toGpo(value, { key, path, schemaPath, policy }) {
    const entry = (type, entryValue) => ({
        key,
        type,
        value: entryValue,
        ...(policy.category && { category: policy.category }),
        ...(matchesPath(path, policy.required) && { required: true }),
        // An ADMX template can not represent registry keys named after
        // arbitrary values, like the extension id in 3rdparty.
        ...(schemaPath.dynamic && { admx: false }),
    });

    if (schemaPath.isJson) {
        return [entry("REG_MULTI_SZ", toJson(value))];
    }
    if (isScalar(value)) {
        const first = value?.$oneOf ? value.$oneOf[0] : value;
        if (typeof first == "boolean" || typeof first == "number") {
            return [entry("REG_DWORD", renderChoice(value, toDword))];
        }
        const type = matchesPath(path, policy.expandable) ? "REG_EXPAND_SZ" : "REG_SZ";
        return [entry(type, renderChoice(value, String))];
    }
    if (Array.isArray(value)) {
        return value.flatMap((item, i) => toGpo(item, {
            key: `${key}\\${i + 1}`,
            path: [...path, String(i)],
            schemaPath: schemaPath.item(),
            policy,
        }));
    }
    return Object.entries(value).flatMap(([name, item]) => toGpo(item, {
        key: `${key}\\${name}`,
        path: [...path, name],
        schemaPath: schemaPath.property(name),
        policy,
    }));
}

const gpoKeys = gpo => gpo
    .flatMap(e => e.key.split("\n").map(key => key.trim()).filter(Boolean))
    .sort();
const plistKeys = plist => [...plist.matchAll(/<key>([^<]*)<\/key>/g)]
    .map(match => match[1])
    .sort();

/**
 * A given gpo or plist example is used as written, e.g. to show paths in the
 * style of the platform. Its structure must however match the json example.
 */
function checkOverride(name, format, given, derived, getKeys) {
    if (JSON.stringify(getKeys(given)) != JSON.stringify(getKeys(derived))) {
        console.log(`  --> WARNING: The ${format} example of ${name} does not match its json example.`);
    }
}

/**
 * Derive the gpo and plist examples of each policy from its json example (a
 * policies.json file), and add the choices given by the schema. Given gpo and
 * plist examples are used as written. The `formats` of a policy limit the
 * generated examples.
 *
 * @param {TemplateData} template
 * @param {Object[]} schemas - The policy schema of the branch, followed by the
 *    policy schema of main.
 */
export function deriveFormats(template, schemas) {
    for (const [name, policy] of Object.entries(template.policies)) {
        let example;
        try {
            example = JSON.parse(policy?.json ?? "").policies;
        } catch (e) {
            throw new PolicyYamlError(`The policy entry ${name} has no valid json example: ${e.message}`);
        }
        if (!isPlainObject(example)) {
            throw new PolicyYamlError(`The json example of ${name} has no "policies" object.`);
        }

        const values = Object.fromEntries(Object.entries(example).map(
            ([key, value]) => [key, addChoices(value, SchemaPath.forPolicy(schemas, key))]
        ));
        const gpo = Object.entries(values).flatMap(([key, value]) => toGpo(value, {
            key: `${GPO_BASE_KEY}\\${key}`,
            path: [key],
            schemaPath: SchemaPath.forPolicy(schemas, key),
            policy,
        }));
        const plist = toPlist(values);

        if (policy.gpo) {
            checkOverride(name, "gpo", policy.gpo, gpo, gpoKeys);
        } else {
            policy.gpo = gpo;
        }
        if (policy.plist) {
            checkOverride(name, "plist", policy.plist, plist, plistKeys);
        } else {
            policy.plist = plist;
        }
        policy.json = toJson({ policies: values });

        const formats = policy.formats ?? FORMATS;
        if (!formats.includes("gpo")) {
            policy.gpo = [];
        }
        if (!formats.includes("plist")) {
            policy.plist = null;
        }
        if (!formats.includes("json")) {
            policy.json = null;
        }
    }
}
