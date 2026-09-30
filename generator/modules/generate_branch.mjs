import {
    generateAdmxTemplates
} from "./generate_admx.mjs";
import {
    generatePolicyReadme,
    generateReadmeCompatibilityTable,
} from "./generate_markdown.mjs";
import {
    generatePlistFile,
} from "./generate_plist.mjs";
import {
    deriveFormats,
} from "./derive_examples.mjs";
import {
    formatProblems,
    validateAdmx,
} from "./validate_admx.mjs";
import {
    addSupportedSince,
    addUnsupportedPolicies,
    buildCompatibilityData,
    getCompatibilityInformation,
    getSchemaRevisions,
} from "./compatibility.mjs";
import {
    BRANCH_PREFIXES,
    DOCS_README_PATH, DOCS_TEMPLATES_DIR_PATH,
    FIREFOX_POLICIES_SCHEMA_PATH, FIREFOX_REFERENCE_BRANCH,
    MAIN_TEMPLATE,
    THUNDERBIRD_POLICIES_SCHEMA_PATH, THUNDERBIRD_POLICIES_YAML_PATH,
    THUNDERBIRD_VERSION_PATH,
} from "./constants.mjs";
import { InputError, PolicyYamlError } from "./tools.mjs";

import commentJson from "comment-json";
import fs from "node:fs/promises";
import pathUtils from "path";
import yaml from 'yaml';

/**
 * Get the prefix used in the name of the templates of the given branch.
 *
 * @param {string} branch - e.g. "main", "release" or "esr140"
 * @returns {string} e.g. "Thunderbird ESR"
 */
function getBranchPrefix(branch) {
    return /^esr\d+$/.test(branch)
        ? BRANCH_PREFIXES.esr
        : BRANCH_PREFIXES[branch] ?? `Thunderbird ${branch}`;
}

/**
 * Sort key for branches: main, beta, release, then ESRs (newest first).
 *
 * @param {string} branch
 * @returns {number[]}
 */
function getBranchSortKey(branch) {
    const esr = branch.match(/^esr(\d+)$/);
    if (esr) {
        return [3, -Number(esr[1])];
    }
    const idx = ["main", "beta", "release"].indexOf(branch);
    return [idx == -1 ? 4 : idx, 0];
}

/**
 * Get the ESR branches of the Thunderbird repository, sorted by version.
 *
 * @param {LocalGitSource|GitHubSource} tb - The Thunderbird source.
 * @returns {Promise<string[]>} e.g. ["esr115", "esr128", "esr140"]
 */
async function getEsrBranches(tb) {
    return (await tb.listBranches())
        .map(branch => branch.match(/^esr(\d+)$/))
        .filter(Boolean)
        .sort((a, b) => Number(a[1]) - Number(b[1]))
        .map(match => match[0]);
}

/**
 * Get the compatibility data of a branch, based on the history of its policy
 * schema file.
 *
 * @param {LocalGitSource|GitHubSource} tb - The Thunderbird source.
 * @param {string} branch
 * @returns {Promise<CompatibilityData|null>} null if the branch does not exist
 */
async function getBranchCompatibilityData(tb, branch) {
    const commit = await tb.resolveBranch(branch);
    if (!commit) {
        return null;
    }
    return buildCompatibilityData(await getSchemaRevisions(tb, commit));
}

/**
 * Generate the policy documentation and templates for a single Thunderbird
 * branch. The documentation for the main branch also updates the overview
 * README of all generated templates.
 *
 * @param {Object} params
 * @param {LocalGitSource|GitHubSource} params.tb - The Thunderbird source.
 * @param {LocalGitSource|GitHubSource} params.ff - The Firefox source.
 * @param {string} params.branch - The branch, e.g. "main", "release" or "esr140".
 * @param {string} [params.policiesYamlPath] - Path to a file to be used instead
 *    of the policies.yaml file of the branch.
 *
 * @returns {Promise<boolean>} false if the branch was skipped
 */
export async function generateBranch({ tb, ff, branch, policiesYamlPath }) {
    console.log(`Processing ${branch}`);

    const commit = await tb.resolveBranch(branch);
    if (!commit) {
        throw new InputError(`Unknown branch "${branch}" in ${tb.description}.`);
    }

    let policiesYaml;
    if (policiesYamlPath) {
        console.log(` - policies.yaml overridden by ${policiesYamlPath}`);
        policiesYaml = await fs.readFile(policiesYamlPath, "utf8");
    } else {
        policiesYaml = await tb.readFile(commit, THUNDERBIRD_POLICIES_YAML_PATH);
        if (policiesYaml === null) {
            console.log(` - skipping ${branch}, it has no ${THUNDERBIRD_POLICIES_YAML_PATH}`);
            return false;
        }
    }

    // Find supported policies. The version in which a policy became supported
    // is based on the release branch, backports are found in the ESR branches.
    let compatData = buildCompatibilityData(await getSchemaRevisions(tb, commit));
    const esrs = [];
    for (const esrBranch of await getEsrBranches(tb)) {
        esrs.push({
            branch: esrBranch,
            data: esrBranch == branch
                ? compatData
                : await getBranchCompatibilityData(tb, esrBranch),
        });
    }
    addSupportedSince(compatData, {
        branch,
        release: branch == "release"
            ? compatData
            : await getBranchCompatibilityData(tb, "release"),
        esrs,
    });
    const thunderbirdPolicies = Object.keys(compatData)
        .sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

    // The documentation of the main branch also lists the Firefox policies,
    // which are not supported by Thunderbird.
    if (branch == "main") {
        compatData = addUnsupportedPolicies(compatData, await getFirefoxSchema(ff));
    }
    const supportedPolicies = getCompatibilityInformation(compatData, { distinct: true })
        .filter(e => e.first != "");

    const document = yaml.parseDocument(policiesYaml);
    if (document.errors.length) {
        throw new PolicyYamlError(
            `Invalid YAML in ${policiesYamlPath ?? THUNDERBIRD_POLICIES_YAML_PATH}: ${document.errors[0].message.split("\n")[0]}`
        );
    }
    const template = document.toJSON();
    // The GPO and plist examples are derived from the json example of each
    // policy, and the choices are added based on the schema. The schema of main
    // also marks the JSON values of older branches.
    deriveFormats(template, [
        await getThunderbirdSchema(tb, commit),
        await getThunderbirdSchema(tb, await tb.resolveBranch("main")),
    ]);
    template.tree = branch;
    template.version = (await tb.readFile(commit, THUNDERBIRD_VERSION_PATH)).trim();
    template.name = `${getBranchPrefix(branch)} ${template.version}`;

    // Generate the docs into a temporary folder. It is not placed inside the
    // templates folder, as generateOverview() lists all folders in there.
    const output_dir = pathUtils.join(DOCS_TEMPLATES_DIR_PATH, branch);
    const tmp_dir = pathUtils.join(DOCS_TEMPLATES_DIR_PATH, "..", `.tmp-${branch}`);
    await fs.rm(tmp_dir, { recursive: true, force: true });
    try {
        await generatePolicyReadme(template, thunderbirdPolicies, compatData, tmp_dir);
        await generatePlistFile(template, thunderbirdPolicies, tmp_dir);
        await generateAdmxTemplates(
            template,
            supportedPolicies,
            tmp_dir
        );

        // Every generated template must be valid, see validate_admx.mjs.
        const problems = await validateAdmx({
            admx: pathUtils.join(tmp_dir, "windows", "thunderbird.admx"),
            adml: pathUtils.join(tmp_dir, "windows", "en-US", "thunderbird.adml"),
        });
        if (problems.length) {
            throw new Error(`The generated ADMX/ADML files of ${branch} are invalid:\n${formatProblems(problems)}`);
        }

        // The previous docs are only replaced now, so they are kept if the
        // input or the generated templates are invalid.
        await fs.rm(output_dir, { recursive: true, force: true });
        await fs.rename(tmp_dir, output_dir);
    } finally {
        await fs.rm(tmp_dir, { recursive: true, force: true });
    }

    if (branch == "main") {
        await generateOverview(compatData);
    }
    return true;
}

/**
 * Read Thunderbird's policy schema of the given commit.
 *
 * @param {LocalGitSource|GitHubSource} tb - The Thunderbird source.
 * @param {string} commit
 * @returns {Promise<Object>}
 */
async function getThunderbirdSchema(tb, commit) {
    return commentJson.parse(await tb.readFile(commit, THUNDERBIRD_POLICIES_SCHEMA_PATH));
}

/**
 * Read Firefox's policy schema, used to find the policies which are not
 * supported by Thunderbird.
 *
 * @param {LocalGitSource|GitHubSource} ff - The Firefox source.
 * @returns {Promise<Object>}
 */
async function getFirefoxSchema(ff) {
    const commit = await ff.resolveBranch(FIREFOX_REFERENCE_BRANCH);
    if (!commit) {
        throw new InputError(`Unknown branch "${FIREFOX_REFERENCE_BRANCH}" in ${ff.description}.`);
    }
    return commentJson.parse(await ff.readFile(commit, FIREFOX_POLICIES_SCHEMA_PATH));
}

/**
 * Build the main README of https://thunderbird.github.io/policy-templates/, which
 * lists all generated templates and gives a compatibility overview based on the
 * main branch.
 *
 * @param {CompatibilityData} compatData - The compatibility data of the main
 *    branch, including the policies which are not supported by Thunderbird.
 */
async function generateOverview(compatData) {
    // List all generated templates, using the name from their README.
    const titlePrefix = "## Enterprise policy descriptions and templates for ";
    const entries = [];
    for (const dir of await fs.readdir(DOCS_TEMPLATES_DIR_PATH, { withFileTypes: true })) {
        if (!dir.isDirectory()) {
            continue;
        }
        const readmePath = pathUtils.join(DOCS_TEMPLATES_DIR_PATH, dir.name, "README.md");
        const title = await fs.readFile(readmePath, "utf8")
            .then(content => content.split("\n")[0])
            .catch(() => "");
        if (title.startsWith(titlePrefix)) {
            entries.push({
                branch: dir.name,
                line: ` * [${title.slice(titlePrefix.length)}](templates/${dir.name})`,
            });
        }
    }
    entries.sort((a, b) => {
        const [a1, a2] = getBranchSortKey(a.branch);
        const [b1, b2] = getBranchSortKey(b.branch);
        return a1 - b1 || a2 - b2 || a.branch.localeCompare(b.branch);
    });

    let compatInfo = getCompatibilityInformation(compatData, { distinct: false });
    compatInfo.sort((a, b) => {
        let aa = a.policies.join(", ");
        let bb = b.policies.join(", ");
        if (aa < bb) return -1;
        if (aa > bb) return 1;
        return 0;
    });

    await fs.writeFile(DOCS_README_PATH, MAIN_TEMPLATE
        // Use replacer functions, as the text may contain "$" patterns.
        .replace("__list__", () => entries.map(e => e.line).join("\n"))
        .replace("__compatibility__", () => generateReadmeCompatibilityTable(compatInfo).join("\n"))
    );
}
