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
  renderModule(
    module: Module,
    renderContext: WebAssemblyRenderContext,
    hooks: CompilationHooks,
  ): any;
}
declare namespace AsyncWebAssemblyModulesPlugin {
  export {
    Source,
    OutputOptions,
    Chunk,
    ChunkGraph,
    CodeGenerationResults,
    Compiler,
    DependencyTemplates,
    Module,
    ModuleGraph,
    RuntimeTemplate,
    RenderManifestEntry,
    RenderManifestOptions,
    WebpackError,
    WebAssemblyRenderContext,
    CompilationHooks,
    AsyncWebAssemblyModulesPluginOptions,
  };
}
type AsyncWebAssemblyModulesPluginOptions = {
  /**
   * mangle imports
   */
  mangleImports?: boolean;
};
type Compiler = import('../Compiler');
type Module = import('../Module');
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
  renderModuleContent: SyncWaterfallHook<
    [Source, Module, WebAssemblyRenderContext]
  >;
};
import Compilation = require('../Compilation');
type Source = any;
type OutputOptions =
  import('../../declarations/WebpackOptions').OutputNormalized;
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
type CodeGenerationResults = import('../CodeGenerationResults');
type DependencyTemplates = import('../DependencyTemplates');
type ModuleGraph = import('../ModuleGraph');
type RuntimeTemplate = import('../RuntimeTemplate');
type RenderManifestEntry = import('../Template').RenderManifestEntry;
type RenderManifestOptions = import('../Template').RenderManifestOptions;
type WebpackError = import('../WebpackError');
import { SyncWaterfallHook } from 'tapable';
