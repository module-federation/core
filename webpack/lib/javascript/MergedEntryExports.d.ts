export type MergedExport = {
    /**
     * the name the merged exports expose
     */
    name: string;
    /**
     * the entry module the name is read from
     */
    module: Module;
    /**
     * the name on that module's exports object
     */
    usedName: string;
};
export type MergedExports = {
    /**
     * what the merged entry exposes, in entry order
     */
    exports: MergedExport[];
    /**
     * names more than one module binds differently
     */
    conflicting: string[];
    /**
     * entry modules that provide unknown exports
     */
    unknownExports: Module[];
    /**
     * true when a merged module is an ES module
     */
    namespace: boolean;
};
/**
 * Whether anything in this compilation asks for merged entry exports, which a
 * build that never set the option answers without reading a chunk.
 * @param {Compilation} compilation the compilation
 * @returns {boolean} true when an entry or `output.library` opted in
 */
export function compilationMergesEntryExports(compilation: Compilation): boolean;
/**
 * What a merged entry exposes, following `export *`: a name more than one
 * module binds differently is left out, and the first provider of the rest wins.
 * @param {Module[]} modules the entry modules, in entry order
 * @param {ModuleGraph} moduleGraph the module graph
 * @param {RuntimeSpec} runtime the chunk runtime
 * @returns {MergedExports} the merged exports
 */
export function getMergedExports(modules: Module[], moduleGraph: ModuleGraph, runtime: RuntimeSpec): MergedExports;
/**
 * The javascript entry modules a chunk merges the exports of, or `undefined`
 * when it exports the last one alone — which is the default and the only shape
 * a single entry module can have.
 * @param {Chunk} chunk chunk
 * @param {ChunkGraph} chunkGraph chunkGraph
 * @param {Compilation} compilation the compilation
 * @returns {Module[] | undefined} the entry modules to merge
 */
export function mergedEntryModules(chunk: Chunk, chunkGraph: ChunkGraph, compilation: Compilation): Module[] | undefined;
/**
 * The javascript entry modules a chunk merges the exports of, for a caller
 * that already resolved the library options in force for it.
 * @param {LibraryOptions | undefined} library the library options, if any
 * @param {Chunk} chunk chunk
 * @param {ChunkGraph} chunkGraph chunkGraph
 * @returns {Module[] | undefined} the entry modules to merge
 */
export function mergedEntryModulesOfLibrary(library: LibraryOptions | undefined, chunk: Chunk, chunkGraph: ChunkGraph): Module[] | undefined;
import type Module from "../module/Module";
import type Compilation from "../Compilation";
import type ModuleGraph from "../graph/ModuleGraph";
import type { RuntimeSpec } from "../util/runtime";
import type Chunk from "../graph/Chunk";
import type ChunkGraph from "../graph/ChunkGraph";
import type { LibraryOptions } from "../../declarations/WebpackOptions";
