## Enterprise policy descriptions and templates for Thunderbird

While the templates for the most recent version of Thunderbird will probably also work with older releases of Thunderbird, they may contain new policies which are not supported in older releases. We suggest to use the templates which correspond to the highest version of Thunderbird you are actually deploying.

 * [Thunderbird (active development)](templates/central)
 * [Thunderbird 91 (and older)](templates/esr91) (v3.1) 
 * [Thunderbird 78 (and older)](templates/esr78) (v2.12) 
 * [Thunderbird 68](templates/esr68) (v1.17) 

<br>

## List of supported policies

The following table states for each policy, when Thunderbird started to support it, or when it has been deprecated. It also includes all policies currently supported by Firefox, which are not supported by Thunderbird.


| Policy/Property Name | supported since | deprecated after |
|:--- | ---:| ---:|
| `3rdparty_Extensions_[name]` | 78.0 |  |
| `3rdparty_Extensions` | 78.0 |  |
| `3rdparty` | 78.0 |  |
| *`AllowedDomainsForApps`* |  |  |
| `AppAutoUpdate` | 75.0 |  |
| `AppUpdateURL` | 68.0 |  |
| `Authentication_AllowNonFQDN_NTLM` | 78.0 |  |
| `Authentication_AllowNonFQDN_SPNEGO` | 78.0 |  |
| `Authentication_AllowNonFQDN` | 78.0 |  |
| `Authentication_AllowProxies_NTLM` | 78.0 |  |
| `Authentication_AllowProxies_SPNEGO` | 78.0 |  |
| `Authentication_AllowProxies` | 78.0 |  |
| `Authentication_Delegated` | 78.0 |  |
| `Authentication_Locked` | 78.0 |  |
| `Authentication_NTLM` | 78.0 |  |
| `Authentication_PrivateBrowsing` | 78.0 |  |
| `Authentication_SPNEGO` | 78.0 |  |
| `Authentication` | 78.0 |  |
| *`AutoLaunchProtocolsFromOrigins`* |  |  |
| `BackgroundAppUpdate` | 91.0 |  |
| `BlockAboutAddons` | 68.0 |  |
| `BlockAboutConfig` | 68.0 |  |
| `BlockAboutProfiles` | 68.0 |  |
| `BlockAboutSupport` | 68.0 |  |
| *`Bookmarks`* |  |  |
| `CaptivePortal` | 78.0 |  |
| `Certificates_ImportEnterpriseRoots` | 68.0 |  |
| `Certificates_Install` | 68.0 |  |
| `Certificates` | 68.0 |  |
| `Cookies_AcceptThirdParty` | 78.0 |  |
| *`Cookies_AllowSession`* |  |  |
| `Cookies_Allow` | 78.0 |  |
| `Cookies_Block` | 78.0 |  |
| `Cookies_Default` | 78.0 |  |
| `Cookies_ExpireAtSessionEnd` | 78.0 |  |
| `Cookies_Locked` | 78.0 |  |
| *`Cookies_RejectTracker`* |  |  |
| `Cookies` | 78.0 |  |
| `DNSOverHTTPS_Enabled` | 91.0 |  |
| `DNSOverHTTPS_ExcludedDomains` | 91.0 |  |
| `DNSOverHTTPS_Locked` | 91.0 |  |
| `DNSOverHTTPS_ProviderURL` | 91.0 |  |
| `DNSOverHTTPS` | 91.0 |  |
| `DefaultDownloadDirectory` | 78.0 |  |
| `DisableAppUpdate` | 68.0 |  |
| `DisableBuiltinPDFViewer` | 91.0 |  |
| *`DisableDefaultBrowserAgent`* |  |  |
| `DisableDeveloperTools` | 68.0 |  |
| *`DisableFeedbackCommands`* |  |  |
| *`DisableFirefoxAccounts`* |  |  |
| *`DisableFirefoxScreenshots`* |  |  |
| *`DisableFirefoxStudies`* |  |  |
| *`DisableForgetButton`* |  |  |
| *`DisableFormHistory`* |  |  |
| `DisableMasterPasswordCreation` | 68.0 |  |
| `DisablePasswordReveal` | 78.0 |  |
| *`DisablePocket`* |  |  |
| *`DisablePrivateBrowsing`* |  |  |
| *`DisableProfileImport`* |  |  |
| *`DisableProfileRefresh`* |  |  |
| `DisableSafeMode` | 78.0 |  |
| `DisableSecurityBypass_InvalidCertificate` | 68.0 |  |
| `DisableSecurityBypass_SafeBrowsing` | 68.0 |  |
| `DisableSecurityBypass` | 68.0 |  |
| *`DisableSetDesktopBackground`* |  |  |
| `DisableSystemAddonUpdate` | 77.0 |  |
| `DisableTelemetry` | 78.0 |  |
| `DisabledCiphers_TLS_DHE_RSA_WITH_AES_128_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_DHE_RSA_WITH_AES_256_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256` | 76.0 |  |
| `DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256` | 76.0 |  |
| `DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_3DES_EDE_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_AES_128_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_AES_128_GCM_SHA256` | 91.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_AES_256_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_AES_256_GCM_SHA384` | 91.0 |  |
| `DisabledCiphers` | 76.0 |  |
| *`DisplayBookmarksToolbar`* |  |  |
| *`DisplayMenuBar`* |  |  |
| *`DontCheckDefaultBrowser`* |  |  |
| `DownloadDirectory` | 78.0 |  |
| *`EnableTrackingProtection`* |  |  |
| *`EncryptedMediaExtensions`* |  |  |
| `ExtensionSettings_*_allowed_types` | 78.10.3, 89.0 |  |
| `ExtensionSettings_*_blocked_install_message` | 78.10.3, 89.0 |  |
| `ExtensionSettings_*_install_sources` | 78.10.3, 89.0 |  |
| `ExtensionSettings_*_installation_mode` | 78.10.3, 89.0 |  |
| `ExtensionSettings_*_restricted_domains` | 78.10.3, 89.0 |  |
| `ExtensionSettings_*` | 78.10.3, 89.0 |  |
| `ExtensionSettings_[name]_blocked_install_message` | 68.0 |  |
| `ExtensionSettings_[name]_install_url` | 78.10.3, 89.0 |  |
| `ExtensionSettings_[name]_installation_mode` | 78.10.3, 89.0 |  |
| `ExtensionSettings_[name]_updates_disabled` | 91.0 |  |
| `ExtensionSettings_[name]` | 68.0 |  |
| `ExtensionSettings` | 68.0 |  |
| `ExtensionUpdate` | 68.0 |  |
| `Extensions_Install` | 68.0 |  |
| `Extensions_Locked` | 68.0 |  |
| `Extensions_Uninstall` | 68.0 |  |
| `Extensions` | 68.0 |  |
| *`FirefoxHome`* |  |  |
| *`FlashPlugin`* |  |  |
| `Handlers_(mimeTypes\|extensions\|schemes)_[name]_action` | 91.0 |  |
| `Handlers_(mimeTypes\|extensions\|schemes)_[name]_ask` | 91.0 |  |
| `Handlers_(mimeTypes\|extensions\|schemes)_[name]_handlers` | 91.0 |  |
| `Handlers_(mimeTypes\|extensions\|schemes)_[name]` | 91.0 |  |
| `Handlers_(mimeTypes\|extensions\|schemes)` | 91.0 |  |
| `Handlers` | 91.0 |  |
| `HardwareAcceleration` | 78.0 |  |
| *`Homepage`* |  |  |
| `InstallAddonsPermission_Allow` | 68.0 |  |
| `InstallAddonsPermission_Default` | 68.0 |  |
| `InstallAddonsPermission` | 68.0 |  |
| *`LegacyProfiles`* |  |  |
| *`LegacySameSiteCookieBehaviorEnabledForDomainList`* |  |  |
| *`LegacySameSiteCookieBehaviorEnabled`* |  |  |
| *`LocalFileLinks`* |  |  |
| *`ManagedBookmarks`* |  |  |
| `ManualAppUpdateOnly` | 91.0 |  |
| `NetworkPrediction` | 91.0 |  |
| *`NewTabPage`* |  |  |
| *`NoDefaultBookmarks`* |  |  |
| `OfferToSaveLoginsDefault` | 91.0 |  |
| `OfferToSaveLogins` | 91.0 |  |
| *`OverrideFirstRunPage`* |  |  |
| *`OverridePostUpdatePage`* |  |  |
| `PDFjs_EnablePermissions` | 91.0 |  |
| `PDFjs_Enabled` | 91.0 |  |
| `PDFjs` | 91.0 |  |
| `PasswordManagerEnabled` | 78.0 |  |
| *`Permissions`* |  |  |
| *`PictureInPicture`* |  |  |
| *`PopupBlocking`* |  |  |
| `Preferences_[name]_Status` | 91.0 |  |
| `Preferences_[name]_Value` | 91.0 |  |
| `Preferences_[name]` | 91.0 |  |
| `Preferences_accessibility.force_disabled` | 78.0 | 89.0 |
| `Preferences_browser.cache.disk.enable` | 78.0 | 89.0 |
| `Preferences_browser.cache.disk.parent_directory` | 68.0 | 89.0 |
| `Preferences_browser.fixup.dns_first_for_single_words` | 68.0 | 77.0 |
| `Preferences_browser.safebrowsing.malware.enabled` | 78.0 | 89.0 |
| `Preferences_browser.safebrowsing.phishing.enabled` | 78.0 | 89.0 |
| `Preferences_browser.search.update` | 78.0 | 89.0 |
| `Preferences_browser.urlbar.suggest.bookmark` | 68.0 | 77.0 |
| `Preferences_browser.urlbar.suggest.history` | 68.0 | 77.0 |
| `Preferences_browser.urlbar.suggest.openpage` | 68.0 | 77.0 |
| `Preferences_datareporting.policy.dataSubmissionPolicyBypassNotification` | 78.0 | 89.0 |
| `Preferences_dom.allow_scripts_to_close_windows` | 78.0 | 89.0 |
| `Preferences_dom.disable_window_flip` | 78.0 | 89.0 |
| `Preferences_dom.disable_window_move_resize` | 78.0 | 89.0 |
| `Preferences_dom.event.contextmenu.enabled` | 78.0 | 89.0 |
| `Preferences_dom.keyboardevent.keypress.hack.dispatch_non_printable_keys.addl` | 78.0 | 89.0 |
| `Preferences_dom.keyboardevent.keypress.hack.use_legacy_keycode_and_charcode.addl` | 78.0 | 89.0 |
| `Preferences_extensions.blocklist.enabled` | 78.0 | 89.0 |
| `Preferences_geo.enabled` | 78.0 | 89.0 |
| `Preferences_intl.accept_languages` | 78.0 | 89.0 |
| `Preferences_network.IDN_show_punycode` | 68.0 | 89.0 |
| `Preferences_network.dns.disableIPv6` | 78.0 | 89.0 |
| `Preferences_places.history.enabled` | 78.0 | 89.0 |
| `Preferences_print.save_print_settings` | 78.0 | 89.0 |
| `Preferences_security.default_personal_cert` | 78.0 | 89.0 |
| `Preferences_security.mixed_content.block_active_content` | 78.0 | 89.0 |
| `Preferences_security.osclientcerts.autoload` | 78.0 | 89.0 |
| `Preferences_security.ssl.errorReporting.enabled` | 78.0 | 89.0 |
| `Preferences_security.tls.hello_downgrade_check` | 78.0 | 89.0 |
| `Preferences_widget.content.gtk-theme-override` | 78.0 | 89.0 |
| `Preferences` | 68.0 |  |
| `PrimaryPassword` | 91.0 |  |
| `PromptForDownloadLocation` | 78.0 |  |
| `Proxy_AutoConfigURL` | 68.0 |  |
| `Proxy_AutoLogin` | 68.0 |  |
| `Proxy_FTPProxy` | 68.0 |  |
| `Proxy_HTTPProxy` | 68.0 |  |
| `Proxy_Locked` | 68.0 |  |
| `Proxy_Mode` | 68.0 |  |
| `Proxy_Passthrough` | 68.0 |  |
| `Proxy_SOCKSProxy` | 68.0 |  |
| `Proxy_SOCKSVersion` | 68.0 |  |
| `Proxy_SSLProxy` | 68.0 |  |
| `Proxy_UseHTTPProxyForAllProtocols` | 68.0 |  |
| `Proxy_UseProxyForDNS` | 68.0 |  |
| `Proxy` | 68.0 |  |
| `RequestedLocales` | 68.0 |  |
| `SSLVersionMax` | 68.0 |  |
| `SSLVersionMin` | 68.0 |  |
| *`SanitizeOnShutdown`* |  |  |
| *`SearchBar`* |  |  |
| *`SearchEngines`* |  |  |
| *`SearchSuggestEnabled`* |  |  |
| *`SecurityDevices`* |  |  |
| *`ShowHomeButton`* |  |  |
| *`SupportMenu`* |  |  |
| *`UserMessaging`* |  |  |
| *`WebsiteFilter`* |  |  |
| *`WindowsSSO`* |  |  |


