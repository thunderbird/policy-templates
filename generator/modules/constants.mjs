export const PERSISTENT_SCHEMA_CACHE_FILE = 'persistent_schema_cache.json';
export const TEMPORARY_SCHEMA_CACHE_FILE = 'temporary_schema_cache.json';

export const DOCS_TEMPLATES_DIR_PATH = "../docs/templates";
export const DOCS_README_PATH = "../docs/README.md";

export const GITHUB_API_URL = "https://api.github.com";
export const GITHUB_RAW_URL = "https://raw.githubusercontent.com";

export const THUNDERBIRD_REPOSITORY = "thunderbird/thunderbird-desktop";
export const FIREFOX_REPOSITORY = "mozilla-firefox/firefox";

export const THUNDERBIRD_POLICIES_SCHEMA_PATH = "mail/components/enterprisepolicies/schemas/policies-schema.json";
export const THUNDERBIRD_POLICIES_YAML_PATH = "mail/components/enterprisepolicies/documentation/policies.yaml";
export const THUNDERBIRD_VERSION_PATH = "mail/config/version.txt";
export const FIREFOX_POLICIES_SCHEMA_PATH = "browser/components/enterprisepolicies/schemas/policies-schema.json";

// The Firefox branch used to find policies which are not supported by Thunderbird.
export const FIREFOX_REFERENCE_BRANCH = "main";

export const BRANCH_PREFIXES = {
    main: "Thunderbird Daily",
    beta: "Thunderbird Beta",
    release: "Thunderbird",
    esr: "Thunderbird ESR",
};

export const MAIN_TEMPLATE = `## Enterprise policy descriptions and templates for Thunderbird

While the templates for the most recent version of Thunderbird will probably also
work with older releases of Thunderbird, they may contain new policies which are
not supported in older releases. We suggest to use the templates which correspond
to the version of Thunderbird you are actually deploying.

__list__

## List of supported policies

The following table states for each policy, when Thunderbird started to support it,
or when it has been deprecated. It also includes all policies currently supported
by Firefox, which are not supported by Thunderbird.

__compatibility__

`

export const TREE_TEMPLATE = `## Enterprise policy descriptions and templates for __name__

__desc__

| Policy Name | Description
|:--- |:--- |
__list_of_policies__

__details__

`;

export const DESC_DEFAULT_DAILY_TEMPLATE = `**These policies are in active development and might contain changes that do
not work with current release or ESR versions of Thunderbird.**

`;
