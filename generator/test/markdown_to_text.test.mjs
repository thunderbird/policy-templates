import assert from "node:assert/strict";
import { test } from "node:test";

import { markdownToText } from "../modules/markdown_to_text.mjs";

test("bold", () => {
    assert.equal(markdownToText("Enable **automatic** updates."), "Enable automatic updates.");
});

test("italic", () => {
    assert.equal(markdownToText("*As of Thunderbird 85, a theme is the default.*"), "As of Thunderbird 85, a theme is the default.");
});

test("single asterisks stay", () => {
    assert.equal(markdownToText(`The special ID "*" applies to all.`), `The special ID "*" applies to all.`);
});

test("inline code", () => {
    assert.equal(markdownToText("Use `DisableAppUpdate` or ```xx.``` as version."), "Use DisableAppUpdate or xx. as version.");
});

test("asterisks in inline code stay", () => {
    assert.equal(markdownToText("Use `*.example.com` or `*.example.org`."), "Use *.example.com or *.example.org.");
});

test("HTML characters in inline code stay", () => {
    assert.equal(markdownToText("Use `<local>` to bypass the proxy."), "Use <local> to bypass the proxy.");
});

test("links keep their URL", () => {
    assert.equal(
        markdownToText("See [Integrated authentication](https://example.com/auth) for more."),
        "See Integrated authentication (https://example.com/auth) for more."
    );
});

test("links with parentheses in their URL", () => {
    assert.equal(
        markdownToText("See [Foo](https://en.wikipedia.org/wiki/Foo_(bar))."),
        "See Foo (https://en.wikipedia.org/wiki/Foo_(bar))."
    );
});

test("autolinks are not repeated", () => {
    assert.equal(markdownToText("See https://example.com/auth for more."), "See https://example.com/auth for more.");
});

test("bold inline code", () => {
    assert.equal(markdownToText("the old **`Preferences (Deprecated)`** section"), "the old Preferences (Deprecated) section");
});

test("lists keep their markers and nesting", () => {
    assert.equal(
        markdownToText("Searched in:\n\n* Windows\n  - %USERPROFILE%\\AppData\n* macOS"),
        "Searched in:\n\n- Windows\n  - %USERPROFILE%\\AppData\n- macOS"
    );
});

test("ordered lists keep their numbers", () => {
    assert.equal(
        markdownToText("If enabled:\n\n 1. The user is never prompted\n 2. Updates are downloaded"),
        "If enabled:\n\n1. The user is never prompted\n2. Updates are downloaded"
    );
});

test("non-breaking spaces", () => {
    assert.equal(markdownToText("a&nbsp;&nbsp;b"), "a  b");
});

test("paragraphs and line breaks stay", () => {
    assert.equal(markdownToText("First line.\n\nSecond **paragraph**.\nThird line."), "First line.\n\nSecond paragraph.\nThird line.");
});

test("a final line break stays", () => {
    assert.equal(markdownToText("Text.\n"), "Text.\n");
});
