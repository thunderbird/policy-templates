## Enterprise policy descriptions and templates for __name__

%ifdef MAIN
**These policies are in active development and might contain changes that do
not work with current release or ESR versions of Thunderbird.**

%endif
Policies can be specified by creating a file called `policies.json`:
* Windows: place the file in a directory called `distribution` in the same
  directory where `thunderbird.exe` is located.
* Mac: place the file into `Thunderbird.app/Contents/Resources/distribution`.
* Linux: place the file into `thunderbird/distribution`, where `thunderbird`
  is the installation directory for Thunderbird. You can also specify a system-wide
  policy by placing the file in `/etc/thunderbird/policies`.

Alternatively, policies can be specified via platform-specific methods:
* Windows: [thunderbird.admx](__templates_repository__/tree/master/docs/policies/__branch__/admx) - use with [group policy templates](https://support.mozilla.org/en-US/kb/customizing-thunderbird-using-group-policy-windows)
* Mac: [org.mozilla.thunderbird.plist](__templates_repository__/blob/master/docs/policies/__branch__/plist/org.mozilla.thunderbird.plist) - use with [configuration profiles](https://support.mozilla.org/en-US/kb/managing-policies-macos-desktops)

This document provides examples in these formats for all policies.


### Windows: installing the ADMX templates

The Thunderbird policies are placed in the "Mozilla" category, which is defined
by Mozilla's `mozilla.admx`. Both templates are needed. The `mozilla.admx`
provided here is Mozilla's unchanged file, and may already be installed together
with the Firefox templates.

* [thunderbird.admx](__docs_url__/policies/__branch__/admx/thunderbird.admx) and
  [en-US/thunderbird.adml](__docs_url__/policies/__branch__/admx/en-US/thunderbird.adml)
* [mozilla.admx](__docs_url__/policies/__branch__/admx/mozilla.admx) and
  [en-US/mozilla.adml](__docs_url__/policies/__branch__/admx/en-US/mozilla.adml)

Installation:

* Group Policy: copy `thunderbird.admx` and `mozilla.admx` into
  `C:\Windows\PolicyDefinitions` (or the Central Store), and
  `thunderbird.adml` and `mozilla.adml` into its `en-US` folder.
* Intune (Devices › Configuration › Import ADMX): import `mozilla.admx` with
  `mozilla.adml` first, then `thunderbird.admx` with `thunderbird.adml`, and
  create a profile of type Templates › Imported Administrative templates. To
  update, delete the profiles and the imported `thunderbird.admx`, and import
  the new `thunderbird.admx` with `thunderbird.adml`. `mozilla.admx` stays
  imported.

| Policy Name | Description
|:--- |:--- |
__list_of_policies__

__details__

