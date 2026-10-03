# Tools

Helpers to maintain the inputs and check the outputs of the generator in
`../generator/`. They are run by hand. The generator itself doesn't use them:
it reads the product's `overrides/` folder as it is and only generates.

The tools use the modules and the dependencies of the generator, so run
`npm install` in `../generator/` first. All tools take the product folder
(`--product-config=<folder>`, required), and `sync_overlays.js` and
`check_overlays.js` the branches (`--branches=<list>`, required) and the same
source option as the generator (`--checkout=<path>` for a local checkout of
the product's repository, for Thunderbird its `comm/` checkout, by default
GitHub). They can be run from any folder.

| Tool | What it does | Writes |
|---|---|---|
| `sync_overlays.js` | Derives the schema overlays (`overrides/<branch>.schema.json`) of the given branches from main, then checks them | `overrides/*.schema.json` |
| `check_overlays.js` | Checks the documentation of the given branches, exits with code 1 on problems | nothing |
| `validate_templates.js` | Validates generated ADMX/ADML files (the given folders, or all branches of a docs folder with `--output`) | nothing |

## The schema overlays

Every branch is documented from its own policy schema. The schemas of beta,
release and the ESR branches don't have the texts, examples and hints of main
yet, so `<branch>.schema.json` in the product's `overrides/` folder adds them
(see `loadBranch()` in `generator/modules/branches.mjs`).

The overlays are derived from main: every setting which the branch has too
gets main's `title`, `description`, `x-help` (Fluent messages as plain
English), `examples`, `x-examples-gpo`, `x-formats`, `x-expand-env-vars` and
`x-deprecated`, and the texts of the values the branch has. Other keywords of
an overlay (e.g. `contentMediaType`) are kept.

Where a branch behaves differently from main, main's text would be wrong
there. Such a setting keeps its own texts in the overlay and states why:

```json
"install_url": {
  "description": "… It is required for these modes. Without it, this extension and the ones which follow it in this policy are neither installed nor removed.",
  "x-differs-from-main": "On this branch a missing install_url stops the policy. Main installs from update_url or addons.thunderbird.net instead (Bug 2062510, Bug 2068266)."
}
```

`x-differs-from-main` only exists in the overlays. It covers the setting's own
fields and the texts of its values, not its settings. Each exception is a
fact about the branch's code, so check it against the code (and give the bug
number), never use it for wording preferences. If a fix is uplifted, remove
the exception and run `sync_overlays.js` again: the check can't notice it.

### When to run

- After changes to main's schema texts, examples or hints:
  `node sync_overlays.js --product-config=../products/thunderbird
  --branches=beta,release,esr153,esr140,esr128,esr115 --checkout=<path>`, then
  review the diff of `overrides/` and regenerate the docs.
- Before committing changes to `overrides/`: `node check_overlays.js
  --product-config=../products/thunderbird
  --branches=main,beta,release,esr153,esr140,esr128,esr115 --checkout=<path>`.
- To validate the templates of a docs folder: `node validate_templates.js
  --product-config=../products/thunderbird --output=../docs`.

### What the checks report

- A documentation field which differs from main on a setting without
  `x-differs-from-main`, and an `x-differs-from-main` on a setting which
  doesn't differ.
- The rules of the policy schema, the same as comm's
  `test_policy_documentation.js` (which only checks main): hand-written
  examples exactly where they can't be generated, a `description` on every
  setting which groups other settings and on every setting inside a JSON
  value, `x-formats` only on policies.
- Examples which use a setting or a value the branch doesn't have.

`x-preferences-affected` and `x-cck2-equivalent` are not derived from main:
they are facts about each branch's code, so each overlay keeps its own values.
Check them against the branch's code by hand.

## Tests

```bash
npm test
```
