## Enterprise policy descriptions and templates for Firefox

Firefox policies allow administrators to centrally manage browser behavior,
enforce security requirements, configure features, or disable certain
functionality. The templates of a newer version of Firefox usually also work
with older releases, but they may contain policies which older releases don't
support. We suggest using the templates which correspond to the version of
Firefox you are deploying.

 * [Firefox Nightly 160.0a1](policies/main)
 * [Firefox Beta 159.0](policies/beta)
 * [Firefox 158.0](policies/release)
 * [Firefox ESR 153.6.0](policies/esr153)
 * [Firefox ESR 140.17.1](policies/esr140)
 * [Firefox ESR 128.14.1](policies/esr128)

## List of supported policies

The following table states for each policy and setting since when Firefox
supports it, and when it was removed.


| Policy/Property Name | Firefox | Removed after |
|:--- | ---:| ---:|
| `3rdparty` | 67.0 |  |
| `3rdparty_Extensions` | 67.0 |  |
| `3rdparty_Extensions_[name]` | 67.0 |  |
| `AIControls` | 150.0 |  |
| `AIControls_Default` | 150.0 |  |
| `AIControls_Default_Locked` | 150.0 |  |
| `AIControls_Default_Value` | 150.0 |  |
| `AIControls_LinkPreviewKeyPoints` | 150.0 |  |
| `AIControls_LinkPreviewKeyPoints_Locked` | 150.0 |  |
| `AIControls_LinkPreviewKeyPoints_Value` | 150.0 |  |
| `AIControls_PDFAltText` | 150.0 |  |
| `AIControls_PDFAltText_Locked` | 150.0 |  |
| `AIControls_PDFAltText_Value` | 150.0 |  |
| `AIControls_SidebarChatbot` | 150.0 |  |
| `AIControls_SidebarChatbot_Locked` | 150.0 |  |
| `AIControls_SidebarChatbot_Value` | 150.0 |  |
| `AIControls_SmartTabGroups` | 150.0 |  |
| `AIControls_SmartTabGroups_Locked` | 150.0 |  |
| `AIControls_SmartTabGroups_Value` | 150.0 |  |
| `AIControls_SmartWindow` | 150.0 |  |
| `AIControls_SmartWindow_Locked` | 150.0 |  |
| `AIControls_SmartWindow_Value` | 150.0 |  |
| `AIControls_SpeechRecognition` | 157.0 |  |
| `AIControls_SpeechRecognition_Locked` | 157.0 |  |
| `AIControls_SpeechRecognition_Value` | 157.0 |  |
| `AIControls_Translations` | 150.0 |  |
| `AIControls_Translations_Locked` | 150.0 |  |
| `AIControls_Translations_Value` | 150.0 |  |
| `AllowFileSelectionDialogs` | 124.0 |  |
| `AllowedDomainsForApps` | 89.0 |  |
| `AppAutoUpdate` | 75.0 |  |
| `AppUpdatePin` | 102.0 |  |
| `AppUpdateURL` | 63.0 |  |
| `Authentication` | 61.0 |  |
| `Authentication_AllowNonFQDN` | 63.0 |  |
| `Authentication_AllowNonFQDN_NTLM` | 63.0 |  |
| `Authentication_AllowNonFQDN_SPNEGO` | 63.0 |  |
| `Authentication_AllowProxies` | 71.0 |  |
| `Authentication_AllowProxies_NTLM` | 71.0 |  |
| `Authentication_AllowProxies_SPNEGO` | 71.0 |  |
| `Authentication_Delegated` | 61.0 |  |
| `Authentication_Locked` | 71.0 |  |
| `Authentication_NTLM` | 61.0 |  |
| `Authentication_PrivateBrowsing` | 78.0 |  |
| `Authentication_SPNEGO` | 61.0 |  |
| `AutoLaunchProtocolsFromOrigins` | 90.0 |  |
| `AutofillAddressEnabled` | 125.0 |  |
| `AutofillCreditCardEnabled` | 125.0 |  |
| `BackgroundAppUpdate` | 88.0 |  |
| `BlockAboutAddons` | 60.0 |  |
| `BlockAboutConfig` | 60.0 |  |
| `BlockAboutProfiles` | 60.0 |  |
| `BlockAboutSupport` | 60.0 |  |
| `Bookmarks` | 60.0 |  |
| `BrowserDataBackup` | 146.0 |  |
| `BrowserDataBackup_AllowBackup` | 146.0 |  |
| `BrowserDataBackup_AllowRestore` | 146.0 |  |
| `CNSA2KeyAgreementEnabled` | 154.0 |  |
| `CaptivePortal` | 67.0 |  |
| `Certificates` | 61.0 |  |
| `Certificates_ImportEnterpriseRoots` | 61.0 |  |
| `Certificates_Install` | 64.0 |  |
| `ClearOnShutdown` | 158.0, 153.5.0esr |  |
| `ClearOnShutdown_BrowsingHistoryAndDownloads` | 158.0, 153.5.0esr |  |
| `ClearOnShutdown_Cache` | 158.0, 153.5.0esr |  |
| `ClearOnShutdown_CookiesAndStorage` | 158.0, 153.5.0esr |  |
| `ClearOnShutdown_Exceptions` | 158.0 |  |
| `ClearOnShutdown_FormData` | 158.0, 153.5.0esr |  |
| `ClearOnShutdown_SiteSettings` | 158.0, 153.5.0esr |  |
| `Containers` | 113.0 |  |
| `Containers_Default` | 113.0 |  |
| `ContentAnalysis` | 125.0 |  |
| `ContentAnalysis_AgentName` | 126.0 |  |
| `ContentAnalysis_AgentTimeout` | 125.0 |  |
| `ContentAnalysis_AllowUrlRegexList` | 125.0 |  |
| `ContentAnalysis_BypassForSameTabOperations` | 126.0 |  |
| `ContentAnalysis_ClientSignature` | 126.0 |  |
| `ContentAnalysis_DefaultResult` | 127.0 |  |
| `ContentAnalysis_DenyUrlRegexList` | 125.0 |  |
| `ContentAnalysis_Enabled` | 125.0 |  |
| `ContentAnalysis_InterceptionPoints` | 134.0 |  |
| `ContentAnalysis_InterceptionPoints_Clipboard` | 134.0 |  |
| `ContentAnalysis_InterceptionPoints_ClipboardCopy` | 158.0 |  |
| `ContentAnalysis_InterceptionPoints_ClipboardCopy_Enabled` | 158.0 |  |
| `ContentAnalysis_InterceptionPoints_ClipboardCopy_PlainTextOnly` | 158.0 |  |
| `ContentAnalysis_InterceptionPoints_Clipboard_Enabled` | 134.0 |  |
| `ContentAnalysis_InterceptionPoints_Clipboard_PlainTextOnly` | 137.0 |  |
| `ContentAnalysis_InterceptionPoints_Download` | 141.0, 140.2.0esr |  |
| `ContentAnalysis_InterceptionPoints_Download_Enabled` | 141.0, 140.2.0esr |  |
| `ContentAnalysis_InterceptionPoints_DragAndDrop` | 134.0 |  |
| `ContentAnalysis_InterceptionPoints_DragAndDrop_Enabled` | 134.0 |  |
| `ContentAnalysis_InterceptionPoints_DragAndDrop_PlainTextOnly` | 137.0 |  |
| `ContentAnalysis_InterceptionPoints_FileUpload` | 134.0 |  |
| `ContentAnalysis_InterceptionPoints_FileUpload_Enabled` | 134.0 |  |
| `ContentAnalysis_InterceptionPoints_Print` | 134.0 |  |
| `ContentAnalysis_InterceptionPoints_Print_Enabled` | 134.0 |  |
| `ContentAnalysis_IsPerUser` | 125.0 |  |
| `ContentAnalysis_MaxConnectionsCount` | 138.0 |  |
| `ContentAnalysis_PipePathName` | 125.0 |  |
| `ContentAnalysis_ShowBlockedResult` | 125.0 |  |
| `ContentAnalysis_TimeoutResult` | 137.0 |  |
| `Cookies` | 60.0 |  |
| `Cookies_AcceptThirdParty` | 61.0 |  |
| `Cookies_Allow` | 60.0 |  |
| `Cookies_AllowSession` | 79.0 |  |
| `Cookies_Behavior` | 96.0 |  |
| `Cookies_BehaviorPrivateBrowsing` | 96.0 |  |
| `Cookies_Block` | 60.0 |  |
| `Cookies_Default` | 61.0 |  |
| `Cookies_ExpireAtSessionEnd` | 61.0 |  |
| `Cookies_Locked` | 61.0 |  |
| `Cookies_RejectTracker` | 63.0 |  |
| `DNSOverHTTPS` | 64.0 |  |
| `DNSOverHTTPS_Enabled` | 64.0 |  |
| `DNSOverHTTPS_ExcludedDomains` | 75.0 |  |
| `DNSOverHTTPS_Fallback` | 124.0 |  |
| `DNSOverHTTPS_Locked` | 64.0 |  |
| `DNSOverHTTPS_ProviderURL` | 64.0 |  |
| `DefaultBrowserSettingEnabled` | 154.0, 153.1.0esr |  |
| `DefaultDownloadDirectory` | 68.0 |  |
| `DefaultSerialGuardSetting` | 151.0 |  |
| `DisableAccounts` | 119.0 |  |
| `DisableAppUpdate` | 60.0 |  |
| `DisableBuiltinPDFViewer` | 61.0 |  |
| `DisableDefaultBrowserAgent` | 76.0 |  |
| `DisableDeveloperTools` | 60.0 |  |
| `DisableEncryptedClientHello` | 127.0 |  |
| `DisableFeedbackCommands` | 61.0 |  |
| `DisableFirefoxAccounts` | 60.0 |  |
| `DisableFirefoxScreenshots` | 60.0 |  |
| `DisableFirefoxStudies` | 60.0 |  |
| `DisableForgetButton` | 61.0 |  |
| `DisableFormHistory` | 60.0 |  |
| `DisableLaunchOnLogin` | 155.0 |  |
| `DisableMasterPasswordCreation` | 61.0 |  |
| `DisablePasswordReveal` | 71.0 |  |
| `DisablePocket` | 60.0 |  |
| `DisablePrivateBrowsing` | 60.0 |  |
| `DisableProfileImport` | 61.0 |  |
| `DisableProfileRefresh` | 61.0 |  |
| `DisableRemoteImprovements` | 148.0 |  |
| `DisableRemoteSettingsAndAcceptSecurityConsequences` | 153.0 |  |
| `DisableSafeMode` | 61.0 |  |
| `DisableSecurityBypass` | 61.0 |  |
| `DisableSecurityBypass_InvalidCertificate` | 61.0 |  |
| `DisableSecurityBypass_SafeBrowsing` | 61.0 |  |
| `DisableSetDesktopBackground` | 61.0 |  |
| `DisableSystemAddonUpdate` | 61.0 |  |
| `DisableTelemetry` | 61.0 |  |
| `DisableThirdPartyModuleBlocking` | 110.0 |  |
| `DisabledCiphers` | 76.0 |  |
| `DisabledCiphers_TLS_AES_128_GCM_SHA256` | 138.0, 128.10.0esr |  |
| `DisabledCiphers_TLS_AES_256_GCM_SHA384` | 138.0, 128.10.0esr |  |
| `DisabledCiphers_TLS_CHACHA20_POLY1305_SHA256` | 138.0, 128.10.0esr |  |
| `DisabledCiphers_TLS_DHE_RSA_WITH_AES_128_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_DHE_RSA_WITH_AES_256_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA` | 97.0 |  |
| `DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256` | 76.0 |  |
| `DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA` | 97.0 |  |
| `DisabledCiphers_TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384` | 97.0 |  |
| `DisabledCiphers_TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256` | 97.0 |  |
| `DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256` | 76.0 |  |
| `DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384` | 97.0 |  |
| `DisabledCiphers_TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256` | 97.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_3DES_EDE_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_AES_128_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_AES_128_GCM_SHA256` | 79.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_AES_256_CBC_SHA` | 76.0 |  |
| `DisabledCiphers_TLS_RSA_WITH_AES_256_GCM_SHA384` | 79.0 |  |
| `DisplayBookmarksToolbar` | 60.0 |  |
| `DisplayMenuBar` | 60.0 |  |
| `DontCheckDefaultBrowser` | 60.0 |  |
| `DownloadDirectory` | 68.0 |  |
| `EnableTrackingProtection` | 61.0 |  |
| `EnableTrackingProtection_BaselineExceptions` | 143.0 |  |
| `EnableTrackingProtection_Category` | 141.0, 140.1.0esr |  |
| `EnableTrackingProtection_ConvenienceExceptions` | 143.0 |  |
| `EnableTrackingProtection_Cryptomining` | 70.0 |  |
| `EnableTrackingProtection_EmailTracking` | 112.0 |  |
| `EnableTrackingProtection_Exceptions` | 73.0 |  |
| `EnableTrackingProtection_Fingerprinting` | 70.0 |  |
| `EnableTrackingProtection_Locked` | 61.0 |  |
| `EnableTrackingProtection_SuspectedFingerprinting` | 142.0, 140.1.0esr |  |
| `EnableTrackingProtection_Value` | 61.0 |  |
| `EncryptedMediaExtensions` | 77.0 |  |
| `EncryptedMediaExtensions_Enabled` | 77.0 |  |
| `EncryptedMediaExtensions_Locked` | 77.0 |  |
| `ExemptDomainFileTypePairsFromFileTypeDownloadWarnings` | 102.0 |  |
| `ExtensionSettings` | 68.0 |  |
| `ExtensionSettings_*` | 68.0 |  |
| `ExtensionSettings_*_allowed_permissions` | 154.0, 153.0esr |  |
| `ExtensionSettings_*_allowed_types` | 68.0 |  |
| `ExtensionSettings_*_blocked_install_message` | 68.0 |  |
| `ExtensionSettings_*_blocked_permissions` | 153.0 |  |
| `ExtensionSettings_*_install_sources` | 68.0 |  |
| `ExtensionSettings_*_installation_mode` | 68.0 |  |
| `ExtensionSettings_*_restricted_domains` | 78.0 |  |
| `ExtensionSettings_*_runtime_allowed_hosts` | 153.0 |  |
| `ExtensionSettings_*_runtime_blocked_hosts` | 153.0 |  |
| `ExtensionSettings_*_temporarily_allow_weak_signatures` | 126.0 |  |
| `ExtensionSettings_[name]` | 68.0 |  |
| `ExtensionSettings_[name]_allowed_permissions` | 154.0, 153.0esr |  |
| `ExtensionSettings_[name]_blocked_install_message` | 68.0 |  |
| `ExtensionSettings_[name]_blocked_permissions` | 153.0 |  |
| `ExtensionSettings_[name]_default_area` | 113.0 |  |
| `ExtensionSettings_[name]_install_url` | 68.0 |  |
| `ExtensionSettings_[name]_installation_mode` | 68.0 |  |
| `ExtensionSettings_[name]_private_browsing` | 136.0, 128.8.0esr |  |
| `ExtensionSettings_[name]_runtime_allowed_hosts` | 153.0 |  |
| `ExtensionSettings_[name]_runtime_blocked_hosts` | 153.0 |  |
| `ExtensionSettings_[name]_temporarily_allow_weak_signatures` | 126.0 |  |
| `ExtensionSettings_[name]_update_url` | 151.0 |  |
| `ExtensionSettings_[name]_updates_disabled` | 89.0 |  |
| `ExtensionUpdate` | 67.0 |  |
| `Extensions` | 61.0 |  |
| `Extensions_Install` | 61.0 |  |
| `Extensions_Locked` | 61.0 |  |
| `Extensions_Uninstall` | 61.0 |  |
| `FirefoxHome` | 68.0 |  |
| `FirefoxHome_Highlights` | 68.0 |  |
| `FirefoxHome_Locked` | 68.0 |  |
| `FirefoxHome_Pocket` | 68.0 |  |
| `FirefoxHome_Search` | 68.0 |  |
| `FirefoxHome_Snippets` | 68.0 |  |
| `FirefoxHome_SponsoredPocket` | 95.0 |  |
| `FirefoxHome_SponsoredStories` | 142.0, 140.1.0esr |  |
| `FirefoxHome_SponsoredTopSites` | 95.0 |  |
| `FirefoxHome_Stories` | 142.0, 140.1.0esr |  |
| `FirefoxHome_TopSites` | 68.0 |  |
| `FirefoxHome_Weather` | 152.0, 140.12.0esr |  |
| `FirefoxHome_Widgets` | 156.0, 153.3.0esr |  |
| `FirefoxHome_Widgets_Blocked` | 156.0, 153.3.0esr |  |
| `FirefoxHome_Widgets_Enabled` | 156.0, 153.3.0esr |  |
| `FirefoxSuggest` | 118.0 |  |
| `FirefoxSuggest_ImproveSuggest` | 118.0 |  |
| `FirefoxSuggest_Locked` | 118.0 |  |
| `FirefoxSuggest_OnlineEnabled` | 146.0 |  |
| `FirefoxSuggest_SponsoredSuggestions` | 118.0 |  |
| `FirefoxSuggest_WebSuggestions` | 118.0 |  |
| `GenerativeAI` | 144.0, 140.4.0esr |  |
| `GenerativeAI_Chatbot` | 144.0, 140.4.0esr |  |
| `GenerativeAI_Enabled` | 144.0, 140.4.0esr |  |
| `GenerativeAI_LinkPreviews` | 144.0, 140.4.0esr |  |
| `GenerativeAI_Locked` | 144.0, 140.4.0esr |  |
| `GenerativeAI_SmartWindow` | 150.0 |  |
| `GenerativeAI_TabGroups` | 144.0, 140.4.0esr |  |
| `GoToIntranetSiteForSingleWordEntryInAddressBar` | 104.0 |  |
| `Handlers` | 78.0 |  |
| `Handlers_extensions` | 78.0 |  |
| `Handlers_extensions_[name]` | 78.0 |  |
| `Handlers_extensions_[name]_action` | 78.0 |  |
| `Handlers_extensions_[name]_ask` | 78.0 |  |
| `Handlers_extensions_[name]_handlers` | 78.0 |  |
| `Handlers_mimeTypes` | 78.0 |  |
| `Handlers_mimeTypes_[name]` | 78.0 |  |
| `Handlers_mimeTypes_[name]_action` | 78.0 |  |
| `Handlers_mimeTypes_[name]_ask` | 78.0 |  |
| `Handlers_mimeTypes_[name]_handlers` | 78.0 |  |
| `Handlers_schemes` | 78.0 |  |
| `Handlers_schemes_[name]` | 78.0 |  |
| `Handlers_schemes_[name]_action` | 78.0 |  |
| `Handlers_schemes_[name]_ask` | 78.0 |  |
| `Handlers_schemes_[name]_handlers` | 78.0 |  |
| `HardwareAcceleration` | 62.0 |  |
| `Homepage` | 60.0 |  |
| `Homepage_Additional` | 60.0 |  |
| `Homepage_Locked` | 60.0 |  |
| `Homepage_NewTabOnRestore` | 154.0, 153.0esr |  |
| `Homepage_StartPage` | 64.0 |  |
| `Homepage_URL` | 60.0 |  |
| `HttpAllowlist` | 127.0 |  |
| `HttpsOnlyMode` | 127.0 |  |
| `IPProtectionAvailable` | 151.0 |  |
| `InstallAddonsPermission` | 61.0 |  |
| `InstallAddonsPermission_Allow` | 61.0 |  |
| `InstallAddonsPermission_Default` | 61.0 |  |
| `LegacyProfiles` | 71.0 |  |
| `LegacySameSiteCookieBehaviorEnabled` | 76.0 |  |
| `LegacySameSiteCookieBehaviorEnabledForDomainList` | 76.0 |  |
| `LocalFileLinks` | 68.0 |  |
| `LocalNetworkAccess` | 144.0 |  |
| `LocalNetworkAccess_BlockTrackers` | 144.0 |  |
| `LocalNetworkAccess_EnablePrompting` | 144.0 |  |
| `LocalNetworkAccess_Enabled` | 144.0 |  |
| `LocalNetworkAccess_Locked` | 144.0 |  |
| `LocalNetworkAccess_SkipDomains` | 146.0 |  |
| `ManagedBookmarks` | 82.0 |  |
| `ManualAppUpdateOnly` | 87.0 |  |
| `MicrosoftEntraSSO` | 133.0, 128.5.0esr |  |
| `NetworkPrediction` | 67.0 |  |
| `NewTabPage` | 68.0 |  |
| `NoDefaultBookmarks` | 61.0 |  |
| `OfferToSaveLogins` | 61.0 |  |
| `OfferToSaveLoginsDefault` | 70.0 |  |
| `OverrideFirstRunPage` | 61.0 |  |
| `OverridePostUpdatePage` | 61.0 |  |
| `PDFjs` | 77.0 |  |
| `PDFjs_EnablePermissions` | 77.0 |  |
| `PDFjs_Enabled` | 77.0 |  |
| `PasswordManagerEnabled` | 70.0 |  |
| `PasswordManagerExceptions` | 101.0 |  |
| `Permissions` | 62.0 |  |
| `Permissions_Autoplay` | 74.0 |  |
| `Permissions_Autoplay_Allow` | 74.0 |  |
| `Permissions_Autoplay_Block` | 74.0 |  |
| `Permissions_Autoplay_Default` | 76.0 |  |
| `Permissions_Autoplay_Locked` | 76.0 |  |
| `Permissions_Camera` | 62.0 |  |
| `Permissions_Camera_Allow` | 62.0 |  |
| `Permissions_Camera_Block` | 62.0 |  |
| `Permissions_Camera_BlockNewRequests` | 62.0 |  |
| `Permissions_Camera_Locked` | 62.0 |  |
| `Permissions_Location` | 62.0 |  |
| `Permissions_Location_Allow` | 62.0 |  |
| `Permissions_Location_Block` | 62.0 |  |
| `Permissions_Location_BlockNewRequests` | 62.0 |  |
| `Permissions_Location_Locked` | 62.0 |  |
| `Permissions_Microphone` | 62.0 |  |
| `Permissions_Microphone_Allow` | 62.0 |  |
| `Permissions_Microphone_Block` | 62.0 |  |
| `Permissions_Microphone_BlockNewRequests` | 62.0 |  |
| `Permissions_Microphone_Locked` | 62.0 |  |
| `Permissions_Notifications` | 62.0 |  |
| `Permissions_Notifications_Allow` | 62.0 |  |
| `Permissions_Notifications_Block` | 62.0 |  |
| `Permissions_Notifications_BlockNewRequests` | 62.0 |  |
| `Permissions_Notifications_Locked` | 62.0 |  |
| `Permissions_ScreenShare` | 142.0, 140.2.0esr |  |
| `Permissions_ScreenShare_Allow` | 142.0, 140.2.0esr |  |
| `Permissions_ScreenShare_Block` | 142.0, 140.2.0esr |  |
| `Permissions_ScreenShare_BlockNewRequests` | 142.0, 140.2.0esr |  |
| `Permissions_ScreenShare_Locked` | 142.0, 140.2.0esr |  |
| `Permissions_VirtualReality` | 81.0 |  |
| `Permissions_VirtualReality_Allow` | 81.0 |  |
| `Permissions_VirtualReality_Block` | 81.0 |  |
| `Permissions_VirtualReality_BlockNewRequests` | 81.0 |  |
| `Permissions_VirtualReality_Locked` | 81.0 |  |
| `PictureInPicture` | 78.0 |  |
| `PictureInPicture_Enabled` | 78.0 |  |
| `PictureInPicture_Locked` | 78.0 |  |
| `PopupBlocking` | 61.0 |  |
| `PopupBlocking_Allow` | 61.0 |  |
| `PopupBlocking_Default` | 61.0 |  |
| `PopupBlocking_Locked` | 61.0 |  |
| `PostQuantumKeyAgreementEnabled` | 127.0 |  |
| `Preferences` | 68.0 |  |
| `Preferences_[name]` | 82.0 |  |
| `Preferences_[name]_Status` | 82.0 |  |
| `Preferences_[name]_Type` | 123.0 |  |
| `Preferences_[name]_Value` | 82.0 |  |
| `PrimaryPassword` | 80.0 |  |
| `PrintingEnabled` | 120.0 |  |
| `PrivateBrowsingModeAvailability` | 130.0, 128.3.0esr |  |
| `PromptForDownloadLocation` | 68.0 |  |
| `Proxy` | 61.0 |  |
| `Proxy_AutoConfigURL` | 61.0 |  |
| `Proxy_AutoLogin` | 61.0 |  |
| `Proxy_FTPProxy` | 61.0 |  |
| `Proxy_HTTPProxy` | 61.0 |  |
| `Proxy_Locked` | 61.0 |  |
| `Proxy_Mode` | 61.0 |  |
| `Proxy_Passthrough` | 61.0 |  |
| `Proxy_SOCKSProxy` | 61.0 |  |
| `Proxy_SOCKSVersion` | 61.0 |  |
| `Proxy_SSLProxy` | 61.0 |  |
| `Proxy_UseHTTPProxyForAllProtocols` | 61.0 |  |
| `Proxy_UseProxyForDNS` | 61.0 |  |
| `RelaunchRequired` | 150.0 |  |
| `RelaunchRequired_NotificationPeriodHours` | 150.0 |  |
| `RelaunchRequired_RestartTimeOfDay` | 150.0 |  |
| `RelaunchRequired_RestartTimeOfDay_Hour` | 150.0 |  |
| `RelaunchRequired_RestartTimeOfDay_Minute` | 150.0 |  |
| `RequestedLocales` | 64.0 |  |
| `SSLVersionMax` | 66.0 |  |
| `SSLVersionMin` | 66.0 |  |
| `SanitizeOnShutdown` | 61.0 |  |
| `SanitizeOnShutdown_Cache` | 68.0 |  |
| `SanitizeOnShutdown_Cookies` | 68.0 |  |
| `SanitizeOnShutdown_Downloads` | 68.0 |  |
| `SanitizeOnShutdown_Exceptions` | 154.0, 153.1.0esr |  |
| `SanitizeOnShutdown_FormData` | 68.0 |  |
| `SanitizeOnShutdown_History` | 68.0 |  |
| `SanitizeOnShutdown_Locked` | 75.0 |  |
| `SanitizeOnShutdown_OfflineApps` | 68.0 |  |
| `SanitizeOnShutdown_Sessions` | 68.0 |  |
| `SanitizeOnShutdown_SiteSettings` | 68.0 |  |
| `SearchBar` | 61.0 |  |
| `SearchEngines` | 61.0 |  |
| `SearchEngines_Add` | 61.0 |  |
| `SearchEngines_Default` | 61.0 |  |
| `SearchEngines_DefaultPrivate` | 71.0 |  |
| `SearchEngines_PreventInstalls` | 61.0 |  |
| `SearchEngines_Remove` | 62.0 |  |
| `SearchSuggestEnabled` | 68.0 |  |
| `SecurityDevices` | 64.0 |  |
| `SecurityDevices_Add` | 114.0 |  |
| `SecurityDevices_Add_[name]` | 114.0 |  |
| `SecurityDevices_Delete` | 114.0 |  |
| `SecurityDevices_[name]` | 64.0 |  |
| `ShowHomeButton` | 88.0 |  |
| `SitePolicies` | 150.0 |  |
| `SkipTermsOfUse` | 139.0 |  |
| `StartDownloadsInTempDirectory` | 102.0 |  |
| `SupportMenu` | 67.0 |  |
| `SupportMenu_AccessKey` | 67.0 |  |
| `SupportMenu_Title` | 67.0 |  |
| `SupportMenu_URL` | 67.0 |  |
| `TranslateEnabled` | 126.0 |  |
| `UseSystemPrintDialog` | 102.0 |  |
| `UserMessaging` | 75.0 |  |
| `UserMessaging_ExtensionRecommendations` | 75.0 |  |
| `UserMessaging_FeatureRecommendations` | 75.0 |  |
| `UserMessaging_FirefoxLabs` | 131.0 |  |
| `UserMessaging_Locked` | 75.0 |  |
| `UserMessaging_MoreFromMozilla` | 99.0 |  |
| `UserMessaging_SkipOnboarding` | 80.0 |  |
| `UserMessaging_SkipTermsOfUse` | 138.0 | 138.0 |
| `UserMessaging_UrlbarInterventions` | 76.0 |  |
| `UserMessaging_WhatsNew` | 75.0 |  |
| `VisualSearchEnabled` | 144.0 |  |
| `WebsiteFilter` | 61.0 |  |
| `WebsiteFilter_Block` | 61.0 |  |
| `WebsiteFilter_Exceptions` | 61.0 |  |
| `WindowsSSO` | 91.0 |  |
| `XSLTEnabled` | 151.0 |  |


