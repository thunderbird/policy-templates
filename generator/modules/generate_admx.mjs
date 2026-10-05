import { create } from 'xmlbuilder2';
import fs from "node:fs/promises";

import { OPEN_NAME } from "./compatibility.mjs";
import { getPolicyDocsUrl } from "./docs_links.mjs";
import { markdownToText } from "./markdown_to_text.mjs";
import { writeOutput } from "./branches.mjs";
import {
    ADMX_JSON_BOX_HEIGHT, ADMX_TITLE_LABELS, MOZILLA_ADML_PATH, MOZILLA_ADMX_PATH, MOZILLA_POLICY_TEMPLATES_BRANCH,
} from "./constants.mjs";
import {
    getKindLabel, getPolicyData, getSchemaOptions, getSchemaSettings, getSettingTree, hasFormat,
    withoutTrailingPeriod,
} from "./schema_settings.mjs";
import { ensureDir } from "./tools.mjs";
import { formatProblems, validateAdmx } from "./validate_admx.mjs";
import pathUtils from "node:path";

// The maximum length of a JSON value, in a multi-line box or on one line (the
// same as in Mozilla's Firefox template).
const JSON_TEXT_MAX_LENGTH = 16384;

/**
 * Get the explain text of an ADMX policy for the ADML: its help text as plain
 * text (after a note, if it is deprecated), and optionally a link to the
 * documentation of the policy.
 *
 * @param {string} name - The name of the policy, e.g. "ExtensionSettings".
 * @param {Object} texts
 * @param {string} [texts.help] - The help text (Markdown).
 * @param {boolean} [texts.deprecated]
 * @param {boolean} [texts.expandEnvVars] - Whether Windows expands environment
 *    variables in the value ("x-expand-env-vars").
 * @param {Object} [texts.fields] - The node of a JSON value, of a list of
 *    JSON values, or of a list or an object entered as one JSON value, in the
 *    tree of the policy (see getSettingTree()), whose fields are listed.
 * @param {boolean} [texts.link] - Whether to link to the documentation.
 * @param {string} branchDocsUrl - The URL of the documentation of the branch,
 *    see getPolicyDocsUrl().
 * @returns {string}
 */
export function getExplainText(name, { help, deprecated, expandEnvVars, fields, link }, branchDocsUrl) {
    let text = (deprecated ? "Deprecated.\n\n" : "") + markdownToText(help ?? "");
    // Windows expands environment variables in REG_EXPAND_SZ values.
    if (expandEnvVars) {
        text = `${text.trimEnd()}\n\nEnvironment variables like %USERPROFILE% are expanded.\n`;
    }
    // A JSON value is entered as text, so its fields are listed. A list of
    // JSON values has one value per line, a list entered as one JSON value
    // (see isJsonList()) holds all entries.
    if (fields?.jsonEntries) {
        text = `${text.trimEnd()}\n\nEach line of the list is one entry, as JSON.\n`;
    } else if (fields?.jsonList) {
        text = `${text.trimEnd()}\n\nThe whole list is one value, as JSON.\n`;
    }
    const fieldLines = fields ? getFieldLines(fields, "") : [];
    if (fieldLines.length) {
        text = `${text.trimEnd()}\n\n${fieldLines.join("\n")}\n`;
    }
    return link
        ? `${text.trimEnd()}\n\nFor more information visit: ${getPolicyDocsUrl(name, branchDocsUrl)}\n`
        : text;
}

/**
 * List the choices and the fields of a JSON value as plain text, one line per
 * choice or field ("name: description"), indented by their depth.
 *
 * @param {Object} node - A node of the tree of the policy, see getSettingTree().
 * @param {string} indent
 * @returns {string[]}
 */
function getFieldLines(node, indent) {
    const line = (name, description) => {
        const text = description ? markdownToText(description).trim().replaceAll("\n", " ") : "";
        return `${indent}${name}${text ? `: ${text}` : ""}`;
    };
    return [
        ...(node.choices?.some(choice => choice.description) ? node.choices : [])
            .map(choice => line(String(choice.value), choice.description)),
        ...node.children.flatMap(child => [
            line(child.name, child.description),
            ...getFieldLines(child, `${indent}  `),
        ]),
    ];
}

/**
 * Get the label of an ADMX control: the title of its setting (without a
 * trailing period) if ADMX_TITLE_LABELS says so for its kind, else the name of
 * the setting.
 *
 * @param {Map<string, Object>} settingTexts - The texts by path, see
 *    getSchemaSettings().
 * @param {string[]} path - The setting path of the control.
 * @param {"list"|"group"|"single"} kind
 * @param {string} [name] - The name of the setting, by default the last part
 *    of the path.
 * @returns {string}
 */
function getControlLabel(settingTexts, path, kind, name = path.at(-1)) {
    const title = ADMX_TITLE_LABELS[kind] ? settingTexts.get(path.join("/"))?.title : null;
    return title?.replace(/\.$/, "") ?? name;
}

/**
 * Get the folders (categories) of an ADMX policy: one for each setting above
 * it in its setting path, so the ADMX policies of a policy's settings sit in
 * the folder of the policy (Proxy_Mode in Proxy), nested for deeper settings
 * (Permissions_Camera_Allow in Permissions › Permissions_Camera). The slots of
 * a list of objects also sit in a folder of the list. A policy with a single
 * ADMX policy, and each form of it, sits in the root. The folders only depend
 * on the shape of the schema, so they only change when the shape of a policy
 * changes: their ids are part of the OMA-URIs of the policies (Intune).
 *
 * @param {string[]} path - The setting path of the ADMX policy.
 * @param {boolean} [slot] - Whether the ADMX policy is a slot of a list.
 * @returns {string[][]} the setting paths of the folders, from the top
 */
function getFolders(path, slot = false) {
    const settings = path.filter(part => !/^\d+$/.test(part));
    const depth = slot ? settings.length : settings.length - 1;
    return Array.from({ length: depth }, (_, i) => settings.slice(0, i + 1));
}

function getTemplateRevision(template) {
    let v = template.version.split(".");
    let major = v[0];
    let minor = Number(v[1]);
    // Versions like 157.0 have no patch number.
    let patch = Number(v[2] ?? 0);
    let rv;

    // ADMX specs allow xxxx.xxxxx for the revision field.
    if (isNaN(minor)) {
        rv = `${major}.0000`
    } else {
        // Simple left fill with zeros.
        let m = `${minor + 100}`.slice(-2);
        let p = `${patch + 100}`.slice(-2);
        rv = `${major}.${m}${p}`;
    }
    return rv;
}

function isBooleanLikeEntry(entry) {
    if (entry.type != "REG_DWORD") {
        return false
    }
    const values = entry.value.split('|').map(v => v.trim());
    // Check if values are just 0 and 1 (in decimal or hex).
    return values.length === 2 &&
        values.some(v => parseInt(v, 0) === 0) &&
        values.some(v => parseInt(v, 0) === 1);
}

/**
 * Returns a new array containing elements from the start of the given array
 * up to (but not including) the first element that can be coerced to a number.
 *
 * If no numeric element is found, returns a shallow copy of the entire array.
 *
 * @param {Array<string>} array - The array of strings to process.
 * @returns {Array<string>} A new array truncated before the first numeric
 *    element.
 */
function cutArrayBeforeFirstNumericElement(array) {
    const index = array.findIndex(e => !isNaN(Number(e)));
    return index >= 0 ? array.slice(0, index) : [...array];
}

class ADM_BUILDER {
    constructor() {
        this.SUPPORTED = new Map();
        // The categories by ID: their name and the ID of their parent.
        this.CATEGORIES = new Map();
        this.STRINGS = new Map();
        this.PRESENTATIONS = new Map();
    }

    handleGroupEntry(
        policyData,
        groupId,
        groupBaseKey,
        entries,
        supportedPolicies,
        supportedPoliciesId = groupId,
    ) {
        const policyAttrs = {
            name: `${groupId}`,
            class: 'Both',
            displayName: this.getStringId(`${groupId}`, policyData.toc),
            explainText: this.getStringId(`${groupId}_Explain`, policyData.content),
            key: groupBaseKey,
            presentation: `$(presentation.${groupId})`
        }
        this.addPresentation(`${groupId}`, "group", entries);
        const policyFragment = create().ele('policy', policyAttrs);

        this.handleCategoryEntry({
            category: entries[0].category,
            rootElement: policyFragment
        })
        if (!this.handleSupportEntry({
            supportedPolicies,
            id: supportedPoliciesId,
            rootElement: policyFragment
        })) {
            // Unsupported, skip.
            return null;
        };

        const elements = policyFragment.ele('elements');
        for (const entry of entries) {
            const keyParts = entry.key.split("\\");
            const valueName = keyParts.at(-1);
            this.handleValueEntry({
                rootElement: elements,
                entry,
                valueName,
                id: `${groupId}_${valueName}`,
            })
        }
        return policyFragment;
    }

    /**
     * Get the name and explain text of an ADMX policy from the texts of its
     * setting in the schema: the name is its "title", else its raw name. The
     * explain text is its "description" followed by its "x-help"; a setting
     * with neither takes both from the nearest setting above it with texts, up
     * to the policy. It always links to the documentation of the policy.
     *
     * @param {Object} context
     * @param {Map<string, Object>} context.settingTexts - The texts by path.
     * @param {Object} context.settingTree - The tree of the policy, see
     *    getSettingTree(), for the fields of JSON values.
     * @param {string} context.docsUrl - The URL of the documentation of the
     *    branch.
     * @param {string} policyName - The name of the policy.
     * @param {Object} policyData - The deprecation of the policy.
     * @param {string[]} path - The setting path of the ADMX policy.
     * @param {Object} [options]
     * @param {boolean} [options.openName] - The ADMX policy is a list of
     *    names and values of the settings with open names below path.
     * @param {number} [options.slot] - The number of a slot of a structured list.
     * @param {Object[]} [options.controls] - The controls of the ADMX policy,
     *    whose descriptions are added to the explain text.
     * @param {Object} [options.form] - The form of the setting, if it has
     *    several (see getForms()): a form with a name suffix gets its kind in
     *    the name, and the description of its alternative in the help.
     * @returns {{toc: string, content: string}}
     */
    getPolicyTexts(context, policyName, policyData, path, { openName = false, slot = null, controls = [], form = null } = {}) {
        const lookup = key => context.settingTexts.get(key);
        const key = path.join("/");
        // A list of open names stands for the open name if it has a title
        // (e.g. the older form of SecurityDevices), else for the setting which
        // holds the names.
        const openTexts = openName ? lookup(`${key}/${OPEN_NAME}`) : null;
        const setting = (openTexts?.title ? openTexts : null) || lookup(key);

        // The name: the title, else the raw name of the policy, or the path of
        // the setting (no category shows the policy of a setting).
        let title = withoutTrailingPeriod(setting?.title ?? path.join(" › "));
        if (slot) {
            title = `${title} (${slot})`;
        }
        if (form?.suffix) {
            title = `${title} (${getKindLabel(form.kind)})`;
        }
        const deprecated = !!(setting?.deprecated || policyData.deprecated || form?.deprecated);
        if (deprecated) {
            title = `${title} (deprecated)`;
        }

        // The help: the description and the x-help of the setting. A setting
        // without any text takes both from the nearest setting above it which
        // has texts, up to the policy.
        let help = null;
        for (let i = path.length; i > 0 && !help; i--) {
            const texts = i == path.length ? setting : lookup(path.slice(0, i).join("/"));
            const paragraphs = [texts?.description, texts?.help].filter(Boolean).map(text => text.trim());
            help = paragraphs.length ? paragraphs.join("\n\n") : null;
        }
        if (form?.description) {
            help = [help, form.description.trim()].filter(Boolean).join("\n\n");
        }

        // The help text, and a link to the documentation of the policy.
        // The node of the setting in the tree of the policy, to list the
        // fields of a JSON value.
        let treeNode = context.settingTree;
        for (const name of [...path.slice(1), ...(openName ? [OPEN_NAME] : [])]) {
            treeNode = treeNode?.children.find(child => child.name == name);
        }
        let content = getExplainText(policyName, {
            help: help ?? "",
            deprecated,
            expandEnvVars: !!setting?.expandEnvVars || controls.some(control => control.type == "REG_EXPAND_SZ"),
            fields: treeNode?.json || treeNode?.jsonEntries || treeNode?.jsonList || treeNode?.jsonObject ? treeNode : undefined,
            link: true,
        }, context.docsUrl);
        const controlTexts = controls
            .filter(control => control.description)
            .map(control => `${control.label}: ${markdownToText(control.description).trim()}`);
        if (controlTexts.length) {
            content = `${content.trimEnd()}\n\n${controlTexts.join("\n\n")}\n`;
        }
        return { toc: title, content };
    }

    /**
     * Add the label and description of each control of a group: see
     * getControlLabel(), and the description of its setting.
     */
    withControlTexts(settingTexts, path, entries) {
        return entries.map(entry => {
            const settingPath = entry.normalizedKeyParts.filter(part => isNaN(Number(part)));
            return {
                ...entry,
                label: getControlLabel(settingTexts, settingPath, "group", entry.key.split("\\").at(-1)),
                description: settingTexts.get(settingPath.join("/"))?.description,
            };
        });
    }

    handleSingleEntry(policyTexts, singleId, entry, supportedPolicies, supportedPoliciesId = singleId) {
        const keyParts = entry.key.split("\\");
        const valueName = keyParts.pop();

        const isBooleanLike = isBooleanLikeEntry(entry);
        const policyAttrs = {
            name: `${singleId}`,
            class: 'Both',
            displayName: this.getStringId(`${singleId}`, policyTexts.toc),
            explainText: this.getStringId(`${singleId}_Explain`, policyTexts.content),
            key: keyParts.join("\\"),
            ...(!isBooleanLike && { presentation: `$(presentation.${singleId})` }),
            // Only an on/off policy writes its value itself (enabledValue and
            // disabledValue). A control writes it with its element, and a
            // valueName of the policy would write a second value to it.
            ...(isBooleanLike && { valueName }),
        };
        if (!isBooleanLike) {
            this.addPresentation(`${singleId}`, "single", entry);
        }
        const policyFragment = create().ele('policy', policyAttrs);

        this.handleCategoryEntry({
            category: entry.category,
            rootElement: policyFragment
        })
        if (!this.handleSupportEntry({
            supportedPolicies,
            id: supportedPoliciesId,
            rootElement: policyFragment
        })) {
            // Unsupported, skip.
            return null;
        };

        this.handleValueEntry({
            entry,
            valueName,
            id: singleId,
            rootElement: policyFragment,
        })
        return policyFragment;
    }

    handleListEntry(
        policyData,
        listId,
        listBaseKey,
        entry,
        supportedPolicies,
        supportedPoliciesId = listId,
        { explicitValue = false } = {}
    ) {
        const policyAttrs = {
            name: `${listId}`,
            class: 'Both',
            displayName: this.getStringId(`${listId}`, policyData.toc),
            explainText: this.getStringId(`${listId}_Explain`,  policyData.content),
            presentation: `$(presentation.${listId})`,
            key: listBaseKey,
        }
        this.addPresentation(`${listId}`, "list", entry);

        const policyFragment = create().ele('policy', policyAttrs);

        this.handleCategoryEntry({
            category: entry.category,
            rootElement: policyFragment
        })
        if (!this.handleSupportEntry({
            supportedPolicies,
            id: supportedPoliciesId,
            rootElement: policyFragment
        })) {
            // Unsupported, skip.
            return null;
        };

        const elements = policyFragment.ele('elements');
        // With explicitValue, the name of each registry value is entered
        // together with its value, instead of being numbered.
        const listAttrs = {
            id: `${listId}_List`,
            key: listBaseKey,
            ...(explicitValue ? { explicitValue: true } : { valuePrefix: '' }),
            ...(entry.required && { required: true }),
            ...(entry.type === 'REG_EXPAND_SZ' && { expandable: true }),
        };
        elements.ele('list', listAttrs);
        return policyFragment
    }

    handlePresentationEntry({ rootElement, id, entry, mode }) {
        // The label of a control, see getControlLabel().
        const label = entry.label ?? entry.key.split("\\").at(-1);
        // The values of several forms in one dropdown.
        if (entry.items) {
            rootElement.ele('dropdownList', { refId: `${id}_Enum` }).txt(label);
            return;
        }
        switch (entry.type) {
            case "REG_DWORD": {
                if (isBooleanLikeEntry(entry)) {
                    rootElement.ele('checkBox', { refId: `${id}_Bool` }).txt(label);
                } else if (entry.number) {
                    rootElement.ele('decimalTextBox', { refId: `${id}_Number` }).txt(label);
                } else {
                    rootElement.ele('dropdownList', { refId: `${id}_Enum` }).txt(label);
                }
                break;
            }
            case "REG_SZ":
            case "REG_EXPAND_SZ": {
                const enums = entry.value.split("|").map(e => e.trim()).filter(Boolean);
                if (enums.length <= 1) {
                    rootElement
                        .ele('textBox', { refId: `${id}_Input` })
                        .ele('label').txt(label);
                } else {
                    rootElement.ele('dropdownList', { refId: `${id}_Enum` }).txt(label);
                }
                break;
            }
            case "REG_MULTI_SZ": {
                // A multiTextBox has no label of its own, so the label is a
                // line of text above it.
                rootElement.ele('text').txt(label);
                rootElement.ele('multiTextBox', { refId: `${id}_Input`, defaultHeight: ADMX_JSON_BOX_HEIGHT });
                break;
            }
            default:
                console.warn(`Unsupported type ${entry.type} in presentation mode ${mode}`);
        }
    }

    addPresentation(id, mode, data) {
        const presentationFragment = create().ele('presentation', { id })
        switch (mode) {
            case "single": {
                this.handlePresentationEntry({
                    rootElement: presentationFragment,
                    entry: data,
                    id,
                    mode
                })
                break;
            }
            case "list": {
                // List item must be REG_SZ or REG_EXPAND_SZ, we could check here...
                const listBox = presentationFragment.ele('listBox', { refId: `${id}_List` });
                if (data.label) {
                    listBox.txt(data.label);
                }
                break;
            }
            case "group": {
                for (let entry of data) {
                    const keyParts = entry.key.split("\\");
                    const valueName = keyParts.at(-1);
                    this.handlePresentationEntry({
                        rootElement: presentationFragment,
                        entry,
                        id: `${id}_${valueName}`,
                        mode
                    })
                }
                break;
            }
            default:
                console.warn(`Unsupported presentation mode: ${mode}`);
                return;
        }
        this.PRESENTATIONS.set(id, presentationFragment);
    }

    getStringId(id, value) {
        // String IDs may only contain letters, digits and underscores, but
        // are also built from values like "from-visited".
        const saveId = id.replace(/[^\p{L}\p{N}_]/gu, "_");
        this.STRINGS.set(saveId, value);
        return `$(string.${saveId})`;
    }

    /**
     * Extends the provided GPO entries by adding a `normalizedKeyParts` property,
     * derived from the `key` field by removing the product's registry key
     * (e.g. `Software\Policies\Mozilla\Thunderbird`) and splitting the
     * remaining path into segments.
     *
     * @param {Array<Object>} gpoEntries - An array of GPO entry objects, each
     *    containing a registry key.
     * @returns {Array<Object>} A new array of GPO entries with an added
     *    `normalizedKeyParts` array representing the relative key path.
     */
    normalizedGpoKeys(gpoEntries) {
        return gpoEntries.map(e => ({
            normalizedKeyParts: this.getRelativeKeyParts(e.key),
            ...e
        }));
    }

    /**
     * Get the parts of a registry key below the product's registry key.
     *
     * @param {string} key - e.g. "Software\\Policies\\Mozilla\\Thunderbird\\Cookies\\Behavior"
     * @returns {string[]} e.g. ["Cookies", "Behavior"]
     */
    getRelativeKeyParts(key) {
        if (!key.startsWith(`${this.registryKey}\\`)) {
            throw new Error(`The registry key ${key} is not below ${this.registryKey}.`);
        }
        return key.slice(this.registryKey.length + 1).split("\\");
    }

    /**
     * Determines the common base registry key from a collection of GPO paths by
     * computing their longest shared prefix. The calculated prefix is truncated at
     * the first numeric segment to avoid including indexed list items.
     * 
     * @param {string[]} keys - An array of full registry key strings.
     * @returns {string} The common base registry key path.
     */
    findBaseKey(keys) {
        const splitKeys = keys.map(e => e.split('\\').slice(0, -1));
        if (splitKeys.length === 0) return '';
        const baseParts = splitKeys.reduce((common, parts) => {
            let i = 0;
            while (i < common.length && i < parts.length && common[i] === parts[i]) {
                i++;
            }
            return common.slice(0, i);
        });

        return cutArrayBeforeFirstNumericElement(baseParts).join('\\');
    }

    /**
     * Groups GPO entries into lists, groups and single entries, based on the
     * structure of their registry key paths.
     * 
     * examples for list entries (below the product's registry key):
     * - InstallAddonsPermission\Allow\1
     * - InstallAddonsPermission\Allow\2
     * 
     * examples for structured list entries:
     * - SearchEngines\Add\1\Name
     * - SearchEngines\Add\1\Method
     * - SearchEngines\Add\1\IconURL
     * - SearchEngines\Add\1\Alias
     * - SearchEngines\Add\1\Description
     * 
     * examples for group entries:
     * - Authentication\AllowNonFQDN\SPNEGO
     * - Authentication\AllowNonFQDN\NTLM
     *
     * examples for single entries (one level less then groups):
     * - AppUpdateURL
     * - Certificates\ImportEnterpriseRoots
     *
     * @param {Array<Object>} gpoEntries - The list of raw GPO configuration entries.
     * @returns {Object} An object containing:
     *   - {Map<string, Object[]>} lists: list-type entries.
     *   - {Map<string, Object[]>} groups: group-type entries.
     *   - {Object[]} singles: single entries.
     */
    groupByEntriesByKeyType(gpoEntries) {
        const lists = new Map();
        const groups = new Map();
        const singles = [];

        for (const entry of this.normalizedGpoKeys(gpoEntries)) {
            // A list may also be a policy itself, e.g. RequestedLocales\1.
            if (entry.normalizedKeyParts.length <= 2 && !entry.normalizedKeyParts.some(e => !isNaN(Number(e)))) {
                singles.push(entry);
                continue;
            }

            if (entry.normalizedKeyParts.some(e => !isNaN(Number(e)))) {
                // Valid list entries are:
                // * [ 'Certificates', 'Install', '1' ]
                // * [ 'SearchEngines', 'Add', '1', 'Name' ]
                // Group list items by cutting before the list index.
                const listBase = cutArrayBeforeFirstNumericElement(entry.normalizedKeyParts).join("_")
                    + (entry.form?.suffix ?? "");
                if (!lists.has(listBase)) {
                    lists.set(listBase, []);
                }
                // The gpo can specify multiple items as examples, only take one
                // per list.
                entry.uniqueid = entry.normalizedKeyParts.filter(e => isNaN(Number(e))).join("_");
                const list = lists.get(listBase);
                if (list.every(e => e.uniqueid != entry.uniqueid)) {
                    lists.get(listBase).push(entry);
                }
                continue;
            }

            // Assume everything else is a group. Valid group items are:
            // * [ 'Authentication', 'AllowNonFQDN', 'SPNEGO' ]
            // * [ 'Authentication', 'AllowNonFQDN', 'NTLM' ]
            // Group items by removing the last element.
            const groupBase = entry.normalizedKeyParts.slice(0, -1).join("_") + (entry.form?.suffix ?? "");
            if (!groups.has(groupBase)) {
                groups.set(groupBase, []);
            }
            groups.get(groupBase).push(entry);
        }

        return { lists, groups, singles };
    }


    /**
     * Generates ADMX element nodes based on the provided registry value entry.
     *
     * Depending on the registry `type` and the root node (<policy> or something else
     * like <elements> or <items>), this function emits the appropriate ADMX node
     * (e.g., <enabledValue>, <enum>, <text>, <multiText>) with required attributes.
     * 
     * Supported registry types:
     * - REG_DWORD: emits <enabledValue> and <disabledValue> nodes for booleans or
     *      <enum> nodes for discrete values.
     * - REG_SZ / REG_EXPAND_SZ: emits <text> or <enum> nodes depending on how many
     *      values are defined.
     * - REG_MULTI_SZ: emits a <multiText> node.
     *
     * @param {Object} params
     * @param {Object} params.entry - The GPO value definition entry, including key,
     *    type, value, required and category properties.
     * @param {string} params.valueName - The name of the registry value under the
     *    policy key.
     * @param {string} params.id - A unique identifier used to generate ADMX string
     *    and element IDs.
     * @param {Object} params.rootElement - The xmlbuilder2 element to which child
     *    nodes are appended.
     *
     */
    handleValueEntry({ entry, valueName, id, rootElement }) {
        const rootNodeName = rootElement.node.nodeName;
        // The values of several forms in one dropdown, each item with its
        // own registry type.
        if (entry.items) {
            const baseElement = rootNodeName === 'policy'
                ? rootElement.ele('elements')
                : rootElement
            const enumElem = baseElement.ele('enum', { id: `${id}_Enum`, valueName });
            for (const item of entry.items) {
                const value = enumElem
                    .ele('item', { displayName: this.getStringId(`${id}_${item.value}`, item.title) })
                    .ele('value');
                if (item.type == "REG_DWORD") {
                    value.ele('decimal', { value: parseInt(item.value, 0) });
                } else {
                    value.ele('string').txt(item.value);
                }
            }
            return;
        }
        switch (entry.type) {
            case 'REG_DWORD': {
                if (isBooleanLikeEntry(entry)) {
                    switch (rootNodeName) {
                        case 'policy': {
                            rootElement.ele('enabledValue').ele('decimal', { value: '1' });
                            rootElement.ele('disabledValue').ele('decimal', { value: '0' });
                            break;
                        }
                        case 'elements': {
                            // If we are under an <elements> node, we can't use an
                            // <enabledValue> / <disabledValue> node pair, but we
                            // can use a <boolean> node.
                            const boolElem = rootElement
                                .ele('boolean', {
                                    id: `${id}_Bool`,
                                    valueName,
                                });
                            boolElem
                                .ele('trueValue')
                                .ele('decimal', { value: '1' });
                            boolElem
                                .ele('falseValue')
                                .ele('decimal', { value: '0' });
                            break;
                        }
                        default:
                            console.warn(`Unsupported root node: ${rootNodeName}`);
                            break;
                    }
                } else if (entry.number) {
                    // A free number: a number box with the limits of the
                    // schema, else from 0 to the largest positive DWORD (the
                    // default maximum of ADMX, 9999, is too small). A number
                    // box can't hold negative numbers.
                    const baseElement = rootNodeName === 'policy'
                        ? rootElement.ele('elements')
                        : rootElement
                    baseElement.ele('decimal', {
                        id: `${id}_Number`,
                        valueName,
                        minValue: String(Math.max(entry.minimum ?? 0, 0)),
                        maxValue: String(entry.maximum ?? 2147483647),
                    });
                } else {
                    // If the provided root node is a <policy> node, we need to add
                    // an <elements> wrapper node.
                    const baseElement = rootNodeName === 'policy'
                        ? rootElement.ele('elements')
                        : rootElement
                    const enumElem = baseElement
                        .ele('enum', {
                            id: `${id}_Enum`,
                            valueName
                        });
                    const values = entry.value.split('|').map(v => v.trim());
                    for (const val of values) {
                        const intVal = parseInt(val, 0); // Autodetect 0x1 or 0.
                        // The title of the choice in the schema, else its value.
                        const label = entry.choiceTitles?.[val] ?? String(intVal);
                        enumElem
                            .ele('item', { displayName: this.getStringId(`${id}_${intVal}`, label) })
                            .ele('value')
                            .ele('decimal', { value: intVal })
                    }
                }
                break;
            }
            case 'REG_SZ':
            case 'REG_EXPAND_SZ': {
                // If the provided root node is a <policy> node, we need to add an
                // <elements> wrapper node.
                const baseElement = rootNodeName === 'policy'
                    ? rootElement.ele('elements')
                    : rootElement
                const enums = entry.value.split("|").map(e => e.trim()).filter(Boolean);
                if (enums.length <= 1) {
                    const textAttrs = {
                        // The id is also used to reference implicit labels created
                        // for the node. Since the string table is global, we should
                        // use a unique id here. If we however want to re-use strings,
                        // we should use a generic id here. 
                        id: `${id}_Input`,
                        valueName,
                        ...(entry.type === 'REG_EXPAND_SZ' && { expandable: true }),
                        ...(entry.required && { required: true }),
                        ...(entry.maxLength && { maxLength: String(entry.maxLength) }),
                    };
                    baseElement.ele('text', textAttrs);
                } else {
                    const enumElem = baseElement.ele('enum', {
                        id: `${id}_Enum`,
                        valueName
                    });

                    for (const val of enums) {
                        // The title of the choice in the schema, else its value.
                        const label = entry.choiceTitles?.[val] ?? val;
                        enumElem
                            .ele('item', { displayName: this.getStringId(`${id}_${val}`, label) })
                            .ele('value')
                            .ele('string').txt(val);
                    }
                }
                break;
            }
            case 'REG_MULTI_SZ': {
                // If the provided root node is a <policy> node, we need to add an
                // <elements> wrapper node.
                const baseElement = rootNodeName === 'policy'
                    ? rootElement.ele('elements')
                    : rootElement
                const multiTextAttrs = {
                    id: `${id}_Input`,
                    valueName,
                    maxLength: String(JSON_TEXT_MAX_LENGTH),
                };
                baseElement
                    .ele('multiText', multiTextAttrs);
                break;
            }
            default:
                console.warn(`Unsupported entry type: ${entry.type}`);
                break;
        }
    }

    /**
     * Attaches a <supportedOn> reference to the given rootElement based on the
     * policy's compatibility metadata.
     *
     * This function ensures that each unique "supported" range is tracked only once
     * using the SUPPORTED map. If a new supported range is encountered, it is added
     * to the map with an index for reference in the final ADMX output.
     *
     * @param {Object} params
     * @param {Array<Object>} params.supportedPolicies - List of policy support
     *    definitions with shape: { 
     *      key: string,
     *      first: string,
     *      last: string,
     *      policies: string[]
     *    }
     * @param {string} params.id - The current policy ID to match in supportedPolicies.
     * @param {Object} params.rootElement - The xmlbuilder2 node (usually <policy>)
     *    to append the <supportedOn> to.
     * @returns {boolean} True if a supportedOn reference was added, false if the
     *    policy had no compat data.
     */
    handleSupportEntry({ supportedPolicies, id, rootElement }) {
        const supported = supportedPolicies.find(e => e.policies.includes(id));
        if (supported) {
            let entry = this.SUPPORTED.get(supported.key);
            if (!entry) {
                entry = {
                    idx: this.SUPPORTED.size,
                    key: supported.key,
                    first: supported.first,
                    last: supported.last,
                };
                this.SUPPORTED.set(supported.key, entry);
            }
            rootElement.ele('supportedOn', { ref: `SUPPORTED_ID_${entry.idx}` });
            return true;
        }
        console.warn(`Missing compat data for ${id}`);
        return false;
    }

    /**
     * Place an ADMX policy in its innermost folder, and add its folders to the
     * categories table.
     *
     * @param {Object} params
     * @param {Array<{id: string, name: string}>} params.category - The folders
     *    of the ADMX policy, from the top (see getFolders()), empty for the
     *    root.
     * @param {Object} params.rootElement - The policy element.
     */
    handleCategoryEntry({ category, rootElement }) {
        let parent = this.rootCategory;
        for (const { id, name } of category) {
            if (!this.CATEGORIES.has(id)) {
                this.CATEGORIES.set(id, { name, parent });
            }
            parent = id;
        }
        rootElement.ele('parentCategory', { ref: parent });
    }

    /**
     * Generates the ADML file: its string table and its presentation table,
     * from the strings and presentations collected by generateAdmx().
     *
     * @param {AdmxTemplate} template - For the revision.
     * @returns {string} - The formatted XML string of the ADML content.
     */
    generateAdml(template) {
        const attributes = {
            revision: getTemplateRevision(template),
            schemaVersion: "1.0",
            xmlns: 'http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions',
        };

        const resources = create({ version: '1.0', encoding: 'utf-8' })
            .ele('policyDefinitionResources', attributes)
            .ele('displayName').up()
            .ele('description').up()
            .ele('resources');

        const stringTable = resources.ele('stringTable');
        for (const [id, value] of this.STRINGS.entries()) {
            stringTable.ele('string', { id }).txt(value.replaceAll("&nbsp;"," ")).up();
        }

        const presentationTable = resources.ele('presentationTable');
        for (const node of this.PRESENTATIONS.values()) {
            presentationTable.import(node);
        }
        return resources.end({ prettyPrint: true });
    }

    /**
     * Generate the ADMX template from the policy schema.
     *
     * @param {AdmxTemplate} template - See generateAdmxTemplates().
     * @param {Object[]} supportedPolicies - The compatibility information.
     * @param {Object} schema - The policy schema of the branch, see
     *    loadBranch().
     * @param {SchemaL10n} l10n - Resolves the texts given as Fluent messages.
     * @returns {string}
     */
    generateAdmx(template, supportedPolicies, schema, l10n) {
        this.registryKey = template.registryKey;
        this.rootCategory = template.admx.prefix;
        const namespace = {
            revision: getTemplateRevision(template),
            schemaVersion: "1.0",
            xmlns: 'http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions',
        };

        const rootNode = create({ version: '1.0', encoding: 'utf-8' })
            .ele('policyDefinitions', namespace)
            .ele('policyNamespaces')
            .ele('target', { prefix: template.admx.prefix, namespace: template.admx.namespace }).up()
            // Mozilla's mozilla.admx, which defines the "Mozilla" category.
            .ele('using', { prefix: 'Mozilla', namespace: 'Mozilla.Policies' }).up()
            .up()
            .ele('resources', { minRequiredRevision: getTemplateRevision(template) })
            .up()

        const policyNodes = [];
        // The ADMX template is built from the policy schema: every policy of
        // the branch with all its settings, and the texts of the settings.
        // Policies without the format "gpo" (see "x-formats") are left out.
        const policyNames = Object.keys(schema.properties ?? {})
            .filter(policyName => hasFormat(getPolicyData(schema, policyName), "gpo"))
            .sort((a, b) => a.localeCompare(b));

        // All ADMX policies are collected first, to check that their names
        // are unique before any is created.
        const planned = [];
        const schemaOptions = getSchemaOptions(template.version);
        for (const policyName of policyNames) {
            const plannedBefore = planned.length;
            const { entries, texts: settingTexts } = getSchemaSettings(schema, policyName, l10n, schemaOptions);
            // The names of the policy and of its settings become the names of
            // its ADMX policies, which allow letters, digits and "_" only.
            // (The keys also hold the index of a list entry, and a
            // placeholder for open names, which are entered as values.)
            for (const { key } of entries) {
                const parts = key.split("\\");
                if (parts.some(part => !/^[A-Za-z0-9_]+$/.test(part))) {
                    throw new Error(`The setting ${parts.join(".")} can't be part of an ADMX policy name: only letters, digits and "_" are possible.`);
                }
            }
            const gpoEntries = entries.map(entry => ({ ...entry, key: `${template.registryKey}\\${entry.key}` }));
            const settingTree = getSettingTree(schema, policyName, l10n, schemaOptions);
            const root = settingTexts.get(policyName);
            const policyData = {
                deprecated: root?.deprecated,
            };
            const texts = (path, options) => this.getPolicyTexts(
                { settingTexts, settingTree, docsUrl: template.docsUrl }, policyName, policyData, path, options
            );
            // The folders of an ADMX policy (see getFolders()), each named by
            // the title of its setting (which may come from Fluent, see
            // SchemaL10n), else by the name of the setting.
            const folders = (path, slot = false) => getFolders(path, slot).map(settingPath => ({
                id: settingPath.join("_"),
                name: withoutTrailingPeriod(settingTexts.get(settingPath.join("/"))?.title ?? settingPath.at(-1)),
            }));

            const { lists, groups, singles } = this.groupByEntriesByKeyType(
                gpoEntries.filter(e => !e.explicitName)
            );

            // 0. Handle values with open names (e.g. the device names in
            // SecurityDevices\Add): one list of names and values per key.
            const explicitLists = Map.groupBy(
                gpoEntries.filter(e => e.explicitName),
                e => e.key.split("\\").slice(0, -1).join("\\")
            );
            for (const [listBaseKey, entries] of explicitLists) {
                const path = this.getRelativeKeyParts(listBaseKey);
                const listId = path.join("_");
                // JSON values (REG_MULTI_SZ) are entered as REG_SZ, which is
                // accepted as well.
                const entry = { ...(entries.find(e => e.type == "REG_EXPAND_SZ") ?? entries[0]), label: getControlLabel(settingTexts, path, "list") };
                planned.push({
                    name: listId,
                    type: "list",
                    types: entries.map(e => e.type),
                    path,
                    folders: folders(path),
                    create: category => this.handleListEntry(
                        texts(path, { openName: true }),
                        listId,
                        listBaseKey,
                        { ...entry, category },
                        supportedPolicies,
                        `${listId}_[name]`,
                        { explicitValue: true }
                    ),
                });
            }

            // The name of an ADMX policy without the suffix of its form (see
            // getForms()), for its compatibility.
            const withoutSuffix = (name, form) => form?.suffix ? name.slice(0, -form.suffix.length) : name;

            // 1. Handle lists.
            for (const [listId, entries] of lists) {
                const listBaseKey = this.findBaseKey(entries.map(e => e.key));
                const path = this.getRelativeKeyParts(listBaseKey);
                const form = entries[0].form;
                if (entries.length === 1) {
                    // Simple REG_SZ/REG_EXPAND_SZ List, or a list of JSON
                    // values (REG_MULTI_SZ), entered as one JSON value per
                    // line.
                    const label = getControlLabel(settingTexts, path, "list");
                    const json = entries[0].type == "REG_MULTI_SZ";
                    planned.push({
                        name: listId,
                        type: "list",
                        types: entries.map(e => e.type),
                        path,
                        folders: folders(path),
                        create: category => this.handleListEntry(
                            texts(path, { form }),
                            listId,
                            listBaseKey,
                            { ...entries[0], label: json ? `${label} (one JSON value per line)` : label, category },
                            supportedPolicies,
                            withoutSuffix(listId, form)
                        ),
                    });
                } else {
                    // A "structured" list, which is not supported by ADMX.
                    // Instead, provide 5 sets of individual policy group entries.
                    const controls = this.withControlTexts(settingTexts, path, entries);
                    for (let i = 1; i < 6; i++) {
                        planned.push({
                            name: `${listId}_${i}`,
                            type: "group",
                            types: entries.map(e => e.type),
                            path,
                            folders: folders(path, true),
                            create: category => this.handleGroupEntry(
                                texts(path, { slot: i, controls, form }),
                                `${listId}_${i}`,
                                `${listBaseKey}\\${i}`,
                                controls.map(e => ({ ...e, category })),
                                supportedPolicies,
                                withoutSuffix(listId, form)
                            ),
                        });
                    }
                }
            }

            // 2. Handle groups.
            for (const [groupId, entries] of groups) {
                const groupBaseKey = this.findBaseKey(entries.map(e => e.key));
                const path = this.getRelativeKeyParts(groupBaseKey);
                const controls = this.withControlTexts(settingTexts, path, entries);
                const form = entries[0].form;
                planned.push({
                    name: groupId,
                    type: "group",
                    types: entries.map(e => e.type),
                    path,
                    folders: folders(path),
                    create: category => this.handleGroupEntry(
                        texts(path, { controls, form }),
                        groupId,
                        groupBaseKey,
                        controls.map(e => ({ ...e, category })),
                        supportedPolicies,
                        withoutSuffix(groupId, form)
                    ),
                });
            }

            // 3. Handle single entries
            for (const entry of singles) {
                const singleId = entry.normalizedKeyParts.join("_");
                const name = `${singleId}${entry.form?.suffix ?? ""}`;
                const label = getControlLabel(settingTexts, entry.normalizedKeyParts, "single", entry.key.split("\\").at(-1));
                planned.push({
                    name,
                    type: "single",
                    types: [entry.type],
                    path: entry.normalizedKeyParts,
                    folders: folders(entry.normalizedKeyParts),
                    create: category => this.handleSingleEntry(
                        texts(entry.normalizedKeyParts, { form: entry.form }),
                        name,
                        { ...entry, label, category },
                        supportedPolicies,
                        singleId
                    ),
                });
                // A JSON value whose text the policy engine parses (see
                // getSchemaSettings()) also gets a text box, which writes the
                // same value as REG_SZ, for tools which can't write multi-line
                // values (e.g. Intune).
                if (entry.oneLine) {
                    planned.push({
                        name: `${name}OneLine`,
                        type: "single",
                        types: ["REG_SZ"],
                        path: entry.normalizedKeyParts,
                        folders: folders(entry.normalizedKeyParts),
                        create: category => {
                            const policyTexts = texts(entry.normalizedKeyParts, { form: entry.form });
                            return this.handleSingleEntry(
                                { ...policyTexts, toc: `${policyTexts.toc} (one JSON line)` },
                                `${name}OneLine`,
                                { ...entry, type: "REG_SZ", value: "", maxLength: JSON_TEXT_MAX_LENGTH, label, category },
                                supportedPolicies,
                                singleId
                            );
                        },
                    });
                }
            }

            if (planned.length == plannedBefore) {
                throw new Error(`The policy ${policyName} can not be represented in the ADMX template.`);
            }
        }

        // The name of an ADMX policy is its identity, see getNameSuffix() for
        // the names of the forms of a setting.
        const names = new Set();
        for (const { name } of planned) {
            if (names.has(name)) {
                throw new Error(`Two ADMX policies would be named ${name}.`);
            }
            names.add(name);
        }

        // Each ADMX policy is placed in its folders, see getFolders().
        for (const { name, type, types, folders, create } of planned) {
            const policyFragment = create(folders);
            if (policyFragment) {
                policyNodes.push({ name, type, types, node: policyFragment.root() });
            }
        }

        // Generate the supportedOn table.
        const supportedOnDefNode = rootNode
            .ele('supportedOn')
            .ele('definitions');
        for (const supported of this.SUPPORTED.values()) {
            supportedOnDefNode.ele('definition', {
                name: `SUPPORTED_ID_${supported.idx}`,
                displayName: this.getStringId(
                    `SUPPORTED_ID_${supported.idx}`,
                    `${l10n.term("brand-short-name")} ${supported.first} - ${supported.last || "*"}`
                )
            });
        }

        // Generate the categories table.
        const categoriesNode = rootNode.ele('categories');
        categoriesNode.ele('category', {
            name: this.rootCategory,
            displayName: this.getStringId(template.admx.prefix, l10n.term("brand-full-name")),
        }).ele('parentCategory', {
            ref: 'Mozilla:Cat_Mozilla'
        })

        // The folders (see getFolders()). Their strings get a prefix, as the
        // string table also holds the names of the ADMX policies.
        for (const [id, { name, parent }] of this.CATEGORIES) {
            categoriesNode.ele('category', {
                name: id,
                displayName: this.getStringId(`cat_${id}`, name)
            }).ele('parentCategory', {
                ref: parent
            });
        }

        // Sort the array of <policy> nodes alphabetically by the 'name' property,
        // and append them to the <policies> node.
        policyNodes.sort((a, b) => a.name.localeCompare(b.name));
        const policiesNode = rootNode.ele('policies');
        for (const { node } of policyNodes) {
            policiesNode.import(node);
        }

        // Get the final output.
        return rootNode.end({ prettyPrint: true });
    }
}

/**
 * @typedef {Object} AdmxTemplate
 * @property {string} version - The version of the branch, e.g. "140.3.0".
 * @property {string} docsUrl - The URL of the documentation of the branch.
 * @property {string} registryKey - The registry key of the product's
 *    policies (admx.registry-key in product.yaml).
 * @property {{file: string, namespace: string, prefix: string}} admx - The
 *    identity of the ADMX template: its namespace (admx.namespace in
 *    product.yaml), and its file name and prefix (the name of the product
 *    folder).
 */

/**
 * Generate the ADMX and ADML files of a branch into the admx/ folder of the
 * given folder. The names of the product come from its brand.ftl
 * (-brand-short-name, -brand-full-name).
 *
 * @param {AdmxTemplate} template
 * @param {Object[]} supportedPolicies - The compatibility information.
 * @param {string} output_dir
 * @param {Object} schema - The policy schema of the branch, see loadBranch().
 * @param {SchemaL10n} l10n - Resolves the texts given as Fluent messages.
 */
export async function generateAdmxTemplates(template, supportedPolicies, output_dir, schema, l10n) {
    const adm_builder = new ADM_BUILDER();

    const admxContent = adm_builder.generateAdmx(template, supportedPolicies, schema, l10n);
    await ensureDir(`${output_dir}/admx`);
    await fs.writeFile(`${output_dir}/admx/${template.admx.file}.admx`, admxContent);

    const admlContent = adm_builder.generateAdml(template);
    await ensureDir(`${output_dir}/admx/en-US`);
    await fs.writeFile(`${output_dir}/admx/en-US/${template.admx.file}.adml`, admlContent);
}

/**
 * Read Mozilla's base ADMX/ADML files, which define the "Mozilla" category
 * used by the templates of all Mozilla products.
 *
 * @param {GitHubSource} mozilla - The source of Mozilla's policy templates.
 * @returns {Promise<{admx: string, adml: string}>}
 */
async function getMozillaTemplates(mozilla) {
    const commit = await mozilla.resolveBranch(MOZILLA_POLICY_TEMPLATES_BRANCH);
    if (!commit) {
        throw new Error(`Unknown branch "${MOZILLA_POLICY_TEMPLATES_BRANCH}" in ${mozilla.description}.`);
    }
    const templates = {};
    for (const [type, path] of [["admx", MOZILLA_ADMX_PATH], ["adml", MOZILLA_ADML_PATH]]) {
        templates[type] = await mozilla.readFile(commit, path);
        if (templates[type] === null) {
            throw new Error(`Missing ${path} in ${mozilla.description}.`);
        }
    }
    return templates;
}

/**
 * Generate the Windows templates of a branch (its admx/ folder): the ADMX
 * and ADML files, generated from the policy schema alone, and Mozilla's base
 * files, which define the "Mozilla" category and are shipped unchanged next to
 * them. The templates must be valid, see validate_admx.mjs.
 *
 * @param {BranchData} branchData - See loadBranch().
 * @param {Object} options
 * @param {GitHubSource} options.mozilla - The source of Mozilla's base files.
 * @param {string} options.output - The docs folder, see writeOutput().
 */
export async function generateWindowsTemplates(branchData, { mozilla, output }) {
    const { branch, product } = branchData;
    const mozillaTemplates = await getMozillaTemplates(mozilla);
    await writeOutput(output, branch, "admx", async dir => {
        await generateAdmxTemplates(
            {
                version: branchData.version,
                docsUrl: `${product.docsUrl}/policies/${branch}`,
                registryKey: product.registryKey,
                admx: product.admx,
            },
            branchData.supportedPolicies,
            dir,
            branchData.schema,
            branchData.l10n
        );
        await fs.writeFile(pathUtils.join(dir, "admx", "mozilla.admx"), mozillaTemplates.admx);
        await fs.writeFile(pathUtils.join(dir, "admx", "en-US", "mozilla.adml"), mozillaTemplates.adml);

        const problems = await validateAdmx({
            admx: pathUtils.join(dir, "admx", `${product.admx.file}.admx`),
            adml: pathUtils.join(dir, "admx", "en-US", `${product.admx.file}.adml`),
        });
        if (problems.length) {
            throw new Error(`The generated ADMX/ADML files of ${branch} are invalid:\n${formatProblems(problems)}`);
        }
    });
}
