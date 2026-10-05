# Tools

Helpers to check the inputs and the outputs of the generator in
`../generator/`. They are run by hand, and change nothing. The generator
itself doesn't use them.

The tools use the modules and the dependencies of the generator, so run
`npm install` in `../generator/` first. All tools take the product folder
(`--product-config=<folder>`, required). `check_schemas.js` also takes the
branches (`--branches=<list>`, required) and the same source option as the
generator (`--checkout=<path>` for a local checkout of the product's
repository, for Thunderbird its `comm/` checkout, by default GitHub). They can
be run from any folder.

| Tool | What it does |
|---|---|
| `check_schemas.js` | Checks the product's policy schemas of the given branches: the drift from the product's repository and the rules of the documentation. Exits with code 1 on problems. |
| `validate_templates.js` | Validates generated ADMX/ADML files (the given folders, or all branches of a docs folder with `--output`). |

## The product's policy schemas

The product folder holds the full policy schema of every branch
(`overrides/<branch>.schema.json`), the authority for the docs and the
templates. The schema in the product's repository (e.g. comm) keeps changing,
and `check_schemas.js` reports what it has and the product's schema of the
branch doesn't (the drift):

- a policy, a setting or a definition which is missing;
- a key of a setting which is missing, e.g. a new `enum`, or a `description`
  that was added upstream;
- a different value of a key which defines what a setting accepts (`type`,
  `enum`, `pattern`, `$ref`, …), or a value of a choice (`oneOf` with `const`)
  which is missing.

Different texts, examples and hints are not drift: the product's schemas are
the authority for them. Where a product's schema differs on purpose (e.g.
Firefox's single form of its union types), the drift is reported each time.

Where a branch behaves differently from main, its schema keeps its own texts
and says why in a `$comment`, e.g.:

```json
"install_url": {
  "description": "… It is required for these modes. Without it, this extension and the ones which follow it in this policy are neither installed nor removed.",
  "$comment": "On this branch a missing install_url stops the policy. Main installs from update_url or addons.thunderbird.net instead (Bug 2062510, Bug 2068266)."
}
```

Such a difference is a fact about the branch's code, so check it against the
code (and give the bug number). If a fix is uplifted, update the branch's
schema and remove the `$comment`.

### What the documentation checks report

- The rules of the policy schema, the same as comm's
  `test_policy_documentation.js`: hand-written examples exactly where they
  can't be generated, a `description` on every setting which groups other
  settings, on every setting inside a JSON value and on every setting with an
  `x-help` (which must not repeat it), a title on every value of a choice,
  `x-formats` only on policies, an `x-category` on every policy.
- Of a setting with several forms (e.g. `RequestedLocales`, a string or a
  list), an example of each form which can't be generated. comm's test doesn't
  check the forms.
- `x-preferences-affected` and `x-cck2-equivalent` only on the nodes of docs
  sections, as a string or a list of strings.
- Examples which use a setting or a value the branch doesn't have.
- Policy and setting names (outside JSON values, of policies with the format
  `gpo`) with other characters than letters, digits and `_`: they become part
  of ADMX policy names, as in comm's test.

### When to run

- After changes to the product's schemas, and from time to time to notice
  changes in the product's repository:
  `node check_schemas.js --product-config=../products/thunderbird
  --branches=main,beta,release,esr153,esr140,esr128 --checkout=<path>`.
- To validate the templates of a docs folder: `node validate_templates.js
  --product-config=../products/thunderbird --output=../docs`.

## Tests

```bash
npm test
```
