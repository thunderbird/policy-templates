/**
 * SHARED FILE: this file exists in two repositories and must stay identical:
 * - thunderbird/webext-annotated-schemas-generator: modules/common/side_parents.mjs
 * - thunderbird/policy-templates: generator/modules/common/side_parents.mjs
 * Change both copies together. Check for drift, from the folder containing
 * both repositories:
 *   diff webext-annotated-schemas-generator/modules/common/side_parents.mjs \
 *     policy-templates/generator/modules/common/side_parents.mjs
 * See HISTORY.md in either repository.
 *
 * The history of a file at a commit of a release branch, e.g. "release" or
 * "esr153", is more than what `git log <commit> -- <file>` (or the GitHub API)
 * returns: at a merge whose result equals one of its parents, git follows only
 * that parent. The merges of the release process ("Promote beta to release",
 * "Merge main into beta", and the "Merge old head" merges of the conversion
 * from mercurial) take their whole content from the newer line, so the older
 * line, with its uplifts and dot releases, is never visited. A change uplifted
 * to beta 91 and landed on main for 92 is then reported as new in 92.
 *
 * The lines which are merged in this way are not part of main. Their heads are
 * the parents of the merges on the branch which are not part of main: the side
 * parents. The complete history of the file is the union of the plain
 * histories from the commit and from each side parent. Only the commit graph
 * is needed to find the side parents, no folders or files.
 */

/**
 * Get the heads of the lines merged into the history of a commit from outside
 * of main: the parents (besides the first) of the merges in the history of the
 * commit which are not part of main.
 *
 * @param {function(string[]): Promise<string>} git - Runs a git command in the
 *    repository and returns its output.
 * @param {string} commit
 * @param {string} main - The ref of the main branch, e.g. "refs/heads/main".
 * @returns {Promise<string[]>} the commits, empty if the commit is part of main
 */
export async function getSideParents(git, commit, main) {
  const lines = (output) => output.split('\n').filter(Boolean);
  const notOnMain = new Set(lines(await git(['rev-list', commit, `^${main}`])));
  const sideParents = new Set();
  for (const line of lines(
    await git(['rev-list', '--merges', '--parents', commit, `^${main}`])
  )) {
    const [, , ...parents] = line.split(' ');
    for (const parent of parents) {
      if (notOnMain.has(parent)) {
        sideParents.add(parent);
      }
    }
  }
  return [...sideParents];
}
