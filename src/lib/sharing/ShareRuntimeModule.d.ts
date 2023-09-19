export = ShareRuntimeModule;
/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("webpack/lib/ChunkGraph")} ChunkGraph */
/** @typedef {import("webpack/lib/Compilation")} Compilation */
declare class ShareRuntimeModule {
    /**
     * @returns {string | null} runtime code
     */
    generate(): string | null;
}
declare namespace ShareRuntimeModule {
    export { Chunk, ChunkGraph, Compilation };
}
type Chunk = any;
type ChunkGraph = any;
type Compilation = any;
