import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import pathUtils from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Create a function which runs git in a local repository.
 *
 * @param {string} dir
 * @returns {function(...string): Promise<string>} the trimmed output
 */
export function gitIn(dir) {
    return async (...args) => (await execFileAsync("git", [
        "-C", dir, "-c", "user.name=Test", "-c", "user.email=test@example.com", ...args,
    ])).stdout.trim();
}

/**
 * Create a repository like the ones of the products: a policy "New" landed on
 * main for version 92 and was uplifted to the 91 line, which was then merged
 * into the 92 line on merge day, taking the whole content of the 92 line (like
 * "Promote beta to release"). The file history of the release branch only
 * includes the uplift if the merged in line is walked as well. Partial clones
 * from it are allowed.
 *
 * @param {string} dir
 * @returns {Promise<{git: function, uplift: string, landing: string}>}
 */
export async function createReleaseRepository(dir) {
    const git = gitIn(dir);
    const commit = async (version, policies, message) => {
        await fs.writeFile(pathUtils.join(dir, "version.txt"), `${version}\n`);
        await fs.writeFile(pathUtils.join(dir, "schema.json"), JSON.stringify({ properties: policies }));
        await git("add", "version.txt", "schema.json");
        await git("commit", "--quiet", "-m", message);
        return git("rev-parse", "HEAD");
    };
    await git("init", "--quiet", "--initial-branch=main");
    await git("config", "uploadpack.allowFilter", "true");
    await commit("91.0a1", { Old: {} }, "base");
    await git("checkout", "--quiet", "-b", "release");
    const uplift = await commit("91.0", { Old: {}, New: {} }, "uplift of New to 91");
    await git("checkout", "--quiet", "main");
    const landing = await commit("92.0a1", { Old: {}, New: {} }, "New lands on main");
    // Merge day: the release branch continues with the content of the 92 line.
    await git("checkout", "--quiet", "-b", "promote");
    await git("merge", "--quiet", "-s", "ours", "-m", "Promote beta to release", "release");
    await git("branch", "--quiet", "-f", "release", "promote");
    await git("checkout", "--quiet", "main");
    return { git, uplift, landing };
}

/**
 * Replace fetch by an implementation of the GitHub API's file history
 * (/commits?sha=&path=), answered with plain git log of a local repository,
 * which follows the same parents at merges.
 *
 * @param {function} git - Runs git in the local repository.
 * @param {string[]} requests - Receives the requested URLs.
 * @returns {function} restores fetch
 */
export function mockHistoryApi(git, requests) {
    const realFetch = globalThis.fetch;
    globalThis.fetch = async url => {
        requests.push(url);
        const query = new URL(url).searchParams;
        const size = Number(query.get("per_page"));
        const page = Number(query.get("page"));
        const log = (await git("rev-list", query.get("sha"), "--", query.get("path"))).split("\n").filter(Boolean);
        const body = log.slice((page - 1) * size, page * size).map(sha => ({ sha }));
        return new Response(JSON.stringify(body), { status: 200 });
    };
    return () => {
        globalThis.fetch = realFetch;
    };
}
