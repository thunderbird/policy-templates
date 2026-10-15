import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import pathUtils from "node:path";
import { promisify } from "node:util";

import { getSideParents } from "./common/side_parents.mjs";
import { TreelessClone } from "./common/treeless_clone.mjs";
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
     * common/side_parents.mjs).
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
 * Read files from a GitHub repository, without their history: the branches
 * are requested from the GitHub API, files are downloaded from
 * raw.githubusercontent.com (cached). Used for Mozilla's base ADMX/ADML files.
 */
export class GitHubSource {
    // Map of branch names to their commits, requested once.
    #branches = null;

    /**
     * @param {string} repository - The repository, e.g. "mozilla/policy-templates".
     */
    constructor(repository) {
        this.repository = repository;
        this.description = `https://github.com/${repository}`;
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
        return [...(await this.#getBranches()).keys()];
    }

    async resolveBranch(name) {
        return (await this.#getBranches()).get(name) ?? null;
    }

    async readFile(commit, path) {
        return readCachedUrl(`${GITHUB_RAW_URL}/${this.repository}/${commit}/${path}`);
    }
}

/**
 * Open the product's repository on GitHub: a treeless clone of its commit
 * graph in GIT_CACHE_DIR, with the histories of files from the GitHub API and
 * the files from raw.githubusercontent.com, both cached in the download cache
 * (see common/treeless_clone.mjs and HISTORY.md).
 *
 * @param {string} repository - The repository, e.g. "thunderbird/thunderbird-desktop".
 * @returns {Promise<TreelessClone>}
 */
export function openProductRepository(repository) {
    return TreelessClone.open(
        `https://github.com/${repository}.git`,
        pathUtils.join(GIT_CACHE_DIR, `${repository.replace("/", "__")}.git`),
        {
            repository,
            cache: { get: getCachedValue, set: setCachedValues },
            readUrl: readCachedUrl,
        }
    );
}

/**
 * Create the sources from the parsed command line options (see
 * SOURCE_OPTIONS): the product's repository, and the source of Mozilla's base
 * ADMX/ADML files, which is always read from GitHub.
 *
 * @param {Object} options - The values returned by util.parseArgs().
 * @param {Product} product - See loadProduct().
 * @returns {Promise<{app: LocalGitSource|TreelessClone, mozilla: GitHubSource, product: Product}>}
 */
export async function createSources(options, product) {
    const app = options.checkout
        ? await new LocalGitSource(options.checkout).init()
        : await openProductRepository(product.source.repository);
    const mozilla = new GitHubSource(MOZILLA_POLICY_TEMPLATES_REPOSITORY);
    return { app, mozilla: await mozilla.init(), product };
}

/**
 * Release the sources created by createSources() (e.g. the git process of a
 * BloblessClone, which would keep the generator from exiting).
 *
 * @param {{app: LocalGitSource|TreelessClone}} sources
 */
export function closeSources(sources) {
    sources.app.close?.();
}
