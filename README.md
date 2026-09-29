# Thunderbird Enterprise Policy Documentation Generator

This project automates the generation of Thunderbird’s enterprise policy
documentation.

The monitoring of Mozilla’s upstream policies lives in the [`monitor/`](monitor/)
folder.

The **generated** end-user documentation is available here:
https://thunderbird.github.io/policy-templates/

## 📋 Features

- **Documentation Generation**  
  Builds documentation (`README` files and `PLIST` files, not yet `ADMX` files) for different
  Thunderbird versions:
  - ESR (Extended Support Release)
  - Release
  - Daily

## 📁 Project Structure

```
├── config/                # YAML config files for the policy documentation per
│                          # Thunderbird version (will be moved into comm-central soon).
├── docs/                  # The generated documentation. Can be used directly
│                          # as a GitHub Page.
├── generator/             # Source folder for the generator script.
└── monitor/               # Monitor for Mozilla's upstream policies.
```

## 🛠️ Setup & Usage

### 📦 Requirements

- Node.js **18+**

### 🚀 Installation

Before running the script, install the required Node.js dependencies:

```bash
cd generator
npm install
```

### ▶️ Run the Script

To generate the documentation:

```bash
node update_policy_templates.js
```

## 🧠 Notes

- Policies defined in the YAML files that are **not supported** by Thunderbird
  are excluded from the generated outputs.
- YAML config files follow a **defined schema** for policy metadata. Refer to the
  format guide at the top of each [YAML file](https://github.com/thunderbird/policy-templates/blob/master/config/central.yaml)
  for details.

## License

This project is licensed under the terms of the [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/).
