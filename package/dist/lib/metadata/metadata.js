"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createMetadataComponents", {
    enumerable: true,
    get: function() {
        return createMetadataComponents;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _basic = require("./generate/basic");
const _alternate = require("./generate/alternate");
const _opengraph = require("./generate/opengraph");
const _icons = require("./generate/icons");
const _resolvemetadata = require("./resolve-metadata");
const _meta = require("./generate/meta");
const _httpaccessfallback = require("../../client/components/http-access-fallback/http-access-fallback");
const _metadataconstants = require("./metadata-constants");
const _asyncmetadata = require("../../client/components/metadata/async-metadata");
const _ispostpone = require("../../server/lib/router-utils/is-postpone");
const _searchparams = require("../../server/request/search-params");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function createMetadataComponents({ tree, parsedQuery, metadataContext, getDynamicParamFromSegment, appUsingSizeAdjustment, errorType, workStore, MetadataBoundary, ViewportBoundary, serveStreamingMetadata }) {
    const searchParams = (0, _searchparams.createServerSearchParamsForMetadata)(parsedQuery, workStore);
    function ViewportTree() {
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsx)(ViewportBoundary, {
                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)(Viewport, {})
                }),
                appUsingSizeAdjustment ? /*#__PURE__*/ (0, _jsxruntime.jsx)("meta", {
                    name: "next-size-adjust",
                    content: ""
                }) : null
            ]
        });
    }
    function MetadataTree() {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(MetadataBoundary, {
            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(Metadata, {})
        });
    }
    function viewport() {
        return getResolvedViewport(tree, searchParams, getDynamicParamFromSegment, workStore, errorType);
    }
    async function Viewport() {
        try {
            return await viewport();
        } catch (error) {
            if (!errorType && (0, _httpaccessfallback.isHTTPAccessFallbackError)(error)) {
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
    Viewport.displayName = _metadataconstants.VIEWPORT_BOUNDARY_NAME;
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
            if (!errorType && (0, _httpaccessfallback.isHTTPAccessFallbackError)(metadataErr)) {
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
                    if (serveStreamingMetadata && (0, _ispostpone.isPostpone)(notFoundMetadataErr)) {
                        throw notFoundMetadataErr;
                    }
                }
            }
            // In PPR rendering we still need to throw the postpone error.
            // If metadata is postponed, React needs to be aware of the location of error.
            if (serveStreamingMetadata && (0, _ispostpone.isPostpone)(metadataErr)) {
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
            return /*#__PURE__*/ (0, _jsxruntime.jsx)(_react.Suspense, {
                fallback: null,
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_asyncmetadata.AsyncMetadata, {
                    promise: promise
                })
            });
        }
        const metadataState = await promise;
        return metadataState.metadata;
    }
    Metadata.displayName = _metadataconstants.METADATA_BOUNDARY_NAME;
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
            return /*#__PURE__*/ (0, _jsxruntime.jsx)(_asyncmetadata.AsyncMetadataOutlet, {
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
const getResolvedMetadata = (0, _react.cache)(getResolvedMetadataImpl);
async function getResolvedMetadataImpl(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore, errorType) {
    const errorConvention = errorType === 'redirect' ? undefined : errorType;
    return renderMetadata(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore, errorConvention);
}
const getNotFoundMetadata = (0, _react.cache)(getNotFoundMetadataImpl);
async function getNotFoundMetadataImpl(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore) {
    const notFoundErrorConvention = 'not-found';
    return renderMetadata(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore, notFoundErrorConvention);
}
const getResolvedViewport = (0, _react.cache)(getResolvedViewportImpl);
async function getResolvedViewportImpl(tree, searchParams, getDynamicParamFromSegment, workStore, errorType) {
    const errorConvention = errorType === 'redirect' ? undefined : errorType;
    return renderViewport(tree, searchParams, getDynamicParamFromSegment, workStore, errorConvention);
}
const getNotFoundViewport = (0, _react.cache)(getNotFoundViewportImpl);
async function getNotFoundViewportImpl(tree, searchParams, getDynamicParamFromSegment, workStore) {
    const notFoundErrorConvention = 'not-found';
    return renderViewport(tree, searchParams, getDynamicParamFromSegment, workStore, notFoundErrorConvention);
}
async function renderMetadata(tree, searchParams, getDynamicParamFromSegment, metadataContext, workStore, errorConvention) {
    const resolvedMetadata = await (0, _resolvemetadata.resolveMetadata)(tree, searchParams, errorConvention, getDynamicParamFromSegment, workStore, metadataContext);
    const elements = createMetadataElements(resolvedMetadata);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
        children: elements.map((el, index)=>{
            return /*#__PURE__*/ (0, _react.cloneElement)(el, {
                key: index
            });
        })
    });
}
async function renderViewport(tree, searchParams, getDynamicParamFromSegment, workStore, errorConvention) {
    const resolvedViewport = await (0, _resolvemetadata.resolveViewport)(tree, searchParams, errorConvention, getDynamicParamFromSegment, workStore);
    const elements = createViewportElements(resolvedViewport);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
        children: elements.map((el, index)=>{
            return /*#__PURE__*/ (0, _react.cloneElement)(el, {
                key: index
            });
        })
    });
}
function createMetadataElements(metadata) {
    return (0, _meta.MetaFilter)([
        (0, _basic.BasicMeta)({
            metadata
        }),
        (0, _alternate.AlternatesMetadata)({
            alternates: metadata.alternates
        }),
        (0, _basic.ItunesMeta)({
            itunes: metadata.itunes
        }),
        (0, _basic.FacebookMeta)({
            facebook: metadata.facebook
        }),
        (0, _basic.PinterestMeta)({
            pinterest: metadata.pinterest
        }),
        (0, _basic.FormatDetectionMeta)({
            formatDetection: metadata.formatDetection
        }),
        (0, _basic.VerificationMeta)({
            verification: metadata.verification
        }),
        (0, _basic.AppleWebAppMeta)({
            appleWebApp: metadata.appleWebApp
        }),
        (0, _opengraph.OpenGraphMetadata)({
            openGraph: metadata.openGraph
        }),
        (0, _opengraph.TwitterMetadata)({
            twitter: metadata.twitter
        }),
        (0, _opengraph.AppLinksMeta)({
            appLinks: metadata.appLinks
        }),
        (0, _icons.IconsMetadata)({
            icons: metadata.icons
        })
    ]);
}
function createViewportElements(viewport) {
    return (0, _meta.MetaFilter)([
        (0, _basic.ViewportMeta)({
            viewport: viewport
        })
    ]);
}

//# sourceMappingURL=metadata.js.map