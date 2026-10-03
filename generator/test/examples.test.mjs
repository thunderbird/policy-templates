import assert from "node:assert/strict";
import { test } from "node:test";

import { NAME_PLACEHOLDER_EXAMPLE, STRING_PLACEHOLDER, getExample } from "../modules/schema_settings.mjs";

const SCHEMA = {
    definitions: { url: { type: "string", format: "moz-url" } },
    properties: {
        Flag: { type: "boolean" },
        Mode: { type: "string", enum: ["manual", "auto"] },
        Level: { type: "number", oneOf: [{ const: 2 }, { const: 1 }] },
        Url: { $ref: "#/definitions/url", examples: ["https://example.com"] },
        Text: { type: "string" },
        Locales: { type: ["string", "array"], items: { type: "string" } },
        Paths: {
            type: "array",
            items: { type: "string" },
            examples: [["/a", "/b"]],
            "x-examples-gpo": [["C:\\a", "C:\\b"]],
        },
        Group: {
            type: "object",
            properties: {
                Sites: { type: "array", items: { type: "string", examples: ["example.com"] } },
                Old: { type: "boolean", "x-deprecated": true },
                Add: { type: "array", items: { type: "object", properties: { Name: { type: "string", examples: ["N"] }, On: { type: "boolean" } } } },
            },
        },
        Devices: {
            type: "object",
            properties: { Add: { type: "object", patternProperties: { "^.*$": { type: "string" } } } },
            patternProperties: { "^(?!Add$).*$": { type: "string" } },
            examples: [{ Add: { My: "/my.so" } }, { Old: "/old.so" }],
        },
        Open: { type: "object", patternProperties: { "^.*$": { type: "boolean" } } },
        Kinds: { type: "object", patternProperties: { "^(mimeTypes|schemes)$": { type: "boolean" } } },
    },
};

test("booleans are true, choices their first value", () => {
    assert.equal(getExample(SCHEMA, ["Flag"]), true);
    assert.equal(getExample(SCHEMA, ["Mode"]), "manual");
    assert.equal(getExample(SCHEMA, ["Level"]), 2);
});

test("hand-written examples are used, also next to a $ref and for the GPO format", () => {
    assert.equal(getExample(SCHEMA, ["Url"]), "https://example.com");
    assert.deepEqual(getExample(SCHEMA, ["Paths"]), ["/a", "/b"]);
    assert.deepEqual(getExample(SCHEMA, ["Paths"], { format: "gpo" }), ["C:\\a", "C:\\b"]);
});

test("strings without example and of several types the first one get the placeholder", () => {
    assert.equal(getExample(SCHEMA, ["Text"]), STRING_PLACEHOLDER);
    assert.equal(getExample(SCHEMA, ["Locales"]), STRING_PLACEHOLDER);
    assert.deepEqual(getExample(SCHEMA, ["Open"]), { [NAME_PLACEHOLDER_EXAMPLE]: true });
});

test("objects and lists are generated from their settings, without the deprecated ones", () => {
    assert.deepEqual(getExample(SCHEMA, ["Group"]), {
        Sites: ["example.com"],
        Add: [{ Name: "N", On: true }],
    });
    // The section of a deprecated setting gets its own example.
    assert.equal(getExample(SCHEMA, ["Group", "Old"]), true);
    assert.deepEqual(getExample(SCHEMA, ["Group", "Add"]), [{ Name: "N", On: true }]);
});

test("a setting below a node with examples gets its part of the first example which has it", () => {
    assert.deepEqual(getExample(SCHEMA, ["Devices"]), { Add: { My: "/my.so" } });
    assert.deepEqual(getExample(SCHEMA, ["Devices", "Add"]), { My: "/my.so" });
    assert.deepEqual(getExample(SCHEMA, ["Devices", "[name]"]), { Old: "/old.so" });
});

test("a pattern of alternatives gives one key per name", () => {
    assert.deepEqual(getExample(SCHEMA, ["Kinds"]), { mimeTypes: true, schemes: true });
});

test("an unknown setting has no example", () => {
    assert.equal(getExample(SCHEMA, ["Unknown"]), undefined);
    assert.equal(getExample(SCHEMA, ["Group", "Unknown"]), undefined);
});
