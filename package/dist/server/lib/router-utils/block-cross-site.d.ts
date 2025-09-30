import type { Duplex } from 'stream';
import type { IncomingMessage, ServerResponse } from 'webpack-dev-server';
export declare const blockCrossSite: (req: IncomingMessage, res: ServerResponse | Duplex, allowedDevOrigins: string[] | undefined, hostname: string | undefined) => boolean;
