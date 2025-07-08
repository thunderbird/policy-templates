# Thunderbird Enterprise Policy Documentation Generator

This project automates the generation of Thunderbird’s enterprise policy
documentation. It also monitors changes in Mozilla’s upstream policy templates
and can create GitHub issues for any new or updated policies that may need to be
ported to Thunderbird.

The **generated** end-user documentation is available here:
https://thunderbird.github.io/policy-templates/

---

## 📋 Features

- **Documentation Generation**  
  Builds documentation (README, `plist` files and `admx` files) for different
  Thunderbird versions:
  - ESR (Extended Support Release)
  - Release
  - Daily

- **Change Detection**  
  Monitors Mozilla’s [`policy-templates`](https://github.com/mozilla/policy-templates)
  repository and detects:
  - New or removed policies
  - Changed policy attributes
  - Documentation updates

- **GitHub Integration**  
  Automatically generates GitHub issues for policy changes that need to be
  reviewed or ported to Thunderbird (when run via a GitHub Action).

---

├── config/                # YAML config files for the policy documentation per
│                          # Thunderbird version (will be moved into comm-central soon).
├── docs/                  # The generated documentation. Can be used directly
│                          # as a GitHub Page.
├── upstream/              # Stores last-known upstream revision states, used to
│                          # identify changes since the last time the script run.
└── generator/             # Source folder for the generator script.

---

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

To execute the policy generation and update process:

```bash
node update_policy_templates.js
```

This script can also be integrated into a CI workflow, such as **GitHub Actions**,
to automate the generation and monitoring of policy templates.

---

## 🧠 Notes

- Policies defined in the YAML files that are **not supported** by Thunderbird
  are excluded from the generated outputs.
- The script only reports changes that occurred **since the last known revision**.
  Revision state is stored in the `upstream/` directory.
- YAML config files follow a **defined schema** for policy metadata. Refer to the
  format guide at the top of each YAML file for details.

---

## License

This project is licensed under the terms of the [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/).