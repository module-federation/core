import type { IncomingMessage, ServerResponse } from 'http';
import type RenderResult from './render-result';
import type { CacheControl } from './lib/cache-control';
export declare function sendEtagResponse(req: IncomingMessage, res: ServerResponse, etag: string | undefined): boolean;
export declare function sendRenderResult({ req, res, result, type, generateEtags, poweredByHeader, cacheControl, }: {
    req: IncomingMessage;
    res: ServerResponse;
    result: RenderResult;
    type: 'html' | 'json' | 'rsc';
    generateEtags: boolean;
    poweredByHeader: boolean;
    cacheControl: CacheControl | undefined;
}): Promise<void>;
