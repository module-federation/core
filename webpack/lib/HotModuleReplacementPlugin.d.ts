export = HotModuleReplacementPlugin;
declare class HotModuleReplacementPlugin {
    /**
     * @param {JavascriptParser} parser the parser
     * @returns {HMRJavascriptParserHooks} the attached hooks
     */
    static getParserHooks(parser: JavascriptParser): HMRJavascriptParserHooks;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace HotModuleReplacementPlugin {
    export { CallExpression, Expression, SpreadElement, Chunk, ChunkId, ModuleId, AssetInfo, Records, Compiler, CodeGenerationResults, DependencyLocation, Module, BuildInfo, RuntimeModule, BasicEvaluatedExpression, Range, RuntimeSpec, Requests, HMRJavascriptParserHooks, HotIndex, FullHashChunkModuleHashes, ChunkModuleHashes, ChunkHashes, ChunkRuntime, ChunkModuleIds, HotUpdateMainContentByRuntimeItem, HotUpdateMainContentByRuntime };
}
import JavascriptParser = require("./javascript/JavascriptParser");
type CallExpression = import("estree").CallExpression;
type Expression = import("estree").Expression;
type SpreadElement = import("estree").SpreadElement;
type Chunk = import("./Chunk");
type ChunkId = import("./Chunk").ChunkId;
type ModuleId = import("./ChunkGraph").ModuleId;
type AssetInfo = import("./Compilation").AssetInfo;
type Records = import("./Compilation").Records;
type Compiler = import("./Compiler");
type CodeGenerationResults = import("./CodeGenerationResults");
type DependencyLocation = import("./Dependency").DependencyLocation;
type Module = import("./Module");
type BuildInfo = import("./Module").BuildInfo;
type RuntimeModule = import("./RuntimeModule");
type BasicEvaluatedExpression = import("./javascript/BasicEvaluatedExpression");
type Range = import("./javascript/JavascriptParserHelpers").Range;
type RuntimeSpec = import("./util/runtime").RuntimeSpec;
type Requests = string[];
type HMRJavascriptParserHooks = {
    hotAcceptCallback: SyncBailHook<[Expression | SpreadElement, Requests], void>;
    hotAcceptWithoutCallback: SyncBailHook<[CallExpression, Requests], void>;
};
type HotIndex = number;
type FullHashChunkModuleHashes = Record<string, string>;
type ChunkModuleHashes = Record<string, string>;
type ChunkHashes = Record<ChunkId, string>;
type ChunkRuntime = Record<ChunkId, string>;
type ChunkModuleIds = Record<ChunkId, ModuleId[]>;
type HotUpdateMainContentByRuntimeItem = {
    updatedChunkIds: Set<ChunkId>;
    removedChunkIds: Set<ChunkId>;
    removedModules: Set<Module>;
    filename: string;
    assetInfo: AssetInfo;
};
type HotUpdateMainContentByRuntime = Map<string, HotUpdateMainContentByRuntimeItem>;
import { SyncBailHook } from "tapable";
