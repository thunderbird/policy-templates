## Enterprise policy descriptions and templates for Thunderbird 68

Policies can be specified using the [Group Policy templates on Windows](windows), [Intune on Windows](https://support.mozilla.org/kb/managing-firefox-intune), [configuration profiles on macOS](mac), or by creating a file called `policies.json`.

On Windows, create a directory called `distribution` where the EXE is located and place the file there. On Mac, the file goes into `Thunderbird.app/Contents/Resources/distribution`.  On Linux, the file goes into `thunderbird/distribution`, where `thunderbird` is the installation directory for Thunderbird, which varies by distribution.

<br>

| Policy Name | Description
|:--- |:--- |
| **[`AppUpdateURL`](#appupdateurl)** | Change the URL for application update.
| **[`BlockAboutAddons`](#blockaboutaddons)** | Block access to the Add-ons Manager (about:addons).
| **[`BlockAboutConfig`](#blockaboutconfig)** | Block access to about:config.
| **[`BlockAboutProfiles`](#blockaboutprofiles)** | Block access to About Profiles (about:profiles).
| **[`BlockAboutSupport`](#blockaboutsupport)** | Block access to Troubleshooting Information (about:support).
| **[`Certificates -> ImportEnterpriseRoots`](#certificates--importenterpriseroots)** | Trust certificates that have been added to the operating system certificate store by a user or administrator.
| **[`Certificates -> Install`](#certificates--install)** | Install certificates into the Thunderbird certificate store.
| **[`DisableAppUpdate`](#disableappupdate)** | Turn off application updates.
| **[`DisableDeveloperTools`](#disabledevelopertools)** | Remove access to all developer tools.
| **[`DisableMasterPasswordCreation`](#disablemasterpasswordcreation)** | Remove the master password functionality.
| **[`DisableSecurityBypass`](#disablesecuritybypass)** | Prevent the user from bypassing security in certain cases.
| **[`Extensions`](#extensions)** | Control the installation, uninstallation and locking of extensions.
| **[`ExtensionSettings`](#extensionsettings)** | Manage all aspects of extensions.
| **[`ExtensionUpdate`](#extensionupdate)** | Control extension updates.
| **[`InstallAddonsPermission`](#installaddonspermission)** | Configure the default extension install policy as well as origins for extension installs are allowed.
| **[`Preferences`](#preferences)** | Set and lock some preferences.
| **[`Proxy`](#proxy)** | Configure proxy settings.
| **[`RequestedLocales`](#requestedlocales)** | Set the the list of requested locales for the application in order of preference.
| **[`SSLVersionMax`](#sslversionmax)** | Set and lock the maximum version of TLS.
| **[`SSLVersionMin`](#sslversionmin)** | Set and lock the minimum version of TLS.

<br>

## AppUpdateURL

Change the URL for application update.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `app.update.url`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\AppUpdateURL = "https://yoursite.com"
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

<br>

## BlockAboutAddons

Block access to the Add-ons Manager (about:addons).

**CCK2 Equivalent:** `disableAddonsManager`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutAddons = 0x1 | 0x0
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/BlockAboutAddons
```
Value (string):
```
<enabled/> or <disabled/>
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

<br>

## BlockAboutConfig

Block access to about:config.

**CCK2 Equivalent:** `disableAboutConfig`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutConfig = 0x1 | 0x0
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/BlockAboutConfig
```
Value (string):
```
<enabled/> or <disabled/>
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

<br>

## BlockAboutProfiles

Block access to About Profiles (about:profiles).

**CCK2 Equivalent:** `disableAboutProfiles`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutProfiles = 0x1 | 0x0
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/BlockAboutProfiles
```
Value (string):
```
<enabled/> or <disabled/>
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

<br>

## BlockAboutSupport

Block access to Troubleshooting Information (about:support).

**CCK2 Equivalent:** `disableAboutSupport`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\BlockAboutSupport = 0x1 | 0x0
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/BlockAboutSupport
```
Value (string):
```
<enabled/> or <disabled/>
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

<br>

## Certificates | ImportEnterpriseRoots

Trust certificates that have been added to the operating system certificate store by a user or administrator.

See https://support.mozilla.org/kb/setting-certificate-authorities-firefox for more detail.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.enterprise_roots.enabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Certificates\ImportEnterpriseRoots = 0x1 | 0x0
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Certificates/Certificates_ImportEnterpriseRoots
```
Value (string):
```
<enabled/> or <disabled/>
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

<br>

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
Software\Policies\Mozilla\Thunderbird\Certificates\Install\1 = "cert1.der"
Software\Policies\Mozilla\Thunderbird\Certificates\Install\2 = "C:\Users\username\cert2.pem"
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

<br>

## DisableAppUpdate
Turn off application updates.

**CCK2 Equivalent:** `disableFirefoxUpdates`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableAppUpdate = 0x1 | 0x0
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DisableAppUpdate
```
Value (string):
```
<enabled/> or <disabled/>
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

<br>

## DisableDeveloperTools
Remove access to all developer tools.

**CCK2 Equivalent:** `removeDeveloperTools`\
**Preferences Affected:** `devtools.policy.disabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableDeveloperTools = 0x1 | 0x0`
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DisableDeveloperTools
```
Value (string):
```
<enabled/> or <disabled/>
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

<br>

## DisableMasterPasswordCreation
Remove the master password functionality.

**CCK2 Equivalent:** `noMasterPassword`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableMasterPasswordCreation = 0x1 | 0x0
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/DisableMasterPasswordCreation
```
Value (string):
```
<enabled/> or <disabled/>
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

<br>

## DisableSecurityBypass
Prevent the user from bypassing security in certain cases.

`InvalidCertificate` prevents adding an exception when an invalid certificate is shown.

`SafeBrowsing` prevents selecting "ignore the risk" and visiting a harmful site anyway.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.certerror.hideAddException`,`browser.safebrowsing.allowOverride`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\DisableSecurityBypass\InvalidCertificate = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\DisableSecurityBypass\SafeBrowsing = 0x1 | 0x0
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/P_DisableSecurityBypass_InvalidCertificate
```
Value (string):
```
<enabled/> or <disabled/>
```
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/P_DisableSecurityBypass_SafeBrowsing
```
Value (string):
```
<enabled/> or <disabled/>
```

#### macOS
```
<dict>
  <key>DisableSecurityBypass</key>
  <dict>
    <key>InvalidCertificate</key>
    <true/> | <false/>
    <key><SafeBrowsing/key>
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

<br>

## Extensions
Control the installation, uninstallation and locking of extensions.

`Install` is a list of URLs or native paths for extensions to be installed. 

`Uninstall` is a list of extension IDs that should be uninstalled if found.

`Locked` is a list of extension IDs that the user cannot disable or uninstall.

**CCK2 Equivalent:** `addons`\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Extensions\Install\1 = "https://addons.thunderbird.net/thunderbird/downloads/somefile.xpi"
Software\Policies\Mozilla\Thunderbird\Extensions\Install\2 = "//path/to/xpi"
Software\Policies\Mozilla\Thunderbird\Extensions\Uninstall\1 = "bad_addon_id@mozilla.org"
Software\Policies\Mozilla\Thunderbird\Extensions\Locked\1 = "addon_id@mozilla.org"
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

<br>

## ExtensionSettings
This policy is hardly implemented in Thunderbird 68. Only the blocked install message for a given extension can be set.

| Name | Description |
| --- | --- |
| `blocked_install_message` | This maps to a string specifying the error message to display to users if they're blocked from installing an extension. This setting allows you to append text to the generic error message displayed when the extension is blocked. This could be be used to direct users to your help desk, explain why a particular extension is blocked, or something else.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\ExtensionSettings (REG_MULTI_SZ) =
{
  "uBlock0@raymondhill.net": {
    "blocked_install_message": "Custom error message.",
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
<data id="ExtensionSettings" value='
    "uBlock0@raymondhill.net": {
      "blocked_install_message": "Custom error message.",
    }'/>
```
#### macOS
```
<dict>
  <key>ExtensionSettings</key>
  <dict>
    <key>uBlock0@raymondhill.net</key>
    <dict>
      <key>blocked_install_message</key>
      <string>Custom error message.</string>
    </dict>
  </dict>
</dict>
```
#### policies.json
```
{
  "policies": {
    "ExtensionSettings": {
      "uBlock0@raymondhill.net": {
        "blocked_install_message": "Custom error message.",
      }
    }
  }
}
```
#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `ExtensionSettings`<br>`ExtensionSettings_[name]`<br>`ExtensionSettings_[name]_blocked_install_message` | 68.0 |  |

<br>

## ExtensionUpdate
Control extension updates.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `extensions.update.enabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\ExtensionUpdate = 0x1 | 0x0
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/ExtensionUpdate
```
Value (string):
```
<enabled/> or <disabled/>
```
#### macOS
```
<dict>
  <key>ExtensionUpdate</key>
  <true/> | <false/>
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

<br>

## InstallAddonsPermission
Configure the default extension install policy as well as origins for extension installs are allowed. This policy does not override turning off all extension installs.

`Allow` is a list of origins where extension installs are allowed.

`Default` determines whether or not extension installs are allowed by default.

**CCK2 Equivalent:** `permissions.install`\
**Preferences Affected:** `xpinstall.enabled`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\InstallAddonsPermission\Allow\1 = "https://example.org"
Software\Policies\Mozilla\Thunderbird\InstallAddonsPermission\Allow\2 = "https://example.edu"
Software\Policies\Mozilla\Thunderbird\InstallAddonsPermission\Default = 0x1 | 0x0
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
    <true/> | <false/>
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

<br>

## Preferences
Set and lock certain preferences.

**CCK2 Equivalent:** `preferences`\
**Preferences Affected:** See below

| Preference | Type | Default
| --- | --- | ---
| ~browser.cache.disk.parent_directory~ | string | Profile temporary directory
| &nbsp;&nbsp;&nbsp;&nbsp;~If set, changes the location of the disk cache.~ This policy doesn't work. It's being worked on.
| browser.fixup.dns_first_for_single_words | boolean | false
| &nbsp;&nbsp;&nbsp;&nbsp;If true, single words are sent to DNS, not directly to search.
| browser.urlbar.suggest.bookmark | boolean | true
| &nbsp;&nbsp;&nbsp;&nbsp;If false, bookmarks aren't suggested when typing in the URL bar.
| browser.urlbar.suggest.history | boolean | true
| &nbsp;&nbsp;&nbsp;&nbsp;If false, history isn't suggested when typing in the URL bar.
| browser.urlbar.suggest.openpage | boolean | true
| &nbsp;&nbsp;&nbsp;&nbsp;If false, open tabs aren't suggested when typing in the URL bar.
| network.IDN_show_punycode | boolean | false
| &nbsp;&nbsp;&nbsp;&nbsp;If true, display the punycode version of internationalized domain names. 
#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Preferences\boolean_preference_name = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Preferences\string_preference_name = "string_value"
```
#### Windows (Intune)
OMA-URI: (periods are replaced by underscores)
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird~Preferences/boolean_preference_name
```
Value (string):
```
<enabled/> or <disabled/>
```
#### macOS
```
<dict>
  <key>Preferences</key>
  <dict>
    <key>boolean_preference_name</key>
    <true/> | <false/>
    <key>string_preference_name</key>
    <string>string_value</string>
  </dict>
</dict>
```
#### policies.json
```
{
  "policies": {
    "Preferences": {
      "boolean_preference_name": true | false,
      "string_preference_name": "string_value"
    }
  }
}
```
#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `Preferences`<br>`Preferences_network.IDN_show_punycode`<br>`Preferences_browser.fixup.dns_first_for_single_words`<br>`Preferences_browser.cache.disk.parent_directory`<br>`Preferences_browser.urlbar.suggest.openpage`<br>`Preferences_browser.urlbar.suggest.history`<br>`Preferences_browser.urlbar.suggest.bookmark` | 68.0 |  |

<br>

## Proxy
Configure proxy settings. These settings correspond to the connection settings in Thunderbird preferences.
To specify ports, append them to the hostnames with a colon (:).

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
**Preferences Affected:** `network.proxy.type`,`network.proxy.autoconfig_url`,`network.proxy.socks_remote_dns`,`signon.autologin.proxy`,`network.proxy.socks_version`,`network.proxy.no_proxies_on`,`network.proxy.share_proxy_settings`,`network.proxy.http`,`network.proxy.http_port`,`network.proxy.ftp`,`network.proxy.ftp_port`,`network.proxy.ssl`,`network.proxy.ssl_port`,`network.proxy.socks`,`network.proxy.socks_port`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\Proxy\Mode = "none", "system", "manual", "autoDetect", "autoConfig"
Software\Policies\Mozilla\Thunderbird\Proxy\Locked = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\=Proxy\HTTPProxy = https://httpproxy.example.com
Software\Policies\Mozilla\Thunderbird\Proxy\UseHTTPProxyForAllProtocols = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Proxy\SSLProxy = https://sslproxy.example.com
Software\Policies\Mozilla\Thunderbird\Proxy\FTPProxy = https://ftpproxy.example.com
Software\Policies\Mozilla\Thunderbird\Proxy\SOCKSProxy = https://socksproxy.example.com
Software\Policies\Mozilla\Thunderbird\Proxy\SOCKSVersion = 0x4 | 0x5
Software\Policies\Mozilla\Thunderbird\Proxy\Passthrough = <local>
Software\Policies\Mozilla\Thunderbird\Proxy\AutoConfigURL = URL_TO_AUTOCONFIG
Software\Policies\Mozilla\Thunderbird\Proxy\AutoLogin = 0x1 | 0x0
Software\Policies\Mozilla\Thunderbird\Proxy\UseProxyForDNS = 0x1 | 0x0
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/Proxy
```
Value (string):
```
<enabled/>
<data id="ProxyLocked" value="true | false"/>
<data id="ConnectionType" value="none | system | manual | autoDetect | autoConfig"/>
<data id="HTTPProxy" value="https://httpproxy.example.com"/>
<data id="UseHTTPProxyForAllProtocols" value="true | false"/>
<data id="SSLProxy" value="https://sslproxy.example.com"/>
<data id="FTPProxy" value="https://ftpproxy.example.com"/>
<data id="SOCKSProxy" value="https://socksproxy.example.com"/>
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
    <true> | </false>
    <key>HTTPProxy</key>
    <string>https://httpproxy.example.com</string>
    <key>UseHTTPProxyForAllProtocols</key>
    <true> | </false>
    <key>SSLProxy</key>
    <string>https://sslproxy.example.com</string>
    <key>FTPProxy</key>
    <string>https://ftpproxy.example.com</string>
    <key>SOCKSProxy</key>
    <string>https://socksproxy.example.com</string>
    <key>SOCKSVersion</key>
    <string>4 | 5</string>
    <key>Passthrough</key>
    <string>&lt;local>&gt;</string>
    <key>AutoConfigURL</key>
    <string>URL_TO_AUTOCONFIG</string>
    <key>AutoLogin</key>
    <true> | </false>
    <key>UseProxyForDNS</key>
    <true> | </false>
  </dict>
</dict>
```
#### policies.json
```
{
  "policies": {
    "Proxy": {
      "Mode": "none", "system", "manual", "autoDetect", "autoConfig",
      "Locked": true | false,
      "HTTPProxy": "hostname",
      "UseHTTPProxyForAllProtocols": true | false,
      "SSLProxy": "hostname",
      "FTPProxy": "hostname",
      "SOCKSProxy": "hostname",
      "SOCKSVersion": 4 | 5
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

<br>

## RequestedLocales
Set the the list of requested locales for the application in order of preference. It will cause the corresponding language pack to become active.

Note: For Thunderbird 68, this can now be a string so that you can specify an empty value.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** N/A
#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\RequestedLocales\1 = "de"
Software\Policies\Mozilla\Thunderbird\RequestedLocales\2 = "en-US"

or

Software\Policies\Mozilla\Thunderbird\RequestedLocales = "de,en-US"
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
</dict>

or

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

or

{
  "policies": {
    "RequestedLocales": "de,en-US"
  }
}
```
<a name="SanitizeOnShutdown"></a>

#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `RequestedLocales` | 68.0 |  |

<br>

## SSLVersionMax

Set and lock the maximum version of TLS.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.tls.version.max`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SSLVersionMax = "tls1" | "tls1.1" | "tls1.2" | "tls1.3"
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/SSLVersionMax
```
Value (string):
```
<enabled/>
<data id="SSLVersion" value="tls1 | tls1.2 | tls1.3"/>
```
#### macOS
```
<dict>
  <key>SSLVersionMax</key>
  <string>tls1 | tls1.1 | tls1.2 | tls1.3</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SSLVersionMax": "tls1" | "tls1.1" | "tls1.2" | "tls1.3"
  }
}
```
#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `SSLVersionMax` | 68.0 |  |

<br>

## SSLVersionMin

Set and lock the minimum version of TLS.

**CCK2 Equivalent:** N/A\
**Preferences Affected:** `security.tls.version.min`

#### Windows (GPO)
```
Software\Policies\Mozilla\Thunderbird\SSLVersionMin = "tls1" | "tls1.1" | "tls1.2" | "tls1.3"
```
#### Windows (Intune)
OMA-URI:
```
./Device/Vendor/MSFT/Policy/Config/Thunderbird~Policy~thunderbird/SSLVersionMin
```
Value (string):
```
<enabled/>
<data id="SSLVersion" value="tls1 | tls1.2 | tls1.3"/>
```
#### macOS
```
<dict>
  <key>SSLVersionMin</key>
  <string>tls1 | tls1.1 | tls1.2 | tls1.3</string>
</dict>
```

#### policies.json
```
{
  "policies": {
    "SSLVersionMin": "tls1" | "tls1.1" | "tls1.2" | "tls1.3"
  }
}
```
#### Compatibility

| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `SSLVersionMin` | 68.0 |  |

<br>


