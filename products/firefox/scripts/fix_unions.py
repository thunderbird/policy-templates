#!/usr/bin/env python3
"""
Give the policies whose schema allows several forms one form for the
templates, in the overlay of each branch: the generator handles neither
"anyOf" nor a type list which mixes simple and structured values.

- boolean or object (e.g. SanitizeOnShutdown): the object, whose settings
  include what the boolean does; only the object examples are kept.
- boolean or string with choices (DisplayMenuBar, DisplayBookmarksToolbar,
  "anyOf" or a type list): the string choice, which the boolean predates; the
  choices get main's titles and descriptions.
- a type list with the old "JSON" type (e.g. ["object", "JSON"] for
  ExtensionSettings on older ESRs): the other type, with
  "contentMediaType": "application/json", as newer schemas write it, so the
  value is one JSON text.

Run after tools/sync_overlays.js (which doesn't touch these fields):
    python3 fix_unions.py <main schema> <branch>=<branch schema> ...
The overlays are products/firefox/overrides/<branch>.schema.json.
"""

import json
import os
import sys

OVERRIDES = os.path.join(os.path.dirname(__file__), "..", "overrides")


def string_choices(node):
    """The string choices of a policy, from anyOf, a type list or itself."""
    for variant in node.get("anyOf", [node]):
        if "oneOf" in variant:
            return [choice["const"] for choice in variant["oneOf"]], variant["oneOf"]
        if "enum" in variant:
            return variant["enum"], None
    return None, None


def fix_json(node, target):
    """Translate the old "JSON" type in a type list, at any depth."""
    types = node.get("type")
    if isinstance(types, list) and "JSON" in types:
        rest = [t for t in types if t != "JSON"]
        target["type"] = rest[0] if len(rest) == 1 else rest
        target["contentMediaType"] = "application/json"
    for key in ("properties", "patternProperties"):
        for name, child in node.get(key, {}).items():
            sub = target.setdefault(key, {}).setdefault(name, {})
            fix_json(child, sub)
            if not sub:
                del target[key][name]
        if key in target and not target[key]:
            del target[key]


def fix(branch, schema, main):
    path = os.path.join(OVERRIDES, f"{branch}.schema.json")
    overlay = json.load(open(path))
    props = overlay.setdefault("properties", {})
    for name, node in schema["properties"].items():
        target = props.setdefault(name, {})
        fix_json(node, target)
        if not target:
            del props[name]
    for name, node in schema["properties"].items():
        types = node.get("type")
        target = props.setdefault(name, {})
        if isinstance(types, list) and "object" in types and "boolean" in types:
            target["type"] = "object"
            examples = target.get("examples", node.get("examples"))
            if examples:
                target["examples"] = [e for e in examples if isinstance(e, dict)][:1]
        elif "anyOf" in node or (isinstance(types, list) and set(types) == {"boolean", "string"}):
            values, _ = string_choices(node)
            if values is None:
                continue
            _, main_choices = string_choices(main["properties"].get(name, {}))
            texts = {c["const"]: c for c in main_choices or []}
            if "anyOf" in node:
                target["anyOf"] = None
            target["type"] = "string"
            target["enum"] = None if "enum" in node else target.get("enum")
            if target["enum"] is None and "enum" not in node:
                del target["enum"]
            target["oneOf"] = [texts.get(v, {"const": v}) for v in values]
            examples = target.get("examples", node.get("examples"))
            if examples:
                target["examples"] = [e for e in examples if isinstance(e, str)][:1] or [values[0]]
        if not target:
            del props[name]
    json.dump(overlay, open(path, "w"), indent=2)
    open(path, "a").write("\n")


main = json.load(open(sys.argv[1]))
for arg in sys.argv[2:]:
    branch, schema_path = arg.split("=", 1)
    fix(branch, json.load(open(schema_path)), main)
    print("fixed", branch)
