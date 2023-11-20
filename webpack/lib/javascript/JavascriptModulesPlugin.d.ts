export = JavascriptModulesPlugin;
declare class JavascriptModulesPlugin {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {CompilationHooks} the attached hooks
   */
  static getCompilationHooks(compilation: Compilation): CompilationHooks;
  static getChunkFilenameTemplate(chunk: any, outputOptions: any): any;
  constructor(options?: {});
  options: {};
  /** @type {WeakMap<Source, TODO>} */
  _moduleFactoryCache: WeakMap<Source, TODO>;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   * @param {Module} module the rendered module
   * @param {ChunkRenderContext} renderContext options object
   * @param {CompilationHooks} hooks hooks
   * @param {boolean} factory true: renders as factory method, false: pure module content
   * @returns {Source} the newly generated source from rendering
   */
  renderModule(
    module: Module,
    renderContext: ChunkRenderContext,
    hooks: CompilationHooks,
    factory: boolean,
  ): any;
  /**
   * @param {RenderContext} renderContext the render context
   * @param {CompilationHooks} hooks hooks
   * @returns {Source} the rendered source
   */
  renderChunk(renderContext: RenderContext, hooks: CompilationHooks): any;
  /**
   * @param {MainRenderContext} renderContext options object
   * @param {CompilationHooks} hooks hooks
   * @param {Compilation} compilation the compilation
   * @returns {Source} the newly generated source from rendering
   */
  renderMain(
    renderContext: MainRenderContext,
    hooks: CompilationHooks,
    compilation: Compilation,
  ): any;
  /**
   * @param {Hash} hash the hash to be updated
   * @param {RenderBootstrapContext} renderContext options object
   * @param {CompilationHooks} hooks hooks
   */
  updateHashWithBootstrap(
    hash: Hash,
    renderContext: RenderBootstrapContext,
    hooks: CompilationHooks,
  ): void;
  /**
   * @param {RenderBootstrapContext} renderContext options object
   * @param {CompilationHooks} hooks hooks
   * @returns {{ header: string[], beforeStartup: string[], startup: string[], afterStartup: string[], allowInlineStartup: boolean }} the generated source of the bootstrap code
   */
  renderBootstrap(
    renderContext: RenderBootstrapContext,
    hooks: CompilationHooks,
  ): {
    header: string[];
    beforeStartup: string[];
    startup: string[];
    afterStartup: string[];
    allowInlineStartup: boolean;
  };
  /**
   * @param {RenderBootstrapContext} renderContext options object
   * @param {CompilationHooks} hooks hooks
   * @returns {string} the generated source of the require function
   */
  renderRequire(
    renderContext: RenderBootstrapContext,
    hooks: CompilationHooks,
  ): string;
}
declare namespace JavascriptModulesPlugin {
  export {
    chunkHasJs,
    Source,
    Chunk,
    ChunkGraph,
    CodeGenerationResults,
    ChunkHashContext,
    Compiler,
    DependencyTemplates,
    Module,
    ModuleGraph,
    RuntimeTemplate,
    Hash,
    RenderContext,
    MainRenderContext,
    ChunkRenderContext,
    RenderBootstrapContext,
    StartupRenderContext,
    CompilationHooks,
  };
}
type Source = import('../Source').Source;
type Compiler = import('../Compiler');
type Module = import('../Module');
type ChunkRenderContext = {
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
  /**
   * init fragments for the chunk
   */
  chunkInitFragments: InitFragment<ChunkRenderContext>[];
  /**
   * rendering in strict context
   */
  strictMode: boolean;
};
type CompilationHooks = {
  renderModuleContent: SyncWaterfallHook<[Source, Module, ChunkRenderContext]>;
  renderModuleContainer: SyncWaterfallHook<
    [Source, Module, ChunkRenderContext]
  >;
  renderModulePackage: SyncWaterfallHook<[Source, Module, ChunkRenderContext]>;
  renderChunk: SyncWaterfallHook<[Source, RenderContext]>;
  renderMain: SyncWaterfallHook<[Source, RenderContext]>;
  renderContent: SyncWaterfallHook<[Source, RenderContext]>;
  render: SyncWaterfallHook<[Source, RenderContext]>;
  renderStartup: SyncWaterfallHook<[Source, Module, StartupRenderContext]>;
  renderRequire: SyncWaterfallHook<[string, RenderBootstrapContext]>;
  inlineInRuntimeBailout: SyncBailHook<
    [Module, RenderBootstrapContext],
    string
  >;
  embedInRuntimeBailout: SyncBailHook<[Module, RenderContext], string | void>;
  strictRuntimeBailout: SyncBailHook<[RenderContext], string | void>;
  chunkHash: SyncHook<[Chunk, Hash, ChunkHashContext]>;
  useSourceMap: SyncBailHook<[Chunk, RenderContext], boolean>;
};
type RenderContext = {
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
  /**
   * rendering in strict context
   */
  strictMode: boolean;
};
type MainRenderContext = {
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
  /**
   * hash to be used for render call
   */
  hash: string;
  /**
   * rendering in strict context
   */
  strictMode: boolean;
};
import Compilation = require('../Compilation');
type Hash = import('../util/Hash');
type RenderBootstrapContext = {
  /**
   * the chunk
   */
  chunk: Chunk;
  /**
   * results of code generation
   */
  codeGenerationResults: CodeGenerationResults;
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
   * hash to be used for render call
   */
  hash: string;
};
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../CodeGenerationResults")} CodeGenerationResults */
/** @typedef {import("../Compilation").ChunkHashContext} ChunkHashContext */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../DependencyTemplates")} DependencyTemplates */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("../util/Hash")} Hash */
/**
 * @param {Chunk} chunk a chunk
 * @param {ChunkGraph} chunkGraph the chunk graph
 * @returns {boolean} true, when a JS file is needed for this chunk
 */
declare function chunkHasJs(chunk: Chunk, chunkGraph: ChunkGraph): boolean;
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
type CodeGenerationResults = import('../CodeGenerationResults');
type ChunkHashContext = import('../Compilation').ChunkHashContext;
type DependencyTemplates = import('../DependencyTemplates');
type ModuleGraph = import('../ModuleGraph');
type RuntimeTemplate = import('../RuntimeTemplate');
type StartupRenderContext = RenderContext & {
  inlined: boolean;
};
import InitFragment = require('../InitFragment');
import { SyncWaterfallHook } from 'tapable';
import { SyncBailHook } from 'tapable';
import { SyncHook } from 'tapable';
