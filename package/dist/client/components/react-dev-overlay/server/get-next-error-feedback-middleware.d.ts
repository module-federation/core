import type { ServerResponse, IncomingMessage } from 'http';
import type { Telemetry } from '../../../../telemetry/storage';
export declare function getNextErrorFeedbackMiddleware(telemetry: Telemetry): (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>;
