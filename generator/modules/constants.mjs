export const STATE_DIR_PATH = "./data/gitstate";
export const SCHEMA_DIR_PATH = "./data/schema";
export const MOZILLA_TEMPLATE_DIR_PATH = "./data/mozilla-policy-templates";

export const BUILD_DIR_PATH = "../docs/templates";
export const MAIN_README_PATH = "../docs/README.md";

export const README_JSON_PATH = "../state/readme_#tree#.json";

export const RELATIVE_COMPATIBILITY_JSON_PATH = `state/compatibility.json`;
export const RELATIVE_REVISIONS_JSON_PATH = `state/revisions.json`;

export const HG_URL = `https://hg-edge.mozilla.org`;
export const BUILD_HUB_URL = "buildhub.moz.tools";

export const gMainTemplate = `## Enterprise policy descriptions and templates for Thunderbird

While the templates for the most recent version of Thunderbird will probably also work with older releases of Thunderbird, they may contain new policies which are not supported in older releases. We suggest to use the templates which correspond to the highest version of Thunderbird you are actually deploying.

__list__

<br>

## List of supported policies

The following table states for each policy, when Thunderbird started to support it, or when it has been deprecated. It also includes all policies currently supported by Firefox, which are not supported by Thunderbird.

__compatibility__

`

export const gTreeTemplate = `## Enterprise policy descriptions and templates for __name__

__desc__

<br>

| Policy Name | Description
|:--- |:--- |
__list_of_policies__

<br>

__details__

`;

// -----------------------------------------------------------------



const COMM_GECKO_REV = ".gecko_rev.yml";
