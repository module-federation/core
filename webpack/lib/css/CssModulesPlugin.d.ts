export = CssModulesPlugin;
/**
 * Defines the compilation hooks type used by this module.
 * @typedef {ReturnType<typeof createCompilationHooks>} CompilationHooks
 */
declare class CssModulesPlugin {
    /**
     * Renders css module source.
     * @param {CssModule} module css module
     * @param {ChunkRenderContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @returns {Source | null} css module source
     */
    static renderModule(module: CssModule, renderContext: ChunkRenderContext, hooks: CompilationHooks): Source | null;
    /**
     * Gets chunk filename template.
     * @param {Chunk} chunk chunk
     * @param {OutputOptions} outputOptions output options
     * @returns {ChunkFilenameTemplate} used filename template
     */
    static getChunkFilenameTemplate(chunk: Chunk, outputOptions: OutputOptions): Chunk.ChunkFilenameTemplate;
    /**
     * Returns true, when the chunk has css.
     * @param {Chunk} chunk chunk
     * @param {ChunkGraph} chunkGraph chunk graph
     * @returns {boolean} true, when the chunk has css
     */
    static chunkHasCss(chunk: Chunk, chunkGraph: ChunkGraph): boolean;
    /**
     * The css-carrying chunks of `chunks`, in the order their rules cascade —
     * the order a `<link rel="stylesheet">` per chunk has to be written in.
     * @param {Iterable<Chunk>} chunks candidate chunks, a group's own or a narrower load order
     * @param {ChunkGroup} group the group whose module order decides the cascade
     * @param {ChunkGraph} chunkGraph chunk graph
     * @returns {Chunk[]} the css chunks, in cascade order
     */
    static getCssChunksInCascadeOrder(chunks: Iterable<Chunk>, group: ChunkGroup, chunkGraph: ChunkGraph): Chunk[];
    /** @type {WeakMap<Source, ModuleFactoryCacheEntry>} */
    _moduleFactoryCache: WeakMap<Source, ModuleFactoryCacheEntry>;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * Gets modules in order.
     * @param {Chunk} chunk chunk
     * @param {Iterable<Module> | undefined} modules unordered modules
     * @param {Compilation} compilation compilation
     * @returns {Module[]} ordered modules
     */
    getModulesInOrder(chunk: Chunk, modules: Iterable<Module> | undefined, compilation: Compilation): Module[];
    /**
     * Gets ordered chunk css modules.
     * @param {Chunk} chunk chunk
     * @param {ChunkGraph} chunkGraph chunk graph
     * @param {Compilation} compilation compilation
     * @returns {CssModule[]} ordered css modules
     */
    getOrderedChunkCssModules(chunk: Chunk, chunkGraph: ChunkGraph, compilation: Compilation): CssModule[];
    /**
     * Renders generated source.
     * @param {RenderContext} renderContext the render context
     * @param {CompilationHooks} hooks hooks
     * @returns {Source} generated source
     */
    renderChunk({ undoPath, chunk, codeGenerationResults, modules, runtimeTemplate, chunkGraph, hash }: RenderContext, hooks: CompilationHooks): Source;
}
declare namespace CssModulesPlugin {
    export { getCompilationHooks, RenderContext, ChunkRenderContext, ModuleFactoryCacheEntry, PublicPathPlaceholderPlan, CompilationHooks };
}
import type { Source } from "webpack-sources";
import type Compiler from "../Compiler";
import type Chunk from "../graph/Chunk";
import type Module from "../module/Module";
import type Compilation from "../Compilation";
import type ChunkGraph from "../graph/ChunkGraph";
import CssModule = require("./CssModule");
import type { OutputNormalizedWithDefaults as OutputOptions } from "../config/defaults";
import type ChunkGroup from "../graph/ChunkGroup";
declare var getCompilationHooks: (compilation: import("../Compilation")) => {
    /**
     * @type {SyncWaterfallHook<[Source, Module, ChunkRenderContext]>}
     * @since 5.94.0
     */
    renderModulePackage: SyncWaterfallHook<[Source, Module, ChunkRenderContext]>;
    /**
     * @type {SyncHook<[Chunk, Hash, ChunkHashContext]>}
     * @since 5.94.0
     */
    chunkHash: SyncHook<[Chunk, Hash, Compilation.ChunkHashContext]>;
    /**
     * Called for each CSS source type (CSS_IMPORT_TYPE, CSS_TYPE) with the chunk's modules pre-sorted by full module name; return an ordered `Module[]` to override the default import-order topological sort, or return `undefined` to keep the default.
     * @type {SyncBailHook<[Chunk, Module[], Compilation], Module[] | undefined | void>}
     * @since 5.107.0
     */
    orderModules: SyncBailHook<[Chunk, Module[], Compilation], Module[] | undefined | void>;
};
/**
 * Defines the render context type used by this module.
 */
type RenderContext = {
    /**
     * the chunk
     */
    chunk: Chunk;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * results of code generation
     */
    codeGenerationResults: CodeGenerationResults;
    /**
     * the runtime template
     */
    runtimeTemplate: RuntimeTemplate;
    /**
     * the unique name
     */
    uniqueName: string;
    /**
     * undo path to css file
     */
    undoPath: string;
    /**
     * compilation hash
     */
    hash?: string | undefined;
    /**
     * modules
     */
    modules: CssModule[];
};
/**
 * Defines the chunk render context type used by this module.
 */
type ChunkRenderContext = {
    /**
     * the chunk
     */
    chunk?: Chunk | undefined;
    /**
     * the chunk graph
     */
    chunkGraph?: ChunkGraph | undefined;
    /**
     * results of code generation
     */
    codeGenerationResults?: CodeGenerationResults | undefined;
    /**
     * the runtime template
     */
    runtimeTemplate: RuntimeTemplate;
    /**
     * undo path to css file
     */
    undoPath: string;
    /**
     * compilation hash
     */
    hash?: string | undefined;
    /**
     * moduleFactoryCache
     */
    moduleFactoryCache: WeakMap<Source, ModuleFactoryCacheEntry>;
    /**
     * content
     */
    moduleSourceContent: Source;
};
/**
 * Defines the module factory cache entry type used by this module.
 */
type ModuleFactoryCacheEntry = {
    /**
     * - The undo path to the CSS file
     */
    undoPath: string;
    /**
     * - The compilation hash
     */
    hash: string | undefined;
    /**
     * - The inheritance chain
     */
    inheritance: CssModule.Inheritance;
    /**
     * - The cached source
     */
    source: CachedSource;
};
type PublicPathPlaceholderPlan = {
    /**
     * start offsets of each `PUBLIC_PATH_AUTO` placeholder
     */
    autos: number[];
    /**
     * `[start, end)` ranges of each `PUBLIC_PATH_FULL_HASH` placeholder and its requested hash length
     */
    hashes: {
        start: number;
        end: number;
        length: number;
    }[];
};
/**
 * Defines the compilation hooks type used by this module.
 */
type CompilationHooks = ReturnType<typeof createCompilationHooks>;
import { SyncWaterfallHook } from "tapable";
import { SyncHook } from "tapable";
import type Hash from "../util/Hash";
import { SyncBailHook } from "tapable";
import type CodeGenerationResults from "../module/CodeGenerationResults";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import { CachedSource } from "webpack-sources";
declare function createCompilationHooks(): {
    /**
     * @type {SyncWaterfallHook<[Source, Module, ChunkRenderContext]>}
     * @since 5.94.0
     */
    renderModulePackage: SyncWaterfallHook<[Source, Module, ChunkRenderContext]>;
    /**
     * @type {SyncHook<[Chunk, Hash, ChunkHashContext]>}
     * @since 5.94.0
     */
    chunkHash: SyncHook<[Chunk, Hash, Compilation.ChunkHashContext]>;
    /**
     * Called for each CSS source type (CSS_IMPORT_TYPE, CSS_TYPE) with the chunk's modules pre-sorted by full module name; return an ordered `Module[]` to override the default import-order topological sort, or return `undefined` to keep the default.
     * @type {SyncBailHook<[Chunk, Module[], Compilation], Module[] | undefined | void>}
     * @since 5.107.0
     */
    orderModules: SyncBailHook<[Chunk, Module[], Compilation], Module[] | undefined | void>;
};
