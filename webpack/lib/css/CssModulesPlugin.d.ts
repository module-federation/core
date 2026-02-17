export = CssModulesPlugin;
declare class CssModulesPlugin {
    /**
     * @param {Compilation} compilation the compilation
     * @returns {CompilationHooks} the attached hooks
     */
    static getCompilationHooks(compilation: Compilation): CompilationHooks;
    /**
     * @param {CssModule} module css module
     * @param {ChunkRenderContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @returns {Source | null} css module source
     */
    static renderModule(module: CssModule, renderContext: ChunkRenderContext, hooks: CompilationHooks): Source | null;
    /**
     * @param {Chunk} chunk chunk
     * @param {OutputOptions} outputOptions output options
     * @returns {TemplatePath} used filename template
     */
    static getChunkFilenameTemplate(chunk: Chunk, outputOptions: OutputOptions): TemplatePath;
    /**
     * @param {Chunk} chunk chunk
     * @param {ChunkGraph} chunkGraph chunk graph
     * @returns {boolean} true, when the chunk has css
     */
    static chunkHasCss(chunk: Chunk, chunkGraph: ChunkGraph): boolean;
    /** @type {WeakMap<Source, ModuleFactoryCacheEntry>} */
    _moduleFactoryCache: WeakMap<Source, ModuleFactoryCacheEntry>;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * @param {Chunk} chunk chunk
     * @param {Iterable<Module>} modules unordered modules
     * @param {Compilation} compilation compilation
     * @returns {Module[]} ordered modules
     */
    getModulesInOrder(chunk: Chunk, modules: Iterable<Module>, compilation: Compilation): Module[];
    /**
     * @param {Chunk} chunk chunk
     * @param {ChunkGraph} chunkGraph chunk graph
     * @param {Compilation} compilation compilation
     * @returns {Module[]} ordered css modules
     */
    getOrderedChunkCssModules(chunk: Chunk, chunkGraph: ChunkGraph, compilation: Compilation): Module[];
    /**
     * @param {RenderContext} renderContext the render context
     * @param {CompilationHooks} hooks hooks
     * @returns {Source} generated source
     */
    renderChunk({ undoPath, chunk, codeGenerationResults, modules, runtimeTemplate, chunkGraph }: RenderContext, hooks: CompilationHooks): Source;
}
declare namespace CssModulesPlugin {
    export { Source, OutputOptions, Chunk, ChunkGraph, CodeGenerationResults, ChunkHashContext, Compiler, Inheritance, CSSModuleCreateData, Module, BuildInfo, RuntimeRequirements, RuntimeTemplate, TemplatePath, Hash, BuildMeta, RenderContext, ChunkRenderContext, CompilationHooks, ModuleFactoryCacheEntry };
}
import Compilation = require("../Compilation");
import CssModule = require("../CssModule");
type Source = import("webpack-sources").Source;
type OutputOptions = import("../config/defaults").OutputNormalizedWithDefaults;
type Chunk = import("../Chunk");
type ChunkGraph = import("../ChunkGraph");
type CodeGenerationResults = import("../CodeGenerationResults");
type ChunkHashContext = import("../Compilation").ChunkHashContext;
type Compiler = import("../Compiler");
type Inheritance = import("../CssModule").Inheritance;
type CSSModuleCreateData = import("../CssModule").CSSModuleCreateData;
type Module = import("../Module");
type BuildInfo = import("../Module").BuildInfo;
type RuntimeRequirements = import("../Module").RuntimeRequirements;
type RuntimeTemplate = import("../Template").RuntimeTemplate;
type TemplatePath = import("../TemplatedPathPlugin").TemplatePath;
type Hash = import("../util/Hash");
type BuildMeta = import("../Module").BuildMeta;
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
     * modules
     */
    modules: CssModule[];
};
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
     * moduleFactoryCache
     */
    moduleFactoryCache: WeakMap<Source, ModuleFactoryCacheEntry>;
    /**
     * content
     */
    moduleSourceContent: Source;
};
type CompilationHooks = {
    renderModulePackage: SyncWaterfallHook<[Source, Module, ChunkRenderContext]>;
    chunkHash: SyncHook<[Chunk, Hash, ChunkHashContext]>;
};
type ModuleFactoryCacheEntry = {
    /**
     * - The undo path to the CSS file
     */
    undoPath: string;
    /**
     * - The inheritance chain
     */
    inheritance: Inheritance;
    /**
     * - The cached source
     */
    source: CachedSource;
};
import { SyncWaterfallHook } from "tapable";
import { SyncHook } from "tapable";
import { CachedSource } from "webpack-sources";
