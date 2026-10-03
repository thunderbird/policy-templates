import assert from "node:assert/strict";
import { test } from "node:test";

import plist from "plist";

import { buildPlistTemplate } from "../modules/generate_plist.mjs";

const SCHEMA = {
    definitions: {
        url: { type: "string" },
    },
    properties: {
        Flag: { type: "boolean", examples: [false, true] },
        Url: { $ref: "#/definitions/url", examples: ["https://example.com"] },
        Devices: {
            type: "object",
            examples: [{ Delete: ["Old"], Add: { New: "/libs/new.so" } }, { Legacy: "/libs/legacy.so" }],
        },
        WindowsOnly: { type: "boolean", "x-formats": ["gpo", "json"], examples: [true] },
        Unsupported: { type: "boolean", examples: [true] },
    },
};

test("the template has the first example of each supported policy with the format plist", () => {
    const template = plist.parse(buildPlistTemplate(
        SCHEMA,
        ["Flag", "Url", "Devices", "Devices_Add", "WindowsOnly"]
    ));
    assert.deepEqual(template, {
        Devices: { Add: { New: "/libs/new.so" }, Delete: ["Old"] },
        Flag: false,
        Url: "https://example.com",
    });
    // Keys are sorted.
    assert.deepEqual(Object.keys(template), ["Devices", "Flag", "Url"]);
    assert.deepEqual(Object.keys(template.Devices), ["Add", "Delete"]);
});

test("a policy without examples gets a generated one", () => {
    const schema = { properties: { Flag: { type: "boolean" }, Mode: { type: "string", enum: ["b", "a"] } } };
    assert.deepEqual(plist.parse(buildPlistTemplate(schema, ["Flag", "Mode"])), { Flag: true, Mode: "b" });
});
