import bent from "bent";
import fs from "node:fs/promises";
import https from "https";

import { createWriteStream } from "node:fs";

const requestText = bent("GET", "string", 200);

// Debug logging (0 - errors and basic logs only, 1 - verbose debug)
const DEBUG_LEVEL = 0;

function debug(...args) {
  if (DEBUG_LEVEL > 0) {
      console.debug(...args);
  }
}

/**
 * Compare version numbers, taken from https://jsfiddle.net/vanowm/p7uvtbor/.
 */
export function compareVersion(a, b) {
  function prep(t) {
      return ("" + t)
          // Treat non-numerical characters as lower version.
          // Replacing them with a negative number based on charcode of first character.
          .replace(/[^0-9\.]+/g, function (c) { return "." + ((c = c.replace(/[\W_]+/, "")) ? c.toLowerCase().charCodeAt(0) - 65536 : "") + "." })
          // Remove trailing "." and "0" if followed by non-numerical characters (1.0.0b).
          .replace(/(?:\.0+)*(\.-[0-9]+)(\.[0-9]+)?\.*$/g, "$1$2")
          .split('.');
  }
  a = prep(a);
  b = prep(b);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
      // Convert to integer the most efficient way.
      a[i] = ~~a[i];
      b[i] = ~~b[i];
      if (a[i] > b[i])
          return 1;
      else if (a[i] < b[i])
          return -1;
  }
  return 0;
}

/**
 * Escape illegal chars from markdown code.
 * 
 * @param {string} str - markdown code string
 * @returns - escaped string
 */
export function escape_code_markdown(str) {
    let chars = [
        "\\|",
    ];
    for (let char of chars) {
        str = str.replace(new RegExp(char, 'g'), char);
    }
    return str;
}

/**
 * Rebrand from Firefox to Thunderbird.
 * 
 * @param {*} lines - string or array of strings which need to be rebranded
 * @returns - rebranded string (input array is joined by \n)
 */
export function rebrand(lines) {
    if (!Array.isArray(lines))
        lines = [lines.toString()];

    const replacements = [
        {
            reg: /\bFirefox\b/g,
            val: "Thunderbird",
        },
        {
            reg: /\bfirefox\b/g,
            val: "thunderbird",
        },
        {
            reg: /([\W_])FF(\d\d)/g,
            val: "\$1TB\$2",
        },
        {
            reg: /\bAMO\b/g,
            val: "ATN",
        },
        {
            reg: /addons.mozilla.org/g,
            val: "addons.thunderbird.net",
        },
        {	// Undo a wrong replace.
            reg: "https://support.mozilla.org/kb/setting-certificate-authorities-thunderbird",
            val: "https://support.mozilla.org/kb/setting-certificate-authorities-firefox"
        },
        {	// Undo a wrong replace.
            reg: "https://support.mozilla.org/en-US/kb/dom-events-changes-introduced-thunderbird-66",
            val: "https://support.mozilla.org/en-US/kb/dom-events-changes-introduced-firefox-66"
        }
    ]

    for (let i = 0; i < lines.length; i++) {
        for (let r of replacements) {
            lines[i] = lines[i].replace(r.reg, r.val);
        }
    }

    return lines.join("\n");
}

/**
 * bent based request variant with hard timeout on client side.
 * 
 * @param {string} url - url to GET
 * @returns - text content
 */
export async function request(url) {
  debug(" -> ", url);
  // Retry on error, using a hard timeout enforced from the client side.
  let rv;
  for (let i = 0; (!rv && i < 5); i++) {
      if (i > 0) {
          console.error("Retry", i);
      }
      // Rate limit the first request already, otherwise hg.mozilla.org will block us.
      await new Promise(resolve => setTimeout(resolve, 2500));

      let killTimer;
      let killSwitch = new Promise((resolve, reject) => { killTimer = setTimeout(reject, 15000, "HardTimeout"); })
      rv = await Promise
          .race([requestText(url), killSwitch])
          .catch(err => {
              console.error('Error in  request', err);
              return null;
          });

      // node will continue to "wait" after the script finished, if we do not
      // clear the timeouts.
      clearTimeout(killTimer);
  }
  return rv;
}

/**
 * Simple helper function to produce pretty JSON files.
 *
 * @param {string} filePath - The path to write the JSON to.
 * @param {obj} json - The obj to write into the file.
 */
export async function writePrettyJSONFile(filePath, json) {
  try {
    return await fs.writeFile(filePath, JSON.stringify(json, null, 4));
  } catch (err) {
    console.error("Error in writePrettyJSONFile()", filePath, err);
    throw err;
  }
}

/**
 * Simple helper function to download a URL and store its content on the user's
 * disc.
 *
 * @param {string} url - The URL to download.
 * @param {string} filePath - The path to write the downloaded file to.
 */
export async function downloadUrl(url, filePath) {
  console.log(` - downloading ${url} ...`);
  await new Promise((resolve) => setTimeout(resolve, 2500));
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filePath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(() => {
            resolve(filePath);
          });
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

/**
 * Simple helper function to download a URL and return its content.
 *
 * @param {string} url
 * @returns {string} content
 */
export async function readUrl(url) {
  console.log(` - downloading ${url}`);
  await new Promise((resolve) => setTimeout(resolve, 2500));
  return requestText(url);
}

/**
 * Simple helper function to parse command line arguments.
 *
 * @returns {object} command line arguments and their values
 */
export function parseArgs(argv = process.argv.slice(2)) {
  const args = {};
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      if (!value) {
        args[key] = true;
      } else {
        args[key] = value.toLowerCase();
      }
    }
  }
  return args;
}