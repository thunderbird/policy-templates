#!/usr/bin/env python3
"""
Import what Mozilla's rendered policy documentation (docs/index.md of
mozilla/policy-templates) has beyond Firefox's schema into the overlays:

- "x-help": the prose of a section after its first paragraph, which is the
  description (the schema has it). Tables and code blocks are left out: the
  help texts are also the plain-text help of the ADMX template.
- "x-cck2-equivalent" and "x-preferences-affected": as the docs give them (a
  list of names in backticks, or a text like "Many"); "N/A" is left out.

A section "Policy | Setting" goes to the setting. The texts go into main's
overlay; tools/sync_overlays.js derives the x-help of the other branches from
it. The two fields are not derived, so they go into the overlay of every
branch which has the policy or setting.

    python3 import_docs.py <docs/index.md> <main schema> <branch>=<schema> ...
"""

import difflib
import json
import os
import re
import sys

OVERRIDES = os.path.join(os.path.dirname(__file__), "..", "overrides")


def parse_sections(text):
    sections = {}
    for block in re.split(r"^### ", text, flags=re.M)[1:]:
        heading, _, body = block.partition("\n")
        heading = re.sub(r"\s*\((Deprecated|Selective)\)$", "", heading.strip())
        if re.search(r"\(All\)$", heading):
            continue  # the boolean form of SanitizeOnShutdown, see fix_unions.py
        path = [part.strip() for part in heading.split("|")]
        body = body.split("\n#### ")[0]
        prose, _, fields = body.partition("**Compatibility:**")
        if not fields:
            prose, _, fields = body.partition("**CCK2 Equivalent:**")
            fields = "**CCK2 Equivalent:**" + fields
        sections[tuple(path)] = {"prose": prose, "fields": fields}
    return sections


def paragraphs(prose):
    """The plain paragraphs, without tables, code blocks and notes boxes."""
    result, in_code = [], False
    for para in re.split(r"\n\s*\n", prose.strip()):
        lines = para.strip().split("\n")
        if any(line.strip().startswith("```") for line in lines):
            in_code = not in_code if sum(l.strip().startswith("```") for l in lines) % 2 else in_code
            continue
        if in_code or not para.strip():
            continue
        if any(line.strip().startswith("|") for line in lines):
            continue
        result.append("\n".join(line.rstrip() for line in lines))
    return result


def field(fields, name):
    match = re.search(rf"\*\*{name}:\*\*\s*(.*?)\\?\s*$", fields, flags=re.M)
    if not match:
        return None
    value = match.group(1).strip().rstrip("\\").strip()
    if not value or value.upper().startswith("N/A"):
        return None
    names = re.findall(r"`([^`]+)`", value)
    return names if names else value


def node_at(schema, path):
    node = schema["properties"].get(path[0])
    for name in path[1:]:
        node = (node or {}).get("properties", {}).get(name)
    return node


def target_at(overlay, path):
    target = overlay.setdefault("properties", {}).setdefault(path[0], {})
    for name in path[1:]:
        target = target.setdefault("properties", {}).setdefault(name, {})
    return target


def norm(text):
    return re.sub(r"[*`.']", "", text or "").strip().lower()


def help_paragraphs(paras, description):
    """The paragraphs which add to the description. The first paragraph is
    usually the description: the same, reworded, or followed by more
    sentences, which are kept. A first paragraph about something else is
    kept as a whole."""
    first, rest = paras[0], paras[1:]
    sentences = re.split(r"(?<=[.!?])\s+", first, maxsplit=1)
    similar = difflib.SequenceMatcher(None, norm(sentences[0]), norm(description)).ratio() > 0.75
    if not similar:
        return paras, False
    if len(sentences) > 1:
        return [sentences[1]] + rest, True
    return rest, True


def main():
    docs, main_schema_path, *branches = sys.argv[1:]
    sections = parse_sections(open(docs).read())
    main_schema = json.load(open(main_schema_path))
    schemas = {"main": main_schema}
    for arg in branches:
        branch, path = arg.split("=", 1)
        schemas[branch] = json.load(open(path))
    overlays = {b: json.load(open(os.path.join(OVERRIDES, f"{b}.schema.json"))) for b in schemas}

    stats = {"help": 0, "differs": [], "unknown": [], "cck2": 0, "prefs": 0}
    for path, section in sections.items():
        node = node_at(main_schema, path)
        if node is None:
            stats["unknown"].append(" | ".join(path))
            continue
        paras = paragraphs(section["prose"])
        target = target_at(overlays["main"], path)
        description = node.get("description")
        if paras:
            if description is None:
                # A setting without description: the first paragraph is it.
                target["description"] = paras[0]
                help = paras[1:]
            else:
                help, matched = help_paragraphs(paras, description)
                if not matched:
                    stats["differs"].append(" | ".join(path))
            if help:
                target["x-help"] = "\n\n".join(help)
                stats["help"] += 1
        for key, name in [("x-cck2-equivalent", "CCK2 Equivalent"), ("x-preferences-affected", "Preferences Affected")]:
            value = field(section["fields"], name)
            if value is None:
                continue
            stats["cck2" if "cck2" in key else "prefs"] += 1
            for branch, schema in schemas.items():
                if node_at(schema, path) is not None:
                    target_at(overlays[branch], path)[key] = value

    for branch, overlay in overlays.items():
        path = os.path.join(OVERRIDES, f"{branch}.schema.json")
        json.dump(overlay, open(path, "w"), indent=2)
        open(path, "a").write("\n")
    print(f"x-help: {stats['help']}, CCK2: {stats['cck2']}, preferences: {stats['prefs']}")
    print(f"first paragraph kept, it is not the description ({len(stats['differs'])}):", ", ".join(stats["differs"]))
    print(f"sections without a node in main's schema ({len(stats['unknown'])}):", ", ".join(stats["unknown"]))


main()
