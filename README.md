# Thunderbird Enterprise Policy Documentation Generator

This project automates the generation of Thunderbird’s enterprise policy
documentation.

The monitoring of Mozilla’s upstream policies lives in the [`monitor/`](monitor/)
folder.

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

  The documentation is based on the branch’s `policies.yaml` file and its policy
  schema. The history of the schema determines in which version each policy
  became supported: the version of the release branch (or of the branch itself,
  if the policy is not yet released), plus the ESR version if the policy was
  backported to an ESR branch.

## 📁 Project Structure

```
├── config/                # YAML config files for the policy documentation, to be
│                          # used with --policies-yaml until the in-tree
│                          # policies.yaml files include all their changes.
├── docs/                  # The generated documentation. Can be used directly
│                          # as a GitHub Page.
├── generator/             # Source folder for the generator script.
└── monitor/               # Monitor for Mozilla's upstream policies.
```

## 🛠️ Setup & Usage

### 📦 Requirements

- Node.js **20+**
- `git`, when reading from local checkouts

### 🚀 Installation

Before running the script, install the required Node.js dependencies:

```bash
cd generator
npm install
```

### ▶️ Run the Script

To generate the documentation for a single branch:

```bash
node update_policy_templates.js --branch=esr140
```

To generate the documentation for all current branches (`main`, `beta`,
`release` and all ESR branches starting with ESR 115, see `MIN_ESR`):

```bash
node update_all_policy_templates.js
```

The `POLICIES_YAML_OVERRIDES` map in `update_all_policy_templates.js` defines
which branches use a file from `config/` instead of their `policies.yaml` file.

By default, the files are read from GitHub, and downloaded files are cached in
`persistent_schema_cache.json`. To read from local checkouts instead, use
`--local=<path>` (a Firefox checkout with a Thunderbird checkout in its `comm/`
folder), or `--local-tb=<path>` and `--local-ff=<path>`. For each branch, the
local branch is used if it exists, otherwise `origin/<branch>`. Only committed
changes are used.

To use a different YAML file instead of the branch’s `policies.yaml` file (for
example one of the files in `config/`):

```bash
node update_policy_templates.js --branch=main --policies-yaml=../config/central.yaml
```

## 🧠 Notes

- Policies defined in the YAML files that are **not supported** by Thunderbird
  are excluded from the generated outputs.
- YAML files follow a **defined schema** for policy metadata. Refer to the
  [format specification](https://github.com/thunderbird/thunderbird-desktop/blob/main/mail/components/enterprisepolicies/documentation/README.md)
  for details.

## License

This project is licensed under the terms of the [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/).
