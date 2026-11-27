export = WebAssemblyInInitialChunkError;
declare class WebAssemblyInInitialChunkError extends WebpackError {
    /**
     * Creates an instance of WebAssemblyInInitialChunkError.
     * @param {Module} module WASM module
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {RequestShortener} requestShortener request shortener
     */
    constructor(module: Module, moduleGraph: ModuleGraph, chunkGraph: ChunkGraph, requestShortener: RequestShortener);
}
import WebpackError = require("./WebpackError");
import type Module from "../module/Module";
import type ModuleGraph from "../graph/ModuleGraph";
import type ChunkGraph from "../graph/ChunkGraph";
import type RequestShortener from "../util/RequestShortener";
