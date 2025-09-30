// We share the tags manifest between the "use cache" handlers and the previous
// file-system cache.
export const tagsManifest = new Map();
export const isStale = (tags, timestamp)=>{
    for (const tag of tags){
        const revalidatedAt = tagsManifest.get(tag);
        if (typeof revalidatedAt === 'number' && revalidatedAt >= timestamp) {
            return true;
        }
    }
    return false;
};

//# sourceMappingURL=tags-manifest.external.js.map