import assert from "node:assert/strict";
import { test } from "node:test";

import { getSupportedBranches } from "../modules/branches.mjs";
import { OLDEST_ESR } from "../modules/constants.mjs";

test("the docs are built for main, beta, release and the ESR branches from OLDEST_ESR on", async () => {
    const app = {
        listBranches: async () => [
            "autoland", `esr${OLDEST_ESR - 26}`, `esr${OLDEST_ESR - 13}`, `esr${OLDEST_ESR}`, `esr${OLDEST_ESR + 25}`,
            "release", "main", "beta", "ESR_140_3_X_RELBRANCH", "esr",
        ],
    };
    assert.deepEqual(await getSupportedBranches(app), ["main", "beta", "release", `esr${OLDEST_ESR + 25}`, `esr${OLDEST_ESR}`]);
});
