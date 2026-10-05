/**
 * Links into the generated documentation, shared by the Markdown and the ADMX
 * templates.
 */

import GithubSlugger from 'github-slugger';

/**
 * The separator of the parts of a setting path in the docs and in the names
 * of the ADMX template ("Certificates › Install"). Slugs drop it, so the
 * anchors don't depend on it.
 */
export const PATH_SEPARATOR = " › ";

/**
 * Whether a title says more than the name of its setting, i.e. not only the
 * name again (ignoring case, spaces and "_", so "Disable Telemetry" doesn't
 * for DisableTelemetry). The docs leave out other titles, the ADMX template
 * still uses them as names.
 *
 * @param {?string} title
 * @param {string} name - The name of the setting, or the path of a section
 *    (e.g. "SearchEngines_Add"), whose last part counts too.
 * @returns {boolean}
 */
export function isNewTitle(title, name) {
    const plain = text => text.replace(/[\s_|]/g, "").toLowerCase();
    return !!title && plain(title) != plain(name) && plain(title) != plain(name.split("_").at(-1));
}

/**
 * Get the anchor of the section of a policy entry in the README of a branch.
 * A heading with a title keeps the anchor of its name as kramdown id, which
 * must start with a letter. Else kramdown generates the id from the whole
 * heading, e.g. "3rdparty-policies-for-extensions".
 *
 * @param {string} name - The name of the policy entry, e.g. "Certificates_Install".
 * @param {?string} [title] - The title in the heading of the section.
 * @returns {string} e.g. "certificates--install"
 */
export function getPolicyAnchor(name, title = null) {
    const heading = name.replaceAll("_", PATH_SEPARATOR);
    const anchor = new GithubSlugger().slug(heading);
    return /^[a-z]/i.test(anchor) || !isNewTitle(title, name)
        ? anchor
        : new GithubSlugger().slug(`${heading}: ${title}`);
}

/**
 * Get the link to the section of a policy entry in the documentation of a
 * branch.
 *
 * @param {string} name - The name of the policy entry, e.g. "Certificates_Install".
 * @param {string} branchDocsUrl - The URL of the documentation of the branch,
 *    e.g. "https://thunderbird.github.io/policy-templates/policies/esr140".
 * @param {?string} [title] - The title in the heading of the section.
 * @returns {string}
 */
export function getPolicyDocsUrl(name, branchDocsUrl, title = null) {
    return `${branchDocsUrl}/#${getPolicyAnchor(name, title)}`;
}
