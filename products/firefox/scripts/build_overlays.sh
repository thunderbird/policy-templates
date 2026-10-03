#!/bin/sh
# Build the overlays of Firefox (overrides/*.schema.json) from its schemas on
# GitHub and Mozilla's rendered policy documentation:
#   1. main: the single form of the union-type policies (fix_unions.py), and
#      what the docs have beyond the schema (import_docs.py);
#   2. the other branches: derived from main by tools/sync_overlays.js, then
#      the same two steps for their own schemas.
# Usage: scripts/build_overlays.sh <work folder for the downloads>
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
PRODUCT=$(dirname "$HERE")
REPO=$(dirname "$(dirname "$PRODUCT")")
WORK=${1:?work folder}
BRANCHES="beta release esr153 esr140 esr128 esr115"
RAW=https://raw.githubusercontent.com

mkdir -p "$WORK"
for b in main $BRANCHES; do
    curl -sf -o "$WORK/schema-$b.json" "$RAW/mozilla-firefox/firefox/$b/browser/components/enterprisepolicies/schemas/policies-schema.json"
done
curl -sf -o "$WORK/docs.md" "$RAW/mozilla/policy-templates/master/docs/index.md"

PAIRS=""
for b in $BRANCHES; do PAIRS="$PAIRS $b=$WORK/schema-$b.json"; done

echo '{}' > "$PRODUCT/overrides/main.schema.json"
python3 "$HERE/fix_unions.py" "$WORK/schema-main.json" "main=$WORK/schema-main.json"
python3 "$HERE/import_docs.py" "$WORK/docs.md" "$WORK/schema-main.json"

for b in $BRANCHES; do echo '{}' > "$PRODUCT/overrides/$b.schema.json"; done
node "$REPO/tools/sync_overlays.js" --product-config="$PRODUCT" --branches="$(echo $BRANCHES | tr ' ' ,)" > "$WORK/sync.log" 2>&1 || { tail -20 "$WORK/sync.log"; exit 1; }
python3 "$HERE/fix_unions.py" "$WORK/schema-main.json" $PAIRS
# Only the CCK2 equivalents and preferences of the branches (main's overlay
# already has them); import_docs.py writes main's texts again unchanged.
python3 "$HERE/import_docs.py" "$WORK/docs.md" "$WORK/schema-main.json" $PAIRS
