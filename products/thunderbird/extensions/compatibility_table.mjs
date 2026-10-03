/**
 * The compatibility table of the overview (__js:compatibility_table__ in
 * templates/overview.md): for each policy and setting of Thunderbird the
 * version since when it is supported and when it was removed, and whether
 * Firefox supports it. The policies which only Firefox supports are listed as
 * well, with ❌ in the Thunderbird column.
 */

const FIREFOX_SCHEMA_URL =
    "https://raw.githubusercontent.com/mozilla-firefox/firefox/main/browser/components/enterprisepolicies/schemas/policies-schema.json";

// The flat policy names of a policy schema, following the naming rule of the
// compatibility data of the generator (extractFlatPolicyNamesFromPolicySchema()
// and getPatternNames() in generator/modules/compatibility.mjs), so the names
// of both products can be compared: nested settings are joined by "_", a
// pattern matching any name (optionally excluding some) is "[name]", and a
// pattern of plain alternatives like "^(a|b)$" is each of its names.
const CATCH_ALL_PATTERN = /^\^(\(\?!.*\))?\.\*\$$/;

function getPatternNames(pattern) {
    if (CATCH_ALL_PATTERN.test(pattern)) {
        return ["[name]"];
    }
    const alternatives = pattern.match(/^\^\(([\w-]+(?:\|[\w-]+)*)\)\$$/);
    return alternatives ? alternatives[1].split("|") : [pattern];
}

function getPolicyNames(node) {
    const names = [];
    for (const key of ["properties", "patternProperties"]) {
        for (const [pattern, child] of Object.entries(node[key] ?? {})) {
            const own = key == "patternProperties" ? getPatternNames(pattern) : [pattern];
            const subs = getPolicyNames(child);
            for (const name of own) {
                names.push(name, ...subs.map(sub => `${name}_${sub}`));
            }
        }
    }
    return names.map(name => name.trim().replace(/'/g, ""));
}

// A policy name as inline code, for a Markdown table.
const code = name => "`" + name.replace("^(", "(").replace(")$", ")").replaceAll("|", "\\|") + "`";

export default async function ({ compatibility, cachedFetch }) {
    const text = await cachedFetch(FIREFOX_SCHEMA_URL);
    if (text === null) {
        throw new Error(`Firefox's policy schema does not exist at ${FIREFOX_SCHEMA_URL}.`);
    }
    const firefox = new Set(getPolicyNames(JSON.parse(text)));

    const rows = compatibility.map(row => ({ ...row, firefox: firefox.has(row.name) }));
    const thunderbird = new Set(compatibility.map(row => row.name));
    for (const name of firefox) {
        // A Firefox-only setting is not listed if its policy is Firefox-only too.
        const policy = name.split("_")[0];
        if (!thunderbird.has(name) && (policy == name || thunderbird.has(policy))) {
            rows.push({ name, first: "", last: "", firefox: true });
        }
    }
    rows.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

    return [
        "",
        "| Policy/Property Name | Thunderbird | Removed after | Firefox |",
        "|:--- | ---:| ---:|:---:|",
        ...rows.map(row => `| ${code(row.name)} | ${row.first || "❌"} | ${row.last} | ${row.firefox ? "✅" : "❌"} |`),
        "",
    ].join("\n");
}
