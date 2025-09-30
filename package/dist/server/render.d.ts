import type { IncomingMessage, ServerResponse } from 'http';
import type { ParsedUrlQuery } from 'querystring';
import type { DomainLocale } from './config';
import type { AppType, DocumentType } from '../shared/lib/utils';
import type { ImageConfigComplete } from '../shared/lib/image-config';
import { type __ApiPreviewProps } from './api-utils';
import type { LoadComponentsReturnType } from './load-components';
import type { ServerRuntime, SizeLimit } from '../types';
import type { ClientReferenceManifest } from '../build/webpack/plugins/flight-manifest-plugin';
import type { NextFontManifest } from '../build/webpack/plugins/next-font-manifest-plugin';
import type { PagesModule } from './route-modules/pages/module';
import type { NextParsedUrlQuery } from './request-meta';
import RenderResult from './render-result';
import type { DeepReadonly } from '../shared/lib/deep-readonly';
import type { PagesDevOverlayType } from '../client/components/react-dev-overlay/pages/pages-dev-overlay';
export type RenderOptsPartial = {
    canonicalBase: string;
    runtimeConfig?: {
        [key: string]: any;
    };
    assetPrefix?: string;
    err?: Error | null;
    nextExport?: boolean;
    dev?: boolean;
    ampPath?: string;
    ErrorDebug?: PagesDevOverlayType;
    ampValidator?: (html: string, pathname: string) => Promise<void>;
    ampSkipValidation?: boolean;
    ampOptimizerConfig?: {
        [key: string]: any;
    };
    isNextDataRequest?: boolean;
    params?: ParsedUrlQuery;
    previewProps: __ApiPreviewProps | undefined;
    basePath: string;
    unstable_runtimeJS?: false;
    unstable_JsPreload?: false;
    optimizeCss: any;
    nextConfigOutput?: 'standalone' | 'export';
    nextScriptWorkers: any;
    assetQueryString?: string;
    resolvedUrl?: string;
    resolvedAsPath?: string;
    setIsrStatus?: (key: string, value: boolean | null) => void;
    clientReferenceManifest?: DeepReadonly<ClientReferenceManifest>;
    nextFontManifest?: DeepReadonly<NextFontManifest>;
    distDir?: string;
    locale?: string;
    locales?: readonly string[];
    defaultLocale?: string;
    domainLocales?: readonly DomainLocale[];
    disableOptimizedLoading?: boolean;
    supportsDynamicResponse: boolean;
    botType?: 'dom' | 'html' | undefined;
    serveStreamingMetadata?: boolean;
    runtime?: ServerRuntime;
    serverComponents?: boolean;
    serverActions?: {
        bodySizeLimit?: SizeLimit;
        allowedOrigins?: string[];
    };
    crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
    images: ImageConfigComplete;
    largePageDataBytes?: number;
    isOnDemandRevalidate?: boolean;
    strictNextHead: boolean;
    isPossibleServerAction?: boolean;
    isExperimentalCompile?: boolean;
    isPrefetch?: boolean;
    expireTime?: number;
    experimental: {
        clientTraceMetadata?: string[];
    };
};
export type RenderOpts = LoadComponentsReturnType<PagesModule> & RenderOptsPartial;
/**
 * Shared context used for all page renders.
 */
export type PagesSharedContext = {
    /**
     * Used to facilitate caching of page bundles, we send it to the client so
     * that pageloader knows where to load bundles.
     */
    buildId: string;
    /**
     * The deployment ID if the user is deploying to a platform that provides one.
     */
    deploymentId: string | undefined;
    /**
     * True if the user is using a custom server.
     */
    customServer: true | undefined;
};
/**
 * The context for the given request.
 */
export type PagesRenderContext = {
    /**
     * Whether this should be rendered as a fallback page.
     */
    isFallback: boolean;
    /**
     * Whether this is in draft mode.
     */
    isDraftMode: boolean | undefined;
    /**
     * In development, the original source page that returned a 404.
     */
    developmentNotFoundSourcePage: string | undefined;
};
/**
 * RenderOptsExtra is being used to split away functionality that's within the
 * renderOpts. Eventually we can have more explicit render options for each
 * route kind.
 */
export type RenderOptsExtra = {
    App: AppType;
    Document: DocumentType;
};
export declare function errorToJSON(err: Error): {
    name: string;
    source: "server" | "edge-server";
    message: string;
    stack: string | undefined;
    digest: any;
};
export declare function renderToHTMLImpl(req: IncomingMessage, res: ServerResponse, pathname: string, query: NextParsedUrlQuery, renderOpts: Omit<RenderOpts, keyof RenderOptsExtra>, extra: RenderOptsExtra, sharedContext: PagesSharedContext, renderContext: PagesRenderContext): Promise<RenderResult>;
export type PagesRender = (req: IncomingMessage, res: ServerResponse, pathname: string, query: NextParsedUrlQuery, renderOpts: RenderOpts, sharedContext: PagesSharedContext, renderContext: PagesRenderContext) => Promise<RenderResult>;
export declare const renderToHTML: PagesRender;
