update_policy_templates.js
==========================

This script runs on the source trees `esr68`,`esr78`,`esr91`,`esr102`,`esr115` and `central`, and is doing the following for each:

* Check for new revisions of the `policies-schema.json` file in `mozilla-${tree}` and report newly added policies, which Thunderbird might want to port.
* Parse the `policies-schema.json` file in `comm-${tree}` to see what policies are supported by Thunderbird.
* Build the README.md file for Thunderbird by parsing the corresponding mozilla template and removing whatever is not supported:
    - The upstream README.md file is parsed into `readme_${tree}.json` into an `upstream` property per policy, exposing all differences from the last time the script was run.
    - The `readme_${tree}.json` file also offers so set an `override` property per policy, to change the wording for Thunderbird. Setting the `override` property to `skip` will not add the policy to Thunderbird's documentation.
    - One can manually add entries (policies) to `readme_${tree}.json`, which do not exist upstream.

* Check if all supported policies are actually mentioned in the generated readme.
* Adds a detailed compatibility table to each policy section.
* Clone the `firefox.admx` files as `thunderbird.admx` and remove whatever is not supported by Thunderbird.
* Update the compatibility information in the `supportedOn` field of the ADMX files.
* Create a list of unsupported firefox policies.
* Adjust mac templates.

This script is not yet doing the following:
* generate the `thunderbird.admx` file directly from `policies-schema.json` (which means we cannot add our own policies yet)

Running the script to check for new policies
============================================

Execute the script as follows:

```
npm install
node update_policy_templates.js
```

The final output may include the following sections:

```
 Mozilla has released a new policy revision for mozilla-central!
 Do those changes need to be ported to Thunderbird?
 - Mozilla added the following policies: [
     'DisabledCiphers_TLS_CHACHA20_POLY1305_SHA256',  Not supported by central
     'DisabledCiphers_TLS_AES_128_GCM_SHA256',  Not supported by central
     'DisabledCiphers_TLS_AES_256_GCM_SHA384',  Not supported by central
     'DisableEncryptedClientHello',  Not supported by central
     'ExtensionSettings_^.*$_private_browsing',
     'HttpAllowlist',  Not supported by central
     'HttpsOnlyMode',  Not supported by central
     'MicrosoftEntraSSO',  Not supported by central
     'PostQuantumKeyAgreementEnabled',  Not supported by central
     'PrivateBrowsingModeAvailability',  Not supported by central
     'UserMessaging_SkipTermsOfUse',  Not supported by central
     'UserMessaging_FirefoxLabs',  Not supported by central
   ]
 - Mozilla removed the following policies: [
     'ContentAnalysis_DefaultAllow'
   ]
 
 - Mozilla changed properties of the following policies: [
     'ContentAnalysis',
     'DisabledCiphers',
     'ExtensionSettings',
     'UserMessaging'
   ]

 - currently acknowledged policy revision (b501a3a06e1c572ec1d9e7366828dae0f77c6aa2 / 126.0a1):
        /mnt/c/Users/John/Documents/GitHub/policy-templates-tb/generator/data/schema/mozilla-central-b501a3a06e1c572ec1d9e7366828dae0f77c6aa2.json

 - latest available policy revision (fe6e070cd6b63ecd1f8ab30f12f6274e64210d66 / 138.0a1):
        /mnt/c/Users/John/Documents/GitHub/policy-templates-tb/generator/data/schema/mozilla-central-fe6e070cd6b63ecd1f8ab30f12f6274e64210d66.json

 - hg change log for mozilla-central:
        https://hg-edge.mozilla.org/mozilla-central/log/tip/browser/components/enterprisepolicies/schemas/policies-schema.json

Create bugs on Bugzilla for all policies which should be ported to Thunderbird and then check-in the updated ./revisions.json file to acknowledge the reported changes. Once the reported changes are acknowledged, they will not be reported again.

Updating https://github.com/mozilla/policy-templates/ (master)
  --> WARNING: Supported policy not present in readme: InAppNotification
```

From this status report one can extract:
* which policies where added by Firefox and are not yet supported by Thunderbird
* which policies were removed
* which policies were modified and may need to be updated for Thunderbird (including added or removed sub-policies)
* which policies are supported by Thunderbird but not yet documented
