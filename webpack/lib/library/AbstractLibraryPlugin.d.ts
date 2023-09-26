export = AbstractLibraryPlugin;
/**
 * @template T
 * @typedef {Object} LibraryContext
 * @property {Compilation} compilation
 * @property {ChunkGraph} chunkGraph
 * @property {T} options
 */
/**
 * @template T
 */
declare class AbstractLibraryPlugin<T> {
  /**
   * @param {Object} options options
   * @param {string} options.pluginName name of the plugin
   * @param {LibraryType} options.type used library type
   */
  constructor({ pluginName, type }: { pluginName: string; type: LibraryType });
  _pluginName: string;
  _type: string;
  _parseCache: WeakMap<object, any>;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   * @param {LibraryOptions=} library normalized library option
   * @returns {T | false} preprocess as needed by overriding
   */
  _parseOptionsCached(library?: LibraryOptions | undefined): T | false;
  /**
   * @abstract
   * @param {LibraryOptions} library normalized library option
   * @returns {T | false} preprocess as needed by overriding
   */
  parseOptions(library: LibraryOptions): T | false;
  /**
   * @param {Module} module the exporting entry module
   * @param {string} entryName the name of the entrypoint
   * @param {LibraryContext<T>} libraryContext context
   * @returns {void}
   */
  finishEntryModule(
    module: Module,
    entryName: string,
    libraryContext: LibraryContext<T>,
  ): void;
  /**
   * @param {Module} module the exporting entry module
   * @param {RenderContext} renderContext render context
   * @param {LibraryContext<T>} libraryContext context
   * @returns {string | undefined} bailout reason
   */
  embedInRuntimeBailout(
    module: Module,
    renderContext: RenderContext,
    libraryContext: LibraryContext<T>,
  ): string | undefined;
  /**
   * @param {RenderContext} renderContext render context
   * @param {LibraryContext<T>} libraryContext context
   * @returns {string | undefined} bailout reason
   */
  strictRuntimeBailout(
    renderContext: RenderContext,
    libraryContext: LibraryContext<T>,
  ): string | undefined;
  /**
   * @param {Chunk} chunk the chunk
   * @param {Set<string>} set runtime requirements
   * @param {LibraryContext<T>} libraryContext context
   * @returns {void}
   */
  runtimeRequirements(
    chunk: Chunk,
    set: Set<string>,
    libraryContext: LibraryContext<T>,
  ): void;
  /**
   * @param {Source} source source
   * @param {RenderContext} renderContext render context
   * @param {LibraryContext<T>} libraryContext context
   * @returns {Source} source with library export
   */
  render(
    source: any,
    renderContext: RenderContext,
    libraryContext: LibraryContext<T>,
  ): any;
  /**
   * @param {Source} source source
   * @param {Module} module module
   * @param {StartupRenderContext} renderContext render context
   * @param {LibraryContext<T>} libraryContext context
   * @returns {Source} source with library export
   */
  renderStartup(
    source: any,
    module: Module,
    renderContext: StartupRenderContext,
    libraryContext: LibraryContext<T>,
  ): any;
  /**
   * @param {Chunk} chunk the chunk
   * @param {Hash} hash hash
   * @param {ChunkHashContext} chunkHashContext chunk hash context
   * @param {LibraryContext<T>} libraryContext context
   * @returns {void}
   */
  chunkHash(
    chunk: Chunk,
    hash: Hash,
    chunkHashContext: ChunkHashContext,
    libraryContext: LibraryContext<T>,
  ): void;
}
declare namespace AbstractLibraryPlugin {
  export {
    COMMON_LIBRARY_NAME_MESSAGE,
    Source,
    LibraryOptions,
    LibraryType,
    Chunk,
    ChunkGraph,
    Compilation,
    ChunkHashContext,
    Compiler,
    Module,
    RenderContext,
    StartupRenderContext,
    Hash,
    LibraryContext,
  };
}
type Compiler = import('../Compiler');
type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
type Module = import('../Module');
type LibraryContext<T> = {
  compilation: Compilation;
  chunkGraph: ChunkGraph;
  options: T;
};
type RenderContext =
  import('../javascript/JavascriptModulesPlugin').RenderContext;
type Chunk = import('../Chunk');
type StartupRenderContext =
  import('../javascript/JavascriptModulesPlugin').StartupRenderContext;
type Hash = import('../util/Hash');
type ChunkHashContext = import('../Compilation').ChunkHashContext;
type LibraryType = import('../../declarations/WebpackOptions').LibraryType;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../../declarations/WebpackOptions").LibraryOptions} LibraryOptions */
/** @typedef {import("../../declarations/WebpackOptions").LibraryType} LibraryType */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Compilation").ChunkHashContext} ChunkHashContext */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../javascript/JavascriptModulesPlugin").RenderContext} RenderContext */
/** @typedef {import("../javascript/JavascriptModulesPlugin").StartupRenderContext} StartupRenderContext */
/** @typedef {import("../util/Hash")} Hash */
declare const COMMON_LIBRARY_NAME_MESSAGE: "Common configuration options that specific library names are 'output.library[.name]', 'entry.xyz.library[.name]', 'ModuleFederationPlugin.name' and 'ModuleFederationPlugin.library[.name]'.";
type Source = any;
type ChunkGraph = import('../ChunkGraph');
type Compilation = import('../Compilation');
