export = AsyncWebAssemblyModulesPlugin;
declare class AsyncWebAssemblyModulesPlugin {
    /**
     * @param {Compilation} compilation the compilation
     * @returns {CompilationHooks} the attached hooks
     */
    static getCompilationHooks(compilation: Compilation): CompilationHooks;
    /**
     * @param {AsyncWebAssemblyModulesPluginOptions} options options
     */
    constructor(options: AsyncWebAssemblyModulesPluginOptions);
    options: AsyncWebAssemblyModulesPluginOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * @param {Module} module the rendered module
     * @param {WebAssemblyRenderContext} renderContext options object
     * @param {CompilationHooks} hooks hooks
     * @returns {Source} the newly generated source from rendering
     */
    renderModule(module: Module, renderContext: WebAssemblyRenderContext, hooks: CompilationHooks): Source;
}
declare namespace AsyncWebAssemblyModulesPlugin {
    export { Source, Chunk, ChunkGraph, CodeGenerationResults, Compiler, DependencyTemplates, Module, ModuleGraph, RuntimeTemplate, WebpackError, WebAssemblyRenderContext, CompilationHooks, AsyncWebAssemblyModulesPluginOptions };
}
import Compilation = require("../Compilation");
type Source = import("webpack-sources").Source;
type Chunk = import("../Chunk");
type ChunkGraph = import("../ChunkGraph");
type CodeGenerationResults = import("../CodeGenerationResults");
type Compiler = import("../Compiler");
type DependencyTemplates = import("../DependencyTemplates");
type Module = import("../Module");
type ModuleGraph = import("../ModuleGraph");
type RuntimeTemplate = import("../RuntimeTemplate");
type WebpackError = import("../WebpackError");
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
type CompilationHooks = {
    renderModuleContent: SyncWaterfallHook<[Source, Module, WebAssemblyRenderContext]>;
};
type AsyncWebAssemblyModulesPluginOptions = {
    /**
     * mangle imports
     */
    mangleImports?: boolean | undefined;
};
import { SyncWaterfallHook } from "tapable";
