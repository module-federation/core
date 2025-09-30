import type { StreamingMetadataResolvedState } from './types';
export declare const AsyncMetadata: typeof import("./browser-resolved-metadata").BrowserResolvedMetadata;
export declare function AsyncMetadataOutlet({ promise, }: {
    promise: Promise<StreamingMetadataResolvedState>;
}): import("react/jsx-runtime").JSX.Element;
