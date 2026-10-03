## Enterprise policy descriptions and templates for Thunderbird ESR 128.14.0

Policies can be specified by creating a file called `policies.json`:
* Windows: place the file in a directory called `distribution` in the same
  directory where `thunderbird.exe` is located.
* Mac: place the file into `Thunderbird.app/Contents/Resources/distribution`.
* Linux: place the file into `thunderbird/distribution`, where `thunderbird`
  is the installation directory for Thunderbird. You can also specify a system-wide
  policy by placing the file in `/etc/thunderbird/policies`.

Alternatively, policies can be specified via platform-specific methods:
* Windows: [thunderbird.admx](https://github.com/thunderbird/policy-templates/tree/master/docs/policies/esr128/admx) - use with [group policy templates](https://support.mozilla.org/en-US/kb/customizing-thunderbird-using-group-policy-windows)
* Mac: [org.mozilla.thunderbird.plist](https://github.com/thunderbird/policy-templates/blob/master/docs/policies/esr128/plist/org.mozilla.thunderbird.plist) - use with [configuration profiles](https://support.mozilla.org/en-US/kb/managing-policies-macos-desktops)

This document provides examples in these formats for all policies.


### Windows: installing the ADMX templates

The Thunderbird policies are placed in the "Mozilla" category, which is defined
by Mozilla's `mozilla.admx`. Both templates are needed. The `mozilla.admx`
provided here is Mozilla's unchanged file, and may already be installed together
with the Firefox templates.

* [thunderbird.admx](https://thunderbird.github.io/policy-templates/policies/esr128/admx/thunderbird.admx) and
  [en-US/thunderbird.adml](https://thunderbird.github.io/policy-templates/policies/esr128/admx/en-US/thunderbird.adml)
* [mozilla.admx](https://thunderbird.github.io/policy-templates/policies/esr128/admx/mozilla.admx) and
  [en-US/mozilla.adml](https://thunderbird.github.io/policy-templates/policies/esr128/admx/en-US/mozilla.adml)

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
| **[`3rdparty`](#3rdparty)** | Set policies that WebExtensions can access via chrome.storage.managed.
| **[`AppAutoUpdate`](#appautoupdate)** | Enable or disable automatic application update.
| **[`AppUpdatePin`](#appupdatepin)** | Prevent Thunderbird from being updated beyond the specified version.
| **[`AppUpdateURL`](#appupdateurl)** | Set custom app update URL.
| **[`Authentication`](#authentication)** | Configure integrated authentication for websites that support it.
| **[`BackgroundAppUpdate`](#backgroundappupdate)** | Enable or disable the background updater.
| **[`BlockAboutAddons`](#blockaboutaddons)** | Block access to the Add-ons Manager (about:addons).
| **[`BlockAboutConfig`](#blockaboutconfig)** | Block access to the about:config page.
| **[`BlockAboutProfiles`](#blockaboutprofiles)** | Block access to the about:profiles page.
| **[`BlockAboutSupport`](#blockaboutsupport)** | Block access to the about:support page.
| **[`CaptivePortal`](#captiveportal)** | Enable or disable captive portal support.
| **[`Certificates`](#certificates)** | Add certificates or use built-in certificates.
| **[`Certificates -> ImportEnterpriseRoots`](#certificates--importenterpriseroots)** | Trust certificates that have been added to the operating system certificate store by a user or administrator.
| **[`Certificates -> Install`](#certificates--install)** | Install certificates into the Thunderbird certificate store.
| **[`Cookies`](#cookies)** | Allow or deny websites to set cookies.
| **[`DefaultDownloadDirectory`](#defaultdownloaddirectory)** | Set the default download directory.
| **[`DisableAppUpdate`](#disableappupdate)** | Prevent Thunderbird from updating.
| **[`DisableBuiltinPDFViewer`](#disablebuiltinpdfviewer)** | Disable PDF.js, the built-in PDF viewer in Thunderbird.
| **[`DisabledCiphers`](#disabledciphers)** | Disable ciphers.
| **[`DisableDeveloperTools`](#disabledevelopertools)** | Block access to the developer tools.
| **[`DisableMasterPasswordCreation`](#disablemasterpasswordcreation)** | If true, a master password can’t be created.
| **[`DisablePasswordReveal`](#disablepasswordreveal)** | Meant to prevent passwords from being revealed in saved logins. In this version, this policy has no effect.
| **[`DisableSafeMode`](#disablesafemode)** | Disable the feature to restart in Safe Mode. Note: the Shift key to enter Safe Mode can only be disabled on Windows using Group Policy.
| **[`DisableSecurityBypass`](#disablesecuritybypass)** | Prevent the user from bypassing certain security warnings.
| **[`DisableSystemAddonUpdate`](#disablesystemaddonupdate)** | Prevent Thunderbird from installing and updating system add-ons.
| **[`DisableTelemetry`](#disabletelemetry)** | Turn off Telemetry.
| **[`DNSOverHTTPS`](#dnsoverhttps)** | Configure DNS over HTTPS.
| **[`DownloadDirectory`](#downloaddirectory)** | Set and lock the download directory.
| **[`Extensions`](#extensions)** | Install, uninstall or lock extensions. The Install option takes URLs or paths as parameters. The Uninstall and Locked options take extension IDs.
| **[`ExtensionSettings`](#extensionsettings)** | Manage all aspects of extension installation.
| **[`ExtensionUpdate`](#extensionupdate)** | Enable or disable automatic extension updates.
| **[`Handlers`](#handlers)** | Configure default application handlers.
| **[`HardwareAcceleration`](#hardwareacceleration)** | If false, turn off hardware acceleration.
| **[`InstallAddonsPermission`](#installaddonspermission)** | Allow certain websites to install add-ons.
| **[`ManualAppUpdateOnly`](#manualappupdateonly)** | Allow manual updates only and do not notify the user about updates.
| **[`NetworkPrediction`](#networkprediction)** | Enable or disable network prediction (DNS prefetching).
| **[`OfferToSaveLogins`](#offertosavelogins)** | Enforce the setting to allow Thunderbird to offer to remember saved logins and passwords. Both true and false values are accepted.
| **[`OfferToSaveLoginsDefault`](#offertosaveloginsdefault)** | Set the default value for allowing Thunderbird to offer to remember saved logins and passwords. Both true and false values are accepted.
| **[`PasswordManagerEnabled`](#passwordmanagerenabled)** | Enable saving passwords to the password manager.
| **[`PDFjs`](#pdfjs)** | Disable or configure PDF.js, the built-in PDF viewer in Thunderbird.
| **[`Preferences`](#preferences)** | Set and lock the value for a subset of preferences.
| **[`PrimaryPassword`](#primarypassword)** | Require or prevent using a Primary Password.
| **[`PromptForDownloadLocation`](#promptfordownloadlocation)** | Ask where to save files when downloading.
| **[`Proxy`](#proxy)** | Configure proxy settings.
| **[`RequestedLocales`](#requestedlocales)** | Set the list of requested locales for the application in order of preference.
| **[`SearchEngines`](#searchengines)** | Configure search engine settings.
| **[`SearchEngines -> Add`](#searchengines--add)** | Add new search engines.
| **[`SearchEngines -> Default`](#searchengines--default)** | Set the default search engine, which is used to search the web from Thunderbird.
| **[`SearchEngines -> DefaultPrivate`](#searchengines--defaultprivate)** | Set the default search engine for private browsing.
| **[`SearchEngines -> PreventInstalls`](#searchengines--preventinstalls)** | Prevent installing search engines from webpages.
| **[`SearchEngines -> Remove`](#searchengines--remove)** | Hide built-in search engines.
| **[`SSLVersionMax`](#sslversionmax)** | Set the maximum SSL version.
| **[`SSLVersionMin`](#sslversionmin)** | Set the minimum SSL version.

## 3rdparty

Set policies that WebExtensions can access via chrome.storage.managed.

Each entry is the managed storage of one extension, which the extension reads with `browser.storage.managed` and uses as its settings. For more information, see [Adding policy support to your extension](https://extensionworkshop.com/documentation/enterprise/enterprise-development/#how-to-add-policy).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Extensions` Managed storage of extensions (object)
> *The managed storage of each extension, one JSON object per extension ID, which the extension reads with `browser.storage.managed`.*
- `[name]` (JSON)
  > *The managed storage entries of one extension. Their format is defined by the extension.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\3rdparty\Extensions\uBlock0@raymondhill.net (REG_MULTI_SZ) = 
{
  "adminSettings": {
    "selectedFilterLists": ["ublock-privacy", "ublock-badware", "ublock-filters", "user-filters"]
  }
}
```

#### macOS
```
<dict>
  <key>3rdparty</key>
  <dict>
    <key>Extensions</key>
    <dict>
      <key>uBlock0@raymondhill.net</key>
      <dict>
        <key>adminSettings</key>
        <dict>
          <key>selectedFilterLists</key>
          <array>
            <string>ublock-privacy</string>
            <string>ublock-badware</string>
            <string>ublock-filters</string>
            <string>user-filters</string>
          </array>
        </dict>
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
        "uBlock0@raymondhill.net": {
          "adminSettings": {
            "selectedFilterLists": ["ublock-privacy", "ublock-badware", "ublock-filters", "user-filters"]
          }
        }
      }
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `3rdparty`<br>`3rdparty_Extensions`<br>`3rdparty_Extensions_[name]` | 78.0 |  |

## AppAutoUpdate: Automatic updates {#appautoupdate}

Enable or disable automatic application update.

Install application updates automatically. If this policy is enabled, updates are installed without asking the user (the operating system might still ask for approval). If it is disabled, updates are downloaded, and the user chooses when to install them. In both cases, the user can't change the setting. If updates are turned off with `DisableAppUpdate`, this policy has no effect.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `app.update.auto`

### Settings

<div class="settings" markdown="1">

`AppAutoUpdate` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\AppAutoUpdate (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>AppAutoUpdate</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "AppAutoUpdate": true
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `AppAutoUpdate` | 75.0 |  |

## AppUpdatePin

Prevent Thunderbird from being updated beyond the specified version.

You can specify the version as `xx.` and Thunderbird will be updated with all minor versions, but will not be updated beyond the major version.

You can also specify the version as `xx.xx` and Thunderbird will be updated with all patch versions, but will not be updated beyond the minor version.

You should specify a version that exists or is guaranteed to exist. If you specify a version that doesn't end up existing, Thunderbird will update beyond that version.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`AppUpdatePin` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\AppUpdatePin (REG_SZ) = 106.
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `AppUpdatePin` | 104.0 |  |

## AppUpdateURL

Set custom app update URL.

Change the URL for application update if you are providing Thunderbird updates from a custom update server.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `app.update.url`

### Settings

<div class="settings" markdown="1">

`AppUpdateURL` (string, URL)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\AppUpdateURL (REG_SZ) = https://yoursite.com
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `AppUpdateURL` | 68.0 |  |

## Authentication

Configure integrated authentication for websites that support it.

See [Integrated authentication](https://htmlpreview.github.io/?https://github.com/mdn/archived-content/blob/main/files/en-us/mozilla/integrated_authentication/raw.html) for more information.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.negotiate-auth.trusted-uris`, `network.negotiate-auth.delegation-uris`, `network.automatic-ntlm-auth.trusted-uris`, `network.automatic-ntlm-auth.allow-non-fqdn`, `network.negotiate-auth.allow-non-fqdn`, `network.automatic-ntlm-auth.allow-proxies`, `network.negotiate-auth.allow-proxies`, `network.auth.private-browsing-sso`

### Settings

<div class="settings" markdown="1">

`SPNEGO` Sites allowed to use SPNEGO (list of strings)
> *Websites which may use integrated authentication via SPNEGO (Kerberos).*

`Delegated` Sites allowed to receive delegated credentials (list of strings)
> *Websites to which Thunderbird may delegate the authorization of the user.*

`NTLM` Sites allowed to use NTLM (list of strings)
> *Websites which may use integrated authentication via NTLM.*

`AllowNonFQDN` Allow integrated authentication for non-FQDN hosts (object)
> *Allows integrated authentication for hosts which are not given as fully qualified domain names.*
- `SPNEGO` Allow SPNEGO (boolean)
- `NTLM` Allow NTLM (boolean)

`AllowProxies` Allow integrated authentication for proxies (object)
> *Allows integrated authentication for proxy servers.*
- `SPNEGO` Allow SPNEGO (boolean)
- `NTLM` Allow NTLM (boolean)

`Locked` Lock the integrated authentication settings (boolean)
> *Prevents the user from changing the integrated authentication settings. The settings are locked unless this is false.*

`PrivateBrowsing` Integrated authentication in private browsing (boolean)
> *Enables integrated authentication in private browsing.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Authentication\SPNEGO\1 (REG_SZ) = mydomain.com
Software\Policies\Mozilla\Thunderbird\Authentication\SPNEGO\2 (REG_SZ) = https://myotherdomain.com
Software\Policies\Mozilla\Thunderbird\Authentication\Delegated\1 (REG_SZ) = mydomain.com
Software\Policies\Mozilla\Thunderbird\Authentication\Delegated\2 (REG_SZ) = https://myotherdomain.com
Software\Policies\Mozilla\Thunderbird\Authentication\NTLM\1 (REG_SZ) = mydomain.com
Software\Policies\Mozilla\Thunderbird\Authentication\NTLM\2 (REG_SZ) = https://myotherdomain.com
Software\Policies\Mozilla\Thunderbird\Authentication\AllowNonFQDN\SPNEGO (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\Authentication\AllowNonFQDN\NTLM (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\Authentication\AllowProxies\SPNEGO (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\Authentication\AllowProxies\NTLM (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\Authentication\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\Authentication\PrivateBrowsing (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `Authentication`<br>`Authentication_SPNEGO`<br>`Authentication_Delegated`<br>`Authentication_NTLM`<br>`Authentication_AllowNonFQDN`<br>`Authentication_AllowNonFQDN_SPNEGO`<br>`Authentication_AllowNonFQDN_NTLM`<br>`Authentication_AllowProxies`<br>`Authentication_AllowProxies_SPNEGO`<br>`Authentication_AllowProxies_NTLM`<br>`Authentication_Locked`<br>`Authentication_PrivateBrowsing` | 78.0 |  |

## BackgroundAppUpdate: Background updates {#backgroundappupdate}

Enable or disable the background updater.

Install application updates in the background, also when Thunderbird is not running (only on Windows). If this policy is enabled, updates may be installed in the background without asking the user (the operating system might still ask for approval). If it is disabled, no updates are installed while Thunderbird is not running. In both cases, the user can't change the setting. If updates are turned off with `DisableAppUpdate`, or automatic updates with `AppAutoUpdate`, this policy has no effect. If background updates don't run, check the [requirements in this support article](https://support.mozilla.org/en-US/kb/enable-background-updates-thunderbird-windows).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `app.update.background.enabled`

### Settings

<div class="settings" markdown="1">

`BackgroundAppUpdate` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BackgroundAppUpdate (REG_DWORD) = 0x1
```

#### policies.json
```
{
  "policies": {
    "BackgroundAppUpdate": true
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `BackgroundAppUpdate` | 92.0 |  |

## BlockAboutAddons

Block access to the Add-ons Manager (about:addons).

Users can no longer open it to install, remove, enable or disable add-ons, or to change their options. Add-ons can still be managed with the Extensions and ExtensionSettings policies.

If this policy is disabled or not configured, the Add-ons Manager is available.

**CCK2 Equivalent:** `disableAddonsManager`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`BlockAboutAddons` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutAddons (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `BlockAboutAddons` | 68.0 |  |

## BlockAboutConfig

Block access to the about:config page.

Block access to about:config.

**CCK2 Equivalent:** `disableAboutConfig`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`BlockAboutConfig` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutConfig (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `BlockAboutConfig` | 68.0 |  |

## BlockAboutProfiles

Block access to the about:profiles page.

Block access to About Profiles (about:profiles).

**CCK2 Equivalent:** `disableAboutProfiles`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`BlockAboutProfiles` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutProfiles (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `BlockAboutProfiles` | 68.0 |  |

## BlockAboutSupport

Block access to the about:support page.

Block access to Troubleshooting Information (about:support).

**CCK2 Equivalent:** `disableAboutSupport`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`BlockAboutSupport` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutSupport (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `BlockAboutSupport` | 68.0 |  |

## CaptivePortal: Captive portal detection {#captiveportal}

Enable or disable captive portal support.

Detect captive portals, the login pages of networks in hotels or airports which have to be passed before the internet can be used. If this policy is enabled, the detection is turned on. If it is disabled, it is turned off. In both cases, the user can't change the setting. If this policy is not configured, the user can change the setting.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.captive-portal-service.enabled`

### Settings

<div class="settings" markdown="1">

`CaptivePortal` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\CaptivePortal (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>CaptivePortal</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "CaptivePortal": true
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `CaptivePortal` | 78.0 |  |

## Certificates

Add certificates or use built-in certificates.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Certificates` (object)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Certificates\ImportEnterpriseRoots (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\Certificates\Install\1 (REG_EXPAND_SZ) = cert1.der
Software\Policies\Mozilla\Thunderbird\Certificates\Install\2 (REG_EXPAND_SZ) = C:\Users\username\cert2.pem
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `Certificates`<br>`Certificates_ImportEnterpriseRoots`<br>`Certificates_Install` | 68.0 |  |

## Certificates | ImportEnterpriseRoots: Trust certificates that have been added to the operating system certificate store by a user or administrator {#certificates--importenterpriseroots}

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
Software\Policies\Mozilla\Thunderbird\Certificates\ImportEnterpriseRoots (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `Certificates_ImportEnterpriseRoots` | 68.0 |  |

## Certificates | Install: Install certificates into the Thunderbird certificate store {#certificates--install}

Install certificates into the Thunderbird certificate store.

If only a filename is specified, Thunderbird searches for the file in the following locations:

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

A fully qualified path can be used, including UNC paths. You should use the native path style for your operating system.

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
Software\Policies\Mozilla\Thunderbird\Certificates\Install\1 (REG_EXPAND_SZ) = cert1.der
Software\Policies\Mozilla\Thunderbird\Certificates\Install\2 (REG_EXPAND_SZ) = C:\Users\username\cert2.pem
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `Certificates_Install` | 68.0 |  |

## Cookies

Allow or deny websites to set cookies.

Configure cookie preferences.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.cookie.cookieBehavior`, `network.cookie.cookieBehavior.pbmode`

### Settings

<div class="settings" markdown="1">

`Allow` Sites which may always set cookies (list of origins)
> *A list of origins (not domains) where cookies are always allowed. You must include http or https.*

`Block` Sites which may never set cookies (list of origins)
> *A list of origins (not domains) where cookies are always blocked. You must include http or https.*

`Default` Accept cookies (boolean)
> *Determines whether cookies are accepted at all.*

`AcceptThirdParty` Accept third-party cookies (string: `always`, `never` or `from-visited`)
> *Determines how third-party cookies are handled.*\
> *`always`: Accept all third-party cookies.*\
> *`never`: Reject all third-party cookies.*\
> *`from-visited`: Accept third-party cookies only from sites the user has visited.*

`ExpireAtSessionEnd` Keep cookies only until the end of the session (boolean) **Deprecated.**
> *This setting has no effect anymore.*

`Locked` Lock the cookie preferences (boolean)
> *Prevents the user from changing cookie preferences.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Cookies\Allow\1 (REG_SZ) = http://example.org/
Software\Policies\Mozilla\Thunderbird\Cookies\Block\1 (REG_SZ) = http://example.edu/
Software\Policies\Mozilla\Thunderbird\Cookies\Default (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\Cookies\AcceptThirdParty (REG_SZ) = always
Software\Policies\Mozilla\Thunderbird\Cookies\Locked (REG_DWORD) = 0x1
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
    <key>Block</key>
    <array>
      <string>http://example.edu/</string>
    </array>
    <key>Default</key>
    <true/>
    <key>AcceptThirdParty</key>
    <string>always</string>
    <key>Locked</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Cookies": {
      "Allow": ["http://example.org/"],
      "Block": ["http://example.edu/"],
      "Default": true,
      "AcceptThirdParty": "always",
      "Locked": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `Cookies`<br>`Cookies_Allow`<br>`Cookies_Block`<br>`Cookies_Default`<br>`Cookies_AcceptThirdParty`<br>`Cookies_ExpireAtSessionEnd`<br>`Cookies_Locked` | 78.0 |  |

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
Software\Policies\Mozilla\Thunderbird\DefaultDownloadDirectory (REG_EXPAND_SZ) = ${home}\Downloads
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DefaultDownloadDirectory` | 78.0 |  |

## DisableAppUpdate

Prevent Thunderbird from updating.

Turn off application updates within Thunderbird.

**CCK2 Equivalent:** `disableFirefoxUpdates`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableAppUpdate` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableAppUpdate (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DisableAppUpdate` | 68.0 |  |

## DisableBuiltinPDFViewer

Disable PDF.js, the built-in PDF viewer in Thunderbird.

Disable the built in PDF viewer. PDF files are downloaded and sent externally.

**CCK2 Equivalent:** `disablePDFjs`\
**Preferences Affected:** `pdfjs.disabled`

### Settings

<div class="settings" markdown="1">

`DisableBuiltinPDFViewer` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableBuiltinPDFViewer (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DisableBuiltinPDFViewer` | 92.0 |  |

## DisabledCiphers

Disable ciphers.

Disable specific cryptographic ciphers.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.ssl3.ecdhe_rsa_aes_128_gcm_sha256`, `security.ssl3.ecdhe_ecdsa_aes_128_gcm_sha256`, `security.ssl3.ecdhe_ecdsa_chacha20_poly1305_sha256`, `security.ssl3.ecdhe_rsa_chacha20_poly1305_sha256`, `security.ssl3.ecdhe_ecdsa_aes_256_gcm_sha384`, `security.ssl3.ecdhe_rsa_aes_256_gcm_sha384`, `security.ssl3.ecdhe_rsa_aes_128_sha`, `security.ssl3.ecdhe_ecdsa_aes_128_sha`, `security.ssl3.ecdhe_rsa_aes_256_sha`, `security.ssl3.ecdhe_ecdsa_aes_256_sha`, `security.ssl3.dhe_rsa_aes_128_sha`, `security.ssl3.dhe_rsa_aes_256_sha`, `security.ssl3.rsa_aes_128_gcm_sha256`, `security.ssl3.rsa_aes_256_gcm_sha384`, `security.ssl3.rsa_aes_128_sha`, `security.ssl3.rsa_aes_256_sha`, `security.ssl3.deprecated.rsa_des_ede3_sha`

### Settings

<div class="settings" markdown="1">

`TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256` Disable TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (boolean)

`TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256` Disable TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 (boolean)

`TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256` Disable TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256 (boolean)

`TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256` Disable TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 (boolean)

`TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384` Disable TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 (boolean)

`TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384` Disable TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (boolean)

`TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA` Disable TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA (boolean)

`TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA` Disable TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA (boolean)

`TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA` Disable TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA (boolean)

`TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA` Disable TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA (boolean)

`TLS_DHE_RSA_WITH_AES_128_CBC_SHA` Disable TLS_DHE_RSA_WITH_AES_128_CBC_SHA (boolean)

`TLS_DHE_RSA_WITH_AES_256_CBC_SHA` Disable TLS_DHE_RSA_WITH_AES_256_CBC_SHA (boolean)

`TLS_RSA_WITH_AES_128_GCM_SHA256` Disable TLS_RSA_WITH_AES_128_GCM_SHA256 (boolean)

`TLS_RSA_WITH_AES_256_GCM_SHA384` Disable TLS_RSA_WITH_AES_256_GCM_SHA384 (boolean)

`TLS_RSA_WITH_AES_128_CBC_SHA` Disable TLS_RSA_WITH_AES_128_CBC_SHA (boolean)

`TLS_RSA_WITH_AES_256_CBC_SHA` Disable TLS_RSA_WITH_AES_256_CBC_SHA (boolean)

`TLS_RSA_WITH_3DES_EDE_CBC_SHA` Disable TLS_RSA_WITH_3DES_EDE_CBC_SHA (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256 (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_DHE_RSA_WITH_AES_128_CBC_SHA (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_DHE_RSA_WITH_AES_256_CBC_SHA (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_RSA_WITH_AES_128_GCM_SHA256 (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_RSA_WITH_AES_256_GCM_SHA384 (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_RSA_WITH_AES_128_CBC_SHA (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_RSA_WITH_AES_256_CBC_SHA (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\TLS_RSA_WITH_3DES_EDE_CBC_SHA (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>DisabledCiphers</key>
  <dict>
    <key>TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256</key>
    <true/>
    <key>TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256</key>
    <true/>
    <key>TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256</key>
    <true/>
    <key>TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256</key>
    <true/>
    <key>TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384</key>
    <true/>
    <key>TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384</key>
    <true/>
    <key>TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA</key>
    <true/>
    <key>TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA</key>
    <true/>
    <key>TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA</key>
    <true/>
    <key>TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA</key>
    <true/>
    <key>TLS_DHE_RSA_WITH_AES_128_CBC_SHA</key>
    <true/>
    <key>TLS_DHE_RSA_WITH_AES_256_CBC_SHA</key>
    <true/>
    <key>TLS_RSA_WITH_AES_128_GCM_SHA256</key>
    <true/>
    <key>TLS_RSA_WITH_AES_256_GCM_SHA384</key>
    <true/>
    <key>TLS_RSA_WITH_AES_128_CBC_SHA</key>
    <true/>
    <key>TLS_RSA_WITH_AES_256_CBC_SHA</key>
    <true/>
    <key>TLS_RSA_WITH_3DES_EDE_CBC_SHA</key>
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
      "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256": true,
      "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256": true,
      "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256": true,
      "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384": true,
      "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384": true,
      "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA": true,
      "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA": true,
      "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA": true,
      "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA": true,
      "TLS_DHE_RSA_WITH_AES_128_CBC_SHA": true,
      "TLS_DHE_RSA_WITH_AES_256_CBC_SHA": true,
      "TLS_RSA_WITH_AES_128_GCM_SHA256": true,
      "TLS_RSA_WITH_AES_256_GCM_SHA384": true,
      "TLS_RSA_WITH_AES_128_CBC_SHA": true,
      "TLS_RSA_WITH_AES_256_CBC_SHA": true,
      "TLS_RSA_WITH_3DES_EDE_CBC_SHA": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DisabledCiphers`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA`<br>`DisabledCiphers_TLS_DHE_RSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_DHE_RSA_WITH_AES_256_CBC_SHA`<br>`DisabledCiphers_TLS_RSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_RSA_WITH_AES_256_CBC_SHA`<br>`DisabledCiphers_TLS_RSA_WITH_3DES_EDE_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA` | 102.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_RSA_WITH_AES_256_GCM_SHA384` | 92.0 |  |

## DisableDeveloperTools

Block access to the developer tools.

Remove access to all developer tools.

**CCK2 Equivalent:** `removeDeveloperTools`\
**Preferences Affected:** `devtools.policy.disabled`, `devtools.chrome.enabled`

### Settings

<div class="settings" markdown="1">

`DisableDeveloperTools` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableDeveloperTools (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DisableDeveloperTools` | 68.0 |  |

## DisableMasterPasswordCreation: Prevent creating a primary password {#disablemasterpasswordcreation}

If true, a master password can’t be created.

Remove the master password functionality.

If this value is true, it works the same as setting [`PrimaryPassword`](#primarypassword) to false and removes the primary password functionality.

If both `DisableMasterPasswordCreation` and `PrimaryPassword` are used, `DisableMasterPasswordCreation` takes precedence.

**CCK2 Equivalent:** `noMasterPassword`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisableMasterPasswordCreation` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableMasterPasswordCreation (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DisableMasterPasswordCreation` | 68.0 |  |

## DisablePasswordReveal

Meant to prevent passwords from being revealed in saved logins. In this version, this policy has no effect.

Meant to prevent passwords from being shown in saved logins. In this version, this policy has no effect, because the saved passwords dialog of Thunderbird does not check it.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DisablePasswordReveal` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisablePasswordReveal (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DisablePasswordReveal` | 78.0 |  |

## DisableSafeMode: Disable safe mode {#disablesafemode}

Disable the feature to restart in Safe Mode. Note: the Shift key to enter Safe Mode can only be disabled on Windows using Group Policy.

Disable safe mode within the browser.

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
Software\Policies\Mozilla\Thunderbird\DisableSafeMode (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DisableSafeMode` | 78.0 |  |

## DisableSecurityBypass

Prevent the user from bypassing certain security warnings.

Prevent the user from bypassing security in certain cases.

These policies only affect what happens when an error is shown. They do not affect any settings in preferences.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.certerror.hideAddException`, `browser.safebrowsing.allowOverride`

### Settings

<div class="settings" markdown="1">

`InvalidCertificate` Prevent exceptions for invalid certificates (boolean)
> *Prevents adding an exception when an invalid certificate is shown.*

`SafeBrowsing` Prevent visiting harmful sites anyway (boolean)
> *Prevents selecting "ignore the risk" and visiting a harmful site anyway.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableSecurityBypass\InvalidCertificate (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DisableSecurityBypass\SafeBrowsing (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DisableSecurityBypass`<br>`DisableSecurityBypass_InvalidCertificate`<br>`DisableSecurityBypass_SafeBrowsing` | 68.0 |  |

## DisableSystemAddonUpdate

Prevent Thunderbird from installing and updating system add-ons.

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
Software\Policies\Mozilla\Thunderbird\DisableSystemAddonUpdate (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DisableSystemAddonUpdate` | 77.0 |  |

## DisableTelemetry

Turn off Telemetry.

Prevent the upload of telemetry data.

Local storage of telemetry data is disabled as well.

Mozilla recommends that you do not disable telemetry. Information collected through telemetry helps us build a better product for businesses like yours.

**CCK2 Equivalent:** `disableTelemetry`\
**Preferences Affected:** `datareporting.healthreport.uploadEnabled`, `datareporting.policy.dataSubmissionEnabled`, `toolkit.telemetry.archive.enabled`

### Settings

<div class="settings" markdown="1">

`DisableTelemetry` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableTelemetry (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DisableTelemetry` | 78.0 |  |

## DNSOverHTTPS

Configure DNS over HTTPS.

With DNS over HTTPS, host names are resolved through an encrypted connection to a DNS over HTTPS provider, instead of the DNS resolver of the operating system. The user can change these settings, unless the Locked setting is used.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.trr.mode`, `network.trr.uri`, `network.trr.excluded-domains`

### Settings

<div class="settings" markdown="1">

`Enabled` Enable DNS over HTTPS (boolean)
> *Determines whether DNS over HTTPS is enabled.*

`ProviderURL` DNS over HTTPS provider (string, URL)
> *The URL of another DNS over HTTPS provider.*

`ExcludedDomains` Domains excluded from DNS over HTTPS (list of strings)
> *Domains which are resolved without DNS over HTTPS.*

`Locked` Lock the DNS over HTTPS settings (boolean)
> *Prevents the user from changing DNS over HTTPS preferences.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DNSOverHTTPS\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\DNSOverHTTPS\ProviderURL (REG_SZ) = https://dns.example.com/dns-query
Software\Policies\Mozilla\Thunderbird\DNSOverHTTPS\ExcludedDomains\1 (REG_SZ) = example.com
Software\Policies\Mozilla\Thunderbird\DNSOverHTTPS\Locked (REG_DWORD) = 0x1
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
    <key>ExcludedDomains</key>
    <array>
      <string>example.com</string>
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
    "DNSOverHTTPS": {
      "Enabled": true,
      "ProviderURL": "https://dns.example.com/dns-query",
      "ExcludedDomains": ["example.com"],
      "Locked": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DNSOverHTTPS`<br>`DNSOverHTTPS_Enabled`<br>`DNSOverHTTPS_ProviderURL`<br>`DNSOverHTTPS_ExcludedDomains`<br>`DNSOverHTTPS_Locked` | 92.0 |  |

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
Software\Policies\Mozilla\Thunderbird\DownloadDirectory (REG_EXPAND_SZ) = ${home}\Downloads
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `DownloadDirectory` | 78.0 |  |

## Extensions

Install, uninstall or lock extensions. The Install option takes URLs or paths as parameters. The Uninstall and Locked options take extension IDs.

Control the installation, uninstallation and locking of extensions.

We strongly recommend that you use the **[`ExtensionSettings`](#extensionsettings)** policy. It has the same functionality and adds more. It does not support native paths, though, so you'll have to use file:/// URLs.

**CCK2 Equivalent:** `addons`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Install` Extensions to install (list of strings)
> *A list of URLs or native paths of extensions to be installed. Environment variables like %USERPROFILE% are only expanded when the policy is set via Group Policy.*

`Uninstall` Extensions to uninstall (list of strings)
> *A list of extension IDs which are uninstalled if found.*

`Locked` Extensions which can't be disabled or removed (list of strings)
> *A list of extension IDs which the user can't disable or uninstall.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Extensions\Install\1 (REG_EXPAND_SZ) = https://addons.thunderbird.net/thunderbird/downloads/somefile.xpi
Software\Policies\Mozilla\Thunderbird\Extensions\Install\2 (REG_EXPAND_SZ) = //path/to/xpi
Software\Policies\Mozilla\Thunderbird\Extensions\Uninstall\1 (REG_SZ) = bad_addon_id@mozilla.org
Software\Policies\Mozilla\Thunderbird\Extensions\Locked\1 (REG_SZ) = addon_id@mozilla.org
```

#### macOS
```
<dict>
  <key>Extensions</key>
  <dict>
    <key>Install</key>
    <array>
      <string>https://addons.thunderbird.net/thunderbird/downloads/somefile.xpi</string>
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
      "Install": ["https://addons.thunderbird.net/thunderbird/downloads/somefile.xpi", "//path/to/xpi"],
      "Uninstall": ["bad_addon_id@mozilla.org"],
      "Locked": ["addon_id@mozilla.org"]
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `Extensions`<br>`Extensions_Install`<br>`Extensions_Uninstall`<br>`Extensions_Locked` | 68.0 |  |

## ExtensionSettings

Manage all aspects of extension installation.

Manage all aspects of extensions. This policy is based heavily on the [Chrome policy](https://dev.chromium.org/administrators/policy-list-3/extension-settings-full) of the same name.

This policy maps an extension ID to its configuration. With an extension ID, the configuration will be applied to the specified extension only. A default configuration can be set for the special ID "*", which will apply to all extensions that don't have a custom configuration set in this policy.

To obtain an extension ID, install the extension and go to about:support. You will see the ID in the Extensions section.

Installing a theme makes it the default.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`*` (object)
> *The default settings for all extensions which have no entry of their own. Its `installation_mode` and `allowed_types` also apply to an extension whose own entry has no `installation_mode`.*
- `installation_mode` (string: `allowed` or `blocked`)
  > *Whether extensions can be installed.*\
  > *`allowed`: Users can install extensions.*\
  > *`blocked`: No extension can be installed. An extension is only exempt if its own entry in this policy sets `installation_mode` to `allowed`, `force_installed` or `normal_installed`.*
- `allowed_types` (list of strings: `extension`, `dictionary`, `locale` or `theme`)
  > *The types of add-ons which can be installed.*\
  > *`extension`: Ordinary extensions.*\
  > *`dictionary`: Spell-checking dictionaries.*\
  > *`locale`: Language packs that translate the Thunderbird interface.*\
  > *`theme`: Themes that change the appearance of Thunderbird.*
- `blocked_install_message` (string)
  > *A message shown to the user when the installation of an extension is blocked.*
- `install_sources` (list of strings)
  > *The sources from which extensions can be installed, as URL match patterns (e.g. `https://addons.thunderbird.net/*`).*
- `restricted_domains` (list of strings)
  > *The domains on which content scripts of extensions can't run.*

`[name]` (object)
> *The settings of one extension, by its ID. They take precedence over the default settings.*
- `installation_mode` (string: `allowed`, `blocked`, `force_installed` or `normal_installed`)
  > *How the extension is installed.*\
  > *`allowed`: The extension may be installed, even when extensions are blocked by default.*\
  > *`blocked`: The extension cannot be installed, and is uninstalled if already present.*\
  > *`force_installed`: The extension is installed automatically and the user can neither disable nor remove it.*\
  > *`normal_installed`: The extension is installed automatically. The user can disable it but cannot remove it.*
- `install_url` (string)
  > *The URL from which the extension is installed with `force_installed` and `normal_installed`, e.g. from addons.thunderbird.net or a `file:///` URL. It is required for these modes. Without it, this extension and the ones which follow it in this policy are neither installed nor removed.*
- `blocked_install_message` (string)
  > *A message shown to the user when the installation of this extension is blocked.*
- `updates_disabled` (boolean)
  > *If true, the extension is not updated automatically.*
- `private_browsing` (boolean)
  > *If true, the extension is allowed to run in private browsing. If false, it is not.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\ExtensionSettings (REG_MULTI_SZ) = 
{
  "*": {
    "blocked_install_message": "Custom error message.",
    "install_sources": ["about:addons", "https://addons.thunderbird.net/"],
    "installation_mode": "blocked",
    "allowed_types": ["extension"]
  },
  "uBlock0@raymondhill.net": {
    "installation_mode": "force_installed",
    "install_url": "https://addons.thunderbird.net/thunderbird/downloads/latest/ublock-origin/latest.xpi"
  },
  "https-everywhere@eff.org": {
    "installation_mode": "allowed"
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
        <string>about:addons</string>
        <string>https://addons.thunderbird.net/</string>
      </array>
      <key>installation_mode</key>
      <string>blocked</string>
      <key>allowed_types</key>
      <array>
        <string>extension</string>
      </array>
    </dict>
    <key>uBlock0@raymondhill.net</key>
    <dict>
      <key>installation_mode</key>
      <string>force_installed</string>
      <key>install_url</key>
      <string>https://addons.thunderbird.net/thunderbird/downloads/latest/ublock-origin/latest.xpi</string>
    </dict>
    <key>https-everywhere@eff.org</key>
    <dict>
      <key>installation_mode</key>
      <string>allowed</string>
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
        "install_sources": ["about:addons", "https://addons.thunderbird.net/"],
        "installation_mode": "blocked",
        "allowed_types": ["extension"]
      },
      "uBlock0@raymondhill.net": {
        "installation_mode": "force_installed",
        "install_url": "https://addons.thunderbird.net/thunderbird/downloads/latest/ublock-origin/latest.xpi"
      },
      "https-everywhere@eff.org": {
        "installation_mode": "allowed"
      }
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `ExtensionSettings`<br>`ExtensionSettings_[name]`<br>`ExtensionSettings_[name]_blocked_install_message` | 68.0 |  |
| `ExtensionSettings_*`<br>`ExtensionSettings_*_installation_mode`<br>`ExtensionSettings_*_allowed_types`<br>`ExtensionSettings_*_blocked_install_message`<br>`ExtensionSettings_*_install_sources`<br>`ExtensionSettings_*_restricted_domains`<br>`ExtensionSettings_[name]_installation_mode`<br>`ExtensionSettings_[name]_install_url` | 89.0 |  |
| `ExtensionSettings_[name]_updates_disabled` | 92.0 |  |
| `ExtensionSettings_[name]_private_browsing` | 136.0, 128.8.0esr |  |

## ExtensionUpdate: Automatic extension updates {#extensionupdate}

Enable or disable automatic extension updates.

Turn off automatic updates of extensions. If this policy is disabled, extensions are no longer updated automatically, and the user can't turn it on. If it is enabled or not configured, the user's setting applies.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `extensions.update.enabled`

### Settings

<div class="settings" markdown="1">

`ExtensionUpdate` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\ExtensionUpdate (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>ExtensionUpdate</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "ExtensionUpdate": true
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `ExtensionUpdate` | 68.0 |  |

## Handlers

Configure default application handlers.

This policy is based on the internal format of `handlers.json`.

You can configure handlers based on a mime type (`mimeTypes`), a file's extension (`extensions`), or a protocol (`schemes`).

Within each handler type, you specify the given mimeType/extension/scheme as a key.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`(mimeTypes|extensions|schemes)` (object)
> *How content is matched: by its MIME type (`mimeTypes`), by the extension of its file name (`extensions`), or by its protocol (`schemes`).*
- `[name]` (object)
  > *One MIME type, file extension or protocol, with how its content is handled.*
  - `action` (string: `saveToDisk`, `useHelperApp` or `useSystemDefault`)
    > *What happens with the content.*\
    > *`saveToDisk`: Download the file instead of opening it.*\
    > *`useHelperApp`: Open the content with an application listed in `handlers`.*\
    > *`useSystemDefault`: Open the content with the application the operating system associates with that type.*
  - `ask` (boolean)
    > *If true, the user is asked what to do with the content. If false, the action is taken without asking.*
  - `handlers` (list of objects)
    > *The applications which can handle the content. The first one is the default. Each entry has either a `path` or a `uriTemplate`.*
    - `name` (string)
      > *The name of the application.*
    - `path` (string)
      > *The path of the executable of the application.*
    - `uriTemplate` (string)
      > *The URL of a web application. It has to use https and contain %s, which is replaced by the URL of the content.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Handlers (REG_MULTI_SZ) = 
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
          "path": "C:\\Program Files (x86)\\Adobe\\Acrobat Reader DC\\Reader\\AcroRd32.exe"
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `Handlers`<br>`Handlers_mimeTypes`<br>`Handlers_mimeTypes_[name]`<br>`Handlers_mimeTypes_[name]_action`<br>`Handlers_mimeTypes_[name]_ask`<br>`Handlers_mimeTypes_[name]_handlers`<br>`Handlers_extensions`<br>`Handlers_extensions_[name]`<br>`Handlers_extensions_[name]_action`<br>`Handlers_extensions_[name]_ask`<br>`Handlers_extensions_[name]_handlers`<br>`Handlers_schemes`<br>`Handlers_schemes_[name]`<br>`Handlers_schemes_[name]_action`<br>`Handlers_schemes_[name]_ask`<br>`Handlers_schemes_[name]_handlers` | 92.0 |  |

## HardwareAcceleration: Use hardware acceleration {#hardwareacceleration}

If false, turn off hardware acceleration.

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
Software\Policies\Mozilla\Thunderbird\HardwareAcceleration (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>HardwareAcceleration</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "HardwareAcceleration": true
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `HardwareAcceleration` | 78.0 |  |

## InstallAddonsPermission

Allow certain websites to install add-ons.

Configure the default extension install policy and the origins from which extensions can be installed. This policy does not override turning off all extension installs.

**CCK2 Equivalent:** `permissions.install`\
**Preferences Affected:** `xpinstall.enabled`

### Settings

<div class="settings" markdown="1">

`Allow` Sites allowed to install extensions (list of origins)
> *A list of origins where extension installs are allowed.*

`Default` Allow extension installs by default (boolean)
> *Determines whether or not extension installs are allowed by default.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\InstallAddonsPermission\Allow\1 (REG_SZ) = http://example.org/
Software\Policies\Mozilla\Thunderbird\InstallAddonsPermission\Allow\2 (REG_SZ) = http://example.edu/
Software\Policies\Mozilla\Thunderbird\InstallAddonsPermission\Default (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `InstallAddonsPermission`<br>`InstallAddonsPermission_Allow`<br>`InstallAddonsPermission_Default` | 68.0 |  |

## ManualAppUpdateOnly

Allow manual updates only and do not notify the user about updates.

Switch to manual updates only.

If this policy is enabled:

1. The user will never be prompted to install updates.
2. Thunderbird will not check for updates in the background, though it will check automatically when an update UI is displayed (such as the one in the About dialog). This check will be used to show "Update to version X" in the UI, but will not automatically download the update or prompt the user to update in any other way.
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
Software\Policies\Mozilla\Thunderbird\ManualAppUpdateOnly (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `ManualAppUpdateOnly` | 92.0 |  |

## NetworkPrediction: Network prediction (DNS prefetching) {#networkprediction}

Enable or disable network prediction (DNS prefetching).

With network prediction, Thunderbird resolves the host names of links in advance, so they load faster.

If this policy is enabled, network prediction is turned on. If it is disabled, network prediction is turned off. In both cases, the user can't change the setting. If this policy is not configured, the user can change the setting.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.dns.disablePrefetch`, `network.dns.disablePrefetchFromHTTPS`

### Settings

<div class="settings" markdown="1">

`NetworkPrediction` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\NetworkPrediction (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>NetworkPrediction</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "NetworkPrediction": true
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `NetworkPrediction` | 92.0 |  |

## OfferToSaveLogins: Offer to save passwords {#offertosavelogins}

Enforce the setting to allow Thunderbird to offer to remember saved logins and passwords. Both true and false values are accepted.

Control whether or not Thunderbird offers to save passwords.

**CCK2 Equivalent:** `dontRememberPasswords`\
**Preferences Affected:** `signon.rememberSignons`

### Settings

<div class="settings" markdown="1">

`OfferToSaveLogins` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\OfferToSaveLogins (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>OfferToSaveLogins</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "OfferToSaveLogins": true
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `OfferToSaveLogins` | 92.0 |  |

## OfferToSaveLoginsDefault: Offer to save passwords by default {#offertosaveloginsdefault}

Set the default value for allowing Thunderbird to offer to remember saved logins and passwords. Both true and false values are accepted.

Sets the default value of signon.rememberSignons without locking it.

**CCK2 Equivalent:** `dontRememberPasswords`\
**Preferences Affected:** `signon.rememberSignons`

### Settings

<div class="settings" markdown="1">

`OfferToSaveLoginsDefault` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\OfferToSaveLoginsDefault (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>OfferToSaveLoginsDefault</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "OfferToSaveLoginsDefault": true
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `OfferToSaveLoginsDefault` | 92.0 |  |

## PasswordManagerEnabled

Enable saving passwords to the password manager.

Remove access to the password manager via the settings, and block about:logins.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `pref.privacy.disable_button.view_passwords`, `signon.rememberSignons`

### Settings

<div class="settings" markdown="1">

`PasswordManagerEnabled` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\PasswordManagerEnabled (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>PasswordManagerEnabled</key>
  <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PasswordManagerEnabled": true
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `PasswordManagerEnabled` | 78.0 |  |

## PDFjs

Disable or configure PDF.js, the built-in PDF viewer in Thunderbird.

Disable or configure PDF.js, the built-in PDF viewer.

Note: DisableBuiltinPDFViewer has not been deprecated. You can either continue to use it, or switch to using PDFjs->Enabled to disable the built-in PDF viewer.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `pdfjs.disabled`, `pdfjs.enablePermissions`

### Settings

<div class="settings" markdown="1">

`Enabled` Enable the built-in PDF viewer (boolean)
> *If set to false, the built-in PDF viewer is disabled.*

`EnablePermissions` Honor the permissions of PDF documents (boolean)
> *Meant to make the built-in PDF viewer honor document permissions like preventing the copying of text. In this version, the value of this setting is ignored. If it is set, document permissions are honored unless `Enabled` is set to true.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\PDFjs\Enabled (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\PDFjs\EnablePermissions (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `PDFjs`<br>`PDFjs_Enabled`<br>`PDFjs_EnablePermissions` | 92.0 |  |

## Preferences

Set and lock the value for a subset of preferences.

Set and lock preferences.

You can also set default preferences and user preferences, and clear the user value of a preference.

Using the preference as the key, set the `Value` to the corresponding preference value.

Default preferences can be modified by the user.

If a value is locked, it is also set as the default.

User preferences persist across invocations of Thunderbird. It is the equivalent of a user setting the preference. They are most useful when a preference is needed very early in startup so it can't be set as default by policy.

User preferences persist even if the policy is removed, so if you need to remove them, set their `Status` to `clear`.

IMPORTANT: Make sure you're only setting a particular preference using this mechanism and not some other way.

Only these preferences can be set:

- `accessibility.*`
- `app.update.*` (except `app.update.channel`, `app.update.lastUpdateTime` and `app.update.migrated`)
- `browser.*`
- `calendar.*`
- `chat.*`
- `datareporting.policy.*`
- `dom.*`
- `extensions.*`
- `general.autoScroll*`
- `general.smoothScroll*`
- `geo.*`
- `gfx.*`
- `intl.*`
- `layers.*`
- `layout.*`
- `mail.*`
- `mailnews.*`
- `media.*`
- `network.*`
- `pdfjs.*`
- `places.*`
- `print.*`
- `security.default_personal_cert`
- `security.insecure_connection_text.enabled`
- `security.insecure_connection_text.pbmode.enabled`
- `security.insecure_field_warning.contextual.enabled`
- `security.mixed_content.block_active_content`
- `security.osclientcerts.autoload`
- `security.ssl.errorReporting.enabled`
- `security.tls.hello_downgrade_check`
- `security.tls.version.enable-deprecated`
- `security.warn_submit_secure_to_insecure`
- `signon.*`
- `spellchecker.*`
- `ui.*`
- `widget.*`

**CCK2 Equivalent:** `preferences`\
**Preferences Affected:** Many

### Settings

<div class="settings" markdown="1">

`[name]` (number, boolean, string or object)
> *One preference, by its name, as an object with `Value` and `Status`. A value alone (e.g. `true`) sets and locks the default value of the preference.*
- `Value` (number, boolean or string)
  > *The value of the preference.*
- `Status` (string: `default`, `locked`, `user` or `clear`)
  > *How the value is set.*\
  > *`default`: Change the preference's default value. A value the user has already set still wins.*\
  > *`locked`: Change the preference's default value and prevent the user from changing it.*\
  > *`user`: Set the preference as though the user had set it, so the value is written to the profile.*\
  > *`clear`: Remove any value the user has set, reverting the preference to its default.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Preferences (REG_MULTI_SZ) = 
{
  "accessibility.force_disabled": {
    "Value": 1,
    "Status": "default"
  },
  "browser.cache.disk.parent_directory": {
    "Value": "SOME_NATIVE_PATH",
    "Status": "user"
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
    </dict>
    <key>browser.cache.disk.parent_directory</key>
    <dict>
      <key>Value</key>
      <string>SOME_NATIVE_PATH</string>
      <key>Status</key>
      <string>user</string>
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
        "Status": "default"
      },
      "browser.cache.disk.parent_directory": {
        "Value": "SOME_NATIVE_PATH",
        "Status": "user"
      }
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `Preferences` | 68.0 |  |
| `Preferences_[name]`<br>`Preferences_[name]_Value`<br>`Preferences_[name]_Status` | 92.0 |  |
| `Preferences_accessibility.force_disabled`<br>`Preferences_browser.cache.disk.enable`<br>`Preferences_browser.safebrowsing.phishing.enabled`<br>`Preferences_browser.safebrowsing.malware.enabled`<br>`Preferences_browser.search.update`<br>`Preferences_datareporting.policy.dataSubmissionPolicyBypassNotification`<br>`Preferences_dom.allow_scripts_to_close_windows`<br>`Preferences_dom.disable_window_flip`<br>`Preferences_dom.disable_window_move_resize`<br>`Preferences_dom.event.contextmenu.enabled`<br>`Preferences_dom.keyboardevent.keypress.hack.dispatch_non_printable_keys.addl`<br>`Preferences_dom.keyboardevent.keypress.hack.use_legacy_keycode_and_charcode.addl`<br>`Preferences_extensions.blocklist.enabled`<br>`Preferences_geo.enabled`<br>`Preferences_intl.accept_languages`<br>`Preferences_network.dns.disableIPv6`<br>`Preferences_places.history.enabled`<br>`Preferences_print.save_print_settings`<br>`Preferences_security.default_personal_cert`<br>`Preferences_security.mixed_content.block_active_content`<br>`Preferences_security.osclientcerts.autoload`<br>`Preferences_security.ssl.errorReporting.enabled`<br>`Preferences_security.tls.hello_downgrade_check`<br>`Preferences_widget.content.gtk-theme-override` | 78.0 | 89.0 |
| `Preferences_browser.cache.disk.parent_directory`<br>`Preferences_network.IDN_show_punycode` | 68.0 | 89.0 |
| `Preferences_browser.fixup.dns_first_for_single_words`<br>`Preferences_browser.urlbar.suggest.openpage`<br>`Preferences_browser.urlbar.suggest.history`<br>`Preferences_browser.urlbar.suggest.bookmark` | 68.0 | 77.0 |

## PrimaryPassword

Require or prevent using a Primary Password.

Require or prevent using a primary (formerly master) password.

If this value is true, a primary password is required. If this value is false, it works the same as if [`DisableMasterPasswordCreation`](#disablemasterpasswordcreation) was true and removes the primary password functionality.

If both DisableMasterPasswordCreation and PrimaryPassword are used, DisableMasterPasswordCreation takes precedence.

**CCK2 Equivalent:** `noMasterPassword`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`PrimaryPassword` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\PrimaryPassword (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `PrimaryPassword` | 92.0 |  |

## PromptForDownloadLocation

Ask where to save files when downloading.

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
Software\Policies\Mozilla\Thunderbird\PromptForDownloadLocation (REG_DWORD) = 0x1
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

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `PromptForDownloadLocation` | 78.0 |  |

## Proxy

Configure proxy settings.

These settings correspond to the connection settings in Thunderbird preferences.
To specify ports, append them to the hostnames with a colon (:).

Unless you lock this policy, changes the user already has in place will take effect.

**CCK2 Equivalent:** `networkProxy*`\
**Preferences Affected:** `network.proxy.type`, `network.proxy.autoconfig_url`, `network.proxy.socks_remote_dns`, `signon.autologin.proxy`, `network.proxy.socks_version`, `network.proxy.no_proxies_on`, `network.proxy.share_proxy_settings`, `network.proxy.http`, `network.proxy.http_port`, `network.proxy.ssl`, `network.proxy.ssl_port`, `network.proxy.socks`, `network.proxy.socks_port`

### Settings

<div class="settings" markdown="1">

`Mode` Proxy method (string: `none`, `system`, `manual`, `autoDetect` or `autoConfig`)
> *The proxy method being used.*\
> *`none`: Connect directly, without a proxy.*\
> *`system`: Use the proxy configured in the operating system.*\
> *`manual`: Use the proxy hosts given in `HTTPProxy`, `SSLProxy`, and `SOCKSProxy`.*\
> *`autoDetect`: Discover the proxy settings for this network automatically.*\
> *`autoConfig`: Use the proxy auto-configuration file at `AutoConfigURL`.*

`Locked` Lock the proxy settings (boolean)
> *Prevents the user from changing the proxy settings.*

`AutoConfigURL` Automatic proxy configuration URL (string, URL)
> *The URL of a proxy configuration file (only used if the proxy method is `autoConfig`).*

`FTPProxy` FTP proxy (string) **Deprecated.**
> *This setting has no effect, because support for FTP proxies was removed.*

`HTTPProxy` HTTP proxy (string)
> *The HTTP proxy server.*

`SSLProxy` SSL proxy (string)
> *The SSL proxy server.*

`SOCKSProxy` SOCKS proxy (string)
> *The SOCKS proxy server.*

`SOCKSVersion` SOCKS version (number: `4` or `5`)
> *The SOCKS version.*\
> *`4`: Use version 4 of the SOCKS protocol to reach `SOCKSProxy`.*\
> *`5`: Use version 5 of the SOCKS protocol to reach `SOCKSProxy`.*

`UseHTTPProxyForAllProtocols` Use the HTTP proxy for all protocols (boolean)
> *Whether the HTTP proxy is also used for all other protocols.*

`Passthrough` No proxy for (string)
> *Hostnames or IP addresses which are not proxied, separated by commas. Use `<local>` to bypass proxying for all hostnames which do not contain periods.*

`UseProxyForDNS` Proxy DNS when using SOCKS v5 (boolean)
> *Use the proxy for DNS requests when using SOCKS v5.*

`AutoLogin` Don't prompt for authentication if the password is saved (boolean)
> *Don't prompt for authentication if the password is saved. If the proxy requires authentication and its password is saved, Thunderbird logs in without asking. If that login fails, the user is asked again.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Proxy\Mode (REG_SZ) = none
Software\Policies\Mozilla\Thunderbird\Proxy\Locked (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\Proxy\AutoConfigURL (REG_SZ) = https://proxy.example.com/proxy.pac
Software\Policies\Mozilla\Thunderbird\Proxy\HTTPProxy (REG_SZ) = hostname
Software\Policies\Mozilla\Thunderbird\Proxy\SSLProxy (REG_SZ) = hostname
Software\Policies\Mozilla\Thunderbird\Proxy\SOCKSProxy (REG_SZ) = hostname
Software\Policies\Mozilla\Thunderbird\Proxy\SOCKSVersion (REG_DWORD) = 0x4
Software\Policies\Mozilla\Thunderbird\Proxy\UseHTTPProxyForAllProtocols (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\Proxy\Passthrough (REG_SZ) = <local>, .example.com, 192.168.1.0/24
Software\Policies\Mozilla\Thunderbird\Proxy\UseProxyForDNS (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\Proxy\AutoLogin (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>Proxy</key>
  <dict>
    <key>Mode</key>
    <string>none</string>
    <key>Locked</key>
    <true/>
    <key>AutoConfigURL</key>
    <string>https://proxy.example.com/proxy.pac</string>
    <key>HTTPProxy</key>
    <string>hostname</string>
    <key>SSLProxy</key>
    <string>hostname</string>
    <key>SOCKSProxy</key>
    <string>hostname</string>
    <key>SOCKSVersion</key>
    <integer>4</integer>
    <key>UseHTTPProxyForAllProtocols</key>
    <true/>
    <key>Passthrough</key>
    <string>&lt;local&gt;, .example.com, 192.168.1.0/24</string>
    <key>UseProxyForDNS</key>
    <true/>
    <key>AutoLogin</key>
    <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Proxy": {
      "Mode": "none",
      "Locked": true,
      "AutoConfigURL": "https://proxy.example.com/proxy.pac",
      "HTTPProxy": "hostname",
      "SSLProxy": "hostname",
      "SOCKSProxy": "hostname",
      "SOCKSVersion": 4,
      "UseHTTPProxyForAllProtocols": true,
      "Passthrough": "<local>, .example.com, 192.168.1.0/24",
      "UseProxyForDNS": true,
      "AutoLogin": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `Proxy`<br>`Proxy_Mode`<br>`Proxy_Locked`<br>`Proxy_AutoConfigURL`<br>`Proxy_FTPProxy`<br>`Proxy_HTTPProxy`<br>`Proxy_SSLProxy`<br>`Proxy_SOCKSProxy`<br>`Proxy_SOCKSVersion`<br>`Proxy_UseHTTPProxyForAllProtocols`<br>`Proxy_Passthrough`<br>`Proxy_UseProxyForDNS`<br>`Proxy_AutoLogin` | 68.0 |  |

## RequestedLocales

Set the list of requested locales for the application in order of preference.

The corresponding language packs become active.

Note: This policy can also be a string, so that you can specify an empty value.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`RequestedLocales` (string or array)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\RequestedLocales (REG_SZ) = de,en-US
```

#### macOS
```
<dict>
  <key>RequestedLocales</key>
  <string>de,en-US</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "RequestedLocales": "de,en-US"
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `RequestedLocales` | 68.0 |  |

## SearchEngines

Configure search engine settings.

This policy is only available on the Extended Support Release (ESR) version.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`SearchEngines` (object)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Name (REG_SZ) = Example1
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\IconURL (REG_SZ) = https://www.example.org/favicon.ico
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Alias (REG_SZ) = example
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Description (REG_SZ) = Description
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Encoding (REG_SZ) = UTF-8
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Method (REG_SZ) = GET
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\URLTemplate (REG_SZ) = https://www.example.org/q={searchTerms}
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\PostData (REG_SZ) = name=value&q={searchTerms}
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\SuggestURLTemplate (REG_SZ) = https://www.example.org/suggestions/q={searchTerms}
Software\Policies\Mozilla\Thunderbird\SearchEngines\Default (REG_SZ) = NAME_OF_SEARCH_ENGINE
Software\Policies\Mozilla\Thunderbird\SearchEngines\DefaultPrivate (REG_SZ) = NAME_OF_SEARCH_ENGINE
Software\Policies\Mozilla\Thunderbird\SearchEngines\PreventInstalls (REG_DWORD) = 0x1
Software\Policies\Mozilla\Thunderbird\SearchEngines\Remove\1 (REG_SZ) = NAME_OF_SEARCH_ENGINE
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
        <key>IconURL</key>
        <string>https://www.example.org/favicon.ico</string>
        <key>Alias</key>
        <string>example</string>
        <key>Description</key>
        <string>Description</string>
        <key>Encoding</key>
        <string>UTF-8</string>
        <key>Method</key>
        <string>GET</string>
        <key>URLTemplate</key>
        <string>https://www.example.org/q={searchTerms}</string>
        <key>PostData</key>
        <string>name=value&amp;q={searchTerms}</string>
        <key>SuggestURLTemplate</key>
        <string>https://www.example.org/suggestions/q={searchTerms}</string>
      </dict>
    </array>
    <key>Default</key>
    <string>NAME_OF_SEARCH_ENGINE</string>
    <key>DefaultPrivate</key>
    <string>NAME_OF_SEARCH_ENGINE</string>
    <key>PreventInstalls</key>
    <true/>
    <key>Remove</key>
    <array>
      <string>NAME_OF_SEARCH_ENGINE</string>
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
          "IconURL": "https://www.example.org/favicon.ico",
          "Alias": "example",
          "Description": "Description",
          "Encoding": "UTF-8",
          "Method": "GET",
          "URLTemplate": "https://www.example.org/q={searchTerms}",
          "PostData": "name=value&q={searchTerms}",
          "SuggestURLTemplate": "https://www.example.org/suggestions/q={searchTerms}"
        }
      ],
      "Default": "NAME_OF_SEARCH_ENGINE",
      "DefaultPrivate": "NAME_OF_SEARCH_ENGINE",
      "PreventInstalls": true,
      "Remove": ["NAME_OF_SEARCH_ENGINE"]
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `SearchEngines`<br>`SearchEngines_Add`<br>`SearchEngines_Default`<br>`SearchEngines_DefaultPrivate`<br>`SearchEngines_PreventInstalls`<br>`SearchEngines_Remove` | 108.0 |  |

## SearchEngines | Add: Add new search engines {#searchengines--add}

Add new search engines.

Although there are only five engines available in the ADMX template, there is no limit. To add more in the ADMX template, you can duplicate the XML.

**CCK2 Equivalent:** `searchplugins`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Name` Name (string)
> *The name of the search engine (required).*

`IconURL` Icon URL (string, URL)
> *A URL for the icon to use.*

`Alias` Alias (string)
> *A keyword to use for the engine.*

`Description` Description (string)
> *A description of the search engine.*

`Encoding` Encoding (string)
> *The query charset for the engine. It defaults to UTF-8.*

`Method` Method (string: `GET` or `POST`)
> *The HTTP method.*\
> *`GET`: Send the search terms as part of the URL.*\
> *`POST`: Send the search terms in the request body, using `PostData`.*

`URLTemplate` Search URL (string)
> *The search URL with {searchTerms} to substitute for the search term (required).*

`PostData` POST data (string)
> *The POST data as name value pairs separated by &.*

`SuggestURLTemplate` Suggestions URL (string)
> *A search suggestions URL with {searchTerms} to substitute for the search term.*

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Name (REG_SZ) = Example1
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\IconURL (REG_SZ) = https://www.example.org/favicon.ico
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Alias (REG_SZ) = example
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Description (REG_SZ) = Description
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Encoding (REG_SZ) = UTF-8
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Method (REG_SZ) = GET
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\URLTemplate (REG_SZ) = https://www.example.org/q={searchTerms}
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\PostData (REG_SZ) = name=value&q={searchTerms}
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\SuggestURLTemplate (REG_SZ) = https://www.example.org/suggestions/q={searchTerms}
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
        <key>IconURL</key>
        <string>https://www.example.org/favicon.ico</string>
        <key>Alias</key>
        <string>example</string>
        <key>Description</key>
        <string>Description</string>
        <key>Encoding</key>
        <string>UTF-8</string>
        <key>Method</key>
        <string>GET</string>
        <key>URLTemplate</key>
        <string>https://www.example.org/q={searchTerms}</string>
        <key>PostData</key>
        <string>name=value&amp;q={searchTerms}</string>
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
          "IconURL": "https://www.example.org/favicon.ico",
          "Alias": "example",
          "Description": "Description",
          "Encoding": "UTF-8",
          "Method": "GET",
          "URLTemplate": "https://www.example.org/q={searchTerms}",
          "PostData": "name=value&q={searchTerms}",
          "SuggestURLTemplate": "https://www.example.org/suggestions/q={searchTerms}"
        }
      ]
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `SearchEngines_Add` | 108.0 |  |

## SearchEngines | Default: Set the default search engine {#searchengines--default}

Set the default search engine, which is used to search the web from Thunderbird.

The search engine is given by its name, either a built-in search engine or one added with Add. It is set when the policy is applied for the first time and whenever the name changes, so the user can choose another default search engine in the meantime.

**CCK2 Equivalent:** `defaultSearchEngine`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Default` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SearchEngines\Default (REG_SZ) = NAME_OF_SEARCH_ENGINE
```

#### macOS
```
<dict>
  <key>SearchEngines</key>
  <dict>
    <key>Default</key>
    <string>NAME_OF_SEARCH_ENGINE</string>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SearchEngines": {
      "Default": "NAME_OF_SEARCH_ENGINE"
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `SearchEngines_Default` | 108.0 |  |

## SearchEngines | DefaultPrivate: Set the default search engine for private browsing {#searchengines--defaultprivate}

Set the default search engine for private browsing.

This setting has no effect in Thunderbird.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`DefaultPrivate` (string)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SearchEngines\DefaultPrivate (REG_SZ) = NAME_OF_SEARCH_ENGINE
```

#### macOS
```
<dict>
  <key>SearchEngines</key>
  <dict>
    <key>DefaultPrivate</key>
    <string>NAME_OF_SEARCH_ENGINE</string>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SearchEngines": {
      "DefaultPrivate": "NAME_OF_SEARCH_ENGINE"
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `SearchEngines_DefaultPrivate` | 108.0 |  |

## SearchEngines | PreventInstalls: Prevent installing search engines from webpages {#searchengines--preventinstalls}

Prevent installing search engines from webpages.

This setting has no effect in Thunderbird.

**CCK2 Equivalent:** `disableSearchEngineInstall`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`PreventInstalls` (boolean)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SearchEngines\PreventInstalls (REG_DWORD) = 0x1
```

#### macOS
```
<dict>
  <key>SearchEngines</key>
  <dict>
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
      "PreventInstalls": true
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `SearchEngines_PreventInstalls` | 108.0 |  |

## SearchEngines | Remove: Hide built-in search engines {#searchengines--remove}

Hide built-in search engines.

The search engines are given by their names. They are hidden when the policy is applied for the first time and whenever the list changes.

**CCK2 Equivalent:** `removeDefaultSearchEngines (removed all built-in engines)`\
**Preferences Affected:** N/A

### Settings

<div class="settings" markdown="1">

`Remove` (list of strings)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SearchEngines\Remove\1 (REG_SZ) = NAME_OF_SEARCH_ENGINE
```

#### macOS
```
<dict>
  <key>SearchEngines</key>
  <dict>
    <key>Remove</key>
    <array>
      <string>NAME_OF_SEARCH_ENGINE</string>
    </array>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SearchEngines": {
      "Remove": ["NAME_OF_SEARCH_ENGINE"]
    }
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `SearchEngines_Remove` | 108.0 |  |

## SSLVersionMax

Set the maximum SSL version.

Set and lock the maximum version of TLS. (Thunderbird defaults to a maximum of TLS 1.3.)

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.tls.version.max`

### Settings

<div class="settings" markdown="1">

`SSLVersionMax` (string: `tls1`, `tls1.1`, `tls1.2` or `tls1.3`)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SSLVersionMax (REG_SZ) = tls1
```

#### macOS
```
<dict>
  <key>SSLVersionMax</key>
  <string>tls1</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SSLVersionMax": "tls1"
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `SSLVersionMax` | 68.0 |  |

## SSLVersionMin

Set the minimum SSL version.

Set and lock the minimum version of TLS. (Thunderbird defaults to a minimum of TLS 1.2.)

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.tls.version.min`

### Settings

<div class="settings" markdown="1">

`SSLVersionMin` (string: `tls1`, `tls1.1`, `tls1.2` or `tls1.3`)

</div>

### Examples

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SSLVersionMin (REG_SZ) = tls1
```

#### macOS
```
<dict>
  <key>SSLVersionMin</key>
  <string>tls1</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SSLVersionMin": "tls1"
  }
}
```

### Compatibility

| Policy/Property Name | Thunderbird | Removed after |
|:--- | ---:| ---:|
| `SSLVersionMin` | 68.0 |  |


