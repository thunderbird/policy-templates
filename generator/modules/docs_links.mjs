/**
 * Links into the generated documentation, shared by the Markdown and the ADMX
 * templates.
 */

import GithubSlugger from 'github-slugger';

/**
 * Get the anchor of the section of a policy entry in the README of a branch.
 *
 * @param {string} name - The name of the policy entry, e.g. "Certificates_Install".
 * @returns {string} e.g. "certificates--install"
 */
export function getPolicyAnchor(name) {
    return new GithubSlugger().slug(name.replaceAll("_", " | "));
}

/**
 * Get the link to the section of a policy entry in the documentation of a
 * branch.
 *
 * @param {string} name - The name of the policy entry, e.g. "Certificates_Install".
 * @param {string} branchDocsUrl - The URL of the documentation of the branch,
 *    e.g. "https://thunderbird.github.io/policy-templates/policies/esr140".
 * @returns {string}
 */
export function getPolicyDocsUrl(name, branchDocsUrl) {
    return `${branchDocsUrl}/#${getPolicyAnchor(name)}`;
}
