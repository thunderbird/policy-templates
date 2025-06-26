Starting with Thunderbird 68, Thunderbird supports configuration files on macOS.

An example plist file with all options is available here:

[org.mozilla.thunderbird.plist](org.mozilla.thunderbird.plist)

If you want to set specific options from the command line, we also provide flattened shortcuts to any item that is nested in the plist file.

For example, this policy:
```json
{
  "policies": {
    "Proxy": {
      "HTTPProxy": "proxy.example.com:80/"
    }
  }
}
```
which would be set in the plist file like this:
```xml
<key>Proxy</key>
<dict>
  <key>HTTPProxy</key>
  <string>proxy.example.com:80</string>
</dict>
```
Correctly writing the nested value with the `defaults` command can be hard, so you can flatten the keys by separating them with `__`, like this:
```bash
sudo defaults write /Library/Preferences/org.mozilla.thunderbird Proxy__HTTPProxy -string "proxy.example.com:80"
```
Before any command line policies will work, you need to enable policies like this:
```bash
sudo defaults write /Library/Preferences/org.mozilla.thunderbird EnterprisePoliciesEnabled -bool TRUE
```
