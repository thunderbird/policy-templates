## Enterprise policy descriptions and templates for Firefox ESR 140.17.1

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
* Windows: [firefox.admx](https://github.com/thunderbird/policy-templates/tree/master/docs/firefox/policies/esr140/admx) - use with Group Policy or Intune
* Mac: [org.mozilla.firefox.plist](https://github.com/thunderbird/policy-templates/blob/master/docs/firefox/policies/esr140/plist/org.mozilla.firefox.plist) - use with configuration profiles

This document provides examples in these formats for all policies.


### Windows: installing the ADMX templates

The Firefox policies are placed in the "Mozilla" category, which is defined by
Mozilla's `mozilla.admx`. Both templates are needed. The `mozilla.admx`
provided here is Mozilla's unchanged file, and may already be installed together
with the Thunderbird templates.

* [firefox.admx](https://thunderbird.github.io/policy-templates/firefox/policies/esr140/admx/firefox.admx) and
  [en-US/firefox.adml](https://thunderbird.github.io/policy-templates/firefox/policies/esr140/admx/en-US/firefox.adml)
* [mozilla.admx](https://thunderbird.github.io/policy-templates/firefox/policies/esr140/admx/mozilla.admx) and
  [en-US/mozilla.adml](https://thunderbird.github.io/policy-templates/firefox/policies/esr140/admx/en-US/mozilla.adml)

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
| **[`3rdparty`](#3rdparty)** | 
| **[`AllowedDomainsForApps`](#alloweddomainsforapps)** | 
| **[`AllowFileSelectionDialogs`](#allowfileselectiondialogs)** | 
| **[`AppAutoUpdate`](#appautoupdate)** | 
| **[`AppUpdatePin`](#appupdatepin)** | 
| **[`AppUpdateURL`](#appupdateurl)** | 
| **[`Authentication`](#authentication)** | 
| **[`AutofillAddressEnabled`](#autofilladdressenabled)** | 
| **[`AutofillCreditCardEnabled`](#autofillcreditcardenabled)** | 
| **[`AutoLaunchProtocolsFromOrigins`](#autolaunchprotocolsfromorigins)** | 
| **[`BackgroundAppUpdate`](#backgroundappupdate)** | 
| **[`BlockAboutAddons`](#blockaboutaddons)** | 
| **[`BlockAboutConfig`](#blockaboutconfig)** | 
| **[`BlockAboutProfiles`](#blockaboutprofiles)** | 
| **[`BlockAboutSupport`](#blockaboutsupport)** | 
| **[`Bookmarks`](#bookmarks)** | 
| **[`CaptivePortal`](#captiveportal)** | 
| **[`Certificates`](#certificates)** | 
| **[`Certificates -> ImportEnterpriseRoots`](#certificates--importenterpriseroots)** | 
| **[`Certificates -> Install`](#certificates--install)** | 
| **[`Containers`](#containers)** | 
| **[`ContentAnalysis`](#contentanalysis)** | 
| **[`Cookies`](#cookies)** | 
| **[`DefaultDownloadDirectory`](#defaultdownloaddirectory)** | 
| **[`DisableAccounts`](#disableaccounts)** | 
| **[`DisableAppUpdate`](#disableappupdate)** | 
| **[`DisableBuiltinPDFViewer`](#disablebuiltinpdfviewer)** | 
| **[`DisabledCiphers`](#disabledciphers)** | 
| **[`DisableDefaultBrowserAgent`](#disabledefaultbrowseragent)** | 
| **[`DisableDeveloperTools`](#disabledevelopertools)** | 
| **[`DisableEncryptedClientHello`](#disableencryptedclienthello)** | 
| **[`DisableFeedbackCommands`](#disablefeedbackcommands)** | 
| **[`DisableFirefoxAccounts`](#disablefirefoxaccounts)** | 
| **[`DisableFirefoxScreenshots`](#disablefirefoxscreenshots)** | 
| **[`DisableFirefoxStudies`](#disablefirefoxstudies)** | 
| **[`DisableForgetButton`](#disableforgetbutton)** | 
| **[`DisableFormHistory`](#disableformhistory)** | 
| **[`DisableMasterPasswordCreation`](#disablemasterpasswordcreation)** | 
| **[`DisablePasswordReveal`](#disablepasswordreveal)** | 
| **[`DisablePocket`](#disablepocket)** | 
| **[`DisablePrivateBrowsing`](#disableprivatebrowsing)** | 
| **[`DisableProfileImport`](#disableprofileimport)** | 
| **[`DisableProfileRefresh`](#disableprofilerefresh)** | 
| **[`DisableSafeMode`](#disablesafemode)** | 
| **[`DisableSecurityBypass`](#disablesecuritybypass)** | 
| **[`DisableSetDesktopBackground`](#disablesetdesktopbackground)** | 
| **[`DisableSystemAddonUpdate`](#disablesystemaddonupdate)** | 
| **[`DisableTelemetry`](#disabletelemetry)** | 
| **[`DisableThirdPartyModuleBlocking`](#disablethirdpartymoduleblocking)** | 
| **[`DisplayBookmarksToolbar`](#displaybookmarkstoolbar)** | 
| **[`DisplayMenuBar`](#displaymenubar)** | 
| **[`DNSOverHTTPS`](#dnsoverhttps)** | 
| **[`DontCheckDefaultBrowser`](#dontcheckdefaultbrowser)** | 
| **[`DownloadDirectory`](#downloaddirectory)** | 
| **[`EnableTrackingProtection`](#enabletrackingprotection)** | 
| **[`EncryptedMediaExtensions`](#encryptedmediaextensions)** | 
| **[`ExemptDomainFileTypePairsFromFileTypeDownloadWarnings`](#exemptdomainfiletypepairsfromfiletypedownloadwarnings)** | 
| **[`Extensions`](#extensions)** | 
| **[`ExtensionSettings`](#extensionsettings)** | 
| **[`ExtensionUpdate`](#extensionupdate)** | 
| **[`FirefoxHome`](#firefoxhome)** | 
| **[`FirefoxSuggest`](#firefoxsuggest)** | 
| **[`GenerativeAI`](#generativeai)** | 
| **[`GoToIntranetSiteForSingleWordEntryInAddressBar`](#gotointranetsiteforsinglewordentryinaddressbar)** | 
| **[`Handlers`](#handlers)** | 
| **[`HardwareAcceleration`](#hardwareacceleration)** | 
| **[`Homepage`](#homepage)** | 
| **[`HttpAllowlist`](#httpallowlist)** | 
| **[`HttpsOnlyMode`](#httpsonlymode)** | 
| **[`InstallAddonsPermission`](#installaddonspermission)** | 
| **[`LegacyProfiles`](#legacyprofiles)** | 
| **[`LegacySameSiteCookieBehaviorEnabled`](#legacysamesitecookiebehaviorenabled)** | 
| **[`LegacySameSiteCookieBehaviorEnabledForDomainList`](#legacysamesitecookiebehaviorenabledfordomainlist)** | 
| **[`LocalFileLinks`](#localfilelinks)** | 
| **[`ManagedBookmarks`](#managedbookmarks)** | 
| **[`ManualAppUpdateOnly`](#manualappupdateonly)** | 
| **[`MicrosoftEntraSSO`](#microsoftentrasso)** | 
| **[`NetworkPrediction`](#networkprediction)** | 
| **[`NewTabPage`](#newtabpage)** | 
| **[`NoDefaultBookmarks`](#nodefaultbookmarks)** | 
| **[`OfferToSaveLogins`](#offertosavelogins)** | 
| **[`OfferToSaveLoginsDefault`](#offertosaveloginsdefault)** | 
| **[`OverrideFirstRunPage`](#overridefirstrunpage)** | 
| **[`OverridePostUpdatePage`](#overridepostupdatepage)** | 
| **[`PasswordManagerEnabled`](#passwordmanagerenabled)** | 
| **[`PasswordManagerExceptions`](#passwordmanagerexceptions)** | 
| **[`PDFjs`](#pdfjs)** | 
| **[`Permissions`](#permissions)** | 
| **[`PictureInPicture`](#pictureinpicture)** | 
| **[`PopupBlocking`](#popupblocking)** | 
| **[`PostQuantumKeyAgreementEnabled`](#postquantumkeyagreementenabled)** | 
| **[`Preferences`](#preferences)** | 
| **[`PrimaryPassword`](#primarypassword)** | 
| **[`PrintingEnabled`](#printingenabled)** | 
| **[`PrivateBrowsingModeAvailability`](#privatebrowsingmodeavailability)** | 
| **[`PromptForDownloadLocation`](#promptfordownloadlocation)** | 
| **[`Proxy`](#proxy)** | 
| **[`RequestedLocales`](#requestedlocales)** | 
| **[`SanitizeOnShutdown`](#sanitizeonshutdown)** | 
| **[`SearchBar`](#searchbar)** | 
| **[`SearchEngines`](#searchengines)** | 
| **[`SearchEngines -> Add`](#searchengines--add)** | 
| **[`SearchSuggestEnabled`](#searchsuggestenabled)** | 
| **[`SecurityDevices`](#securitydevices)** | 
| **[`ShowHomeButton`](#showhomebutton)** | 
| **[`SkipTermsOfUse`](#skiptermsofuse)** | 
| **[`SSLVersionMax`](#sslversionmax)** | 
| **[`SSLVersionMin`](#sslversionmin)** | 
| **[`StartDownloadsInTempDirectory`](#startdownloadsintempdirectory)** | 
| **[`SupportMenu`](#supportmenu)** | 
| **[`TranslateEnabled`](#translateenabled)** | 
| **[`UserMessaging`](#usermessaging)** | 
| **[`UseSystemPrintDialog`](#usesystemprintdialog)** | 
| **[`WebsiteFilter`](#websitefilter)** | 
| **[`WindowsSSO`](#windowssso)** | 

## 3rdparty

Provide configuration to WebExtensions, which they can read through the `storage.managed` API.

Allow WebExtensions to configure policy. For more information, see [Adding policy support to your extension](https://extensionworkshop.com/documentation/enterprise/enterprise-development/#how-to-add-policy).

For GPO and Intune, the extension developer should provide an ADMX file.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Extensions` (object)
- `[name]` (JSON)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\3rdparty\Extensions\some-extension@example.com (REG_MULTI_SZ) = 
{
  "theseKeysAndValuesAreExtensionSpecific": true,
  "advancedLayerRandomization": true,
  "transmogrifyImmediately": false,
  "hypnotizeUsersIfNeeded": true,
  "numberOfSemiShuffles": 123,
  "baseConfiguration": {
    "showHelp": "sometimes",
    "honestyRatio": 0.876
  }
}
Software\Policies\Mozilla\Firefox\3rdparty\Extensions\{869A1003-0452-414C-9E4B-EF6BAA7D79E0} (REG_MULTI_SZ) = 
{
  "lightness": 3,
  "darkness": 2
}
```

#### macOS
```
<dict>
  <key>3rdparty</key>
  <dict>
    <key>Extensions</key>
    <dict>
      <key>some-extension@example.com</key>
      <dict>
        <key>theseKeysAndValuesAreExtensionSpecific</key>
        <true/>
        <key>advancedLayerRandomization</key>
        <true/>
        <key>transmogrifyImmediately</key>
        <false/>
        <key>hypnotizeUsersIfNeeded</key>
        <true/>
        <key>numberOfSemiShuffles</key>
        <integer>123</integer>
        <key>baseConfiguration</key>
        <dict>
          <key>showHelp</key>
          <string>sometimes</string>
          <key>honestyRatio</key>
          <real>0.876</real>
        </dict>
      </dict>
      <key>{869A1003-0452-414C-9E4B-EF6BAA7D79E0}</key>
      <dict>
        <key>lightness</key>
        <integer>3</integer>
        <key>darkness</key>
        <integer>2</integer>
      </dict>
    </dict>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "3rdparty": {
      "Extensions": {
        "some-extension@example.com": {
          "theseKeysAndValuesAreExtensionSpecific": true,
          "advancedLayerRandomization": true,
          "transmogrifyImmediately": false,
          "hypnotizeUsersIfNeeded": true,
          "numberOfSemiShuffles": 123,
          "baseConfiguration": {
            "showHelp": "sometimes",
            "honestyRatio": 0.876
          }
        },
        "{869A1003-0452-414C-9E4B-EF6BAA7D79E0}": {
          "lightness": 3,
          "darkness": 2
        }
      }
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `3rdparty`<br>`3rdparty_Extensions`<br>`3rdparty_Extensions_[name]` | 67.0 |  |

## AllowedDomainsForApps

Define domains allowed to access Google Workspace.

This policy is based on the [Chrome policy](https://chromeenterprise.google/policies/#AllowedDomainsForApps) of the same name.

If this policy is enabled, users can only access Google Workspace using accounts from the specified domains. If you want to allow Gmail, you can add ```consumer_accounts``` to the list.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`AllowedDomainsForApps` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\AllowedDomainsForApps (REG_SZ) = managedfirefox.com,example.com
```

#### macOS
```
<dict>
  <key>AllowedDomainsForApps</key>
  <string>managedfirefox.com,example.com</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "AllowedDomainsForApps": "managedfirefox.com,example.com"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `AllowedDomainsForApps` | 89.0 |  |

## AllowFileSelectionDialogs

Enable or disable file selection dialogs.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `widget.disable_file_pickers`

### Settings

<div class="settings" markdown="1">

`AllowFileSelectionDialogs` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\AllowFileSelectionDialogs (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>AllowFileSelectionDialogs</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "AllowFileSelectionDialogs": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `AllowFileSelectionDialogs` | 124.0 |  |

## AppAutoUpdate

Enable or disable automatic application update.

If set to true, application updates are installed without user approval within Firefox. The operating system might still require approval.

If set to false, application updates are downloaded but the user can choose when to install the update.

If you have disabled updates via `DisableAppUpdate`, this policy has no effect.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `app.update.auto`

### Settings

<div class="settings" markdown="1">

`AppAutoUpdate` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\AppAutoUpdate (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>AppAutoUpdate</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "AppAutoUpdate": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `AppAutoUpdate` | 75.0 |  |

## AppUpdatePin

Prevent Firefox from being updated beyond the specified version.

You can specify the version as ```xx.``` and Firefox will be updated with all minor versions, but will not be updated beyond the major version.

You can also specify the version as ```xx.xx.``` and Firefox will be updated with all patch versions, but will not be updated beyond the minor version.

Note: The value MUST end in a dot(.).

You should specify a version that exists or is guaranteed to exist. If you specify a version that doesn't end up existing, Firefox will update beyond that version.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`AppUpdatePin` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\AppUpdatePin (REG_SZ) = 106.
```

#### macOS
```
<dict>
  <key>AppUpdatePin</key>
  <string>106.</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "AppUpdatePin": "106."
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `AppUpdatePin` | 102.0 |  |

## AppUpdateURL

Change the URL for application update if you are providing Firefox updates from a custom update server.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `app.update.url`

### Settings

<div class="settings" markdown="1">

`AppUpdateURL` (string, URL)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\AppUpdateURL (REG_SZ) = https://yoursite.com
```

#### macOS
```
<dict>
  <key>AppUpdateURL</key>
  <string>https://yoursite.com</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "AppUpdateURL": "https://yoursite.com"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `AppUpdateURL` | 63.0 |  |

## Authentication

Configure sites that support integrated authentication.

See [Integrated authentication](https://htmlpreview.github.io/?https://github.com/mdn/archived-content/blob/main/files/en-us/mozilla/integrated_authentication/raw.html) for more information.

`PrivateBrowsing` enables integrated authentication in private browsing.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.negotiate-auth.trusted-uris`, `network.negotiate-auth.delegation-uris`, `network.automatic-ntlm-auth.trusted-uris`, `network.automatic-ntlm-auth.allow-non-fqdn`, `network.negotiate-auth.allow-non-fqdn`, `network.automatic-ntlm-auth.allow-proxies`, `network.negotiate-auth.allow-proxies`, `network.auth.private-browsing-sso`

### Settings

<div class="settings" markdown="1">

`SPNEGO` (list of strings)

`Delegated` (list of strings)

`NTLM` (list of strings)

`AllowNonFQDN` (object)
- `SPNEGO` (boolean)
- `NTLM` (boolean)

`AllowProxies` (object)
- `SPNEGO` (boolean)
- `NTLM` (boolean)

`Locked` (boolean)

`PrivateBrowsing` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Authentication\SPNEGO\1 (REG_SZ) = mydomain.com
Software\Policies\Mozilla\Firefox\Authentication\SPNEGO\2 (REG_SZ) = https://myotherdomain.com
Software\Policies\Mozilla\Firefox\Authentication\Delegated\1 (REG_SZ) = mydomain.com
Software\Policies\Mozilla\Firefox\Authentication\Delegated\2 (REG_SZ) = https://myotherdomain.com
Software\Policies\Mozilla\Firefox\Authentication\NTLM\1 (REG_SZ) = mydomain.com
Software\Policies\Mozilla\Firefox\Authentication\NTLM\2 (REG_SZ) = https://myotherdomain.com
Software\Policies\Mozilla\Firefox\Authentication\AllowNonFQDN\SPNEGO (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Authentication\AllowNonFQDN\NTLM (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Authentication\AllowProxies\SPNEGO (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Authentication\AllowProxies\NTLM (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Authentication\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Authentication\PrivateBrowsing (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>Authentication</key>
  <dict>
    <key>SPNEGO</key>
    <array>
      <string>mydomain.com</string>
      <string>https://myotherdomain.com</string>
    </array>
    <key>Delegated</key>
    <array>
      <string>mydomain.com</string>
      <string>https://myotherdomain.com</string>
    </array>
    <key>NTLM</key>
    <array>
      <string>mydomain.com</string>
      <string>https://myotherdomain.com</string>
    </array>
    <key>AllowNonFQDN</key>
    <dict>
      <key>SPNEGO</key>
      <true/>
      <key>NTLM</key>
      <true/>
    </dict>
    <key>AllowProxies</key>
    <dict>
      <key>SPNEGO</key>
      <true/>
      <key>NTLM</key>
      <true/>
    </dict>
    <key>Locked</key>
    <true/>
    <key>PrivateBrowsing</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Authentication": {
      "SPNEGO": ["mydomain.com", "https://myotherdomain.com"],
      "Delegated": ["mydomain.com", "https://myotherdomain.com"],
      "NTLM": ["mydomain.com", "https://myotherdomain.com"],
      "AllowNonFQDN": {
        "SPNEGO": true,
        "NTLM": true
      },
      "AllowProxies": {
        "SPNEGO": true,
        "NTLM": true
      },
      "Locked": true,
      "PrivateBrowsing": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Authentication`<br>`Authentication_SPNEGO`<br>`Authentication_Delegated`<br>`Authentication_NTLM` | 61.0 |  |
| `Authentication_AllowNonFQDN`<br>`Authentication_AllowNonFQDN_SPNEGO`<br>`Authentication_AllowNonFQDN_NTLM` | 63.0 |  |
| `Authentication_AllowProxies`<br>`Authentication_AllowProxies_SPNEGO`<br>`Authentication_AllowProxies_NTLM`<br>`Authentication_Locked` | 71.0 |  |
| `Authentication_PrivateBrowsing` | 78.0 |  |

## AutofillAddressEnabled

Enables or disables autofill for addresses.

This only applies when address autofill is enabled for a particular Firefox version or region. See [this page](https://support.mozilla.org/kb/automatically-fill-your-address-web-forms) for more information.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `extensions.formautofill.addresses.enabled`

### Settings

<div class="settings" markdown="1">

`AutofillAddressEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\AutofillAddressEnabled (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>AutofillAddressEnabled</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "AutofillAddressEnabled": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `AutofillAddressEnabled` | 125.0 |  |

## AutofillCreditCardEnabled

Enables or disables autofill for payment methods.

This only applies when payment method autofill is enabled for a particular Firefox version or region. See [this page](https://support.mozilla.org/kb/credit-card-autofill) for more information.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `extensions.formautofill.creditCards.enabled`

### Settings

<div class="settings" markdown="1">

`AutofillCreditCardEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\AutofillCreditCardEnabled (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>AutofillCreditCardEnabled</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "AutofillCreditCardEnabled": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `AutofillCreditCardEnabled` | 125.0 |  |

## AutoLaunchProtocolsFromOrigins

Define a list of external protocols that can be used from listed origins without prompting the user.

The origin is the scheme plus the hostname.

The syntax of this policy is exactly the same as the [Chrome AutoLaunchProtocolsFromOrigins policy](https://chromeenterprise.google/policies/#AutoLaunchProtocolsFromOrigins) except that you can only use valid origins (not just hostnames). This also means that you cannot specify an asterisk for all origins.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`allowed_origins` (list of origins)

`protocol` (string)

`required` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\AutoLaunchProtocolsFromOrigins (REG_MULTI_SZ) = 
[
  {
    "protocol": "zoommtg",
    "allowed_origins": ["https://somesite.zoom.us"]
  }
]
```

#### macOS
```
<dict>
  <key>AutoLaunchProtocolsFromOrigins</key>
  <array>
    <dict>
      <key>protocol</key>
      <string>zoommtg</string>
      <key>allowed_origins</key>
      <array>
        <string>https://somesite.zoom.us</string>
      </array>
    </dict>
  </array>
</dict>
```

#### policies.json
```
{
  "policies": {
    "AutoLaunchProtocolsFromOrigins": [
      {
        "protocol": "zoommtg",
        "allowed_origins": ["https://somesite.zoom.us"]
      }
    ]
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `AutoLaunchProtocolsFromOrigins` | 90.0 |  |

## BackgroundAppUpdate

Enable or disable automatic application update in the background, when the application is not running.

If set to true, application updates may be installed (without user approval) in the background, even when the application is not running. The operating system might still require approval.

If set to false, the application will not try to install updates when the application is not running.

If you have disabled updates via `DisableAppUpdate` or disabled automatic updates via `AppAutoUpdate`, this policy has no effect.

If you are having trouble getting the background task to run, verify your configuration with the ["Requirements to run" section in this support document](https://support.mozilla.org/en-US/kb/enable-background-updates-firefox-windows).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `app.update.background.enabled`

### Settings

<div class="settings" markdown="1">

`BackgroundAppUpdate` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\BackgroundAppUpdate (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>BackgroundAppUpdate</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "BackgroundAppUpdate": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `BackgroundAppUpdate` | 88.0 |  |

## BlockAboutAddons

Block access to the Add-ons Manager ('about:addons').

**CCK2 Equivalent:** `disableAddonsManager`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`BlockAboutAddons` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\BlockAboutAddons (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>BlockAboutAddons</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "BlockAboutAddons": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `BlockAboutAddons` | 60.0 |  |

## BlockAboutConfig

Block access to 'about:config'.

**CCK2 Equivalent:** `disableAboutConfig`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`BlockAboutConfig` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\BlockAboutConfig (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>BlockAboutConfig</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "BlockAboutConfig": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `BlockAboutConfig` | 60.0 |  |

## BlockAboutProfiles

Block access to About Profiles ('about:profiles').

**CCK2 Equivalent:** `disableAboutProfiles`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`BlockAboutProfiles` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\BlockAboutProfiles (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>BlockAboutProfiles</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "BlockAboutProfiles": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `BlockAboutProfiles` | 60.0 |  |

## BlockAboutSupport

Block access to Troubleshooting Information ('about:support').

**CCK2 Equivalent:** `disableAboutSupport`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`BlockAboutSupport` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\BlockAboutSupport (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>BlockAboutSupport</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "BlockAboutSupport": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `BlockAboutSupport` | 60.0 |  |

## Bookmarks

Add bookmarks in either the bookmarks toolbar or menu. Use 'ManagedBookmarks' instead.

Note: [`ManagedBookmarks`](#managedbookmarks) is the new recommended way to add bookmarks. This policy will continue to be supported.

Add bookmarks in either the bookmarks toolbar or menu. Only `Title` and `URL` are required. If `Placement` is not specified, the bookmark will be placed on the toolbar. If `Folder` is specified, it is automatically created and bookmarks with the same folder name are grouped together.

If you want to clear all bookmarks set with this policy, you can set the value to an empty array (```[]```). This can be on Windows via the new Bookmarks (JSON) policy available with GPO and Intune.

**CCK2 Equivalent:** `bookmarks.toolbar,bookmarks.menu`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Title` (string)

`URL` (string, URL)

`Favicon` (string, URL)

`Placement` (string: `toolbar` or `menu`)
> *`toolbar`: Add the bookmark to the bookmarks toolbar.*\
> *`menu`: Add the bookmark to the bookmarks menu.*

`Folder` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Bookmarks\1\Title (REG_SZ) = Example
Software\Policies\Mozilla\Firefox\Bookmarks\1\URL (REG_SZ) = https://example.com
Software\Policies\Mozilla\Firefox\Bookmarks\1\Favicon (REG_SZ) = https://example.com/favicon.ico
Software\Policies\Mozilla\Firefox\Bookmarks\1\Placement (REG_SZ) = toolbar
Software\Policies\Mozilla\Firefox\Bookmarks\1\Folder (REG_SZ) = FolderName
```

#### macOS
```
<dict>
  <key>Bookmarks</key>
  <array>
    <dict>
      <key>Title</key>
      <string>Example</string>
      <key>URL</key>
      <string>https://example.com</string>
      <key>Favicon</key>
      <string>https://example.com/favicon.ico</string>
      <key>Placement</key>
      <string>toolbar</string>
      <key>Folder</key>
      <string>FolderName</string>
    </dict>
  </array>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Bookmarks": [
      {
        "Title": "Example",
        "URL": "https://example.com",
        "Favicon": "https://example.com/favicon.ico",
        "Placement": "toolbar",
        "Folder": "FolderName"
      }
    ]
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Bookmarks` | 60.0 |  |

## CaptivePortal

Enable or disable the detection of captive portals.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.captive-portal-service.enabled`

### Settings

<div class="settings" markdown="1">

`CaptivePortal` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\CaptivePortal (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>CaptivePortal</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "CaptivePortal": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `CaptivePortal` | 67.0 |  |

## Certificates

Install and manage certificates.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Certificates` (object)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Certificates\ImportEnterpriseRoots (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Certificates\Install\1 (REG_SZ) = cert1.der
Software\Policies\Mozilla\Firefox\Certificates\Install\2 (REG_SZ) = /home/username/cert2.pem
```

#### macOS
```
<dict>
  <key>Certificates</key>
  <dict>
    <key>ImportEnterpriseRoots</key>
    <true/>
    <key>Install</key>
    <array>
      <string>cert1.der</string>
      <string>/home/username/cert2.pem</string>
    </array>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Certificates": {
      "ImportEnterpriseRoots": true,
      "Install": ["cert1.der", "/home/username/cert2.pem"]
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Certificates`<br>`Certificates_ImportEnterpriseRoots` | 61.0 |  |
| `Certificates_Install` | 64.0 |  |

## Certificates | ImportEnterpriseRoots

Trust certificates that have been added to the operating system certificate store by a user or administrator.

Note: This policy only works on Windows and macOS. For Linux discussion, see [bug 1600509](https://bugzilla.mozilla.org/show_bug.cgi?id=1600509).

See https://support.mozilla.org/kb/setting-certificate-authorities-firefox for more detail.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.enterprise_roots.enabled`

### Settings

<div class="settings" markdown="1">

`ImportEnterpriseRoots` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Certificates\ImportEnterpriseRoots (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>Certificates</key>
  <dict>
    <key>ImportEnterpriseRoots</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Certificates": {
      "ImportEnterpriseRoots": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Certificates_ImportEnterpriseRoots` | 61.0 |  |

## Certificates | Install

Install certificates into the Firefox certificate store. If only a filename is specified, Firefox searches for the file in the following locations:

- Windows
  - %USERPROFILE%\AppData\Local\Mozilla\Certificates
  - %USERPROFILE%\AppData\Roaming\Mozilla\Certificates
- macOS
  - /Library/Application Support/Mozilla/Certificates
  - ~/Library/Application Support/Mozilla/Certificates
- Linux
  - /usr/lib/mozilla/certificates
  - /usr/lib64/mozilla/certificates
  - ~/.mozilla/certificates

Starting with Firefox 65, Firefox 60.5 ESR, a fully qualified path can be used, including UNC paths. You should use the native path style for your operating system. We do not support using %USERPROFILE% or other environment variables on Windows.

If you are specifying the path in the policies.json file on Windows, you need to escape your backslashes (`\\`) which means that for UNC paths, you need to escape both (`\\\\`). If you use group policy, you only need one backslash.

Certificates are installed using the trust string `CT,CT,`.

Binary (DER) and ASCII (PEM) certificates are both supported.

**CCK2 Equivalent:** `certs.ca`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Install` (list of strings)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Certificates\Install\1 (REG_SZ) = cert1.der
Software\Policies\Mozilla\Firefox\Certificates\Install\2 (REG_SZ) = /home/username/cert2.pem
```

#### macOS
```
<dict>
  <key>Certificates</key>
  <dict>
    <key>Install</key>
    <array>
      <string>cert1.der</string>
      <string>/home/username/cert2.pem</string>
    </array>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Certificates": {
      "Install": ["cert1.der", "/home/username/cert2.pem"]
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Certificates_Install` | 64.0 |  |

## Containers

Set policies related to Multi-Account Containers.

Set policies related to [containers](https://addons.mozilla.org/firefox/addon/multi-account-containers/).

Currently you can set the initial set of containers.

For each container, you can specify the name, icon, and color.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Default` (JSON)
- `name` (string)
- `icon` (string: `fingerprint`, `briefcase`, `dollar`, `cart`, `vacation`, `gift`, `food`, `fruit`, `pet`, `tree`, `chill`, `circle` or `fence`)
- `color` (string: `blue`, `turquoise`, `green`, `yellow`, `orange`, `red`, `pink`, `purple` or `toolbar`)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Containers\Default (REG_MULTI_SZ) = 
[
  {
    "name": "My container",
    "icon": "pet",
    "color": "cyan"
  }
]
```

#### macOS
```
<dict>
  <key>Containers</key>
  <dict>
    <key>Default</key>
    <array>
      <dict>
        <key>name</key>
        <string>My container</string>
        <key>icon</key>
        <string>pet</string>
        <key>color</key>
        <string>cyan</string>
      </dict>
    </array>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Containers": {
      "Default": [
        {
          "name": "My container",
          "icon": "pet",
          "color": "cyan"
        }
      ]
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Containers`<br>`Containers_Default` | 113.0 |  |

## ContentAnalysis

Configure Firefox to use an agent for Data Loss Prevention (DLP) that is compatible with the Google Chrome Content Analysis Connector Agent SDK.

`AgentName` is the name of the DLP agent. This is used in dialogs and notifications about DLP operations. The default is "A DLP Agent".

`AgentTimeout` is the timeout in number of seconds after a DLP request is sent to the agent. After this timeout, the request will be denied unless `TimeoutResult` is set to 1 or 2. The default is 300.

`AllowUrlRegexList` is a space-separated list of regular expressions that indicates URLs for which DLP operations will always be allowed without consulting the agent. The default is "^about:(?!blank&#124;srcdoc).*", meaning that any pages that start with "about:" will be exempt from DLP except for "about:blank" and "about:srcdoc", as these can be controlled by web content.

`BypassForSameTabOperations` indicates whether Firefox will automatically allow DLP requests whose data comes from the same tab and frame - for example, if data is copied to the clipboard and then pasted on the same page. The default is false.

`ClientSignature` indicates the required signature of the DLP agent connected to the pipe. If this is a non-empty string and the DLP agent does not have a signature with a Subject Name that exactly matches this value, Firefox will not connect to the pipe. The default is the empty string.

`DefaultResult` indicates the desired behavior for DLP requests if there is a problem connecting to the DLP agent. The default is 0.

`DenyUrlRegexList` is a space-separated list of regular expressions that indicates URLs for which DLP operations will always be denied without consulting the agent. The default is the empty string.

`Enabled` indicates whether Firefox should use DLP. Note that if this value is true and no DLP agent is running, all DLP requests will be denied unless `DefaultResult` is set to 1 or 2.

`InterceptionPoints` controls settings for specific interception points.

* The `Clipboard` entry controls clipboard operations for files and text.
  * `Enabled` indicates whether clipboard operations should use DLP. The default is true.
  * `PlainTextOnly` indicates whether to only analyze the text/plain format on the clipboard. If this
    value is false, all formats will be analyzed, which some DLP agents may not expect. Regardless of
    this value, files will be analyzed as usual. The default is true.
* The `Download` entry controls download operations. (Added in Firefox 142, Firefox ESR 140.2)
  * `Enabled` indicates whether download operations should use DLP. The default is false.
* The `DragAndDrop` entry controls drag and drop operations for files and text.
  * `Enabled` indicates whether drag and drop operations should use DLP. The default is true.
  * `PlainTextOnly` indicates whether to only analyze the text/plain format in what is being dropped.
    If this value is false, all formats will be analyzed, which some DLP agents may not expect.
    Regardless of this value, files will be analyzed as usual. The default is true.
* The `FileUpload` entry controls file upload operations for files chosen from the file picker.
  * `Enabled` indicates whether file upload operations should use DLP. The default is true.
* The `Print` entry controls print operation.
  * `Enabled` indicates whether print operations should use DLP. The default is true.

`IsPerUser` indicates whether the pipe the DLP agent has created is per-user or per-system. The default is true, meaning per-user.

`PipePathName` is the name of the pipe the DLP agent has created and Firefox will connect to. The default is "path_user".

`ShowBlockedResult` indicates whether Firefox should show a notification when a DLP request is denied. The default is true.

`TimeoutResult` indicates the desired behavior for DLP requests if the DLP agent does not respond to a request in less than `AgentTimeout` seconds. The default is 0.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.contentanalysis.agent_name`, `browser.contentanalysis.agent_timeout`, `browser.contentanalysis.allow_url_regex_list`, `browser.contentanalysis.bypass_for_same_tab_operations`, `browser.contentanalysis.client_signature`, `browser.contentanalysis.default_result`, `browser.contentanalysis.deny_url_regex_list`, `browser.contentanalysis.enabled`, `browser.contentanalysis.interception_point.clipboard.enabled`, `browser.contentanalysis.interception_point.clipboard.plain_text_only`, `browser.contentanalysis.interception_point.download.enabled`, `browser.contentanalysis.interception_point.drag_and_drop.enabled`, `browser.contentanalysis.interception_point.drag_and_drop.plain_text_only`, `browser.contentanalysis.interception_point.file_upload.enabled`, `browser.contentanalysis.interception_point.print.enabled`, `browser.contentanalysis.is_per_user`, `browser.contentanalysis.pipe_path_name`, `browser.contentanalysis.show_blocked_result`, `browser.contentanalysis.timeout_result`

### Settings

<div class="settings" markdown="1">

`Enabled` (boolean)

`PipePathName` (string)

`AgentTimeout` (number)

`AllowUrlRegexList` (string)

`DenyUrlRegexList` (string)

`AgentName` (string)

`ClientSignature` (string)

`IsPerUser` (boolean)

`MaxConnectionsCount` (number)

`ShowBlockedResult` (boolean)

`DefaultResult` (number)

`TimeoutResult` (number)

`BypassForSameTabOperations` (boolean)

`InterceptionPoints` (object)
- `Clipboard` (object)
  - `Enabled` (boolean)
  - `PlainTextOnly` (boolean)
- `Download` (object)
  - `Enabled` (boolean)
- `DragAndDrop` (object)
  - `Enabled` (boolean)
  - `PlainTextOnly` (boolean)
- `FileUpload` (object)
  - `Enabled` (boolean)
- `Print` (object)
  - `Enabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\ContentAnalysis\AgentName (REG_SZ) = My DLP Product
Software\Policies\Mozilla\Firefox\ContentAnalysis\AgentTimeout (REG_DWORD) = 0x3c
Software\Policies\Mozilla\Firefox\ContentAnalysis\AllowUrlRegexList (REG_SZ) = https://example.com/.* https://subdomain.example.com/.*
Software\Policies\Mozilla\Firefox\ContentAnalysis\BypassForSameTabOperations (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\ContentAnalysis\ClientSignature (REG_SZ) = My DLP Company
Software\Policies\Mozilla\Firefox\ContentAnalysis\DefaultResult (REG_DWORD) = 0x0
Software\Policies\Mozilla\Firefox\ContentAnalysis\DenyUrlRegexList (REG_SZ) = https://example.com/.* https://subdomain.example.com/.*
Software\Policies\Mozilla\Firefox\ContentAnalysis\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\ContentAnalysis\InterceptionPoints\Clipboard\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\ContentAnalysis\InterceptionPoints\Clipboard\PlainTextOnly (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\ContentAnalysis\InterceptionPoints\ClipboardCopy\Enabled (REG_DWORD) = 0x0
Software\Policies\Mozilla\Firefox\ContentAnalysis\InterceptionPoints\ClipboardCopy\PlainTextOnly (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\ContentAnalysis\InterceptionPoints\Download\Enabled (REG_DWORD) = 0x0
Software\Policies\Mozilla\Firefox\ContentAnalysis\InterceptionPoints\DragAndDrop\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\ContentAnalysis\InterceptionPoints\DragAndDrop\PlainTextOnly (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\ContentAnalysis\InterceptionPoints\FileUpload\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\ContentAnalysis\InterceptionPoints\Print\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\ContentAnalysis\IsPerUser (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\ContentAnalysis\MaxConnectionsCount (REG_DWORD) = 0x20
Software\Policies\Mozilla\Firefox\ContentAnalysis\PipePathName (REG_SZ) = pipe_custom_name
Software\Policies\Mozilla\Firefox\ContentAnalysis\ShowBlockedResult (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\ContentAnalysis\TimeoutResult (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>ContentAnalysis</key>
  <dict>
    <key>AgentName</key>
    <string>My DLP Product</string>
    <key>AgentTimeout</key>
    <integer>60</integer>
    <key>AllowUrlRegexList</key>
    <string>https://example.com/.* https://subdomain.example.com/.*</string>
    <key>BypassForSameTabOperations</key>
    <true/>
    <key>ClientSignature</key>
    <string>My DLP Company</string>
    <key>DefaultResult</key>
    <integer>0</integer>
    <key>DenyUrlRegexList</key>
    <string>https://example.com/.* https://subdomain.example.com/.*</string>
    <key>Enabled</key>
    <true/>
    <key>InterceptionPoints</key>
    <dict>
      <key>Clipboard</key>
      <dict>
        <key>Enabled</key>
        <true/>
        <key>PlainTextOnly</key>
        <true/>
      </dict>
      <key>ClipboardCopy</key>
      <dict>
        <key>Enabled</key>
        <false/>
        <key>PlainTextOnly</key>
        <true/>
      </dict>
      <key>Download</key>
      <dict>
        <key>Enabled</key>
        <false/>
      </dict>
      <key>DragAndDrop</key>
      <dict>
        <key>Enabled</key>
        <true/>
        <key>PlainTextOnly</key>
        <true/>
      </dict>
      <key>FileUpload</key>
      <dict>
        <key>Enabled</key>
        <true/>
      </dict>
      <key>Print</key>
      <dict>
        <key>Enabled</key>
        <true/>
      </dict>
    </dict>
    <key>IsPerUser</key>
    <true/>
    <key>MaxConnectionsCount</key>
    <integer>32</integer>
    <key>PipePathName</key>
    <string>pipe_custom_name</string>
    <key>ShowBlockedResult</key>
    <true/>
    <key>TimeoutResult</key>
    <integer>0</integer>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "ContentAnalysis": {
      "AgentName": "My DLP Product",
      "AgentTimeout": 60,
      "AllowUrlRegexList": "https://example.com/.* https://subdomain.example.com/.*",
      "BypassForSameTabOperations": true,
      "ClientSignature": "My DLP Company",
      "DefaultResult": 0,
      "DenyUrlRegexList": "https://example.com/.* https://subdomain.example.com/.*",
      "Enabled": true,
      "InterceptionPoints": {
        "Clipboard": {
          "Enabled": true,
          "PlainTextOnly": true
        },
        "ClipboardCopy": {
          "Enabled": false,
          "PlainTextOnly": true
        },
        "Download": {
          "Enabled": false
        },
        "DragAndDrop": {
          "Enabled": true,
          "PlainTextOnly": true
        },
        "FileUpload": {
          "Enabled": true
        },
        "Print": {
          "Enabled": true
        }
      },
      "IsPerUser": true,
      "MaxConnectionsCount": 32,
      "PipePathName": "pipe_custom_name",
      "ShowBlockedResult": true,
      "TimeoutResult": 0
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `ContentAnalysis`<br>`ContentAnalysis_Enabled`<br>`ContentAnalysis_PipePathName`<br>`ContentAnalysis_AgentTimeout`<br>`ContentAnalysis_AllowUrlRegexList`<br>`ContentAnalysis_DenyUrlRegexList`<br>`ContentAnalysis_IsPerUser`<br>`ContentAnalysis_ShowBlockedResult` | 125.0 |  |
| `ContentAnalysis_AgentName`<br>`ContentAnalysis_ClientSignature`<br>`ContentAnalysis_BypassForSameTabOperations` | 126.0 |  |
| `ContentAnalysis_MaxConnectionsCount` | 138.0 |  |
| `ContentAnalysis_DefaultResult` | 127.0 |  |
| `ContentAnalysis_TimeoutResult`<br>`ContentAnalysis_InterceptionPoints_Clipboard_PlainTextOnly`<br>`ContentAnalysis_InterceptionPoints_DragAndDrop_PlainTextOnly` | 137.0 |  |
| `ContentAnalysis_InterceptionPoints`<br>`ContentAnalysis_InterceptionPoints_Clipboard`<br>`ContentAnalysis_InterceptionPoints_Clipboard_Enabled`<br>`ContentAnalysis_InterceptionPoints_DragAndDrop`<br>`ContentAnalysis_InterceptionPoints_DragAndDrop_Enabled`<br>`ContentAnalysis_InterceptionPoints_FileUpload`<br>`ContentAnalysis_InterceptionPoints_FileUpload_Enabled`<br>`ContentAnalysis_InterceptionPoints_Print`<br>`ContentAnalysis_InterceptionPoints_Print_Enabled` | 134.0 |  |
| `ContentAnalysis_InterceptionPoints_Download`<br>`ContentAnalysis_InterceptionPoints_Download_Enabled` | 141.0, 140.2.0esr |  |
| `ContentAnalysis_DefaultAllow` | 125.0 | 127.0 |

## Cookies

Configure cookie preferences.

`Allow` is a list of origins (not domains) where cookies are always allowed. You must include http or https.

`AllowSession` is a list of origins (not domains) where cookies are only allowed for the current session. You must include http or https.

`Block` is a list of origins (not domains) where cookies are always blocked. You must include http or https.

`Behavior` sets the default behavior for cookies based on the values below.

`BehaviorPrivateBrowsing` sets the default behavior for cookies in private browsing based on the values below.

`Locked` prevents the user from changing cookie preferences.

`Default` determines whether cookies are accepted at all. (*Deprecated*. Use `Behavior` instead)

`AcceptThirdParty` determines how third-party cookies are handled. (*Deprecated*. Use `Behavior` instead)

`RejectTracker` only rejects cookies for trackers. (*Deprecated*. Use `Behavior` instead)

`ExpireAtSessionEnd` determines when cookies expire. (*Deprecated*. Use [`SanitizeOnShutdown`](#sanitizeonshutdown-selective) instead)

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.cookie.cookieBehavior`, `network.cookie.cookieBehavior.pbmode`, `network.cookie.lifetimePolicy`

### Settings

<div class="settings" markdown="1">

`Allow` (list of origins)

`AllowSession` (list of origins)

`Block` (list of origins)

`Default` (boolean)

`AcceptThirdParty` (string: `always`, `never` or `from-visited`)
> *`always`: Accept all third-party cookies.*\
> *`never`: Reject all third-party cookies.*\
> *`from-visited`: Accept third-party cookies only from sites the user has visited.*

`RejectTracker` (boolean)

`ExpireAtSessionEnd` (boolean)

`Locked` (boolean)

`Behavior` (string: `accept`, `reject-foreign`, `reject`, `limit-foreign`, `reject-tracker` or `reject-tracker-and-partition-foreign`)
> *`accept`: Accept cookies from every site, including third parties.*\
> *`reject-foreign`: Reject every cookie set by a third party.*\
> *`reject`: Reject cookies from every site.*\
> *`limit-foreign`: Reject third-party cookies except from sites the user has visited.*\
> *`reject-tracker`: Reject cookies set by sites identified as trackers.*\
> *`reject-tracker-and-partition-foreign`: Reject cookies from known trackers and confine the remaining third-party cookies to the site that set them. This is Total Cookie Protection.*

`BehaviorPrivateBrowsing` (string: `accept`, `reject-foreign`, `reject`, `limit-foreign`, `reject-tracker` or `reject-tracker-and-partition-foreign`)
> *`accept`: Accept cookies from every site, including third parties.*\
> *`reject-foreign`: Reject every cookie set by a third party.*\
> *`reject`: Reject cookies from every site.*\
> *`limit-foreign`: Reject third-party cookies except from sites the user has visited.*\
> *`reject-tracker`: Reject cookies set by sites identified as trackers.*\
> *`reject-tracker-and-partition-foreign`: Reject cookies from known trackers and confine the remaining third-party cookies to the site that set them. This is Total Cookie Protection.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Cookies\Allow\1 (REG_SZ) = http://example.org/
Software\Policies\Mozilla\Firefox\Cookies\AllowSession\1 (REG_SZ) = http://example.edu/
Software\Policies\Mozilla\Firefox\Cookies\Block\1 (REG_SZ) = http://example.com/
Software\Policies\Mozilla\Firefox\Cookies\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Cookies\Behavior (REG_SZ) = accept
Software\Policies\Mozilla\Firefox\Cookies\BehaviorPrivateBrowsing (REG_SZ) = accept
```

#### macOS
```
<dict>
  <key>Cookies</key>
  <dict>
    <key>Allow</key>
    <array>
      <string>http://example.org/</string>
    </array>
    <key>AllowSession</key>
    <array>
      <string>http://example.edu/</string>
    </array>
    <key>Block</key>
    <array>
      <string>http://example.com/</string>
    </array>
    <key>Locked</key>
    <true/>
    <key>Behavior</key>
    <string>accept</string>
    <key>BehaviorPrivateBrowsing</key>
    <string>accept</string>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Cookies": {
      "Allow": ["http://example.org/"],
      "AllowSession": ["http://example.edu/"],
      "Block": ["http://example.com/"],
      "Locked": true,
      "Behavior": "accept",
      "BehaviorPrivateBrowsing": "accept"
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Cookies`<br>`Cookies_Allow`<br>`Cookies_Block` | 60.0 |  |
| `Cookies_AllowSession` | 79.0 |  |
| `Cookies_Default`<br>`Cookies_AcceptThirdParty`<br>`Cookies_ExpireAtSessionEnd`<br>`Cookies_Locked` | 61.0 |  |
| `Cookies_RejectTracker` | 63.0 |  |
| `Cookies_Behavior`<br>`Cookies_BehaviorPrivateBrowsing` | 96.0 |  |

## DefaultDownloadDirectory

Set the default download directory.

You can use ${home} for the native home directory.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.download.dir`, `browser.download.folderList`

### Settings

<div class="settings" markdown="1">

`DefaultDownloadDirectory` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DefaultDownloadDirectory (REG_SZ) = ${home}/Downloads
```

#### macOS
```
<dict>
  <key>DefaultDownloadDirectory</key>
  <string>${home}/Downloads</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DefaultDownloadDirectory": "${home}/Downloads"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DefaultDownloadDirectory` | 68.0 |  |

## DisableAccounts

Disable account-based services, including sync.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableAccounts` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableAccounts (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableAccounts</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableAccounts": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableAccounts` | 119.0 |  |

## DisableAppUpdate

Turn off application updates within Firefox.

**CCK2 Equivalent:** `disableFirefoxUpdates`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableAppUpdate` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableAppUpdate (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableAppUpdate</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableAppUpdate": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableAppUpdate` | 60.0 |  |

## DisableBuiltinPDFViewer

Disable the built in PDF viewer.

PDF files are downloaded and sent externally.

Note: As of Firefox 140, this policy no longer completely disables PDF.js; it changes the handler to send PDF files to the operating system. Embedded PDF files are shown in the browser. If you need to completely disable PDF.js, you can use the [`PDFjs`](#pdfjs) policy.

**CCK2 Equivalent:** `disablePDFjs`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableBuiltinPDFViewer` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableBuiltinPDFViewer (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableBuiltinPDFViewer</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableBuiltinPDFViewer": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableBuiltinPDFViewer` | 61.0 |  |

## DisabledCiphers

Disable specific cryptographic ciphers, listed below.

**Preferences Affected:** `security.ssl3.ecdhe_rsa_aes_128_gcm_sha256`, `security.ssl3.ecdhe_ecdsa_aes_128_gcm_sha256`, `security.ssl3.ecdhe_ecdsa_chacha20_poly1305_sha256`, `security.ssl3.ecdhe_rsa_chacha20_poly1305_sha256`, `security.ssl3.ecdhe_ecdsa_aes_256_gcm_sha384`, `security.ssl3.ecdhe_rsa_aes_256_gcm_sha384`, `security.ssl3.ecdhe_rsa_aes_128_sha`, `security.ssl3.ecdhe_ecdsa_aes_128_sha`, `security.ssl3.ecdhe_rsa_aes_256_sha`, `security.ssl3.ecdhe_ecdsa_aes_256_sha`, `security.ssl3.dhe_rsa_aes_128_sha`, `security.ssl3.dhe_rsa_aes_256_sha`, `security.ssl3.rsa_aes_128_gcm_sha256`, `security.ssl3.rsa_aes_256_gcm_sha384`, `security.ssl3.rsa_aes_128_sha`, `security.ssl3.rsa_aes_256_sha`, `security.ssl3.deprecated.rsa_des_ede3_sha`, `security.tls13.chacha20_poly1305_sha256`, `security.tls13.aes_128_gcm_sha256`, `security.tls13.aes_256_gcm_sha384`

---
**Note:**

This policy was updated in Firefox 78 to allow enabling ciphers as well. Setting the value to true disables the cipher, setting the value to false enables the cipher. Previously setting the value to true or false disabled the cipher.

---

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256` (boolean)

`TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256` (boolean)

`TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256` (boolean)

`TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256` (boolean)

`TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384` (boolean)

`TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384` (boolean)

`TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA` (boolean)

`TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA` (boolean)

`TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA` (boolean)

`TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA` (boolean)

`TLS_DHE_RSA_WITH_AES_128_CBC_SHA` (boolean)

`TLS_DHE_RSA_WITH_AES_256_CBC_SHA` (boolean)

`TLS_RSA_WITH_AES_128_GCM_SHA256` (boolean)

`TLS_RSA_WITH_AES_256_GCM_SHA384` (boolean)

`TLS_RSA_WITH_AES_128_CBC_SHA` (boolean)

`TLS_RSA_WITH_AES_256_CBC_SHA` (boolean)

`TLS_RSA_WITH_3DES_EDE_CBC_SHA` (boolean)

`TLS_CHACHA20_POLY1305_SHA256` (boolean)

`TLS_AES_128_GCM_SHA256` (boolean)

`TLS_AES_256_GCM_SHA384` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisabledCiphers\TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\DisabledCiphers\TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\DisabledCiphers\TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256 (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\DisabledCiphers\TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisabledCiphers</key>
  <dict>
    <key>TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256</key>
    <true/>
    <key>TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA</key>
    <true/>
    <key>TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256</key>
    <true/>
    <key>TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisabledCiphers": {
      "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256": true,
      "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA": true,
      "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256": true,
      "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisabledCiphers`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA`<br>`DisabledCiphers_TLS_DHE_RSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_DHE_RSA_WITH_AES_256_CBC_SHA`<br>`DisabledCiphers_TLS_RSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_RSA_WITH_AES_256_CBC_SHA`<br>`DisabledCiphers_TLS_RSA_WITH_3DES_EDE_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA` | 97.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_RSA_WITH_AES_256_GCM_SHA384` | 79.0 |  |
| `DisabledCiphers_TLS_CHACHA20_POLY1305_SHA256`<br>`DisabledCiphers_TLS_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_AES_256_GCM_SHA384` | 138.0 |  |

## DisableDefaultBrowserAgent

Prevent the default browser agent from taking any actions.

Only applicable to Windows; other platforms don’t have the agent.

The browser agent is a Windows-only scheduled task which runs in the background to collect and submit data about the browser that the user has set as their OS default. More information is available [here](https://firefox-source-docs.mozilla.org/toolkit/mozapps/defaultagent/default-browser-agent/index.html).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableDefaultBrowserAgent` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableDefaultBrowserAgent (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableDefaultBrowserAgent</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableDefaultBrowserAgent": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableDefaultBrowserAgent` | 76.0 |  |

## DisableDeveloperTools

Remove access to all developer tools.

**CCK2 Equivalent:** `removeDeveloperTools`\
**Preferences Affected:** `devtools.policy.disabled`

### Settings

<div class="settings" markdown="1">

`DisableDeveloperTools` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableDeveloperTools (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableDeveloperTools</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableDeveloperTools": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableDeveloperTools` | 60.0 |  |

## DisableEncryptedClientHello

Disable the TLS Feature for Encrypted Client Hello.

Note that TLS Client Hellos will still contain an ECH extension, but this extension will not be used by Firefox during the TLS handshake.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.dns.echconfig.enabled`, `network.dns.http3_echconfig.enabled`

### Settings

<div class="settings" markdown="1">

`DisableEncryptedClientHello` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableEncryptedClientHello (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableEncryptedClientHello</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableEncryptedClientHello": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableEncryptedClientHello` | 127.0 |  |

## DisableFeedbackCommands

Disable the menus for reporting sites (Submit Feedback, Report Deceptive Site).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableFeedbackCommands` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableFeedbackCommands (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableFeedbackCommands</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableFeedbackCommands": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableFeedbackCommands` | 61.0 |  |

## DisableFirefoxAccounts

Disable Firefox Accounts integration (Sync).

**CCK2 Equivalent:** `disableSync`\
**Preferences Affected:** `identity.fxaccounts.enabled`

### Settings

<div class="settings" markdown="1">

`DisableFirefoxAccounts` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableFirefoxAccounts (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableFirefoxAccounts</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableFirefoxAccounts": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableFirefoxAccounts` | 60.0 |  |

## DisableFirefoxScreenshots

Remove access to Firefox Screenshots.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `extensions.screenshots.disabled`

### Settings

<div class="settings" markdown="1">

`DisableFirefoxScreenshots` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableFirefoxScreenshots (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableFirefoxScreenshots</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableFirefoxScreenshots": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableFirefoxScreenshots` | 60.0 |  |

## DisableFirefoxStudies

Disable Firefox studies (Shield).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons`, `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features`

### Settings

<div class="settings" markdown="1">

`DisableFirefoxStudies` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableFirefoxStudies (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableFirefoxStudies</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableFirefoxStudies": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableFirefoxStudies` | 60.0 |  |

## DisableForgetButton

Disable the "Forget" button.

**CCK2 Equivalent:** `disableForget`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableForgetButton` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableForgetButton (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableForgetButton</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableForgetButton": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableForgetButton` | 61.0 |  |

## DisableFormHistory

Turn off saving information on web forms and the search bar.

**CCK2 Equivalent:** `disableFormFill`\
**Preferences Affected:** `browser.formfill.enable`

### Settings

<div class="settings" markdown="1">

`DisableFormHistory` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableFormHistory (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableFormHistory</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableFormHistory": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableFormHistory` | 60.0 |  |

## DisableMasterPasswordCreation

Remove the master password functionality.

If this value is true, it works the same as setting [`PrimaryPassword`](#primarypassword) to false and removes the primary password functionality.

If both `DisableMasterPasswordCreation` and `PrimaryPassword` are used, `DisableMasterPasswordCreation` takes precedent.

**CCK2 Equivalent:** `noMasterPassword`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableMasterPasswordCreation` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableMasterPasswordCreation (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableMasterPasswordCreation</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableMasterPasswordCreation": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableMasterPasswordCreation` | 61.0 |  |

## DisablePasswordReveal

Do not allow passwords to be shown in saved logins.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisablePasswordReveal` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisablePasswordReveal (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisablePasswordReveal</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisablePasswordReveal": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisablePasswordReveal` | 71.0 |  |

## DisablePocket

Remove Pocket in the Firefox UI.

It does not remove it from the new tab page.

**CCK2 Equivalent:** `disablePocket`\
**Preferences Affected:** `extensions.pocket.enabled`

### Settings

<div class="settings" markdown="1">

`DisablePocket` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisablePocket (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisablePocket</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisablePocket": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisablePocket` | 60.0 |  |

## DisablePrivateBrowsing

Remove access to private browsing.

This policy is superseded by [`PrivateBrowsingModeAvailability`](#privatebrowsingmodeavailability)

**CCK2 Equivalent:** `disablePrivateBrowsing`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisablePrivateBrowsing` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisablePrivateBrowsing (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisablePrivateBrowsing</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisablePrivateBrowsing": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisablePrivateBrowsing` | 60.0 |  |

## DisableProfileImport

Remove the ability to import data from other browsers.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableProfileImport` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableProfileImport (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableProfileImport</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableProfileImport": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableProfileImport` | 61.0 |  |

## DisableProfileRefresh

Disable the Refresh Firefox button on 'about:support' and 'support.mozilla.org', as well as the prompt that displays offering to refresh Firefox when you haven't used it in a while.

**CCK2 Equivalent:** `disableResetFirefox`\
**Preferences Affected:** `browser.disableResetPrompt`

### Settings

<div class="settings" markdown="1">

`DisableProfileRefresh` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableProfileRefresh (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableProfileRefresh</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableProfileRefresh": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableProfileRefresh` | 61.0 |  |

## DisableSafeMode

Disable safe mode (Troubleshoot Mode) within the browser.

On Windows, this disables safe mode via the command line as well.

**CCK2 Equivalent:** `disableSafeMode`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableSafeMode` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableSafeMode (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableSafeMode</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableSafeMode": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableSafeMode` | 61.0 |  |

## DisableSecurityBypass

Prevent the user from bypassing security in certain cases.

`InvalidCertificate` prevents adding an exception when an invalid certificate is shown.

`SafeBrowsing` prevents selecting "ignore the risk" and visiting a harmful site anyway.

These policies only affect what happens when an error is shown, they do not affect any settings in preferences.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.certerror.hideAddException`, `browser.safebrowsing.allowOverride`

### Settings

<div class="settings" markdown="1">

`InvalidCertificate` (boolean)

`SafeBrowsing` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableSecurityBypass\InvalidCertificate (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\DisableSecurityBypass\SafeBrowsing (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableSecurityBypass</key>
  <dict>
    <key>InvalidCertificate</key>
    <true/>
    <key>SafeBrowsing</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableSecurityBypass": {
      "InvalidCertificate": true,
      "SafeBrowsing": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableSecurityBypass`<br>`DisableSecurityBypass_InvalidCertificate`<br>`DisableSecurityBypass_SafeBrowsing` | 61.0 |  |

## DisableSetDesktopBackground

Remove the "Set As Desktop Background..." menuitem when right clicking on an image.

**CCK2 Equivalent:** `removeSetDesktopBackground`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableSetDesktopBackground` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableSetDesktopBackground (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableSetDesktopBackground</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableSetDesktopBackground": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableSetDesktopBackground` | 61.0 |  |

## DisableSystemAddonUpdate

Prevent system add-ons from being installed or updated.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableSystemAddonUpdate` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableSystemAddonUpdate (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableSystemAddonUpdate</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableSystemAddonUpdate": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableSystemAddonUpdate` | 61.0 |  |

## DisableTelemetry

Prevent the upload of telemetry data.

As of Firefox 83 and Firefox ESR 78.5, local storage of telemetry data is disabled as well.

Mozilla recommends that you do not disable telemetry. Information collected through telemetry helps us build a better product for businesses like yours.

**CCK2 Equivalent:** `disableTelemetry`\
**Preferences Affected:** `datareporting.healthreport.uploadEnabled`, `datareporting.policy.dataSubmissionEnabled`, `toolkit.telemetry.archive.enabled`, `datareporting.usage.uploadEnabled`

### Settings

<div class="settings" markdown="1">

`DisableTelemetry` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableTelemetry (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableTelemetry</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableTelemetry": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableTelemetry` | 61.0 |  |

## DisableThirdPartyModuleBlocking

Do not allow blocking third-party modules from the 'about:third-party' page.

This policy only works on Windows through GPO (not policies.json).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableThirdPartyModuleBlocking` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableThirdPartyModuleBlocking (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableThirdPartyModuleBlocking</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableThirdPartyModuleBlocking": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableThirdPartyModuleBlocking` | 110.0 |  |

## DisplayBookmarksToolbar

Set the initial state of the bookmarks toolbar.

A user can still change how it is displayed.

`always` means the bookmarks toolbar is always shown.

`never` means the bookmarks toolbar is not shown.

`newtab` means the bookmarks toolbar is only shown on the new tab page.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisplayBookmarksToolbar` (string: `always`, `never` or `newtab`)
> *`always`: Show the bookmarks toolbar on every page.*\
> *`never`: Hide the bookmarks toolbar.*\
> *`newtab`: Show the bookmarks toolbar only on the New Tab page.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisplayBookmarksToolbar (REG_SZ) = always
```

#### macOS
```
<dict>
  <key>DisplayBookmarksToolbar</key>
  <string>always</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisplayBookmarksToolbar": "always"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisplayBookmarksToolbar` | 60.0 |  |

## DisplayMenuBar

Set the state of the menubar.

`always` means the menubar is shown and cannot be hidden.

`never` means the menubar is hidden and cannot be shown.

`default-on` means the menubar is on by default but can be hidden.

`default-off` means the menubar is off by default but can be shown.

**CCK2 Equivalent:** `displayMenuBar`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisplayMenuBar` (string: `always`, `never`, `default-on` or `default-off`)
> *`always`: The menu bar is shown and the user cannot hide it.*\
> *`never`: The menu bar is hidden and the user cannot show it, including by pressing Alt.*\
> *`default-on`: The menu bar starts visible and the user can hide it.*\
> *`default-off`: The menu bar starts hidden and the user can show it.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisplayMenuBar (REG_SZ) = always
```

#### macOS
```
<dict>
  <key>DisplayMenuBar</key>
  <string>always</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisplayMenuBar": "always"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisplayMenuBar` | 60.0 |  |

## DNSOverHTTPS

Configure DNS over HTTPS (DoH).

`Enabled` determines whether DNS over HTTPS is enabled

`ProviderURL` is a URL to another provider.

`Locked` prevents the user from changing DNS over HTTPS preferences.

`ExcludedDomains` excludes domains from DNS over HTTPS.

`Fallback` determines whether or not Firefox will use your default DNS resolver if there is a problem with the secure DNS provider.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.trr.mode`, `network.trr.uri`

### Settings

<div class="settings" markdown="1">

`Enabled` (boolean)

`ProviderURL` (string, URL)

`ExcludedDomains` (list of strings)

`Fallback` (boolean)

`Locked` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DNSOverHTTPS\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\DNSOverHTTPS\ProviderURL (REG_SZ) = https://dns.example.com/dns-query
Software\Policies\Mozilla\Firefox\DNSOverHTTPS\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\DNSOverHTTPS\ExcludedDomains\1 (REG_SZ) = example.com
Software\Policies\Mozilla\Firefox\DNSOverHTTPS\Fallback (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DNSOverHTTPS</key>
  <dict>
    <key>Enabled</key>
    <true/>
    <key>ProviderURL</key>
    <string>https://dns.example.com/dns-query</string>
    <key>Locked</key>
    <true/>
    <key>ExcludedDomains</key>
    <array>
      <string>example.com</string>
    </array>
    <key>Fallback</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DNSOverHTTPS": {
      "Enabled": true,
      "ProviderURL": "https://dns.example.com/dns-query",
      "Locked": true,
      "ExcludedDomains": ["example.com"],
      "Fallback": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DNSOverHTTPS`<br>`DNSOverHTTPS_Enabled`<br>`DNSOverHTTPS_ProviderURL`<br>`DNSOverHTTPS_Locked` | 64.0 |  |
| `DNSOverHTTPS_ExcludedDomains` | 75.0 |  |
| `DNSOverHTTPS_Fallback` | 124.0 |  |

## DontCheckDefaultBrowser

Don't check if Firefox is the default browser at startup.

**CCK2 Equivalent:** `dontCheckDefaultBrowser`\
**Preferences Affected:** `browser.shell.checkDefaultBrowser`

### Settings

<div class="settings" markdown="1">

`DontCheckDefaultBrowser` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DontCheckDefaultBrowser (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DontCheckDefaultBrowser</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DontCheckDefaultBrowser": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DontCheckDefaultBrowser` | 60.0 |  |

## DownloadDirectory

Set and lock the download directory.

You can use ${home} for the native home directory.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.download.dir`, `browser.download.folderList`, `browser.download.useDownloadDir`

### Settings

<div class="settings" markdown="1">

`DownloadDirectory` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DownloadDirectory (REG_SZ) = ${home}/Downloads
```

#### macOS
```
<dict>
  <key>DownloadDirectory</key>
  <string>${home}/Downloads</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DownloadDirectory": "${home}/Downloads"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DownloadDirectory` | 68.0 |  |

## EnableTrackingProtection

Configure tracking protection.

If this policy is not configured, tracking protection is not enabled by default in the browser, but it is enabled by default in private browsing and the user can change it.

If `Value` is set to false, tracking protection is disabled and locked in both the regular browser and private browsing.

If `Value` is set to true, tracking protection is enabled by default in both the regular browser and private browsing.

If `Locked` is set to true, users cannot change tracking protection values.

If `Cryptomining` is set to true, cryptomining scripts on websites are blocked.

If `Fingerprinting` is set to true, fingerprinting scripts on websites are blocked.

If `EmailTracking` is set to true, hidden email tracking pixels and scripts on websites are blocked. (Firefox 112)

If `SuspectedFingerprinting` is set to true, Firefox reduces the amount of information exposed to websites to protect against potential fingerprinting attempts. (Firefox 142, Firefox ESR 140.2)

`Exceptions` are origins for which tracking protection is not enabled.

`Category` can be either ```strict``` or ```standard```. If category is set, it overrides all other settings except `Exceptions`, `BaselineExceptions` and `ConvenienceExceptions`, and the user cannot change the category. (Firefox 142, Firefox ESR 140.2)

IF `BaselineExceptions` is true, Firefox will automatically apply exceptions required to avoid major website breakage. (Firefox 145)

If `ConvenienceExceptions`is true, Firefox will apply exceptions automatically that are only required to fix minor issues and make convenience features available. (Firefox 145)

Note: Users can change `BaselineExceptions` and `ConvenienceExceptions` even when `Category` is set to ```strict``` unless `Locked` is set to true. If `Locked` is set to true, the defaults are used unless a different value is specified in policy for `BaselineExceptions` and `ConvenienceExceptions`.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `privacy.trackingprotection.enabled`, `privacy.trackingprotection.pbmode.enabled`, `privacy.trackingprotection.cryptomining.enabled`, `privacy.trackingprotection.fingerprinting.enabled`, `privacy.fingerprintingProtection`, `privacy.trackingprotection.emailtracking.enabled`, `privacy.trackingprotection.emailtracking.pbmode.enabled`, `privacy.trackingprotection.allow_list.baseline.enabled`, `privacy.trackingprotection.allow_list.convenience.enabled`

### Settings

<div class="settings" markdown="1">

`Value` (boolean)

`Locked` (boolean)

`Cryptomining` (boolean)

`Fingerprinting` (boolean)

`EmailTracking` (boolean)

`SuspectedFingerprinting` (boolean)

`Exceptions` (list of origins)

`Category` (string: `standard` or `strict`)
> *`standard`: Apply the standard Enhanced Tracking Protection level, which balances protection against site breakage.*\
> *`strict`: Apply the strict Enhanced Tracking Protection level, which blocks more trackers and may break some sites.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\EnableTrackingProtection\Value (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\EnableTrackingProtection\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\EnableTrackingProtection\Cryptomining (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\EnableTrackingProtection\Fingerprinting (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\EnableTrackingProtection\EmailTracking (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\EnableTrackingProtection\SuspectedFingerprinting (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\EnableTrackingProtection\Category (REG_SZ) = strict
Software\Policies\Mozilla\Firefox\EnableTrackingProtection\Exceptions\1 (REG_SZ) = https://example.com
Software\Policies\Mozilla\Firefox\EnableTrackingProtection\BaselineExceptions (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\EnableTrackingProtection\ConvenienceExceptions (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>EnableTrackingProtection</key>
  <dict>
    <key>Value</key>
    <true/>
    <key>Locked</key>
    <true/>
    <key>Cryptomining</key>
    <true/>
    <key>Fingerprinting</key>
    <true/>
    <key>EmailTracking</key>
    <true/>
    <key>SuspectedFingerprinting</key>
    <true/>
    <key>Category</key>
    <string>strict</string>
    <key>Exceptions</key>
    <array>
      <string>https://example.com</string>
    </array>
    <key>BaselineExceptions</key>
    <true/>
    <key>ConvenienceExceptions</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "EnableTrackingProtection": {
      "Value": true,
      "Locked": true,
      "Cryptomining": true,
      "Fingerprinting": true,
      "EmailTracking": true,
      "SuspectedFingerprinting": true,
      "Category": "strict",
      "Exceptions": ["https://example.com"],
      "BaselineExceptions": true,
      "ConvenienceExceptions": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `EnableTrackingProtection`<br>`EnableTrackingProtection_Value`<br>`EnableTrackingProtection_Locked` | 61.0 |  |
| `EnableTrackingProtection_Cryptomining`<br>`EnableTrackingProtection_Fingerprinting` | 70.0 |  |
| `EnableTrackingProtection_EmailTracking` | 112.0 |  |
| `EnableTrackingProtection_SuspectedFingerprinting` | 142.0, 140.1.0esr |  |
| `EnableTrackingProtection_Exceptions` | 73.0 |  |
| `EnableTrackingProtection_Category` | 141.0, 140.1.0esr |  |

## EncryptedMediaExtensions

Enable or disable Encrypted Media Extensions and optionally lock it.

If `Enabled` is set to false, encrypted media extensions (like Widevine) are not downloaded by Firefox unless the user consents to installing them.

If `Locked` is set to true and `Enabled` is set to false, Firefox will not download encrypted media extensions (like Widevine) or ask the user to install them.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `media.eme.enabled`

### Settings

<div class="settings" markdown="1">

`Enabled` (boolean)

`Locked` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\EncryptedMediaExtensions\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\EncryptedMediaExtensions\Locked (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>EncryptedMediaExtensions</key>
  <dict>
    <key>Enabled</key>
    <true/>
    <key>Locked</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "EncryptedMediaExtensions": {
      "Enabled": true,
      "Locked": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `EncryptedMediaExtensions`<br>`EncryptedMediaExtensions_Enabled`<br>`EncryptedMediaExtensions_Locked` | 77.0 |  |

## ExemptDomainFileTypePairsFromFileTypeDownloadWarnings

Disable warnings based on file extension for specific file types on domains.

This policy is based on the [Chrome policy](https://chromeenterprise.google/policies/#ExemptDomainFileTypePairsFromFileTypeDownloadWarnings) of the same name.

Important: The documentation for the policy for both Edge and Chrome is incorrect. The ```domains``` value must be a domain, not a URL pattern. Also, we do not support using ```*``` to mean all domains.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`file_extension` (string)

`domains` (list of strings)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\ExemptDomainFileTypePairsFromFileTypeDownloadWarnings\1\file_extension (REG_SZ) = jnlp
Software\Policies\Mozilla\Firefox\ExemptDomainFileTypePairsFromFileTypeDownloadWarnings\1\domains\1 (REG_SZ) = example.com
```

#### macOS
```
<dict>
  <key>ExemptDomainFileTypePairsFromFileTypeDownloadWarnings</key>
  <array>
    <dict>
      <key>file_extension</key>
      <string>jnlp</string>
      <key>domains</key>
      <array>
        <string>example.com</string>
      </array>
    </dict>
  </array>
</dict>
```

#### policies.json
```
{
  "policies": {
    "ExemptDomainFileTypePairsFromFileTypeDownloadWarnings": [
      {
        "file_extension": "jnlp",
        "domains": ["example.com"]
      }
    ]
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `ExemptDomainFileTypePairsFromFileTypeDownloadWarnings` | 102.0 |  |

## Extensions

Control the installation, uninstallation and locking of extensions.

Note: The **[`ExtensionSettings`](#extensionsettings)** policy was added in Firefox 69. It provides additional functionality and is closer in compatibility to Chrome and Edge. It does not support native paths, though, so you'll have to use file:/// URLs. I'd recommend trying it before using this policy. Any future improvements will happen in that policy.

We will not, however, be removing this policy.

`Install` is a list of URLs or native paths for extensions to be installed.

`Uninstall` is a list of extension IDs that should be uninstalled if found.

`Locked` is a list of extension IDs that the user cannot disable or uninstall.

**CCK2 Equivalent:** `addons`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Install` (list of strings)

`Uninstall` (list of strings)

`Locked` (list of strings)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Extensions\Install\1 (REG_SZ) = https://addons.mozilla.org/firefox/downloads/somefile.xpi
Software\Policies\Mozilla\Firefox\Extensions\Install\2 (REG_SZ) = //path/to/xpi
Software\Policies\Mozilla\Firefox\Extensions\Uninstall\1 (REG_SZ) = bad_addon_id@mozilla.org
Software\Policies\Mozilla\Firefox\Extensions\Locked\1 (REG_SZ) = addon_id@mozilla.org
```

#### macOS
```
<dict>
  <key>Extensions</key>
  <dict>
    <key>Install</key>
    <array>
      <string>https://addons.mozilla.org/firefox/downloads/somefile.xpi</string>
      <string>//path/to/xpi</string>
    </array>
    <key>Uninstall</key>
    <array>
      <string>bad_addon_id@mozilla.org</string>
    </array>
    <key>Locked</key>
    <array>
      <string>addon_id@mozilla.org</string>
    </array>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Extensions": {
      "Install": ["https://addons.mozilla.org/firefox/downloads/somefile.xpi", "//path/to/xpi"],
      "Uninstall": ["bad_addon_id@mozilla.org"],
      "Locked": ["addon_id@mozilla.org"]
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Extensions`<br>`Extensions_Install`<br>`Extensions_Uninstall`<br>`Extensions_Locked` | 61.0 |  |

## ExtensionSettings

Manage all aspects of extensions.

This policy is based heavily on the [Chrome policy](https://dev.chromium.org/administrators/policy-list-3/extension-settings-full) of the same name.

This policy maps an extension ID to its configuration. With an extension ID, the configuration will be applied to the specified extension only. A default configuration can be set for the special ID `"*"`, which will apply to all extensions that don't have a custom configuration set in this policy.

To obtain an extension ID, install the extension and go to **about:support**. You will see the ID in the Extensions section. I've also created an extension that makes it easy to find the ID of extensions on AMO. You can download it [here](https://github.com/mkaply/queryamoid/releases/tag/v0.1).

**Note:**
If the extension ID is a UUID (for example `{12345678-1234-1234-1234-1234567890ab}`), you must include the curly braces around the ID.

The configuration for each extension is another dictionary that can contain the fields documented below.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`*` (object)
- `installation_mode` (string: `allowed` or `blocked`)
  > *`allowed`: Users can install extensions.*\
  > *`blocked`: No extension can be installed. An extension with its own entry in this policy is exempt, whatever that entry says.*
- `allowed_types` (list of strings: `extension`, `dictionary`, `locale`, `theme` or `sitepermission`)
  > *`extension`: Ordinary browser extensions.*\
  > *`dictionary`: Spell-checking dictionaries.*\
  > *`locale`: Language packs that translate the Firefox interface.*\
  > *`theme`: Themes that change the appearance of Firefox.*\
  > *`sitepermission`: Add-ons that grant one site access to a restricted capability.*
- `blocked_install_message` (string)
- `install_sources` (list of strings)
- `restricted_domains` (list of strings)
- `temporarily_allow_weak_signatures` (boolean)

`[name]` (object)
- `installation_mode` (string: `allowed`, `blocked`, `force_installed` or `normal_installed`)
  > *`allowed`: The extension may be installed, even when extensions are blocked by default.*\
  > *`blocked`: The extension cannot be installed, and is uninstalled if already present.*\
  > *`force_installed`: The extension is installed automatically and the user can neither disable nor remove it.*\
  > *`normal_installed`: The extension is installed automatically. The user can disable it but cannot remove it.*
- `install_url` (string)
- `blocked_install_message` (string)
- `updates_disabled` (boolean)
- `default_area` (string: `navbar` or `menupanel`)
  > *`navbar`: Place the extension's button on the toolbar.*\
  > *`menupanel`: Place the extension's button in the extensions panel instead of the toolbar.*
- `temporarily_allow_weak_signatures` (boolean)
- `private_browsing` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\ExtensionSettings (REG_MULTI_SZ) = 
{
  "*": {
    "blocked_install_message": "Custom error message.",
    "install_sources": ["https://yourwebsite.com/*"],
    "installation_mode": "blocked"
  },
  "uBlock0@raymondhill.net": {
    "installation_mode": "force_installed",
    "install_url": "https://addons.mozilla.org/firefox/downloads/latest/ublock-origin/latest.xpi"
  },
  "adguardadblocker@adguard.com": {
    "installation_mode": "force_installed",
    "install_url": "https://addons.mozilla.org/firefox/downloads/latest/adguardadblocker@adguard.com/latest.xpi"
  },
  "https-everywhere@eff.org": {
    "installation_mode": "allowed",
    "updates_disabled": false
  }
}
```

#### macOS
```
<dict>
  <key>ExtensionSettings</key>
  <dict>
    <key>*</key>
    <dict>
      <key>blocked_install_message</key>
      <string>Custom error message.</string>
      <key>install_sources</key>
      <array>
        <string>https://yourwebsite.com/*</string>
      </array>
      <key>installation_mode</key>
      <string>blocked</string>
    </dict>
    <key>uBlock0@raymondhill.net</key>
    <dict>
      <key>installation_mode</key>
      <string>force_installed</string>
      <key>install_url</key>
      <string>https://addons.mozilla.org/firefox/downloads/latest/ublock-origin/latest.xpi</string>
    </dict>
    <key>adguardadblocker@adguard.com</key>
    <dict>
      <key>installation_mode</key>
      <string>force_installed</string>
      <key>install_url</key>
      <string>https://addons.mozilla.org/firefox/downloads/latest/adguardadblocker@adguard.com/latest.xpi</string>
    </dict>
    <key>https-everywhere@eff.org</key>
    <dict>
      <key>installation_mode</key>
      <string>allowed</string>
      <key>updates_disabled</key>
      <false/>
    </dict>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "ExtensionSettings": {
      "*": {
        "blocked_install_message": "Custom error message.",
        "install_sources": ["https://yourwebsite.com/*"],
        "installation_mode": "blocked"
      },
      "uBlock0@raymondhill.net": {
        "installation_mode": "force_installed",
        "install_url": "https://addons.mozilla.org/firefox/downloads/latest/ublock-origin/latest.xpi"
      },
      "adguardadblocker@adguard.com": {
        "installation_mode": "force_installed",
        "install_url": "https://addons.mozilla.org/firefox/downloads/latest/adguardadblocker@adguard.com/latest.xpi"
      },
      "https-everywhere@eff.org": {
        "installation_mode": "allowed",
        "updates_disabled": false
      }
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `ExtensionSettings`<br>`ExtensionSettings_*`<br>`ExtensionSettings_*_installation_mode`<br>`ExtensionSettings_*_allowed_types`<br>`ExtensionSettings_*_blocked_install_message`<br>`ExtensionSettings_*_install_sources`<br>`ExtensionSettings_[name]`<br>`ExtensionSettings_[name]_installation_mode`<br>`ExtensionSettings_[name]_install_url`<br>`ExtensionSettings_[name]_blocked_install_message` | 68.0 |  |
| `ExtensionSettings_*_restricted_domains` | 78.0 |  |
| `ExtensionSettings_*_temporarily_allow_weak_signatures`<br>`ExtensionSettings_[name]_temporarily_allow_weak_signatures` | 126.0 |  |
| `ExtensionSettings_[name]_updates_disabled` | 89.0 |  |
| `ExtensionSettings_[name]_default_area` | 113.0 |  |
| `ExtensionSettings_[name]_private_browsing` | 136.0 |  |

## ExtensionUpdate

Control extension updates.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `extensions.update.enabled`

### Settings

<div class="settings" markdown="1">

`ExtensionUpdate` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\ExtensionUpdate (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>ExtensionUpdate</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "ExtensionUpdate": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `ExtensionUpdate` | 67.0 |  |

## FirefoxHome

Customize the Firefox Home page.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.newtabpage.activity-stream.showSearch`, `browser.newtabpage.activity-stream.feeds.topsites`, `browser.newtabpage.activity-stream.feeds.section.highlights`, `browser.newtabpage.activity-stream.feeds.section.topstories`, `browser.newtabpage.activity-stream.feeds.snippets`, `browser.newtabpage.activity-stream.showSponsoredTopSites`, `browser.newtabpage.activity-stream.showSponsored`

### Settings

<div class="settings" markdown="1">

`Search` (boolean)

`Weather` (boolean)

`TopSites` (boolean)

`SponsoredTopSites` (boolean)

`Highlights` (boolean)

`Pocket` (boolean)

`Stories` (boolean)

`SponsoredPocket` (boolean)

`SponsoredStories` (boolean)

`Snippets` (boolean)

`Locked` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\FirefoxHome\Search (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxHome\TopSites (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxHome\SponsoredTopSites (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxHome\Highlights (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxHome\Pocket (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxHome\Stories (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxHome\SponsoredPocket (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxHome\SponsoredStories (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxHome\Snippets (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxHome\Widgets\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxHome\Widgets\Blocked\1 (REG_SZ) = crossword
Software\Policies\Mozilla\Firefox\FirefoxHome\Widgets\Blocked\2 (REG_SZ) = stocks
Software\Policies\Mozilla\Firefox\FirefoxHome\Locked (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>FirefoxHome</key>
  <dict>
    <key>Search</key>
    <true/>
    <key>TopSites</key>
    <true/>
    <key>SponsoredTopSites</key>
    <true/>
    <key>Highlights</key>
    <true/>
    <key>Pocket</key>
    <true/>
    <key>Stories</key>
    <true/>
    <key>SponsoredPocket</key>
    <true/>
    <key>SponsoredStories</key>
    <true/>
    <key>Snippets</key>
    <true/>
    <key>Widgets</key>
    <dict>
      <key>Enabled</key>
      <true/>
      <key>Blocked</key>
      <array>
        <string>crossword</string>
        <string>stocks</string>
      </array>
    </dict>
    <key>Locked</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "FirefoxHome": {
      "Search": true,
      "TopSites": true,
      "SponsoredTopSites": true,
      "Highlights": true,
      "Pocket": true,
      "Stories": true,
      "SponsoredPocket": true,
      "SponsoredStories": true,
      "Snippets": true,
      "Widgets": {
        "Enabled": true,
        "Blocked": ["crossword", "stocks"]
      },
      "Locked": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `FirefoxHome`<br>`FirefoxHome_Search`<br>`FirefoxHome_TopSites`<br>`FirefoxHome_Highlights`<br>`FirefoxHome_Pocket`<br>`FirefoxHome_Snippets`<br>`FirefoxHome_Locked` | 68.0 |  |
| `FirefoxHome_Weather` | 152.0, 140.12.0esr |  |
| `FirefoxHome_SponsoredTopSites`<br>`FirefoxHome_SponsoredPocket` | 95.0 |  |
| `FirefoxHome_Stories`<br>`FirefoxHome_SponsoredStories` | 142.0, 140.1.0esr |  |

## FirefoxSuggest

Customize Firefox Suggest (US only).

As of Firefox 146, `WebSuggestions` turns off Suggest completely.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.urlbar.suggest.quicksuggest.all`, `browser.urlbar.suggest.quicksuggest.sponsored`, `browser.urlbar.quicksuggest.dataCollection.enabled`

### Settings

<div class="settings" markdown="1">

`WebSuggestions` (boolean)

`SponsoredSuggestions` (boolean)

`ImproveSuggest` (boolean)

`Locked` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\FirefoxSuggest\WebSuggestions (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxSuggest\SponsoredSuggestions (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxSuggest\ImproveSuggest (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\FirefoxSuggest\Locked (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>FirefoxSuggest</key>
  <dict>
    <key>WebSuggestions</key>
    <true/>
    <key>SponsoredSuggestions</key>
    <true/>
    <key>ImproveSuggest</key>
    <true/>
    <key>Locked</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "FirefoxSuggest": {
      "WebSuggestions": true,
      "SponsoredSuggestions": true,
      "ImproveSuggest": true,
      "Locked": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `FirefoxSuggest`<br>`FirefoxSuggest_WebSuggestions`<br>`FirefoxSuggest_SponsoredSuggestions`<br>`FirefoxSuggest_ImproveSuggest`<br>`FirefoxSuggest_Locked` | 118.0 |  |

## GenerativeAI

Configure generative AI features.

`Enabled` Controls whether generative AI features are enabled by default. If false, all generative AI features are disabled by default. Individual generative AI policies can override this setting.

`Chatbot` Controls access to AI chatbots in the sidebar. If false, AI chatbots are not available in the sidebar.

`LinkPreviews` (Firefox 144+) Controls whether AI is used to generate link previews. If false, AI is not used to generate link previews.

`TabGroups` (Firefox 144+) Controls whether AI is used to suggest names and tabs for tab groups. If false, AI is not used to suggest names or tabs for tab groups.

`Locked` Prevents the user from changing generative AI preferences.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.ml.chat.enabled`, `browser.ml.chat.page`, `browser.ml.linkPreview.optin`, `browser.tabs.groups.smart.userEnabled`

### Settings

<div class="settings" markdown="1">

`Chatbot` (boolean)

`LinkPreviews` (boolean)

`TabGroups` (boolean)

`Enabled` (boolean)

`Locked` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\GenerativeAI\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\GenerativeAI\Chatbot (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\GenerativeAI\LinkPreviews (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\GenerativeAI\TabGroups (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\GenerativeAI\Locked (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>GenerativeAI</key>
  <dict>
    <key>Enabled</key>
    <true/>
    <key>Chatbot</key>
    <true/>
    <key>LinkPreviews</key>
    <true/>
    <key>TabGroups</key>
    <true/>
    <key>Locked</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "GenerativeAI": {
      "Enabled": true,
      "Chatbot": true,
      "LinkPreviews": true,
      "TabGroups": true,
      "Locked": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `GenerativeAI`<br>`GenerativeAI_Chatbot`<br>`GenerativeAI_LinkPreviews`<br>`GenerativeAI_TabGroups`<br>`GenerativeAI_Enabled`<br>`GenerativeAI_Locked` | 144.0, 140.4.0esr |  |

## GoToIntranetSiteForSingleWordEntryInAddressBar

Whether to always go through the DNS server before sending a single word search string to a search engine.

If the site exists, it will navigate to the website. If the intranet responds with a 404, the page will show a 404. If the intranet does not respond, the browser will attempt a search.

The second result in the URL bar will be a search result to allow users to conduct a web search exactly as it was entered.

If instead you would like to enable the ability to have your domain appear as a valid URL and to disallow the browser from ever searching that term using the first result that matches it, add the pref `browser.fixup.domainwhitelist.YOUR_DOMAIN` (where `YOUR_DOMAIN` is the name of the domain you'd like to add), and set the pref to `true`. The URL bar will then suggest `YOUR_DOMAIN` when the user fully types `YOUR_DOMAIN`. If the user attempts to load that domain and it fails to load, it will show an "Unable to connect" error page.

You can also whitelist a domain suffix that is not part of the [Public Suffix List](https://publicsuffix.org/) by adding the pref `browser.fixup.domainsuffixwhitelist.YOUR_DOMAIN_SUFFIX` with a value of `true`.

Additionally, if you want users to see a "Did you mean to go to 'YOUR_DOMAIN'" prompt below the URL bar if they land on a search results page instead of an intranet domain that provides a response, set the pref `browser.urlbar.dnsResolveSingleWordsAfterSearch` to `1`. Enabling this will cause the browser to commit a DNS check after every single word search. If the browser receives a response from the intranet, a prompt will ask the user if they'd like to instead navigate to `YOUR_DOMAIN`. If the user presses the **yes** button, `browser.fixup.domainwhitelist.YOUR_DOMAIN` will be set to `true`.

**CCK2 Equivalent:** `N/A`\
**Preferences Affected:** `browser.fixup.dns_first_for_single_words`

### Settings

<div class="settings" markdown="1">

`GoToIntranetSiteForSingleWordEntryInAddressBar` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\GoToIntranetSiteForSingleWordEntryInAddressBar (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>GoToIntranetSiteForSingleWordEntryInAddressBar</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "GoToIntranetSiteForSingleWordEntryInAddressBar": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `GoToIntranetSiteForSingleWordEntryInAddressBar` | 104.0 |  |

## Handlers

Configure default application handlers.

This policy is based on the internal format of `handlers.json`.

You can configure handlers based on a mime type (`mimeTypes`), a file's extension (`extensions`), or a protocol (`schemes`).

Within each handler type, you specify the given mimeType/extension/scheme as a key and use the following subkeys to describe how it is handled.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`(mimeTypes|extensions|schemes)` (object)
- `[name]` (object)
  - `action` (string: `saveToDisk`, `useHelperApp` or `useSystemDefault`)
    > *`saveToDisk`: Download the file instead of opening it.*\
    > *`useHelperApp`: Open the content with an application listed in `handlers`.*\
    > *`useSystemDefault`: Open the content with the application the operating system associates with that type.*
  - `ask` (boolean)
  - `handlers` (list of objects)
    - `name` (string)
    - `path` (string)
    - `uriTemplate` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Handlers (REG_MULTI_SZ) = 
{
  "mimeTypes": {
    "application/msword": {
      "action": "useSystemDefault",
      "ask": false
    }
  },
  "schemes": {
    "mailto": {
      "action": "useHelperApp",
      "ask": true,
      "handlers": [
        {
          "name": "Gmail",
          "uriTemplate": "https://mail.google.com/mail/?extsrc=mailto&url=%s"
        }
      ]
    }
  },
  "extensions": {
    "pdf": {
      "action": "useHelperApp",
      "ask": true,
      "handlers": [
        {
          "name": "Adobe Acrobat",
          "path": "/usr/bin/acroread"
        }
      ]
    }
  }
}
```

#### macOS
```
<dict>
  <key>Handlers</key>
  <dict>
    <key>mimeTypes</key>
    <dict>
      <key>application/msword</key>
      <dict>
        <key>action</key>
        <string>useSystemDefault</string>
        <key>ask</key>
        <false/>
      </dict>
    </dict>
    <key>schemes</key>
    <dict>
      <key>mailto</key>
      <dict>
        <key>action</key>
        <string>useHelperApp</string>
        <key>ask</key>
        <true/>
        <key>handlers</key>
        <array>
          <dict>
            <key>name</key>
            <string>Gmail</string>
            <key>uriTemplate</key>
            <string>https://mail.google.com/mail/?extsrc=mailto&amp;url=%s</string>
          </dict>
        </array>
      </dict>
    </dict>
    <key>extensions</key>
    <dict>
      <key>pdf</key>
      <dict>
        <key>action</key>
        <string>useHelperApp</string>
        <key>ask</key>
        <true/>
        <key>handlers</key>
        <array>
          <dict>
            <key>name</key>
            <string>Adobe Acrobat</string>
            <key>path</key>
            <string>/usr/bin/acroread</string>
          </dict>
        </array>
      </dict>
    </dict>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Handlers": {
      "mimeTypes": {
        "application/msword": {
          "action": "useSystemDefault",
          "ask": false
        }
      },
      "schemes": {
        "mailto": {
          "action": "useHelperApp",
          "ask": true,
          "handlers": [
            {
              "name": "Gmail",
              "uriTemplate": "https://mail.google.com/mail/?extsrc=mailto&url=%s"
            }
          ]
        }
      },
      "extensions": {
        "pdf": {
          "action": "useHelperApp",
          "ask": true,
          "handlers": [
            {
              "name": "Adobe Acrobat",
              "path": "/usr/bin/acroread"
            }
          ]
        }
      }
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Handlers`<br>`Handlers_mimeTypes`<br>`Handlers_mimeTypes_[name]`<br>`Handlers_mimeTypes_[name]_action`<br>`Handlers_mimeTypes_[name]_ask`<br>`Handlers_mimeTypes_[name]_handlers`<br>`Handlers_extensions`<br>`Handlers_extensions_[name]`<br>`Handlers_extensions_[name]_action`<br>`Handlers_extensions_[name]_ask`<br>`Handlers_extensions_[name]_handlers`<br>`Handlers_schemes`<br>`Handlers_schemes_[name]`<br>`Handlers_schemes_[name]_action`<br>`Handlers_schemes_[name]_ask`<br>`Handlers_schemes_[name]_handlers` | 78.0 |  |

## HardwareAcceleration

Control hardware acceleration.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `layers.acceleration.disabled`

### Settings

<div class="settings" markdown="1">

`HardwareAcceleration` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\HardwareAcceleration (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>HardwareAcceleration</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "HardwareAcceleration": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `HardwareAcceleration` | 62.0 |  |

## Homepage

Configure the default homepage and how Firefox starts.

`URL` is the default homepage.

`Locked` prevents the user from changing homepage preferences.

`Additional` allows for more than one homepage.

`StartPage` is how Firefox starts.

**CCK2 Equivalent:** `homePage,lockHomePage`\
**Preferences Affected:** `browser.startup.homepage`, `browser.startup.page`

### Settings

<div class="settings" markdown="1">

`URL` (string, URL)

`Locked` (boolean)

`Additional` (list of URLs)

`StartPage` (string: `none`, `homepage`, `previous-session` or `homepage-locked`)
> *`none`: Start on a blank page.*\
> *`homepage`: Start on the homepage.*\
> *`previous-session`: Restore the windows and tabs open at the end of the previous session.*\
> *`homepage-locked`: Start on the homepage and prevent the user from changing the startup page.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Homepage\URL (REG_SZ) = http://example.com/
Software\Policies\Mozilla\Firefox\Homepage\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Homepage\Additional\1 (REG_SZ) = http://example.org/
Software\Policies\Mozilla\Firefox\Homepage\Additional\2 (REG_SZ) = http://example.edu/
Software\Policies\Mozilla\Firefox\Homepage\StartPage (REG_SZ) = none
```

#### macOS
```
<dict>
  <key>Homepage</key>
  <dict>
    <key>URL</key>
    <string>http://example.com/</string>
    <key>Locked</key>
    <true/>
    <key>Additional</key>
    <array>
      <string>http://example.org/</string>
      <string>http://example.edu/</string>
    </array>
    <key>StartPage</key>
    <string>none</string>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Homepage": {
      "URL": "http://example.com/",
      "Locked": true,
      "Additional": ["http://example.org/", "http://example.edu/"],
      "StartPage": "none"
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Homepage`<br>`Homepage_URL`<br>`Homepage_Locked`<br>`Homepage_Additional` | 60.0 |  |
| `Homepage_StartPage` | 64.0 |  |

## HttpAllowlist

Configure sites that will not be upgraded to HTTPS.

The sites are specified as a list of origins.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`HttpAllowlist` (list of origins)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\HttpAllowlist\1 (REG_SZ) = http://example.org
Software\Policies\Mozilla\Firefox\HttpAllowlist\2 (REG_SZ) = http://example.edu
```

#### macOS
```
<dict>
  <key>HttpAllowlist</key>
  <array>
    <string>http://example.org</string>
    <string>http://example.edu</string>
  </array>
</dict>
```

#### policies.json
```
{
  "policies": {
    "HttpAllowlist": ["http://example.org", "http://example.edu"]
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `HttpAllowlist` | 127.0 |  |

## HttpsOnlyMode

Configure HTTPS-Only Mode.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `dom.security.https_only_mode`

### Settings

<div class="settings" markdown="1">

`HttpsOnlyMode` (string: `allowed`, `disallowed`, `enabled` or `force_enabled`)
> *`allowed`: HTTPS-Only Mode is off by default and the user can turn it on.*\
> *`disallowed`: HTTPS-Only Mode is off and the user cannot turn it on.*\
> *`enabled`: HTTPS-Only Mode is on by default and the user can turn it off.*\
> *`force_enabled`: HTTPS-Only Mode is on and the user cannot turn it off.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\HttpsOnlyMode (REG_SZ) = allowed
```

#### macOS
```
<dict>
  <key>HttpsOnlyMode</key>
  <string>allowed</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "HttpsOnlyMode": "allowed"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `HttpsOnlyMode` | 127.0 |  |

## InstallAddonsPermission

Configure the default extension install policy as well as origins for extension installs are allowed.

This policy does not override turning off all extension installs.

`Allow` is a list of origins where extension installs are allowed.

`Default` determines whether or not extension installs are allowed by default.

**CCK2 Equivalent:** `permissions.install`\
**Preferences Affected:** `xpinstall.enabled`, `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons`, `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features`

### Settings

<div class="settings" markdown="1">

`Allow` (list of origins)

`Default` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\InstallAddonsPermission\Allow\1 (REG_SZ) = http://example.org/
Software\Policies\Mozilla\Firefox\InstallAddonsPermission\Allow\2 (REG_SZ) = http://example.edu/
Software\Policies\Mozilla\Firefox\InstallAddonsPermission\Default (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>InstallAddonsPermission</key>
  <dict>
    <key>Allow</key>
    <array>
      <string>http://example.org/</string>
      <string>http://example.edu/</string>
    </array>
    <key>Default</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "InstallAddonsPermission": {
      "Allow": ["http://example.org/", "http://example.edu/"],
      "Default": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `InstallAddonsPermission`<br>`InstallAddonsPermission_Allow`<br>`InstallAddonsPermission_Default` | 61.0 |  |

## LegacyProfiles

Disable the feature enforcing a separate profile for each installation.

If this policy set to true, Firefox will not try to create different profiles for installations of Firefox in different directories. This is the equivalent of the MOZ_LEGACY_PROFILES environment variable.

If this policy set to false, Firefox will create a new profile for each unique installation of Firefox.

This policy only work on Windows via GPO (not policies.json).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`LegacyProfiles` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\LegacyProfiles (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>LegacyProfiles</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "LegacyProfiles": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `LegacyProfiles` | 71.0 |  |

## LegacySameSiteCookieBehaviorEnabled

Enable default legacy SameSite cookie behavior setting.

If this policy is set to true, it reverts all cookies to legacy SameSite behavior which means that cookies that don't explicitly specify a ```SameSite``` attribute are treated as if they were ```SameSite=None```.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.cookie.sameSite.laxByDefault`

### Settings

<div class="settings" markdown="1">

`LegacySameSiteCookieBehaviorEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\LegacySameSiteCookieBehaviorEnabled (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>LegacySameSiteCookieBehaviorEnabled</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "LegacySameSiteCookieBehaviorEnabled": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `LegacySameSiteCookieBehaviorEnabled` | 76.0 |  |

## LegacySameSiteCookieBehaviorEnabledForDomainList

Revert to legacy SameSite behavior for cookies on specified sites.

If this policy is set to true, cookies set for domains in this list will revert to legacy SameSite behavior which means that cookies that don't explicitly specify a ```SameSite``` attribute are treated as if they were ```SameSite=None```.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.cookie.sameSite.laxByDefault.disabledHosts`

### Settings

<div class="settings" markdown="1">

`LegacySameSiteCookieBehaviorEnabledForDomainList` (list of strings)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\LegacySameSiteCookieBehaviorEnabledForDomainList\1 (REG_SZ) = example.org
Software\Policies\Mozilla\Firefox\LegacySameSiteCookieBehaviorEnabledForDomainList\2 (REG_SZ) = example.edu
```

#### macOS
```
<dict>
  <key>LegacySameSiteCookieBehaviorEnabledForDomainList</key>
  <array>
    <string>example.org</string>
    <string>example.edu</string>
  </array>
</dict>
```

#### policies.json
```
{
  "policies": {
    "LegacySameSiteCookieBehaviorEnabledForDomainList": ["example.org", "example.edu"]
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `LegacySameSiteCookieBehaviorEnabledForDomainList` | 76.0 |  |

## LocalFileLinks

Enable linking to local files by origin.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `capability.policy.localfilelinks.*`

### Settings

<div class="settings" markdown="1">

`LocalFileLinks` (list of strings)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\LocalFileLinks\1 (REG_SZ) = http://example.org/
Software\Policies\Mozilla\Firefox\LocalFileLinks\2 (REG_SZ) = http://example.edu/
```

#### macOS
```
<dict>
  <key>LocalFileLinks</key>
  <array>
    <string>http://example.org/</string>
    <string>http://example.edu/</string>
  </array>
</dict>
```

#### policies.json
```
{
  "policies": {
    "LocalFileLinks": ["http://example.org/", "http://example.edu/"]
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `LocalFileLinks` | 68.0 |  |

## ManagedBookmarks

Configures a list of bookmarks managed by an administrator that cannot be changed by the user.

The bookmarks are only added as a button on the personal toolbar. They are not in the bookmarks folder.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`children` (list of objects)
- `name` (string)
- `toplevel_name` (string)
- `url` (string)
- `children` (list of JSONs)

`name` (string)

`toplevel_name` (string)

`url` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\ManagedBookmarks (REG_MULTI_SZ) = 
[
  {
    "toplevel_name": "My managed bookmarks folder"
  },
  {
    "url": "example.com",
    "name": "Example"
  },
  {
    "name": "Mozilla links",
    "children": [
      {
        "url": "https://mozilla.org",
        "name": "Mozilla.org"
      },
      {
        "url": "https://support.mozilla.org/",
        "name": "SUMO"
      }
    ]
  }
]
```

#### macOS
```
<dict>
  <key>ManagedBookmarks</key>
  <array>
    <dict>
      <key>toplevel_name</key>
      <string>My managed bookmarks folder</string>
    </dict>
    <dict>
      <key>url</key>
      <string>example.com</string>
      <key>name</key>
      <string>Example</string>
    </dict>
    <dict>
      <key>name</key>
      <string>Mozilla links</string>
      <key>children</key>
      <array>
        <dict>
          <key>url</key>
          <string>https://mozilla.org</string>
          <key>name</key>
          <string>Mozilla.org</string>
        </dict>
        <dict>
          <key>url</key>
          <string>https://support.mozilla.org/</string>
          <key>name</key>
          <string>SUMO</string>
        </dict>
      </array>
    </dict>
  </array>
</dict>
```

#### policies.json
```
{
  "policies": {
    "ManagedBookmarks": [
      {
        "toplevel_name": "My managed bookmarks folder"
      },
      {
        "url": "example.com",
        "name": "Example"
      },
      {
        "name": "Mozilla links",
        "children": [
          {
            "url": "https://mozilla.org",
            "name": "Mozilla.org"
          },
          {
            "url": "https://support.mozilla.org/",
            "name": "SUMO"
          }
        ]
      }
    ]
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `ManagedBookmarks` | 82.0 |  |

## ManualAppUpdateOnly

Switch to manual updates only.

If this policy is enabled:
 1. The user will never be prompted to install updates
 2. Firefox will not check for updates in the background, though it will check automatically when an update UI is displayed (such as the one in the About dialog). This check will be used to show "Update to version X" in the UI, but will not automatically download the update or prompt the user to update in any other way.
 3. The update UI will work as expected, unlike when using DisableAppUpdate.

This policy is primarily intended for advanced end users, not for enterprises, but it is available via GPO.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`ManualAppUpdateOnly` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\ManualAppUpdateOnly (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>ManualAppUpdateOnly</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "ManualAppUpdateOnly": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `ManualAppUpdateOnly` | 87.0 |  |

## MicrosoftEntraSSO

Allow single sign-on for Microsoft Entra accounts on macOS.

If this policy is set to true, Firefox will use credentials stored in the Company Portal to sign in to Microsoft Entra accounts.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.http.microsoft-entra-sso.enabled`

### Settings

<div class="settings" markdown="1">

`MicrosoftEntraSSO` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\MicrosoftEntraSSO (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>MicrosoftEntraSSO</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "MicrosoftEntraSSO": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `MicrosoftEntraSSO` | 133.0 |  |

## NetworkPrediction

Enable or disable network prediction (DNS prefetching).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.dns.disablePrefetch`, `network.dns.disablePrefetchFromHTTPS`

### Settings

<div class="settings" markdown="1">

`NetworkPrediction` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\NetworkPrediction (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>NetworkPrediction</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "NetworkPrediction": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `NetworkPrediction` | 67.0 |  |

## NewTabPage

Enable or disable the New Tab page.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.newtabpage.enabled`

### Settings

<div class="settings" markdown="1">

`NewTabPage` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\NewTabPage (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>NewTabPage</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "NewTabPage": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `NewTabPage` | 68.0 |  |

## NoDefaultBookmarks

Disable the creation of default bookmarks.

This policy is only effective if the user profile has not been created yet.

**CCK2 Equivalent:** `removeDefaultBookmarks`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`NoDefaultBookmarks` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\NoDefaultBookmarks (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>NoDefaultBookmarks</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "NoDefaultBookmarks": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `NoDefaultBookmarks` | 61.0 |  |

## OfferToSaveLogins

Control whether or not Firefox offers to save passwords.

**CCK2 Equivalent:** `dontRememberPasswords`\
**Preferences Affected:** `signon.rememberSignons`

### Settings

<div class="settings" markdown="1">

`OfferToSaveLogins` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\OfferToSaveLogins (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>OfferToSaveLogins</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "OfferToSaveLogins": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `OfferToSaveLogins` | 61.0 |  |

## OfferToSaveLoginsDefault

Sets the default value of 'signon.rememberSignons' without locking it.

**CCK2 Equivalent:** `dontRememberPasswords`\
**Preferences Affected:** `signon.rememberSignons`

### Settings

<div class="settings" markdown="1">

`OfferToSaveLoginsDefault` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\OfferToSaveLoginsDefault (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>OfferToSaveLoginsDefault</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "OfferToSaveLoginsDefault": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `OfferToSaveLoginsDefault` | 70.0 |  |

## OverrideFirstRunPage

Override the first run page.

If the value is an empty string (""), the first run page is not displayed.

Starting with Firefox 83, Firefox ESR 78.5, you can also specify multiple URLS separated by a vertical bar (|).

**CCK2 Equivalent:** `welcomePage,noWelcomePage`\
**Preferences Affected:** `startup.homepage_welcome_url`

### Settings

<div class="settings" markdown="1">

`OverrideFirstRunPage` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\OverrideFirstRunPage (REG_SZ) = https://example.org
```

#### macOS
```
<dict>
  <key>OverrideFirstRunPage</key>
  <string>https://example.org</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "OverrideFirstRunPage": "https://example.org"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `OverrideFirstRunPage` | 61.0 |  |

## OverridePostUpdatePage

Override the upgrade page.

If the value is an empty string (""), no extra pages are displayed when Firefox is upgraded.

**CCK2 Equivalent:** `upgradePage,noUpgradePage`\
**Preferences Affected:** `startup.homepage_override_url`

### Settings

<div class="settings" markdown="1">

`OverridePostUpdatePage` (string, URL)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\OverridePostUpdatePage (REG_SZ) = http://example.org
```

#### macOS
```
<dict>
  <key>OverridePostUpdatePage</key>
  <string>http://example.org</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "OverridePostUpdatePage": "http://example.org"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `OverridePostUpdatePage` | 61.0 |  |

## PasswordManagerEnabled

Remove access to the password manager via preferences and blocks about:logins on Firefox 70.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `pref.privacy.disable_button.view_passwords`, `signon.rememberSignons`

### Settings

<div class="settings" markdown="1">

`PasswordManagerEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\PasswordManagerEnabled (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>PasswordManagerEnabled</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PasswordManagerEnabled": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `PasswordManagerEnabled` | 70.0 |  |

## PasswordManagerExceptions

Prevent Firefox from saving passwords for specific sites.

The sites are specified as a list of origins.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`PasswordManagerExceptions` (list of origins)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\PasswordManagerExceptions\1 (REG_SZ) = https://example.org
Software\Policies\Mozilla\Firefox\PasswordManagerExceptions\2 (REG_SZ) = https://example.edu
```

#### macOS
```
<dict>
  <key>PasswordManagerExceptions</key>
  <array>
    <string>https://example.org</string>
    <string>https://example.edu</string>
  </array>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PasswordManagerExceptions": ["https://example.org", "https://example.edu"]
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `PasswordManagerExceptions` | 101.0 |  |

## PDFjs

Disable or configure PDF.js, the built-in PDF viewer.

If `Enabled` is set to false, the built-in PDF viewer is disabled.

If `EnablePermissions` is set to true, the built-in PDF viewer will honor document permissions like preventing the copying of text.

Note: DisableBuiltinPDFViewer has not been deprecated. You can either continue to use it, or switch to using PDFjs->Enabled to disable the built-in PDF viewer. This new permission was added because we needed a place for PDFjs->EnabledPermissions.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `pdfjs.disabled`, `pdfjs.enablePermissions`

### Settings

<div class="settings" markdown="1">

`Enabled` (boolean)

`EnablePermissions` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\PDFjs\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\PDFjs\EnablePermissions (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>PDFjs</key>
  <dict>
    <key>Enabled</key>
    <true/>
    <key>EnablePermissions</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PDFjs": {
      "Enabled": true,
      "EnablePermissions": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `PDFjs`<br>`PDFjs_Enabled`<br>`PDFjs_EnablePermissions` | 77.0 |  |

## Permissions

Set permissions associated with camera, microphone, location, notifications, autoplay, and virtual reality.

Because these are origins, not domains, entries with unique ports must be specified separately. This explicitly means that it is not possible to add wildcards. See examples below.

`Allow` is a list of origins where the feature is allowed.

`Block` is a list of origins where the feature is not allowed.

`BlockNewRequests` determines whether or not new requests can be made for the feature.

`Locked` prevents the user from changing preferences for the feature.

`Default` specifies the default value for Autoplay. block-audio-video is not supported on Firefox ESR 68.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `permissions.default.camera`, `permissions.default.microphone`, `permissions.default.geo`, `permissions.default.desktop-notification`, `media.autoplay.default`, `permissions.default.xr`, `permissions.default.screen`

### Settings

<div class="settings" markdown="1">

`Camera` (object)
- `Allow` (list of origins)
- `Block` (list of origins)
- `BlockNewRequests` (boolean)
- `Locked` (boolean)

`Microphone` (object)
- `Allow` (list of origins)
- `Block` (list of origins)
- `BlockNewRequests` (boolean)
- `Locked` (boolean)

`Autoplay` (object)
- `Default` (string: `allow-audio-video`, `block-audio` or `block-audio-video`)
  > *`allow-audio-video`: Sites may autoplay both audio and video.*\
  > *`block-audio`: Sites may autoplay video without sound, but not audio.*\
  > *`block-audio-video`: Sites may not autoplay anything.*
- `Allow` (list of origins)
- `Block` (list of origins)
- `Locked` (boolean)

`Location` (object)
- `Allow` (list of origins)
- `Block` (list of origins)
- `BlockNewRequests` (boolean)
- `Locked` (boolean)

`Notifications` (object)
- `Allow` (list of origins)
- `Block` (list of origins)
- `BlockNewRequests` (boolean)
- `Locked` (boolean)

`VirtualReality` (object)
- `Allow` (list of origins)
- `Block` (list of origins)
- `BlockNewRequests` (boolean)
- `Locked` (boolean)

`ScreenShare` (object)
- `Allow` (list of origins)
- `Block` (list of origins)
- `BlockNewRequests` (boolean)
- `Locked` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Permissions\Camera\Allow\1 (REG_SZ) = https://example.org
Software\Policies\Mozilla\Firefox\Permissions\Camera\Allow\2 (REG_SZ) = https://example.org:1234
Software\Policies\Mozilla\Firefox\Permissions\Camera\Block\1 (REG_SZ) = https://example.edu
Software\Policies\Mozilla\Firefox\Permissions\Camera\BlockNewRequests (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\Camera\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\Microphone\Allow\1 (REG_SZ) = https://example.org
Software\Policies\Mozilla\Firefox\Permissions\Microphone\Block\1 (REG_SZ) = https://example.edu
Software\Policies\Mozilla\Firefox\Permissions\Microphone\BlockNewRequests (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\Microphone\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\Location\Allow\1 (REG_SZ) = https://example.org
Software\Policies\Mozilla\Firefox\Permissions\Location\Block\1 (REG_SZ) = https://example.edu
Software\Policies\Mozilla\Firefox\Permissions\Location\BlockNewRequests (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\Location\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\Notifications\Allow\1 (REG_SZ) = https://example.org
Software\Policies\Mozilla\Firefox\Permissions\Notifications\Block\1 (REG_SZ) = https://example.edu
Software\Policies\Mozilla\Firefox\Permissions\Notifications\BlockNewRequests (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\Notifications\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\Autoplay\Allow\1 (REG_SZ) = https://example.org
Software\Policies\Mozilla\Firefox\Permissions\Autoplay\Block\1 (REG_SZ) = https://example.edu
Software\Policies\Mozilla\Firefox\Permissions\Autoplay\Default (REG_SZ) = allow-audio-video
Software\Policies\Mozilla\Firefox\Permissions\Autoplay\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\VirtualReality\Allow\1 (REG_SZ) = https://example.org
Software\Policies\Mozilla\Firefox\Permissions\VirtualReality\Block\1 (REG_SZ) = https://example.edu
Software\Policies\Mozilla\Firefox\Permissions\VirtualReality\BlockNewRequests (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\VirtualReality\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\ScreenShare\Allow\1 (REG_SZ) = https://example.org
Software\Policies\Mozilla\Firefox\Permissions\ScreenShare\Block\1 (REG_SZ) = https://example.edu
Software\Policies\Mozilla\Firefox\Permissions\ScreenShare\BlockNewRequests (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Permissions\ScreenShare\Locked (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>Permissions</key>
  <dict>
    <key>Camera</key>
    <dict>
      <key>Allow</key>
      <array>
        <string>https://example.org</string>
        <string>https://example.org:1234</string>
      </array>
      <key>Block</key>
      <array>
        <string>https://example.edu</string>
      </array>
      <key>BlockNewRequests</key>
      <true/>
      <key>Locked</key>
      <true/>
    </dict>
    <key>Microphone</key>
    <dict>
      <key>Allow</key>
      <array>
        <string>https://example.org</string>
      </array>
      <key>Block</key>
      <array>
        <string>https://example.edu</string>
      </array>
      <key>BlockNewRequests</key>
      <true/>
      <key>Locked</key>
      <true/>
    </dict>
    <key>Location</key>
    <dict>
      <key>Allow</key>
      <array>
        <string>https://example.org</string>
      </array>
      <key>Block</key>
      <array>
        <string>https://example.edu</string>
      </array>
      <key>BlockNewRequests</key>
      <true/>
      <key>Locked</key>
      <true/>
    </dict>
    <key>Notifications</key>
    <dict>
      <key>Allow</key>
      <array>
        <string>https://example.org</string>
      </array>
      <key>Block</key>
      <array>
        <string>https://example.edu</string>
      </array>
      <key>BlockNewRequests</key>
      <true/>
      <key>Locked</key>
      <true/>
    </dict>
    <key>Autoplay</key>
    <dict>
      <key>Allow</key>
      <array>
        <string>https://example.org</string>
      </array>
      <key>Block</key>
      <array>
        <string>https://example.edu</string>
      </array>
      <key>Default</key>
      <string>allow-audio-video</string>
      <key>Locked</key>
      <true/>
    </dict>
    <key>VirtualReality</key>
    <dict>
      <key>Allow</key>
      <array>
        <string>https://example.org</string>
      </array>
      <key>Block</key>
      <array>
        <string>https://example.edu</string>
      </array>
      <key>BlockNewRequests</key>
      <true/>
      <key>Locked</key>
      <true/>
    </dict>
    <key>ScreenShare</key>
    <dict>
      <key>Allow</key>
      <array>
        <string>https://example.org</string>
      </array>
      <key>Block</key>
      <array>
        <string>https://example.edu</string>
      </array>
      <key>BlockNewRequests</key>
      <true/>
      <key>Locked</key>
      <true/>
    </dict>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Permissions": {
      "Camera": {
        "Allow": ["https://example.org", "https://example.org:1234"],
        "Block": ["https://example.edu"],
        "BlockNewRequests": true,
        "Locked": true
      },
      "Microphone": {
        "Allow": ["https://example.org"],
        "Block": ["https://example.edu"],
        "BlockNewRequests": true,
        "Locked": true
      },
      "Location": {
        "Allow": ["https://example.org"],
        "Block": ["https://example.edu"],
        "BlockNewRequests": true,
        "Locked": true
      },
      "Notifications": {
        "Allow": ["https://example.org"],
        "Block": ["https://example.edu"],
        "BlockNewRequests": true,
        "Locked": true
      },
      "Autoplay": {
        "Allow": ["https://example.org"],
        "Block": ["https://example.edu"],
        "Default": "allow-audio-video",
        "Locked": true
      },
      "VirtualReality": {
        "Allow": ["https://example.org"],
        "Block": ["https://example.edu"],
        "BlockNewRequests": true,
        "Locked": true
      },
      "ScreenShare": {
        "Allow": ["https://example.org"],
        "Block": ["https://example.edu"],
        "BlockNewRequests": true,
        "Locked": true
      }
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Permissions`<br>`Permissions_Camera`<br>`Permissions_Camera_Allow`<br>`Permissions_Camera_Block`<br>`Permissions_Camera_BlockNewRequests`<br>`Permissions_Camera_Locked`<br>`Permissions_Microphone`<br>`Permissions_Microphone_Allow`<br>`Permissions_Microphone_Block`<br>`Permissions_Microphone_BlockNewRequests`<br>`Permissions_Microphone_Locked`<br>`Permissions_Location`<br>`Permissions_Location_Allow`<br>`Permissions_Location_Block`<br>`Permissions_Location_BlockNewRequests`<br>`Permissions_Location_Locked`<br>`Permissions_Notifications`<br>`Permissions_Notifications_Allow`<br>`Permissions_Notifications_Block`<br>`Permissions_Notifications_BlockNewRequests`<br>`Permissions_Notifications_Locked` | 62.0 |  |
| `Permissions_Autoplay`<br>`Permissions_Autoplay_Allow`<br>`Permissions_Autoplay_Block` | 74.0 |  |
| `Permissions_Autoplay_Default`<br>`Permissions_Autoplay_Locked` | 76.0 |  |
| `Permissions_VirtualReality`<br>`Permissions_VirtualReality_Allow`<br>`Permissions_VirtualReality_Block`<br>`Permissions_VirtualReality_BlockNewRequests`<br>`Permissions_VirtualReality_Locked` | 81.0 |  |
| `Permissions_ScreenShare`<br>`Permissions_ScreenShare_Allow`<br>`Permissions_ScreenShare_Block`<br>`Permissions_ScreenShare_BlockNewRequests`<br>`Permissions_ScreenShare_Locked` | 142.0, 140.2.0esr |  |

## PictureInPicture

Enable or disable Picture-in-Picture as well as prevent the user from enabling or disabling it (Locked).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `media.videocontrols.picture-in-picture.video-toggle.enabled`

### Settings

<div class="settings" markdown="1">

`Enabled` (boolean)

`Locked` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\PictureInPicture\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\PictureInPicture\Locked (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>PictureInPicture</key>
  <dict>
    <key>Enabled</key>
    <true/>
    <key>Locked</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PictureInPicture": {
      "Enabled": true,
      "Locked": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `PictureInPicture`<br>`PictureInPicture_Enabled`<br>`PictureInPicture_Locked` | 78.0 |  |

## PopupBlocking

Allow certain websites to display popups and be redirected by third-party frames.

Configure the default pop-up window policy as well as origins for which pop-up windows are allowed.

`Allow` is a list of origins where popup-windows are allowed.

`Default` determines whether or not pop-up windows are allowed by default.

`Locked` prevents the user from changing pop-up preferences.

**CCK2 Equivalent:** `permissions.popup`\
**Preferences Affected:** `dom.disable_open_during_load`

### Settings

<div class="settings" markdown="1">

`Allow` (list of origins)

`Default` (boolean)

`Locked` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\PopupBlocking\Allow\1 (REG_SZ) = https://example.org/
Software\Policies\Mozilla\Firefox\PopupBlocking\Allow\2 (REG_SZ) = https://example.edu/
Software\Policies\Mozilla\Firefox\PopupBlocking\Default (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\PopupBlocking\Locked (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>PopupBlocking</key>
  <dict>
    <key>Allow</key>
    <array>
      <string>https://example.org/</string>
      <string>https://example.edu/</string>
    </array>
    <key>Default</key>
    <true/>
    <key>Locked</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PopupBlocking": {
      "Allow": ["https://example.org/", "https://example.edu/"],
      "Default": true,
      "Locked": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `PopupBlocking`<br>`PopupBlocking_Allow`<br>`PopupBlocking_Default`<br>`PopupBlocking_Locked` | 61.0 |  |

## PostQuantumKeyAgreementEnabled

Enable post-quantum key agreement for TLS.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.tls.enable_kyber`, `network.http.http3.enable_kyber`

### Settings

<div class="settings" markdown="1">

`PostQuantumKeyAgreementEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\PostQuantumKeyAgreementEnabled (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>PostQuantumKeyAgreementEnabled</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PostQuantumKeyAgreementEnabled": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `PostQuantumKeyAgreementEnabled` | 127.0 |  |

## Preferences

Set and lock preferences.

**NOTE** On Windows, in order to use this policy, you must clear all settings in the old **Preferences (Deprecated)** section in group policy.

Previously you could only set and lock a subset of preferences. Starting with Firefox 81 and Firefox ESR 78.3 you can set many more preferences. You can also set default preferences, user preferences and you can clear preferences.

**NOTE** There are too many preferences for us to provide documentation on them all. The source file [StaticPrefList.yaml](https://searchfox.org/mozilla-central/source/modules/libpref/init/StaticPrefList.yaml) contains information on many of them.

Using the preference as the key, set the `Value` to the corresponding preference value.

`Status` can be "default", "locked", "user" or "clear"

* `"default"`: Read/Write: Settings appear as default even if factory default differs.
* `"locked"`: Read-Only: Settings appear as default even if factory default differs.
* `"user"`: Read/Write: Settings appear as changed if it differs from factory default.
* `"clear"`: Read/Write: `Value` has no effect. Resets to factory defaults on each startup.

`"user"` preferences persist across invocations of Firefox. It is the equivalent of a user setting the preference. They are most useful when a preference is needed very early in startup so it can't be set as default by policy. An example of this is ```toolkit.legacyUserProfileCustomizations.stylesheets```.

`"user"` preferences persist even if the policy is removed, so if you need to remove them, you should use the clear policy.

You can also set the `Type` starting in Firefox 123 and Firefox ESR 115.8. It can be `number`, `boolean` or `string`. This is especially useful if you are seeing 0 or 1 values being converted to booleans when set as user preferences.

See the examples below for more detail.

IMPORTANT: Make sure you're only setting a particular preference using this mechanism and not some other way.

Status

**CCK2 Equivalent:** `preferences`\
**Preferences Affected:** Many

### Settings

<div class="settings" markdown="1">

`[name]` (number, boolean, string or object)
- `Value` (number, boolean or string)
- `Status` (string: `default`, `locked`, `user` or `clear`)
  > *`default`: Change the preference's default value. A value the user has already set still wins.*\
  > *`locked`: Change the preference's default value and prevent the user from changing it.*\
  > *`user`: Set the preference as though the user had set it, so the value is written to the profile.*\
  > *`clear`: Remove any value the user has set, reverting the preference to its default.*
- `Type` (string: `number`, `boolean` or `string`)
  > *`number`: Store `Value` as an integer. Set this explicitly for 0 and 1, which are otherwise stored as booleans.*\
  > *`boolean`: Store `Value` as a boolean.*\
  > *`string`: Store `Value` as a string.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Preferences (REG_MULTI_SZ) = 
{
  "accessibility.force_disabled": {
    "Value": 1,
    "Status": "default",
    "Type": "number"
  },
  "browser.cache.disk.parent_directory": {
    "Value": "SOME_NATIVE_PATH",
    "Status": "user"
  },
  "browser.tabs.warnOnClose": {
    "Value": false,
    "Status": "locked"
  }
}
```

#### macOS
```
<dict>
  <key>Preferences</key>
  <dict>
    <key>accessibility.force_disabled</key>
    <dict>
      <key>Value</key>
      <integer>1</integer>
      <key>Status</key>
      <string>default</string>
      <key>Type</key>
      <string>number</string>
    </dict>
    <key>browser.cache.disk.parent_directory</key>
    <dict>
      <key>Value</key>
      <string>SOME_NATIVE_PATH</string>
      <key>Status</key>
      <string>user</string>
    </dict>
    <key>browser.tabs.warnOnClose</key>
    <dict>
      <key>Value</key>
      <false/>
      <key>Status</key>
      <string>locked</string>
    </dict>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Preferences": {
      "accessibility.force_disabled": {
        "Value": 1,
        "Status": "default",
        "Type": "number"
      },
      "browser.cache.disk.parent_directory": {
        "Value": "SOME_NATIVE_PATH",
        "Status": "user"
      },
      "browser.tabs.warnOnClose": {
        "Value": false,
        "Status": "locked"
      }
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Preferences` | 68.0 |  |
| `Preferences_[name]`<br>`Preferences_[name]_Value`<br>`Preferences_[name]_Status` | 82.0 |  |
| `Preferences_[name]_Type` | 123.0 |  |
| `Preferences_accessibility.force_disabled`<br>`Preferences_browser.bookmarks.autoExportHTML`<br>`Preferences_browser.bookmarks.file`<br>`Preferences_browser.places.importBookmarksHTML`<br>`Preferences_browser.bookmarks.restore_default_bookmarks`<br>`Preferences_browser.safebrowsing.phishing.enabled`<br>`Preferences_browser.safebrowsing.malware.enabled`<br>`Preferences_browser.slowStartup.notificationDisabled`<br>`Preferences_browser.taskbar.previews.enable`<br>`Preferences_dom.allow_scripts_to_close_windows`<br>`Preferences_extensions.blocklist.enabled`<br>`Preferences_geo.enabled`<br>`Preferences_intl.accept_languages`<br>`Preferences_media.eme.enabled`<br>`Preferences_print.save_print_settings`<br>`Preferences_security.mixed_content.block_active_content` | 71.0 | 81.0 |
| `Preferences_browser.cache.disk.enable`<br>`Preferences_browser.fixup.dns_first_for_single_words`<br>`Preferences_browser.search.update`<br>`Preferences_browser.tabs.warnOnClose`<br>`Preferences_browser.cache.disk.parent_directory`<br>`Preferences_browser.urlbar.suggest.bookmark`<br>`Preferences_browser.urlbar.suggest.openpage`<br>`Preferences_browser.urlbar.suggest.history`<br>`Preferences_dom.disable_window_flip`<br>`Preferences_dom.disable_window_move_resize`<br>`Preferences_dom.event.contextmenu.enabled`<br>`Preferences_extensions.getAddons.showPane`<br>`Preferences_media.gmp-gmpopenh264.enabled`<br>`Preferences_media.gmp-widevinecdm.enabled`<br>`Preferences_network.dns.disableIPv6`<br>`Preferences_network.IDN_show_punycode`<br>`Preferences_places.history.enabled`<br>`Preferences_security.default_personal_cert`<br>`Preferences_security.ssl.errorReporting.enabled`<br>`Preferences_ui.key.menuAccessKeyFocuses` | 68.0 | 81.0 |
| `Preferences_browser.urlbar.dnsResolveSingleWordsAfterSearch`<br>`Preferences_media.peerconnection.ice.obfuscate_host_addresses.blocklist` | 79.0 | 81.0 |
| `Preferences_browser.newtabpage.activity-stream.default.sites`<br>`Preferences_extensions.htmlaboutaddons.recommendations.enabled`<br>`Preferences_media.peerconnection.enabled`<br>`Preferences_security.osclientcerts.autoload`<br>`Preferences_security.tls.hello_downgrade_check`<br>`Preferences_widget.content.gtk-theme-override` | 73.0 | 81.0 |
| `Preferences_datareporting.policy.dataSubmissionPolicyBypassNotification`<br>`Preferences_dom.keyboardevent.keypress.hack.dispatch_non_printable_keys.addl`<br>`Preferences_dom.keyboardevent.keypress.hack.use_legacy_keycode_and_charcode.addl`<br>`Preferences_privacy.file_unique_origin` | 69.0 | 81.0 |
| `Preferences_media.peerconnection.ice.obfuscate_host_addresses.whitelist` | 73.0 | 79.0 |
| `Preferences_app.update.auto` | 68.0 | 75.0 |

## PrimaryPassword

Require or prevent using a primary (formerly master) password.

If this value is true, a primary password is required. If this value is false, it works the same as if [`DisableMasterPasswordCreation`](#disablemasterpasswordcreation) was true and removes the primary password functionality.

If both DisableMasterPasswordCreation and PrimaryPassword are used, DisableMasterPasswordCreation takes precedent.

**CCK2 Equivalent:** `noMasterPassword`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`PrimaryPassword` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\PrimaryPassword (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>PrimaryPassword</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PrimaryPassword": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `PrimaryPassword` | 80.0 |  |

## PrintingEnabled

Enable or disable printing.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `print.enabled`

### Settings

<div class="settings" markdown="1">

`PrintingEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\PrintingEnabled (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>PrintingEnabled</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PrintingEnabled": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `PrintingEnabled` | 120.0 |  |

## PrivateBrowsingModeAvailability

Set availability of private browsing mode.

Possible values are `0` (Private Browsing mode is available), `1` (Private Browsing mode not available), and `2`(Private Browsing mode is forced).

This policy supersedes [`DisablePrivateBrowsing`](#disableprivatebrowsing)

Note: This policy missed Firefox ESR 128.2, but it will be in Firefox ESR 128.3.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`PrivateBrowsingModeAvailability` (number: `0`, `1` or `2`)
> *`0`: The user can open private windows.*\
> *`1`: Private windows and 'about:privatebrowsing' are unavailable.*\
> *`2`: Every window is a private window.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\PrivateBrowsingModeAvailability (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>PrivateBrowsingModeAvailability</key>
  <integer>0</integer>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PrivateBrowsingModeAvailability": 0
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `PrivateBrowsingModeAvailability` | 130.0 |  |

## PromptForDownloadLocation

Ask where to save each file before downloading.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.download.useDownloadDir`

### Settings

<div class="settings" markdown="1">

`PromptForDownloadLocation` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\PromptForDownloadLocation (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>PromptForDownloadLocation</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PromptForDownloadLocation": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `PromptForDownloadLocation` | 68.0 |  |

## Proxy

Configure proxy settings.

These settings correspond to the connection settings in Firefox preferences.
To specify ports, append them to the hostnames with a colon (:).

Unless you lock this policy, changes the user already has in place will take effect.

`Mode` is the proxy method being used.

`Locked` is whether or not proxy settings can be changed.

`HTTPProxy` is the HTTP proxy server.

`UseHTTPProxyForAllProtocols` is whether or not the HTTP proxy should be used for all other proxies.

`SSLProxy` is the SSL proxy server.

`FTPProxy` is the FTP proxy server.

`SOCKSProxy` is the SOCKS proxy server

`SOCKSVersion` is the SOCKS version (4 or 5)

`Passthrough` is list of hostnames or IP addresses that will not be proxied. Use `<local>` to bypass proxying for all hostnames which do not contain periods.

`AutoConfigURL` is a  URL for proxy configuration (only used if Mode is autoConfig).

`AutoLogin` means do not prompt for authentication if password is saved.

`UseProxyForDNS` to use proxy DNS when using SOCKS v5.

**CCK2 Equivalent:** `networkProxy*`\
**Preferences Affected:** `network.proxy.type`, `network.proxy.autoconfig_url`, `network.proxy.socks_remote_dns`, `signon.autologin.proxy`, `network.proxy.socks_version`, `network.proxy.no_proxies_on`, `network.proxy.share_proxy_settings`, `network.proxy.http`, `network.proxy.http_port`, `network.proxy.ftp`, `network.proxy.ftp_port`, `network.proxy.ssl`, `network.proxy.ssl_port`, `network.proxy.socks`, `network.proxy.socks_port`

### Settings

<div class="settings" markdown="1">

`Mode` (string: `none`, `system`, `manual`, `autoDetect` or `autoConfig`)
> *`none`: Connect directly, without a proxy.*\
> *`system`: Use the proxy configured in the operating system.*\
> *`manual`: Use the proxy hosts given in `HTTPProxy`, `SSLProxy`, `FTPProxy`, and `SOCKSProxy`.*\
> *`autoDetect`: Discover the proxy settings for this network automatically.*\
> *`autoConfig`: Use the proxy auto-configuration file at `AutoConfigURL`.*

`Locked` (boolean)

`AutoConfigURL` (string, URL)

`FTPProxy` (string)

`HTTPProxy` (string)

`SSLProxy` (string)

`SOCKSProxy` (string)

`SOCKSVersion` (number: `4` or `5`)
> *`4`: Use version 4 of the SOCKS protocol to reach `SOCKSProxy`.*\
> *`5`: Use version 5 of the SOCKS protocol to reach `SOCKSProxy`.*

`UseHTTPProxyForAllProtocols` (boolean)

`Passthrough` (string)

`UseProxyForDNS` (boolean)

`AutoLogin` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Proxy\Mode (REG_SZ) = autoConfig
Software\Policies\Mozilla\Firefox\Proxy\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Proxy\HTTPProxy (REG_SZ) = example.com
Software\Policies\Mozilla\Firefox\Proxy\UseHTTPProxyForAllProtocols (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Proxy\SSLProxy (REG_SZ) = example.com
Software\Policies\Mozilla\Firefox\Proxy\FTPProxy (REG_SZ) = example.com
Software\Policies\Mozilla\Firefox\Proxy\SOCKSProxy (REG_SZ) = example.com
Software\Policies\Mozilla\Firefox\Proxy\SOCKSVersion (REG_DWORD) = 0x5
Software\Policies\Mozilla\Firefox\Proxy\Passthrough (REG_SZ) = <local>
Software\Policies\Mozilla\Firefox\Proxy\AutoConfigURL (REG_SZ) = https://example.com/proxy
Software\Policies\Mozilla\Firefox\Proxy\AutoLogin (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\Proxy\UseProxyForDNS (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>Proxy</key>
  <dict>
    <key>Mode</key>
    <string>autoConfig</string>
    <key>Locked</key>
    <true/>
    <key>HTTPProxy</key>
    <string>example.com</string>
    <key>UseHTTPProxyForAllProtocols</key>
    <true/>
    <key>SSLProxy</key>
    <string>example.com</string>
    <key>FTPProxy</key>
    <string>example.com</string>
    <key>SOCKSProxy</key>
    <string>example.com</string>
    <key>SOCKSVersion</key>
    <integer>5</integer>
    <key>Passthrough</key>
    <string>&lt;local&gt;</string>
    <key>AutoConfigURL</key>
    <string>https://example.com/proxy</string>
    <key>AutoLogin</key>
    <true/>
    <key>UseProxyForDNS</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Proxy": {
      "Mode": "autoConfig",
      "Locked": true,
      "HTTPProxy": "example.com",
      "UseHTTPProxyForAllProtocols": true,
      "SSLProxy": "example.com",
      "FTPProxy": "example.com",
      "SOCKSProxy": "example.com",
      "SOCKSVersion": 5,
      "Passthrough": "<local>",
      "AutoConfigURL": "https://example.com/proxy",
      "AutoLogin": true,
      "UseProxyForDNS": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `Proxy`<br>`Proxy_Mode`<br>`Proxy_Locked`<br>`Proxy_AutoConfigURL`<br>`Proxy_FTPProxy`<br>`Proxy_HTTPProxy`<br>`Proxy_SSLProxy`<br>`Proxy_SOCKSProxy`<br>`Proxy_SOCKSVersion`<br>`Proxy_UseHTTPProxyForAllProtocols`<br>`Proxy_Passthrough`<br>`Proxy_UseProxyForDNS`<br>`Proxy_AutoLogin` | 61.0 |  |

## RequestedLocales

Set the list of requested locales for the application in order of preference.

It will cause the corresponding language pack to become active.

Note: For Firefox 68, this can now be a string so that you can specify an empty value.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`RequestedLocales` (string or array)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\RequestedLocales\1 (REG_SZ) = de
Software\Policies\Mozilla\Firefox\RequestedLocales\2 (REG_SZ) = en-US
```

#### macOS
```
<dict>
  <key>RequestedLocales</key>
  <array>
    <string>de</string>
    <string>en-US</string>
  </array>
</dict>
```

#### policies.json
```
{
  "policies": {
    "RequestedLocales": ["de", "en-US"]
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `RequestedLocales` | 64.0 |  |

## SanitizeOnShutdown

Clear specified data on shutdown, such as History, Cookies, Logins, Cache, Form History, Site Preferences and Offline Website Data.

Clear data on shutdown.

Note: Starting with Firefox 136, FormData and History have been separated again.

`Cache`

`Cookies`

`Downloads` Download History (*Deprecated - part of History*)

`FormData` Form History

`History` Browsing History, Download History

`Sessions` Active Logins

`SiteSettings` Site Preferences

`OfflineApps` Offline Website Data (*Deprecated - part of Cookies*)

`Locked` prevents the user from changing these preferences.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `privacy.sanitize.sanitizeOnShutdown`, `privacy.clearOnShutdown.cache`, `privacy.clearOnShutdown.cookies`, `privacy.clearOnShutdown.downloads`, `privacy.clearOnShutdown.formdata`, `privacy.clearOnShutdown.history`, `privacy.clearOnShutdown.sessions`, `privacy.clearOnShutdown.siteSettings`, `privacy.clearOnShutdown.offlineApps`, `privacy.clearOnShutdown_v2.historyFormDataAndDownloads`, `privacy.clearOnShutdown_v2.cookiesAndStorage`, `privacy.clearOnShutdown_v2.cache`, `privacy.clearOnShutdown_v2.siteSettings`, `privacy.clearOnShutdown_v2.formdata`

### Settings

<div class="settings" markdown="1">

`Cache` (boolean)

`Cookies` (boolean)

`Downloads` (boolean)

`FormData` (boolean)

`History` (boolean)

`Sessions` (boolean)

`SiteSettings` (boolean)

`OfflineApps` (boolean)

`Locked` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SanitizeOnShutdown\Cache (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\SanitizeOnShutdown\Cookies (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\SanitizeOnShutdown\FormData (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\SanitizeOnShutdown\History (REG_DWORD) = 0x0
Software\Policies\Mozilla\Firefox\SanitizeOnShutdown\Sessions (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\SanitizeOnShutdown\SiteSettings (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\SanitizeOnShutdown\Locked (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>SanitizeOnShutdown</key>
  <dict>
    <key>Cache</key>
    <true/>
    <key>Cookies</key>
    <true/>
    <key>FormData</key>
    <true/>
    <key>History</key>
    <false/>
    <key>Sessions</key>
    <true/>
    <key>SiteSettings</key>
    <true/>
    <key>Locked</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SanitizeOnShutdown": {
      "Cache": true,
      "Cookies": true,
      "FormData": true,
      "History": false,
      "Sessions": true,
      "SiteSettings": true,
      "Locked": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `SanitizeOnShutdown` | 61.0 |  |
| `SanitizeOnShutdown_Cache`<br>`SanitizeOnShutdown_Cookies`<br>`SanitizeOnShutdown_Downloads`<br>`SanitizeOnShutdown_FormData`<br>`SanitizeOnShutdown_History`<br>`SanitizeOnShutdown_Sessions`<br>`SanitizeOnShutdown_SiteSettings`<br>`SanitizeOnShutdown_OfflineApps` | 68.0 |  |
| `SanitizeOnShutdown_Locked` | 75.0 |  |

## SearchBar

Set whether or not search bar is displayed.

**CCK2 Equivalent:** `showSearchBar`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`SearchBar` (string: `unified` or `separate`)
> *`unified`: Search from the address bar, with no separate search box.*\
> *`separate`: Add a search box to the toolbar, next to the address bar.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SearchBar (REG_SZ) = unified
```

#### macOS
```
<dict>
  <key>SearchBar</key>
  <string>unified</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SearchBar": "unified"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `SearchBar` | 61.0 |  |

## SearchEngines

The following policies allow for configuring search engines in Firefox.

As of Firefox 139, this policy is available in all versions of Firefox.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Default` (string)
> *Set the default search engine.*

`DefaultPrivate` (string)

`PreventInstalls` (boolean)
> *Prevent installing search engines from webpages.*

`Remove` (list of strings)
> *Hide built-in search engines.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SearchEngines\Default (REG_SZ) = Example1
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\Name (REG_SZ) = Example1
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\URLTemplate (REG_SZ) = https://www.example.org/q={searchTerms}
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\Method (REG_SZ) = GET
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\IconURL (REG_SZ) = https://www.example.org/favicon.ico
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\Alias (REG_SZ) = example
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\Description (REG_SZ) = Description
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\SuggestURLTemplate (REG_SZ) = https://www.example.org/suggestions/q={searchTerms}
Software\Policies\Mozilla\Firefox\SearchEngines\PreventInstalls (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>SearchEngines</key>
  <dict>
    <key>Default</key>
    <string>Example1</string>
    <key>Add</key>
    <array>
      <dict>
        <key>Name</key>
        <string>Example1</string>
        <key>URLTemplate</key>
        <string>https://www.example.org/q={searchTerms}</string>
        <key>Method</key>
        <string>GET</string>
        <key>IconURL</key>
        <string>https://www.example.org/favicon.ico</string>
        <key>Alias</key>
        <string>example</string>
        <key>Description</key>
        <string>Description</string>
        <key>SuggestURLTemplate</key>
        <string>https://www.example.org/suggestions/q={searchTerms}</string>
      </dict>
    </array>
    <key>PreventInstalls</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SearchEngines": {
      "Default": "Example1",
      "Add": [
        {
          "Name": "Example1",
          "URLTemplate": "https://www.example.org/q={searchTerms}",
          "Method": "GET",
          "IconURL": "https://www.example.org/favicon.ico",
          "Alias": "example",
          "Description": "Description",
          "SuggestURLTemplate": "https://www.example.org/suggestions/q={searchTerms}"
        }
      ],
      "PreventInstalls": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `SearchEngines`<br>`SearchEngines_Add`<br>`SearchEngines_Default`<br>`SearchEngines_PreventInstalls` | 61.0 |  |
| `SearchEngines_DefaultPrivate` | 71.0 |  |
| `SearchEngines_Remove` | 62.0 |  |

## SearchEngines | Add

Add new search engines. Although there are only five engines available in the ADMX template, there is no limit. To add more in the ADMX template, you can duplicate the XML.

`Name` is the name of the search engine. (Required)

`URLTemplate` is the search URL with {searchTerms} to substitute for the search term. (Required)

`Method` is either GET or POST

`IconURL` is a URL for the icon to use.

`Alias` is a keyword to use for the engine.

`Description` is a description of the search engine.

`PostData` is the POST data as name value pairs separated by &.

`SuggestURLTemplate` is a search suggestions URL with {searchTerms} to substitute for the search term.

`Encoding` is the query charset for the engine. It defaults to UTF-8.

**CCK2 Equivalent:** `searchplugins`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Name` (string)

`IconURL` (string, URL)

`Alias` (string)

`Description` (string)

`Encoding` (string)

`Method` (string: `GET` or `POST`)
> *`GET`: Send the search terms as part of the URL.*\
> *`POST`: Send the search terms in the request body, using `PostData`.*

`URLTemplate` (string)

`PostData` (string)

`SuggestURLTemplate` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\Name (REG_SZ) = Example1
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\URLTemplate (REG_SZ) = https://www.example.org/q={searchTerms}
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\Method (REG_SZ) = GET
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\IconURL (REG_SZ) = https://www.example.org/favicon.ico
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\Alias (REG_SZ) = example
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\Description (REG_SZ) = Description
Software\Policies\Mozilla\Firefox\SearchEngines\Add\1\SuggestURLTemplate (REG_SZ) = https://www.example.org/suggestions/q={searchTerms}
```

#### macOS
```
<dict>
  <key>SearchEngines</key>
  <dict>
    <key>Add</key>
    <array>
      <dict>
        <key>Name</key>
        <string>Example1</string>
        <key>URLTemplate</key>
        <string>https://www.example.org/q={searchTerms}</string>
        <key>Method</key>
        <string>GET</string>
        <key>IconURL</key>
        <string>https://www.example.org/favicon.ico</string>
        <key>Alias</key>
        <string>example</string>
        <key>Description</key>
        <string>Description</string>
        <key>SuggestURLTemplate</key>
        <string>https://www.example.org/suggestions/q={searchTerms}</string>
      </dict>
    </array>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SearchEngines": {
      "Add": [
        {
          "Name": "Example1",
          "URLTemplate": "https://www.example.org/q={searchTerms}",
          "Method": "GET",
          "IconURL": "https://www.example.org/favicon.ico",
          "Alias": "example",
          "Description": "Description",
          "SuggestURLTemplate": "https://www.example.org/suggestions/q={searchTerms}"
        }
      ]
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `SearchEngines_Add` | 61.0 |  |

## SearchSuggestEnabled

Enable search suggestions.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.urlbar.suggest.searches`, `browser.search.suggest.enabled`

### Settings

<div class="settings" markdown="1">

`SearchSuggestEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SearchSuggestEnabled (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>SearchSuggestEnabled</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SearchSuggestEnabled": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `SearchSuggestEnabled` | 68.0 |  |

## SecurityDevices

Install PKCS #11 modules.

**CCK2 Equivalent:** `certs.devices`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Add` (object)
- `[name]` (string)

`Delete` (list of strings)

`[name]` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SecurityDevices\Add\A Device (REG_SZ) = /path/to/library/for/device
```

#### macOS
```
<dict>
  <key>SecurityDevices</key>
  <dict>
    <key>Add</key>
    <dict>
      <key>A Device</key>
      <string>/path/to/library/for/device</string>
    </dict>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SecurityDevices": {
      "Add": {
        "A Device": "/path/to/library/for/device"
      }
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `SecurityDevices`<br>`SecurityDevices_[name]` | 64.0 |  |
| `SecurityDevices_Add`<br>`SecurityDevices_Add_[name]`<br>`SecurityDevices_Delete` | 114.0 |  |

## ShowHomeButton

Show the home button on the toolbar.

Future versions of Firefox will not show the home button by default.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`ShowHomeButton` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\ShowHomeButton (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>ShowHomeButton</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "ShowHomeButton": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `ShowHomeButton` | 88.0 |  |

## SkipTermsOfUse

Configure display settings for the Firefox Terms of Use and Privacy Notice on startup.

If true, don't display the Firefox [Terms of Use](https://www.mozilla.org/about/legal/terms/firefox/) and [Privacy Notice](https://www.mozilla.org/privacy/firefox/) upon startup. You represent that you accept and have the authority to accept the Terms of Use on behalf of all individuals to whom you provide access to this browser.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`SkipTermsOfUse` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SkipTermsOfUse (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>SkipTermsOfUse</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SkipTermsOfUse": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `SkipTermsOfUse` | 139.0 |  |

## SSLVersionMax

Set and lock the maximum version of TLS.

(Firefox defaults to a maximum of TLS 1.3.)

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.tls.version.max`

### Settings

<div class="settings" markdown="1">

`SSLVersionMax` (string: `tls1`, `tls1.1`, `tls1.2` or `tls1.3`)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SSLVersionMax (REG_SZ) = tls1.3
```

#### macOS
```
<dict>
  <key>SSLVersionMax</key>
  <string>tls1.3</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SSLVersionMax": "tls1.3"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `SSLVersionMax` | 66.0 |  |

## SSLVersionMin

Set and lock the minimum version of TLS.

(Firefox defaults to a minimum of TLS 1.2.)

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.tls.version.min`

### Settings

<div class="settings" markdown="1">

`SSLVersionMin` (string: `tls1`, `tls1.1`, `tls1.2` or `tls1.3`)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SSLVersionMin (REG_SZ) = tls1.2
```

#### macOS
```
<dict>
  <key>SSLVersionMin</key>
  <string>tls1.2</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SSLVersionMin": "tls1.2"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `SSLVersionMin` | 66.0 |  |

## StartDownloadsInTempDirectory

Force downloads to start off in a local, temporary location rather than the default download directory.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.download.start_downloads_in_tmp_dir`

### Settings

<div class="settings" markdown="1">

`StartDownloadsInTempDirectory` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\StartDownloadsInTempDirectory (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>StartDownloadsInTempDirectory</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "StartDownloadsInTempDirectory": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `StartDownloadsInTempDirectory` | 102.0 |  |

## SupportMenu

Add a menuitem to the help menu for specifying support information.

**CCK2 Equivalent:** `helpMenu`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Title` (string)

`URL` (string, URL)

`AccessKey` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SupportMenu\Title (REG_SZ) = Support Menu
Software\Policies\Mozilla\Firefox\SupportMenu\URL (REG_SZ) = http://example.com/support
```

#### macOS
```
<dict>
  <key>SupportMenu</key>
  <dict>
    <key>Title</key>
    <string>Support Menu</string>
    <key>URL</key>
    <string>http://example.com/support</string>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SupportMenu": {
      "Title": "Support Menu",
      "URL": "http://example.com/support"
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `SupportMenu`<br>`SupportMenu_Title`<br>`SupportMenu_URL`<br>`SupportMenu_AccessKey` | 67.0 |  |

## TranslateEnabled

Enable or disable webpage translation.

Note: Web page translation is done completely on the client, so there is no data or privacy risk.

If you only want to disable the popup, you can set the pref `browser.translations.automaticallyPopup` to false using the [Preferences](#preferences) policy.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.translations.enable`

### Settings

<div class="settings" markdown="1">

`TranslateEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\TranslateEnabled (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>TranslateEnabled</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "TranslateEnabled": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `TranslateEnabled` | 126.0 |  |

## UserMessaging

Prevent Firefox from messaging the user in certain situations.

`WhatsNew` Remove the "What's New" icon and menuitem. (*Deprecated*)

`ExtensionRecommendations` If false, don't recommend extensions while the user is visiting web pages.

`FeatureRecommendations` If false, don't recommend browser features.

`UrlbarInterventions` If false, don't offer Firefox specific suggestions in the URL bar.

`SkipOnboarding` If true, don't show onboarding messages on the new tab page.

`MoreFromMozilla` If false, don't show the "More from Mozilla" section in Preferences. (Firefox 98)

`FirefoxLabs` If false, don't show the "Firefox Labs" section in Preferences. (Firefox 130.0.1)

`Locked` prevents the user from changing user messaging preferences.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons`, `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features`, `browser.aboutwelcome.enabled`, `browser.preferences.moreFromMozilla`, `browser.preferences.experimental`

### Settings

<div class="settings" markdown="1">

`WhatsNew` (boolean)

`ExtensionRecommendations` (boolean)

`FeatureRecommendations` (boolean)

`UrlbarInterventions` (boolean)

`SkipOnboarding` (boolean)

`MoreFromMozilla` (boolean)

`FirefoxLabs` (boolean)

`Locked` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\UserMessaging\ExtensionRecommendations (REG_DWORD) = 0x0
Software\Policies\Mozilla\Firefox\UserMessaging\FeatureRecommendations (REG_DWORD) = 0x0
Software\Policies\Mozilla\Firefox\UserMessaging\UrlbarInterventions (REG_DWORD) = 0x0
Software\Policies\Mozilla\Firefox\UserMessaging\SkipOnboarding (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\UserMessaging\MoreFromMozilla (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\UserMessaging\FirefoxLabs (REG_DWORD) = 0x0
Software\Policies\Mozilla\Firefox\UserMessaging\Locked (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>UserMessaging</key>
  <dict>
    <key>ExtensionRecommendations</key>
    <false/>
    <key>FeatureRecommendations</key>
    <false/>
    <key>UrlbarInterventions</key>
    <false/>
    <key>SkipOnboarding</key>
    <true/>
    <key>MoreFromMozilla</key>
    <true/>
    <key>FirefoxLabs</key>
    <false/>
    <key>Locked</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "UserMessaging": {
      "ExtensionRecommendations": false,
      "FeatureRecommendations": false,
      "UrlbarInterventions": false,
      "SkipOnboarding": true,
      "MoreFromMozilla": true,
      "FirefoxLabs": false,
      "Locked": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `UserMessaging`<br>`UserMessaging_WhatsNew`<br>`UserMessaging_ExtensionRecommendations`<br>`UserMessaging_FeatureRecommendations`<br>`UserMessaging_Locked` | 75.0 |  |
| `UserMessaging_UrlbarInterventions` | 76.0 |  |
| `UserMessaging_SkipOnboarding` | 80.0 |  |
| `UserMessaging_MoreFromMozilla` | 99.0 |  |
| `UserMessaging_FirefoxLabs` | 131.0 |  |
| `UserMessaging_SkipTermsOfUse` | 138.0 | 138.0 |

## UseSystemPrintDialog

Use the system print dialog instead of the print preview window.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `print.prefer_system_dialog`

### Settings

<div class="settings" markdown="1">

`UseSystemPrintDialog` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\UseSystemPrintDialog (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>UseSystemPrintDialog</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "UseSystemPrintDialog": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `UseSystemPrintDialog` | 102.0 |  |

## WebsiteFilter

Block websites from being visited.

The parameters take an array of Match Patterns, as documented in https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns.
The arrays are limited to 1000 entries each.

If you want to block all URLs, you can use `<all_urls>` or `*://*/*`. You can't have just a `*` on the right side.

For specific protocols, use `https://*/*` or `http://*/*`.

As of Firefox 83 and Firefox ESR 78.5, file URLs are supported.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Block` (list of strings)

`Exceptions` (list of strings)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\WebsiteFilter (REG_MULTI_SZ) = 
{
  "Block": ["<all_urls>"],
  "Exceptions": ["http://example.org/*"]
}
```

#### macOS
```
<dict>
  <key>WebsiteFilter</key>
  <dict>
    <key>Block</key>
    <array>
      <string>&lt;all_urls&gt;</string>
    </array>
    <key>Exceptions</key>
    <array>
      <string>http://example.org/*</string>
    </array>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "WebsiteFilter": {
      "Block": ["<all_urls>"],
      "Exceptions": ["http://example.org/*"]
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `WebsiteFilter`<br>`WebsiteFilter_Block`<br>`WebsiteFilter_Exceptions` | 61.0 |  |

## WindowsSSO

Allow Windows single sign-on for Microsoft, work, and school accounts.

If this policy is set to true, Firefox will use credentials stored in Windows to sign in to Microsoft, work, and school accounts.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.http.windows-sso.enabled`

### Settings

<div class="settings" markdown="1">

`WindowsSSO` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\WindowsSSO (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>WindowsSSO</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "WindowsSSO": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `WindowsSSO` | 91.0 |  |


