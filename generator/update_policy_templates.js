/**
 * See https://bugzilla.mozilla.org/show_bug.cgi?id=1732258
 */

// Debug logging (0 - errors and basic logs only, 1 - verbose debug)
const DEBUG_LEVEL = 0;
const DEBUG_SKIP_GITHUB_PULL = false;

const build_dir = "../templates";
const state_dir = "./data/gitstate";
const schema_dir = "./data/schema";
const mozilla_template_dir = "./data/mozilla-policy-templates";

const main_readme = "../README.md";
const readme_json_path = "./config/readme_#tree#.json";
const compatibility_json_path = `./config/compatibility.json`;
const revisions_json_write_path = "./config/revisions.json";
const revisions_json_read_path = `${state_dir}/generator/config/revisions.json`;
const HG_URL = `https://hg-edge.mozilla.org`;

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Replacement for deprecated request.
const bent = require('bent');
const bentGetTEXT = bent('GET', 'string', 200);

const cheerio = require('cheerio');
const git = require("isomorphic-git");
const http = require('isomorphic-git/http/node');
const util = require('util');
const fs = require('fs-extra');
const path = require("path");
const plist = require('plist');
const convert = require('xml-js');

const {
    parse,
    stringify,
    assign
} = require('comment-json');

var gCompatibilityData = {};
var gMainTemplateEntries = [];

const gMainTemplate = `## Enterprise policy descriptions and templates for Thunderbird

While the templates for the most recent version of Thunderbird will probably also work with older releases of Thunderbird, they may contain new policies which are not supported in older releases. We suggest to use the templates which correspond to the highest version of Thunderbird you are actually deploying.

__list__

<br>

## List of supported policies

The following table states for each policy, when Thunderbird started to support it, or when it has been deprecated. It also includes all policies currently supported by Firefox, which are not supported by Thunderbird.

__compatibility__

`

const gTreeTemplate = `## Enterprise policy descriptions and templates for __name__

__desc__

<br>

| Policy Name | Description
|:--- |:--- |
__list_of_policies__

<br>

__details__

`;

function debug(...args) {
    if (DEBUG_LEVEL > 0) {
        console.debug(...args);
    }
}

function dump(data) {
    console.log(util.inspect(data, false, null));
}

/**
 * bent based request variant with hard timeout on client side.
 * 
 * @param {string} url - url to GET
 * @returns - text content
 */
async function request(url) {
    debug(" -> ", url);
    // Retry on error, using a hard timeout enforced from the client side.
    let rv;
    for (let i = 0; (!rv && i < 5); i++) {
        if (i > 0) {
            console.error("Retry", i);
        }
        // Rate limit the first request already, otherwise hg.mozilla.org will block us.
        await new Promise(resolve => setTimeout(resolve, 2500));

        let killTimer;
        let killSwitch = new Promise((resolve, reject) => { killTimer = setTimeout(reject, 15000, "HardTimeout"); })
        rv = await Promise
            .race([bentGetTEXT(url), killSwitch])
            .catch(err => {
                console.error('Error in  request', err);
                return null;
            });

        // node will continue to "wait" after the script finished, if we do not
        // clear the timeouts.
        clearTimeout(killTimer);
    }
    return rv;
}

/**
 * Escape illegal chars from markdown code.
 * 
 * @param {string} str - markdown code string
 * @returns - escaped string
 */
function escape_code_markdown(str) {
    let chars = [
        "\\|",
    ];
    for (let char of chars) {
        str = str.replace(new RegExp(char, 'g'), char);
    }
    return str;
}

/**
 * Compare version numbers, taken from https://jsfiddle.net/vanowm/p7uvtbor/.
 */
function compareVersion(a, b) {
    function prep(t) {
        return ("" + t)
            // Treat non-numerical characters as lower version.
            // Replacing them with a negative number based on charcode of first character.
            .replace(/[^0-9\.]+/g, function (c) { return "." + ((c = c.replace(/[\W_]+/, "")) ? c.toLowerCase().charCodeAt(0) - 65536 : "") + "." })
            // Remove trailing "." and "0" if followed by non-numerical characters (1.0.0b).
            .replace(/(?:\.0+)*(\.-[0-9]+)(\.[0-9]+)?\.*$/g, "$1$2")
            .split('.');
    }
    a = prep(a);
    b = prep(b);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        // Convert to integer the most efficient way.
        a[i] = ~~a[i];
        b[i] = ~~b[i];
        if (a[i] > b[i])
            return 1;
        else if (a[i] < b[i])
            return -1;
    }
    return 0;
}

/**
 * Rebrand from Firefox to Thunderbird.
 * 
 * @param {*} lines - string or array of strings which need to be rebranded
 * @returns - rebranded string (input array is joined by \n)
 */
function rebrand(lines) {
    if (!Array.isArray(lines))
        lines = [lines.toString()];

    const replacements = [
        {
            reg: /\bFirefox\b/g,
            val: "Thunderbird",
        },
        {
            reg: /\bfirefox\b/g,
            val: "thunderbird",
        },
        {
            reg: /([\W_])FF(\d\d)/g,
            val: "\$1TB\$2",
        },
        {
            reg: /\bAMO\b/g,
            val: "ATN",
        },
        {
            reg: /addons.mozilla.org/g,
            val: "addons.thunderbird.net",
        },
        {	// Undo a wrong replace.
            reg: "https://support.mozilla.org/kb/setting-certificate-authorities-thunderbird",
            val: "https://support.mozilla.org/kb/setting-certificate-authorities-firefox"
        },
        {	// Undo a wrong replace.
            reg: "https://support.mozilla.org/en-US/kb/dom-events-changes-introduced-thunderbird-66",
            val: "https://support.mozilla.org/en-US/kb/dom-events-changes-introduced-firefox-66"
        }
    ]

    for (let i = 0; i < lines.length; i++) {
        for (let r of replacements) {
            lines[i] = lines[i].replace(r.reg, r.val);
        }
    }

    return lines.join("\n");
}

// -----------------------------------------------------------------------------

/**
 * Clone or pull a github repository.
 * 
 * @param {string} url - url to the repository
 * @param {string} ref - branch/tag to checkout, "master" or "v3.0"
 * @param {string} dir - directory to store templates in
 */
async function pullGitRepository(url, ref, dir) {
    if (DEBUG_SKIP_GITHUB_PULL)
        return;

    if (!fs.existsSync(dir)) {
        console.log(`Cloning ${url} (${ref})`);
        fs.ensureDirSync(dir);
        await git.clone({
            // Use name of the script as the name of the pulling "author".
            author: { name: "update_policy_template.js" },
            fs,
            http,
            dir,
            url,
            ref,
            singleBranch: true,
            depth: 10,
            force: true
        });
    } else {
        console.log(`Updating ${url} (${ref})`);
        await git.pull({
            // Use name of the script as the name of the pulling "author".
            author: { name: "update_policy_template.js" },
            fs,
            http,
            dir,
            ref,
            singleBranch: true,
            force: true
        });
    }
}

/**
 * Parse the README files of a given mozilla policy template.
 * 
 * @param {string} tree - "central" or "esr91"
 * @return - parsed data from readme.json, updated with upstream changes
 */
async function parseMozillaPolicyTemplate(tree) {
    let readme_file_name = readme_json_path.replace("#tree#", tree);
    let readmeData = fs.existsSync(readme_file_name)
        ? parse(fs.readFileSync(readme_file_name).toString())
        : {};

    if (!readmeData) readmeData = {};
    if (!readmeData.headers) readmeData.headers = {};
    if (!readmeData.policies) readmeData.policies = {};

    let ref = readmeData.mozillaReferenceTemplates;
    let dir = `${mozilla_template_dir}/${ref}`;
    await pullGitRepository("https://github.com/mozilla/policy-templates/", ref, dir);

    // Later revisions moved the file.
    let paths = [`${dir}/docs/index.md`, `${dir}/README.md`];
    
    // This parsing highly depends on the structure of the README and needs to be
    // adjusted when its layout is changing. In the intro section we have lines like 
    // | **[`3rdparty`](#3rdparty)** |
    // Detailed descriptions are below level 3 headings (###) with potential subsections.

    // Split on ### heading to get chunks of policy descriptions.
    let file;
    for (let path of paths) {
        try {
            file = fs.readFileSync(path, 'utf8').toString();
            break;
        } catch {
        }
    }
    if (!file) {
        throw new Error(`Did not find mozilla policy template for ${tree}, ${rev}`)
    }
    let data = file.split("\n### ");

    // Shift out the header and process it.
    for (let h of data.shift().split("\n").filter(e => e.startsWith("| **[`"))) {
        let name = h
            .match(/\*\*\[(.*?)\]/)[1] // extract name from the markdown link
            .replace(/`/g, "") // unable to fix the regex to exclude those
            .replace(" -> ", "_"); // flat hierarchy

        if (!readmeData.headers[name]) {
            readmeData.headers[name] = { upstream: h };
        } else if (!readmeData.headers[name].upstream || readmeData.headers[name].upstream != h) {
            readmeData.headers[name].upstream = h;
        }
    }

    // Process policies.
    for (let p of data) {
        let lines = p.split("\n");
        let name = lines[0];
        lines[0] = `## ${name}`;

        name = name.replace(" | ", "_"); // flat hierarchy
        if (!readmeData.policies[name]) {
            readmeData.policies[name] = { upstream: lines };
        } else if (!readmeData.policies[name].upstream || stringify(readmeData.policies[name].upstream) != stringify(lines)) {
            readmeData.policies[name].upstream = lines;
        }
    }

    // Process MacOS readme.
    let mac = fs.readFileSync(`${dir}/mac/README.md`, 'utf8').toString().split("\n");

    if (!readmeData.macReadme) {
        readmeData.macReadme = { upstream: mac };
    } else if (!readmeData.macReadme.upstream || stringify(readmeData.macReadme.upstream) != stringify(mac)) {
        readmeData.macReadme.upstream = mac;
    }

    fs.writeFileSync(readme_file_name, stringify(readmeData, null, 2));
    return readmeData;
}

function getPolicySchemaFilename(branch, tree, ref) {
    return `${schema_dir}/${branch}-${tree}-${ref}.json`;
}

/**
 * Download a specific policies-schema.json file.
 * 
 * @param {string} branch - "mozilla" or "comm"
 * @param {string} tree - "central" or "esr91"
 * @param {string} revision
 * 
 * @returns - a file json object
 */
async function downloadPolicySchemaFile(branch, tree, revision) {
    let path = tree == "central" ? `${branch}-${tree}` : `releases/${branch}-${tree}`
    let folder = branch == "mozilla" ? "browser" : "mail"
    let url = `${HG_URL}/${path}/raw-file/${revision}/${folder}/components/enterprisepolicies/schemas/policies-schema.json`
    
    console.log(`Downloading ${url}`);
    let file = parse(await request(url));
    let version = (await request(`${HG_URL}/${path}/raw-file/${revision}/${folder}/config/version.txt`)).trim();
    file.version = version;
    file.revision = revision;
    fs.writeFileSync(getPolicySchemaFilename(branch, tree, revision), stringify(file, null, 2));
    return file;
}

/**
 * Download missing revisions of the policies-schema.json for the given tree.
 * 
 * @param {string} tree - "central" or "esr91"
 * @param {string} mozillaReferencePolicyRevision - the hg revision of the last
 *   known mozilla version of their policies.json
 * 
 * @returns - a data object for comm and mozilla
 */
async function downloadPolicySchemaFiles(tree, mozillaReferencePolicyRevision) {
    let data = {
        comm: {
            hgLogUrl: "",
            revisions: []
        },
        mozilla: {
            hgLogUrl: "",
            revisions: []
        },
    };

    console.log(`Processing ${tree}`);
    fs.ensureDirSync(schema_dir);

    for (let branch of ["mozilla", "comm"]) {
        let folder = branch == "mozilla" ? "browser" : "mail"
        let path = tree == "central" ? `${branch}-${tree}` : `releases/${branch}-${tree}`

        console.log(`Checking policies-schema.json revisions for ${path}`);
        data[branch].hgLogUrl = `${HG_URL}/${path}/log/tip/${folder}/components/enterprisepolicies/schemas/policies-schema.json`;
        let hgLog = await request(data[branch].hgLogUrl);
        const $ = cheerio.load(hgLog);

        // Get the revision identifier from the table cell (TODO: switch to github tree instead of parsing html).
        let revisions = [...$("body > table > tbody > tr > td:nth-child(2)")].map(element => element.children[0].data.trim());

        // For mozilla, we just need the newest and the reference revision.
        // For comm, we need all revisions to be able to extract compatibility information.
        let neededRevisions = branch == "mozilla"
            ? [revisions[0], mozillaReferencePolicyRevision]
            : revisions.slice(0, 30)


        for (let revision of neededRevisions) {
            let filename = getPolicySchemaFilename(branch, tree, revision);
            let file;
            if (!fs.existsSync(filename)) {
                file = await downloadPolicySchemaFile(branch, tree, revision);
            } else {
                file = parse(fs.readFileSync(filename).toString());

            }
            data[branch].revisions.push(file);
        }
    }
    return data;
}

/**
 * Extract flat policy names from a schema file.
 * 
 * @param {object} data - Object returned by downloadPolicySchemaFiles
 */
function extractFlatPolicyNamesFromPolicySchema(data) {
    let properties = [];
    for (let key of ["properties", "patternProperties"]) {
        if (data[key]) {
            for (let [name, entry] of Object.entries(data[key])) {
                properties.push(name)
                let subs = extractFlatPolicyNamesFromPolicySchema(entry);
                if (subs.length > 0) properties.push(...subs.map(e => `${name}_${e}`))
            }
        }
    }
    return properties;
}


/**
 * Extract compatibility information.
 */
function extractCompatibilityInformation(data, tree) {
    let absolute_max = 0;
    for (let revision of data.comm.revisions) {
        let policies = extractFlatPolicyNamesFromPolicySchema(revision);
        if (compareVersion(revision.version, absolute_max) > 0) {
            absolute_max = revision.version;
        }

        for (let raw_policy of policies) {
            let policy = raw_policy.trim().replace(/'/g, "");
            if (!gCompatibilityData[policy]) {
                gCompatibilityData[policy] = {};
            }
            if (!gCompatibilityData[policy][tree]) {
                gCompatibilityData[policy][tree] = {};
            }
            let min = gCompatibilityData[policy][tree].min || 10000;
            let max = gCompatibilityData[policy][tree].max || 0;

            if (compareVersion(revision.version, min) < 0)
                gCompatibilityData[policy][tree].min = revision.version;
            if (compareVersion(revision.version, max) > 0)
                gCompatibilityData[policy][tree].max = revision.version;
        }
    }
    for (let policy of Object.keys(gCompatibilityData)) {
        if (gCompatibilityData[policy][tree].max == absolute_max)
            delete gCompatibilityData[policy][tree].max;
    }

    if (tree == "central") {
        let policies = extractFlatPolicyNamesFromPolicySchema(data.mozilla.revisions[0]);
        for (let raw_policy of policies) {
            let policy = raw_policy.trim().replace(/'/g, "");
            if (!gCompatibilityData[policy]) {
                gCompatibilityData[policy] = {
                    unsupported: true
                };
            }
        }
    }
}

/**
 * Check for changes in the policy schema files between two revisions.
 * 
 * @param {object} data - Object returned by downloadPolicySchemaFiles
 */
function checkPolicySchemaChanges(file1, file2) {
    if (!file1?.properties || !file2?.properties)
        return;

    let keys1 = extractFlatPolicyNamesFromPolicySchema(file1);
    let keys2 = extractFlatPolicyNamesFromPolicySchema(file2);

    let added = keys2.filter(e => !keys1.includes(e));
    let removed = keys1.filter(e => !keys2.includes(e));

    let changed = keys2.filter(e => keys1.includes(e) && JSON.stringify(file2.properties[e]) != JSON.stringify(file1.properties[e]));

    return { added, removed, changed }
}

// -----------------------------------------------------------------------------

function getCompatibilityInformation(distinct, tree, policy) {
    // Get all entries found in gCompatibilityData which are related to policy.
    let entries = policy
        ? Object.keys(gCompatibilityData).filter(k => k == policy || k.startsWith(policy + "_"))
        : Object.keys(gCompatibilityData)

    // Group filtered entries by identical compat data.
    let compatInfo = [];
    for (let entry of entries) {
        // Skip unsupported policy properties, if the root policy itself is not supported as well.
        let root = entry.split("_").shift();
        if (root != entry && gCompatibilityData[entry].unsupported && gCompatibilityData[root].unsupported) continue;

        // Generate the compatibility information. Primary information is the one from this tree, 
        // but if it was backported to one version prior (92.0a1 -> 91.0) only list the backported one.
        let first = "";
        let last = "";
        let firstLong = "";
        let lastLong = "";
        if (gCompatibilityData[entry][tree]) {
            if (gCompatibilityData[entry][tree].min) {
                let added = gCompatibilityData[entry][tree].min.replace(".0a1", ".0");
                let added_parts = added.split(".");
                let backported = Object.keys(gCompatibilityData[entry])
                    .filter(e => e != tree)
                    .filter(e => gCompatibilityData[entry][e].min != gCompatibilityData[entry][tree].min)
                    .map(e => gCompatibilityData[entry][e].min)
                    .pop();

                if (backported
                    && added_parts.length == 2
                    && added_parts[1] == "0"
                    && `${parseInt(added_parts[0], 10) - 1}.0` == backported
                ) {
                    firstLong = `Thunderbird ${backported}`;
                    first = `${backported}`;
                } else if (backported) {
                    firstLong = `Thunderbird ${added}<br>(Thunderbird ${backported})`;
                    first = `${backported}, ${added}`;
                } else {
                    firstLong = `Thunderbird ${added}`;
                    first = `${added}`;
                }
            }
            last = (gCompatibilityData[entry][tree].max || "").replace(".0a1", ".0");
            lastLong = `Thunderbird ${last}`;
        }

        let key = `${first} - ${last}`;
        let distinctEntry = compatInfo.find(e => e.key == key);
        if (!distinct || !distinctEntry) {
            compatInfo.push({
                key,
                first,
                last,
                firstLong,
                lastLong,
                policies: [entry],
            })
        } else {
            distinctEntry.policies.push(entry);
        }
    }
    return compatInfo;
}

/**
 * Generate the compatibility table.
 * 
 * @param {*} compatInfo - data structure returned by getCompatibilityInformation
 * @returns - generated compatibility table
 */
function buildCompatibilityTable(compatInfo) {
    let details = [];

    const humanReadableEntry = entry => {
        return "`" + escape_code_markdown(entry
            .replace("^.*$", "[name]")
            .replace("^(", "(")
            .replace(")$", ")")) + "`";
    }

    details.push("", "| Policy/Property Name | supported since | deprecated after |", "|:--- | ---:| ---:|");
    for (let entry of compatInfo) {
        let format = entry.first ? "" : "*";
        details.push(`| ${format}${entry.policies.map(humanReadableEntry).join("<br>")}${format} | ${entry.first} | ${entry.last} |`);
    }
    details.push("");
    return details;
}

/**
 * Build the Windows ADMX/ADML files.
 */
async function buildAdmxFiles(tree, template, thunderbirdPolicies, output_dir) {
    function getNameFromKey(key) {
        const key_prefix = "Software\\Policies\\Mozilla\\Thunderbird\\";
        const key_prefix_length = key_prefix.length;
        if (key && key.length > key_prefix_length) {
            return key.substring(key_prefix_length).split("\\").join("_");
        }
    }
    function getThunderbirdPolicy(policy, element) {
        let parts = [];
        let name = getNameFromKey(policy?.attributes?.key);
        if (name) {
            parts.push(name);
        }

        if (policy?.attributes?.valueName) {
            parts.push(policy.attributes.valueName);
        }

        if (element) {
            if (element?.attributes?.key) parts = [getNameFromKey(element.attributes.key)];
            else if (element?.attributes?.valueName) parts.push(element.attributes.valueName);
        }
        let flat_policy_name = parts.join("_");
        if (thunderbirdPolicies.includes(flat_policy_name)) {
            return flat_policy_name;
        }
        return false;
    }
    
    // Read ADMX files - https://www.npmjs.com/package/xml-js
    let admx_file = fs.readFileSync(`${mozilla_template_dir}/${template.mozillaReferenceTemplates}/windows/firefox.admx`);
    let admx_obj = convert.xml2js(
        rebrand(admx_file).replace(/">">/g, '">'), // issue https://github.com/mozilla/policy-templates/issues/801
        { compact: false }
    );

    let admxPolicies = admx_obj
        .elements.find(e => e.name == "policyDefinitions")
        .elements.find(e => e.name == "policies")
        .elements;
    let distinctCompatInfo = getCompatibilityInformation(/* distinct */ true, tree);
    let used_supported_on = {};

    for (let policy of admxPolicies) {
        // Identify unsupported policies (remember, we work with flattened policy_property names here).
        // A single ADMX policy entry can include multiple elements, we need to check those individually.
        let compatInfo = [];

        let flat_policy_name = getThunderbirdPolicy(policy);
        if (!flat_policy_name) {
            policy.unsupported = true
        }

        if (policy.elements && policy.elements.find(e => e.name == "elements") && Array.isArray(policy.elements.find(e => e.name == "elements").elements)) {
            // The elements member is a structure from the xml parser, we need the elements object of
            // the elements obj with name elements here.
            let elements = policy.elements.find(e => e.name == "elements").elements.filter(e => !!getThunderbirdPolicy(policy, e));
            if (elements.length == 0) {
                delete policy.elements.find(e => e.name == "elements").elements;
                policy.unsupported = true;
            } else {
                delete policy.unsupported;
                compatInfo.push(...elements.map(e => distinctCompatInfo.findIndex(i => i.policies.includes(getThunderbirdPolicy(policy, e)))));
            }
        } else {
            compatInfo.push(distinctCompatInfo.findIndex(e => e.policies.includes(flat_policy_name)));
        }

        // Adjust supportedOn.
        // A single policy entry can contain multiple policy elements which potentially could have a different compat setting.
        // Todo: Check wether all members of policy.compatInfo are identical.		
        let compatInfoIndex = compatInfo.length > 0
            ? compatInfo[0]
            : -1

        if (compatInfoIndex != -1) {
            let name = `SUPPORTED_ID_${compatInfoIndex}`;
            policy.elements.find(e => e.name == "supportedOn").attributes.ref = name;

            if (!used_supported_on[name]) {
                used_supported_on[name] = {
                    admx: {
                        type: 'element',
                        name: 'definition',
                        attributes: { name, displayName: `$(string.${name})` },
                    },
                    adml: {
                        type: 'element',
                        name: 'string',
                        attributes: { id: name },
                        elements: [{ type: 'text', text: `${distinctCompatInfo[compatInfoIndex].firstLong} - ${distinctCompatInfo[compatInfoIndex].last ? distinctCompatInfo[compatInfoIndex].lastLong : "*"}` }]
                    },
                }
            }
        }
    }

    // Update policies.
    admx_obj
        .elements.find(e => e.name == "policyDefinitions")
        .elements.find(e => e.name == "policies")
        .elements = admxPolicies.filter(p => !p.unsupported);

    // Update supportedOn definitions.
    admx_obj
        .elements.find(e => e.name == "policyDefinitions")
        .elements.find(e => e.name == "supportedOn")
        .elements.find(e => e.name == "definitions")
        .elements = Object.keys(used_supported_on).sort().map(e => used_supported_on[e].admx);

    // Rebuild thunderbird.admx file.
    let admx_xml = convert.js2xml(admx_obj, { compact: false, spaces: 2 });
    fs.ensureDirSync(`${output_dir}/windows`);
    fs.writeFileSync(`${output_dir}/windows/thunderbird.admx`, admx_xml);

    // Copy mozilla.admx file.
    file = fs.readFileSync(`${mozilla_template_dir}/${template.mozillaReferenceTemplates}/windows/mozilla.admx`);
    fs.writeFileSync(`${output_dir}/windows/mozilla.admx`, file);



    // Handle translation files.
    let folders = fs.readdirSync(`${mozilla_template_dir}/${template.mozillaReferenceTemplates}/windows`, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    for (let folder of folders) {
        let adml_file = fs.readFileSync(`${mozilla_template_dir}/${template.mozillaReferenceTemplates}/windows/${folder}/firefox.adml`);
        let adml_obj = convert.xml2js(rebrand(adml_file), { compact: false });

        let strings = adml_obj
            .elements.find(e => e.name == "policyDefinitionResources")
            .elements.find(e => e.name == "resources")
            .elements.find(e => e.name == "stringTable")
            .elements.filter(e => !e.attributes || !e.attributes.id.startsWith("SUPPORTED_TB"));

        strings.unshift(...Object.keys(used_supported_on).sort().map(e => used_supported_on[e].adml));

        adml_obj
            .elements.find(e => e.name == "policyDefinitionResources")
            .elements.find(e => e.name == "resources")
            .elements.find(e => e.name == "stringTable")
            .elements = strings;

        let adml_xml = convert.js2xml(adml_obj, { compact: false, spaces: 2 });
        fs.ensureDirSync(`${output_dir}/windows/${folder}`);
        fs.writeFileSync(`${output_dir}/windows/${folder}/thunderbird.adml`, adml_xml);
    }
}

/**
 * Build the MasOS PLIST files.
 */
async function buildPlistFiles(template, thunderbirdPolicies, output_dir) {
    // Read PLIST files - https://www.npmjs.com/package/plist.
    let plist_file = fs.readFileSync(`${mozilla_template_dir}/${template.mozillaReferenceTemplates}/mac/org.mozilla.firefox.plist`).toString();
    
    // See https://github.com/mozilla/policy-templates/pull/1088
    plist_file = plist_file.replaceAll("&rt;","&gt;");

    let plist_obj = plist.parse(plist_file);

    function isObject(v) {
        return typeof v === 'object' && !Array.isArray(v) && v !== null;
    }
    function removeUnsupportedEntries(plist, base_name = "") {
        for (let key of Object.keys(plist)) {
            let policy_name = base_name
                ? `${base_name}_${key}`
                : key;

            if (!isObject(plist[key])) {
                // This is a final entry, check if this is a supported policy.
                if (!thunderbirdPolicies.includes(policy_name) && policy_name != "EnterprisePoliciesEnabled") {
                    delete plist[key];
                }
            } else {
                removeUnsupportedEntries(plist[key], policy_name);
                if (Object.keys(plist[key]).length == 0) {
                    delete plist[key];
                }
            }
        }
    }

    removeUnsupportedEntries(plist_obj);
    let plist_tb = plist.build(plist_obj);
    fs.ensureDirSync(`${output_dir}/mac`);
    fs.writeFileSync(`${output_dir}/mac/org.mozilla.thunderbird.plist`, rebrand(plist_tb));
    fs.writeFileSync(`${output_dir}/mac/README.md`, rebrand(template.macReadme.override || template.macReadme.upstream));
}

/**
 * Build the README file.
 */
async function buildReadme(tree, template, thunderbirdPolicies, output_dir) {
    let header = [];
    let details = [];
    let printed_main_policies = [];
    let skipped_main_policies = [];
    // Loop over all policies found in the thunderbird policy schema file and rebuild the readme.
    for (let policy of thunderbirdPolicies) {
        // Get the policy header from the template (or its override).
        if (template.headers[policy]) {
            let content = template.headers[policy].override || template.headers[policy].upstream;
            if (content && content != "skip") {
                header.push(content);
            }
            printed_main_policies.push(policy.split("_").shift());
        } else {
            // Keep track of policies which are not mentioned directly in the readme.
            let skipped = policy.split("_").shift();
            if (!skipped_main_policies.includes(skipped)) skipped_main_policies.push(skipped);
        }

        // Get the policy details from the template (or its override).
        if (template.policies[policy]) {
            let content = template.policies[policy].override || template.policies[policy].upstream;
            if (content && content != "skip") {
                details.push(...content.filter(e => !e.includes("**Compatibility:**")));
                details.push("#### Compatibility");
                let distinctCompatInfo = getCompatibilityInformation(/* distinct */ true, tree, policy);
                details.push(...buildCompatibilityTable(distinctCompatInfo));
                details.push("<br>", "");
            }
        }
    }

    for (let skipped of skipped_main_policies) {
        if (!printed_main_policies.includes(skipped)) {
            console.log(`  --> WARNING: Supported policy not present in readme: \x1b[31m '${skipped}'\x1b[0m`);
        }
    }

    let md = gTreeTemplate
        .replace("__name__", template.name)
        .replace("__desc__", template.desc.join("\n"))
        .replace("__list_of_policies__", rebrand(header))
        .replace("__details__", rebrand(details));

    fs.ensureDirSync(output_dir);
    fs.writeFileSync(`${output_dir}/README.md`, md);
    console.log();
}

/**
 * Generate the Thunderbird templates.
 * 
 * @param {*} settings 
 *  settings.tree - "central" or "esr91"
 *  settings.mozillaReferencePolicyRevision - the hg revision of the last known
 *    mozilla version of their policies.json
 */
async function buildThunderbirdTemplates(settings) {
    // Download schema from https://hg.mozilla.org/
    let data = await downloadPolicySchemaFiles(
        settings.tree,
        settings.mozillaReferencePolicyRevision,
    );
    if (!data) {
        return;
    }
    
    let output_dir = `${build_dir}/${settings.tree}`;
    let mozillaReferencePolicyFile = data.mozilla.revisions.find(r => r.revision == settings.mozillaReferencePolicyRevision);
    if (!mozillaReferencePolicyFile) {
        console.error(`Unknown policy revision ${settings.mozillaReferencePolicyRevision} set for mozilla-${settings.tree}.\nCheck ${data.mozilla.hgLogUrl}`);
        return;
    }

    // Find supported policies.
    extractCompatibilityInformation(data, settings.tree);
    let supportedPolicies = 
        getCompatibilityInformation(
            /* distinct */ true, settings.tree
        ).filter(e => e.first != "");

    // Get changes in the schema files and log them.
    if (mozillaReferencePolicyFile.revision != data.mozilla.revisions[0].revision) {
        settings.mozillaReferencePolicyRevision = data.mozilla.revisions[0].revision;
        let m_m_changes = checkPolicySchemaChanges(mozillaReferencePolicyFile, data.mozilla.revisions[0]);
        if (m_m_changes) {
            console.log();
            console.log(` Mozilla has released a new policy revision for mozilla-${settings.tree}!`);
            console.log(` Do those changes need to be ported to Thunderbird?`);
            if (m_m_changes.added.length > 0) {
                console.log(` - Mozilla added the following policies: [`);
                // Indicate if the current tree supports any of the added policies.
                // This can happen, if the revision config file has not yet been
                // committed, and an older revision was used to detect changes in
                // the policy files.
                for (let added of m_m_changes.added) {
                    let isSupported = supportedPolicies.find(e => e.policies.includes(added));
                    if (isSupported) {
                        console.log(`\x1b[32m     '${added}'\x1b[0m`)
                    } else {
                        console.log(`\x1b[31m     '${added}'\x1b[0m, \x1b[31m Not supported by ${settings.tree} \x1b[0m`)
                    }
                }
                console.log(`   ]\n`);
            }
            if (m_m_changes.removed.length > 0) {
                console.log(` - Mozilla removed the following policies: [`);
                m_m_changes.removed.forEach(e => console.log(`\x1b[33m     '${e}'\x1b[0m`));
                console.log(`   ]\n`);
            }
            if (m_m_changes.changed.length > 0) {
                console.log(` - Mozilla changed properties of the following policies: [`);
                m_m_changes.changed.forEach(e => console.log(`\x1b[33m     '${e}'\x1b[0m`));
                console.log(`   ]\n`);
            }
            
            console.log();
            console.log(` - currently acknowledged policy revision (${mozillaReferencePolicyFile.revision} / ${mozillaReferencePolicyFile.version}): \n\t${path.resolve(getPolicySchemaFilename("mozilla", settings.tree, mozillaReferencePolicyFile.revision))}\n`);
            console.log(` - latest available policy revision (${data.mozilla.revisions[0].revision} / ${data.mozilla.revisions[0].version}): \n\t${path.resolve(getPolicySchemaFilename("mozilla", settings.tree, data.mozilla.revisions[0].revision))}\n`);
            console.log(` - hg change log for mozilla-${settings.tree}: \n\t${data.mozilla.hgLogUrl}\n`);
            console.log(`Create bugs on Bugzilla for all policies which should be ported to Thunderbird and then check-in the updated ${revisions_json_write_path} file to acknowledge the reported changes.`);
            console.log(`Once the reported changes are acknowledged, they will not be reported again.`);
            console.log();
        }
    }

    let template = await parseMozillaPolicyTemplate(settings.tree);
    let thunderbirdPolicies = Object.keys(gCompatibilityData)
        .filter(p => !gCompatibilityData[p].unsupported)
        .sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

    await buildReadme(settings.tree, template, thunderbirdPolicies, output_dir);
    await buildAdmxFiles(settings.tree, template, thunderbirdPolicies, output_dir);
    await buildPlistFiles(template, thunderbirdPolicies, output_dir);

    if (settings.tree == "central") {
        gMainTemplateEntries.unshift(` * [${template.name}](templates/${settings.tree})`);
    } else {
        gMainTemplateEntries.unshift(` * [${template.name}](templates/${settings.tree}) (${template.mozillaReferenceTemplates}) `);
    }
}

async function main() {
    // Checkout the current state of the repo, to identify new changes.
    await pullGitRepository("https://github.com/thunderbird/policy-templates", "master", state_dir);

    // Load revision data, to see if any new revisions have been added to the tree.
    let revisionData = [];
    let readRevisionData = fs.existsSync(revisions_json_read_path)
        ? parse(fs.readFileSync(revisions_json_read_path).toString())
        : [];
    // A starter set, if the revision config file is missing or incomplete.
    let defaultRevisionData = [
        {
            tree: "esr68",
            mozillaReferencePolicyRevision: "1b0a29b456b432d1c8bef09c233b84205ec9e13c",
        },
        {
            tree: "esr78",
            mozillaReferencePolicyRevision: "a8c4670b6ef144a0f3b6851c2a9d4bbd44fc032a",
        },
        {
            tree: "esr91",
            mozillaReferencePolicyRevision: "02bf5ca05376f55029da3645bdc6c8806e306e80",

        },
        {
            tree: "esr102",
            mozillaReferencePolicyRevision: "02bf5ca05376f55029da3645bdc6c8806e306e80",
        },
        {
            tree: "esr115",
            mozillaReferencePolicyRevision: "02bf5ca05376f55029da3645bdc6c8806e306e80",
        },
        {
            tree: "central",
            mozillaReferencePolicyRevision: "02bf5ca05376f55029da3645bdc6c8806e306e80",
        }
    ];

    for (let defaultRevision of defaultRevisionData) {
        let readRevision = readRevisionData.find(r => r.tree == defaultRevision.tree);
        let revision = readRevision || defaultRevision;
        revisionData.push(revision);
        await buildThunderbirdTemplates(revision);
    }

    // Update files.
    fs.writeFileSync(compatibility_json_path, stringify(gCompatibilityData, null, 2));
    fs.writeFileSync(revisions_json_write_path, stringify(revisionData, null, 2));

    let compatInfo = getCompatibilityInformation(/* distinct */ false, "central");
    compatInfo.sort((a, b) => {
        let aa = a.policies.join("<br>");
        let bb = b.policies.join("<br>");
        if (aa < bb) return -1;
        if (aa > bb) return 1;
        return 0;
    });

    fs.writeFileSync(main_readme, gMainTemplate
        .replace("__list__", gMainTemplateEntries.join("\n"))
        .replace("__compatibility__", buildCompatibilityTable(compatInfo).join("\n"))
    );
}

main();
