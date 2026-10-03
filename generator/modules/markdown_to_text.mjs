import { decodeHTML } from "entities";
import { Marked } from "marked";
import markedPlaintify from "marked-plaintify";

// Markdown to plain text, using the marked-plaintify extension. Its renderers
// are only replaced where its output loses information needed by admins.
const plaintify = new Marked({ gfm: true }).use(markedPlaintify({
    // Keep the URL of links, which is otherwise dropped.
    link(token) {
        const text = this.parser.parseInline(token.tokens);
        return text == token.href ? text : `${text} (${token.href})`;
    },
    // Keep the markers of list items and the indentation of nested lists,
    // which are otherwise dropped.
    list(token) {
        const start = token.start === "" ? 1 : token.start;
        const items = token.items.map((item, i) => {
            const marker = token.ordered ? `${start + i}.` : "-";
            const [first, ...rest] = this.parser.parse(item.tokens)
                .split("\n")
                .filter(line => line.trim() != "");
            const indent = " ".repeat(marker.length + 1);
            return [`${marker} ${first}`, ...rest.map(line => indent + line)].join("\n");
        });
        return `\n${items.join("\n")}\n\n`;
    },
}));

/**
 * Convert the Markdown of a policy description into plain text, as Group Policy
 * tools show the explain texts of ADMX templates without any formatting.
 *
 * Tables and code blocks are not supported, help texts are kept to paragraphs
 * and lists.
 *
 * @param {string} markdown
 * @returns {string}
 */
export function markdownToText(markdown) {
    const text = decodeHTML(plaintify.parse(markdown))
        .replaceAll(" ", " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    // Keep a final line break of the Markdown.
    return markdown.endsWith("\n") ? `${text}\n` : text;
}
