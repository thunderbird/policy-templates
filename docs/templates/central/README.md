## Enterprise policy descriptions and templates for Thunderbird Daily 142.0a1

**These policies are in active development and might contain changes that do
not work with current release or ESR versions of Thunderbird.**

Policies can be specified by creating a file called `policies.json`:
* Windows: place the file in a directory called `distribution` in the same
  directory where `thunderbird.exe` is located.
* Mac: place the file into `Thunderbird.app/Contents/Resources/distribution`
* Linux: place the file into `thunderbird/distribution`, where `thunderbird`
  is the installation directory for Thunderbird. You can also specify a system-wide
  policy by placing the file in `/etc/thunderbird/policies`.

Alternatively, policies can be specified via platform specific methods:
* Windows: [thunderbird.admx](https://github.com/thunderbird/policy-templates/tree/master/docs/templates/central/windows) — use with [group policy templates](https://support.mozilla.org/en-US/kb/customizing-thunderbird-using-group-policy-windows) or [intune](https://support.mozilla.org/kb/managing-thunderbird-intune)
* Mac: [org.mozilla.thunderbird.plist](https://github.com/thunderbird/policy-templates/blob/master/docs/templates/central/mac/org.mozilla.thunderbird.plist) — use with [configuration profiles](https://support.mozilla.org/en-US/kb/managing-policies-macos-desktops)

This document provides for all policies examples for the mentioned formats.


| Policy Name | Description
|:--- |:--- |
| **[`3rdparty`](#3rdparty)** | Set policies that WebExtensions can access via chrome.storage.managed.
| **[`AppAutoUpdate`](#appautoupdate)** | Enable or disable automatic application update.
| **[`AppUpdatePin`](#appupdatepin)** | Prevent Thunderbird from being updated beyond the specified version.
| **[`AppUpdateURL`](#appupdateurl)** | Change the URL for application update.
| **[`Authentication`](#authentication)** | Configure sites that support integrated authentication.
| **[`BackgroundAppUpdate`](#backgroundappupdate)** | Enable or disable the background updater (Windows only).
| **[`BlockAboutAddons`](#blockaboutaddons)** | Block access to the Add-ons Manager (about:addons).
| **[`BlockAboutConfig`](#blockaboutconfig)** | Block access to about:config.
| **[`BlockAboutProfiles`](#blockaboutprofiles)** | Block access to About Profiles (about:profiles).
| **[`BlockAboutSupport`](#blockaboutsupport)** | Block access to Troubleshooting Information (about:support).
| **[`CaptivePortal`](#captiveportal)** | Enable or disable the detection of captive portals.
| **[`Certificates`](#certificates)** | 
| **[`Certificates -> ImportEnterpriseRoots`](#certificates--importenterpriseroots)** | Trust certificates that have been added to the operating system certificate store by a user or administrator.
| **[`Certificates -> Install`](#certificates--install)** | Install certificates into the Thunderbird certificate store.
| **[`Cookies`](#cookies)** | Configure cookie preferences.
| **[`DefaultDownloadDirectory`](#defaultdownloaddirectory)** | Set the default download directory.
| **[`DisableAppUpdate`](#disableappupdate)** | Turn off application updates.
| **[`DisableBuiltinPDFViewer`](#disablebuiltinpdfviewer)** | Disable the built in PDF viewer.
| **[`DisabledCiphers`](#disabledciphers)** | Disable ciphers.
| **[`DisableDeveloperTools`](#disabledevelopertools)** | Remove access to all developer tools.
| **[`DisableMasterPasswordCreation`](#disablemasterpasswordcreation)** | Remove the master password functionality.
| **[`DisablePasswordReveal`](#disablepasswordreveal)** | Do not allow passwords to be revealed in saved logins.
| **[`DisableSafeMode`](#disablesafemode)** | Disable safe mode within the browser.
| **[`DisableSecurityBypass`](#disablesecuritybypass)** | Prevent the user from bypassing security in certain cases.
| **[`DisableSystemAddonUpdate`](#disablesystemaddonupdate)** | Prevent system add-ons from being installed or updated.
| **[`DisableTelemetry`](#disabletelemetry)** | DisableTelemetry
| **[`DNSOverHTTPS`](#dnsoverhttps)** | Configure DNS over HTTPS.
| **[`DownloadDirectory`](#downloaddirectory)** | Set and lock the download directory.
| **[`Extensions`](#extensions)** | Control the installation, uninstallation and locking of extensions.
| **[`ExtensionSettings`](#extensionsettings)** | Manage all aspects of extensions.
| **[`ExtensionUpdate`](#extensionupdate)** | Control extension updates.
| **[`Handlers`](#handlers)** | Configure default application handlers.
| **[`HardwareAcceleration`](#hardwareacceleration)** | Control hardware acceleration.
| **[`InAppNotification`](#inappnotification)** | Configure TOAST, browser, and tab notifications within the context of the application.
| **[`InstallAddonsPermission`](#installaddonspermission)** | Configure the default extension install policy as well as origins for extension installs are allowed.
| **[`ManualAppUpdateOnly`](#manualappupdateonly)** | Allow manual updates only and do not notify the user about updates.
| **[`NetworkPrediction`](#networkprediction)** | Enable or disable network prediction (DNS prefetching).
| **[`OfferToSaveLogins`](#offertosavelogins)** | Control whether or not Thunderbird offers to save passwords.
| **[`OfferToSaveLoginsDefault`](#offertosaveloginsdefault)** | Set the default value for whether or not Thunderbird offers to save passwords.
| **[`PasswordManagerEnabled`](#passwordmanagerenabled)** | Remove (some) access to the password manager.
| **[`PDFjs`](#pdfjs)** | Disable or configure PDF.js, the built-in PDF viewer.
| **[`Preferences`](#preferences)** | Set and lock preferences.
| **[`PrimaryPassword`](#primarypassword)** | Require or prevent using a primary (formerly master) password.
| **[`PromptForDownloadLocation`](#promptfordownloadlocation)** | Ask where to save each file before downloading.
| **[`Proxy`](#proxy)** | Configure proxy settings.
| **[`RequestedLocales`](#requestedlocales)** | Set the the list of requested locales for the application in order of preference.
| **[`SearchEngines`](#searchengines)** | 
| **[`SearchEngines -> Add`](#searchengines--add)** | Add new search engines.
| **[`SearchEngines -> Default`](#searchengines--default)** | Set the default search engine.
| **[`SearchEngines -> PreventInstalls`](#searchengines--preventinstalls)** | Prevent installing search engines from webpages.
| **[`SearchEngines -> Remove`](#searchengines--remove)** | Hide built-in search engines.
| **[`SSLVersionMax`](#sslversionmax)** | Set and lock the maximum version of TLS.
| **[`SSLVersionMin`](#sslversionmin)** | Set and lock the minimum version of TLS.

## 3rdparty

Allow WebExtensions to configure policy. For more information, see [Adding policy support to your extension](https://extensionworkshop.com/documentation/enterprise/enterprise-development/#how-to-add-policy).

For GPO and Intune, the extension developer should provide an ADMX file.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

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
            "selectedFilterLists": [
              "ublock-privacy",
              "ublock-badware",
              "ublock-filters",
              "user-filters"
            ]
          }
        }
      }
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `3rdparty`<br>`3rdparty_Extensions`<br>`3rdparty_Extensions_[name]` | 78.0 |  |

## AppAutoUpdate

Enable or disable **automatic** application update.

If set to true, application updates are installed without user approval within Thunderbird. The operating system might still require approval.

If set to false, application updates are downloaded but the user can choose when to install the update.

If you have disabled updates via `DisableAppUpdate`, this policy has no effect.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `app.update.auto`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\AppAutoUpdate (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/AppAutoUpdate
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>AppAutoUpdate</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "AppAutoUpdate": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `AppAutoUpdate` | 75.0 |  |

## AppUpdatePin

Prevent Thunderbird from being updated beyond the specified version.

You can specify the any version as ```xx.``` and Thunderbird will be updated with all minor versions, but will not be updated beyond the major version.

You can also specify the version as ```xx.xx``` and Thunderbird will be updated with all patch versions, but will not be updated beyond the minor version.

You should specify a version that exists or is guaranteed to exist. If you specify a version that doesn't end up existing, Thunderbird will update beyond that version.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\AppUpdatePin (REG_SZ) = "106."
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/AppUpdatePin
```
Value (string):
```
<enabled/>
<data id="String" value="106."/>
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

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `AppUpdatePin` | 104.0 |  |

## AppUpdateURL

Change the URL for application update if you are providing Thunderbird updates from a custom update server.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `app.update.url`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\AppUpdateURL (REG_SZ) = "https://yoursite.com"
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/AppUpdateURL
```
Value (string):
```
<enabled/>
<data id="AppUpdateURL" value="https://yoursite.com"/>
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

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `AppUpdateURL` | 68.0 |  |

## Authentication

Configure sites that support integrated authentication.

See [Integrated authentication](https://htmlpreview.github.io/?https://github.com/mdn/archived-content/blob/main/files/en-us/mozilla/integrated_authentication/raw.html) for more information.

`PrivateBrowsing` enables integrated authentication in private browsing.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.negotiate-auth.trusted-uris`, `network.negotiate-auth.delegation-uris`, `network.automatic-ntlm-auth.trusted-uris`, `network.automatic-ntlm-auth.allow-non-fqdn`, `network.negotiate-auth.allow-non-fqdn`, `network.automatic-ntlm-auth.allow-proxies`, `network.negotiate-auth.allow-proxies`, `network.auth.private-browsing-sso`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Authentication\SPNEGO\1 (REG_SZ) = "mydomain.com"
Software\Policies\Mozilla\Thunderbird\Authentication\SPNEGO\2 (REG_SZ) = "https://myotherdomain.com"
Software\Policies\Mozilla\Thunderbird\Authentication\Delegated\1 (REG_SZ) = "mydomain.com"
Software\Policies\Mozilla\Thunderbird\Authentication\Delegated\2 (REG_SZ) = "https://myotherdomain.com"
Software\Policies\Mozilla\Thunderbird\Authentication\NTLM\1 (REG_SZ) = "mydomain.com"
Software\Policies\Mozilla\Thunderbird\Authentication\NTLM\2 (REG_SZ) = "https://myotherdomain.com"
Software\Policies\Mozilla\Thunderbird\Authentication\AllowNonFQDN\SPNEGO (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Authentication\AllowNonFQDN\NTLM (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Authentication\AllowProxies\SPNEGO (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Authentication\AllowProxies\NTLM (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Authentication\Locked (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Authentication\PrivateBrowsing (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Authentication/Authentication_SPNEGO
```
Value (string):
```
<enabled/>
<data id="Authentication" value="1&#xF000;mydomain&#xF000;2&#xF000;https://myotherdomain.com"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Authentication/Authentication_Delegated
```
Value (string):
```
<enabled/>
<data id="Authentication" value="1&#xF000;mydomain&#xF000;2&#xF000;https://myotherdomain.com"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Authentication/Authentication_NTLM
```
Value (string):
```
<enabled/>
<data id="Authentication" value="1&#xF000;mydomain&#xF000;2&#xF000;https://myotherdomain.com"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Authentication/Authentication_AllowNonFQDN
```
Value (string):
```
<enabled/>
<data id="Authentication_AllowNonFQDN_NTLM" value="true | false"/>
<data id="Authentication_AllowNonFQDN_SPNEGO" value="true | false"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Authentication/Authentication_Locked
```
Value (string):
```
<enabled/> | <disabled/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Authentication/Authentication_PrivateBrowsing
```
Value (string):
```
<enabled/> | <disabled/>
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
      <true/> | <false/>
      <key>NTLM</key>
      <true/> | <false/>
    </dict>
    <key>AllowProxies</key>
      <dict>
      <key>SPNEGO</key>
      <true/> | <false/>
      <key>NTLM</key>
      <true/> | <false/>
    </dict>
    <key>Locked</key>
    <true/> | <false/>
    <key>PrivateBrowsing</key>
    <true/> | <false/>
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
        "SPNEGO": true | false,
        "NTLM": true | false
      },
      "AllowProxies": {
        "SPNEGO": true | false,
        "NTLM": true | false
      },
      "Locked": true | false,
      "PrivateBrowsing": true | false
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `Authentication`<br>`Authentication_SPNEGO`<br>`Authentication_Delegated`<br>`Authentication_NTLM`<br>`Authentication_AllowNonFQDN`<br>`Authentication_AllowNonFQDN_SPNEGO`<br>`Authentication_AllowNonFQDN_NTLM`<br>`Authentication_AllowProxies`<br>`Authentication_AllowProxies_SPNEGO`<br>`Authentication_AllowProxies_NTLM`<br>`Authentication_Locked`<br>`Authentication_PrivateBrowsing` | 78.0 |  |

## BackgroundAppUpdate

Enable or disable **automatic** application update **in the background**, when the application is not running.

If set to true, application updates may be installed (without user approval) in the background, even when the application is not running. The operating system might still require approval.

If set to false, the application will not try to install updates when the application is not running.

If you have disabled updates via `DisableAppUpdate` or disabled automatic updates via `AppAutoUpdate`, this policy has no effect.

If you are having trouble getting the background task to run, verify your configuration with the ["Requirements to run" section in this support document](https://support.mozilla.org/en-US/kb/enable-background-updates-thunderbird-windows).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `app.update.background.enabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BackgroundAppUpdate (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/BackgroundAppUpdate
```
Value (string):
```
<enabled/> | <disabled/>
```

#### policies.json
```
{
  "policies": {
    "BackgroundAppUpdate": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `BackgroundAppUpdate` | 91.0 |  |

## BlockAboutAddons

Block access to the Add-ons Manager (about:addons).

**CCK2 Equivalent:** `disableAddonsManager`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutAddons (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/BlockAboutAddons
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>BlockAboutAddons</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "BlockAboutAddons": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `BlockAboutAddons` | 68.0 |  |

## BlockAboutConfig

Block access to about:config.

**CCK2 Equivalent:** `disableAboutConfig`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutConfig (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/BlockAboutConfig
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>BlockAboutConfig</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "BlockAboutConfig": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `BlockAboutConfig` | 68.0 |  |

## BlockAboutProfiles

Block access to About Profiles (about:profiles).

**CCK2 Equivalent:** `disableAboutProfiles`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutProfiles (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/BlockAboutProfiles
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>BlockAboutProfiles</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "BlockAboutProfiles": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `BlockAboutProfiles` | 68.0 |  |

## BlockAboutSupport

Block access to Troubleshooting Information (about:support).

**CCK2 Equivalent:** `disableAboutSupport`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutSupport (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/BlockAboutSupport
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>BlockAboutSupport</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "BlockAboutSupport": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `BlockAboutSupport` | 68.0 |  |

## CaptivePortal

Enable or disable the detection of captive portals.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.captive-portal-service.enabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\CaptivePortal (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/CaptivePortal
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>CaptivePortal</key>
  <false/> | <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "CaptivePortal": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `CaptivePortal` | 78.0 |  |

## Certificates

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `Certificates`<br>`Certificates_ImportEnterpriseRoots`<br>`Certificates_Install` | 68.0 |  |

## Certificates | ImportEnterpriseRoots

Trust certificates that have been added to the operating system certificate store by a user or administrator.

Note: This policy only works on Windows and macOS. For Linux discussion, see [bug 1600509](https://bugzilla.mozilla.org/show_bug.cgi?id=1600509).

See https://support.mozilla.org/kb/setting-certificate-authorities-firefox for more detail.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.enterprise_roots.enabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Certificates\ImportEnterpriseRoots (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Certificates/Certificates_ImportEnterpriseRoots
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>Certificates</key>
  <dict>
    <key>ImportEnterpriseRoots</key>
    <true/> | <false/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Certificates": {
      "ImportEnterpriseRoots": true | false
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `Certificates_ImportEnterpriseRoots` | 68.0 |  |

## Certificates | Install

Install certificates into the Thunderbird certificate store. If only a filename is specified, Thunderbird searches for the file in the following locations:

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

Starting with Thunderbird 65, Thunderbird 60.5 ESR, a fully qualified path can be used, including UNC paths. You should use the native path style for your operating system. We do not support using %USERPROFILE% or other environment variables on Windows.

If you are specifying the path in the policies.json file on Windows, you need to escape your backslashes (`\\`) which means that for UNC paths, you need to escape both (`\\\\`). If you use group policy, you only need one backslash.

Certificates are installed using the trust string `CT,CT,`.

Binary (DER) and ASCII (PEM) certificates are both supported.

**CCK2 Equivalent:** `certs.ca`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Certificates\Install\1 (REG_SZ) = "cert1.der"
Software\Policies\Mozilla\Thunderbird\Certificates\Install\2 (REG_SZ) = "C:\Users\username\cert2.pem"
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Certificates/Certificates_Install
```
Value (string):
```
<enabled/>
<data id="Certificates_Install" value="1&#xF000;cert1.der&#xF000;2&#xF000;C:\Users\username\cert2.pem"/>
```

#### macOS
```
<dict>
  <key>Certificates</key>
  <dict>
    <key>Install</key>
    <array>
      <string>cert1.der</string>
      <string>/Users/username/cert2.pem</string>
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

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `Certificates_Install` | 68.0 |  |

## Cookies

Configure cookie preferences.

`Allow` is a list of origins (not domains) where cookies are always allowed. You must include http or https.

`AllowSession` is a list of origins (not domains) where cookies are only allowed for the current session. You must include http or https.

`Block` is a list of origins (not domains) where cookies are always blocked. You must include http or https.

`Behavior` sets the default behavior for cookies based on the values below.

`BehaviorPrivateBrowsing` sets the default behavior for cookies in private browsing based on the values below.

| Value | Description
| --- | --- |
| accept | Accept all cookies
| reject-foreign | Reject third party cookies
| reject | Reject all cookies
| limit-foreign | Reject third party cookies for sites you haven't visited
| reject-tracker | Reject cookies for known trackers (default)
| reject-tracker-and-partition-foreign | Reject cookies for known trackers and partition third-party cookies (Total Cookie Protection) (default for private browsing)

`Locked` prevents the user from changing cookie preferences.

`Default` determines whether cookies are accepted at all. (*Deprecated*. Use `Behavior` instead)

`AcceptThirdParty` determines how third-party cookies are handled. (*Deprecated*. Use `Behavior` instead)

`RejectTracker` only rejects cookies for trackers. (*Deprecated*. Use `Behavior` instead)

`ExpireAtSessionEnd` determines when cookies expire. (*Deprecated*. Use [`SanitizeOnShutdown`](#sanitizeonshutdown-selective) instead)

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.cookie.cookieBehavior`, `network.cookie.cookieBehavior.pbmode`, `network.cookie.lifetimePolicy`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Cookies\Allow\1 (REG_SZ) = "https://example.com"
Software\Policies\Mozilla\Thunderbird\Cookies\AllowSession\1 (REG_SZ) = "https://example.edu"
Software\Policies\Mozilla\Thunderbird\Cookies\Block\1 (REG_SZ) = "https://example.org"
Software\Policies\Mozilla\Thunderbird\Cookies\Behavior (REG_SZ) = "accept" | "reject-foreign" | "reject" | "limit-foreign" | "reject-tracker" | "reject-tracker-and-partition-foreign"
Software\Policies\Mozilla\Thunderbird\Cookies\BehaviorPrivateBrowsing (REG_SZ) = "accept" | "reject-foreign" | "reject" | "limit-foreign" | "reject-tracker" | "reject-tracker-and-partition-foreign"
Software\Policies\Mozilla\Thunderbird\Cookies\Locked (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Cookies/Cookies_Allow
```
Value (string):
```
<enabled/>
<data id="Permissions" value="1&#xF000;https://example.com"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Cookies/Cookies_AllowSession
```
Value (string):
```
<enabled/>
<data id="Permissions" value="1&#xF000;https://example.edu"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Cookies/Cookies_Block
```
Value (string):
```
<enabled/>
<data id="Permissions" value="1&#xF000;https://example.org"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Cookies/Cookies_Locked
```
Value (string):
```
<enabled/> | <disabled/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Cookies/Cookies_Behavior
```
Value (string):
```
<enabled/>
<data id="Cookies_Behavior" value="accept | reject-foreign | reject | limit-foreign | reject-tracker | reject-tracker-and-partition-foreign"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Cookies/Cookies_BehaviorPrivateBrowsing
```
Value (string):
```
<enabled/>
<data id="Cookies_BehaviorPrivateBrowsing" value="accept | reject-foreign | reject | limit-foreign | reject-tracker | reject-tracker-and-partition-foreign"/>
```

#### macOS
```
<dict>
  <key>Cookies</key>
  <dict>
    <key>Allow</key>
    <array>
      <string>http://example.com</string>
    </array>
    <key>AllowSession</key>
    <array>
      <string>http://example.edu</string>
    </array>
    <key>Block</key>
    <array>
      <string>http://example.org</string>
    </array>
    <key>Locked</key>
    <true/> | <false/>
    <key>Behavior</key>
    <string>accept | reject-foreign | reject | limit-foreign | reject-tracker | reject-tracker-and-partition-foreign</string>
    <key>BehaviorPrivateBrowsing</key>
    <string>accept | reject-foreign | reject | limit-foreign | reject-tracker | reject-tracker-and-partition-foreign</string>
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
      "Block": ["http://example.edu/"],
      "Locked": true | false,
      "Behavior": "accept" | "reject-foreign" | "reject" | "limit-foreign" | "reject-tracker" | "reject-tracker-and-partition-foreign",
      "BehaviorPrivateBrowsing": "accept" | "reject-foreign" | "reject" | "limit-foreign" | "reject-tracker" | "reject-tracker-and-partition-foreign",
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `Cookies`<br>`Cookies_Allow`<br>`Cookies_Block`<br>`Cookies_Default`<br>`Cookies_AcceptThirdParty`<br>`Cookies_ExpireAtSessionEnd`<br>`Cookies_Locked` | 78.0 |  |
| *`Cookies_AllowSession`<br>`Cookies_RejectTracker`<br>`Cookies_Behavior`<br>`Cookies_BehaviorPrivateBrowsing`* |  |  |

## DefaultDownloadDirectory

Set the default download directory.

You can use ${home} for the native home directory.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.download.dir`, `browser.download.folderList`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DefaultDownloadDirectory (REG_SZ) = "${home}\Downloads"
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DefaultDownloadDirectory
```
Value (string):
```
<enabled/>
<data id="Preferences_String" value="${home}\Downloads"/>
```

#### macOS
```
<dict>
  <key>DefaultDownloadDirectory</key>
  <string>${home}/Downloads</string>
</dict>
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DefaultDownloadDirectory` | 78.0 |  |

## DisableAppUpdate

Turn off application updates within Thunderbird.

**CCK2 Equivalent:** `disableFirefoxUpdates`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableAppUpdate (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DisableAppUpdate
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>DisableAppUpdate</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableAppUpdate": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DisableAppUpdate` | 68.0 |  |

## DisableBuiltinPDFViewer

Disable the built in PDF viewer. PDF files are downloaded and sent externally.

Note: As of Thunderbird 140, this policy no longer completely disables PDF.js; it changes the handler to send PDF files to the operating system. Embedded PDF files are shown in the browser. If you need to completely disable PDF.js, you can use the [`PDFjs`](#pdfjs) policy. 

**CCK2 Equivalent:** `disablePDFjs`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableBuiltinPDFViewer (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DisableBuiltinPDFViewer
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>DisableBuiltinPDFViewer</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableBuiltinPDFViewer": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DisableBuiltinPDFViewer` | 91.0 |  |

## DisabledCiphers

Disable specific cryptographic ciphers, listed below.

```
TLS_DHE_RSA_WITH_AES_128_CBC_SHA
TLS_DHE_RSA_WITH_AES_256_CBC_SHA
TLS_RSA_WITH_AES_128_CBC_SHA
TLS_RSA_WITH_AES_256_CBC_SHA
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA
TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA
TLS_RSA_WITH_3DES_EDE_CBC_SHA
TLS_RSA_WITH_AES_128_GCM_SHA256 (Thunderbird 78)
TLS_RSA_WITH_AES_256_GCM_SHA384 (Thunderbird 78)
TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256 (Thunderbird 97 and Thunderbird ESR 91.6)
TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 (Thunderbird 97 and Thunderbird ESR 91.6)
TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 (Thunderbird 97 and Thunderbird ESR 91.6)
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (Thunderbird 97 and Thunderbird ESR 91.6)
TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA (Thunderbird 97 and Thunderbird ESR 91.6)
TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA (Thunderbird 97 and Thunderbird ESR 91.6)
TLS_CHACHA20_POLY1305_SHA256 (Thunderbird 138, Thunderbird ESR 128.10)
TLS_AES_128_GCM_SHA256 (Thunderbird 138, Thunderbird ESR 128.10)
TLS_AES_256_GCM_SHA384 (Thunderbird 138, Thunderbird ESR 128.10)
```

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.ssl3.ecdhe_rsa_aes_128_gcm_sha256`, `security.ssl3.ecdhe_ecdsa_aes_128_gcm_sha256`, `security.ssl3.ecdhe_ecdsa_chacha20_poly1305_sha256`, `security.ssl3.ecdhe_rsa_chacha20_poly1305_sha256`, `security.ssl3.ecdhe_ecdsa_aes_256_gcm_sha384`, `security.ssl3.ecdhe_rsa_aes_256_gcm_sha384`, `security.ssl3.ecdhe_rsa_aes_128_sha`, `security.ssl3.ecdhe_ecdsa_aes_128_sha`, `security.ssl3.ecdhe_rsa_aes_256_sha`, `security.ssl3.ecdhe_ecdsa_aes_256_sha`, `security.ssl3.dhe_rsa_aes_128_sha`, `security.ssl3.dhe_rsa_aes_256_sha`, `security.ssl3.rsa_aes_128_gcm_sha256`, `security.ssl3.rsa_aes_256_gcm_sha384`, `security.ssl3.rsa_aes_128_sha`, `security.ssl3.rsa_aes_256_sha`, `security.ssl3.deprecated.rsa_des_ede3_sha`, `security.tls13.chacha20_poly1305_sha256`, `security.tls13.aes_128_gcm_sha256`, `security.tls13.aes_256_gcm_sha384`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisabledCiphers\CIPHER_NAME (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~DisabledCiphers/DisabledCiphers_CIPHER_NAME
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>DisabledCiphers</key>
    <dict>
      <key>TLS_DHE_RSA_WITH_AES_128_CBC_SHA</key>
      <true/>
      <key>TLS_DHE_RSA_WITH_AES_256_CBC_SHA</key>
      <true/>
      <key>TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256</key>
      <true/>
      <key>TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA</key>
      <true/>
      <key>TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256</key>
      <true/>
      <key>TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA</key>
      <true/>
      <key>TLS_RSA_WITH_3DES_EDE_CBC_SHA</key>
      <true/>
      <key>TLS_RSA_WITH_AES_128_CBC_SHA</key>
      <true/>
      <key>TLS_RSA_WITH_AES_128_GCM_SHA256</key>
      <false/>
      <key>TLS_RSA_WITH_AES_256_CBC_SHA</key>
      <true/>
      <key>TLS_RSA_WITH_AES_256_GCM_SHA384</key>
      <false/>
    </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisabledCiphers": {
      "TLS_DHE_RSA_WITH_AES_128_CBC_SHA": true | false,
      "TLS_DHE_RSA_WITH_AES_256_CBC_SHA":" true | false,
      "TLS_RSA_WITH_AES_128_CBC_SHA": true | false,
      "TLS_RSA_WITH_AES_256_CBC_SHA": true | false,
      "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256": true | false,
      "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256": true | false,
      "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA": true | false,
      "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA": true | false,
      "TLS_RSA_WITH_3DES_EDE_CBC_SHA": true | false,
      "TLS_RSA_WITH_AES_128_GCM_SHA256": true | false,
      "TLS_RSA_WITH_AES_256_GCM_SHA384": true | false,
      "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256": true | false,
      "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256": true | false,
      "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384": true | false,
      "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384": true | false,
      "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA": true | false,
      "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA": true | false,
      "TLS_CHACHA20_POLY1305_SHA256": true | false,
      "TLS_AES_128_GCM_SHA256": true | false,
      "TLS_AES_256_GCM_SHA384": true | false
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DisabledCiphers`<br>`DisabledCiphers_TLS_DHE_RSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_DHE_RSA_WITH_AES_256_CBC_SHA`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_RSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_RSA_WITH_AES_256_CBC_SHA`<br>`DisabledCiphers_TLS_RSA_WITH_3DES_EDE_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_RSA_WITH_AES_256_GCM_SHA384` | 91.0 |  |
| `DisabledCiphers_TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384`<br>`DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA`<br>`DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA` | 102.0 |  |
| *`DisabledCiphers_TLS_CHACHA20_POLY1305_SHA256`<br>`DisabledCiphers_TLS_AES_128_GCM_SHA256`<br>`DisabledCiphers_TLS_AES_256_GCM_SHA384`* |  |  |

## DisableDeveloperTools

Remove access to all developer tools.

**CCK2 Equivalent:** `removeDeveloperTools`\
**Preferences Affected:** `devtools.policy.disabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableDeveloperTools (REG_SZ) = 0x1 | 0x0`
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DisableDeveloperTools
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>DisableDeveloperTools</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableDeveloperTools": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DisableDeveloperTools` | 68.0 |  |

## DisableMasterPasswordCreation

Remove the master password functionality.

If this value is true, it works the same as setting [`PrimaryPassword`](#primarypassword) to false and removes the primary password functionality.

If both `DisableMasterPasswordCreation` and `PrimaryPassword` are used, `DisableMasterPasswordCreation` takes precedent.

**CCK2 Equivalent:** `noMasterPassword`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableMasterPasswordCreation (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DisableMasterPasswordCreation
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>DisableMasterPasswordCreation</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableMasterPasswordCreation": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DisableMasterPasswordCreation` | 68.0 |  |

## DisablePasswordReveal

Do not allow passwords to be shown in saved logins

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisablePasswordReveal (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DisablePasswordReveal
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>DisablePasswordReveal</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisablePasswordReveal": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DisablePasswordReveal` | 78.0 |  |

## DisableSafeMode

Disable safe mode within the browser.

On Windows, this disables safe mode via the command line as well.

**CCK2 Equivalent:** `disableSafeMode`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableSafeMode (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DisableSafeMode
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>DisableSafeMode</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableSafeMode": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DisableSafeMode` | 78.0 |  |

## DisableSecurityBypass

Prevent the user from bypassing security in certain cases.

`InvalidCertificate` prevents adding an exception when an invalid certificate is shown.

`SafeBrowsing` prevents selecting "ignore the risk" and visiting a harmful site anyway.

These policies only affect what happens when an error is shown, they do not affect any settings in preferences.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.certerror.hideAddException`, `browser.safebrowsing.allowOverride`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableSecurityBypass\InvalidCertificate (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\DisableSecurityBypass\SafeBrowsing (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/P_DisableSecurityBypass_InvalidCertificate
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/P_DisableSecurityBypass_SafeBrowsing
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>DisableSecurityBypass</key>
  <dict>
    <key>InvalidCertificate</key>
    <true/> | <false/>
    <key>SafeBrowsing</key>
    <true/> | <false/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableSecurityBypass": {
      "InvalidCertificate": true | false,
      "SafeBrowsing": true | false
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DisableSecurityBypass`<br>`DisableSecurityBypass_InvalidCertificate`<br>`DisableSecurityBypass_SafeBrowsing` | 68.0 |  |

## DisableSystemAddonUpdate

Prevent system add-ons from being installed or updated.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableSystemAddonUpdate (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DisableSystemAddonUpdate
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>DisableSystemAddonUpdate</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableSystemAddonUpdate": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DisableSystemAddonUpdate` | 77.0 |  |

## DisableTelemetry

Prevent the upload of telemetry data.

As of Thunderbird 83 and Thunderbird ESR 78.5, local storage of telemetry data is disabled as well.

Mozilla recommends that you do not disable telemetry. Information collected through telemetry helps us build a better product for businesses like yours.

**CCK2 Equivalent:** `disableTelemetry`\
**Preferences Affected:** `datareporting.healthreport.uploadEnabled`, `datareporting.policy.dataSubmissionEnabled`, `toolkit.telemetry.archive.enabled`, `datareporting.usage.uploadEnabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableTelemetry (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DisableTelemetry
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>DisableTelemetry</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DisableTelemetry": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DisableTelemetry` | 78.0 |  |

## DNSOverHTTPS

Configure DNS over HTTPS.

`Enabled` determines whether DNS over HTTPS is enabled

`ProviderURL` is a URL to another provider.

`Locked` prevents the user from changing DNS over HTTPS preferences.

`ExcludedDomains` excludes domains from DNS over HTTPS.

`Fallback` determines whether or not Thunderbird will use your default DNS resolver if there is a problem with the secure DNS provider.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.trr.mode`, `network.trr.uri`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DNSOverHTTPS\Enabled (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\DNSOverHTTPS\Locked (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\DNSOverHTTPS\Fallback (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\DNSOverHTTPS\ProviderURL (REG_SZ) = "URL_TO_ALTERNATE_PROVIDER"
Software\Policies\Mozilla\Thunderbird\DNSOverHTTPS\ExcludedDomains\1 (REG_SZ) = "example.com"
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~DNSOverHTTPS/DNSOverHTTPS_Enabled
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~DNSOverHTTPS/DNSOverHTTPS_Locked
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~DNSOverHTTPS/DNSOverHTTPS_Fallback
```
Value (string):
```
<enabled/> | <disabled/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~DNSOverHTTPS/DNSOverHTTPS_ProviderURL
```
Value (string):
```
<enabled/>
<data id="String" value="URL_TO_ALTERNATE_PROVIDER"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~DNSOverHTTPS/DNSOverHTTPS_ExcludedDomains
```
Value (string):
```
<enabled/>
<data id="List" value="1&#xF000;example.com"/>
```

#### macOS
```
<dict>
  <key>DNSOverHTTPS</key>
  <dict>
    <key>Enabled</key>
    <false/> | <true/>
    <key>ProviderURL</key>
    <string>URL_TO_ALTERNATE_PROVIDER</string>
    <key>Locked</key>
    <true/> | <false/>
    <key>ExcludedDomains</key>
    <array>
      <string>example.com</string>
    </array>
    <key>Fallback</key>
    <true/> | <false/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "DNSOverHTTPS": {
      "Enabled":  true | false,
      "ProviderURL": "URL_TO_ALTERNATE_PROVIDER",
      "Locked": true | false,
      "ExcludedDomains": ["example.com"],
      "Fallback": true | false,
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DNSOverHTTPS`<br>`DNSOverHTTPS_Enabled`<br>`DNSOverHTTPS_ProviderURL`<br>`DNSOverHTTPS_ExcludedDomains`<br>`DNSOverHTTPS_Locked` | 91.0 |  |
| *`DNSOverHTTPS_Fallback`* |  |  |

## DownloadDirectory

Set and lock the download directory.

You can use ${home} for the native home directory.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.download.dir`, `browser.download.folderList`, `browser.download.useDownloadDir`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DownloadDirectory (REG_SZ) = "${home}\Downloads"
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DownloadDirectory
```
Value (string):
```
<enabled/>
<data id="Preferences_String" value="${home}\Downloads"/>
```

#### macOS
```
<dict>
  <key>DownloadDirectory</key>
  <string>${home}/Downloads</string>
</dict>
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `DownloadDirectory` | 78.0 |  |

## Extensions

Control the installation, uninstallation and locking of extensions.

We strongly recommend that you use the **[`ExtensionSettings`](#extensionsettings)** policy. It has the same functionality and adds more. It does not support native paths, though, so you'll have to use file:/// URLs.

This method will be deprecated in the near future.

`Install` is a list of URLs or native paths for extensions to be installed.

`Uninstall` is a list of extension IDs that should be uninstalled if found.

`Locked` is a list of extension IDs that the user cannot disable or uninstall.

**CCK2 Equivalent:** `addons`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Extensions\Install\1 (REG_SZ) = "https://addons.thunderbird.net/thunderbird/downloads/somefile.xpi"
Software\Policies\Mozilla\Thunderbird\Extensions\Install\2 (REG_SZ) = "//path/to/xpi"
Software\Policies\Mozilla\Thunderbird\Extensions\Uninstall\1 (REG_SZ) = "bad_addon_id@mozilla.org"
Software\Policies\Mozilla\Thunderbird\Extensions\Locked\1 (REG_SZ) = "addon_id@mozilla.org"
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Extensions/Extensions_Install
```
Value (string):
```
<enabled/>
<data id="Extensions" value="1&#xF000;https://addons.thunderbird.net/thunderbird/downloads/somefile.xpi&#xF000;2&#xF000;//path/to/xpi"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Extensions/Extensions_Uninstall
```
Value (string):
```
<enabled/>
<data id="Extensions" value="1&#xF000;bad_addon_id@mozilla.org"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Extensions/Extensions_Locked
```
Value (string):
```
<enabled/>
<data id="Extensions" value="1&#xF000;addon_id@mozilla.org"/>
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
      "Locked":  ["addon_id@mozilla.org"]
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `Extensions`<br>`Extensions_Install`<br>`Extensions_Uninstall`<br>`Extensions_Locked` | 68.0 |  |

## ExtensionSettings

Manage all aspects of extensions. This policy is based heavily on the [Chrome policy](https://dev.chromium.org/administrators/policy-list-3/extension-settings-full) of the same name.

This policy maps an extension ID to its configuration. With an extension ID, the configuration will be applied to the specified extension only. A default configuration can be set for the special ID "*", which will apply to all extensions that don't have a custom configuration set in this policy.

To obtain an extension ID, install the extension and go to about:support. You will see the ID in the Extensions section.

The configuration for each extension is another dictionary that can contain the fields documented below.

| Name | Description |
| --- | --- |
| `installation_mode` | Maps to a string indicating the installation mode for the extension. The valid strings are `allowed`, `blocked`, `force_installed`, and `normal_installed`. |
|     `allowed` | Allows the extension to be installed by the user. This is the default behavior. |
|     `blocked` | Blocks installation of the extension and removes it if already installed. |
|     `force_installed` | Automatically installs the extension and prevents removal. Requires `install_url`. |
|     `normal_installed` | Automatically installs the extension but allows disabling. Requires `install_url`. |
| `install_url` | URL where Thunderbird can download the extension (e.g. from ATN or `file:///`). |
| `install_sources` | List of allowed extension installation sources. |
| `allowed_types` | Whitelist of extension types like `extension`, `theme`, etc. |
| `blocked_install_message` | Custom error message when a blocked extension is attempted. |
| `restricted_domains` | Domains on which extension content scripts can't run. |
| `updates_disabled` | Boolean to disable auto-updates for the extension. |

*As of Thunderbird 85, Thunderbird ESR 78.7, installing a theme makes it the default.*

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

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

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Extensions/ExtensionSettings
```
Value (string):
```
<enabled/>
<data id="ExtensionSettings" value='{
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
}'/>
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

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `ExtensionSettings`<br>`ExtensionSettings_[name]`<br>`ExtensionSettings_[name]_blocked_install_message` | 68.0 |  |
| `ExtensionSettings_*`<br>`ExtensionSettings_*_installation_mode`<br>`ExtensionSettings_*_allowed_types`<br>`ExtensionSettings_*_blocked_install_message`<br>`ExtensionSettings_*_install_sources`<br>`ExtensionSettings_*_restricted_domains`<br>`ExtensionSettings_[name]_installation_mode`<br>`ExtensionSettings_[name]_install_url` | 89.0 |  |
| `ExtensionSettings_[name]_updates_disabled` | 91.0 |  |
| `ExtensionSettings_[name]_private_browsing` | 128.8.0, 136.0 |  |
| *`ExtensionSettings_*_temporarily_allow_weak_signatures`<br>`ExtensionSettings_[name]_default_area`<br>`ExtensionSettings_[name]_temporarily_allow_weak_signatures`* |  |  |

## ExtensionUpdate

Control extension updates.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `extensions.update.enabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\ExtensionUpdate (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Extensions/ExtensionUpdate
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>ExtensionUpdate</key>
  <false/> | <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "ExtensionUpdate": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `ExtensionUpdate` | 68.0 |  |

## Handlers

Configure default application handlers. This policy is based on the internal format of `handlers.json`.

You can configure handlers based on a mime type (`mimeTypes`), a file's extension (`extensions`), or a protocol (`schemes`).

Within each handler type, you specify the given mimeType/extension/scheme as a key and use the following subkeys to describe how it is handled.

| Name | Description |
| --- | --- |
| `action`| Can be either `saveToDisk`, `useHelperApp`, `useSystemDefault`.
| `ask` | If `true`, the user is asked if what they want to do with the file. If `false`, the action is taken without user intervention.
| `handlers` | An array of handlers with the first one being the default. If you don't want to have a default handler, use an empty object for the first handler. Choose between path or uriTemplate.
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`name` | The display name of the handler (might not be used).
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`path`| The native path to the executable to be used.
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`uriTemplate`| A url to a web based application handler. The URL must be https and contain a %s to be used for substitution.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Handlers (REG_MULTI_SZ) = 
{
  "mimeTypes": {
    "application/msword": {
      "action": "useSystemDefault",
      "ask": true | false
    }
  },
  "schemes": {
    "mailto": {
      "action": "useHelperApp",
      "ask": true | false,
      "handlers": [{
        "name": "Gmail",
        "uriTemplate": "https://mail.google.com/mail/?extsrc=mailto&url=%s"
      }]
    }
  },
  "extensions": {
    "pdf": {
      "action": "useHelperApp",
      "ask": true | false,
      "handlers": [{
        "name": "Adobe Acrobat",
        "path": "C:\\Program Files (x86)\\Adobe\\Acrobat Reader DC\\Reader\\AcroRd32.exe"
      }]
    }
  }
}
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/Handlers
```
Value (string):
```
<enabled/>
<data id="Handlers" value='
{
  "mimeTypes": {
    "application/msword": {
      "action": "useSystemDefault",
      "ask": true | false
    }
  },
  "schemes": {
    "mailto": {
      "action": "useHelperApp",
      "ask": true | false,
      "handlers": [{
        "name": "Gmail",
        "uriTemplate": "https://mail.google.com/mail/?extsrc=mailto&amp;url=%s"
      }]
    }
  },
  "extensions": {
    "pdf": {
      "action": "useHelperApp",
      "ask": true | false,
      "handlers": [{
        "name": "Adobe Acrobat",
        "path": "C:\\Program Files (x86)\\Adobe\\Acrobat Reader DC\\Reader\\AcroRd32.exe"
      }]
    }
  }
}
'/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/HandlersOneLine
```
Value (string):
```
<enabled/>
<data id="JSONOneLine" value='{}'/>
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
        <true/> | <false/>
      </dict>
    </dict>
    <key>extensions</key>
    <dict>
      <key>pdf</key>
      <dict>
        <key>action</key>
        <string>useHelperApp</string>
        <key>ask</key>
        <true/> | <false/>
        <key>handlers</key>
        <array>
          <dict>
            <key>name</key>
            <string>Adobe Acrobat</string>
            <key>path</key>
            <string>/System/Applications/Preview.app</string>
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
          "ask": true | false,
          "handlers": [{
            "name": "Gmail",
            "uriTemplate": "https://mail.google.com/mail/?extsrc=mailto&url=%s"
          }]
        }
      },
      "extensions": {
        "pdf": {
          "action": "useHelperApp",
          "ask": true | false,
          "handlers": [{
            "name": "Adobe Acrobat",
            "path": "/usr/bin/acroread"
          }]
        }
      }
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `Handlers`<br>`Handlers_(mimeTypes\|extensions\|schemes)`<br>`Handlers_(mimeTypes\|extensions\|schemes)_[name]`<br>`Handlers_(mimeTypes\|extensions\|schemes)_[name]_action`<br>`Handlers_(mimeTypes\|extensions\|schemes)_[name]_ask`<br>`Handlers_(mimeTypes\|extensions\|schemes)_[name]_handlers` | 91.0 |  |

## HardwareAcceleration

Control hardware acceleration.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `layers.acceleration.disabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\HardwareAcceleration (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/HardwareAcceleration
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>HardwareAcceleration</key>
  <false/> | <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "HardwareAcceleration": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `HardwareAcceleration` | 78.0 |  |

## InAppNotification

Configure TOAST, browser, and tab notifications within the context of the application.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `mail.inappnotifications.donation_enabled`, `mail.inappnotifications.blog_enabled`, `mail.inappnotifications.message_enabled`, `mail.inappnotifications.enabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\InAppNotification_Enabled (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\InAppNotification_DonationEnabled (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\InAppNotification_SurveyEnabled (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\InAppNotification_MessageEnabled (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/InAppNotification_Enabled
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/InAppNotification_DonationEnabled
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/InAppNotification_SurveyEnabled
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/InAppNotification_MessageEnabled
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>InAppNotification_Enabled</key>
  <true/> | <false/>
  <key>InAppNotification_DonationEnabled</key>
  <true/> | <false/>
  <key>InAppNotification_SurveyEnabled</key>
  <true/> | <false/>
  <key>InAppNotification_MessageEnabled</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "InAppNotification_Enabled": true | false,
    "InAppNotification_DonationEnabled": true | false,
    "InAppNotification_SurveyEnabled": true | false,
    "InAppNotification_MessageEnabled": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `InAppNotification`<br>`InAppNotification_DonationEnabled`<br>`InAppNotification_SurveyEnabled`<br>`InAppNotification_MessageEnabled`<br>`InAppNotification_Disabled` | 139.0 |  |

## InstallAddonsPermission

Configure the default extension install policy as well as origins for extension installs are allowed. This policy does not override turning off all extension installs.

`Allow` is a list of origins where extension installs are allowed.

`Default` determines whether or not extension installs are allowed by default.

**CCK2 Equivalent:** `permissions.install`\
**Preferences Affected:** `xpinstall.enabled`, `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons`, `browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\InstallAddonsPermission\Allow\1 (REG_SZ) = "https://example.org"
Software\Policies\Mozilla\Thunderbird\InstallAddonsPermission\Allow\2 (REG_SZ) = "https://example.edu"
Software\Policies\Mozilla\Thunderbird\InstallAddonsPermission\Default (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Addons/InstallAddonsPermission_Allow
```
Value (string):
```
<enabled/>
<data id="Permissions" value="1&#xF000;https://example.org&#xF000;2&#xF000;https://example.edu"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Addons/InstallAddonsPermission_Default
```
Value (string):
```
<enabled/>
```

#### macOS
```
<dict>
  <key>InstallAddonsPermission</key>
  <dict>
    <key>Allow</key>
    <array>
      <string>http://example.org</string>
      <string>http://example.edu</string>
    </array>
    <key>Default</key>
    <false/> | <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "InstallAddonsPermission": {
      "Allow": ["http://example.org/",
                "http://example.edu/"],
      "Default": true | false
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `InstallAddonsPermission`<br>`InstallAddonsPermission_Allow`<br>`InstallAddonsPermission_Default` | 68.0 |  |

## ManualAppUpdateOnly

Switch to manual updates only.

If this policy is enabled:
 1. The user will never be prompted to install updates
 2. Thunderbird will not check for updates in the background, though it will check automatically when an update UI is displayed (such as the one in the About dialog). This check will be used to show "Update to version X" in the UI, but will not automatically download the update or prompt the user to update in any other way.
 3. The update UI will work as expected, unlike when using DisableAppUpdate.

This policy is primarily intended for advanced end users, not for enterprises, but it is available via GPO.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\ManualAppUpdateOnly (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/ManualAppUpdateOnly
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>ManualAppUpdateOnly</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "ManualAppUpdateOnly": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `ManualAppUpdateOnly` | 91.0 |  |

## NetworkPrediction

Enable or disable network prediction (DNS prefetching).

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `network.dns.disablePrefetch`, `network.dns.disablePrefetchFromHTTPS`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\NetworkPrediction (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/NetworkPrediction
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>NetworkPrediction</key>
  <false/> | <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "NetworkPrediction": true | false
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `NetworkPrediction` | 91.0 |  |

## OfferToSaveLogins

Control whether or not Thunderbird offers to save passwords.

**CCK2 Equivalent:** `dontRememberPasswords`\
**Preferences Affected:** `signon.rememberSignons`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\OfferToSaveLogins (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/OfferToSaveLogins
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>OfferToSaveLogins</key>
  <false/> | <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "OfferToSaveLogins": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `OfferToSaveLogins` | 91.0 |  |

## OfferToSaveLoginsDefault

Sets the default value of signon.rememberSignons without locking it.

**CCK2 Equivalent:** `dontRememberPasswords`\
**Preferences Affected:** `signon.rememberSignons`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\OfferToSaveLoginsDefault (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/OfferToSaveLoginsDefault
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>OfferToSaveLoginsDefault</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "OfferToSaveLoginsDefault": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `OfferToSaveLoginsDefault` | 91.0 |  |

## PasswordManagerEnabled

Remove access to the password manager via preferences and blocks about:logins on Thunderbird 70.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `pref.privacy.disable_button.view_passwords`, `signon.rememberSignons`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\PasswordManagerEnabled (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/PasswordManagerEnabled
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>PasswordManagerEnabled</key>
  <false/> | <true/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PasswordManagerEnabled": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `PasswordManagerEnabled` | 78.0 |  |

## PDFjs

Disable or configure PDF.js, the built-in PDF viewer.

If `Enabled` is set to false, the built-in PDF viewer is disabled.

If `EnablePermissions` is set to true, the built-in PDF viewer will honor document permissions like preventing the copying of text.

Note: DisableBuiltinPDFViewer has not been deprecated. You can either continue to use it, or switch to using PDFjs->Enabled to disable the built-in PDF viewer. This new permission was added because we needed a place for PDFjs->EnabledPermissions.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `pdfjs.disabled`, `pdfjs.enablePermissions`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\PDFjs\Enabled (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\PDFjs\EnablePermissions (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~PDFjs/PDFjs_Enabled
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~PDFjs/PDFjs_EnablePermissions
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>PDFjs</key>
  <dict>
    <key>Enabled</key>
    <false/> | <true/>
    <key>EnablePermissions</key>
    <false/> | <true/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PDFjs": {
      "Enabled": true | false,
      "EnablePermissions": true | false
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `PDFjs`<br>`PDFjs_Enabled`<br>`PDFjs_EnablePermissions` | 91.0 |  |

## Preferences

Set and lock preferences.

**NOTE:** On Windows, in order to use this policy, you must clear all settings in the old **`Preferences (Deprecated)`** section for Thunderbird 78 and older.

Previously you could only set and lock a subset of preferences. Starting with Thunderbird 91 you can set many more preferences. You can also set default preferences, user preferences and you can clear preferences.

Preferences that start with the following prefixes are supported:
```
accessibility.
app.update.
browser.
calendar.
chat.
datareporting.policy.
dom.
extensions.
general.autoScroll
general.smoothScroll
geo.
gfx.
intl.
layers.
layout.
mail.
mailnews.
media.
network.
pdfjs.
places.
print.
signon.
spellchecker.
ui.
widget.
```
as well as the following security preferences:

| Preference | Type | Default |
| --- | --- | --- |
| security.default_personal_cert | string | Ask Every Time |
|     If set to Select Automatically, Thunderbird automatically chooses the default personal certificate. |
| security.insecure_connection_text.enabled | boolean | false |
|     If set to true, adds the words "Not Secure" for insecure sites. |
| security.insecure_connection_text.pbmode.enabled | boolean | false |
|     If set to true, adds the words "Not Secure" for insecure sites in private browsing. |
| security.insecure_field_warning.contextual.enabled | boolean | true |
|     If set to false, remove the warning for inscure login fields. |
| security.mixed_content.block_active_content | boolean | true |
|     If false, mixed active content (HTTP and HTTPS) is not blocked. |
| security.osclientcerts.autoload | boolean | false |
|     If true, client certificates are loaded from the operating system certificate store. |
| security.ssl.errorReporting.enabled | boolean | true |
|     If false, SSL errors cannot be sent to Mozilla. |
| security.tls.hello_downgrade_check | boolean | true |
|     If false, the TLS 1.3 downgrade check is disabled. |
| security.tls.version.enable-deprecated | boolean | false |
|     If true, browser will accept TLS 1.0. and TLS 1.1 |
| security.warn_submit_secure_to_insecure | boolean | true |
|     If false, no warning is shown when submitting s form from https to http. |

Using the preference as the key, set the `Value` to the corresponding preference value.

`Status` can be "default", "locked", "user" or "clear"

Default preferences can be modified by the user.

If a value is locked, it is also set as the default.

User preferences persist across invocations of Thunderbird. It is the equivalent of a user setting the preference. They are most useful when a preference is needed very early in startup so it can't be set as default by policy.

User preferences persist even if the policy is removed, so if you need to remove them, you should use the clear policy.

See the examples below for more detail.

IMPORTANT: Make sure you're only setting a particular preference using this mechanism and not some other way.

**CCK2 Equivalent:** `preferences`\
**Preferences Affected:** Many

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

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/Preferences
```
Value (string):
```
<enabled/>
<data id="JSON" value='
{
  "accessibility.force_disabled": {
    "Value": 1,
    "Status": "default"
  },
  "browser.cache.disk.parent_directory": {
    "Value": "SOME_NATIVE_PATH",
    "Status": "user"
  }
}'/>
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

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `Preferences` | 68.0 |  |
| `Preferences_[name]`<br>`Preferences_[name]_Value`<br>`Preferences_[name]_Status` | 91.0 |  |
| `Preferences_accessibility.force_disabled`<br>`Preferences_browser.cache.disk.enable`<br>`Preferences_browser.safebrowsing.phishing.enabled`<br>`Preferences_browser.safebrowsing.malware.enabled`<br>`Preferences_browser.search.update`<br>`Preferences_datareporting.policy.dataSubmissionPolicyBypassNotification`<br>`Preferences_dom.allow_scripts_to_close_windows`<br>`Preferences_dom.disable_window_flip`<br>`Preferences_dom.disable_window_move_resize`<br>`Preferences_dom.event.contextmenu.enabled`<br>`Preferences_dom.keyboardevent.keypress.hack.dispatch_non_printable_keys.addl`<br>`Preferences_dom.keyboardevent.keypress.hack.use_legacy_keycode_and_charcode.addl`<br>`Preferences_extensions.blocklist.enabled`<br>`Preferences_geo.enabled`<br>`Preferences_intl.accept_languages`<br>`Preferences_network.dns.disableIPv6`<br>`Preferences_places.history.enabled`<br>`Preferences_print.save_print_settings`<br>`Preferences_security.default_personal_cert`<br>`Preferences_security.mixed_content.block_active_content`<br>`Preferences_security.osclientcerts.autoload`<br>`Preferences_security.ssl.errorReporting.enabled`<br>`Preferences_security.tls.hello_downgrade_check`<br>`Preferences_widget.content.gtk-theme-override` | 78.0 | 89.0 |
| `Preferences_browser.cache.disk.parent_directory`<br>`Preferences_network.IDN_show_punycode` | 68.0 | 89.0 |
| `Preferences_browser.fixup.dns_first_for_single_words`<br>`Preferences_browser.urlbar.suggest.openpage`<br>`Preferences_browser.urlbar.suggest.history`<br>`Preferences_browser.urlbar.suggest.bookmark` | 68.0 | 77.0 |
| *`Preferences_[name]_Type`* |  |  |

## PrimaryPassword

Require or prevent using a primary (formerly master) password.

If this value is true, a primary password is required. If this value is false, it works the same as if [`DisableMasterPasswordCreation`](#disablemasterpasswordcreation) was true and removes the primary password functionality.

If both DisableMasterPasswordCreation and PrimaryPassword are used, DisableMasterPasswordCreation takes precedent.

**CCK2 Equivalent:** `noMasterPassword`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\PrimaryPassword (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/PrimaryPassword
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>PrimaryPassword</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PrimaryPassword": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `PrimaryPassword` | 91.0 |  |

## PromptForDownloadLocation

Ask where to save each file before downloading.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `browser.download.useDownloadDir`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\PromptForDownloadLocation (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/PromptForDownloadLocation
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>PromptForDownloadLocation</key>
  <true/> | <false/>
</dict>
```

#### policies.json
```
{
  "policies": {
    "PromptForDownloadLocation": true | false
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `PromptForDownloadLocation` | 78.0 |  |

## Proxy

Configure proxy settings. These settings correspond to the connection settings in Thunderbird preferences.
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

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Proxy\Mode (REG_SZ) = "none" | "system" | "manual" | "autoDetect" | "autoConfig"
Software\Policies\Mozilla\Thunderbird\Proxy\Locked (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Proxy\UseHTTPProxyForAllProtocols (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Proxy\AutoLogin (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Proxy\UseProxyForDNS (REG_DWORD) = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Proxy\HTTPProxy (REG_SZ) = https://httpproxy.example.com
Software\Policies\Mozilla\Thunderbird\Proxy\SSLProxy (REG_SZ) = https://sslproxy.example.com
Software\Policies\Mozilla\Thunderbird\Proxy\FTPProxy (REG_SZ) = https://ftpproxy.example.com
Software\Policies\Mozilla\Thunderbird\Proxy\SOCKSProxy (REG_SZ) = https://socksproxy.example.com
Software\Policies\Mozilla\Thunderbird\Proxy\SOCKSVersion (REG_DWORD) = 0x4 | 0x5
Software\Policies\Mozilla\Thunderbird\Proxy\Passthrough (REG_SZ) = <local>
Software\Policies\Mozilla\Thunderbird\Proxy\AutoConfigURL (REG_SZ) = URL_TO_AUTOCONFIG
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~ProxySettings/Proxy_Locked
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~ProxySettings/Proxy_UseHTTPProxyForAllProtocols
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~ProxySettings/Proxy_AutoLogin
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~ProxySettings/Proxy_UseProxyForDNS
```
Value (string):
```
<enabled/> | <disabled/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~ProxySettings/Proxy_ConnectionType
```
Value (string):
```
<enabled/>
<data id="Proxy_ConnectionType" value="none | system | manual | autoDetect | autoConfig"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~ProxySettings/Proxy_HTTPProxy
```
Value (string):
```
<enabled/>
<data id="Proxy_HTTPProxy" value="httpproxy.example.com"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~ProxySettings/Proxy_SSLProxy
```
Value (string):
```
<enabled/>
<data id="Proxy_SSLProxy" value="sslproxy.example.com"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~ProxySettings/Proxy_SOCKSProxy
```
Value (string):
```
<enabled/>
<data id="Proxy_SOCKSProxy" value="socksproxy.example.com"/>
<data id="Proxy_SOCKSVersion" value="4 | 5"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~ProxySettings/Proxy_AutoConfigURL
```
Value (string):
```
<enabled/>
<data id="Proxy_AutoConfigURL" value="URL_TO_AUTOCONFIG"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~ProxySettings/Proxy_Passthrough
```
Value (string):
```
<enabled/>
<data id="Proxy_Passthrough" value="&lt;local&gt;"/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/Proxy
```
Value (string):
```
<enabled/>
<data id="ProxyLocked" value="true | false"/>
<data id="ConnectionType" value="none | system | manual | autoDetect | autoConfig"/>
<data id="HTTPProxy" value="httpproxy.example.com"/>
<data id="UseHTTPProxyForAllProtocols" value="true | false"/>
<data id="SSLProxy" value="sslproxy.example.com"/>
<data id="FTPProxy" value="ftpproxy.example.com"/>
<data id="SOCKSProxy" value="socksproxy.example.com"/>
<data id="SOCKSVersion" value="4 | 5"/>
<data id="AutoConfigURL" value="URL_TO_AUTOCONFIG"/>
<data id="Passthrough" value="<local>"/>
<data id="AutoLogin" value="true | false"/>
<data id="UseProxyForDNS" value="true | false"/>
```

#### macOS
```
<dict>
  <key>Proxy</key>
  <dict>
    <key>Mode</key>
    <string>none | system | manual | autoDetect | autoConfig</string>
    <key>Locked</key>
    <true/> | <false/>
    <key>HTTPProxy</key>
    <string>httpproxy.example.com</string>
    <key>UseHTTPProxyForAllProtocols</key>
    <true/> | <false/>
    <key>SSLProxy</key>
    <string>sslproxy.example.com</string>
    <key>FTPProxy</key>
    <string>ftpproxy.example.com</string>
    <key>SOCKSProxy</key>
    <string>socksproxy.example.com</string>
    <key>SOCKSVersion</key>
    <string>4 | 5</string>
    <key>Passthrough</key>
    <string>&lt;local&gt;</string>
    <key>AutoConfigURL</key>
    <string>URL_TO_AUTOCONFIG</string>
    <key>AutoLogin</key>
    <true/> | <false/>
    <key>UseProxyForDNS</key>
    <true/> | <false/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "Proxy": {
      "Mode": "none" | "system" | "manual" | "autoDetect" | "autoConfig",
      "Locked": true | false,
      "HTTPProxy": "hostname",
      "UseHTTPProxyForAllProtocols": true | false,
      "SSLProxy": "hostname",
      "FTPProxy": "hostname",
      "SOCKSProxy": "hostname",
      "SOCKSVersion": 4 | 5,
      "Passthrough": "<local>",
      "AutoConfigURL": "URL_TO_AUTOCONFIG",
      "AutoLogin": true | false,
      "UseProxyForDNS": true | false
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `Proxy`<br>`Proxy_Mode`<br>`Proxy_Locked`<br>`Proxy_AutoConfigURL`<br>`Proxy_FTPProxy`<br>`Proxy_HTTPProxy`<br>`Proxy_SSLProxy`<br>`Proxy_SOCKSProxy`<br>`Proxy_SOCKSVersion`<br>`Proxy_UseHTTPProxyForAllProtocols`<br>`Proxy_Passthrough`<br>`Proxy_UseProxyForDNS`<br>`Proxy_AutoLogin` | 68.0 |  |

## RequestedLocales

Set the the list of requested locales for the application in order of preference. It will cause the corresponding language pack to become active.

Note: For Thunderbird 68, this can now be a string so that you can specify an empty value.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\RequestedLocales\1 (REG_SZ) = "de"
Software\Policies\Mozilla\Thunderbird\RequestedLocales\2 (REG_SZ) = "en-US"
Software\Policies\Mozilla\Thunderbird\RequestedLocales (REG_SZ) = "de,en-US"
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/RequestedLocalesString
```
Value (string):
```
<enabled/>
<data id="Preferences_String" value="de,en-US"/>
```

#### macOS
```
<dict>
  <key>RequestedLocales</key>
  <array>
    <string>de</string>
    <string>en-US</string>
  </array>
  <key>RequestedLocales</key>
  <string>de,en-US</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "RequestedLocales": ["de", "en-US"]
    "RequestedLocales": "de,en-US"
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `RequestedLocales` | 68.0 |  |

## SearchEngines

As of Thunderbird 139, this policy is available in all versions of Thunderbird.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `SearchEngines`<br>`SearchEngines_Add`<br>`SearchEngines_Default`<br>`SearchEngines_DefaultPrivate`<br>`SearchEngines_PreventInstalls`<br>`SearchEngines_Remove` | 108.0 |  |

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

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Name (REG_SZ) = "Example1"
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Method (REG_SZ) = "GET" | "POST"
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\IconURL (REG_SZ) = "https://www.example.org/favicon.ico"
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Alias (REG_SZ) = "example"
Software\Policies\Mozilla\Thunderbird\SearchEngines\Add\1\Description (REG_SZ) = "Example Description"
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Search/SearchEngines_1
```
Value (string):
```
<enabled/>
<data id="SearchEngine_Name" value="Example1"/>
<data id="SearchEngine_URLTemplate" value="https://www.example.org/q={searchTerms"/>
<data id="SearchEngine_Method" value="GET | POST"/>
<data id="SearchEngine_IconURL" value="https://www.example.org/favicon.ico"/>
<data id="SearchEngine_Alias" value="example"/>
<data id="SearchEngine_Description" value="Example Description"/>
<data id="SearchEngine_SuggestURLTemplate" value="https://www.example.org/suggestions/q={searchTerms}"/>
<data id="SearchEngine_PostData" value="name=value&amp;q={searchTerms}"/>
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
        <string>GET | POST </string>
        <key>IconURL</key>
        <string>https://www.example.org/favicon.ico</string>
        <key>Alias</key>
        <string>example</string>
        <key>Description</key>
        <string>Example Description</string>
        <key>SuggestURLTemplate</key>
        <string>https://www.example.org/suggestions/q={searchTerms}</string>
        <key>PostData</key>
        <string>name=value&q={searchTerms}</string>
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
          "Method": "GET" | "POST",
          "IconURL": "https://www.example.org/favicon.ico",
          "Alias": "example",
          "Description": "Description",
          "PostData": "name=value&q={searchTerms}",
          "SuggestURLTemplate": "https://www.example.org/suggestions/q={searchTerms}"
        }
      ]
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `SearchEngines_Add` | 108.0 |  |

## SearchEngines | Default

Set the default search engine.

**CCK2 Equivalent:** `defaultSearchEngine`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SearchEngines\Default (REG_SZ) = NAME_OF_SEARCH_ENGINE
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Search/SearchEngines_Default
```
Value (string):
```
<enabled/>
<data id="SearchEngines_Default" value="NAME_OF_SEARCH_ENGINE"/>
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

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `SearchEngines_Default` | 108.0 |  |

## SearchEngines | PreventInstalls

Prevent installing search engines from webpages.

**CCK2 Equivalent:** `disableSearchEngineInstall`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SearchEngines\PreventInstalls (REG_DWORD) = 0x1 | 0x0
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Search/SearchEngines_PreventInstalls
```
Value (string):
```
<enabled/> | <disabled/>
```

#### macOS
```
<dict>
  <key>SearchEngines</key>
  <dict>
    <key>PreventInstalls</key>
    <true/> | <false/>
  </dict>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SearchEngines": {
      "PreventInstalls": true | false
    }
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `SearchEngines_PreventInstalls` | 108.0 |  |

## SearchEngines | Remove

Hide built-in search engines.

**CCK2 Equivalent:** `removeDefaultSearchEngines (removed all built-in engines)`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SearchEngines\Remove\1 (REG_SZ) = NAME_OF_SEARCH_ENGINE
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Search/SearchEngines_Remove
```
Value (string):
```
<enabled/>
<data id="SearchEngines_Remove" value="1&#xF000;NAME_OF_SEARCH_ENGINE"/>
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

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `SearchEngines_Remove` | 108.0 |  |

## SSLVersionMax

Set and lock the maximum version of TLS. (Thunderbird defaults to a maximum of TLS 1.3.)

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.tls.version.max`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SSLVersionMax (REG_SZ) = "tls1.3" | "tls1.2" | "tls1.1" | "tls1"
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/SSLVersionMax
```
Value (string):
```
<enabled/>
<data id="SSLVersion" value="tls1.3 | tls1.2 | tls1.1 | tls1"/>
```

#### macOS
```
<dict>
  <key>SSLVersionMax</key>
  <string>tls1.3 | tls1.2 | tls1.1 | tls1</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SSLVersionMax": "tls1.3" | "tls1.2" | "tls1.1" | "tls1"
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `SSLVersionMax` | 68.0 |  |

## SSLVersionMin

Set and lock the minimum version of TLS. (Thunderbird defaults to a minimum of TLS 1.2.)

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.tls.version.min`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SSLVersionMin (REG_SZ) = "tls1.2" | "tls1.3" | "tls1.1" | "tls1"
```

#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/SSLVersionMin
```
Value (string):
```
<enabled/>
<data id="SSLVersion" value="tls1.2 | tls1.3 | tls1.1 | tls1"/>
```

#### macOS
```
<dict>
  <key>SSLVersionMin</key>
  <string>tls1.2 | tls1.3 | tls1.1 | tls1</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SSLVersionMin": "tls1.2 | tls1.3 | tls1.1 | tls1"
  }
}
```

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `SSLVersionMin` | 68.0 |  |


