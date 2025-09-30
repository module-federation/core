import { getSegmentParam } from '../../../server/app-render/get-segment-param';
import { isAppPageRouteModule, isAppRouteRouteModule } from '../../../server/route-modules/checks';
import { InvariantError } from '../../../shared/lib/invariant-error';
function collectAppPageRootParamKeys(routeModule) {
    let rootParams = [];
    let current = routeModule.userland.loaderTree;
    while(current){
        var _getSegmentParam;
        const [name, parallelRoutes, modules] = current;
        // If this is a dynamic segment, then we collect the param.
        const param = (_getSegmentParam = getSegmentParam(name)) == null ? void 0 : _getSegmentParam.param;
        if (param) {
            rootParams.push(param);
        }
        // If this has a layout module, then we've found the root layout because
        // we return once we found the first layout.
        if (typeof modules.layout !== 'undefined') {
            return rootParams;
        }
        // This didn't include a root layout, so we need to continue. We don't need
        // to collect from other parallel routes because we can't have a parallel
        // route above a root layout.
        current = parallelRoutes.children;
    }
    // If we didn't find a root layout, then we don't have any params.
    return [];
}
/**
 * Collects the segments for a given route module.
 *
 * @param components the loaded components
 * @returns the segments for the route module
 */ export function collectRootParamKeys({ routeModule }) {
    if (isAppRouteRouteModule(routeModule)) {
        return [];
    }
    if (isAppPageRouteModule(routeModule)) {
        return collectAppPageRootParamKeys(routeModule);
    }
    throw Object.defineProperty(new InvariantError('Expected a route module to be one of app route or page'), "__NEXT_ERROR_CODE", {
        value: "E568",
        enumerable: false,
        configurable: true
    });
}

//# sourceMappingURL=collect-root-param-keys.js.map