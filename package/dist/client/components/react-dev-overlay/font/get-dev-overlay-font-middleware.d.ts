import type { ServerResponse, IncomingMessage } from 'http';
export declare function getDevOverlayFontMiddleware(): (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>;
