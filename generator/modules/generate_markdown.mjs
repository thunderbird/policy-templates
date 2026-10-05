import { getBranchList, loadBranch, writeOutput } from "./branches.mjs";
import { getCompatibilityInformation } from "./compatibility.mjs";
import { deriveSections } from "./derive_examples.mjs";
import { getExtensionContext } from "./extensions.mjs";
import { getBranchKind, preprocess } from "./product.mjs";
import { ContentError, InputError, ensureDir } from "./tools.mjs";
import fs from "node:fs/promises";
import pathUtils from "node:path";
import { getPolicyAnchor } from "./docs_links.mjs";
import { getSchemaOptions } from "./schema_settings.mjs";

/**
 * Escape pipes, which may break markdown tables.
 * 
 * @param {string} str
 * @returns {string} string with escaped pipes
 */
function escape_pipes(str) {
    return str.replaceAll('|', '\\|');
}

/**
 * Fill the placeholders of a template of the product: a value (e.g.
 * "__name__"), or the Markdown returned by an extension of the product (e.g.
 * "__js:compatibility_table__", see loadExtensions() in product.mjs), which
 * gets the given context. The inserted texts are not searched for
 * placeholders.
 *
 * @param {string} template
 * @param {Object<string, string>} values - By placeholder name, e.g. { name: … }.
 * @param {Product} product - See loadProduct().
 * @param {Object} context - The context of the extensions, see
 *    getExtensionContext().
 * @param {string} where - The name of the template, for error messages.
 * @returns {Promise<string>}
 */
async function fillTemplate(template, values, product, context, where) {
    const parts = [];
    let last = 0;
    for (const match of template.matchAll(/__(js:)?([a-z_]+)__/g)) {
        const [placeholder, js, key] = match;
        let value = placeholder;
        if (js) {
            value = await product.extensions.get(key)(context);
            if (typeof value != "string") {
                throw new ContentError(`The extension ${key} of ${where} returned ${typeof value} instead of Markdown.`);
            }
        } else if (Object.hasOwn(values, key)) {
            value = values[key];
        }
        parts.push(template.slice(last, match.index), value);
        last = match.index + placeholder.length;
    }
    parts.push(template.slice(last));
    return parts.join("");
}

// A line of a description, in italics.
const italic = line => `*${line.trim()}*`;

/**
 * Get the description block of a setting: its description and the
 * descriptions of its values ("`value`: description"), as a blockquote of
 * italic lines with hard line breaks. An empty line of the description starts
 * a new paragraph. The site stylesheet (site/assets/css/settings.css of the
 * product, copied into the docs) shows
 * the blockquotes inside the Settings as a plain indent.
 *
 * @param {Object} node - With `description` and `choices` (both optional).
 * @param {string} indent - The indentation of the block.
 * @returns {string[]} the lines, none if there is nothing to describe
 */
function descriptionLines({ description, choices }, indent) {
    const paragraphs = (description ?? "").trim().split(/\n\s*\n/).filter(Boolean)
        .map(paragraph => paragraph.split("\n").filter(line => line.trim()));
    const values = (choices ?? []).filter(choice => choice.description)
        .map(choice => `\`${choice.value}\`: ${choice.description.trim().replaceAll("\n", " ")}`);
    if (values.length) {
        if (!paragraphs.length) {
            paragraphs.push([]);
        }
        paragraphs.at(-1).push(...values);
    }
    return paragraphs.flatMap((lines, index) => [
        ...(index ? [`${indent}>`] : []),
        ...lines.map((line, i) => `${indent}> ${italic(line)}${i < lines.length - 1 ? "\\" : ""}`),
    ]);
}

/**
 * Get the lines of a setting: "`name` Title (type)" (the title if it has one),
 * its description block, and its own settings as a nested list.
 *
 * @param {Object} node - See getSectionTree().
 * @param {string} indent - The indentation of the line.
 * @param {string} bullet - "- " for a list item, else "".
 * @returns {string[]}
 */
function settingLines(node, indent, bullet) {
    const continuation = indent + " ".repeat(bullet.length);
    return [
        `${indent}${bullet}\`${node.name}\`${node.title ? ` ${node.title}` : ""}${node.type ? ` (${node.type})` : ""}${node.deprecated ? " **Deprecated.**" : ""}`,
        ...descriptionLines(node, continuation),
        ...(node.children ?? []).flatMap(child => settingLines(child, continuation, "- ")),
    ];
}

/**
 * Render the settings of a docs section under a "Settings" heading, as blocks:
 * each setting with "`name` (type)", its description block and its own
 * settings as a nested list, each block followed by a blank line. A section
 * whose setting has no settings of its own shows the setting itself, one
 * whose setting accepts several forms (e.g. "boolean or object") shows it
 * above its settings. The
 * blocks are wrapped in a <div class="settings">, for the site stylesheet
 * (the blank lines around them let all renderers parse the Markdown inside).
 *
 * @param {?{name: string, type: string, severalForms: boolean, choices: ?Object[],
 *    children: Object[]}} tree - See getSectionTree().
 * @returns {string[]} the lines
 */
export function renderSettingTree(tree) {
    if (!tree) {
        return [];
    }
    const blocks = tree.children.length
        ? [
            ...(tree.severalForms ? [settingLines({ name: tree.name, type: tree.type }, "", "")] : []),
            ...(tree.choices ? [[...descriptionLines({ choices: tree.choices }, "")]] : []),
            ...tree.children.map(child => settingLines(child, "", "")),
        ]
        : [settingLines({ name: tree.name, type: tree.type, choices: tree.choices }, "", "")];
    return [
        "### Settings",
        "",
        `<div class="settings" markdown="1">`,
        "",
        ...blocks.flatMap(lines => [...lines, ""]),
        "</div>",
        "",
    ];
}

/**
 * Render the docs sections (see deriveSections()): per section its line in
 * the table of contents (its description) and its content, whose heading is
 * the name of the section followed by its title, if it has one. A heading with
 * a title gets the id of the heading without it ({#…}, kramdown), so the
 * anchors don't depend on the titles.
 *
 * @param {Object<string, Object>} policies - The sections by name.
 * @returns {Object<string, {toc: string, content: string[]}>}
 */
export function generateReadmeMarkdown(policies) {
    // Build the JSON readmeData.
    const readmeData = {}
    for (let [key, value] of Object.entries(policies)) {
        readmeData[key] = {}
        const summary = escape_pipes((value.summary ?? "").replace(/\s*\n\s*/g, " "));
        readmeData[key].toc = `| **[\`${key.replaceAll("_", " -> ")
            }\`](#${getPolicyAnchor(key)})** | ${value.deprecated ? "**Deprecated.** " : ""}${summary}`;

        const heading = key.replaceAll("_", " | ");
        readmeData[key].content = [
            value.title ? `## ${heading}: ${value.title} {#${getPolicyAnchor(key)}}` : `## ${heading}`,
            ``,
            ...(value.deprecated ? ["**Deprecated.**", ""] : []),
            // Each text is followed by a blank line.
            ...(value.description ? [...value.description.trimEnd().split("\n"), ""] : []),
            `**CCK2 Equivalent:** ${value.cck2Equivalent
                ? [value.cck2Equivalent].flat().map(e => `\`${e}\``).join(", ")
                : "N/A"
            }\\`,
            `**Preferences Affected:** ${Array.isArray(value.preferencesAffected)
                ? value.preferencesAffected.map(e => `\`${e}\``).join(", ")
                : value.preferencesAffected ?? "N/A"
            }`
        ];
        // The settings of the section, as blocks, see renderSettingTree().
        readmeData[key].content.push("", ...renderSettingTree(value.settingTree).slice(0, -1));
        // The examples, as subsections of "Examples".
        if (value.gpo?.length || value.plist?.length || value.json?.length) {
            readmeData[key].content.push("", "### Examples");
        }
        if (value.gpo && value.gpo.length > 0) {
            readmeData[key].content.push(
                "",
                "#### Windows (GPO)",
                "```",
                ...value.gpo.flatMap(e => {
                    // Multiple keys are given as a string, with a key on each
                    // line. Render each as its own full key/type/value entry.
                    let keys = e.key.split("\n").filter(Boolean);
                    return keys.map(key => `${key} (${e.type}) = ${e.type == "REG_MULTI_SZ" ? "\n" : ""}${e.value.trim()}`)
                }),
                "```",
            )
        }
        if (value.plist && value.plist.length > 0) {
            readmeData[key].content.push(
                "",
                "#### macOS",
                "```",
                value.plist.trim(),
                "```"
            )
        }
        if (value.json && value.json.length > 0) {
            readmeData[key].content.push(
                "",
                "#### policies.json",
                "```",
                value.json.trim(),
                "```"
            )
        }

    }
    return readmeData;
}

/**
 * Generate a markdown compatibility table based on the provided compatInfo.
 * 
 * @param {PolicyCompatibilityEntry} compatInfo - see getCompatibilityInformation()
 * @param {string} productName - The header of the version column, the brand
 *    name of the product.
 * @returns {string[]} lines of markdown code of the generated compatibility table
 * 
 * The product column has the version since when the product supports the
 * policy.
 *
 * @example
 * [
 *   '',
 *   '| Policy/Property Name | Thunderbird | Removed after |',
 *   '|:--- | ---:| ---:|',
 *   '| `SSLVersionMin` | 68.0 |  |',
 *   ''
 * ]
 */
export function generateReadmeCompatibilityTable(compatInfo, productName) {
    let details = [];

    const humanReadableEntry = entry => {
        return "`" + escape_pipes(entry
            .replace("^(", "(")
            .replace(")$", ")")) + "`";
    }

    details.push(
        "",
        `| Policy/Property Name | ${productName} | Removed after |`,
        "|:--- | ---:| ---:|"
    );
    for (let entry of compatInfo) {
        details.push(`| ${entry.policies.map(humanReadableEntry).join("<br>")} | ${entry.first || "❌"} | ${entry.last} |`);
    }
    details.push("");
    return details;
}

/**
 * Generate the markdown of the README file of a branch, in the frame of the
 * product's templates/branch.md, and save it in the specified folder.
 * 
 * @param {Object<string, Object>} sections - The docs sections, see
 *    deriveSections().
 * @param {BranchData} branchData - See loadBranch().
 * @param {Object[]} branches - The branches of the run, see getBranchList().
 * @param {LocalGitSource|GitHubSource} app - The product's source.
 * @param {string} output_dir - Path to save the generated README file.
 */
export async function generatePolicyReadme(sections, branchData, branches, app, output_dir) {
    const { product, branch, supportedPolicyNames, compatData } = branchData;
    const productName = branchData.l10n.term("brand-short-name");
    let readmeData = generateReadmeMarkdown(sections);

    let header = [];
    let details = [];
    let printed_main_policies = [];
    let skipped_main_policies = [];
    // Loop over the supported policies (from the compatibility data) and
    // rebuild the readme from their sections.
    for (let policy of supportedPolicyNames) {
        // Get the policy header from its section.
        if (readmeData[policy]) {
            if (readmeData[policy].toc) {
                header.push(readmeData[policy].toc);
            }
            printed_main_policies.push(policy.split("_").shift());
        } else {
            // Keep track of policies which are not mentioned directly in the readme.
            let skipped = policy.split("_").shift();
            if (!skipped_main_policies.includes(skipped)) skipped_main_policies.push(skipped);
        }

        // Get the policy details from its section.
        if (readmeData[policy]) {
            if (readmeData[policy].content) {
                details.push(...readmeData[policy].content.filter(e => !e.includes("**Compatibility:**")));
                details.push("");
                details.push("### Compatibility");
                let distinctCompatInfo = getCompatibilityInformation(compatData, { distinct: true, policyName: policy });
                details.push(...generateReadmeCompatibilityTable(distinctCompatInfo, productName));
            }
        }
    }

    for (let skipped of skipped_main_policies) {
        if (!printed_main_policies.includes(skipped)) {
            console.log(`  --> WARNING: Supported policy not present in readme: \x1b[31m '${skipped}'\x1b[0m`);
        }
    }

    let md = await fillTemplate(preprocess(product.templates.branch, [getBranchKind(branch)], "branch.md"), {
        name: branchData.name,
        branch,
        docs_url: product.docsUrl,
        templates_repository: product.templatesRepository,
        list_of_policies: header.join("\n"),
        details: details.join("\n"),
    }, product, getExtensionContext(branchData, branches, app), "branch.md");

    await ensureDir(output_dir);
    await fs.writeFile(`${output_dir}/README.md`, md);
}

/**
 * Build the overview of the docs (README.md in the docs folder), in the frame
 * of the product's templates/overview.md: it lists the templates of the given
 * branches and gives a compatibility overview based on the main branch.
 *
 * @param {Object} params
 * @param {LocalGitSource|GitHubSource} params.app - The product's source.
 * @param {Product} params.product - See loadProduct().
 * @param {string[]} params.branches - The branches to list, including main.
 * @param {BranchData} [params.main] - The data of the main branch, loaded if
 *    not given.
 * @param {string} output - The docs folder.
 */
export async function generateOverview({ app, product, branches, main }, output) {
    if (!branches.includes("main")) {
        throw new InputError("The overview needs the main branch (its compatibility data), which the product's repository doesn't have.");
    }
    main ??= await loadBranch({ app, product, branch: "main" });
    const branchList = await getBranchList({ app, product, branches });
    const entries = branchList.map(({ branch, name }) => ` * [${name}](policies/${branch})`);

    let compatInfo = getCompatibilityInformation(main.compatData, { distinct: false });
    compatInfo.sort((a, b) => {
        let aa = a.policies.join(", ");
        let bb = b.policies.join(", ");
        if (aa < bb) return -1;
        if (aa > bb) return 1;
        return 0;
    });

    await ensureDir(output);
    await fs.writeFile(pathUtils.join(output, "README.md"), await fillTemplate(preprocess(product.templates.overview, [], "overview.md"), {
        branches: entries.join("\n"),
        compatibility: generateReadmeCompatibilityTable(compatInfo, main.l10n.term("brand-short-name")).join("\n"),
    }, product, getExtensionContext(main, branchList, app), "overview.md"));
}

/**
 * Generate the Markdown docs of a branch (its README.md) from its policy
 * schema.
 *
 * @param {BranchData} branchData - See loadBranch().
 * @param {Object} options
 * @param {LocalGitSource|GitHubSource} options.app - The product's source.
 * @param {string[]} options.branches - The branches of the run.
 * @param {string} options.output - The docs folder, see writeOutput().
 */
export async function generateDocs(branchData, { app, branches, output }) {
    const { product, branch } = branchData;
    const sections = deriveSections(
        branchData.schema, branchData.l10n, product.registryKey, getSchemaOptions(branchData.version)
    );
    const branchList = await getBranchList({ app, product, branches });
    await writeOutput(output, branch, "README.md", dir => generatePolicyReadme(sections, branchData, branchList, app, dir));
}
