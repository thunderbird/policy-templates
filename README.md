# Thunderbird Enterprise Policy Documentation Generator

This project automates the generation of Thunderbird’s enterprise policy
documentation. The generator itself knows no product: everything specific to
Thunderbird is in its product folder (`products/thunderbird/`), given with
`--product-config`, so the same generator can build the documentation of other
products.

The **generated** end-user documentation is available here:
https://thunderbird.github.io/policy-templates/

## 📋 Features

- **Documentation Generation**  
  Builds documentation (`README`, `PLIST` and `ADMX`/`ADML` files) for the
  branches of the [Thunderbird repository](https://github.com/thunderbird/thunderbird-desktop):
  - ESR (Extended Support Release, `esr140`, `esr153`, …)
  - Release (`release`)
  - Beta (`beta`)
  - Daily (`main`)

  Each output of a branch has its own tool, as their inputs differ:

  | Tool | Output (in the `--output` folder) | Inputs |
  |---|---|---|
  | `generate_docs.js` | `policies/<branch>/README.md` | policy schema, Fluent files |
  | `generate_admx.js` | `policies/<branch>/admx/` (ADMX/ADML) | policy schema, Fluent files |
  | `generate_plist.js` | `policies/<branch>/plist/` (plist) | policy schema |

  The wrapper `update_all_policy_templates.js` runs all three for each branch
  of the product's repository (see below), and adds the overview (`README.md`: the list of the branches and
  main's compatibility table).

  The policy schema of a branch (the override in the product folder, see
  below) holds all the documentation of each policy: its texts, examples, the
  preferences it affects and its CCK2 equivalent. The history of the schema
  in the product's repository determines in which version each policy became
  supported: the version of the release branch (or of the branch itself, if
  the policy is not yet released), plus the ESR version if the policy was
  backported to an ESR branch. The examples of all formats (`policies.json`,
  Windows GPO, macOS plist) come from the same examples, hand-written or
  generated from the schema (see the notes below).

  The Thunderbird ADMX template is placed in the "Mozilla" category, which is
  defined by Mozilla's `mozilla.admx`. Its latest version (and the matching
  `en-US/mozilla.adml`) is downloaded from
  [mozilla/policy-templates](https://github.com/mozilla/policy-templates) and
  shipped unchanged next to the Thunderbird template. Admins need both
  `thunderbird.admx` and `mozilla.admx`.

## 📁 Project Structure

```
├── docs/                  # The generated documentation. Can be used directly
│                          # as a GitHub Page.
├── generator/             # Source folder for the generator scripts.
│   └── schemas/admx/      # Microsoft's XML schemas of ADMX/ADML files, used to
│                          # validate the generated templates.
├── products/thunderbird/  # Everything specific to Thunderbird (--product-config):
│   ├── product.yaml       # Its identity: where its sources are (repository,
│   │                      # policy schema, version, Fluent files), the
│   │                      # labels of the channels, the ADMX registry key and
│   │                      # namespace, the plist domain, the links, and
│   │                      # where its localized Fluent files are (l10n). The
│   │                      # ADMX file name and prefix are the folder's name.
│   ├── overrides/         # Per branch: <branch>.schema.json, the full policy
│   │                      # schema of the branch, which the generator uses
│   │                      # instead of the schema of the product's repository.
│   ├── templates/         # The frame texts of the docs: overview.md (the
│   │                      # overview) and branch.md (the page of a branch).
│   ├── extensions/        # JavaScript called by the templates (see below),
│   │                      # e.g. compatibility_table.mjs, the overview's
│   │                      # compatibility table.
│   └── site/              # Files copied unchanged into the docs (e.g. the
│                          # site stylesheet).
└── tools/                 # Helpers to maintain the overrides and check the
                           # outputs, run by hand (see its README).
```

The names of the product come from its `brand.ftl` (`-brand-short-name`,
`-brand-full-name`): the name of a branch is the short brand name, the label of
its channel and its version (e.g. "Thunderbird ESR 140.17.0"). The templates in
`templates/` have placeholders: `__branches__` and `__compatibility__` in
`overview.md`, and `__name__`, `__branch__`, `__docs_url__`,
`__templates_repository__`, `__list_of_policies__` and `__details__` in
`branch.md`. Parts of a template can depend on the kind of the branch, with
a subset of Mozilla's build preprocessor (the `%` marker, as in comm's CSS
files): `%ifdef NAME`, `%ifndef NAME`, `%else` and `%endif`, each on a line of
its own, which is removed. A branch defines its kind: `MAIN`, `BETA`,
`RELEASE` or `ESR`. Other names and directives are errors. For example, the
warning on the page of main:

```
%ifdef MAIN
**These policies are in active development and might contain changes that do
not work with current release or ESR versions of Thunderbird.**

%endif
```

### Extensions

Anything specific to a product which the generator doesn't know is an
extension in the product's `extensions/` folder. A template calls it with
`__js:<name>__`: the generator calls the default export of
`extensions/<name>.mjs` with a context, and inserts the returned Markdown as
it is. The context is a fixed set of plain, frozen data (see
`generator/modules/extensions.mjs`):

- `product`: the name of the product folder, e.g. `"thunderbird"`;
- `branch`: the branch being rendered (`"main"` for the overview);
- `branches`: all branches of the run as `{ branch, name, version, docsUrl }`;
- `schema(locale = "en-US")`: the product's policy schema of the branch, with
  the Fluent references in its texts replaced by their texts in the given
  locale.
  Other locales are the translations the branch ships: read from the
  product's l10n repository at the commit which the branch pins for the
  locale (`l10n.changesets` in `product.yaml`, e.g.
  `mail/locales/l10n-changesets.json`), with the English texts as fallback.
  The locales of that file are the available ones. Texts which the schema
  holds as plain English stay English;
- `compatibility`: the product's own compatibility as
  `{ name, first, last }` per policy and setting;
- `cachedFetch(url)`: the content of a URL through the download cache. Every
  call asks the server whether the content changed (ETag / Last-Modified),
  and the cached content is used if not, or if the server can't be reached.

A product can build the overview's compatibility table with an extension,
e.g. with further columns (see Thunderbird's `compatibility_table`). Without
such an extension, `__compatibility__` gives the table of the product's own
compatibility.

## 🛠️ Setup & Usage

### 📦 Requirements

- Node.js **22+**
- `git`, when reading from local checkouts

### 🚀 Installation

Before running the script, install the required Node.js dependencies:

```bash
cd generator
npm install
```

### ▶️ Run the Script

All tools take the product folder (`--product-config=<folder>`) and the docs
folder to write to (`--output=<folder>`), each single tool also one branch
(`--branch=<name>`). All are required. The wrapper builds all branches of the
product's repository: `main`, `beta`, `release` and the ESR branches from
`OLDEST_ESR` (in `generator/modules/constants.mjs`) on. Old ESR branches stay
in the repository after their end of life, so raise the constant then. To
generate all outputs (Markdown docs, Windows and macOS templates, the
overview):

```bash
node update_all_policy_templates.js --product-config=../products/thunderbird --output=../docs --checkout=/path/to/comm
```

It builds everything in a temporary folder next to the target (`docs.temp/`)
first. Only if the whole run succeeded, it replaces the **whole** target,
which then has exactly these branches, the overview (which lists them) and
the files of the product's `site/` folder. A failed run leaves the target as it was.

To generate a single output of one branch, use its tool (`generate_docs.js`,
`generate_admx.js` or `generate_plist.js`). These tools replace their part in
the target without protection:

```bash
node generate_admx.js --product-config=../products/thunderbird --output=../docs --branch=esr140
```

By default, the product's files are read from GitHub (`source.repository`
in `product.yaml`), and downloaded files are cached in
`generator/download_cache.json`. To read from a local checkout of the
product's repository instead, e.g. to generate the documentation for local
changes, use `--checkout=<path>` (for Thunderbird, the `comm/` checkout).
The branch `main` is then
the working tree of the checkout: whatever is checked out, including
uncommitted changes. For the other branches, the local branch is used if it
exists, otherwise `origin/<branch>`.

Reading from GitHub uses the GitHub API for the branches and the history of
the schema. Without a token, GitHub allows 60 requests per hour, a run needs
about 10. To raise the limit, set `GITHUB_TOKEN` to a token: a fine-grained
personal access token with read-only access to public repositories and no
permissions is enough. For example, with the token in a file only you can
read:

```bash
GITHUB_TOKEN=$(cat ~/.config/github-readonly-token) node update_all_policy_templates.js …
```

### 📄 The policy schemas

The policy schema of a product lives in its repository (for Thunderbird,
comm). The product folder overrides it: every branch has a full schema in
`overrides/<branch>.schema.json`, with its structure (policies, settings,
types, values) and its documentation (texts, examples, hints), which the
generator uses instead of the schema of the product's repository. So the
generator can work with any schema, independent of the repository's state.
A branch without an override is an error. Texts may reference Fluent
messages and terms (e.g. `"{ policy-Proxy }"`, `"{ -brand-short-name }"`),
resolved with the Fluent files of the branch in the product's repository
(`source.fluent`). Where a branch
behaves differently from main, its schema says why in a `$comment`.

The product's repository still gives the version of each branch, its Fluent
files and its compatibility data (from the history of its schema,
`source.schema`). [`tools/check_schemas.js`](tools/README.md) checks the
schemas of the product folder against the rules of the documentation.

### 🔄 Automatic updates

The workflow `.github/workflows/update-docs.yml` regenerates the docs every
day at 04:00 UTC, reading the products from GitHub, and commits `docs/` if it
changed. It builds all branches of each product, from `OLDEST_ESR` on.

It can also be started by hand (Actions › Update the docs › Run workflow).
With "publish" off, it doesn't commit, but uploads the generated `docs/` as an
artifact, e.g. to check the result first.

The workflow uses the token GitHub issues for each run (no personal token),
which needs to be allowed to write to the repository: the organisation's
Actions settings must allow `contents: write` for workflows. GitHub disables
scheduled workflows after 60 days without activity in the repository, so the
workflow enables itself again at the end of every run.

### ✅ Validation

Every generated ADMX/ADML template is validated right after it is written:
against the official schemas of Microsoft (`generator/schemas/admx/`, see its
README), and by checking the references between the ADMX and the ADML file
(strings, presentations, categories, supportedOn definitions). A run with
invalid templates fails. The wrapper builds into a temporary folder, so then
the previous docs are kept. The single tools replace their part without that
protection.

To validate existing templates (e.g. all branches of a docs folder), use
`tools/validate_templates.js` (see [`tools/`](tools/README.md)).

To run the tests of the generator (the validation included), in
`generator/`:

```bash
npm test
```

## 🧠 Notes

- The texts follow one rule (see the format specification linked below):
  `title` is the name (without it, the raw name is shown), `description`
  what it does, `x-help` additional details, printed after the description;
  no field stands in for another. The docs take their texts and examples from
  the **policy schema**, like the ADMX template (see below): every policy has
  a section, and so has every setting with an `x-help` of its own (e.g.
  `SearchEngines_Add`, `SecurityDevices_[name]` for the settings with open
  names). Its line in the table of contents shows the `description`, its
  heading the name followed by the `title` (if it adds to the name, not only
  repeating it, and the anchor stays the one of the name), its text the
  `description` followed by the `x-help`, then its settings which have no
  section of their own, as blocks following the nesting of the schema (also
  inside JSON values): each with its type (including its values), its title
  (if it adds to the name), its `description` and its own settings as a
  nested list. The ADMX template lists the fields of a
  JSON value in its help text the same way. The examples are generated from
  the schema: booleans `true`, a choice its first value, objects and lists
  from their settings. Hand-written `examples`
  are only needed on free-text strings (or lists of them) and on the shallowest
  setting with open names (whose examples cover the settings below it), with
  `x-examples-gpo` for the Windows values (e.g. paths). A missing string
  example shows as `<a string value>`. The settings of a section are listed
  under "Settings", with their types and values. A pattern of fixed
  alternatives (e.g. `^(mimeTypes|extensions|schemes)$` in `Handlers`) is one
  setting in the Settings, but one entry per name in the compatibility
  information, so a name added later gets its own version. The site stylesheet
  (`site/assets/css/settings.css` of the product) shows the descriptions in the Settings as an
  indented block. A section also shows the `x-preferences-affected` and the
  `x-cck2-equivalent` of its node, as they are (a string or a list of
  strings). Refer to the
  [format specification](https://github.com/thunderbird/thunderbird-desktop/blob/main/mail/components/enterprisepolicies/documentation/README.md)
  for details.
- The ADMX template is generated from the **policy schema** of the branch
  (its override): every setting of the schema becomes part of the template.
  Only the versions (`supportedOn`) come from the compatibility data. Its
  `title` names the ADMX policy (else its raw name) and labels its control
  where `ADMX_TITLE_LABELS` says so (see below), its `description` followed by
  its `x-help` is the help text (a setting without both takes them from the
  nearest setting above it), the `title`
  of the choices of `oneOf` names the items of dropdowns, `x-deprecated` marks
  deprecated settings, and `x-expand-env-vars: true` marks values in which
  Windows expands environment variables (`REG_EXPAND_SZ`). Their help text says
  so in the ADMX template, and the Markdown docs note that this only works via
  Group Policy. Each text field is English, and may reference Fluent
  messages and terms as Fluent writes them: `{ policy-Proxy }` for a message,
  `{ -brand-short-name }` for a term, with one space inside each brace. They
  are resolved with the Fluent files of the branch (see `source.fluent` in
  `product.yaml`), and an unknown reference is an error. Braces without these
  spaces (e.g. `{searchTerms}`) are plain text. Policies whose `x-formats` don't include `gpo`
  are left out.
- Folders (categories) of the ADMX template: they follow the shape of the
  schema. The ADMX policies of a policy with several settings sit in a folder
  of the policy (e.g. `Proxy`), nested for deeper settings (e.g.
  `Permissions` › `Permissions_Camera`), and the slots of a list of objects in
  a folder of the list. A policy with a single ADMX policy sits directly in
  the product's folder (`thunderbird`). The id of a folder is its setting
  path, which is part of the OMA-URIs of its policies (Intune), so a folder
  only changes when the shape of a policy changes. `x-category` is only the
  category of the docs, as in Firefox's schema.
- Names of the folders: the `title` of the policy or setting, else its name.
  To translate a folder, let its title reference a Fluent message
  (`"title": "{ policy-Proxy-title }"`), like any other title. A new text
  gets a new Fluent ID, while the id of the folder stays.
- Labels of the ADMX controls (a design decision, switched with
  `ADMX_TITLE_LABELS` in `generator/modules/constants.mjs`): a list box and a
  control in a group (several settings in one ADMX policy, e.g. the
  Authentication checkboxes or the search engine slots) show the `title` of
  their setting. A list box is edited in a dialog of its own, which doesn't
  show the name of the policy, and in a group the policy name only names the
  group. The only control of an ADMX policy (e.g. `HTTPProxy`, `Mode`) shows
  the name of its setting instead: its title is already the name of the
  policy right above it, and the name matches the docs and `policies.json`.
  Without a `title`, every control shows the name.
- A JSON value (e.g. `ExtensionSettings`) is a multi-line box in the ADMX
  template, with the label of its control (see above) as a line of text above
  it (such a box has no label of its own) and a height of
  `ADMX_JSON_BOX_HEIGHT` lines. Where the policy engine of the branch parses
  a JSON text, it also gets a one-line text box (`<name>OneLine`), for tools
  which can't write multi-line values, such as Intune.
- The macOS template (plist) is generated from the **policy schema** of the
  branch: every supported policy with the format `plist` (see `x-formats`),
  with its example (the first hand-written one, else generated from the
  schema).

## License

This project is licensed under the terms of the [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/).
