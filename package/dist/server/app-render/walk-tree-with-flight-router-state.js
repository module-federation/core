"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "walkTreeWithFlightRouterState", {
    enumerable: true,
    get: function() {
        return walkTreeWithFlightRouterState;
    }
});
const _matchsegments = require("../../client/components/match-segments");
const _getcssinlinedlinktags = require("./get-css-inlined-link-tags");
const _getpreloadablefonts = require("./get-preloadable-fonts");
const _createflightrouterstatefromloadertree = require("./create-flight-router-state-from-loader-tree");
const _hasloadingcomponentintree = require("./has-loading-component-in-tree");
const _segment = require("../../shared/lib/segment");
const _createcomponenttree = require("./create-component-tree");
const _getsegmentparam = require("./get-segment-param");
async function walkTreeWithFlightRouterState({ loaderTreeToFilter, parentParams, flightRouterState, parentIsInsideSharedLayout, rscHead, injectedCSS, injectedJS, injectedFontPreloadTags, rootLayoutIncluded, getViewportReady, getMetadataReady, ctx, preloadCallbacks, StreamingMetadataOutlet }) {
    const { renderOpts: { nextFontManifest, experimental }, query, isPrefetch, getDynamicParamFromSegment, parsedRequestHeaders } = ctx;
    const [segment, parallelRoutes, modules] = loaderTreeToFilter;
    const parallelRoutesKeys = Object.keys(parallelRoutes);
    const { layout } = modules;
    const isLayout = typeof layout !== 'undefined';
    /**
   * Checks if the current segment is a root layout.
   */ const rootLayoutAtThisLevel = isLayout && !rootLayoutIncluded;
    /**
   * Checks if the current segment or any level above it has a root layout.
   */ const rootLayoutIncludedAtThisLevelOrAbove = rootLayoutIncluded || rootLayoutAtThisLevel;
    // Because this function walks to a deeper point in the tree to start rendering we have to track the dynamic parameters up to the point where rendering starts
    const segmentParam = getDynamicParamFromSegment(segment);
    const currentParams = // Handle null case where dynamic param is optional
    segmentParam && segmentParam.value !== null ? {
        ...parentParams,
        [segmentParam.param]: segmentParam.value
    } : parentParams;
    const actualSegment = (0, _segment.addSearchParamsIfPageSegment)(segmentParam ? segmentParam.treeSegment : segment, query);
    /**
   * Decide if the current segment is where rendering has to start.
   */ const renderComponentsOnThisLevel = // No further router state available
    !flightRouterState || // Segment in router state does not match current segment
    !(0, _matchsegments.matchSegment)(actualSegment, flightRouterState[0]) || // Last item in the tree
    parallelRoutesKeys.length === 0 || // Explicit refresh
    flightRouterState[3] === 'refetch';
    // Pre-PPR, the `loading` component signals to the router how deep to render the component tree
    // to ensure prefetches are quick and inexpensive. If there's no `loading` component anywhere in the tree being rendered,
    // the prefetch will be short-circuited to avoid requesting a potentially very expensive subtree. If there's a `loading`
    // somewhere in the tree, we'll recursively render the component tree up until we encounter that loading component, and then stop.
    // Check if we're inside the "new" part of the navigation — inside the
    // shared layout. In the case of a prefetch, this can be true even if the
    // segment matches, because the client might send a matching segment to
    // indicate that it already has the data in its cache. But in order to find
    // the correct loading boundary, we still need to track where the shared
    // layout begins.
    //
    // TODO: We should rethink the protocol for dynamic requests. It might not
    // make sense for the client to send a FlightRouterState, since that type is
    // overloaded with other concerns.
    const isInsideSharedLayout = renderComponentsOnThisLevel || parentIsInsideSharedLayout || flightRouterState[3] === 'inside-shared-layout';
    if (isInsideSharedLayout && !experimental.isRoutePPREnabled && // If PPR is disabled, and this is a request for the route tree, then we
    // never render any components. Only send the router state.
    (parsedRequestHeaders.isRouteTreePrefetchRequest || // Otherwise, check for the presence of a `loading` component.
    isPrefetch && !Boolean(modules.loading) && !(0, _hasloadingcomponentintree.hasLoadingComponentInTree)(loaderTreeToFilter))) {
        // Send only the router state.
        // TODO: Even for a dynamic route, we should cache these responses,
        // because they do not contain any render data (neither segment data nor
        // the head). They can be made even more cacheable once we move the route
        // params into a separate data structure.
        const overriddenSegment = flightRouterState && // TODO: Why does canSegmentBeOverridden exist? Why don't we always just
        // use `actualSegment`? Is it to avoid overwriting some state that's
        // tracked by the client? Dig deeper to see if we can simplify this.
        canSegmentBeOverridden(actualSegment, flightRouterState[0]) ? flightRouterState[0] : actualSegment;
        const routerState = (0, _createflightrouterstatefromloadertree.createFlightRouterStateFromLoaderTree)(// Create router state using the slice of the loaderTree
        loaderTreeToFilter, getDynamicParamFromSegment, query);
        return [
            [
                overriddenSegment,
                routerState,
                null,
                [
                    null,
                    null
                ],
                false
            ]
        ];
    }
    if (renderComponentsOnThisLevel) {
        const overriddenSegment = flightRouterState && // TODO: Why does canSegmentBeOverridden exist? Why don't we always just
        // use `actualSegment`? Is it to avoid overwriting some state that's
        // tracked by the client? Dig deeper to see if we can simplify this.
        canSegmentBeOverridden(actualSegment, flightRouterState[0]) ? flightRouterState[0] : actualSegment;
        const routerState = (0, _createflightrouterstatefromloadertree.createFlightRouterStateFromLoaderTree)(// Create router state using the slice of the loaderTree
        loaderTreeToFilter, getDynamicParamFromSegment, query);
        // Create component tree using the slice of the loaderTree
        const seedData = await (0, _createcomponenttree.createComponentTree)(// This ensures flightRouterPath is valid and filters down the tree
        {
            ctx,
            loaderTree: loaderTreeToFilter,
            parentParams: currentParams,
            injectedCSS,
            injectedJS,
            injectedFontPreloadTags,
            // This is intentionally not "rootLayoutIncludedAtThisLevelOrAbove" as createComponentTree starts at the current level and does a check for "rootLayoutAtThisLevel" too.
            rootLayoutIncluded,
            getViewportReady,
            getMetadataReady,
            preloadCallbacks,
            authInterrupts: experimental.authInterrupts,
            StreamingMetadata: null,
            StreamingMetadataOutlet
        });
        return [
            [
                overriddenSegment,
                routerState,
                seedData,
                rscHead,
                false
            ]
        ];
    }
    // If we are not rendering on this level we need to check if the current
    // segment has a layout. If so, we need to track all the used CSS to make
    // the result consistent.
    const layoutPath = layout == null ? void 0 : layout[1];
    const injectedCSSWithCurrentLayout = new Set(injectedCSS);
    const injectedJSWithCurrentLayout = new Set(injectedJS);
    const injectedFontPreloadTagsWithCurrentLayout = new Set(injectedFontPreloadTags);
    if (layoutPath) {
        (0, _getcssinlinedlinktags.getLinkAndScriptTags)(ctx.clientReferenceManifest, layoutPath, injectedCSSWithCurrentLayout, injectedJSWithCurrentLayout, true);
        (0, _getpreloadablefonts.getPreloadableFonts)(nextFontManifest, layoutPath, injectedFontPreloadTagsWithCurrentLayout);
    }
    const paths = [];
    // Walk through all parallel routes.
    for (const parallelRouteKey of parallelRoutesKeys){
        const parallelRoute = parallelRoutes[parallelRouteKey];
        const subPaths = await walkTreeWithFlightRouterState({
            ctx,
            loaderTreeToFilter: parallelRoute,
            parentParams: currentParams,
            flightRouterState: flightRouterState && flightRouterState[1][parallelRouteKey],
            parentIsInsideSharedLayout: isInsideSharedLayout,
            rscHead,
            injectedCSS: injectedCSSWithCurrentLayout,
            injectedJS: injectedJSWithCurrentLayout,
            injectedFontPreloadTags: injectedFontPreloadTagsWithCurrentLayout,
            rootLayoutIncluded: rootLayoutIncludedAtThisLevelOrAbove,
            getViewportReady,
            getMetadataReady,
            preloadCallbacks,
            StreamingMetadataOutlet
        });
        for (const subPath of subPaths){
            // we don't need to send over default routes in the flight data
            // because they are always ignored by the client, unless it's a refetch
            if (subPath[0] === _segment.DEFAULT_SEGMENT_KEY && flightRouterState && !!flightRouterState[1][parallelRouteKey][0] && flightRouterState[1][parallelRouteKey][3] !== 'refetch') {
                continue;
            }
            paths.push([
                actualSegment,
                parallelRouteKey,
                ...subPath
            ]);
        }
    }
    return paths;
}
/*
 * This function is used to determine if an existing segment can be overridden
 * by the incoming segment.
 */ const canSegmentBeOverridden = (existingSegment, segment)=>{
    var _getSegmentParam;
    if (Array.isArray(existingSegment) || !Array.isArray(segment)) {
        return false;
    }
    return ((_getSegmentParam = (0, _getsegmentparam.getSegmentParam)(existingSegment)) == null ? void 0 : _getSegmentParam.param) === segment[0];
};

//# sourceMappingURL=walk-tree-with-flight-router-state.js.map