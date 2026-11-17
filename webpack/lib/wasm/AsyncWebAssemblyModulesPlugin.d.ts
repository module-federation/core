export = AsyncWebAssemblyModulesPlugin;
declare class AsyncWebAssemblyModulesPlugin {
    /**
     * Creates an instance of AsyncWebAssemblyModulesPlugin.
     * @param {AsyncWebAssemblyModulesPluginOptions} options options
     */
    constructor(options: AsyncWebAssemblyModulesPluginOptions);
    /** @type {AsyncWebAssemblyModulesPluginOptions} */
    options: AsyncWebAssemblyModulesPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * Renders the newly generated source from rendering.
     * @param {Module} module the rendered module
     * @param {WebAssemblyRenderContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @returns {Source} the newly generated source from rendering
     */
    renderModule(module: Module, renderContext: WebAssemblyRenderContext, hooks: CompilationHooks): Source;
}
declare namespace AsyncWebAssemblyModulesPlugin {
    export { getCompilationHooks, WebAssemblyRenderContext, CompilationHooks, AsyncWebAssemblyModulesPluginOptions };
}
import type Compiler from "../Compiler";
import type Module from "../module/Module";
import type { Source } from "webpack-sources";
declare var getCompilationHooks: (compilation: import("../Compilation")) => CompilationHooks;
/**
 * Defines the web assembly render context type used by this module.
 */
type WebAssemblyRenderContext = {
    /**
     * the chunk
     */
    chunk: Chunk;
    /**
     * the dependency templates
     */
    dependencyTemplates: DependencyTemplates;
    /**
     * the runtime template
     */
    runtimeTemplate: RuntimeTemplate;
    /**
     * the module graph
     */
    moduleGraph: ModuleGraph;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * results of code generation
     */
    codeGenerationResults: CodeGenerationResults;
};
/**
 * Defines the compilation hooks type used by this module.
 */
type CompilationHooks = {
    renderModuleContent: SyncWaterfallHook<[Source, Module, WebAssemblyRenderContext]>;
};
/**
 * Defines the async web assembly modules plugin options type used by this module.
 */
type AsyncWebAssemblyModulesPluginOptions = {
    /**
     * mangle imports
     */
    mangleImports?: boolean | undefined;
};
import type Chunk from "../graph/Chunk";
import type DependencyTemplates from "../template/DependencyTemplates";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import type ModuleGraph from "../graph/ModuleGraph";
import type ChunkGraph from "../graph/ChunkGraph";
import type CodeGenerationResults from "../module/CodeGenerationResults";
import { SyncWaterfallHook } from "tapable";
