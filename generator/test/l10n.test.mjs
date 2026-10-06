import assert from "node:assert/strict";
import { test } from "node:test";

import { SchemaL10n } from "../modules/l10n.mjs";

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

test("plain English fields are used as they are, also with braces which are no references", () => {
    assert.equal(l10n.get({ description: "Plain text." }, "description", "Test"), "Plain text.");
    assert.equal(l10n.get({}, "description", "Test"), undefined);
    // Without a space inside the braces, they are text.
    const text = "The URL with {searchTerms}, in ${home}, for `{1234-abcd}`.";
    assert.equal(l10n.get({ description: text }, "description", "Test"), text);
});

test("Fluent messages and terms in a text are replaced by their texts", () => {
    assert.equal(l10n.get({ description: "{ policy-Update }" }, "description", "Test"), "Prevent Thunderbird from updating.");
    assert.equal(l10n.get({ "x-help": "{ policy-Help }" }, "x-help", "Test"), "First paragraph.\n\nSecond paragraph.");
    assert.equal(
        l10n.get({ title: "Keep cookies until { -brand-short-name } is closed" }, "title", "Test"),
        "Keep cookies until Thunderbird is closed"
    );
    assert.equal(
        l10n.get({ description: "{ -brand-short-name }: { policy-Update }" }, "description", "Test"),
        "Thunderbird: Prevent Thunderbird from updating."
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
    assert.equal(de.get({ description: "{ policy-Update }" }, "description", "Test"), "Donnervogel nicht aktualisieren.");
    // Each reference falls back on its own.
    assert.equal(
        de.get({ "x-help": "{ -brand-short-name }: { policy-Help }" }, "x-help", "Test"),
        "Donnervogel: First paragraph.\n\nSecond paragraph."
    );
    assert.equal(de.get({ description: "Plain." }, "description", "Test"), "Plain.");
});

test("errors", () => {
    assert.throws(
        () => l10n.get({ "x-description-l10n-id": "policy-Update" }, "description", "Test"),
        /Test has x-description-l10n-id, write "\{ policy-Update \}" in its description instead/
    );
    assert.throws(
        () => l10n.get({ title: "{ policy-Unknown }" }, "title", "Test.Setting"),
        /The Fluent message policy-Unknown of the title of Test.Setting does not exist/
    );
    assert.throws(
        () => l10n.get({ title: "{ -brand-unknown-name }" }, "title", "Test"),
        /The Fluent term -brand-unknown-name of the title of Test can not be formatted/
    );
    assert.throws(
        () => l10n.get({ title: "{ policy-NoValue }" }, "title", "Test"),
        /The Fluent message policy-NoValue of the title of Test has no value/
    );
    // A message defined twice (a broken message is skipped by the parser and
    // reported as missing when it is used).
    assert.throws(
        () => new SchemaL10n([{ name: "twice.ftl", source: "policy-A = One\npolicy-A = Two\n" }]),
        /Invalid Fluent file twice.ftl/
    );
});
