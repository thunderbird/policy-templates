# How the history of the policy schema is read

The version in which a policy (or a setting) became available is the lowest
version of a revision of the product's policy schema which includes it. This
needs the **complete** history of the schema on each branch. This document
explains why plain `git log` (and the GitHub API) is not enough, how the
history is read instead, and how this relates to the
[webext-annotated-schemas-generator](https://github.com/thunderbird/webext-annotated-schemas-generator),
which solves the same problem for Thunderbird's WebExtension schemas.

## The problem: merge-day merges hide uplifts

A change lands on `main` (Daily/Nightly) and rides the train to `beta` and
`release`. It may also be uplifted to the beta or release line of an older
version. On merge day, the lines are joined by merges which take their whole
content from the newer line: "Merge main into beta", "Promote beta to
release", and, from the conversion of the mercurial history, "Merge old head
via hg debugsetparents". The older line is attached as second parent, it
contributes nothing to the content. Thunderbird and Firefox work the same
way.

`git log <branch> -- <file>` and the GitHub API (`/commits?path=`) follow
only one parent at a merge whose content equals that parent: the newer line.
The older line, with its uplifts and dot releases, is never visited.

Example from Thunderbird: `BackgroundAppUpdate` landed on `main` as
`8781847a5fa` (92.0a1) and was uplifted to the 91 line as `a70c5571935`
(91.0). The merge `649deed33b8` joined the 91 line into the 92 line. Plain
`git log release -- policies-schema.json` only finds `8781847a5fa`, so the
docs showed 92.0, although the policy shipped in 91.0. Before this was fixed,
37 Thunderbird entries per branch and 95 to 128 Firefox entries per branch
(e.g. 61.0 instead of 60.0, 150.0 instead of 149.0.2) were one version too
late.

## The concept: side parents and the union of plain histories

The lines merged in this way are not part of `main`. Their heads are the
parents (besides the first) of the merges on the branch which are not part of
`main`: the **side parents** (`getSideParents()` in
[generator/modules/common/side_parents.mjs](generator/modules/common/side_parents.mjs)). The
complete history of the schema is the **union of the plain histories** from
the branch and from each side parent. Merges whose content equals one of their
parents are not needed: they add no content of their own and never have a
lower version. Nothing depends on tag names, commit messages or the product.

## Shared with webext-annotated-schemas-generator, and where it differs

Both generators use the same concept and the same code. The `common` folder
(`generator/modules/common/` here, `modules/common/` in
webext-annotated-schemas-generator) holds the code shared between the two
repositories. There is no shared package: the copies are kept identical by
hand, check them with
`diff -r webext-annotated-schemas-generator/modules/common policy-templates/generator/modules/common`.

| file | contents |
|---|---|
| `side_parents.mjs` | `getSideParents()`, the concept above |
| `cached_clone.mjs` | what both kinds of clones share: open, check and update the cached clone, commit-graph, branches and refs, the starting points of a history, and the common interface `HistorySource` |
| `blobless_clone.mjs` | `BloblessClone`: histories and files read locally; `fetchSingleRevision()` for a single revision of a large repository |
| `treeless_clone.mjs` | `TreelessClone`: histories from the GitHub API, files downloaded; the cache and the download are passed in by the generator |

Both clones have the same interface (`HistorySource` in `cached_clone.mjs`),
so a generator switches from one to the other by changing only the call to
open the repository: `TreelessClone.open(url, dir, { cache, readUrl })` here
(`openProductRepository()` in `generator/modules/sources.mjs`),
`BloblessClone.open(url, dir)` in the other generator. The tests of the
shared code are here, `generator/test/common.test.mjs`, for both kinds of
clones (the other repository has no test framework).

The generators differ in where the commit graph and the plain histories come
from:

| | policy-templates | webext-annotated-schemas-generator |
|---|---|---|
| History needed of | one policy schema per product (Thunderbird and Firefox) | ~27 Thunderbird schema files |
| Local clone | **treeless** clone per product: commits only (`generator/git-cache/`) | **blobless** clone of thunderbird-desktop: commits and folders, files on demand |
| Side parents | local commit graph | local commit graph |
| Plain histories | GitHub API, one request per starting point, cached | local `git rev-list <branch and side parents> -- <file>` |
| File contents | downloads from raw.githubusercontent.com, cached | from the clone, fetched in one request |
| GitHub API requests | ~120 (Thunderbird) and ~600 (Firefox) on a cold cache, a few per run after that | none |
| Firefox | the history of the policy schema | a single revision; Firefox's `version_added` comes from browser-compat-data |

With `--checkout`, policy-templates reads a local checkout instead: the side
parents and the plain histories come from the checkout, like in the other
generator. The checkout needs the full history (a shallow clone is refused)
and a branch `main`.

## Blobless or treeless: the trade-off

- **Blobless** (commits and folders local, files on demand): the plain
  histories and the files are local, no API requests are needed. But the clone
  grows with the folders of the whole repository: about 175 MB for
  thunderbird-desktop, but several GB for mozilla-firefox, which would explode
  the cache.
- **Treeless** (commits only) plus the GitHub API: the clones stay small
  (thunderbird-desktop about 55 MB, mozilla-firefox about 380 MB, 437 MB
  together in the CI cache), but every plain history is an API request (about
  2.5 s each for mozilla-firefox), and file contents are downloads. That is
  fine for one file per product. For many files it would explode the
  requests: the other generator reads ~27 files, which would be ~3000 requests
  plus ~1500 downloads on a cold cache.

So the choice follows from which repository's history is needed, and for how
many files: policy-templates reads one file of each repository, including the
large one (treeless), the other generator reads many files of the small
repository (blobless).

The other generator needs no history of Firefox only because it takes the
`version_added` of Firefox APIs from browser-compat-data (BCD). If it ever
stopped using BCD, it would need Firefox's history as well, and would have to
read Firefox like policy-templates does (treeless clone plus GitHub API),
accepting the many API requests on a cold cache, because a blobless clone of
Firefox would explode the cache.

## The cache

- `generator/git-cache/`: the treeless clones, updated with `git fetch` on
  each run, cloned again if missing or invalid (broken, other origin, failed
  update). In CI one cache entry (`git-cache`), replaced on each run.
- `generator/download_cache.json`: the plain histories as links from each
  commit to the next one of the history (a history from a commit never
  changes, so a request stops at the first known commit), and the downloaded
  files. Written atomically, saved in CI also if a run fails (e.g. at the
  limit of the API), so the next run continues from there.
- Measured in CI: the first run (cold cache, both products) took 13 minutes,
  the next one about 1 minute (43 s for generating the docs).

## Versions of the revisions

The version of a revision is read from the product's version file at that
revision, and presented with `normalizeVersion()` and `addSupportedSince()`
([generator/modules/compatibility.mjs](generator/modules/compatibility.mjs)).
The other generator reads its version file the same way, with its own ESR
mapping.

## Robustness

Revisions which removed the schema, or whose schema can't be parsed, are
skipped (with a warning for the latter): they were never a valid schema. In
Firefox, an uplift of 2018 (`d2c220e4f6ad`) was committed with conflict
markers in the policy schema and fixed later; the complete history reaches
such revisions, plain `git log` did not.

## Verification

- Thunderbird: the histories from GitHub and from a full local checkout are
  identical, and include every change found by
  `git rev-list --full-history` (which needs all folders locally, so it is
  not an option for Firefox) on `release`, `beta` and `esr153`.
- Firefox: compared with the hand-maintained `x-compatibility` of Mozilla's
  policy schema, 117 of 127 policies match (85 with the plain history); the
  others differ because `x-compatibility` records when a policy became
  usable, not when it appeared in the schema (e.g. `SearchEngines`: in the
  schema since 60, usable outside ESR since 139).
- The docs generated in CI and locally are identical.
