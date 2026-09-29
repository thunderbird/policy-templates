import { execFile } from "node:child_process";
import pathUtils from "node:path";
import { promisify } from "node:util";

import {
    FIREFOX_REPOSITORY, GITHUB_API_URL, GITHUB_RAW_URL, THUNDERBIRD_REPOSITORY,
} from "./constants.mjs";
import { InputError, readCachedUrl, readCachedValue } from "./tools.mjs";

const execFileAsync = promisify(execFile);

/**
 * Command line options (for util.parseArgs()) to select the sources.
 */
export const SOURCE_OPTIONS = {
    "local": { type: "string" },
    "local-tb": { type: "string" },
    "local-ff": { type: "string" },
};

export const SOURCE_USAGE = `
   --local=path     - Path to a local Firefox checkout with a Thunderbird checkout
                      in its comm/ folder. Reads both repositories locally.
   --local-tb=path  - Path to a local Thunderbird checkout.
   --local-ff=path  - Path to a local Firefox checkout.

   Repositories without a local checkout are read from GitHub.`;

/**
 * Read files and their history from a local git repository, using the native
 * git command.
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
     * Verify that the local folder is a git repository.
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
     * Resolve a branch to a commit. A local branch is preferred over the remote
     * (origin) branch, so local commits which have not been pushed are used.
     *
     * @param {string} name - Name of the branch, e.g. "esr140".
     * @returns {Promise<string|null>} the commit, or null if the branch does not
     *    exist
     */
    async resolveBranch(name) {
        for (const ref of [`refs/heads/${name}`, `refs/remotes/origin/${name}`]) {
            try {
                return (await this.#git(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`])).trim();
            } catch {
            }
        }
        return null;
    }

    /**
     * Get the commits in the history of the given commit which modified the
     * given file, newest first.
     *
     * @param {string} commit
     * @param {string} path - Path of the file inside the repository.
     * @returns {Promise<string[]>}
     */
    async getFileHistory(commit, path) {
        const log = await this.#git(["rev-list", commit, "--", path]);
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
 * Read files and their history from a GitHub repository. Only the list of
 * branches and commits is requested from the GitHub API, files are downloaded
 * from raw.githubusercontent.com. Files and histories are cached, as the content
 * and the history of a file at a given commit never change. Only the list of
 * branches is requested on each run.
 */
export class GitHubSource {
    // Map of branch names to their commits, requested once.
    #branches = null;

    /**
     * @param {string} repository - The repository, e.g. "thunderbird/thunderbird-desktop".
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

    async getFileHistory(commit, path) {
        // The history of a given commit never changes and can be cached.
        const query = `/commits?sha=${commit}&path=${encodeURIComponent(path)}`;
        const history = await readCachedValue(
            `${GITHUB_API_URL}/repos/${this.repository}${query}`,
            async () => JSON.stringify((await this.#apiAllPages(query)).map(e => e.sha))
        );
        return JSON.parse(history);
    }

    async readFile(commit, path) {
        return readCachedUrl(`${GITHUB_RAW_URL}/${this.repository}/${commit}/${path}`);
    }
}

/**
 * Create the Thunderbird and Firefox sources from the parsed command line
 * options (see SOURCE_OPTIONS).
 *
 * @param {Object} options - The values returned by util.parseArgs().
 * @returns {Promise<{tb: LocalGitSource|GitHubSource, ff: LocalGitSource|GitHubSource}>}
 */
export async function createSources(options) {
    let localTb = options["local-tb"];
    let localFf = options["local-ff"];
    if (options.local) {
        if (localTb || localFf) {
            throw new InputError("--local cannot be combined with --local-tb or --local-ff.");
        }
        localTb = pathUtils.join(options.local, "comm");
        localFf = options.local;
    }

    const tb = localTb
        ? new LocalGitSource(localTb)
        : new GitHubSource(THUNDERBIRD_REPOSITORY);
    const ff = localFf
        ? new LocalGitSource(localFf)
        : new GitHubSource(FIREFOX_REPOSITORY);

    return { tb: await tb.init(), ff: await ff.init() };
}
