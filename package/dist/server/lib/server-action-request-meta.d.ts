import type { IncomingMessage } from 'http';
import type { BaseNextRequest } from '../base-http';
import type { NextRequest } from '../web/exports';
export declare function getServerActionRequestMetadata(req: IncomingMessage | BaseNextRequest | NextRequest): {
    actionId: string | null;
    isURLEncodedAction: boolean;
    isMultipartAction: boolean;
    isFetchAction: boolean;
    isPossibleServerAction: boolean;
};
export declare function getIsPossibleServerAction(req: IncomingMessage | BaseNextRequest | NextRequest): boolean;
