**IMPORTANT**: To use enterprise policies on macOS, you must set the `EnterprisePoliciesEnabled` policy.

An example plist file with all options is available here:

https://github.com/mozilla/policy-templates/blob/master/mac/org.mozilla.thunderbird.plist

If you want to set specific options from the command line, we also provide flattened shortcuts to any item that is nested in the plist file.

For example, this policy:
```json
{
  "policies": {
    "Homepage": {
      "URL": "http://example.com/"
    }
  }
}
```
which would be set in the plist file like this:
```xml
<key>Homepage</key>
<dict>
  <key>URL</key>
  <string>http://example.com</string>
</dict>
```
Correctly writing the nested value with the `defaults` command can be hard, so you can flatten the keys by separating them with `__`, like this:
```bash
sudo defaults write /Library/Preferences/org.mozilla.thunderbird Homepage__URL -string "http://example.com"
```
Before any command line policies will work, you need to enable policies like this:
```bash
sudo defaults write /Library/Preferences/org.mozilla.thunderbird EnterprisePoliciesEnabled -bool TRUE
```
If you want to set user specific policies, use ~/Library without sudo:
```bash
defaults write ~/Library/Preferences/org.mozilla.thunderbird EnterprisePoliciesEnabled -bool TRUE
defaults write ~/Library/Preferences/org.mozilla.thunderbird Homepage__URL -string "http://example.com"
```
