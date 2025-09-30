import type { StackFrame } from 'next/dist/compiled/stacktrace-parser';
import { getSourceMapFromFile } from '../utils/get-source-map-from-file';
import { type OriginalStackFrameResponse } from './shared';
export { getServerError } from '../utils/node-stack-frames';
export { parseStack } from '../utils/parse-stack';
export { getSourceMapFromFile };
import type { IncomingMessage, ServerResponse } from 'http';
import type webpack from 'webpack';
import type { RawSourceMap } from 'next/dist/compiled/source-map08';
type IgnoredSources = Array<{
    url: string;
    ignored: boolean;
}>;
export interface IgnorableStackFrame extends StackFrame {
    ignored: boolean;
}
type Source = {
    type: 'file';
    sourceMap: RawSourceMap;
    ignoredSources: IgnoredSources;
    moduleURL: string;
} | {
    type: 'bundle';
    sourceMap: RawSourceMap;
    ignoredSources: IgnoredSources;
    compilation: webpack.Compilation;
    moduleId: string;
    moduleURL: string;
};
export declare function getIgnoredSources(sourceMap: RawSourceMap & {
    ignoreList?: number[];
}): IgnoredSources;
export declare function createOriginalStackFrame({ source, rootDirectory, frame, errorMessage, }: {
    source: Source;
    rootDirectory: string;
    frame: StackFrame;
    errorMessage?: string;
}): Promise<OriginalStackFrameResponse | null>;
export declare function getOverlayMiddleware(options: {
    rootDirectory: string;
    clientStats: () => webpack.Stats | null;
    serverStats: () => webpack.Stats | null;
    edgeServerStats: () => webpack.Stats | null;
}): (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>;
export declare function getSourceMapMiddleware(options: {
    clientStats: () => webpack.Stats | null;
    serverStats: () => webpack.Stats | null;
    edgeServerStats: () => webpack.Stats | null;
}): (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>;
