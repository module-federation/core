import React from 'react';
import type { GetDynamicParamFromSegment } from '../../server/app-render/app-render';
import type { LoaderTree } from '../../server/lib/app-dir-module';
import type { SearchParams } from '../../server/request/search-params';
import { type MetadataErrorType } from './resolve-metadata';
import type { MetadataContext } from './types/resolvers';
import type { WorkStore } from '../../server/app-render/work-async-storage.external';
export declare function createMetadataComponents({ tree, parsedQuery, metadataContext, getDynamicParamFromSegment, appUsingSizeAdjustment, errorType, workStore, MetadataBoundary, ViewportBoundary, serveStreamingMetadata, }: {
    tree: LoaderTree;
    parsedQuery: SearchParams;
    metadataContext: MetadataContext;
    getDynamicParamFromSegment: GetDynamicParamFromSegment;
    appUsingSizeAdjustment: boolean;
    errorType?: MetadataErrorType | 'redirect';
    workStore: WorkStore;
    MetadataBoundary: (props: {
        children: React.ReactNode;
    }) => React.ReactNode;
    ViewportBoundary: (props: {
        children: React.ReactNode;
    }) => React.ReactNode;
    serveStreamingMetadata: boolean;
}): {
    MetadataTree: React.ComponentType;
    ViewportTree: React.ComponentType;
    getMetadataReady: () => Promise<void>;
    getViewportReady: () => Promise<void>;
    StreamingMetadataOutlet: React.ComponentType;
};
