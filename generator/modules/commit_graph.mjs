/**
 * The history of a file at a commit of a release branch, e.g. "release" or
 * "esr153", is more than what `git log <commit> -- <file>` (or the GitHub API)
 * returns: at a merge whose result equals one of its parents, git follows only
 * that parent. The merges of the release process ("Promote beta to release",
 * "Merge main into beta", and the "Merge old head" merges of the conversion
 * from mercurial) take their whole content from the newer line, so the older
 * line, with its uplifts and dot releases, is never visited. A policy uplifted
 * to beta 91 and landed on main for 92 is then reported as new in 92.
 *
 * The lines which are merged in this way are not part of main. Their heads are
 * the parents of the merges on the branch which are not part of main. The full
 * history of the file is the union of the histories from the commit and from
 * each of these heads. Only the commit graph is needed to find them, no files.
 */

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import pathUtils from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

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
    const lines = output => output.split("\n").filter(Boolean);
    const notOnMain = new Set(lines(await git(["rev-list", commit, `^${main}`])));
    const sideParents = new Set();
    for (const line of lines(await git(["rev-list", "--merges", "--parents", commit, `^${main}`]))) {
        const [, , ...parents] = line.split(" ");
        for (const parent of parents) {
            if (notOnMain.has(parent)) {
                sideParents.add(parent);
            }
        }
    }
    return [...sideParents];
}

/**
 * A local clone of the commit graph of a repository: commits only, without
 * folders and files (a treeless clone), which keeps it small even for large
 * repositories. It is used as a cache: a valid clone is updated, anything else
 * (missing, broken, cloned from another repository, update failed) is removed
 * and cloned again.
 */
export class CommitGraph {
    /**
     * @param {string} dir - Path of the local bare clone.
     */
    constructor(dir) {
        this.dir = dir;
    }

    async #git(args) {
        const { stdout } = await execFileAsync("git", [`--git-dir=${this.dir}`, ...args], {
            maxBuffer: 256 * 1024 * 1024,
        });
        return stdout;
    }

    /**
     * Open the local clone of the commit graph of a repository, cloning or
     * updating it as needed.
     *
     * @param {string} url - URL of the repository.
     * @param {string} dir - Path of the local bare clone.
     * @returns {Promise<CommitGraph>}
     */
    static async open(url, dir) {
        const graph = new CommitGraph(dir);
        if (!await graph.#update(url)) {
            await graph.#clone(url);
        }
        // Speeds up the graph queries. Without it, they are only slower.
        try {
            await graph.#git(["commit-graph", "write", "--reachable"]);
        } catch (ex) {
            console.warn(` !! Writing the commit-graph of ${dir} failed: ${ex.message}`);
        }
        return graph;
    }

    /**
     * Update a valid clone of the given repository.
     *
     * @returns {Promise<boolean>} false if there is no valid clone or the
     *    update failed
     */
    async #update(url) {
        try {
            const isBare = await this.#git(["rev-parse", "--is-bare-repository"]);
            const origin = await this.#git(["remote", "get-url", "origin"]);
            if (isBare.trim() != "true" || origin.trim() != url) {
                return false;
            }
        } catch {
            return false;
        }
        try {
            console.log(` - updating the commit graph in ${this.dir}`);
            await this.#git(["fetch", "--quiet", "--prune", "--no-tags", "origin"]);
            return true;
        } catch (ex) {
            console.warn(` !! Updating the commit graph failed: ${ex.message}`);
            return false;
        }
    }

    async #clone(url) {
        console.log(` - cloning the commit graph of ${url} into ${this.dir}`);
        await fs.rm(this.dir, { recursive: true, force: true });
        await fs.mkdir(pathUtils.dirname(this.dir), { recursive: true });
        await execFileAsync("git", [
            "clone", "--quiet", "--bare", "--filter=tree:0", "--no-tags", url, this.dir,
        ]);
        // A bare clone has no fetch refspec, the branches are updated in place.
        await this.#git(["config", "remote.origin.fetch", "+refs/heads/*:refs/heads/*"]);
    }

    /**
     * Get the names of all branches.
     *
     * @returns {Promise<string[]>}
     */
    async listBranches() {
        const refs = await this.#git(["for-each-ref", "--format=%(refname:short)", "refs/heads/"]);
        return refs.split("\n").filter(Boolean);
    }

    /**
     * Resolve a branch to a commit.
     *
     * @param {string} name - Name of the branch, e.g. "esr140".
     * @returns {Promise<string|null>} the commit, or null if the branch does
     *    not exist
     */
    async resolveBranch(name) {
        try {
            return (await this.#git(["rev-parse", "--verify", "--quiet", `refs/heads/${name}^{commit}`])).trim();
        } catch {
            return null;
        }
    }

    /**
     * See getSideParents().
     *
     * @param {string} commit
     * @param {string} mainBranch - Name of the main branch, e.g. "main".
     * @returns {Promise<string[]>}
     */
    getSideParents(commit, mainBranch) {
        return getSideParents(args => this.#git(args), commit, `refs/heads/${mainBranch}`);
    }
}
