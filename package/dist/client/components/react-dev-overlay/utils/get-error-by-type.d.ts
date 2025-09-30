import type { SupportedErrorEvent } from '../ui/container/runtime-error/render-error';
import type { OriginalStackFrame } from './stack-frame';
import type { ComponentStackFrame } from './parse-component-stack';
export type ReadyRuntimeError = {
    id: number;
    runtime: true;
    error: Error & {
        environmentName?: string;
    };
    frames: OriginalStackFrame[] | (() => Promise<OriginalStackFrame[]>);
    componentStackFrames?: ComponentStackFrame[];
};
export declare const useFrames: (error: ReadyRuntimeError) => OriginalStackFrame[];
export declare function getErrorByType(ev: SupportedErrorEvent, isAppDir: boolean): Promise<ReadyRuntimeError>;
