# Firefox (proof of concept)

A product folder for Firefox, to see whether the generator can produce
complete templates for another product. Its output is in `docs/firefox/`.

```sh
node generator/update_all_policy_templates.js --product-config=products/firefox \
    --output=docs/firefox --branches=main,beta,release,esr153,esr140,esr128,esr115
```

## How the schemas were made

The schemas in `overrides/` (the full policy schema of each branch) were built
once, from Firefox's schemas on GitHub (`mozilla-firefox/firefox`) and
Mozilla's rendered policy documentation (`docs/index.md` of
`mozilla/policy-templates`, which Mozilla has since replaced by
https://firefox-admin-docs.mozilla.org/). They are not maintained further.

- **Union types:** the policies with several forms got one form, as the
  generator handles neither `anyOf` nor type lists of simple and structured
  values:
  - boolean or object (`BrowserDataBackup`, `ClearOnShutdown`,
    `SanitizeOnShutdown`): the object;
  - boolean or string choice (`DisplayMenuBar`, `DisplayBookmarksToolbar`):
    the choice;
  - the old `JSON` type in type lists (ESR 140 and older, e.g.
    `ExtensionSettings`): `contentMediaType: application/json`.
- **Imported from the docs:** what they have beyond the schema: the help texts
  (`x-help`), the CCK2 equivalents and the preferences affected. Tables and
  code blocks of the docs were left out.
- **Older branches:** the ESR schemas (153 and older) have no texts, examples
  or categories. They got main's, for the settings they have.

`tools/check_schemas.js` reports the union-type changes as drift from
Firefox's schemas. That's expected.

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

- The ESR schemas use main's examples, of which 35 use settings or values the
  branch doesn't have (see `tools/check_schemas.js`).
- 21 CCK2 equivalents are on settings without a docs section of their own,
  so they aren't shown.
- The compatibility shows no ESR backports older than ESR 115: the
  repository only has the branches esr115 and newer.
