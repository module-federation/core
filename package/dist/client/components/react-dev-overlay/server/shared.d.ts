import type { StackFrame } from 'stacktrace-parser';
export interface OriginalStackFramesRequest {
    frames: StackFrame[];
    isServer: boolean;
    isEdgeServer: boolean;
    isAppDirectory: boolean;
}
export type OriginalStackFramesResponse = OriginalStackFrameResponseResult[];
export type OriginalStackFrameResponseResult = PromiseSettledResult<OriginalStackFrameResponse>;
export interface OriginalStackFrameResponse {
    originalStackFrame?: (StackFrame & {
        ignored: boolean;
    }) | null;
    originalCodeFrame?: string | null;
}
/**
 * It looks up the code frame of the traced source.
 * @note It ignores Next.js/React internals, as these can often be huge bundled files.
 */
export declare function getOriginalCodeFrame(frame: StackFrame, source: string | null, colors?: boolean): string | null;
