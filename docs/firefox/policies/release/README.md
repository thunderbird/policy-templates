## Enterprise policy descriptions and templates for Firefox 157.0.1

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
* Windows: [firefox.admx](https://github.com/thunderbird/policy-templates/tree/master/docs/firefox/policies/release/admx) - use with Group Policy or Intune
* Mac: [org.mozilla.firefox.plist](https://github.com/thunderbird/policy-templates/blob/master/docs/firefox/policies/release/plist/org.mozilla.firefox.plist) - use with configuration profiles

This document provides examples in these formats for all policies.


### Windows: installing the ADMX templates

The Firefox policies are placed in the "Mozilla" category, which is defined by
Mozilla's `mozilla.admx`. Both templates are needed. The `mozilla.admx`
provided here is Mozilla's unchanged file, and may already be installed together
with the Thunderbird templates.

* [firefox.admx](https://thunderbird.github.io/policy-templates/firefox/policies/release/admx/firefox.admx) and
  [en-US/firefox.adml](https://thunderbird.github.io/policy-templates/firefox/policies/release/admx/en-US/firefox.adml)
* [mozilla.admx](https://thunderbird.github.io/policy-templates/firefox/policies/release/admx/mozilla.admx) and
  [en-US/mozilla.adml](https://thunderbird.github.io/policy-templates/firefox/policies/release/admx/en-US/mozilla.adml)

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
| **[`3rdparty`](#3rdparty-policies-for-extensions)** | Policies for Extensions: Provide configuration to WebExtensions, which they can read through the `storage.managed` API.
| **[`AIControls`](#aicontrols)** | Controls access to AI features: Translations, PDF alt text generation, smart tab groups, display summaries in link previews, AI chatbot in the sidebar, smart windows and on-device speech recognition. The `Default` value applies to all AI features, unless overridden by a specific feature.
| **[`AllowedDomainsForApps`](#alloweddomainsforapps)** | Define domains allowed to access Google Workspace: Users can only access Google Workspace with accounts from these domains.
| **[`AllowFileSelectionDialogs`](#allowfileselectiondialogs)** | Enable or disable file selection dialogs.
| **[`AppAutoUpdate`](#appautoupdate)** | Application Autoupdate: Enable or disable automatic application update.
| **[`AppUpdatePin`](#appupdatepin)** | Pin updates to a specific version: Prevent Firefox from being updated beyond the specified version.
| **[`AppUpdateURL`](#appupdateurl)** | Custom Update URL: Change the URL for application update if you are providing Firefox updates from a custom update server.
| **[`Authentication`](#authentication)** | Configure sites that support integrated authentication.
| **[`AutofillAddressEnabled`](#autofilladdressenabled)** | Enable autofill for addresses: Enables or disables autofill for addresses.
| **[`AutofillCreditCardEnabled`](#autofillcreditcardenabled)** | Enable autofill for payment methods: Enables or disables autofill for payment methods.
| **[`AutoLaunchProtocolsFromOrigins`](#autolaunchprotocolsfromorigins)** | Define a list of external protocols that can be used from listed origins without prompting the user.
| **[`BackgroundAppUpdate`](#backgroundappupdate)** | Background updater: Enable or disable automatic application update in the background, when the application is not running.
| **[`BlockAboutAddons`](#blockaboutaddons)** | Block Add-ons Manager: Block access to the Add-ons Manager ('about:addons').
| **[`BlockAboutConfig`](#blockaboutconfig)** | Block about:config: Block access to 'about:config'.
| **[`BlockAboutProfiles`](#blockaboutprofiles)** | Block about:profiles: Block access to About Profiles ('about:profiles').
| **[`BlockAboutSupport`](#blockaboutsupport)** | Block Troubleshooting Information: Block access to Troubleshooting Information ('about:support').
| **[`Bookmarks`](#bookmarks)** | Add bookmarks in either the bookmarks toolbar or menu. Use `ManagedBookmarks` instead.
| **[`BrowserDataBackup`](#browserdatabackup)** | Disable backup or restore of profile data.
| **[`CaptivePortal`](#captiveportal)** | Enable or disable the detection of captive portals.
| **[`Certificates`](#certificates)** | Install and manage certificates.
| **[`Certificates › ImportEnterpriseRoots`](#certificates--importenterpriseroots)** | Trust certificates that have been added to the operating system certificate store by a user or administrator.
| **[`Certificates › Install`](#certificates--install)** | Install Certificates: Adds certificates to the Firefox certificate store.
| **[`CNSA2KeyAgreementEnabled`](#cnsa2keyagreementenabled)** | Enable CNSA 2.0 key agreement: Enable the CNSA 2.0 ML-KEM-1024 key agreement for TLS.
| **[`Containers`](#containers)** | Set policies related to Multi-Account Containers.
| **[`ContentAnalysis`](#contentanalysis)** | Content Analysis (DLP): Configure Firefox to use an agent for Data Loss Prevention (DLP) that is compatible with the Google Chrome Content Analysis Connector Agent SDK.
| **[`Cookies`](#cookies)** | Configure cookie preferences.
| **[`DefaultBrowserSettingEnabled`](#defaultbrowsersettingenabled)** | Enable default browser setting: Control whether the user can set Firefox as the default browser. If set to false, the default browser check is disabled and the controls for setting Firefox as the default browser are removed from the preferences.
| **[`DefaultDownloadDirectory`](#defaultdownloaddirectory)** | Set the default download directory.
| **[`DefaultSerialGuardSetting`](#defaultserialguardsetting)** | Control use of the Web Serial API: Set the default permission for websites requesting access to serial ports through the Web Serial API.
| **[`DisableAccounts`](#disableaccounts)** | Disable account-based services, including sync.
| **[`DisableAppUpdate`](#disableappupdate)** | Disable Update: Turn off application updates within Firefox.
| **[`DisableBuiltinPDFViewer`](#disablebuiltinpdfviewer)** | Disable Built-in PDF Viewer (PDF.js): Disable the built in PDF viewer.
| **[`DisabledCiphers`](#disabledciphers)** | Disable specific cryptographic ciphers, listed below.
| **[`DisableDefaultBrowserAgent`](#disabledefaultbrowseragent)** | Disable the default browser agent: Prevent the default browser agent from taking any actions.
| **[`DisableDeveloperTools`](#disabledevelopertools)** | Remove access to all developer tools.
| **[`DisableEncryptedClientHello`](#disableencryptedclienthello)** | Disable the TLS Feature for Encrypted Client Hello.
| **[`DisableFeedbackCommands`](#disablefeedbackcommands)** | Disable the menus for reporting sites (Submit Feedback, Report Deceptive Site).
| **[`DisableFirefoxAccounts`](#disablefirefoxaccounts)** | Disable Firefox Accounts integration (Sync).
| **[`DisableFirefoxScreenshots`](#disablefirefoxscreenshots)** | Remove access to Firefox Screenshots.
| **[`DisableFirefoxStudies`](#disablefirefoxstudies)** | Disable Firefox studies (Shield).
| **[`DisableForgetButton`](#disableforgetbutton)** | Disable the "Forget" button.
| **[`DisableFormHistory`](#disableformhistory)** | Turn off saving information on web forms and the search bar.
| **[`DisableLaunchOnLogin`](#disablelaunchonlogin)** | Prevent Firefox from launching automatically when the user logs in, and prevent the user from enabling this setting.
| **[`DisableMasterPasswordCreation`](#disablemasterpasswordcreation)** | Remove the master password functionality.
| **[`DisablePasswordReveal`](#disablepasswordreveal)** | Hide passwords of saved logins: Do not allow passwords to be shown in saved logins.
| **[`DisablePocket`](#disablepocket)** | Remove Pocket in the Firefox UI.
| **[`DisablePrivateBrowsing`](#disableprivatebrowsing)** | Remove access to private browsing.
| **[`DisableProfileImport`](#disableprofileimport)** | Remove the ability to import data from other browsers.
| **[`DisableProfileRefresh`](#disableprofilerefresh)** | Disable the Refresh Firefox button on 'about:support' and 'support.mozilla.org', as well as the prompt that displays offering to refresh Firefox when you haven't used it in a while.
| **[`DisableRemoteImprovements`](#disableremoteimprovements)** | Prevent Firefox from applying performance, stability, and feature changes between updates.
| **[`DisableRemoteSettingsAndAcceptSecurityConsequences`](#disableremotesettingsandacceptsecurityconsequences)** | Disable Remote Settings updates, stopping Firefox from receiving updated data such as blocklists, and accept the resulting security consequences.
| **[`DisableSafeMode`](#disablesafemode)** | Disable safe mode (Troubleshoot Mode) within the browser.
| **[`DisableSecurityBypass`](#disablesecuritybypass)** | Prevent Bypassing Security Warnings: Prevent the user from bypassing security in certain cases.
| **[`DisableSetDesktopBackground`](#disablesetdesktopbackground)** | Remove the "Set As Desktop Background..." menuitem when right clicking on an image.
| **[`DisableSystemAddonUpdate`](#disablesystemaddonupdate)** | Disable System Addon Updates: Prevent system add-ons from being installed or updated.
| **[`DisableTelemetry`](#disabletelemetry)** | Prevent the upload of telemetry data.
| **[`DisableThirdPartyModuleBlocking`](#disablethirdpartymoduleblocking)** | Do not allow blocking third-party modules from the 'about:third-party' page.
| **[`DisplayBookmarksToolbar`](#displaybookmarkstoolbar)** | Set the initial state of the bookmarks toolbar.
| **[`DisplayMenuBar`](#displaymenubar)** | Set the state of the menubar.
| **[`DNSOverHTTPS`](#dnsoverhttps)** | Configure DNS over HTTPS (DoH).
| **[`DontCheckDefaultBrowser`](#dontcheckdefaultbrowser)** | Don't Check Default Browser: Don't check if Firefox is the default browser at startup.
| **[`DownloadDirectory`](#downloaddirectory)** | Set and lock the download directory.
| **[`EnableTrackingProtection`](#enabletrackingprotection)** | Tracking Protection: Configure tracking protection.
| **[`EncryptedMediaExtensions`](#encryptedmediaextensions)** | Enable or disable Encrypted Media Extensions and optionally lock it.
| **[`ExemptDomainFileTypePairsFromFileTypeDownloadWarnings`](#exemptdomainfiletypepairsfromfiletypedownloadwarnings)** | Disable warnings based on file extension for specific file types on domains: Downloads of these file types from these domains get no warnings based on their file extension.
| **[`Extensions`](#extensions)** | Control the installation, uninstallation and locking of extensions.
| **[`ExtensionSettings`](#extensionsettings)** | Extension Management: Manage all aspects of extensions.
| **[`ExtensionUpdate`](#extensionupdate)** | Control extension updates.
| **[`FirefoxHome`](#firefoxhome)** | Customize the Firefox Home page.
| **[`FirefoxSuggest`](#firefoxsuggest)** | Firefox Suggest (US only): Customize Firefox Suggest (US only).
| **[`GenerativeAI`](#generativeai)** | Configure generative AI features.
| **[`GoToIntranetSiteForSingleWordEntryInAddressBar`](#gotointranetsiteforsinglewordentryinaddressbar)** | Force direct intranet site navigation on single word entries in the address bar: Whether to always go through the DNS server before sending a single word search string to a search engine.
| **[`Handlers`](#handlers)** | Configure default application handlers.
| **[`HardwareAcceleration`](#hardwareacceleration)** | Control hardware acceleration.
| **[`Homepage`](#homepage)** | Configure the default homepage and how Firefox starts.
| **[`HttpAllowlist`](#httpallowlist)** | Configure sites that will not be upgraded to HTTPS.
| **[`HttpsOnlyMode`](#httpsonlymode)** | HTTPS-Only Mode: Configure HTTPS-Only Mode.
| **[`InstallAddonsPermission`](#installaddonspermission)** | Addons: Configure the default extension install policy as well as origins for extension installs are allowed.
| **[`IPProtectionAvailable`](#ipprotectionavailable)** | IP Protection (VPN) Availability: Control whether Firefox's built-in IP Protection (VPN) is available to users. When disabled, the feature is turned off and cannot be used.
| **[`LegacyProfiles`](#legacyprofiles)** | Disable the feature enforcing a separate profile for each installation.
| **[`LegacySameSiteCookieBehaviorEnabled`](#legacysamesitecookiebehaviorenabled)** | Revert to legacy SameSite behavior: Enable default legacy SameSite cookie behavior setting.
| **[`LegacySameSiteCookieBehaviorEnabledForDomainList`](#legacysamesitecookiebehaviorenabledfordomainlist)** | Domains with legacy SameSite behavior: Revert to legacy SameSite behavior for cookies on specified sites.
| **[`LocalFileLinks`](#localfilelinks)** | Enable linking to local files by origin.
| **[`LocalNetworkAccess`](#localnetworkaccess)** | Configure local network access security features.
| **[`ManagedBookmarks`](#managedbookmarks)** | Configures a list of bookmarks managed by an administrator that cannot be changed by the user.
| **[`ManualAppUpdateOnly`](#manualappupdateonly)** | Manual Update Only: Switch to manual updates only.
| **[`MicrosoftEntraSSO`](#microsoftentrasso)** | Allow single sign-on for Microsoft Entra accounts on macOS.
| **[`NetworkPrediction`](#networkprediction)** | Enable or disable network prediction (DNS prefetching).
| **[`NewTabPage`](#newtabpage)** | Enable or disable the New Tab page.
| **[`NoDefaultBookmarks`](#nodefaultbookmarks)** | Disable the creation of default bookmarks.
| **[`OfferToSaveLogins`](#offertosavelogins)** | Control whether or not Firefox offers to save passwords.
| **[`OfferToSaveLoginsDefault`](#offertosaveloginsdefault)** | Offer to save logins (default): Sets the default value of 'signon.rememberSignons' without locking it.
| **[`OverrideFirstRunPage`](#overridefirstrunpage)** | Override the first run page: The page shown on the first run, instead of the built-in one.
| **[`OverridePostUpdatePage`](#overridepostupdatepage)** | Override the upgrade page: The page shown after an upgrade, instead of the built-in one.
| **[`PasswordManagerEnabled`](#passwordmanagerenabled)** | Password Manager: Remove access to the password manager via preferences and blocks about:logins on Firefox 70.
| **[`PasswordManagerExceptions`](#passwordmanagerexceptions)** | Prevent Firefox from saving passwords for specific sites.
| **[`PDFjs`](#pdfjs)** | PDF.js: Disable or configure PDF.js, the built-in PDF viewer.
| **[`Permissions`](#permissions)** | Set permissions associated with camera, microphone, location, notifications, autoplay, and virtual reality.
| **[`PictureInPicture`](#pictureinpicture)** | Picture-in-Picture: Enable or disable Picture-in-Picture as well as prevent the user from enabling or disabling it (Locked).
| **[`PopupBlocking`](#popupblocking)** | Popups: Allow certain websites to display popups and be redirected by third-party frames.
| **[`PostQuantumKeyAgreementEnabled`](#postquantumkeyagreementenabled)** | Post-quantum key agreement: Enable post-quantum key agreement for TLS.
| **[`Preferences`](#preferences)** | Set and lock preferences.
| **[`PrimaryPassword`](#primarypassword)** | Primary (Master) Password: Require or prevent using a primary (formerly master) password.
| **[`PrintingEnabled`](#printingenabled)** | Printing: Enable or disable printing.
| **[`PrivateBrowsingModeAvailability`](#privatebrowsingmodeavailability)** | Set availability of private browsing mode.
| **[`PromptForDownloadLocation`](#promptfordownloadlocation)** | Ask where to save each file before downloading.
| **[`Proxy`](#proxy)** | Proxy Settings: Configure proxy settings.
| **[`RelaunchRequired`](#relaunchrequired)** | Relaunch Behavior: Control relaunch behavior.
| **[`RequestedLocales`](#requestedlocales)** | Requested locale: Set the list of requested locales for the application in order of preference.
| **[`SanitizeOnShutdown`](#sanitizeonshutdown)** | Clear data when browser is closed: Clear specified data on shutdown, such as History, Cookies, Logins, Cache, Form History, Site Preferences and Offline Website Data.
| **[`SearchBar`](#searchbar)** | Search bar location: Set whether or not search bar is displayed.
| **[`SearchEngines`](#searchengines)** | Search: The following policies allow for configuring search engines in Firefox.
| **[`SearchEngines › Add`](#searchengines--add)** | Add new search engines. Although there are only five engines available in the ADMX template, there is no limit. To add more in the ADMX template, you can duplicate the XML.
| **[`SearchSuggestEnabled`](#searchsuggestenabled)** | Search Suggestions: Enable search suggestions.
| **[`SecurityDevices`](#securitydevices)** | Install PKCS #11 modules.
| **[`ShowHomeButton`](#showhomebutton)** | Show Home button on toolbar: Show the home button on the toolbar.
| **[`SitePolicies`](#sitepolicies)** | Fine grained control over policies for specific sites.
| **[`SkipTermsOfUse`](#skiptermsofuse)** | Configure display settings for the Firefox Terms of Use and Privacy Notice on startup.
| **[`SSLVersionMax`](#sslversionmax)** | Maximum SSL version enabled: Set and lock the maximum version of TLS.
| **[`SSLVersionMin`](#sslversionmin)** | Minimum SSL version enabled: Set and lock the minimum version of TLS.
| **[`StartDownloadsInTempDirectory`](#startdownloadsintempdirectory)** | Start Downloads in Temporary Directory: Force downloads to start off in a local, temporary location rather than the default download directory.
| **[`SupportMenu`](#supportmenu)** | Add a menuitem to the help menu for specifying support information.
| **[`TranslateEnabled`](#translateenabled)** | Enable webpage translation: Enable or disable webpage translation.
| **[`UserMessaging`](#usermessaging)** | Prevent Firefox from messaging the user in certain situations.
| **[`UseSystemPrintDialog`](#usesystemprintdialog)** | Use the system print dialog instead of the print preview window.
| **[`VisualSearchEnabled`](#visualsearchenabled)** | Visual Search: Enable or disable visual search.
| **[`WebsiteFilter`](#websitefilter)** | Block websites from being visited.
| **[`WindowsSSO`](#windowssso)** | Allow Windows single sign-on for Microsoft, work, and school accounts.
| **[`XSLTEnabled`](#xsltenabled)** | Enable XSLT: Enable or disable support for the XSLTProcessor JavaScript API and the XSLT processing instruction.

## 3rdparty: Policies for Extensions

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

## AIControls

Controls access to AI features: Translations, PDF alt text generation, smart tab groups, display summaries in link previews, AI chatbot in the sidebar, smart windows and on-device speech recognition. The `Default` value applies to all AI features, unless overridden by a specific feature.

For more information, see [Block generative AI features with Firefox AI controls](https://support.mozilla.org/en-US/kb/firefox-ai-controls) on support.mozilla.org.

For on-device AI, blocking a feature also removes any models already downloaded.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.ml.chat.enabled`, `browser.ml.chat.page`, `browser.ai.control.sidebarChatbot`, `browser.translations.enable`, `browser.ai.control.translations`, `pdfjs.enableAltText`, `browser.ai.control.pdfjsAltText`, `browser.ml.linkPreview.enabled`, `browser.ai.control.linkPreviewKeyPoints`, `browser.tabs.groups.smart.userEnabled`, `browser.ai.control.smartTabGroups`, `browser.ai.control.smartWindow`

### Settings

<div class="settings" markdown="1">

`Default` (object)
> *Controls the default state for AI features listed below, unless they are explicitly configured in the policy.*
- `Value` (string: `available` or `blocked`)
  > *`available`: The feature is on and available to users.*<br>
  > *`blocked`: The feature is off and unavailable to users.*
- `Locked` (boolean)
  > *If true, the user cannot change the setting.*

`Translations` (object)
> *Controls AI-powered page translations.*
- `Value` (string: `available` or `blocked`)
  > *`available`: The feature is on and available to users.*<br>
  > *`blocked`: The feature is off and unavailable to users.*
- `Locked` (boolean)
  > *If true, the user cannot change the setting.*

`PDFAltText` (object)
> *Controls AI-generated alt text for images in PDF documents.*
- `Value` (string: `available` or `blocked`)
  > *`available`: The feature is on and available to users.*<br>
  > *`blocked`: The feature is off and unavailable to users.*
- `Locked` (boolean)
  > *If true, the user cannot change the setting.*

`SmartTabGroups` (object)
> *Controls AI-powered tab grouping suggestions.*
- `Value` (string: `available` or `blocked`)
  > *`available`: The feature is on and available to users.*<br>
  > *`blocked`: The feature is off and unavailable to users.*
- `Locked` (boolean)
  > *If true, the user cannot change the setting.*

`LinkPreviewKeyPoints` (object)
> *Controls AI-generated key point summaries shown in link previews.*
- `Value` (string: `available` or `blocked`)
  > *`available`: The feature is on and available to users.*<br>
  > *`blocked`: The feature is off and unavailable to users.*
- `Locked` (boolean)
  > *If true, the user cannot change the setting.*

`SidebarChatbot` (object)
> *Controls the AI chatbot panel in the Firefox sidebar.*
- `Value` (string: `available` or `blocked`)
  > *`available`: The feature is on and available to users.*<br>
  > *`blocked`: The feature is off and unavailable to users.*
- `Locked` (boolean)
  > *If true, the user cannot change the setting.*

`SmartWindow` (object)
> *Controls AI-powered window arrangement features. (Firefox 150)*
- `Value` (string: `available` or `blocked`)
  > *`available`: The feature is on and available to users.*<br>
  > *`blocked`: The feature is off and unavailable to users.*
- `Locked` (boolean)
  > *If true, the user cannot change the setting.*

`SpeechRecognition` (object)
> *Controls on-device speech recognition.*
- `Value` (string: `available` or `blocked`)
- `Locked` (boolean)
  > *If true, the user cannot change the setting.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\AIControls\Default\Value (REG_SZ) = blocked
Software\Policies\Mozilla\Firefox\AIControls\Default\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\AIControls\Translations\Value (REG_SZ) = available
Software\Policies\Mozilla\Firefox\AIControls\Translations\Locked (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>AIControls</key>
  <dict>
    <key>Default</key>
    <dict>
      <key>Value</key>
      <string>blocked</string>
      <key>Locked</key>
      <true/>
    </dict>
    <key>Translations</key>
    <dict>
      <key>Value</key>
      <string>available</string>
      <key>Locked</key>
      <false/>
    </dict>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "AIControls": {
      "Default": {
        "Value": "blocked",
        "Locked": true
      },
      "Translations": {
        "Value": "available",
        "Locked": false
      }
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `AIControls`<br>`AIControls_Default`<br>`AIControls_Default_Value`<br>`AIControls_Default_Locked`<br>`AIControls_Translations`<br>`AIControls_Translations_Value`<br>`AIControls_Translations_Locked`<br>`AIControls_PDFAltText`<br>`AIControls_PDFAltText_Value`<br>`AIControls_PDFAltText_Locked`<br>`AIControls_SmartTabGroups`<br>`AIControls_SmartTabGroups_Value`<br>`AIControls_SmartTabGroups_Locked`<br>`AIControls_LinkPreviewKeyPoints`<br>`AIControls_LinkPreviewKeyPoints_Value`<br>`AIControls_LinkPreviewKeyPoints_Locked`<br>`AIControls_SidebarChatbot`<br>`AIControls_SidebarChatbot_Value`<br>`AIControls_SidebarChatbot_Locked`<br>`AIControls_SmartWindow`<br>`AIControls_SmartWindow_Value`<br>`AIControls_SmartWindow_Locked` | 150.0 |  |
| `AIControls_SpeechRecognition`<br>`AIControls_SpeechRecognition_Value`<br>`AIControls_SpeechRecognition_Locked` | 157.0 |  |

## AllowedDomainsForApps: Define domains allowed to access Google Workspace {#alloweddomainsforapps}

Users can only access Google Workspace with accounts from these domains.

This policy is based on the [Chrome policy](https://chromeenterprise.google/policies/#AllowedDomainsForApps) of the same name.

If you want to allow Gmail, you can add ```consumer_accounts``` to the list.

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

## AppAutoUpdate: Application Autoupdate {#appautoupdate}

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

## AppUpdatePin: Pin updates to a specific version {#appupdatepin}

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

## AppUpdateURL: Custom Update URL {#appupdateurl}

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

`Locked` (boolean) - Do not allow authentication preferences to be changed

`PrivateBrowsing` (boolean) - Allow authentication in private browsing
> *Enables integrated authentication in private browsing.*

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

## AutofillAddressEnabled: Enable autofill for addresses {#autofilladdressenabled}

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

## AutofillCreditCardEnabled: Enable autofill for payment methods {#autofillcreditcardenabled}

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

## BackgroundAppUpdate: Background updater {#backgroundappupdate}

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

## BlockAboutAddons: Block Add-ons Manager {#blockaboutaddons}

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

## BlockAboutConfig: Block about:config {#blockaboutconfig}

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

## BlockAboutProfiles: Block about:profiles {#blockaboutprofiles}

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

## BlockAboutSupport: Block Troubleshooting Information {#blockaboutsupport}

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

Add bookmarks in either the bookmarks toolbar or menu. Use `ManagedBookmarks` instead.

This policy will continue to be supported.

Only `Title` and `URL` are required. If `Placement` is not specified, the bookmark will be placed on the toolbar. If `Folder` is specified, it is automatically created and bookmarks with the same folder name are grouped together.

If you want to clear all bookmarks set with this policy, you can set the value to an empty array (```[]```). On Windows, this can be done with the Bookmarks (JSON) policy in Group Policy and Intune.

**CCK2 Equivalent:** `bookmarks.toolbar`, `bookmarks.menu`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Title` (string)

`URL` (string, URL)

`Favicon` (string, URL)

`Placement` (string: `toolbar` or `menu`)
> *`toolbar`: Add the bookmark to the bookmarks toolbar.*<br>
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

## BrowserDataBackup

Disable backup or restore of profile data.

Backup and restore can be disabled individually.

Note: The policy can be used to disable backup and restore if it would otherwise be enabled, but cannot be used to force backup or restore to be enabled under conditions where it would not otherwise be (such as a platform on which backup or restore are not yet supported).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`BrowserDataBackup` (boolean or object)

`AllowBackup` (boolean)

`AllowRestore` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\BrowserDataBackup (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\BrowserDataBackup\AllowBackup (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\BrowserDataBackup\AllowRestore (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>BrowserDataBackup</key>
  <true/>
</dict>

<dict>
  <key>BrowserDataBackup</key>
  <dict>
    <key>AllowBackup</key>
    <true/>
    <key>AllowRestore</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "BrowserDataBackup": true
  }
}

{
  "policies": {
    "BrowserDataBackup": {
      "AllowBackup": true,
      "AllowRestore": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `BrowserDataBackup`<br>`BrowserDataBackup_AllowBackup`<br>`BrowserDataBackup_AllowRestore` | 146.0 |  |

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
Software\Policies\Mozilla\Firefox\Certificates\Install\1 (REG_EXPAND_SZ) = cert1.der
Software\Policies\Mozilla\Firefox\Certificates\Install\2 (REG_EXPAND_SZ) = /home/username/cert2.pem
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

## Certificates › ImportEnterpriseRoots

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

## Certificates › Install: Install Certificates {#certificates--install}

Adds certificates to the Firefox certificate store.

If only a filename is specified, Firefox searches for the file in the following locations:

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

Environment variables like %USERPROFILE% are only expanded when the policy is set via Group Policy.

**CCK2 Equivalent:** `certs.ca`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Install` (list of strings)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Certificates\Install\1 (REG_EXPAND_SZ) = cert1.der
Software\Policies\Mozilla\Firefox\Certificates\Install\2 (REG_EXPAND_SZ) = /home/username/cert2.pem
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

## CNSA2KeyAgreementEnabled: Enable CNSA 2.0 key agreement {#cnsa2keyagreementenabled}

Enable the CNSA 2.0 ML-KEM-1024 key agreement for TLS.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`CNSA2KeyAgreementEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\CNSA2KeyAgreementEnabled (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>CNSA2KeyAgreementEnabled</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "CNSA2KeyAgreementEnabled": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `CNSA2KeyAgreementEnabled` | 154.0 |  |

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
- `color` (string: `blue`, `cyan`, `green`, `yellow`, `orange`, `red`, `pink`, `purple`, `violet` or `gray`)

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

## ContentAnalysis: Content Analysis (DLP) {#contentanalysis}

Configure Firefox to use an agent for Data Loss Prevention (DLP) that is compatible with the Google Chrome Content Analysis Connector Agent SDK.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.contentanalysis.agent_name`, `browser.contentanalysis.agent_timeout`, `browser.contentanalysis.allow_url_regex_list`, `browser.contentanalysis.bypass_for_same_tab_operations`, `browser.contentanalysis.client_signature`, `browser.contentanalysis.default_result`, `browser.contentanalysis.deny_url_regex_list`, `browser.contentanalysis.enabled`, `browser.contentanalysis.interception_point.clipboard.enabled`, `browser.contentanalysis.interception_point.clipboard.plain_text_only`, `browser.contentanalysis.interception_point.download.enabled`, `browser.contentanalysis.interception_point.drag_and_drop.enabled`, `browser.contentanalysis.interception_point.drag_and_drop.plain_text_only`, `browser.contentanalysis.interception_point.file_upload.enabled`, `browser.contentanalysis.interception_point.print.enabled`, `browser.contentanalysis.is_per_user`, `browser.contentanalysis.pipe_path_name`, `browser.contentanalysis.show_blocked_result`, `browser.contentanalysis.timeout_result`

### Settings

<div class="settings" markdown="1">

`Enabled` (boolean)
> *Indicates whether Firefox should use DLP. Note that if this value is true and no DLP agent is running, all DLP requests will be denied unless `DefaultResult` is set to 1 or 2.*

`PipePathName` (string)
> *The name of the pipe the DLP agent has created and Firefox will connect to. The default is "path_user".*

`AgentTimeout` (number)
> *The timeout in number of seconds after a DLP request is sent to the agent. After this timeout, the request will be denied unless `TimeoutResult` is set to 1 or 2. The default is 300.*

`AllowUrlRegexList` (string)
> *A space-separated list of regular expressions that indicates URLs for which DLP operations will always be allowed without consulting the agent. The default is "^about:(?!blank&#124;srcdoc).*", meaning that any pages that start with "about:" will be exempt from DLP except for "about:blank" and "about:srcdoc", as these can be controlled by web content.*

`DenyUrlRegexList` (string)
> *A space-separated list of regular expressions that indicates URLs for which DLP operations will always be denied without consulting the agent. The default is the empty string.*

`AgentName` (string)
> *The name of the DLP agent. This is used in dialogs and notifications about DLP operations. The default is "A DLP Agent".*

`ClientSignature` (string)
> *Indicates the required signature of the DLP agent connected to the pipe. If this is a non-empty string and the DLP agent does not have a signature with a Subject Name that exactly matches this value, Firefox will not connect to the pipe. The default is the empty string.*

`IsPerUser` (boolean)
> *Indicates whether the pipe the DLP agent has created is per-user or per-system. The default is true, meaning per-user.*

`MaxConnectionsCount` (number)

`ShowBlockedResult` (boolean)
> *Indicates whether Firefox should show a notification when a DLP request is denied. The default is true.*

`DefaultResult` (number)
> *Indicates the desired behavior for DLP requests if there is a problem connecting to the DLP agent. The default is 0.*

`TimeoutResult` (number)
> *Indicates the desired behavior for DLP requests if the DLP agent does not respond to a request in less than `AgentTimeout` seconds. The default is 0.*

`BypassForSameTabOperations` (boolean)
> *Indicates whether Firefox will automatically allow DLP requests whose data comes from the same tab and frame - for example, if data is copied to the clipboard and then pasted on the same page. The default is false.*

`InterceptionPoints` (object)
> *Controls settings for specific interception points.*
- `Clipboard` (object)
  > *Controls clipboard operations for files and text.*
  - `Enabled` (boolean)
    > *Indicates whether clipboard operations should use DLP. The default is true.*
  - `PlainTextOnly` (boolean)
    > *Indicates whether to only analyze the text/plain format on the clipboard. If this value is false, all formats will be analyzed, which some DLP agents may not expect. Regardless of this value, files will be analyzed as usual. The default is true.*
- `Download` (object)
  > *Controls download operations. (Firefox 142, Firefox ESR 140.2)*
  - `Enabled` (boolean)
    > *Indicates whether download operations should use DLP. The default is false.*
- `DragAndDrop` (object)
  > *Controls drag and drop operations for files and text.*
  - `Enabled` (boolean)
    > *Indicates whether drag and drop operations should use DLP. The default is true.*
  - `PlainTextOnly` (boolean)
    > *Indicates whether to only analyze the text/plain format in what is being dropped. If this value is false, all formats will be analyzed, which some DLP agents may not expect. Regardless of this value, files will be analyzed as usual. The default is true.*
- `FileUpload` (object)
  > *Controls file upload operations for files chosen from the file picker.*
  - `Enabled` (boolean)
    > *Indicates whether file upload operations should use DLP. The default is true.*
- `Print` (object)
  > *Controls print operations.*
  - `Enabled` (boolean)
    > *Indicates whether print operations should use DLP. The default is true.*

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

## Cookies

Configure cookie preferences.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.cookie.cookieBehavior`, `network.cookie.cookieBehavior.pbmode`, `network.cookie.lifetimePolicy`

### Settings

<div class="settings" markdown="1">

`Allow` (list of origins) - Allowed Sites
> *Cookies are always allowed for these origins (not domains). Each must include http or https.*

`AllowSession` (list of origins) - Allowed Sites (Session Only)
> *Cookies are only allowed for the current session for these origins (not domains). Each must include http or https.*

`Block` (list of origins) - Blocked Sites
> *Cookies are always blocked for these origins (not domains). Each must include http or https.*

`Default` (boolean) - Accept cookies from websites **Deprecated.**
> *Determines whether cookies are accepted at all. Use `Behavior` instead.*

`AcceptThirdParty` (string: `always`, `never` or `from-visited`) - Accept third-party cookies **Deprecated.**
> *Determines how third-party cookies are handled. Use `Behavior` instead.*<br>
> *`always`: Accept all third-party cookies.*<br>
> *`never`: Reject all third-party cookies.*<br>
> *`from-visited`: Accept third-party cookies only from sites the user has visited.*

`RejectTracker` (boolean) - Reject trackers **Deprecated.**
> *Only rejects cookies for trackers. Use `Behavior` instead.*

`ExpireAtSessionEnd` (boolean) - Keep cookies until Firefox is closed **Deprecated.**
> *Determines when cookies expire. Use [`SanitizeOnShutdown`](#sanitizeonshutdown) instead.*

`Locked` (boolean) - Do not allow preferences to be changed
> *Prevents the user from changing cookie preferences.*

`Behavior` (string: `accept`, `reject-foreign`, `reject`, `limit-foreign`, `reject-tracker`, `reject-tracker-and-partition-foreign` or `partition-foreign`) - Cookie Behavior
> *Sets the default behavior for cookies.*<br>
> *`accept`: Accept cookies from every site, including third parties.*<br>
> *`reject-foreign`: Reject every cookie set by a third party.*<br>
> *`reject`: Reject cookies from every site.*<br>
> *`limit-foreign`: Reject third-party cookies except from sites the user has visited.*<br>
> *`reject-tracker`: Reject cookies set by sites identified as trackers.*<br>
> *`reject-tracker-and-partition-foreign`: Reject cookies from known trackers and confine the remaining third-party cookies to the site that set them. This is Total Cookie Protection.*<br>
> *`partition-foreign`: Confine third-party cookies to the site that set them.*

`BehaviorPrivateBrowsing` (string: `accept`, `reject-foreign`, `reject`, `limit-foreign`, `reject-tracker`, `reject-tracker-and-partition-foreign` or `partition-foreign`) - Cookie Behavior in private browsing
> *Sets the default behavior for cookies in private browsing.*<br>
> *`accept`: Accept cookies from every site, including third parties.*<br>
> *`reject-foreign`: Reject every cookie set by a third party.*<br>
> *`reject`: Reject cookies from every site.*<br>
> *`limit-foreign`: Reject third-party cookies except from sites the user has visited.*<br>
> *`reject-tracker`: Reject cookies set by sites identified as trackers.*<br>
> *`reject-tracker-and-partition-foreign`: Reject cookies from known trackers and confine the remaining third-party cookies to the site that set them. This is Total Cookie Protection.*<br>
> *`partition-foreign`: Confine third-party cookies to the site that set them.*

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

## DefaultBrowserSettingEnabled: Enable default browser setting {#defaultbrowsersettingenabled}

Control whether the user can set Firefox as the default browser. If set to false, the default browser check is disabled and the controls for setting Firefox as the default browser are removed from the preferences.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DefaultBrowserSettingEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DefaultBrowserSettingEnabled (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>DefaultBrowserSettingEnabled</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DefaultBrowserSettingEnabled": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DefaultBrowserSettingEnabled` | 154.0, 153.1.0esr |  |

## DefaultDownloadDirectory

Set the default download directory.

You can use ${home} for the native home directory.

Environment variables like %USERPROFILE% are only expanded when the policy is set via Group Policy.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.download.dir`, `browser.download.folderList`

### Settings

<div class="settings" markdown="1">

`DefaultDownloadDirectory` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DefaultDownloadDirectory (REG_EXPAND_SZ) = ${home}/Downloads
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

## DefaultSerialGuardSetting: Control use of the Web Serial API {#defaultserialguardsetting}

Set the default permission for websites requesting access to serial ports through the Web Serial API.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DefaultSerialGuardSetting` (number: `2` or `3`)
> *`2`: No site may access serial ports, and users cannot allow it.*<br>
> *`3`: Sites may request access to a serial port and the user is prompted. Users can turn access off.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DefaultSerialGuardSetting (REG_DWORD) = 0x2
```

#### macOS
```
<dict>
  <key>DefaultSerialGuardSetting</key>
  <integer>2</integer>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DefaultSerialGuardSetting": 2
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DefaultSerialGuardSetting` | 151.0 |  |

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

## DisableAppUpdate: Disable Update {#disableappupdate}

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

## DisableBuiltinPDFViewer: Disable Built-in PDF Viewer (PDF.js) {#disablebuiltinpdfviewer}

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
| `DisabledCiphers_TLS_CHACHA20_POLY1305_SHA256`<br>`DisabledCiphers_TLS_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_AES_256_GCM_SHA384` | 138.0, 128.10.0esr |  |

## DisableDefaultBrowserAgent: Disable the default browser agent {#disabledefaultbrowseragent}

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

## DisableLaunchOnLogin

Prevent Firefox from launching automatically when the user logs in, and prevent the user from enabling this setting.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableLaunchOnLogin` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableLaunchOnLogin (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableLaunchOnLogin</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableLaunchOnLogin": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableLaunchOnLogin` | 155.0 |  |

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

## DisablePasswordReveal: Hide passwords of saved logins {#disablepasswordreveal}

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

## DisableRemoteImprovements

Prevent Firefox from applying performance, stability, and feature changes between updates.

For more information, see [Manage remote improvements settings in Firefox](https://support.mozilla.org/en-US/kb/remote-improvements).

Note: This policy is not correctly reflected in preferences. This will be fixed soon.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableRemoteImprovements` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableRemoteImprovements (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableRemoteImprovements</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableRemoteImprovements": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableRemoteImprovements` | 148.0 |  |

## DisableRemoteSettingsAndAcceptSecurityConsequences

Disable Remote Settings updates, stopping Firefox from receiving updated data such as blocklists, and accept the resulting security consequences.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableRemoteSettingsAndAcceptSecurityConsequences` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisableRemoteSettingsAndAcceptSecurityConsequences (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisableRemoteSettingsAndAcceptSecurityConsequences</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableRemoteSettingsAndAcceptSecurityConsequences": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisableRemoteSettingsAndAcceptSecurityConsequences` | 153.0 |  |

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

## DisableSecurityBypass: Prevent Bypassing Security Warnings {#disablesecuritybypass}

Prevent the user from bypassing security in certain cases.

These policies only affect what happens when an error is shown, they do not affect any settings in preferences.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.certerror.hideAddException`, `browser.safebrowsing.allowOverride`

### Settings

<div class="settings" markdown="1">

`InvalidCertificate` (boolean) - Prevent overriding certificate errors
> *Prevents adding an exception when an invalid certificate is shown.*

`SafeBrowsing` (boolean) - Prevent overriding safe browsing errors
> *Prevents selecting "ignore the risk" and visiting a harmful site anyway.*

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

## DisableSystemAddonUpdate: Disable System Addon Updates {#disablesystemaddonupdate}

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

`DisplayBookmarksToolbar` (boolean or string: `always`, `never` or `newtab`)
> *`always`: Show the bookmarks toolbar on every page.*<br>
> *`never`: Hide the bookmarks toolbar.*<br>
> *`newtab`: Show the bookmarks toolbar only on the New Tab page.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisplayBookmarksToolbar (REG_SZ) = always
Software\Policies\Mozilla\Firefox\DisplayBookmarksToolbar (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisplayBookmarksToolbar</key>
  <string>always</string>
</dict>

<dict>
  <key>DisplayBookmarksToolbar</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisplayBookmarksToolbar": "always"
  }
}

{
  "policies": {
    "DisplayBookmarksToolbar": true
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

`DisplayMenuBar` (boolean or string: `always`, `never`, `default-on` or `default-off`)
> *`always`: The menu bar is shown and the user cannot hide it.*<br>
> *`never`: The menu bar is hidden and the user cannot show it, including by pressing Alt.*<br>
> *`default-on`: The menu bar starts visible and the user can hide it.*<br>
> *`default-off`: The menu bar starts hidden and the user can show it.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DisplayMenuBar (REG_SZ) = always
Software\Policies\Mozilla\Firefox\DisplayMenuBar (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisplayMenuBar</key>
  <string>always</string>
</dict>

<dict>
  <key>DisplayMenuBar</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisplayMenuBar": "always"
  }
}

{
  "policies": {
    "DisplayMenuBar": true
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `DisplayMenuBar` | 60.0 |  |

## DNSOverHTTPS

Configure DNS over HTTPS (DoH).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.trr.mode`, `network.trr.uri`

### Settings

<div class="settings" markdown="1">

`Enabled` (boolean)
> *Determines whether DNS over HTTPS is enabled.*

`ProviderURL` (string, URL)
> *Replaces the default provider.*

`ExcludedDomains` (list of strings)
> *Excludes domains from DNS over HTTPS.*

`Fallback` (boolean)
> *Determines whether or not Firefox will use your default DNS resolver if there is a problem with the secure DNS provider.*

`Locked` (boolean)
> *Prevents the user from changing DNS over HTTPS preferences.*

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

## DontCheckDefaultBrowser: Don't Check Default Browser {#dontcheckdefaultbrowser}

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

Environment variables like %USERPROFILE% are only expanded when the policy is set via Group Policy.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.download.dir`, `browser.download.folderList`, `browser.download.useDownloadDir`

### Settings

<div class="settings" markdown="1">

`DownloadDirectory` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\DownloadDirectory (REG_EXPAND_SZ) = ${home}/Downloads
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

## EnableTrackingProtection: Tracking Protection {#enabletrackingprotection}

Configure tracking protection.

If this policy is not configured, tracking protection is not enabled by default in the browser, but it is enabled by default in private browsing and the user can change it.

Note: Users can change `BaselineExceptions` and `ConvenienceExceptions` even when `Category` is set to ```strict``` unless `Locked` is set to true. If `Locked` is set to true, the defaults are used unless a different value is specified in policy for `BaselineExceptions` and `ConvenienceExceptions`.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `privacy.trackingprotection.enabled`, `privacy.trackingprotection.pbmode.enabled`, `privacy.trackingprotection.cryptomining.enabled`, `privacy.trackingprotection.fingerprinting.enabled`, `privacy.fingerprintingProtection`, `privacy.trackingprotection.emailtracking.enabled`, `privacy.trackingprotection.emailtracking.pbmode.enabled`, `privacy.trackingprotection.allow_list.baseline.enabled`, `privacy.trackingprotection.allow_list.convenience.enabled`

### Settings

<div class="settings" markdown="1">

`Value` (boolean) - Enabled
> *If true, tracking protection is enabled by default in both the regular browser and private browsing. If false, tracking protection is disabled and locked in both.*

`Locked` (boolean) - Do not allow tracking protection preferences to be changed
> *If true, users cannot change tracking protection values.*

`Cryptomining` (boolean)
> *If true, cryptomining scripts on websites are blocked.*

`Fingerprinting` (boolean)
> *If true, fingerprinting scripts on websites are blocked.*

`EmailTracking` (boolean)
> *If true, hidden email tracking pixels and scripts on websites are blocked. (Firefox 112)*

`SuspectedFingerprinting` (boolean)
> *If true, Firefox reduces the amount of information exposed to websites to protect against potential fingerprinting attempts. (Firefox 142, Firefox ESR 140.2)*

`Exceptions` (list of origins)
> *Origins for which tracking protection is not enabled.*

`Category` (string: `standard` or `strict`) - Tracking Protection Mode
> *If set, it overrides all other settings except `Exceptions`, `BaselineExceptions` and `ConvenienceExceptions`, and the user cannot change the category.*<br>
> *`standard`: Apply the standard Enhanced Tracking Protection level, which balances protection against site breakage.*<br>
> *`strict`: Apply the strict Enhanced Tracking Protection level, which blocks more trackers and may break some sites.*

`BaselineExceptions` (boolean)
> *If true, Firefox will automatically apply exceptions required to avoid major website breakage. (Firefox 145)*

`ConvenienceExceptions` (boolean)
> *If true, Firefox will apply exceptions automatically that are only required to fix minor issues and make convenience features available. (Firefox 145)*

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
| `EnableTrackingProtection_BaselineExceptions`<br>`EnableTrackingProtection_ConvenienceExceptions` | 143.0 |  |

## EncryptedMediaExtensions

Enable or disable Encrypted Media Extensions and optionally lock it.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `media.eme.enabled`

### Settings

<div class="settings" markdown="1">

`Enabled` (boolean) - Enable Encrypted Media Extensions
> *If false, encrypted media extensions (like Widevine) are not downloaded by Firefox unless the user consents to installing them.*

`Locked` (boolean) - Lock Encrypted Media Extensions
> *If true and `Enabled` is false, Firefox will not download encrypted media extensions (like Widevine) or ask the user to install them.*

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

## ExemptDomainFileTypePairsFromFileTypeDownloadWarnings: Disable warnings based on file extension for specific file types on domains {#exemptdomainfiletypepairsfromfiletypedownloadwarnings}

Downloads of these file types from these domains get no warnings based on their file extension.

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
Software\Policies\Mozilla\Firefox\ExemptDomainFileTypePairsFromFileTypeDownloadWarnings (REG_MULTI_SZ) = 
[
  {
    "file_extension": "jnlp",
    "domains": ["example.com"]
  }
]
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

**CCK2 Equivalent:** `addons`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Install` (list of strings) - Extensions to Install
> *Each is given as URL or native path. Environment variables like %USERPROFILE% are only expanded when the policy is set via Group Policy.*

`Uninstall` (list of strings) - Extensions to Uninstall
> *Each is given by its ID, and only uninstalled if it is installed.*

`Locked` (list of strings) - Prevent extensions from being disabled or removed
> *Extensions the user can't disable or uninstall, by their IDs.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\Extensions\Install\1 (REG_EXPAND_SZ) = https://addons.mozilla.org/firefox/downloads/somefile.xpi
Software\Policies\Mozilla\Firefox\Extensions\Install\2 (REG_EXPAND_SZ) = //path/to/xpi
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

## ExtensionSettings: Extension Management {#extensionsettings}

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
  > *`allowed`: Users can install extensions.*<br>
  > *`blocked`: No extension can be installed. An extension with its own entry in this policy is exempt, whatever that entry says.*
- `allowed_types` (list of strings: `extension`, `dictionary`, `locale`, `theme` or `sitepermission`)
  > *`extension`: Ordinary browser extensions.*<br>
  > *`dictionary`: Spell-checking dictionaries.*<br>
  > *`locale`: Language packs that translate the Firefox interface.*<br>
  > *`theme`: Themes that change the appearance of Firefox.*<br>
  > *`sitepermission`: Add-ons that grant one site access to a restricted capability.*
- `blocked_install_message` (string)
- `install_sources` (list of strings)
- `restricted_domains` (list of strings)
- `runtime_allowed_hosts` (list of strings)
- `runtime_blocked_hosts` (list of strings)
- `temporarily_allow_weak_signatures` (boolean)
- `blocked_permissions` (list of strings)
- `allowed_permissions` (list of strings)

`[name]` (object)
- `installation_mode` (string: `allowed`, `blocked`, `force_installed` or `normal_installed`)
  > *`allowed`: The extension may be installed, even when extensions are blocked by default.*<br>
  > *`blocked`: The extension cannot be installed, and is uninstalled if already present.*<br>
  > *`force_installed`: The extension is installed automatically and the user can neither disable nor remove it.*<br>
  > *`normal_installed`: The extension is installed automatically. The user can disable it but cannot remove it.*
- `install_url` (string)
- `blocked_install_message` (string)
- `updates_disabled` (boolean)
- `update_url` (string, URL)
- `default_area` (string: `navbar` or `menupanel`)
  > *`navbar`: Place the extension's button on the toolbar.*<br>
  > *`menupanel`: Place the extension's button in the extensions panel instead of the toolbar.*
- `runtime_allowed_hosts` (list of strings)
- `runtime_blocked_hosts` (list of strings)
- `temporarily_allow_weak_signatures` (boolean)
- `private_browsing` (boolean)
- `blocked_permissions` (list of strings)
- `allowed_permissions` (list of strings)

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
| `ExtensionSettings_*_runtime_allowed_hosts`<br>`ExtensionSettings_*_runtime_blocked_hosts`<br>`ExtensionSettings_*_blocked_permissions`<br>`ExtensionSettings_[name]_runtime_allowed_hosts`<br>`ExtensionSettings_[name]_runtime_blocked_hosts`<br>`ExtensionSettings_[name]_blocked_permissions` | 153.0 |  |
| `ExtensionSettings_*_temporarily_allow_weak_signatures`<br>`ExtensionSettings_[name]_temporarily_allow_weak_signatures` | 126.0 |  |
| `ExtensionSettings_*_allowed_permissions`<br>`ExtensionSettings_[name]_allowed_permissions` | 154.0, 153.0esr |  |
| `ExtensionSettings_[name]_updates_disabled` | 89.0 |  |
| `ExtensionSettings_[name]_update_url` | 151.0 |  |
| `ExtensionSettings_[name]_default_area` | 113.0 |  |
| `ExtensionSettings_[name]_private_browsing` | 136.0, 128.8.0esr |  |

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

`TopSites` (boolean) - Shortcuts

`SponsoredTopSites` (boolean) - Sponsored Shortcuts

`Highlights` (boolean) - Recent Activity

`Pocket` (boolean)

`Stories` (boolean)

`SponsoredPocket` (boolean)

`SponsoredStories` (boolean)

`Snippets` (boolean)

`Widgets` (object)
- `Enabled` (boolean)
- `Blocked` (list of strings) - Blocked widgets

`Locked` (boolean) - Do not allow preferences to be changed

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
| `FirefoxHome_Widgets`<br>`FirefoxHome_Widgets_Enabled`<br>`FirefoxHome_Widgets_Blocked` | 156.0, 153.3.0esr |  |

## FirefoxSuggest: Firefox Suggest (US only) {#firefoxsuggest}

Customize Firefox Suggest (US only).

As of Firefox 146, `WebSuggestions` turns off Suggest completely.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.urlbar.suggest.quicksuggest.all`, `browser.urlbar.suggest.quicksuggest.sponsored`, `browser.urlbar.quicksuggest.dataCollection.enabled`

### Settings

<div class="settings" markdown="1">

`WebSuggestions` (boolean) - Suggestions from the web

`SponsoredSuggestions` (boolean) - Suggestions from sponsors

`ImproveSuggest` (boolean) - Improve the Firefox Suggest experience

`OnlineEnabled` (boolean)

`Locked` (boolean) - Do not allow preferences to be changed

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
| `FirefoxSuggest_OnlineEnabled` | 146.0 |  |

## GenerativeAI

Configure generative AI features.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.ml.chat.enabled`, `browser.ml.chat.page`, `browser.ml.linkPreview.optin`, `browser.tabs.groups.smart.userEnabled`

### Settings

<div class="settings" markdown="1">

`Chatbot` (boolean)
> *Controls access to AI chatbots in the sidebar. If false, AI chatbots are not available in the sidebar.*

`SmartWindow` (boolean)

`LinkPreviews` (boolean)
> *(Firefox 144+) Controls whether AI is used to generate link previews. If false, AI is not used to generate link previews.*

`TabGroups` (boolean)
> *(Firefox 144+) Controls whether AI is used to suggest names and tabs for tab groups. If false, AI is not used to suggest names or tabs for tab groups.*

`Enabled` (boolean)
> *Controls whether generative AI features are enabled by default. If false, all generative AI features are disabled by default. Individual generative AI policies can override this setting.*

`Locked` (boolean) - Do not allow preferences to be changed
> *Prevents the user from changing generative AI preferences.*

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
| `GenerativeAI_SmartWindow` | 150.0 |  |

## GoToIntranetSiteForSingleWordEntryInAddressBar: Force direct intranet site navigation on single word entries in the address bar {#gotointranetsiteforsinglewordentryinaddressbar}

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
    > *`saveToDisk`: Download the file instead of opening it.*<br>
    > *`useHelperApp`: Open the content with an application listed in `handlers`.*<br>
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

**CCK2 Equivalent:** `homePage`, `lockHomePage`\
**Preferences Affected:** `browser.startup.homepage`, `browser.startup.page`

### Settings

<div class="settings" markdown="1">

`URL` (string, URL)
> *The default homepage.*

`Locked` (boolean)
> *Prevents the user from changing homepage preferences.*

`Additional` (list of URLs) - Additional Homepages
> *Allows for more than one homepage.*

`StartPage` (string: `none`, `homepage`, `previous-session` or `homepage-locked`)
> *How Firefox starts.*<br>
> *`none`: Start on a blank page.*<br>
> *`homepage`: Start on the homepage.*<br>
> *`previous-session`: Restore the windows and tabs open at the end of the previous session.*<br>
> *`homepage-locked`: Start on the homepage and prevent the user from changing the startup page.*

`NewTabOnRestore` (boolean) - Also open a new tab when restoring previous windows and tabs

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
| `Homepage_NewTabOnRestore` | 154.0, 153.0esr |  |

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

## HttpsOnlyMode: HTTPS-Only Mode {#httpsonlymode}

Configure HTTPS-Only Mode.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `dom.security.https_only_mode`

### Settings

<div class="settings" markdown="1">

`HttpsOnlyMode` (string: `allowed`, `disallowed`, `enabled` or `force_enabled`)
> *`allowed`: HTTPS-Only Mode is off by default and the user can turn it on.*<br>
> *`disallowed`: HTTPS-Only Mode is off and the user cannot turn it on.*<br>
> *`enabled`: HTTPS-Only Mode is on by default and the user can turn it off.*<br>
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

## InstallAddonsPermission: Addons {#installaddonspermission}

Configure the default extension install policy as well as origins for extension installs are allowed.

This policy does not override turning off all extension installs.

**CCK2 Equivalent:** `permissions.install`\
**Preferences Affected:** `xpinstall.enabled`, `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons`, `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features`

### Settings

<div class="settings" markdown="1">

`Allow` (list of origins) - Allowed Sites
> *Extension installs are allowed for these origins.*

`Default` (boolean) - Allow add-on installs from websites
> *Determines whether or not extension installs are allowed by default.*

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

## IPProtectionAvailable: IP Protection (VPN) Availability {#ipprotectionavailable}

Control whether Firefox's built-in IP Protection (VPN) is available to users. When disabled, the feature is turned off and cannot be used.

Prevent the built-in VPN from being available to users.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.ipProtection.enabled`

### Settings

<div class="settings" markdown="1">

`IPProtectionAvailable` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\IPProtectionAvailable (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>IPProtectionAvailable</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "IPProtectionAvailable": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `IPProtectionAvailable` | 151.0 |  |

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

## LegacySameSiteCookieBehaviorEnabled: Revert to legacy SameSite behavior {#legacysamesitecookiebehaviorenabled}

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

## LegacySameSiteCookieBehaviorEnabledForDomainList: Domains with legacy SameSite behavior {#legacysamesitecookiebehaviorenabledfordomainlist}

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

## LocalNetworkAccess

Configure local network access security features.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Enabled` (boolean)

`BlockTrackers` (boolean)

`EnablePrompting` (boolean)

`SkipDomains` (list of strings)

`Locked` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\LocalNetworkAccess\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\LocalNetworkAccess\BlockTrackers (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\LocalNetworkAccess\EnablePrompting (REG_DWORD) = 0x1
Software\Policies\Mozilla\Firefox\LocalNetworkAccess\SkipDomains\1 (REG_SZ) = example.org
Software\Policies\Mozilla\Firefox\LocalNetworkAccess\SkipDomains\2 (REG_SZ) = *.example.com
Software\Policies\Mozilla\Firefox\LocalNetworkAccess\Locked (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>LocalNetworkAccess</key>
  <dict>
    <key>Enabled</key>
    <true/>
    <key>BlockTrackers</key>
    <true/>
    <key>EnablePrompting</key>
    <true/>
    <key>SkipDomains</key>
    <array>
      <string>example.org</string>
      <string>*.example.com</string>
    </array>
    <key>Locked</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "LocalNetworkAccess": {
      "Enabled": true,
      "BlockTrackers": true,
      "EnablePrompting": true,
      "SkipDomains": ["example.org", "*.example.com"],
      "Locked": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `LocalNetworkAccess`<br>`LocalNetworkAccess_Enabled`<br>`LocalNetworkAccess_BlockTrackers`<br>`LocalNetworkAccess_EnablePrompting`<br>`LocalNetworkAccess_Locked` | 144.0 |  |
| `LocalNetworkAccess_SkipDomains` | 146.0 |  |

## ManagedBookmarks

Configures a list of bookmarks managed by an administrator that cannot be changed by the user.

The bookmarks are only added as a button on the personal toolbar. They are not in the bookmarks folder.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`children` (list of objects)
- `favicon` (string, URL)
- `name` (string)
- `toplevel_name` (string)
- `url` (string)
- `children` (list of objects)

`favicon` (string, URL)

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

## ManualAppUpdateOnly: Manual Update Only {#manualappupdateonly}

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
| `MicrosoftEntraSSO` | 133.0, 128.5.0esr |  |

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

## OfferToSaveLoginsDefault: Offer to save logins (default) {#offertosaveloginsdefault}

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

## OverrideFirstRunPage: Override the first run page {#overridefirstrunpage}

The page shown on the first run, instead of the built-in one.

If the value is an empty string (""), the first run page is not displayed.

Starting with Firefox 83, Firefox ESR 78.5, you can also specify multiple URLS separated by a vertical bar (|).

**CCK2 Equivalent:** `welcomePage`, `noWelcomePage`\
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

## OverridePostUpdatePage: Override the upgrade page {#overridepostupdatepage}

The page shown after an upgrade, instead of the built-in one.

If the value is an empty string (""), no extra pages are displayed when Firefox is upgraded.

**CCK2 Equivalent:** `upgradePage`, `noUpgradePage`\
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

## PasswordManagerEnabled: Password Manager {#passwordmanagerenabled}

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

## PDFjs: PDF.js {#pdfjs}

Disable or configure PDF.js, the built-in PDF viewer.

Note: DisableBuiltinPDFViewer has not been deprecated. You can either continue to use it, or switch to using PDFjs->Enabled to disable the built-in PDF viewer. This new permission was added because we needed a place for PDFjs->EnabledPermissions.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `pdfjs.disabled`, `pdfjs.enablePermissions`

### Settings

<div class="settings" markdown="1">

`Enabled` (boolean) - Enable PDF.js
> *If false, the built-in PDF viewer is disabled.*

`EnablePermissions` (boolean)
> *If true, the built-in PDF viewer will honor document permissions like preventing the copying of text.*

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

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `permissions.default.camera`, `permissions.default.microphone`, `permissions.default.geo`, `permissions.default.desktop-notification`, `media.autoplay.default`, `permissions.default.xr`, `permissions.default.screen`

### Settings

<div class="settings" markdown="1">

`Camera` (object)
- `Allow` (list of origins) - Allowed Sites
  > *The feature is allowed for these origins.*
- `Block` (list of origins) - Blocked Sites
  > *The feature is not allowed for these origins.*
- `BlockNewRequests` (boolean)
  > *Determines whether or not new requests can be made for the feature.*
- `Locked` (boolean)
  > *Prevents the user from changing preferences for the feature.*

`Microphone` (object)
- `Allow` (list of origins) - Allowed Sites
  > *The feature is allowed for these origins.*
- `Block` (list of origins) - Blocked Sites
  > *The feature is not allowed for these origins.*
- `BlockNewRequests` (boolean)
  > *Determines whether or not new requests can be made for the feature.*
- `Locked` (boolean)
  > *Prevents the user from changing preferences for the feature.*

`Autoplay` (object)
- `Default` (string: `allow-audio-video`, `block-audio` or `block-audio-video`)
  > *The default value for Autoplay. `block-audio-video` is not supported on Firefox ESR 68.*<br>
  > *`allow-audio-video`: Sites may autoplay both audio and video.*<br>
  > *`block-audio`: Sites may autoplay video without sound, but not audio.*<br>
  > *`block-audio-video`: Sites may not autoplay anything.*
- `Allow` (list of origins) - Allowed Sites
  > *The feature is allowed for these origins.*
- `Block` (list of origins) - Blocked Sites
  > *The feature is not allowed for these origins.*
- `Locked` (boolean)
  > *Prevents the user from changing preferences for the feature.*

`Location` (object)
- `Allow` (list of origins) - Allowed Sites
  > *The feature is allowed for these origins.*
- `Block` (list of origins) - Blocked Sites
  > *The feature is not allowed for these origins.*
- `BlockNewRequests` (boolean)
  > *Determines whether or not new requests can be made for the feature.*
- `Locked` (boolean)
  > *Prevents the user from changing preferences for the feature.*

`Notifications` (object)
- `Allow` (list of origins) - Allowed Sites
  > *The feature is allowed for these origins.*
- `Block` (list of origins) - Blocked Sites
  > *The feature is not allowed for these origins.*
- `BlockNewRequests` (boolean)
  > *Determines whether or not new requests can be made for the feature.*
- `Locked` (boolean)
  > *Prevents the user from changing preferences for the feature.*

`VirtualReality` (object)
- `Allow` (list of origins) - Allowed Sites
  > *The feature is allowed for these origins.*
- `Block` (list of origins) - Blocked Sites
  > *The feature is not allowed for these origins.*
- `BlockNewRequests` (boolean)
  > *Determines whether or not new requests can be made for the feature.*
- `Locked` (boolean)
  > *Prevents the user from changing preferences for the feature.*

`ScreenShare` (object) - Screen Sharing
- `Allow` (list of origins) - Allowed Sites
  > *The feature is allowed for these origins.*
- `Block` (list of origins) - Blocked Sites
  > *The feature is not allowed for these origins.*
- `BlockNewRequests` (boolean)
  > *Determines whether or not new requests can be made for the feature.*
- `Locked` (boolean)
  > *Prevents the user from changing preferences for the feature.*

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

## PictureInPicture: Picture-in-Picture {#pictureinpicture}

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

## PopupBlocking: Popups {#popupblocking}

Allow certain websites to display popups and be redirected by third-party frames.

Configure the default pop-up window policy as well as origins for which pop-up windows are allowed.

**CCK2 Equivalent:** `permissions.popup`\
**Preferences Affected:** `dom.disable_open_during_load`

### Settings

<div class="settings" markdown="1">

`Allow` (list of origins) - Allowed Sites
> *Pop-up windows are allowed for these origins.*

`Default` (boolean) - Block pop-ups from websites
> *Determines whether or not pop-up windows are allowed by default.*

`Locked` (boolean) - Do not allow preferences to be changed
> *Prevents the user from changing pop-up preferences.*

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

## PostQuantumKeyAgreementEnabled: Post-quantum key agreement {#postquantumkeyagreementenabled}

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

`"user"` preferences persist across invocations of Firefox. It is the equivalent of a user setting the preference. They are most useful when a preference is needed very early in startup so it can't be set as default by policy. An example of this is ```toolkit.legacyUserProfileCustomizations.stylesheets```.

`"user"` preferences persist even if the policy is removed, so if you need to remove them, you should use the clear policy.

See the examples below for more detail.

IMPORTANT: Make sure you're only setting a particular preference using this mechanism and not some other way.

**CCK2 Equivalent:** `preferences`\
**Preferences Affected:** Many

### Settings

<div class="settings" markdown="1">

`[name]` (number, boolean, string or object)
- `Value` (number, boolean or string)
  > *The value of the preference, which is the key.*
- `Status` (string: `default`, `locked`, `user` or `clear`)
  > *`default`: Change the preference's default value. A value the user has already set still wins.*<br>
  > *`locked`: Change the preference's default value and prevent the user from changing it.*<br>
  > *`user`: Set the preference as though the user had set it, so the value is written to the profile.*<br>
  > *`clear`: Remove any value the user has set, reverting the preference to its default.*
- `Type` (string: `number`, `boolean` or `string`)
  > *The type of the preference (Firefox 123, Firefox ESR 115.8). This is especially useful if you are seeing 0 or 1 values being converted to booleans when set as user preferences.*<br>
  > *`number`: Store `Value` as an integer. Set this explicitly for 0 and 1, which are otherwise stored as booleans.*<br>
  > *`boolean`: Store `Value` as a boolean.*<br>
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

## PrimaryPassword: Primary (Master) Password {#primarypassword}

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

## PrintingEnabled: Printing {#printingenabled}

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
> *`0`: The user can open private windows.*<br>
> *`1`: Private windows and 'about:privatebrowsing' are unavailable.*<br>
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
| `PrivateBrowsingModeAvailability` | 130.0, 128.3.0esr |  |

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

## Proxy: Proxy Settings {#proxy}

Configure proxy settings.

These settings correspond to the connection settings in Firefox preferences.
To specify ports, append them to the hostnames with a colon (:).

Unless you lock this policy, changes the user already has in place will take effect.

**CCK2 Equivalent:** `networkProxy*`\
**Preferences Affected:** `network.proxy.type`, `network.proxy.autoconfig_url`, `network.proxy.socks_remote_dns`, `signon.autologin.proxy`, `network.proxy.socks_version`, `network.proxy.no_proxies_on`, `network.proxy.share_proxy_settings`, `network.proxy.http`, `network.proxy.http_port`, `network.proxy.ftp`, `network.proxy.ftp_port`, `network.proxy.ssl`, `network.proxy.ssl_port`, `network.proxy.socks`, `network.proxy.socks_port`

### Settings

<div class="settings" markdown="1">

`Mode` (string: `none`, `system`, `manual`, `autoDetect` or `autoConfig`) - Connection Type
> *The proxy method being used.*<br>
> *`none`: Connect directly, without a proxy.*<br>
> *`system`: Use the proxy configured in the operating system.*<br>
> *`manual`: Use the proxy hosts given in `HTTPProxy`, `SSLProxy`, `FTPProxy`, and `SOCKSProxy`.*<br>
> *`autoDetect`: Discover the proxy settings for this network automatically.*<br>
> *`autoConfig`: Use the proxy auto-configuration file at `AutoConfigURL`.*

`Locked` (boolean) - Do not allow proxy settings to be changed
> *Whether or not proxy settings can be changed.*

`AutoConfigURL` (string, URL) - Automatic proxy configuration URL
> *Only used if `Mode` is `autoConfig`.*

`FTPProxy` (string)
> *The FTP proxy server.*

`HTTPProxy` (string)
> *The HTTP proxy server.*

`SSLProxy` (string) - HTTPS Proxy
> *The SSL proxy server.*

`SOCKSProxy` (string)
> *The SOCKS proxy server.*

`SOCKSVersion` (number: `4` or `5`)
> *The SOCKS version (4 or 5).*<br>
> *`4`: Use version 4 of the SOCKS protocol to reach `SOCKSProxy`.*<br>
> *`5`: Use version 5 of the SOCKS protocol to reach `SOCKSProxy`.*

`UseHTTPProxyForAllProtocols` (boolean) - Use HTTP proxy for HTTPS
> *Whether or not the HTTP proxy should be used for all other proxies.*

`Passthrough` (string) - Proxy Passthrough
> *These hostnames or IP addresses are not proxied. Use `<local>` to bypass proxying for all hostnames which do not contain periods.*

`UseProxyForDNS` (boolean) - Proxy DNS when using SOCKS
> *Use proxy DNS when using SOCKS v5.*

`AutoLogin` (boolean) - Do not prompt for authentication if password is saved

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

## RelaunchRequired: Relaunch Behavior {#relaunchrequired}

Control relaunch behavior.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`NotificationPeriodHours` (number)

`RestartTimeOfDay` (object)
- `Hour` (number)
- `Minute` (number)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\RelaunchRequired\NotificationPeriodHours (REG_DWORD) = 0x18
Software\Policies\Mozilla\Firefox\RelaunchRequired\RestartTimeOfDay\Hour (REG_DWORD) = 0x2
Software\Policies\Mozilla\Firefox\RelaunchRequired\RestartTimeOfDay\Minute (REG_DWORD) = 0x2a
```

#### macOS
```
<dict>
  <key>RelaunchRequired</key>
  <dict>
    <key>NotificationPeriodHours</key>
    <integer>24</integer>
    <key>RestartTimeOfDay</key>
    <dict>
      <key>Hour</key>
      <integer>2</integer>
      <key>Minute</key>
      <integer>42</integer>
    </dict>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "RelaunchRequired": {
      "NotificationPeriodHours": 24,
      "RestartTimeOfDay": {
        "Hour": 2,
        "Minute": 42
      }
    }
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `RelaunchRequired`<br>`RelaunchRequired_NotificationPeriodHours`<br>`RelaunchRequired_RestartTimeOfDay`<br>`RelaunchRequired_RestartTimeOfDay_Hour`<br>`RelaunchRequired_RestartTimeOfDay_Minute` | 150.0 |  |

## RequestedLocales: Requested locale {#requestedlocales}

Set the list of requested locales for the application in order of preference.

It will cause the corresponding language pack to become active.

Note: For Firefox 68, this can now be a string so that you can specify an empty value.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`RequestedLocales` (string or list of strings)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\RequestedLocales\1 (REG_SZ) = de
Software\Policies\Mozilla\Firefox\RequestedLocales\2 (REG_SZ) = en-US
Software\Policies\Mozilla\Firefox\RequestedLocales (REG_SZ) = de,en-US
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

<dict>
  <key>RequestedLocales</key>
  <string>de,en-US</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "RequestedLocales": ["de", "en-US"]
  }
}

{
  "policies": {
    "RequestedLocales": "de,en-US"
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `RequestedLocales` | 64.0 |  |

## SanitizeOnShutdown: Clear data when browser is closed {#sanitizeonshutdown}

Clear specified data on shutdown, such as History, Cookies, Logins, Cache, Form History, Site Preferences and Offline Website Data.

Note: Starting with Firefox 136, FormData and History have been separated again.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `privacy.sanitize.sanitizeOnShutdown`, `privacy.clearOnShutdown.cache`, `privacy.clearOnShutdown.cookies`, `privacy.clearOnShutdown.downloads`, `privacy.clearOnShutdown.formdata`, `privacy.clearOnShutdown.history`, `privacy.clearOnShutdown.sessions`, `privacy.clearOnShutdown.siteSettings`, `privacy.clearOnShutdown.offlineApps`, `privacy.clearOnShutdown_v2.historyFormDataAndDownloads`, `privacy.clearOnShutdown_v2.cookiesAndStorage`, `privacy.clearOnShutdown_v2.cache`, `privacy.clearOnShutdown_v2.siteSettings`, `privacy.clearOnShutdown_v2.formdata`

### Settings

<div class="settings" markdown="1">

`SanitizeOnShutdown` (boolean or object)

`Cache` (boolean)

`Cookies` (boolean)

`Downloads` (boolean) - Download History **Deprecated.**
> *Part of History.*

`FormData` (boolean)
> *Form History.*

`History` (boolean)
> *Browsing History, Download History.*

`Sessions` (boolean) - Active Logins

`SiteSettings` (boolean) - Site Preferences

`OfflineApps` (boolean) - Offline Website Data **Deprecated.**
> *Part of Cookies.*

`Locked` (boolean)
> *Prevents the user from changing these preferences.*

`Exceptions` (list of origins)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SanitizeOnShutdown (REG_DWORD) = 0x1
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
  <true/>
</dict>

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
    "SanitizeOnShutdown": true
  }
}

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
| `SanitizeOnShutdown_Exceptions` | 154.0, 153.1.0esr |  |

## SearchBar: Search bar location {#searchbar}

Set whether or not search bar is displayed.

**CCK2 Equivalent:** `showSearchBar`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`SearchBar` (string: `unified` or `separate`)
> *`unified`: Search from the address bar, with no separate search box.*<br>
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

## SearchEngines: Search {#searchengines}

The following policies allow for configuring search engines in Firefox.

As of Firefox 139, this policy is available in all versions of Firefox.

**CCK2 Equivalent:** `defaultSearchEngine`, `disableSearchEngineInstall`, `removeDefaultSearchEngines`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Default` (string) - Default Search Engine
> *Set the default search engine.*

`DefaultPrivate` (string)

`PreventInstalls` (boolean) - Prevent Search Engine Installs
> *Prevent installing search engines from webpages.*

`Remove` (list of strings) - Remove Search Engines
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

## SearchEngines › Add

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
> *`GET`: Send the search terms as part of the URL.*<br>
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

## SearchSuggestEnabled: Search Suggestions {#searchsuggestenabled}

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
  > *Environment variables like %USERPROFILE% are only expanded when the policy is set via Group Policy.*

`Delete` (list of strings)

`[name]` (string)
> *Environment variables like %USERPROFILE% are only expanded when the policy is set via Group Policy.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SecurityDevices\Add\A Device (REG_EXPAND_SZ) = /path/to/library/for/device
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

## ShowHomeButton: Show Home button on toolbar {#showhomebutton}

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

## SitePolicies

Fine grained control over policies for specific sites.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Match` (list of strings)

`Exceptions` (list of strings)

`Policies` (object)
- `DisableJit` (boolean)
- `HttpsOnly` (boolean)
- `DisableServiceWorkers` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\SitePolicies (REG_MULTI_SZ) = 
[
  {
    "Match": ["*.example.com"],
    "Policies": {
      "DisableJit": true
    }
  },
  {
    "Exceptions": ["*.example.org"],
    "Policies": {
      "DisableJit": true
    }
  },
  {
    "Match": ["*.example.net"],
    "Policies": {
      "HttpsOnly": true
    }
  }
]
```

#### macOS
```
<dict>
  <key>SitePolicies</key>
  <array>
    <dict>
      <key>Match</key>
      <array>
        <string>*.example.com</string>
      </array>
      <key>Policies</key>
      <dict>
        <key>DisableJit</key>
        <true/>
      </dict>
    </dict>
    <dict>
      <key>Exceptions</key>
      <array>
        <string>*.example.org</string>
      </array>
      <key>Policies</key>
      <dict>
        <key>DisableJit</key>
        <true/>
      </dict>
    </dict>
    <dict>
      <key>Match</key>
      <array>
        <string>*.example.net</string>
      </array>
      <key>Policies</key>
      <dict>
        <key>HttpsOnly</key>
        <true/>
      </dict>
    </dict>
  </array>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SitePolicies": [
      {
        "Match": ["*.example.com"],
        "Policies": {
          "DisableJit": true
        }
      },
      {
        "Exceptions": ["*.example.org"],
        "Policies": {
          "DisableJit": true
        }
      },
      {
        "Match": ["*.example.net"],
        "Policies": {
          "HttpsOnly": true
        }
      }
    ]
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `SitePolicies` | 150.0 |  |

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

## SSLVersionMax: Maximum SSL version enabled {#sslversionmax}

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

## SSLVersionMin: Minimum SSL version enabled {#sslversionmin}

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

## StartDownloadsInTempDirectory: Start Downloads in Temporary Directory {#startdownloadsintempdirectory}

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

## TranslateEnabled: Enable webpage translation {#translateenabled}

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

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons`, `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features`, `browser.aboutwelcome.enabled`, `browser.preferences.moreFromMozilla`, `browser.preferences.experimental`

### Settings

<div class="settings" markdown="1">

`WhatsNew` (boolean) - What's New **Deprecated.**
> *Remove the "What's New" icon and menuitem.*

`ExtensionRecommendations` (boolean)
> *If false, don't recommend extensions while the user is visiting web pages.*

`FeatureRecommendations` (boolean)
> *If false, don't recommend browser features.*

`UrlbarInterventions` (boolean)
> *If false, don't offer Firefox specific suggestions in the URL bar.*

`SkipOnboarding` (boolean)
> *If true, don't show onboarding messages on the new tab page.*

`MoreFromMozilla` (boolean)
> *If false, don't show the "More from Mozilla" section in Preferences. (Firefox 98).*

`FirefoxLabs` (boolean)
> *If false, don't show the "Firefox Labs" section in Preferences. (Firefox 130.0.1).*

`Locked` (boolean) - Do not allow user messaging preferences to be changed
> *Prevents the user from changing user messaging preferences.*

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

## VisualSearchEnabled: Visual Search {#visualsearchenabled}

Enable or disable visual search.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.search.visualSearch.featureGate`

### Settings

<div class="settings" markdown="1">

`VisualSearchEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\VisualSearchEnabled (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>VisualSearchEnabled</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "VisualSearchEnabled": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `VisualSearchEnabled` | 144.0 |  |

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

## XSLTEnabled: Enable XSLT {#xsltenabled}

Enable or disable support for the XSLTProcessor JavaScript API and the XSLT processing instruction.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`XSLTEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Firefox\XSLTEnabled (REG_DWORD) = 0x0
```

#### macOS
```
<dict>
  <key>XSLTEnabled</key>
  <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "XSLTEnabled": false
  }
}
```

### Compatibility

| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `XSLTEnabled` | 151.0 |  |


