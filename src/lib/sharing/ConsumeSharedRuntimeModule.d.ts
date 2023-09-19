export = ConsumeSharedRuntimeModule;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("webpack/lib/ChunkGraph")} ChunkGraph */
/** @typedef {import("webpack/lib/Compilation")} Compilation */
/** @typedef {import("webpack/lib/Module")} Module */
/** @typedef {import("./ConsumeSharedModule")} ConsumeSharedModule */
declare class ConsumeSharedRuntimeModule {
    /**
     * @param {ReadonlySet<string>} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadonlySet<string>);
    _runtimeRequirements: ReadonlySet<string>;
    /**
     * @returns {string | null} runtime code
     */
    generate(): string | null;
}
declare namespace ConsumeSharedRuntimeModule {
    export { Source, Chunk, ChunkGraph, Compilation, Module, ConsumeSharedModule };
}
type Source = import("webpack-sources").Source;
type Chunk = any;
type ChunkGraph = any;
type Compilation = any;
type Module = any;
type ConsumeSharedModule = import("./ConsumeSharedModule");
