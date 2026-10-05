import pathUtils from "node:path";

// The folder of the generator, independent of the working directory (the
// generator and the tools in tools/ use the same files).
const GENERATOR_DIR_PATH = pathUtils.join(import.meta.dirname, "..");

export const DOWNLOAD_CACHE_FILE = pathUtils.join(GENERATOR_DIR_PATH, "download_cache.json");

// The oldest ESR branch of the docs: older ESR branches of the product's
// repository are neither built nor used for the compatibility (backports),
// and policies removed before this version aren't listed. Old ESR branches
// stay in the repository after their end of life, so raise it when an ESR
// reaches its end of life.
export const OLDEST_ESR = 128;

// The first version whose policy engine parses a string as JSON where the
// schema says "contentMediaType" (Bug 2044429: 154, uplifted to ESR 153).
// Older schemas can only mark JSON values with the old type "JSON", which
// changes what the code accepts. From this version on, the old type "JSON" is
// no longer understood.
export const JSON_STRING_VERSION = 153;

export const GITHUB_API_URL = "https://api.github.com";
export const GITHUB_RAW_URL = "https://raw.githubusercontent.com";

// Mozilla's base ADMX/ADML files, which define the "Mozilla" category used by
// the templates of all Mozilla products. They are shipped unchanged.
export const MOZILLA_POLICY_TEMPLATES_REPOSITORY = "mozilla/policy-templates";
export const MOZILLA_POLICY_TEMPLATES_BRANCH = "master";
export const MOZILLA_ADMX_PATH = "windows/mozilla.admx";
export const MOZILLA_ADML_PATH = "windows/en-US/mozilla.adml";

// The ADMX controls which are labelled with the title of their setting, by
// kind. The others, and the controls of settings without title, show the name
// of the setting, which matches the docs and policies.json. See "Labels of the
// ADMX controls" in the README.
export const ADMX_TITLE_LABELS = {
    // A list box: edited in a dialog of its own, which doesn't show the name
    // of the ADMX policy.
    list: true,
    // A control in a group (several settings in one ADMX policy): the name of
    // the ADMX policy only names the group.
    group: true,
    // The only control of its ADMX policy: its title is already the name of
    // the ADMX policy, shown right above it.
    single: false,
};

// The height in lines of the box for a JSON value in the ADMX (Windows
// default: 3).
export const ADMX_JSON_BOX_HEIGHT = 12;
