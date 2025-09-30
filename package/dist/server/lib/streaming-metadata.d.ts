import type { BaseNextRequest } from '../base-http';
export declare function shouldServeStreamingMetadata(userAgent: string, htmlLimitedBots: string | undefined): boolean;
export declare function isHtmlBotRequest(req: BaseNextRequest): boolean;
