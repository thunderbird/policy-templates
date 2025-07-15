import { create } from 'xmlbuilder2';
import fs from "node:fs/promises";

import { ensureDir } from "./tools.mjs";

function getTemplateRevision(template) {
    let v = template.version.split(".");
    let major = v[0];
    let minor = Number(v[1]);
    let patch = Number(v[2]);
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
        this.CATEGORIES = new Set();
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

    handleListEntry(
        policyData,
        listId,
        listBaseKey,
        entry,
        supportedPolicies,
        supportedPoliciesId = listId
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
        const listAttrs = {
            id: `${listId}_List`,
            key: listBaseKey,
            valuePrefix: '',
            ...(entry.required && { required: true }),
            ...(entry.type === 'REG_EXPAND_SZ' && { expandable: true }),
        };
        elements.ele('list', listAttrs);
        return policyFragment
    }

    handlePresentationEntry({ rootElement, id, entry }) {
        switch (entry.type) {
            case "REG_DWORD": {
                if (isBooleanLikeEntry(entry)) {
                    rootElement.ele('checkBox', { refId: `${id}_Bool` })
                } else {
                    rootElement.ele('dropdownList', { refId: `${id}_Enum` }).txt('Fake Label');;
                }
                break;
            }
            case "REG_SZ":
            case "REG_EXPAND_SZ": {
                const enums = entry.value.split("|").map(e => e.trim()).filter(Boolean);
                if (enums.length == 1) {
                    rootElement
                        .ele('textBox', { refId: `${id}_Input` })
                        .ele('label', { refId: this.getStringId(`${id}_Input_Label`, `Label for textbox ${id}_Input`) });
                } else {
                    rootElement.ele('dropdownList', { refId: `${id}_Enum` }).txt('Fake Label');;
                }
                break;
            }
            case "REG_MULTI_SZ": {
                rootElement.ele('multiTextBox', { refId: `${id}_Input` });
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
                presentationFragment.ele('listBox', { refId: `${id}_List` });
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
        let saveId = id.replaceAll(".", "_");
        this.STRINGS.set(id.replaceAll(".", "_"), value);
        return `$(string.${saveId})`;
    }

    /**
     * Extends the provided GPO entries by adding a `normalizedKeyParts` property,
     * derived from the `key` field by removing the expected base path
     * (`Software\Policies\Mozilla\Thunderbird`) and splitting the remaining path
     * into segments.
     *
     * @param {Array<Object>} gpoEntries - An array of GPO entry objects, each
     *    containing a registry key.
     * @returns {Array<Object>} A new array of GPO entries with an added
     *    `normalizedKeyParts` array representing the relative key path.
     */
    normalizedGpoKeys(gpoEntries) {
        const BASE_KEY = "Software\\Policies\\Mozilla\\Thunderbird"
        return gpoEntries.map(e => {
            const keyParts = e.key.split("\\");
            const base = keyParts.slice(0, 4).join("\\");
            if (base != BASE_KEY) {
                console.log("Key is using an unsupported base key", e.key)
            }
            return {
                normalizedKeyParts: keyParts.slice(4),
                ...e
            }
        });
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
     * Groups GPO entries into categories based on the structure of their registry key
     * paths. 
     * 
     * examples for list entries :
     * - Software\Policies\Mozilla\Thunderbird\InstallAddonsPermission\Allow\1
     * - Software\Policies\Mozilla\Thunderbird\InstallAddonsPermission\Allow\2
     * 
     * examples for structured list entries:
     * - Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Name
     * - Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Method
     * - Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\IconURL
     * - Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Alias
     * - Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Description
     * 
     * examples for group entries:
     * - Software\Policies\Mozilla\Thunderbird\Authentication\AllowNonFQDN\SPNEGO
     * - Software\Policies\Mozilla\Thunderbird\Authentication\AllowNonFQDN\NTLM
     *
     * examples for single entries (one level less then groups):
     * - Software\Policies\Mozilla\Thunderbird\AppUpdateURL
     * - Software\Policies\Mozilla\Thunderbird\Certificates\ImportEnterpriseRoots
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
            if (entry.normalizedKeyParts.length <= 2) {
                singles.push(entry);
                continue;
            }

            if (entry.normalizedKeyParts.some(e => !isNaN(Number(e)))) {
                // Valid list entries are:
                // * [ 'Certificates', 'Install', '1' ]
                // * [ 'SearchEngines', 'Add', '1', 'Name' ]
                // Group list items by cutting before the list index.
                const listBase = cutArrayBeforeFirstNumericElement(entry.normalizedKeyParts).join("_");
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
            const groupBase = entry.normalizedKeyParts.slice(0, -1).join("_");
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
                        case 'item': {
                            // If we are under an <elements> node, we can't use an
                            // <enabledValue> / <disabledValue> node pair, and also
                            // not a <boolean> node. As a fallback we generate an
                            // <enum> node (rendered as a dropdown).
                            const enumElem = rootElement
                                .ele('enum', {
                                    id: `${id}_Enum`,
                                    valueName,
                                });
                            enumElem
                                .ele('item', { displayName: this.getStringId(`Enabled`, `Enabled`) })
                                .ele('value')
                                .ele('decimal').txt('1');

                            enumElem
                                .ele('item', { displayName: this.getStringId(`Disabled`, `Disabled`) })
                                .ele('value')
                                .ele('decimal').txt('0');

                            break;
                        }
                        default:
                            console.warn(`Unsupported root node: ${rootNodeName}`);
                            break;
                    }
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
                        enumElem
                            .ele('item', { displayName: this.getStringId(`${id}_${intVal}`, `${id}_${intVal}`) })
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
                if (enums.length == 1) {
                    const textAttrs = {
                        // The id is also used to reference implicit labels created
                        // for the node. Since the string table is global, we should
                        // use a unique id here. If we however want to re-use strings,
                        // we should use a generic id here. 
                        id: `${id}_Input`,
                        valueName,
                        ...(entry.type === 'REG_EXPAND_SZ' && { expandable: true }),
                        ...(entry.required && { required: true }),
                    };
                    baseElement.ele('text', textAttrs);
                } else {
                    const enumElem = baseElement.ele('enum', {
                        id: `${id}_Enum`,
                        valueName
                    });

                    for (const val of enums) {
                        enumElem
                            .ele('item', { displayName: this.getStringId(`${id}_${val}`, `${id}_${val}`) })
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
                    maxLength: '16384', // hardcoded, could be made configurable
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
     * @returns {boolean} True if a supportedOn reference was added; false if the
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

    handleCategoryEntry({ category, rootElement }) {
        if (category) {
            // Add each level as its own category.
            let categoryParts = category.split("\\");
            for (let i = 0; i < categoryParts.length; i++) {
                let entry = categoryParts.slice(0, i + 1).join("\\")
                this.CATEGORIES.add(entry);
            }
            rootElement.ele('parentCategory', { ref: `${categoryParts.join("_")}_category` });
        } else {
            rootElement.ele('parentCategory', { ref: `thunderbird_category` });
        }
    }

    /**
     * Generates an ADML <stringTable> XML fragment from a Map of strings.
     *
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

    generateAdmx(template, supportedPolicies) {
        const namespace = {
            revision: getTemplateRevision(template),
            schemaVersion: "1.0",
            xmlns: 'http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions',
        };

        const rootNode = create({ version: '1.0', encoding: 'utf-8' })
            .ele('policyDefinitions', namespace)
            .ele('policyNamespaces')
            .ele('target', { prefix: 'thunderbird', namespace: 'MZLA.Policies.Thunderbird' }).up()
            .up()
            .ele('resources', { minRequiredRevision: getTemplateRevision(template) })
            .up()

        const policyNodes = [];
        const sortedPolicies = Object.entries(template.policies).sort((a, b) => a[0].localeCompare(b[0]));

        for (const [policyName, policyData] of sortedPolicies) {
            if (!policyData.gpo) continue;

            const gpoEntries = policyData.gpo.flatMap(e => {
                const keys = e.key.split("\n").filter(Boolean);
                return keys.map(key => ({
                    key,
                    type: e.type,
                    value: e.value,
                    required: e.required,
                    category: e.category,
                }));
            });
            const { lists, groups, singles } = this.groupByEntriesByKeyType(gpoEntries);

            // 1. Handle lists.
            for (const [listId, entries] of lists) {
                const listBaseKey = this.findBaseKey(entries.map(e => e.key));
                if (entries.length === 1) {
                    // Simple REG_SZ/REG_EXPAND_SZ List.
                    const policyFragment = this.handleListEntry(
                        policyData,
                        listId,
                        listBaseKey,
                        entries[0],
                        supportedPolicies
                    );
                    if (policyFragment) {
                        policyNodes.push({
                            name: listId,
                            type: "list",
                            types: entries.map(e => e.type),
                            node: policyFragment.root(),
                        });
                    }
                } else {
                    // A "structured" list, which is not supported by ADMX.
                    // Instead, provide 5 sets of individual policy group entries.
                    for (let i = 1; i < 6; i++) {
                        const policyFragment = this.handleGroupEntry(
                            policyData,
                            `${listId}_${i}`,
                            `${listBaseKey}\\${i}`,
                            entries,
                            supportedPolicies,
                            `${listId}`
                        );

                        if (policyFragment) {
                            policyNodes.push({
                                name: `${listId}_${i}`,
                                type: "group",
                                types: entries.map(e => e.type),
                                node: policyFragment.root()
                            });
                        }
                    }
                }

            }

            // 2. Handle groups.
            for (const [groupId, entries] of groups) {
                const groupBaseKey = this.findBaseKey(entries.map(e => e.key));

                const policyFragment = this.handleGroupEntry(
                    policyData,
                    groupId,
                    groupBaseKey,
                    entries,
                    supportedPolicies
                );

                if (policyFragment) {
                    policyNodes.push({
                        name: groupId,
                        type: "group",
                        types: entries.map(e => e.type),
                        node: policyFragment.root()
                    });
                }
            }

            // 3. Handle single entries
            for (const entry of singles) {
                const keyParts = entry.key.split("\\");
                const valueName = keyParts.pop();
                const singleId = entry.normalizedKeyParts.join("_");

                // Create a new fragment document for this policy.
                const isBooleanLike = isBooleanLikeEntry(entry);
                const policyAttrs = {
                    name: `${singleId}`,
                    class: 'Both',
                    displayName: this.getStringId(`${singleId}`, policyData.toc),
                    explainText: this.getStringId(`${singleId}_Explain`, policyData.content),
                    key: keyParts.join("\\"),
                    ...(!isBooleanLike && { presentation: `$(presentation.${singleId})` }),
                    ...(entry.type == 'REG_DWORD' && { valueName }),
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
                    id: singleId,
                    rootElement: policyFragment
                })) {
                    // Unsupported, skip.
                    continue
                };

                this.handleValueEntry({
                    entry,
                    valueName,
                    id: singleId,
                    rootElement: policyFragment,
                })

                // Push the fragment with its name for sorting later
                policyNodes.push({ name: singleId, type: "single", types: [entry.type], node: policyFragment.root() });
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
                    `Thunderbird ${supported.first} - ${supported.last || "*"}`
                )
            });
        }

        // Generate the categories table.
        const categoriesNode = rootNode.ele('categories');
        categoriesNode.ele('category', {
            name: 'MZLA_category',
            displayName: this.getStringId(
                `mzla`,
                `MZLA Technologies Corporation (a wholly owned subsidiary of Mozilla Foundation)`
            ),
        })

        categoriesNode.ele('category', {
            name: 'thunderbird_category',
            displayName: this.getStringId(`thunderbird`, `Mozilla Thunderbird`),
        }).ele('parentCategory', {
            ref: 'MZLA_category'
        })

        for (const category of this.CATEGORIES.values()) {
            let categoryParts = category.split("\\");
            let parentCategoryParts = categoryParts.slice(0, -1);
            let parentCategory = parentCategoryParts.length > 0
                ? `${parentCategoryParts.join("_")}_category`
                : `thunderbird_category`;

            categoriesNode.ele('category', {
                name: `${categoryParts.join("_")}_category`,
                displayName: this.getStringId(`${categoryParts.join("_")}_category`, categoryParts.at(-1))
            }).ele('parentCategory', {
                ref: parentCategory
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

export async function generateAdmxTemplates(template, supportedPolicies, output_dir) {
    const adm_builder = new ADM_BUILDER();

    const admxContent = adm_builder.generateAdmx(template, supportedPolicies);
    await ensureDir(`${output_dir}/windows`);
    await fs.writeFile(`${output_dir}/windows/thunderbird.admx`, admxContent);

    const admlContent = adm_builder.generateAdml(template);
    await ensureDir(`${output_dir}/windows/en-US`);
    await fs.writeFile(`${output_dir}/windows/en-US/thunderbird.adml`, admlContent);
}
