export = HotModuleReplacementPlugin;
declare class HotModuleReplacementPlugin {
    /**
     * Returns the attached hooks.
     * @param {JavascriptParser} parser the parser
     * @returns {HMRJavascriptParserHooks} the attached hooks
     */
    static getParserHooks(parser: JavascriptParser): getParserHooks.HMRJavascriptParserHooks;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace HotModuleReplacementPlugin {
    export { Requests, HotIndex, FullHashChunkModuleHashes, ChunkModuleHashes, ChunkHashes, ChunkRuntime, ChunkModuleIds, ChunkIds, ModuleSet, HotUpdateMainContentByRuntimeItem, HotUpdateMainContentByRuntime, HotModuleReplacementPluginLoaderContext };
}
import type Compiler from "../Compiler";
import type JavascriptParser from "../javascript/JavascriptParser";
import getParserHooks = require("./parserHooks");
type Requests = string[];
type HotIndex = number;
type FullHashChunkModuleHashes = Record<string, string>;
type ChunkModuleHashes = Record<string, string>;
type ChunkHashes = Record<Chunk.ChunkId, string>;
type ChunkRuntime = Record<Chunk.ChunkId, string>;
type ChunkModuleIds = Record<Chunk.ChunkId, ChunkGraph.ModuleId[]>;
type ChunkIds = Set<Chunk.ChunkId>;
type ModuleSet = Set<Module>;
type HotUpdateMainContentByRuntimeItem = {
    updatedChunkIds: ChunkIds;
    removedChunkIds: ChunkIds;
    removedModules: ModuleSet;
    forceLoadChunkIds: ChunkIds;
    filename: string;
    assetInfo: Compilation.AssetInfo;
};
type HotUpdateMainContentByRuntime = Map<string, HotUpdateMainContentByRuntimeItem>;
type HotModuleReplacementPluginLoaderContext = {
    hot?: boolean;
};
import type Chunk from "../graph/Chunk";
import ChunkGraph = require("../graph/ChunkGraph");
import type Module from "../module/Module";
import Compilation = require("../Compilation");
