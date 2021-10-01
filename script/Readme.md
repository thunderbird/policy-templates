update_policy_templates.js
==========================

This script runs on the source trees `esr68`,`esr78`,`esr91` and `central` and is doing the following for each:

* check for new revisions of the `policies-schema.json` file in `mozilla-${tree}` and report newly added policies, which Thunderbird might want to port
* parse the `policies-schema.json` file in `comm-${tree}` to see what policies are supported by Thunderbird
* build the README.md file for Thunderbird by parsing the corresponding mozilla template and removing whatever is not supported (support for free text specified in `readme-${tree}.json`)
* check if all supported policies are actually mentioned in the generated readme
* adds a detailed compatibility table to each policy section
* clone the `firefox.admx` files as `thunderbird.admx` and remove whatever is not supported by Thunderbird
* create a list of unsupported firefox policies
* adjust mac templates

This script is not yet doing the following:
* update the compatibility information in the `supportedOn` field of the ADMX files
* generate the `thunderbird.admx` file directly from `policies-schema.json` (which means we cannot add our own policies yet)

Execute the script as follows:

```
npm install
npm update_policy_templates.js
```
