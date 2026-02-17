export = ChunkPrefetchStartupRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compilation")} Compilation */
declare class ChunkPrefetchStartupRuntimeModule extends RuntimeModule {
    /**
     * @param {{ onChunks: Chunk[], chunks: Set<Chunk> }[]} startupChunks chunk ids to trigger when chunks are loaded
     */
    constructor(startupChunks: {
        onChunks: Chunk[];
        chunks: Set<Chunk>;
    }[]);
    startupChunks: {
        onChunks: Chunk[];
        chunks: Set<Chunk>;
    }[];
}
declare namespace ChunkPrefetchStartupRuntimeModule {
    export { Chunk, Compilation };
}
import RuntimeModule = require("../RuntimeModule");
type Chunk = import("../Chunk");
type Compilation = import("../Compilation");
