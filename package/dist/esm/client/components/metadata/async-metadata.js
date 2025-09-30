'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense, use } from 'react';
export const AsyncMetadata = typeof window === 'undefined' ? require('./server-inserted-metadata').ServerInsertMetadata : require('./browser-resolved-metadata').BrowserResolvedMetadata;
function MetadataOutlet(param) {
    let { promise } = param;
    const { error, digest } = use(promise);
    if (error) {
        if (digest) {
            // The error will lose its original digest after passing from server layer to client layer；
            // We recover the digest property here to override the React created one if original digest exists.
            ;
            error.digest = digest;
        }
        throw error;
    }
    return null;
}
export function AsyncMetadataOutlet(param) {
    let { promise } = param;
    return /*#__PURE__*/ _jsx(Suspense, {
        fallback: null,
        children: /*#__PURE__*/ _jsx(MetadataOutlet, {
            promise: promise
        })
    });
}

//# sourceMappingURL=async-metadata.js.map