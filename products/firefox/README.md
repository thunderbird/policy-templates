# Firefox (proof of concept)

A product folder for Firefox, to see whether the generator can produce
complete templates for another product. Its output is in `docs/firefox/`.

```sh
node generator/update_all_policy_templates.js --product-config=products/firefox \
    --output=docs/firefox
```

## How the schemas were made

The schemas in `overrides/` (the full policy schema of each branch) were built
once, from Firefox's schemas on GitHub (`mozilla-firefox/firefox`) and
Mozilla's rendered policy documentation (`docs/index.md` of
`mozilla/policy-templates`, which Mozilla has since replaced by
https://firefox-admin-docs.mozilla.org/). They are not maintained further.

- **Union types:** the policies with several forms keep them, as in
  Firefox's schemas (the generator gives them one ADMX policy per form, or
  one dropdown). `RequestedLocales` got an example of its string form.
- **Imported from the docs:** what they have beyond the schema: the help texts
  (`x-help`), the CCK2 equivalents and the preferences affected. Tables and
  code blocks of the docs were left out. The CCK2 equivalents of
  `SearchEngines.Default`, `.PreventInstalls` and `.Remove` are on the policy,
  since these settings have no docs section of their own.
- **Older branches:** the ESR schemas (153 and older) have no texts, examples
  or categories. They got main's, for the settings they have. Main's examples
  were reduced to the settings and values of each branch, and two colors of
  `Containers` which main no longer has got a title.
- **Categories:** Firefox's `x-category`, for the docs. The folders of the
  ADMX template follow the shape of the schema, like most of the folders of
  Mozilla's hand-made `firefox.admx` (e.g. `Permissions` › `Camera`). Its
  folders with names of their own (e.g. `Proxy Settings`) are named after
  the policy (`Proxy`).

## Results

- All six branches generate (main, beta, release and the ESR branches from
  `OLDEST_ESR` on). All ADMX templates are valid and complete: every policy
  of each branch's schema is in its ADMX template.
- Compared with Mozilla's own `firefox.admx` (main): it lacks 5 policies of
  the schema (`3rdparty`, `ClearOnShutdown`, `DisableAccounts`,
  `MicrosoftEntraSSO`, `RelaunchRequired`). Some policies are written
  differently in the two templates:
  - `Bookmarks`: 5 slots here, 50 in Mozilla's;
  - `Preferences`: one JSON value here, 51 preferences in Mozilla's;
  - `WebsiteFilter` and `Containers` are JSON values here;
  - `SitePolicies` and `ExemptDomainFileTypePairsFromFileTypeDownloadWarnings`
    are one JSON value for the whole list in both templates, as their entries
    hold lists and objects. Mozilla's adds a one-line variant of each.
  `FlashPlugin` is only in Mozilla's, it's no longer in the schema.

## Open points

- The compatibility shows no ESR backports older than the oldest ESR of the
  docs (`OLDEST_ESR` in `generator/modules/constants.mjs`).
