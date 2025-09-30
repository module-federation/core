import type { StackFrame } from 'next/dist/compiled/stacktrace-parser';
import type { OriginalStackFrameResponse } from '../server/shared';
export interface ResolvedOriginalStackFrame extends OriginalStackFrameResponse {
    error: false;
    reason: null;
    external: boolean;
    ignored: boolean;
    sourceStackFrame: StackFrame;
}
export interface RejectedOriginalStackFrame extends OriginalStackFrameResponse {
    error: true;
    reason: string;
    external: boolean;
    ignored: boolean;
    sourceStackFrame: StackFrame;
}
export type OriginalStackFrame = ResolvedOriginalStackFrame | RejectedOriginalStackFrame;
export declare function getOriginalStackFrames(frames: StackFrame[], type: 'server' | 'edge-server' | null, isAppDir: boolean): Promise<OriginalStackFrame[]>;
export declare function getFrameSource(frame: StackFrame): string;
