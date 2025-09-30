import type { AppPageRouteDefinition } from '../../route-definitions/app-page-route-definition';
import type RenderResult from '../../render-result';
import type { RenderOpts } from '../../app-render/types';
import type { NextParsedUrlQuery } from '../../request-meta';
import type { LoaderTree } from '../../lib/app-dir-module';
import { renderToHTMLOrFlight, type AppSharedContext } from '../../app-render/app-render';
import { RouteModule, type RouteModuleOptions, type RouteModuleHandleContext } from '../route-module';
import * as vendoredContexts from './vendored/contexts/entrypoints';
import type { BaseNextRequest, BaseNextResponse } from '../../base-http';
import type { ServerComponentsHmrCache } from '../../response-cache';
import type { FallbackRouteParams } from '../../request/fallback-params';
/**
 * The AppPageModule is the type of the module exported by the bundled app page
 * module.
 */
export type AppPageModule = typeof import('../../../build/templates/app-page');
type AppPageUserlandModule = {
    /**
     * The tree created in next-app-loader that holds component segments and modules
     */
    loaderTree: LoaderTree;
};
export interface AppPageRouteHandlerContext extends RouteModuleHandleContext {
    page: string;
    query: NextParsedUrlQuery;
    fallbackRouteParams: FallbackRouteParams | null;
    renderOpts: RenderOpts;
    serverComponentsHmrCache?: ServerComponentsHmrCache;
    sharedContext: AppSharedContext;
}
export type AppPageRouteModuleOptions = RouteModuleOptions<AppPageRouteDefinition, AppPageUserlandModule>;
export declare class AppPageRouteModule extends RouteModule<AppPageRouteDefinition, AppPageUserlandModule> {
    render(req: BaseNextRequest, res: BaseNextResponse, context: AppPageRouteHandlerContext): Promise<RenderResult>;
    warmup(req: BaseNextRequest, res: BaseNextResponse, context: AppPageRouteHandlerContext): Promise<RenderResult>;
}
declare const vendored: {
    'react-rsc': any;
    'react-ssr': any;
    contexts: typeof vendoredContexts;
};
export { renderToHTMLOrFlight, vendored };
export default AppPageRouteModule;
