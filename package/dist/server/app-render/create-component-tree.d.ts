import type { CacheNodeSeedData, PreloadCallbacks } from './types';
import React from 'react';
import type { LoaderTree } from '../lib/app-dir-module';
import type { AppRenderContext, GetDynamicParamFromSegment } from './app-render';
import type { Params } from '../request/params';
/**
 * Use the provided loader tree to create the React Component tree.
 */
export declare function createComponentTree(props: {
    loaderTree: LoaderTree;
    parentParams: Params;
    rootLayoutIncluded: boolean;
    injectedCSS: Set<string>;
    injectedJS: Set<string>;
    injectedFontPreloadTags: Set<string>;
    getMetadataReady: () => Promise<void>;
    getViewportReady: () => Promise<void>;
    ctx: AppRenderContext;
    missingSlots?: Set<string>;
    preloadCallbacks: PreloadCallbacks;
    authInterrupts: boolean;
    StreamingMetadata: React.ComponentType | null;
    StreamingMetadataOutlet: React.ComponentType;
}): Promise<CacheNodeSeedData>;
export declare function getRootParams(loaderTree: LoaderTree, getDynamicParamFromSegment: GetDynamicParamFromSegment): Params;
