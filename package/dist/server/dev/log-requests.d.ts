import type { NodeNextRequest, NodeNextResponse } from '../base-http/node';
import type { LoggingConfig } from '../config-shared';
export interface RequestLoggingOptions {
    readonly request: NodeNextRequest;
    readonly response: NodeNextResponse;
    readonly loggingConfig: LoggingConfig | undefined;
    readonly requestDurationInMs: number;
}
/**
 * Returns true if the incoming request should be ignored for logging.
 */
export declare function ignoreLoggingIncomingRequests(request: NodeNextRequest, loggingConfig: LoggingConfig | undefined): boolean;
export declare function logRequests(options: RequestLoggingOptions): void;
