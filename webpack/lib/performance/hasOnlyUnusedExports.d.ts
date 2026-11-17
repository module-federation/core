export = hasOnlyUnusedExports;
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import Module from "../module/Module" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/**
 * Tells whether a module provides exports and no runtime uses any of them.
 * One exporting nothing is there for its side effects, a different mistake.
 * @param {Module} module the module to look up
 * @param {ModuleGraph} moduleGraph the module graph
 * @param {ChunkGraph} chunkGraph the chunk graph
 * @returns {boolean} true when it provides exports and none are used
 */
declare function hasOnlyUnusedExports(module: Module, moduleGraph: ModuleGraph, chunkGraph: ChunkGraph): boolean;
import type Module from "../module/Module";
import type ModuleGraph from "../graph/ModuleGraph";
import type ChunkGraph from "../graph/ChunkGraph";
