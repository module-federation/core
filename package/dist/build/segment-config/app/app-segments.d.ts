import type { LoadComponentsReturnType } from '../../../server/load-components';
import type { Params } from '../../../server/request/params';
import type { AppPageModule } from '../../../server/route-modules/app-page/module.compiled';
import type { AppRouteModule } from '../../../server/route-modules/app-route/module.compiled';
import { type AppSegmentConfig } from './app-segment-config';
type GenerateStaticParams = (options: {
    params?: Params;
}) => Promise<Params[]>;
export type AppSegment = {
    name: string;
    param: string | undefined;
    filePath: string | undefined;
    config: AppSegmentConfig | undefined;
    isDynamicSegment: boolean;
    generateStaticParams: GenerateStaticParams | undefined;
};
/**
 * Collects the segments for a given route module.
 *
 * @param components the loaded components
 * @returns the segments for the route module
 */
export declare function collectSegments({ routeModule, }: LoadComponentsReturnType<AppPageModule | AppRouteModule>): Promise<AppSegment[]> | AppSegment[];
export {};
