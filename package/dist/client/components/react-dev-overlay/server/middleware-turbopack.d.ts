import type { IncomingMessage, ServerResponse } from 'http';
import type { Project } from '../../../../build/swc/types';
export declare function getOverlayMiddleware(project: Project, projectPath: string): (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>;
export declare function getSourceMapMiddleware(project: Project): (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>;
