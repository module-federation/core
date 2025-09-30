/**
 * This is a utility function to make scheduling sequential tasks that run back to back easier.
 * We schedule on the same queue (setImmediate) at the same time to ensure no other events can sneak in between.
 */
export declare function prerenderAndAbortInSequentialTasks<R>(prerender: () => Promise<R>, abort: () => void): Promise<R>;
export declare function prerenderServerWithPhases(signal: AbortSignal, render: () => ReadableStream<Uint8Array>, finalPhase: () => void): Promise<ServerPrerenderStreamResult>;
export declare function prerenderServerWithPhases(signal: AbortSignal, render: () => ReadableStream<Uint8Array>, secondPhase: () => void, finalPhase: () => void): Promise<ServerPrerenderStreamResult>;
export declare function prerenderServerWithPhases(signal: AbortSignal, render: () => ReadableStream<Uint8Array>, secondPhase: () => void, thirdPhase: () => void, ...remainingPhases: Array<() => void>): Promise<ServerPrerenderStreamResult>;
export declare class ServerPrerenderStreamResult {
    private currentChunks;
    private chunksByPhase;
    private trailingChunks;
    private status;
    private reason;
    constructor(stream: ReadableStream<Uint8Array>);
    markPhase(): void;
    markComplete(): void;
    markInterrupted(): void;
    /**
     * Returns a stream which only releases chunks when `releasePhase` is called. This stream will never "complete" because
     * we rely upon the stream remaining open when prerendering to avoid triggering errors for incomplete chunks in the client.
     *
     * asPhasedStream is expected to be called once per result however it is safe to call multiple times as long as we have not
     * transferred the underlying data. Generally this will only happen when streaming to a response
     */
    asPhasedStream(): PhasedStream<Uint8Array<ArrayBufferLike>>;
    /**
     * Returns a stream which will release all chunks immediately. This stream will "complete" synchronously. It should be used outside
     * of render use cases like loading client chunks ahead of SSR or writing the streamed content to disk.
     */
    asStream(): ReadableStream<any>;
}
declare class PhasedStream<T> extends ReadableStream<T> {
    private nextPhase;
    private chunksByPhase;
    private destination;
    constructor(chunksByPhase: Array<Array<T>>);
    releasePhase(): void;
    assertExhausted(): void;
}
export declare function prerenderClientWithPhases<T>(render: () => Promise<T>, finalPhase: () => void): Promise<T>;
export declare function prerenderClientWithPhases<T>(render: () => Promise<T>, secondPhase: () => void, finalPhase: () => void): Promise<T>;
export declare function prerenderClientWithPhases<T>(render: () => Promise<T>, secondPhase: () => void, thirdPhase: () => void, ...remainingPhases: Array<() => void>): Promise<T>;
export declare class ReactServerResult {
    private _stream;
    constructor(stream: ReadableStream<Uint8Array>);
    tee(): ReadableStream<Uint8Array<ArrayBufferLike>>;
    consume(): ReadableStream<Uint8Array<ArrayBufferLike>>;
}
export type ReactServerPrerenderResolveToType = {
    prelude: ReadableStream<Uint8Array>;
};
export declare function createReactServerPrerenderResult(underlying: Promise<ReactServerPrerenderResolveToType>): Promise<ReactServerPrerenderResult>;
export declare function createReactServerPrerenderResultFromRender(underlying: ReadableStream<Uint8Array>): Promise<ReactServerPrerenderResult>;
export declare class ReactServerPrerenderResult {
    private _chunks;
    private assertChunks;
    private consumeChunks;
    consume(): void;
    constructor(chunks: Array<Uint8Array>);
    asUnclosingStream(): ReadableStream<Uint8Array>;
    consumeAsUnclosingStream(): ReadableStream<Uint8Array>;
    asStream(): ReadableStream<Uint8Array>;
    consumeAsStream(): ReadableStream<Uint8Array>;
}
export {};
