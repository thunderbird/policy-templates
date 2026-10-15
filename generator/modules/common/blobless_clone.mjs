/**
 * SHARED FILE: this file exists in two repositories and must stay identical:
 * - thunderbird/webext-annotated-schemas-generator: modules/common/blobless_clone.mjs
 * - thunderbird/policy-templates: generator/modules/common/blobless_clone.mjs
 * Change both copies together. Check for drift, from the folder containing
 * both repositories:
 *   diff -r webext-annotated-schemas-generator/modules/common \
 *     policy-templates/generator/modules/common
 * See HISTORY.md in either repository.
 *
 * A blobless clone of a repository: commits and folders are local, file
 * contents are fetched when needed (in batches, see prefetchHistory() and
 * prefetchFiles()). Histories and files are read locally, no GitHub API is
 * needed. The clone grows with the folders of the whole repository: good for
 * small repositories and many files (e.g. thunderbird-desktop), too large for
 * mozilla-firefox (see treeless_clone.mjs and HISTORY.md).
 */

import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

import {
  createGitRunner,
  fetchRefs,
  getHistoryStarts,
  listBranches,
  openCachedClone,
  resolveRef,
} from './cached_clone.mjs';

const execFileAsync = promisify(execFile);

// The partial clone filter and commit-graph of a blobless clone.
const OPTIONS = { filter: 'blob:none', changedPaths: true };

/**
 * See HistorySource in cached_clone.mjs.
 */
export class BloblessClone {
  #git;
  #catFile = null;
  #readCache = new Map();
  #historyStarts = new Map();

  /**
   * @param {string} dir - Path of the local bare clone.
   * @param {string} [description] - e.g. the URL of the repository.
   */
  constructor(dir, description = dir) {
    this.dir = dir;
    this.description = description;
    this.#git = createGitRunner(dir);
  }

  /**
   * Open the blobless clone of a repository (a cache, see openCachedClone()).
   *
   * @param {string} url - URL of the repository.
   * @param {string} dir - Path of the local bare clone.
   * @returns {Promise<BloblessClone>}
   */
  static async open(url, dir) {
    const clone = new BloblessClone(dir, url);
    await openCachedClone(clone.#git, url, dir, OPTIONS);
    return clone;
  }

  listBranches() {
    return listBranches(this.#git);
  }

  resolveBranch(name) {
    return this.resolveRef(`refs/heads/${name}`);
  }

  resolveRef(ref) {
    return resolveRef(this.#git, ref);
  }

  fetchRefs(refs) {
    return fetchRefs(this.#git, this.dir, refs, OPTIONS);
  }

  /**
   * The starting points of the complete history, computed once per set of
   * refs (see getHistoryStarts()).
   */
  #getHistoryStarts(refs) {
    const key = refs.join(' ');
    if (!this.#historyStarts.has(key)) {
      this.#historyStarts.set(key, getHistoryStarts(this.#git, refs));
    }
    return this.#historyStarts.get(key);
  }

  /**
   * Get the commits which changed a file in the complete history of the given
   * refs (see side_parents.mjs). A single walk from all starting points
   * returns the union of their histories.
   *
   * @param {string|string[]} refs - Refs or commits.
   * @param {string} filePath - Path of the file inside the repository.
   * @returns {Promise<string[]>}
   */
  async getFileHistory(refs, filePath) {
    const log = await this.#git([
      'rev-list',
      ...(await this.#getHistoryStarts([refs].flat())),
      '--',
      filePath,
    ]);
    return log.split('\n').filter(Boolean);
  }

  /**
   * Get the paths of all files inside a folder (including sub folders) at the
   * given commit.
   *
   * @param {string} commit
   * @param {string} folderPath - Path of the folder inside the repository.
   * @returns {Promise<string[]>}
   */
  async listFiles(commit, folderPath) {
    const files = await this.#git([
      'ls-tree',
      '-r',
      '--name-only',
      commit,
      '--',
      `${folderPath}/`,
    ]);
    return files.split('\n').filter(Boolean);
  }

  /**
   * Fetch all revisions of the given files in the history of the given refs
   * (see getFileHistory()), which are not yet available locally, with a single
   * request.
   *
   * @param {string[]} refs - Refs or commits.
   * @param {string[]} paths - Paths of files or folders.
   */
  async prefetchHistory(refs, paths) {
    const objects = await this.#git([
      'rev-list',
      '--objects',
      '--missing=print',
      ...(await this.#getHistoryStarts([refs].flat())),
      '--',
      ...paths,
    ]);
    await this.#fetchObjects(
      objects
        .split('\n')
        .filter((line) => line.startsWith('?'))
        .map((line) => line.slice(1))
    );
  }

  /**
   * Fetch the given files at the given commit, which are not yet available
   * locally, with a single request.
   *
   * @param {string} commit
   * @param {string[]} paths - Paths of files or folders.
   */
  async prefetchFiles(commit, paths) {
    const tree = await this.#git(['ls-tree', '-r', commit, '--', ...paths]);
    const blobs = tree
      .split('\n')
      .map((line) => line.split(/\s/))
      .filter(([, type]) => type === 'blob')
      .map(([, , id]) => id);
    if (!blobs.length) {
      return;
    }
    const status = await this.#git(['cat-file', '--batch-check'], {
      input: `${blobs.join('\n')}\n`,
      env: { GIT_NO_LAZY_FETCH: '1' },
    });
    await this.#fetchObjects(
      status
        .split('\n')
        .filter((line) => line.endsWith(' missing'))
        .map((line) => line.split(' ')[0])
    );
  }

  async #fetchObjects(ids) {
    if (!ids.length) {
      return;
    }
    console.log(` - fetching ${ids.length} files into ${this.dir} ...`);
    await this.#git(
      [
        '-c',
        'fetch.negotiationAlgorithm=noop',
        'fetch',
        '--quiet',
        '--no-tags',
        '--no-write-fetch-head',
        '--recurse-submodules=no',
        '--filter=blob:none',
        '--stdin',
        'origin',
      ],
      { input: `${ids.join('\n')}\n` }
    );
  }

  /**
   * Read a file at the given commit. Missing file contents are fetched on
   * demand, which is slow: use prefetchHistory() or prefetchFiles() first.
   *
   * @param {string} commit
   * @param {string} filePath - Path of the file inside the repository.
   * @returns {Promise<string|null>} content of the file, or null if it does
   *    not exist at the given commit
   */
  async readFile(commit, filePath) {
    const spec = `${commit}:${filePath}`;
    if (!this.#readCache.has(spec)) {
      if (!this.#catFile) {
        this.#catFile = new CatFileBatch(this.dir);
      }
      this.#readCache.set(spec, this.#catFile.read(spec));
    }
    return this.#readCache.get(spec);
  }

  /**
   * Stop the git process used by readFile().
   */
  close() {
    this.#catFile?.close();
    this.#catFile = null;
  }
}

/**
 * Fetch a single commit of a repository into a new local repository, without
 * its history, folders and file contents: they are fetched when needed (see
 * BloblessClone.listFiles(), prefetchFiles() and readFile()). For
 * repositories where only a single revision is needed, which are too large to
 * be cloned.
 *
 * @param {string} url - URL of the repository.
 * @param {string} ref - A branch or tag, e.g. "main" or
 *    "FIREFOX_153_5_0esr_BUILD1".
 * @param {string} dir - Path of the local bare repository, which must not
 *    exist yet.
 * @returns {Promise<{source: BloblessClone, commit: string}>}
 */
export async function fetchSingleRevision(url, ref, dir) {
  console.log(` - fetching ${ref} of ${url} ...`);
  await execFileAsync('git', ['init', '--quiet', '--bare', dir]);
  const git = createGitRunner(dir);
  await git(['remote', 'add', 'origin', url]);
  // Missing objects are fetched from origin on demand.
  await git(['config', 'remote.origin.promisor', 'true']);
  await git(['config', 'remote.origin.partialclonefilter', 'tree:0']);
  try {
    await git([
      'fetch',
      '--quiet',
      '--depth=1',
      '--filter=tree:0',
      '--no-tags',
      'origin',
      ref,
    ]);
  } catch (ex) {
    throw new Error(`Fetching ${ref} of ${url} failed: ${ex.stderr || ex}`, {
      cause: ex,
    });
  }
  const commit = (await git(['rev-parse', 'FETCH_HEAD^{commit}'])).trim();
  return { source: new BloblessClone(dir, url), commit };
}

/**
 * A long-running "git cat-file --batch" process, to read many files without
 * spawning a git process for each of them.
 */
class CatFileBatch {
  #process;
  #buffer = Buffer.alloc(0);
  #pending = [];

  constructor(dir) {
    this.#process = spawn('git', [`--git-dir=${dir}`, 'cat-file', '--batch'], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });
    this.#process.stdout.on('data', (chunk) => {
      this.#buffer = Buffer.concat([this.#buffer, chunk]);
      this.#processBuffer();
    });
    this.#process.on('exit', (code) => {
      for (const { reject } of this.#pending.splice(0)) {
        reject(new Error(`git cat-file exited with code ${code}`));
      }
    });
  }

  /**
   * @param {string} spec - The object to read, e.g. "<commit>:<path>".
   * @returns {Promise<string|null>} content, or null if it does not exist
   */
  read(spec) {
    return new Promise((resolve, reject) => {
      this.#pending.push({ resolve, reject });
      this.#process.stdin.write(`${spec}\n`);
    });
  }

  #processBuffer() {
    while (this.#pending.length) {
      const headerEnd = this.#buffer.indexOf(0x0a);
      if (headerEnd === -1) {
        return;
      }
      // The header is either "<id> <type> <size>" or "<spec> missing".
      const header = this.#buffer.subarray(0, headerEnd).toString();
      if (/ (missing|ambiguous)$/.test(header)) {
        this.#buffer = this.#buffer.subarray(headerEnd + 1);
        this.#pending.shift().resolve(null);
        continue;
      }
      const size = Number(header.split(' ').at(-1));
      // The content is followed by a newline.
      if (this.#buffer.length < headerEnd + 1 + size + 1) {
        return;
      }
      const content = this.#buffer
        .subarray(headerEnd + 1, headerEnd + 1 + size)
        .toString('utf-8');
      this.#buffer = this.#buffer.subarray(headerEnd + 1 + size + 1);
      this.#pending.shift().resolve(content);
    }
  }

  close() {
    this.#process.stdin.end();
  }
}
