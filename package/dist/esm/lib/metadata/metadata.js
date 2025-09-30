import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { Suspense, cache, cloneElement } from 'react';
import { AppleWebAppMeta, FormatDetectionMeta, ItunesMeta, BasicMeta, ViewportMeta, VerificationMeta, FacebookMeta, PinterestMeta } from './generate/basic';
import { AlternatesMetadata } from './generate/alternate';
import { OpenGraphMetadata, TwitterMetadata, AppLinksMeta } from './generate/opengraph';
import { IconsMetadata } from './generate/icons';
import { resolveMetadata, resolveViewport } from './resolve-metadata';
import { MetaFilter } from './generate/meta';
import { isHTTPAccessFallbackError } from '../../client/components/http-access-fallback/http-access-fallback';
import { METADATA_BOUNDARY_NAME, VIEWPORT_BOUNDARY_NAME } from './metadata-constants';
import { AsyncMetadata, AsyncMetadataOutlet } from '../../client/components/metadata/async-metadata';
import { isPostpone } from '../../server/lib/router-utils/is-postpone';
import { createServerSearchParamsForMetadata } from '../../server/request/search-params';
// Use a promise to share the status of the metadata resolving,
// returning two components `MetadataTree` and `MetadataOutlet`
// `MetadataTree` is the one that will be rendered at first in the content sequence for metadata tags.
// `MetadataOutlet` is the one that will be rendered under error boundaries for metadata resolving errors.
// In this way we can let the metadata tags always render successfully,
// and the error will be caught by the error boundary and trigger fallbacks.
export function createMetadataComponents({ tree, parsedQuery, metadataContext, getDynamicParamFromSegment, appUsingSizeAdjustment, errorType, workStore, MetadataBoundary, ViewportBoundary, serveStreamingMetadata }) {
    const searchParams = createServerSearchParamsForMetadata(parsedQuery, workStore);
    function ViewportTree() {
        return /*#__PURE__*/ _jsxs(_Fragment, {
            children: [
                /*#__PURE__*/ _jsx(ViewportBoundary, {
                    children: /*#__PURE__*/ _jsx(Viewport, {})
                }),
                appUsingSizeAdjustment ? /*#__PURE__*/ _jsx("meta", {
                    name: "next-size-adjust",
                    content: ""
                }) : null
            ]
        });
    }
    function MetadataTree() {
        return /*#__PURE__*/ _jsx(MetadataBoundary, {
            children: /*#__PURE__*/ _jsx(Metadata, {})
        });
    }
    function viewport() {
        return getResolvedViewport(tree, searchParams, getDynamicParamFromSegment, workStore, errorType);
    }
    async function Viewport() {
        try {
            return await viewport();
        } catch (error) {
            if (!errorType && isHTTPAccessFallbackError(error)) {
                try {
                    return await getNotFoundViewport(tree, searchParams, getDynamicParamFromSegment, workStore);
                } catch  {}
            }
            // We don't actually want to error in this component. We will
            // also error in the MetadataOutlet which causes the error to
            // bubble from the right position in the page to be caught by the
            // appropriate boundaries
            return null;
        }
    }
    Viewport.displayName = VIEWPORT_BOUNDARY_NAME;
    function metadata() {
        return getResolvedMetadata(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore, errorType);
    }
    async function resolveFinalMetadata() {
        let result;
        let error = null;
        try {
            result = await metadata();
            return {
                metadata: result,
                error: null,
                digest: undefined
            };
        } catch (metadataErr) {
            error = metadataErr;
            if (!errorType && isHTTPAccessFallbackError(metadataErr)) {
                try {
                    result = await getNotFoundMetadata(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore);
                    return {
                        metadata: result,
                        error,
                        digest: error == null ? void 0 : error.digest
                    };
                } catch (notFoundMetadataErr) {
                    error = notFoundMetadataErr;
                    // In PPR rendering we still need to throw the postpone error.
                    // If metadata is postponed, React needs to be aware of the location of error.
                    if (serveStreamingMetadata && isPostpone(notFoundMetadataErr)) {
                        throw notFoundMetadataErr;
                    }
                }
            }
            // In PPR rendering we still need to throw the postpone error.
            // If metadata is postponed, React needs to be aware of the location of error.
            if (serveStreamingMetadata && isPostpone(metadataErr)) {
                throw metadataErr;
            }
            // We don't actually want to error in this component. We will
            // also error in the MetadataOutlet which causes the error to
            // bubble from the right position in the page to be caught by the
            // appropriate boundaries
            return {
                metadata: result,
                error,
                digest: error == null ? void 0 : error.digest
            };
        }
    }
    async function Metadata() {
        const promise = resolveFinalMetadata();
        if (serveStreamingMetadata) {
            return /*#__PURE__*/ _jsx(Suspense, {
                fallback: null,
                children: /*#__PURE__*/ _jsx(AsyncMetadata, {
                    promise: promise
                })
            });
        }
        const metadataState = await promise;
        return metadataState.metadata;
    }
    Metadata.displayName = METADATA_BOUNDARY_NAME;
    async function getMetadataReady() {
        // Only warm up metadata() call when it's blocking metadata,
        // otherwise it will be fully managed by AsyncMetadata component.
        if (!serveStreamingMetadata) {
            await metadata();
        }
        return undefined;
    }
    async function getViewportReady() {
        await viewport();
        return undefined;
    }
    function StreamingMetadataOutlet() {
        if (serveStreamingMetadata) {
            return /*#__PURE__*/ _jsx(AsyncMetadataOutlet, {
                promise: resolveFinalMetadata()
            });
        }
        return null;
    }
    return {
        ViewportTree,
        MetadataTree,
        getViewportReady,
        getMetadataReady,
        StreamingMetadataOutlet
    };
}
const getResolvedMetadata = cache(getResolvedMetadataImpl);
async function getResolvedMetadataImpl(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore, errorType) {
    const errorConvention = errorType === 'redirect' ? undefined : errorType;
    return renderMetadata(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore, errorConvention);
}
const getNotFoundMetadata = cache(getNotFoundMetadataImpl);
async function getNotFoundMetadataImpl(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore) {
    const notFoundErrorConvention = 'not-found';
    return renderMetadata(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore, notFoundErrorConvention);
}
const getResolvedViewport = cache(getResolvedViewportImpl);
async function getResolvedViewportImpl(tree, searchParams, getDynamicParamFromSegment, workStore, errorType) {
    const errorConvention = errorType === 'redirect' ? undefined : errorType;
    return renderViewport(tree, searchParams, getDynamicParamFromSegment, workStore, errorConvention);
}
const getNotFoundViewport = cache(getNotFoundViewportImpl);
async function getNotFoundViewportImpl(tree, searchParams, getDynamicParamFromSegment, workStore) {
    const notFoundErrorConvention = 'not-found';
    return renderViewport(tree, searchParams, getDynamicParamFromSegment, workStore, notFoundErrorConvention);
}
async function renderMetadata(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore, errorConvention) {
    const resolvedMetadata = await resolveMetadata(tree, searchParams, errorConvention, getDynamicParamFromSegment, workStore, metadataContext);
    const elements = createMetadataElements(resolvedMetadata);
    return /*#__PURE__*/ _jsx(_Fragment, {
        children: elements.map((el, index)=>{
            return /*#__PURE__*/ cloneElement(el, {
                key: index
            });
        })
    });
}
async function renderViewport(tree, searchParams, getDynamicParamFromSegment, workStore, errorConvention) {
    const resolvedViewport = await resolveViewport(tree, searchParams, errorConvention, getDynamicParamFromSegment, workStore);
    const elements = createViewportElements(resolvedViewport);
    return /*#__PURE__*/ _jsx(_Fragment, {
        children: elements.map((el, index)=>{
            return /*#__PURE__*/ cloneElement(el, {
                key: index
            });
        })
    });
}
function createMetadataElements(metadata) {
    return MetaFilter([
        BasicMeta({
            metadata
        }),
        AlternatesMetadata({
            alternates: metadata.alternates
        }),
        ItunesMeta({
            itunes: metadata.itunes
        }),
        FacebookMeta({
            facebook: metadata.facebook
        }),
        PinterestMeta({
            pinterest: metadata.pinterest
        }),
        FormatDetectionMeta({
            formatDetection: metadata.formatDetection
        }),
        VerificationMeta({
            verification: metadata.verification
        }),
        AppleWebAppMeta({
            appleWebApp: metadata.appleWebApp
        }),
        OpenGraphMetadata({
            openGraph: metadata.openGraph
        }),
        TwitterMetadata({
            twitter: metadata.twitter
        }),
        AppLinksMeta({
            appLinks: metadata.appLinks
        }),
        IconsMetadata({
            icons: metadata.icons
        })
    ]);
}
function createViewportElements(viewport) {
    return MetaFilter([
        ViewportMeta({
            viewport: viewport
        })
    ]);
}

//# sourceMappingURL=metadata.js.map