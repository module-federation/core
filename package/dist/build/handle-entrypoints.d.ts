import type { TurbopackManifestLoader } from '../shared/lib/turbopack/manifest-loader';
import type { Entrypoints, PageRoute, AppRoute, RawEntrypoints } from './swc/types';
export declare function rawEntrypointsToEntrypoints(entrypointsOp: RawEntrypoints): Promise<Entrypoints>;
export declare function handleRouteType({ page, route, manifestLoader, }: {
    page: string;
    route: PageRoute | AppRoute;
    manifestLoader: TurbopackManifestLoader;
}): Promise<void>;
