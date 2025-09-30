import { NextBuildContext } from '../build-context';
export declare function turbopackBuild(): Promise<{
    duration: number;
    buildTraceContext: undefined;
    shutdownPromise: Promise<void>;
}>;
export declare function workerMain(workerData: {
    buildContext: typeof NextBuildContext;
}): Promise<Awaited<ReturnType<typeof turbopackBuild>>>;
export declare function waitForShutdown(): Promise<void>;
