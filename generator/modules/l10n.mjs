/**
 * The prose fields of the policy schema (e.g. "title", "description",
 * "x-help") are English, and may reference Fluent messages and terms of the
 * given Fluent files, written as Fluent writes placeables: "{ policy-Proxy }"
 * for a message, "{ -brand-short-name }" for a term, with one space inside
 * each brace. The references are replaced by their texts. Braces without these
 * spaces (e.g. "{searchTerms}" or "${home}") are plain text.
 */

import { FluentBundle, FluentResource } from "@fluent/bundle";

/**
 * A reference to a Fluent message ("{ policy-Proxy }") or term
 * ("{ -brand-short-name }") in a text of the schema.
 */
export const FLUENT_REFERENCE = /\{ (-?[a-zA-Z][\w-]*) \}/g;

export class SchemaL10n {
    /**
     * @param {{name: string, source: string}[]} files - The Fluent files, e.g.
     *    brand.ftl (for terms like { -brand-short-name }) and
     *    policies-descriptions.ftl.
     * @param {Object} [options]
     * @param {string} [options.locale] - The locale of the files.
     * @param {SchemaL10n} [options.fallback] - Resolves the messages which
     *    the files don't have, or which can't be formatted (e.g. the en-US
     *    texts for a localization).
     */
    constructor(files = [], { locale = "en-US", fallback = null } = {}) {
        this.locale = locale;
        this.fallback = fallback;
        this.bundle = new FluentBundle(locale, { useIsolating: false });
        for (const { name, source } of files) {
            const errors = this.bundle.addResource(new FluentResource(source));
            if (errors.length) {
                throw new Error(`Invalid Fluent file ${name}: ${errors[0].message}`);
            }
        }
    }

    /**
     * Get a prose field of a schema node, with its Fluent references replaced
     * by their texts.
     *
     * @param {Object} node - The schema node.
     * @param {string} field - The field, e.g. "description".
     * @param {string} where - The setting, for error messages.
     * @returns {string|undefined}
     */
    get(node, field, where) {
        const idField = `${field.startsWith("x-") ? field : `x-${field}`}-l10n-id`;
        if (node?.[idField] !== undefined) {
            throw new Error(`${where} has ${idField}, write "{ ${node[idField]} }" in its ${field} instead.`);
        }
        const text = node?.[field];
        return typeof text == "string" ? this.resolve(text, `${field} of ${where}`) : text;
    }

    /**
     * Replace the Fluent references of a text by their texts.
     *
     * @param {string} text
     * @param {string} where - The text, for error messages.
     * @returns {string}
     */
    resolve(text, where) {
        return text.replace(FLUENT_REFERENCE, (_, id) => this.reference(id, where));
    }

    /**
     * Get the text of a Fluent message ("policy-Proxy") or term
     * ("-brand-short-name"). A term is formatted through a message of its
     * own, as Fluent only formats messages.
     *
     * @param {string} id
     * @param {string} where - The text, for error messages.
     * @returns {string}
     */
    reference(id, where) {
        let message = this.bundle.getMessage(id);
        if (id.startsWith("-")) {
            const termId = `generator-term${id}`;
            if (!this.bundle.hasMessage(termId)) {
                this.bundle.addResource(new FluentResource(`${termId} = { ${id} }\n`));
            }
            message = this.bundle.getMessage(termId);
        }
        if (this.fallback && !message?.value) {
            return this.fallback.reference(id, where);
        }
        if (!message) {
            throw new Error(`The Fluent message ${id} of the ${where} does not exist.`);
        }
        if (!message.value) {
            throw new Error(`The Fluent message ${id} of the ${where} has no value.`);
        }
        const errors = [];
        const text = this.bundle.formatPattern(message.value, null, errors);
        if (errors.length && this.fallback) {
            return this.fallback.reference(id, where);
        }
        if (errors.length) {
            throw new Error(`The Fluent ${id.startsWith("-") ? "term" : "message"} ${id} of the ${where} can not be formatted: ${errors[0].message}`);
        }
        return text;
    }

    /**
     * Get a Fluent term, e.g. "brand-short-name" for { -brand-short-name }
     * of brand.ftl.
     *
     * @param {string} name
     * @returns {string}
     */
    term(name) {
        return this.reference(`-${name}`, "generator");
    }
}
