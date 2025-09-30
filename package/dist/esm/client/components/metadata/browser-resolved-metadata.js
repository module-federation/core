import { use } from 'react';
export function BrowserResolvedMetadata(param) {
    let { promise } = param;
    const { metadata, error } = use(promise);
    // If there's metadata error on client, discard the browser metadata
    // and let metadata outlet deal with the error. This will avoid the duplication metadata.
    if (error) return null;
    return metadata;
}

//# sourceMappingURL=browser-resolved-metadata.js.map