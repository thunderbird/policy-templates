import fs from "node:fs/promises";
import pathUtils from "node:path";
import { fileURLToPath } from "node:url";

import { validateXML } from "xmllint-wasm";
import { create } from "xmlbuilder2";

// The official schemas of ADMX and ADML files, see schemas/admx/README.md.
const SCHEMA_DIR = pathUtils.join(
    pathUtils.dirname(fileURLToPath(import.meta.url)), "..", "schemas", "admx"
);

// The type of the policy element, which a presentation control refers to.
const CONTROL_ELEMENT_TYPES = {
    checkBox: "boolean",
    comboBox: "text",
    decimalTextBox: "decimal",
    dropdownList: "enum",
    listBox: "list",
    longDecimalTextBox: "longDecimal",
    multiTextBox: "multiText",
    textBox: "text",
};

/**
 * @typedef {Object} ValidationProblem
 * @property {string} file - Name of the file with the problem.
 * @property {number} [line] - Line of the problem, if known.
 * @property {string} message
 */

// The schemas are read once and used by all validations.
let schemas = null;

function readSchemas() {
    const read = name => fs.readFile(pathUtils.join(SCHEMA_DIR, name), "utf8");
    schemas ??= (async () => ({
        schema: [await read("PolicyDefinitionFiles.xsd")],
        preload: [
            { fileName: "BaseTypes.xsd", contents: await read("BaseTypes.xsd") },
            { fileName: "PolicyDefinitions.xsd", contents: await read("PolicyDefinitions.xsd") },
        ],
    }))();
    return schemas;
}

/**
 * Validate a file against the official ADMX/ADML schemas.
 *
 * @returns {Promise<ValidationProblem[]>}
 */
async function validateSchema(fileName, contents) {
    const result = await validateXML({
        xml: [{ fileName, contents }],
        ...(await readSchemas()),
    });
    return result.errors.map(error => ({
        file: fileName,
        line: error.loc?.lineNumber,
        message: error.message,
    }));
}

function elements(node, name) {
    return [...node.getElementsByTagNameNS("*", name)];
}

function children(node) {
    return [...node.childNodes].filter(child => child.nodeType == 1);
}

function duplicates(values) {
    return [...new Set(values.filter((value, i) => values.indexOf(value) != i))];
}

function compareRevision(a, b) {
    const [a1, a2] = a.split(".").map(Number);
    const [b1, b2] = b.split(".").map(Number);
    return a1 - b1 || a2 - b2;
}

/**
 * Check the references between an ADMX and its ADML file, which are required
 * by Group Policy tools but not covered by the schemas.
 *
 * @returns {ValidationProblem[]}
 */
function checkReferences(admxName, admx, admlName, adml) {
    const problems = [];
    const problem = (file, message) => problems.push({ file, message });

    const strings = elements(adml, "string").map(e => e.getAttribute("id"));
    const presentations = new Map(
        elements(adml, "presentation").map(e => [e.getAttribute("id"), e])
    );
    for (const id of duplicates(strings)) {
        problem(admlName, `Duplicate string "${id}".`);
    }
    for (const id of duplicates(elements(adml, "presentation").map(e => e.getAttribute("id")))) {
        problem(admlName, `Duplicate presentation "${id}".`);
    }

    // Every localized string and presentation must exist in the ADML.
    for (const element of elements(admx, "*")) {
        for (const { name, value } of [...element.attributes]) {
            for (const [, type, id] of value.matchAll(/\$\((string|presentation)\.([^)]*)\)/g)) {
                const exists = type == "string" ? strings.includes(id) : presentations.has(id);
                if (!exists) {
                    problem(admxName, `<${element.localName} ${name}="${value}">: the ${type} "${id}" does not exist in ${admlName}.`);
                }
            }
        }
    }

    // References to categories and supportedOn definitions.
    const targetPrefix = elements(admx, "target")[0]?.getAttribute("prefix");
    const usingPrefixes = elements(admx, "using").map(e => e.getAttribute("prefix"));
    const categories = elements(admx, "category").map(e => e.getAttribute("name"));
    const definitions = elements(admx, "definition").map(e => e.getAttribute("name"));
    for (const name of duplicates(categories)) {
        problem(admxName, `Duplicate category "${name}".`);
    }
    for (const name of duplicates(definitions)) {
        problem(admxName, `Duplicate supportedOn definition "${name}".`);
    }
    const checkReference = (kind, ref, defined) => {
        const [prefix, name] = ref.includes(":") ? ref.split(":") : [null, ref];
        if (prefix && prefix != targetPrefix) {
            if (!usingPrefixes.includes(prefix)) {
                problem(admxName, `${kind} "${ref}": the prefix "${prefix}" is not declared by a <using> element.`);
            }
            // References into other ADMX files can not be checked here.
            return;
        }
        if (!defined.includes(name)) {
            problem(admxName, `${kind} "${ref}" does not exist.`);
        }
    };
    for (const element of elements(admx, "parentCategory")) {
        checkReference("parentCategory", element.getAttribute("ref"), categories);
    }
    for (const element of elements(admx, "supportedOn")) {
        if (element.hasAttribute("ref")) {
            checkReference("supportedOn", element.getAttribute("ref"), definitions);
        }
    }

    // Policies and their presentations.
    const policies = elements(admx, "policy");
    for (const name of duplicates(policies.map(e => e.getAttribute("name")))) {
        problem(admxName, `Duplicate policy "${name}".`);
    }
    for (const policy of policies) {
        const name = policy.getAttribute("name");
        const policyElements = new Map(
            children(policy)
                .filter(e => e.localName == "elements")
                .flatMap(children)
                .map(e => [e.getAttribute("id"), e.localName])
        );
        const presentationRef = policy.getAttribute("presentation");
        if (!presentationRef) {
            if (policyElements.size) {
                problem(admxName, `Policy "${name}" has elements, but no presentation.`);
            }
            continue;
        }
        const presentation = presentations.get(presentationRef.match(/^\$\(presentation\.(.*)\)$/)?.[1]);
        if (!presentation) {
            // Reported above.
            continue;
        }
        const controls = children(presentation).filter(e => e.hasAttribute("refId"));
        for (const control of controls) {
            const refId = control.getAttribute("refId");
            const expected = CONTROL_ELEMENT_TYPES[control.localName];
            if (!policyElements.has(refId)) {
                problem(admlName, `<${control.localName} refId="${refId}"> in presentation "${presentation.getAttribute("id")}" matches no element of policy "${name}".`);
            } else if (expected && policyElements.get(refId) != expected) {
                problem(admlName, `<${control.localName} refId="${refId}"> in presentation "${presentation.getAttribute("id")}" refers to a <${policyElements.get(refId)}> element of policy "${name}", expected <${expected}>.`);
            }
        }
        for (const id of policyElements.keys()) {
            if (!controls.some(control => control.getAttribute("refId") == id)) {
                problem(admxName, `Element "${id}" of policy "${name}" has no control in presentation "${presentation.getAttribute("id")}".`);
            }
        }
    }

    // The ADML must have at least the revision required by the ADMX.
    const minRequiredRevision = elements(admx, "resources")[0]?.getAttribute("minRequiredRevision");
    const revision = adml.getAttribute("revision");
    if (minRequiredRevision && revision && compareRevision(revision, minRequiredRevision) < 0) {
        problem(admlName, `The revision ${revision} is lower than the minRequiredRevision ${minRequiredRevision} of ${admxName}.`);
    }

    return problems;
}

/**
 * Validate an ADMX file and its ADML file: both files against the official
 * schemas, and the references between them.
 *
 * @param {Object} files
 * @param {string} files.admx - Path to the ADMX file.
 * @param {string} files.adml - Path to the ADML file.
 * @returns {Promise<ValidationProblem[]>}
 */
export async function validateAdmx({ admx, adml }) {
    const files = [
        { path: admx, name: pathUtils.basename(admx) },
        { path: adml, name: pathUtils.basename(adml) },
    ];
    const problems = [];
    const roots = [];
    for (const file of files) {
        const contents = await fs.readFile(file.path, "utf8");
        problems.push(...await validateSchema(file.name, contents));
        try {
            roots.push(create(contents).root().node);
        } catch (e) {
            problems.push({ file: file.name, message: `Not well-formed: ${e.message}` });
        }
    }
    if (roots.length == 2) {
        problems.push(...checkReferences(files[0].name, roots[0], files[1].name, roots[1]));
    }
    return problems;
}

/**
 * Format validation problems for the console.
 *
 * @param {ValidationProblem[]} problems
 * @returns {string}
 */
export function formatProblems(problems) {
    return problems
        .map(p => ` - ${p.file}${p.line ? `:${p.line}` : ""}: ${p.message}`)
        .join("\n");
}
