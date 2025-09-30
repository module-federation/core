import type { ServerResponse, IncomingMessage } from 'http';
export declare function getDisableDevIndicatorMiddleware(): (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>;
