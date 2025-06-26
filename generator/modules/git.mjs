import fs from 'fs-extra';
import * as git from 'isomorphic-git';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const http = require('isomorphic-git/http/node');

const DEBUG_SKIP_GITHUB_PULL = false;

/**
 * Clone or pull a github repository.
 * 
 * @param {string} url - url to the repository
 * @param {string} ref - branch/tag to checkout, "master" or "v3.0"
 * @param {string} dir - directory to store templates in
 */
export async function pullGitRepository(url, ref, dir) {
    if (DEBUG_SKIP_GITHUB_PULL)
        return;

    if (!fs.existsSync(dir)) {
        console.log(`Cloning ${url} (${ref})`);
        fs.ensureDirSync(dir);
        await git.clone({
            // Use name of the script as the name of the pulling "author".
            author: { name: "update_policy_template.js" },
            fs,
            http,
            dir,
            url,
            ref,
            singleBranch: true,
            depth: 10,
            force: true
        });
    } else {
        console.log(`Updating ${url} (${ref})`);
        await git.pull({
            // Use name of the script as the name of the pulling "author".
            author: { name: "update_policy_template.js" },
            fs,
            http,
            dir,
            ref,
            singleBranch: true,
            force: true
        });
    }
}