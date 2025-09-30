import { use, useContext } from 'react';
import { ServerInsertedMetadataContext } from '../../../shared/lib/server-inserted-metadata.shared-runtime';
// Receives a metadata resolver setter from the context, and will pass the metadata resolving promise to
// the context where we gonna use it to resolve the metadata, and render as string to append in <body>.
const useServerInsertedMetadata = (metadataResolver)=>{
    const setMetadataResolver = useContext(ServerInsertedMetadataContext);
    if (setMetadataResolver) {
        setMetadataResolver(metadataResolver);
    }
};
export function ServerInsertMetadata(param) {
    let { promise } = param;
    // Apply use() to the metadata promise to suspend the rendering in SSR.
    const { metadata } = use(promise);
    // Insert metadata into the HTML stream through the `useServerInsertedMetadata`
    useServerInsertedMetadata(()=>metadata);
    return null;
}

//# sourceMappingURL=server-inserted-metadata.js.map