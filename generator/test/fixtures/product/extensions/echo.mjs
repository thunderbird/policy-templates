// A test extension: it renders the context it gets, see product.test.mjs.
export default async function ({ product, branch, branches, schema, compatibility, cachedFetch, ...rest }) {
    const resolved = await schema();
    return [
        `product: ${product}`,
        `branch: ${branch}`,
        ...branches.map(b => `branches: ${b.branch} | ${b.name} | ${b.version} | ${b.docsUrl}`),
        `schema: ${resolved.properties.Flag.description} | ${resolved.properties.Flag.description.includes("{")}`,
        `compatibility: ${JSON.stringify(compatibility[0])}`,
        `frozen: ${Object.isFrozen(branches) && Object.isFrozen(branches[0]) && Object.isFrozen(compatibility[0]) && Object.isFrozen(resolved.properties)}`,
        `cachedFetch: ${typeof cachedFetch}`,
        `other keys: ${Object.keys(rest).join(", ") || "none"}`,
        // Not a placeholder anymore once inserted.
        "__branches__",
        "",
    ].join("\n");
}
