## Enterprise policy descriptions and templates for __name__

%ifdef MAIN
**These policies are in active development and may contain changes that do not
work with current versions of Firefox.**

%endif
Policies can be specified by creating a file called `policies.json`:
* Windows: create a directory called `distribution` where `firefox.exe` is
  located and place the file there.
* Mac: place the file into `Firefox.app/Contents/Resources/distribution`.
* Linux: place the file into `firefox/distribution`, where `firefox` is the
  installation directory for Firefox, which varies by distribution. You can
  also specify a system-wide policy by placing the file in
  `/etc/firefox/policies`.

The `policies.json` must use the UTF-8 encoding.

Alternatively, policies can be specified via platform-specific methods:
* Windows: [firefox.admx](__templates_repository__/tree/master/docs/firefox/policies/__branch__/admx) - use with Group Policy or Intune
* Mac: [org.mozilla.firefox.plist](__templates_repository__/blob/master/docs/firefox/policies/__branch__/plist/org.mozilla.firefox.plist) - use with configuration profiles

This document provides examples in these formats for all policies.


### Windows: installing the ADMX templates

The Firefox policies are placed in the "Mozilla" category, which is defined by
Mozilla's `mozilla.admx`. Both templates are needed. The `mozilla.admx`
provided here is Mozilla's unchanged file, and may already be installed together
with the Thunderbird templates.

* [firefox.admx](__docs_url__/policies/__branch__/admx/firefox.admx) and
  [en-US/firefox.adml](__docs_url__/policies/__branch__/admx/en-US/firefox.adml)
* [mozilla.admx](__docs_url__/policies/__branch__/admx/mozilla.admx) and
  [en-US/mozilla.adml](__docs_url__/policies/__branch__/admx/en-US/mozilla.adml)

Installation:

* Group Policy: copy `firefox.admx` and `mozilla.admx` into
  `C:\Windows\PolicyDefinitions` (or the Central Store), and
  `firefox.adml` and `mozilla.adml` into its `en-US` folder.
* Intune (Devices › Configuration › Import ADMX): import `mozilla.admx` with
  `mozilla.adml` first, then `firefox.admx` with `firefox.adml`, and
  create a profile of type Templates › Imported Administrative templates. To
  update, delete the profiles and the imported `firefox.admx`, and import
  the new `firefox.admx` with `firefox.adml`. `mozilla.admx` stays
  imported.

| Policy Name | Description
|:--- |:--- |
__list_of_policies__

__details__

