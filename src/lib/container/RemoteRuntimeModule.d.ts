export = RemoteRuntimeModule;
/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("./RemoteModule")} RemoteModule */
declare class RemoteRuntimeModule {
    /**
     * @returns {string | null} runtime code
     */
    generate(): string | null;
}
declare namespace RemoteRuntimeModule {
    export { Chunk, RemoteModule };
}
type Chunk = any;
type RemoteModule = import("./RemoteModule");
