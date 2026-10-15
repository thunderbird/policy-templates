/**
 * SHARED FILE: this file exists in two repositories and must stay identical:
 * - thunderbird/webext-annotated-schemas-generator: modules/common/cached_clone.mjs
 * - thunderbird/policy-templates: generator/modules/common/cached_clone.mjs
 * Change both copies together. Check for drift, from the folder containing
 * both repositories:
 *   diff -r webext-annotated-schemas-generator/modules/common \
 *     policy-templates/generator/modules/common
 * See HISTORY.md in either repository.
 *
 * What the two kinds of local clones of a repository share (see
 * blobless_clone.mjs and treeless_clone.mjs): a bare partial clone used as a
 * cache, validated and updated on each run, and the starting points of the
 * complete history of a file (see side_parents.mjs).
 */

import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { getSideParents } from './side_parents.mjs';

const execFileAsync = promisify(execFile);

// The main branch of the repositories.
export const MAIN_BRANCH = 'main';

/**
 * The interface of both kinds of clones (BloblessClone, TreelessClone), so a
 * generator can use either of them, only the call to open() differs.
 *
 * @typedef {Object} HistorySource
 * @property {string} description - e.g. the URL of the repository.
 * @property {function(): Promise<string[]>} listBranches - The names of all
 *    branches.
 * @property {function(string): Promise<string|null>} resolveBranch - The
 *    commit of a branch, null if it does not exist.
 * @property {function(string): Promise<string|null>} resolveRef - The commit
 *    of a ref (e.g. "refs/tags/…"), null if it does not exist.
 * @property {function(string[]): Promise<void>} fetchRefs - Fetch refs which
 *    are not updated by open(), e.g. tags, if they are not yet available.
 * @property {function(string|string[], string): Promise<string[]>}
 *    getFileHistory - The commits which changed a file in the complete
 *    history of the given refs (see side_parents.mjs).
 * @property {function(string, string): Promise<string|null>} readFile - The
 *    content of a file at a commit, null if it does not exist.
 * @property {function(string, string): Promise<string[]>} listFiles - The
 *    paths of the files in a folder (including sub folders) at a commit.
 * @property {function(string[], string[]): Promise<void>} prefetchHistory -
 *    Make the revisions of the given files in the history of the refs
 *    available for readFile(), where this helps.
 * @property {function(string, string[]): Promise<void>} prefetchFiles - Make
 *    the given files at a commit available for readFile(), where this helps.
 * @property {function(): void} close - Release resources.
 */

/**
 * Create a function which runs a git command in a bare repository.
 *
 * @param {string} dir - Path of the bare repository.
 * @returns {function(string[], {input?: string, env?: Object}): Promise<string>}
 *    runs git with the given arguments, optional input on stdin and additional
 *    environment variables, and returns its output
 */
export function createGitRunner(dir) {
  return async (args, { input, env } = {}) => {
    const promise = execFileAsync('git', [`--git-dir=${dir}`, ...args], {
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, ...env },
    });
    if (input !== undefined) {
      promise.child.stdin.end(input);
    }
    return (await promise).stdout;
  };
}

/**
 * Open the local clone of a repository, which is used as a cache: a valid
 * clone is updated, anything else (missing, broken, cloned from another
 * repository, update failed) is removed and cloned again. Then the
 * commit-graph is written.
 *
 * @param {function} git - See createGitRunner(), for dir.
 * @param {string} url - URL of the repository.
 * @param {string} dir - Path of the local bare clone.
 * @param {Object} options
 * @param {string} options.filter - The filter of the partial clone, e.g.
 *    "blob:none" or "tree:0".
 * @param {boolean} options.changedPaths - Whether the commit-graph includes
 *    changed-path filters (only useful with folders available).
 */
export async function openCachedClone(git, url, dir, { filter, changedPaths }) {
  if (!(await updateClone(git, url, dir))) {
    console.log(` - cloning ${url} into ${dir} ...`);
    await fs.rm(dir, { recursive: true, force: true });
    await fs.mkdir(path.dirname(dir), { recursive: true });
    await execFileAsync('git', [
      'clone',
      '--quiet',
      '--bare',
      `--filter=${filter}`,
      '--no-tags',
      url,
      dir,
    ]);
    // A bare clone has no fetch refspec, the branches are updated in place.
    await git(['config', 'remote.origin.fetch', '+refs/heads/*:refs/heads/*']);
  }
  await writeCommitGraph(git, dir, { changedPaths });
}

/**
 * Update a valid clone of the given repository.
 *
 * @returns {Promise<boolean>} false if there is no valid clone or the update
 *    failed
 */
async function updateClone(git, url, dir) {
  try {
    const isBare = await git(['rev-parse', '--is-bare-repository']);
    const origin = await git(['remote', 'get-url', 'origin']);
    if (isBare.trim() !== 'true' || origin.trim() !== url) {
      return false;
    }
  } catch {
    return false;
  }
  try {
    console.log(` - updating the clone in ${dir} ...`);
    await git(['fetch', '--quiet', '--prune', '--no-tags', 'origin']);
    return true;
  } catch (ex) {
    console.warn(` !! Updating the clone in ${dir} failed: ${ex.message}`);
    return false;
  }
}

/**
 * Write the commit-graph, which speeds up the queries of the commit graph
 * and, with changed-path filters, of the histories of files. An existing
 * commit-graph is reused. Without it, the clone is still valid, just slower.
 */
export async function writeCommitGraph(git, dir, { changedPaths }) {
  try {
    await git([
      'commit-graph',
      'write',
      '--reachable',
      ...(changedPaths ? ['--changed-paths'] : []),
    ]);
  } catch (ex) {
    console.warn(
      ` !! Writing the commit-graph of ${dir} failed: ${ex.message}`
    );
  }
}

/**
 * Get the names of all branches of a bare clone.
 *
 * @returns {Promise<string[]>}
 */
export async function listBranches(git) {
  const refs = await git([
    'for-each-ref',
    '--format=%(refname:short)',
    'refs/heads/',
  ]);
  return refs.split('\n').filter(Boolean);
}

/**
 * Resolve a ref to a commit.
 *
 * @param {string} ref - e.g. "refs/heads/esr153" or "refs/tags/…".
 * @returns {Promise<string|null>} the commit, null if the ref does not exist
 */
export async function resolveRef(git, ref) {
  try {
    return (
      await git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`])
    ).trim();
  } catch {
    return null;
  }
}

/**
 * Fetch the given refs, if they are not yet available locally. Used for refs
 * which are not updated by openCachedClone() and which never change, e.g.
 * tags.
 *
 * @param {string[]} refs - e.g. ["refs/tags/THUNDERBIRD_102_15_1_RELEASE"]
 * @param {Object} options - See openCachedClone().
 */
export async function fetchRefs(git, dir, refs, { filter, changedPaths }) {
  const missing = [];
  for (const ref of refs) {
    if (!(await resolveRef(git, ref))) {
      missing.push(ref);
    }
  }
  if (!missing.length) {
    return;
  }
  console.log(` - fetching ${missing.length} refs into ${dir} ...`);
  await git([
    'fetch',
    '--quiet',
    '--no-tags',
    `--filter=${filter}`,
    'origin',
    ...missing.map((ref) => `${ref}:${ref}`),
  ]);
  await writeCommitGraph(git, dir, { changedPaths });
}

/**
 * Get the starting points of the complete history of the given refs: the refs
 * and the heads of the lines merged into their history from outside of main
 * (see side_parents.mjs).
 *
 * @param {string[]} refs
 * @returns {Promise<string[]>}
 */
export async function getHistoryStarts(git, refs) {
  const starts = new Set(refs);
  for (const ref of refs) {
    for (const parent of await getSideParents(
      git,
      ref,
      `refs/heads/${MAIN_BRANCH}`
    )) {
      starts.add(parent);
    }
  }
  return [...starts];
}
