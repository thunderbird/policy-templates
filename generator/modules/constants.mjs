export const GIT_CHECKOUT_DIR_PATH = "../data/gitstate";
export const SCHEMA_DIR_PATH = "../data/schema";
export const MOZILLA_TEMPLATE_DIR_PATH = "../data/mozilla-policy-templates";

export const DOCS_TEMPLATES_DIR_PATH = "../docs/templates";
export const DOCS_README_PATH = "../docs/README.md";
export const CONFIG_README_PATH = "../config/readme_#tree#.json";

export const UPSTREAM_README_PATH = "upstream-state/readme_#tree#.json";
export const UPSTREAM_REVISIONS_PATH = "upstream-state/revisions.json";

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

<br>

## List of supported policies

The following table states for each policy, when Thunderbird started to support it,
or when it has been deprecated. It also includes all policies currently supported
by Firefox, which are not supported by Thunderbird.

__compatibility__

`

export const TREE_TEMPLATE = `## Enterprise policy descriptions and templates for __name__
__desc__

<br>

| Policy Name | Description
|:--- |:--- |
__list_of_policies__

<br>

__details__

`;

export const DESC_DEFAULT_DAILY_TEMPLATE = `
**These policies are in active development and might contain changes that do
not work with current release or ESR versions of Thunderbird.**`;

export const DESC_DEFAULT_TEMPLATE = `
Policies can be specified by creating a file called \`policies.json\`:
 * Windows: place the file in a directory called \`distribution\` in the same
   directory where \`thunderbird.exe\` is located.
 * Mac: place the file into \`Thunderbird.app/Contents/Resources/distribution\`
 * Linux: place the file into \`thunderbird/distribution\`, where \`thunderbird\`
   is the installation directory for Thunderbird. You can also specify a system-wide
   policy by placing the file in \`/etc/thunderbird/policies\`.

Alternatively, policies can be specified via platform specific methods:
 * Windows: [thunderbird.admx](https://github.com/thunderbird/policy-templates/tree/master/docs/templates/#tree#/windows) — use with [group policy templates](https://support.mozilla.org/en-US/kb/customizing-firefox-using-group-policy-windows) or [intune](https://support.mozilla.org/kb/managing-firefox-intune)
 * Mac: [org.mozilla.thunderbird.plist](https://github.com/thunderbird/policy-templates/blob/master/docs/templates/#tree#/mac/org.mozilla.thunderbird.plist) — use with [configuration profiles](https://support.mozilla.org/en-US/kb/managing-policies-macos-desktops)

This document provides for all policies examples for the mentioned formats.`
