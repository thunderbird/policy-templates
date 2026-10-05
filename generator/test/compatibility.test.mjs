import assert from "node:assert/strict";
import { test } from "node:test";

import { buildCompatibilityData, dropRemovedBefore, getCompatibilityInformation } from "../modules/compatibility.mjs";

test("settings with a name chosen by the admin are named [name]", () => {
    const revision = {
        version: "140.0",
        properties: {
            SecurityDevices: {
                type: "object",
                properties: {
                    Add: { type: "object", patternProperties: { "^.*$": { type: "string" } } },
                    Delete: { type: "array" },
                },
                patternProperties: { "^(?!Add$|Delete$).*$": { type: "string" } },
            },
            Handlers: {
                type: "object",
                patternProperties: { "^(mimeTypes|extensions|schemes)$": { type: "object" } },
            },
        },
    };
    assert.deepEqual(Object.keys(buildCompatibilityData([revision])), [
        "SecurityDevices",
        "SecurityDevices_Add",
        "SecurityDevices_Add_[name]",
        "SecurityDevices_Delete",
        "SecurityDevices_[name]",
        "Handlers",
        "Handlers_mimeTypes",
        "Handlers_extensions",
        "Handlers_schemes",
    ]);
});

test("a name added to a pattern of alternatives gets its own version", () => {
    const revision = (version, pattern) => ({
        version,
        properties: {
            Kinds: {
                type: "object",
                patternProperties: {
                    [pattern]: { type: "object", properties: { action: { type: "string" } } },
                },
            },
        },
    });
    // The schema history, newest first.
    const data = buildCompatibilityData([
        revision("150.0", "^(a|b|c|d)$"),
        revision("140.0", "^(a|b|c)$"),
    ]);
    for (const name of ["a", "b", "c"]) {
        assert.deepEqual(data[`Kinds_${name}`], { min: "140.0" });
        assert.deepEqual(data[`Kinds_${name}_action`], { min: "140.0" });
    }
    assert.deepEqual(data.Kinds_d, { min: "150.0" });
    assert.deepEqual(data.Kinds_d_action, { min: "150.0" });
});

test("policies with the same versions are grouped", () => {
    const compatData = {
        A: { supportedSince: "78.0" },
        B: { supportedSince: "115.0" },
        C: { supportedSince: "78.0", max: "128.0a1" },
        D: { supportedSince: "78.0" },
    };
    assert.deepEqual(
        getCompatibilityInformation(compatData, { distinct: true }).map(e => [e.policies, e.first, e.last]),
        [[["A", "D"], "78.0", ""], [["B"], "115.0", ""], [["C"], "78.0", "128.0"]]
    );
});

test("policies removed before a version are dropped, later ones are kept", () => {
    const compatData = {
        Old: { min: "68.0", max: "89.0" },
        Recent: { min: "102.0", max: "130.0" },
        Current: { min: "115.0" },
    };
    dropRemovedBefore(compatData, 128);
    assert.deepEqual(Object.keys(compatData), ["Recent", "Current"]);
});
