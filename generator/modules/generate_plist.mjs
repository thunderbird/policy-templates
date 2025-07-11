import { ensureDir } from "./tools.mjs";
import fs from "node:fs/promises";
import plist from "plist";

/**
 * Generate the example plist file policies support by Thunderbird on MacOs.
 * 
 * @param {TemplateData} template
 * @param {string[]} thunderbirdPolicies - Flattened policy names of supported
 *    policies, e.g. "InstallAddonsPermission_Allow".
 * @param {string} output_dir - path to save the adjusted PLIST files.
 */
export async function generatePlistFile(template, thunderbirdPolicies, output_dir) {
    function sortKeysRecursively(obj) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            // Sort the keys and rebuild object
            const sorted = {};
            Object.keys(obj)
                .sort((a, b) => a.localeCompare(b))
                .forEach(key => {
                    sorted[key] = sortKeysRecursively(obj[key]);
                });
            return sorted;
        } else if (Array.isArray(obj)) {
            // Recursively sort dicts inside arrays
            return obj.map(item => sortKeysRecursively(item));
        } else {
            // Primitive value, return as is
            return obj;
        }
    }
    function deepMerge(target, source) {
        for (const key of Object.keys(source)) {
            if (
                typeof target[key] === 'object' &&
                typeof source[key] === 'object' &&
                !Array.isArray(target[key]) &&
                !Array.isArray(source[key])
            ) {
                // Recursively merge nested dictionaries
                deepMerge(target[key], source[key]);
            } else {
                // For arrays or primitives, overwrite
                target[key] = source[key];
            }
        }
        return target;
    }

    const plistEntries = Object.entries(template.policies)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .filter(e => thunderbirdPolicies.includes(e[0]))
        .map(e => e[1].plist)
        .filter(Boolean);

    const mergedObject = {};
    for (const entry of plistEntries) {
        try {
            // Use only the first XML tag before the pipe for each value, and also
            // only keep the first provided string value.
            const cleaned = entry.replace(/(<[^>]+>\s*\|\s*<[^>]+>)/g, match => {
                // For XML tags separated by |
                return match.split('|')[0].trim();
            }).replace(/<string>([^<]+)<\/string>/g, (match, content) => {
                // For <string> that contains multiple options separated by '|'
                const firstOption = content.split('|')[0].trim();
                return `<string>${firstOption}</string>`;
            });

            // Wrap into a valid plist structure.
            const wrapped = `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
    ${cleaned}
  </plist>`;

            // Parse the cleaned plist fragment.
            const parsed = plist.parse(wrapped);

            // Merge keys into the result.
            deepMerge(mergedObject, sortKeysRecursively(parsed));
        } catch (err) {
            console.error(`Invalid plist entry:\n${entry}`);
            console.error(`Error: ${err.message}`);
        }
    }

    // Convert merged object back to plist string.
    const plist_tb = plist.build(mergedObject);
    await ensureDir(`${output_dir}/mac`);
    await fs.writeFile(`${output_dir}/mac/org.mozilla.thunderbird.plist`, plist_tb);
}
