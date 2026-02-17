export = RemoteRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Chunk").ChunkId} ChunkId */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../ChunkGraph").ModuleId} ModuleId */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("./RemoteModule")} RemoteModule */
declare class RemoteRuntimeModule extends RuntimeModule {
    constructor();
}
declare namespace RemoteRuntimeModule {
    export { Chunk, ChunkId, ChunkGraph, ModuleId, Compilation, RemoteModule };
}
import RuntimeModule = require("../RuntimeModule");
type Chunk = import("../Chunk");
type ChunkId = import("../Chunk").ChunkId;
type ChunkGraph = import("../ChunkGraph");
type ModuleId = import("../ChunkGraph").ModuleId;
type Compilation = import("../Compilation");
type RemoteModule = import("./RemoteModule");
