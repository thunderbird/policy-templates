# Firefox (exploration)

A product folder for Firefox, built only from Firefox's GitHub repository
(`mozilla-firefox/firefox`) and Mozilla's rendered policy documentation
(`docs/index.md` of `mozilla/policy-templates`), with the generator unchanged.

```sh
# Build the overlays (downloads the schemas of all branches and the docs):
products/firefox/scripts/build_overlays.sh /tmp/firefox-build
# Generate the docs, ADMX and plist templates:
node generator/update_all_policy_templates.js --product-config=products/firefox \
    --output=/tmp/firefox-docs --branches=main,beta,release,esr153,esr140,esr128,esr115
```

## What the overlays do

- `scripts/fix_unions.py`: gives the policies with several forms one form,
  as the generator handles neither `anyOf` nor type lists of simple and
  structured values:
  - boolean or object (`BrowserDataBackup`, `ClearOnShutdown`,
    `SanitizeOnShutdown`): the object;
  - boolean or string choice (`DisplayMenuBar`, `DisplayBookmarksToolbar`):
    the choice;
  - the old `JSON` type in type lists (ESR 140 and older, e.g.
    `ExtensionSettings`): `contentMediaType: application/json`.
- `scripts/import_docs.py`: what the docs have beyond the schema: the help
  texts (`x-help`), the CCK2 equivalents and the preferences affected.
- `tools/sync_overlays.js`: derives the overlays of beta, release and the
  ESR branches from main. The ESR schemas (153 and older) have no texts,
  examples or categories.

## Results

- All seven branches generate. All ADMX templates are valid and complete:
  every policy of each branch's schema is in its ADMX template.
- Compared with Mozilla's own `firefox.admx` (main): it lacks 5 policies of
  the schema (`3rdparty`, `ClearOnShutdown`, `DisableAccounts`,
  `MicrosoftEntraSSO`, `RelaunchRequired`). Some policies are written
  differently in the two templates:
  - `Bookmarks`: 5 slots here, 50 in Mozilla's;
  - `Preferences`: one JSON value here, 51 preferences in Mozilla's;
  - JSON or lists for `WebsiteFilter`, `Containers` and `SitePolicies`.
  `FlashPlugin` is only in Mozilla's, it's no longer in the schema.

## Open points

- The ESR overlays use main's examples, of which 35 use settings or values
  the branch doesn't have (see `tools/check_overlays.js`).
- 21 CCK2 equivalents are on settings without a docs section of their own,
  so they aren't shown.
- The compatibility shows no ESR backports older than ESR 115: the
  repository only has the branches esr115 and newer.
- Help texts with tables or code blocks in the docs lose those parts.
