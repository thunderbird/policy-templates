import assert from "node:assert/strict";
import { test } from "node:test";

import { getL10nIdField, SchemaL10n } from "../modules/l10n.mjs";

const l10n = new SchemaL10n([
    { name: "brand.ftl", source: "-brand-short-name = Thunderbird\n" },
    {
        name: "policies.ftl",
        source: [
            "policy-Update = Prevent { -brand-short-name } from updating.",
            "policy-Help =",
            "    First paragraph.",
            "",
            "    Second paragraph.",
            "policy-NoValue =",
            "    .label = Only an attribute",
            "",
        ].join("\n"),
    },
]);

test("the field of a Fluent message ID", () => {
    assert.equal(getL10nIdField("title"), "x-title-l10n-id");
    assert.equal(getL10nIdField("description"), "x-description-l10n-id");
    assert.equal(getL10nIdField("x-help"), "x-help-l10n-id");
});

test("plain English fields are used as they are", () => {
    assert.equal(l10n.get({ description: "Plain text." }, "description", "Test"), "Plain text.");
    assert.equal(l10n.get({}, "description", "Test"), undefined);
});

test("Fluent message IDs are resolved, with terms", () => {
    assert.equal(
        l10n.get({ "x-description-l10n-id": "policy-Update" }, "description", "Test"),
        "Prevent Thunderbird from updating."
    );
    assert.equal(
        l10n.get({ "x-help-l10n-id": "policy-Help" }, "x-help", "Test"),
        "First paragraph.\n\nSecond paragraph."
    );
});

test("the names of the product are terms of its brand.ftl", () => {
    assert.equal(l10n.term("brand-short-name"), "Thunderbird");
    assert.throws(() => l10n.term("brand-unknown-name"), /brand-unknown-name/);
});

test("a localization resolves its messages and terms, and falls back to the English ones", () => {
    const de = new SchemaL10n([
        { name: "brand.ftl", source: "-brand-short-name = Donnervogel\n" },
        { name: "policies.ftl", source: "policy-Update = { -brand-short-name } nicht aktualisieren.\n" },
    ], { locale: "de", fallback: l10n });
    assert.equal(de.get({ "x-description-l10n-id": "policy-Update" }, "description", "Test"), "Donnervogel nicht aktualisieren.");
    assert.equal(de.get({ "x-help-l10n-id": "policy-Help" }, "x-help", "Test"), "First paragraph.\n\nSecond paragraph.");
    assert.equal(de.get({ description: "Plain." }, "description", "Test"), "Plain.");
});

test("errors", () => {
    assert.throws(
        () => l10n.get({ description: "Plain.", "x-description-l10n-id": "policy-Update" }, "description", "Test"),
        /Test has both description and x-description-l10n-id/
    );
    assert.throws(
        () => l10n.get({ "x-title-l10n-id": "policy-Unknown" }, "title", "Test.Setting"),
        /The Fluent message policy-Unknown of x-title-l10n-id of Test.Setting does not exist/
    );
    assert.throws(
        () => l10n.get({ "x-title-l10n-id": "policy-NoValue" }, "title", "Test"),
        /The Fluent message policy-NoValue of x-title-l10n-id of Test has no value/
    );
    // A message defined twice (a broken message is skipped by the parser and
    // reported as missing when it is used).
    assert.throws(
        () => new SchemaL10n([{ name: "twice.ftl", source: "policy-A = One\npolicy-A = Two\n" }]),
        /Invalid Fluent file twice.ftl/
    );
});
