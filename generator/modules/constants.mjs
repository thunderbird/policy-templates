export const GIT_CHECKOUT_DIR_PATH = "../data/gitstate";
export const MOZILLA_TEMPLATE_DIR_PATH = "../data/mozilla-policy-templates";

export const PERSISTENT_SCHEMA_CACHE_FILE = 'persistent_schema_cache.json';
export const TEMPORARY_SCHEMA_CACHE_FILE = 'temporary_schema_cache.json';

export const DOCS_TEMPLATES_DIR_PATH = "../docs/templates";
export const DOCS_README_PATH = "../docs/README.md";
export const YAML_CONFIG_PATH = "../config/#tree#.yaml";

export const UPSTREAM_README_PATH = "upstream/state_#tree#.yaml";
export const UPSTREAM_REVISIONS_PATH = "upstream/revisions.json";

export const HG_URL = `https://hg-edge.mozilla.org`;
export const BUILD_HUB_URL = "buildhub.moz.tools";

export const SOURCE_PATH_POLICIES_SCHEMA_JSON = "components/enterprisepolicies/schemas/policies-schema.json";
export const SOURCE_PATH_VERSION_TXT = "config/version.txt"

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
