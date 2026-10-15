/**
 * SHARED FILE: this file exists in two repositories and must stay identical:
 * - thunderbird/webext-annotated-schemas-generator: modules/common/treeless_clone.mjs
 * - thunderbird/policy-templates: generator/modules/common/treeless_clone.mjs
 * Change both copies together. Check for drift, from the folder containing
 * both repositories:
 *   diff -r webext-annotated-schemas-generator/modules/common \
 *     policy-templates/generator/modules/common
 * See HISTORY.md in either repository.
 *
 * A treeless clone of a GitHub repository: only the commits are local (the
 * commit graph), which keeps the clone small even for mozilla-firefox. The
 * histories of files are requested from the GitHub API (one request per
 * starting point, cached), file contents are downloaded from
 * raw.githubusercontent.com. Good for few files of large repositories, too
 * many requests for many files (see blobless_clone.mjs and HISTORY.md).
 */

import {
  createGitRunner,
  fetchRefs,
  getHistoryStarts,
  listBranches,
  openCachedClone,
  resolveRef,
} from './cached_clone.mjs';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com';

// The partial clone filter and commit-graph of a treeless clone.
const OPTIONS = { filter: 'tree:0', changedPaths: false };

/**
 * See HistorySource in cached_clone.mjs.
 */
export class TreelessClone {
  #git;
  #cache;
  #readUrl;
  #historyStarts = new Map();

  /**
   * @param {string} dir - Path of the local bare clone.
   * @param {Object} options - See open().
   */
  constructor(dir, { repository, cache, readUrl }) {
    this.dir = dir;
    this.repository = repository;
    this.description = `https://github.com/${repository}`;
    this.#git = createGitRunner(dir);
    this.#cache = cache;
    this.#readUrl = readUrl;
  }

  /**
   * Open the treeless clone of a GitHub repository (a cache, see
   * openCachedClone()).
   *
   * @param {string} url - URL of the repository.
   * @param {string} dir - Path of the local bare clone.
   * @param {Object} options
   * @param {string} [options.repository] - The repository on GitHub, e.g.
   *    "mozilla-firefox/firefox", for the API and the downloads. Default:
   *    taken from a https://github.com/ URL.
   * @param {{get: function(string): Promise<string|undefined>,
   *    set: function([string, string][]): Promise<void>}} options.cache - A
   *    persistent cache for the histories.
   * @param {function(string): Promise<string|null>} options.readUrl -
   *    Downloads a URL (cached), null if it does not exist.
   * @returns {Promise<TreelessClone>}
   */
  static async open(url, dir, { repository, cache, readUrl }) {
    repository ??= url.match(/^https:\/\/github\.com\/(.+?)(\.git)?$/)?.[1];
    const clone = new TreelessClone(dir, { repository, cache, readUrl });
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
   * refs (see side_parents.mjs): the union of the histories from each
   * starting point, requested from the GitHub API.
   *
   * @param {string|string[]} refs - Refs or commits.
   * @param {string} filePath - Path of the file inside the repository.
   * @returns {Promise<string[]>}
   */
  async getFileHistory(refs, filePath) {
    const history = new Set();
    for (const start of await this.#getHistoryStarts([refs].flat())) {
      const commit = (await this.resolveRef(start)) ?? start;
      for (const sha of await this.#getSimplifiedHistory(commit, filePath)) {
        history.add(sha);
      }
    }
    return [...history];
  }

  async #api(apiPath) {
    const url = `${GITHUB_API_URL}/repos/${this.repository}${apiPath}`;
    const headers = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    console.log(` - requesting ${url}`);
    const response = await fetch(url, { headers });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      const hint =
        [403, 429].includes(response.status) && !process.env.GITHUB_TOKEN
          ? ' The API rate limit may be exceeded, set GITHUB_TOKEN to raise it.'
          : '';
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText} (${url}).${hint}`
      );
    }
    return response.json();
  }

  /**
   * Get the history of a file as the GitHub API returns it: following only
   * one parent at merges whose result equals that parent.
   *
   * The history from a commit never changes, and from a commit of it on, it
   * is the same for every start. So it is cached as links: for each commit,
   * the next one of the history. A request stops at the first commit whose
   * link is known, the rest of the history is known already.
   *
   * @param {string} start - The commit to start from.
   * @param {string} filePath - Path of the file inside the repository.
   * @returns {Promise<string[]>} newest first
   */
  async #getSimplifiedHistory(start, filePath) {
    const key = (kind, sha) =>
      `${GITHUB_API_URL}/repos/${this.repository}/history-${kind}/${sha}/${filePath}`;
    let first = await this.#cache.get(key('first', start));
    if (first === undefined) {
      first = await this.#requestSimplifiedHistory(start, filePath, key);
    }
    const history = [];
    for (let sha = first; sha; sha = await this.#cache.get(key('next', sha))) {
      history.push(sha);
    }
    return history;
  }

  /**
   * Request the history of a file until a known commit, and store it as
   * links, see #getSimplifiedHistory().
   *
   * @returns {Promise<string>} the first commit of the history, "" if there
   *    is none
   */
  async #requestSimplifiedHistory(start, filePath, key) {
    const perPage = 100;
    const file = encodeURIComponent(filePath);
    const links = [];
    let first = '';
    let previous = null;
    let known = false;
    for (let page = 1; !known; page++) {
      const data =
        (await this.#api(
          `/commits?sha=${start}&path=${file}&per_page=${perPage}&page=${page}`
        )) ?? [];
      for (const { sha } of data) {
        if (previous) {
          links.push([key('next', previous), sha]);
        } else {
          first = sha;
        }
        previous = sha;
        if ((await this.#cache.get(key('next', sha))) !== undefined) {
          known = true;
          break;
        }
      }
      if (data.length < perPage) {
        break;
      }
    }
    // The end of the history, unless it continues with a known commit.
    if (previous && !known) {
      links.push([key('next', previous), '']);
    }
    links.push([key('first', start), first]);
    await this.#cache.set(links);
    return first;
  }

  /**
   * Read a file at the given commit, downloaded from
   * raw.githubusercontent.com.
   *
   * @param {string} commit
   * @param {string} filePath - Path of the file inside the repository.
   * @returns {Promise<string|null>} content of the file, or null if it does
   *    not exist at the given commit
   */
  readFile(commit, filePath) {
    return this.#readUrl(
      `${GITHUB_RAW_URL}/${this.repository}/${commit}/${filePath}`
    );
  }

  /**
   * Get the paths of all files inside a folder (including sub folders) at the
   * given commit. The folders are fetched on demand.
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

  // Files are downloaded one by one, nothing to prefetch.
  async prefetchHistory() {}

  async prefetchFiles() {}

  close() {}
}
