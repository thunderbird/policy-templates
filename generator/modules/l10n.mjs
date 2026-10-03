/**
 * The prose fields of the policy schema (e.g. "title", "description",
 * "x-help") are either plain English, or a pointer to a Fluent message: the
 * field "x-<field>-l10n-id" (for "x-help": "x-help-l10n-id") holds the ID of
 * the message, which is resolved with the given Fluent files. IDs are always
 * explicit, nothing is derived from the names of the settings.
 */

import { FluentBundle, FluentResource } from "@fluent/bundle";

/**
 * Get the name of the field which points to a Fluent message, e.g.
 * "x-description-l10n-id" for "description" and "x-help-l10n-id" for "x-help".
 *
 * @param {string} field
 * @returns {string}
 */
export function getL10nIdField(field) {
    return `${field.startsWith("x-") ? field : `x-${field}`}-l10n-id`;
}

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
     * Get a prose field of a schema node, as plain English or resolved from
     * its Fluent message.
     *
     * @param {Object} node - The schema node.
     * @param {string} field - The field, e.g. "description".
     * @param {string} where - The setting, for error messages.
     * @returns {string|undefined}
     */
    get(node, field, where) {
        const idField = getL10nIdField(field);
        const plain = node?.[field];
        const id = node?.[idField];
        if (plain !== undefined && id !== undefined) {
            throw new Error(`${where} has both ${field} and ${idField} in the policy schema.`);
        }
        if (id === undefined) {
            return plain;
        }
        const message = this.bundle.getMessage(id);
        if (this.fallback && !message?.value) {
            return this.fallback.get(node, field, where);
        }
        if (!message) {
            throw new Error(`The Fluent message ${id} of ${idField} of ${where} does not exist.`);
        }
        if (!message.value) {
            throw new Error(`The Fluent message ${id} of ${idField} of ${where} has no value.`);
        }
        const errors = [];
        const text = this.bundle.formatPattern(message.value, null, errors);
        if (errors.length && this.fallback) {
            return this.fallback.get(node, field, where);
        }
        if (errors.length) {
            throw new Error(`The Fluent message ${id} of ${where} can not be formatted: ${errors[0].message}`);
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
        const id = `generator-term-${name}`;
        if (!this.bundle.hasMessage(id)) {
            this.bundle.addResource(new FluentResource(`${id} = { -${name} }\n`));
        }
        const errors = [];
        const text = this.bundle.formatPattern(this.bundle.getMessage(id).value, null, errors);
        if (errors.length) {
            throw new Error(`The Fluent term -${name} can not be formatted: ${errors[0].message}`);
        }
        return text;
    }
}
