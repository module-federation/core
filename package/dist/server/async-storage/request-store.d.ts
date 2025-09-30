import type { BaseNextRequest, BaseNextResponse } from '../base-http';
import type { RequestStore } from '../app-render/work-unit-async-storage.external';
import type { RenderOpts } from '../app-render/types';
import type { NextRequest } from '../web/spec-extension/request';
import type { __ApiPreviewProps } from '../api-utils';
import type { ServerComponentsHmrCache } from '../response-cache';
import type { RenderResumeDataCache } from '../resume-data-cache/resume-data-cache';
import type { Params } from '../request/params';
import type { ImplicitTags } from '../lib/implicit-tags';
export type WrapperRenderOpts = Partial<Pick<RenderOpts, 'onUpdateCookies'>> & {
    previewProps?: __ApiPreviewProps;
};
type RequestContext = RequestResponsePair & {
    /**
     * The URL of the request. This only specifies the pathname and the search
     * part of the URL. This is only undefined when generating static paths (ie,
     * there is no request in progress, nor do we know one).
     */
    url: {
        /**
         * The pathname of the requested URL.
         */
        pathname: string;
        /**
         * The search part of the requested URL. If the request did not provide a
         * search part, this will be an empty string.
         */
        search?: string;
    };
    phase: RequestStore['phase'];
    renderOpts?: WrapperRenderOpts;
    isHmrRefresh?: boolean;
    serverComponentsHmrCache?: ServerComponentsHmrCache;
    implicitTags: ImplicitTags;
};
type RequestResponsePair = {
    req: BaseNextRequest;
    res: BaseNextResponse;
} | {
    req: NextRequest;
    res: undefined;
};
export declare function createRequestStoreForRender(req: RequestContext['req'], res: RequestContext['res'], url: RequestContext['url'], rootParams: Params, implicitTags: RequestContext['implicitTags'], onUpdateCookies: RenderOpts['onUpdateCookies'], previewProps: WrapperRenderOpts['previewProps'], isHmrRefresh: RequestContext['isHmrRefresh'], serverComponentsHmrCache: RequestContext['serverComponentsHmrCache'], renderResumeDataCache: RenderResumeDataCache | undefined): RequestStore;
export declare function createRequestStoreForAPI(req: RequestContext['req'], url: RequestContext['url'], implicitTags: RequestContext['implicitTags'], onUpdateCookies: RenderOpts['onUpdateCookies'], previewProps: WrapperRenderOpts['previewProps']): RequestStore;
export declare function synchronizeMutableCookies(store: RequestStore): void;
export {};
