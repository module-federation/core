import { fetchServerResponse } from "../fetch-server-response";
import { createHrefFromUrl } from "../create-href-from-url";
import { applyRouterStatePatchToTree } from "../apply-router-state-patch-to-tree";
import { isNavigatingToNewRootLayout } from "../is-navigating-to-new-root-layout";
import { handleExternalUrl } from "./navigate-reducer";
import { handleMutable } from "../handle-mutable";
import { applyFlightData } from "../apply-flight-data";
import { createEmptyCacheNode } from "../../app-router";
import { handleSegmentMismatch } from "../handle-segment-mismatch";
import { hasInterceptionRouteInCurrentTree } from "./has-interception-route-in-current-tree";
// A version of refresh reducer that keeps the cache around instead of wiping all of it.
function fastRefreshReducerImpl(state, action) {
    const { origin } = action;
    const mutable = {};
    const href = state.canonicalUrl;
    mutable.preserveCustomHistoryState = false;
    const cache = createEmptyCacheNode();
    // If the current tree was intercepted, the nextUrl should be included in the request.
    // This is to ensure that the refresh request doesn't get intercepted, accidentally triggering the interception route.
    const includeNextUrl = hasInterceptionRouteInCurrentTree(state.tree);
    // TODO-APP: verify that `href` is not an external url.
    // Fetch data from the root of the tree.
    cache.lazyData = fetchServerResponse(new URL(href, origin), [
        state.tree[0],
        state.tree[1],
        state.tree[2],
        "refetch"
    ], includeNextUrl ? state.nextUrl : null, state.buildId);
    return cache.lazyData.then((param)=>{
        let [flightData, canonicalUrlOverride] = param;
        // Handle case when navigating to page in `pages` from `app`
        if (typeof flightData === "string") {
            return handleExternalUrl(state, mutable, flightData, state.pushRef.pendingPush);
        }
        // Remove cache.lazyData as it has been resolved at this point.
        cache.lazyData = null;
        let currentTree = state.tree;
        let currentCache = state.cache;
        for (const flightDataPath of flightData){
            // FlightDataPath with more than two items means unexpected Flight data was returned
            if (flightDataPath.length !== 3) {
                // TODO-APP: handle this case better
                console.log("REFRESH FAILED");
                return state;
            }
            // Given the path can only have two items the items are only the router state and rsc for the root.
            const [treePatch] = flightDataPath;
            const newTree = applyRouterStatePatchToTree(// TODO-APP: remove ''
            [
                ""
            ], currentTree, treePatch, state.canonicalUrl);
            if (newTree === null) {
                return handleSegmentMismatch(state, action, treePatch);
            }
            if (isNavigatingToNewRootLayout(currentTree, newTree)) {
                return handleExternalUrl(state, mutable, href, state.pushRef.pendingPush);
            }
            const canonicalUrlOverrideHref = canonicalUrlOverride ? createHrefFromUrl(canonicalUrlOverride) : undefined;
            if (canonicalUrlOverride) {
                mutable.canonicalUrl = canonicalUrlOverrideHref;
            }
            const applied = applyFlightData(currentCache, cache, flightDataPath);
            if (applied) {
                mutable.cache = cache;
                currentCache = cache;
            }
            mutable.patchedTree = newTree;
            mutable.canonicalUrl = href;
            currentTree = newTree;
        }
        return handleMutable(state, mutable);
    }, ()=>state);
}
function fastRefreshReducerNoop(state, _action) {
    return state;
}
export const fastRefreshReducer = process.env.NODE_ENV === "production" ? fastRefreshReducerNoop : fastRefreshReducerImpl;

//# sourceMappingURL=fast-refresh-reducer.js.map