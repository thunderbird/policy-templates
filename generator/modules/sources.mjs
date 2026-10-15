import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import pathUtils from "node:path";
import { promisify } from "node:util";

import { CommitGraph, getSideParents } from "./commit_graph.mjs";
import {
    GITHUB_API_URL, GITHUB_RAW_URL, GIT_CACHE_DIR, MOZILLA_POLICY_TEMPLATES_REPOSITORY,
} from "./constants.mjs";
import { InputError, getCachedValue, readCachedUrl, setCachedValues } from "./tools.mjs";

const execFileAsync = promisify(execFile);

/**
 * Command line options (for util.parseArgs()) to select the sources.
 */
export const SOURCE_OPTIONS = {
    "product-config": { type: "string" },
    "checkout": { type: "string" },
};

export const SOURCE_USAGE = `
   --product-config=path
                      - The product folder (required), e.g.
                        products/thunderbird, see its product.yaml.
   --checkout=path    - Path to a local checkout of the product's repository,
                        e.g. to generate the documentation for local, not yet
                        pushed changes. Without it, the product is read from
                        GitHub (source.repository in product.yaml), with a
                        local clone of its commit graph (no files) in
                        generator/git-cache/. Set GITHUB_TOKEN to raise the
                        limit of the GitHub API.
   In a local checkout, the branch "main" is its working tree: whatever is
   checked out, including uncommitted changes. Other branches are read from
   their local branch, else from origin.

   Mozilla's base ADMX/ADML files are always read from
   https://github.com/${MOZILLA_POLICY_TEMPLATES_REPOSITORY}.`;

// The main branch of the product's repository. In a local checkout, it is read
// from the working tree.
const MAIN_BRANCH = "main";
const WORKING_TREE_BRANCH = MAIN_BRANCH;

/**
 * The "commit" of the working tree of a local checkout: what is checked out,
 * including uncommitted changes.
 */
export const WORKING_TREE = "WORKING_TREE";

/**
 * Read files and their history from a local git repository, using the native
 * git command. The branch "main" is the working tree of the checkout.
 */
export class LocalGitSource {
    /**
     * @param {string} dir - Path to the local git repository.
     */
    constructor(dir) {
        this.dir = dir;
        this.description = dir;
    }

    async #git(args) {
        const { stdout } = await execFileAsync("git", ["-C", this.dir, ...args], {
            maxBuffer: 64 * 1024 * 1024,
        });
        return stdout;
    }

    /**
     * Verify that the local folder is a git repository whose history can be
     * used: it must not be a shallow clone, and it should have a main branch
     * (see getFileHistory()).
     *
     * @returns {Promise<LocalGitSource>}
     */
    async init() {
        try {
            await this.#git(["rev-parse", "--git-dir"]);
        } catch (ex) {
            throw new InputError(ex.code == "ENOENT"
                ? "The git command is not available."
                : `${this.dir} is not a git repository.`
            );
        }
        if ((await this.#git(["rev-parse", "--is-shallow-repository"])).trim() == "true") {
            throw new InputError(
                `${this.dir} is a shallow clone, its history is incomplete and the versions in which ` +
                `policies became available would be wrong. Run "git fetch --unshallow" in it, or ` +
                `omit --checkout to read the product from GitHub.`
            );
        }
        if (!await this.#getMainRef()) {
            console.warn(
                ` !! ${this.dir} has no branch "${MAIN_BRANCH}" (neither local nor origin): uplifts ` +
                `merged into other branches can't be found, their versions may be too late.`
            );
        }
        return this;
    }

    /**
     * Get the names of all local and remote (origin) branches.
     *
     * @returns {Promise<string[]>}
     */
    async listBranches() {
        const refs = await this.#git([
            "for-each-ref", "--format=%(refname)", "refs/heads/", "refs/remotes/origin/"
        ]);
        const names = refs.split("\n").filter(Boolean).map(
            ref => ref.replace(/^refs\/(heads|remotes\/origin)\//, "")
        );
        return [...new Set(names)].filter(name => name != "HEAD");
    }

    /**
     * Resolve a branch to a commit. The branch "main" is the working tree
     * (WORKING_TREE). For other branches, a local branch is preferred over the
     * remote (origin) branch, so local commits which have not been pushed are
     * used.
     *
     * @param {string} name - Name of the branch, e.g. "esr140".
     * @returns {Promise<string|null>} the commit, or null if the branch does not
     *    exist
     */
    async resolveBranch(name) {
        if (name == WORKING_TREE_BRANCH) {
            return WORKING_TREE;
        }
        for (const ref of [`refs/heads/${name}`, `refs/remotes/origin/${name}`]) {
            try {
                return (await this.#git(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`])).trim();
            } catch {
            }
        }
        return null;
    }

    /**
     * Get the ref of the main branch: the local branch, else the remote one.
     *
     * @returns {Promise<string|null>} null if there is no main branch
     */
    async #getMainRef() {
        for (const ref of [`refs/heads/${MAIN_BRANCH}`, `refs/remotes/origin/${MAIN_BRANCH}`]) {
            try {
                await this.#git(["rev-parse", "--verify", "--quiet", ref]);
                return ref;
            } catch {
            }
        }
        return null;
    }

    /**
     * Get the commits in the history of the given commit which modified the
     * given file, including the lines merged in from outside of main (see
     * commit_graph.mjs).
     *
     * @param {string} commit
     * @param {string} path - Path of the file inside the repository.
     * @returns {Promise<string[]>}
     */
    async getFileHistory(commit, path) {
        // The working tree is the newest revision, followed by the history of
        // what is checked out.
        if (commit == WORKING_TREE) {
            return [WORKING_TREE, ...await this.getFileHistory("HEAD", path)];
        }
        const main = await this.#getMainRef();
        const sideParents = main ? await getSideParents(args => this.#git(args), commit, main) : [];
        // A single walk from all commits returns the union of their histories.
        const log = await this.#git(["rev-list", commit, ...sideParents, "--", path]);
        return log.split("\n").filter(Boolean);
    }

    /**
     * Read a file at the given commit.
     *
     * @param {string} commit
     * @param {string} path - Path of the file inside the repository.
     * @returns {Promise<string|null>} content of the file, or null if it does not
     *    exist at the given commit
     */
    async readFile(commit, path) {
        if (commit == WORKING_TREE) {
            try {
                return await fs.readFile(pathUtils.join(this.dir, path), "utf8");
            } catch (ex) {
                if (ex.code == "ENOENT") {
                    return null;
                }
                throw ex;
            }
        }
        try {
            return await this.#git(["show", `${commit}:${path}`]);
        } catch (ex) {
            if (/does not exist|exists on disk, but not in/.test(ex.stderr)) {
                return null;
            }
            throw ex;
        }
    }
}

/**
 * Read files and their history from a GitHub repository. Files are downloaded
 * from raw.githubusercontent.com, the histories of files are requested from
 * the GitHub API. With the commit graph of the repository (see
 * commit_graph.mjs), the branches are read from it, and the history of a file
 * includes the lines merged in from outside of main. Files and histories are
 * cached, as the content and the history of a file at a given commit never
 * change.
 */
export class GitHubSource {
    // Map of branch names to their commits, requested once (without a commit
    // graph).
    #branches = null;
    #graph = null;

    /**
     * @param {string} repository - The repository, e.g. "thunderbird/thunderbird-desktop".
     * @param {Object} [options]
     * @param {CommitGraph} [options.graph] - The commit graph of the repository.
     */
    constructor(repository, { graph = null } = {}) {
        this.repository = repository;
        this.description = `https://github.com/${repository}`;
        this.#graph = graph;
    }

    async init() {
        return this;
    }

    async #api(path) {
        const url = `${GITHUB_API_URL}/repos/${this.repository}${path}`;
        const headers = { Accept: "application/vnd.github+json" };
        if (process.env.GITHUB_TOKEN) {
            headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        }
        console.log(` - requesting ${url}`);
        const response = await fetch(url, { headers });
        if (response.status == 404) {
            return null;
        }
        if (!response.ok) {
            const hint = [403, 429].includes(response.status) && !process.env.GITHUB_TOKEN
                ? " The API rate limit may be exceeded, set GITHUB_TOKEN to raise it."
                : "";
            throw new Error(`GitHub API error: ${response.status} ${response.statusText} (${url}).${hint}`);
        }
        return response.json();
    }

    async #apiAllPages(path) {
        const perPage = 100;
        const separator = path.includes("?") ? "&" : "?";
        let entries = [];
        for (let page = 1; ; page++) {
            const data = await this.#api(`${path}${separator}per_page=${perPage}&page=${page}`) ?? [];
            entries.push(...data);
            if (data.length < perPage) {
                return entries;
            }
        }
    }

    async #getBranches() {
        if (!this.#branches) {
            this.#branches = new Map(
                (await this.#apiAllPages("/branches")).map(e => [e.name, e.commit.sha])
            );
        }
        return this.#branches;
    }

    async listBranches() {
        if (this.#graph) {
            return this.#graph.listBranches();
        }
        return [...(await this.#getBranches()).keys()];
    }

    async resolveBranch(name) {
        if (this.#graph) {
            return this.#graph.resolveBranch(name);
        }
        return (await this.#getBranches()).get(name) ?? null;
    }

    /**
     * Get the commits in the history of the given commit which modified the
     * given file. With a commit graph, the lines merged in from outside of
     * main are included (see commit_graph.mjs).
     *
     * @param {string} commit
     * @param {string} path - Path of the file inside the repository.
     * @returns {Promise<string[]>}
     */
    async getFileHistory(commit, path) {
        const starts = [
            commit,
            ...this.#graph ? await this.#graph.getSideParents(commit, MAIN_BRANCH) : [],
        ];
        const history = new Set();
        for (const start of starts) {
            for (const sha of await this.#getSimplifiedHistory(start, path)) {
                history.add(sha);
            }
        }
        return [...history];
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
     * @param {string} path - Path of the file inside the repository.
     * @returns {Promise<string[]>} newest first
     */
    async #getSimplifiedHistory(start, path) {
        const key = (kind, sha) => `${GITHUB_API_URL}/repos/${this.repository}/history-${kind}/${sha}/${path}`;
        let first = await getCachedValue(key("first", start));
        if (first === undefined) {
            first = await this.#requestSimplifiedHistory(start, path, key);
        }
        const history = [];
        for (let sha = first; sha; sha = await getCachedValue(key("next", sha))) {
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
    async #requestSimplifiedHistory(start, path, key) {
        const perPage = 100;
        const file = encodeURIComponent(path);
        const links = [];
        let first = "";
        let previous = null;
        let known = false;
        for (let page = 1; !known; page++) {
            const data = await this.#api(`/commits?sha=${start}&path=${file}&per_page=${perPage}&page=${page}`) ?? [];
            for (const { sha } of data) {
                if (previous) {
                    links.push([key("next", previous), sha]);
                } else {
                    first = sha;
                }
                previous = sha;
                if (await getCachedValue(key("next", sha)) !== undefined) {
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
            links.push([key("next", previous), ""]);
        }
        links.push([key("first", start), first]);
        await setCachedValues(links);
        return first;
    }

    async readFile(commit, path) {
        return readCachedUrl(`${GITHUB_RAW_URL}/${this.repository}/${commit}/${path}`);
    }
}

/**
 * Create the sources from the parsed command line options (see
 * SOURCE_OPTIONS): the product's repository, and the source of Mozilla's base
 * ADMX/ADML files, which is always read from GitHub.
 *
 * @param {Object} options - The values returned by util.parseArgs().
 * @param {Product} product - See loadProduct().
 * @returns {Promise<{app: LocalGitSource|GitHubSource, mozilla: GitHubSource, product: Product}>}
 */
export async function createSources(options, product) {
    const repository = product.source.repository;
    const app = options.checkout
        ? new LocalGitSource(options.checkout)
        : new GitHubSource(repository, {
            graph: await CommitGraph.open(
                `https://github.com/${repository}.git`,
                pathUtils.join(GIT_CACHE_DIR, `${repository.replace("/", "__")}.git`)
            ),
        });
    const mozilla = new GitHubSource(MOZILLA_POLICY_TEMPLATES_REPOSITORY);
    return { app: await app.init(), mozilla: await mozilla.init(), product };
}
