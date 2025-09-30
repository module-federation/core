import type { LoadComponentsReturnType } from '../../../server/load-components';
import type { AppPageModule } from '../../../server/route-modules/app-page/module';
import type { AppRouteModule } from '../../../server/route-modules/app-route/module';
/**
 * Collects the segments for a given route module.
 *
 * @param components the loaded components
 * @returns the segments for the route module
 */
export declare function collectRootParamKeys({ routeModule, }: LoadComponentsReturnType<AppPageModule | AppRouteModule>): readonly string[];
