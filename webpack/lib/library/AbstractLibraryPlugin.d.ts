export = AbstractLibraryPlugin;
/**
 * @template T
 * @typedef {object} LibraryContext
 * @property {Compilation} compilation
 * @property {ChunkGraph} chunkGraph
 * @property {T} options
 */
/**
 * @typedef {object} AbstractLibraryPluginOptions
 * @property {string} pluginName name of the plugin
 * @property {LibraryType} type used library type
 */
/**
 * @template T
 */
declare class AbstractLibraryPlugin<T> {
    /**
     * @param {AbstractLibraryPluginOptions} options options
     */
    constructor({ pluginName, type }: AbstractLibraryPluginOptions);
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
    finishEntryModule(module: Module, entryName: string, libraryContext: LibraryContext<T>): void;
    /**
     * @param {Module} module the exporting entry module
     * @param {RenderContext} renderContext render context
     * @param {LibraryContext<T>} libraryContext context
     * @returns {string | undefined} bailout reason
     */
    embedInRuntimeBailout(module: Module, renderContext: RenderContext, libraryContext: LibraryContext<T>): string | undefined;
    /**
     * @param {RenderContext} renderContext render context
     * @param {LibraryContext<T>} libraryContext context
     * @returns {string | undefined} bailout reason
     */
    strictRuntimeBailout(renderContext: RenderContext, libraryContext: LibraryContext<T>): string | undefined;
    /**
     * @param {Chunk} chunk the chunk
     * @param {RuntimeRequirements} set runtime requirements
     * @param {LibraryContext<T>} libraryContext context
     * @returns {void}
     */
    runtimeRequirements(chunk: Chunk, set: RuntimeRequirements, libraryContext: LibraryContext<T>): void;
    /**
     * @param {Source} source source
     * @param {RenderContext} renderContext render context
     * @param {LibraryContext<T>} libraryContext context
     * @returns {Source} source with library export
     */
    render(source: Source, renderContext: RenderContext, libraryContext: LibraryContext<T>): Source;
    /**
     * @param {Source} source source
     * @param {Module} module module
     * @param {StartupRenderContext} renderContext render context
     * @param {LibraryContext<T>} libraryContext context
     * @returns {Source} source with library export
     */
    renderStartup(source: Source, module: Module, renderContext: StartupRenderContext, libraryContext: LibraryContext<T>): Source;
    /**
     * @param {Source} source source
     * @param {Module} module module
     * @param {ModuleRenderContext} renderContext render context
     * @param {Omit<LibraryContext<T>, "options">} libraryContext context
     * @returns {Source} source with library export
     */
    renderModuleContent(source: Source, module: Module, renderContext: ModuleRenderContext, libraryContext: Omit<LibraryContext<T>, "options">): Source;
    /**
     * @param {Chunk} chunk the chunk
     * @param {Hash} hash hash
     * @param {ChunkHashContext} chunkHashContext chunk hash context
     * @param {LibraryContext<T>} libraryContext context
     * @returns {void}
     */
    chunkHash(chunk: Chunk, hash: Hash, chunkHashContext: ChunkHashContext, libraryContext: LibraryContext<T>): void;
}
declare namespace AbstractLibraryPlugin {
    export { COMMON_LIBRARY_NAME_MESSAGE, Source, LibraryOptions, LibraryType, Chunk, ChunkGraph, Compilation, ChunkHashContext, Compiler, Module, RuntimeRequirements, RenderContext, StartupRenderContext, ModuleRenderContext, Hash, LibraryContext, AbstractLibraryPluginOptions };
}
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../../declarations/WebpackOptions").LibraryOptions} LibraryOptions */
/** @typedef {import("../../declarations/WebpackOptions").LibraryType} LibraryType */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Compilation").ChunkHashContext} ChunkHashContext */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").RuntimeRequirements} RuntimeRequirements */
/** @typedef {import("../javascript/JavascriptModulesPlugin").RenderContext} RenderContext */
/** @typedef {import("../javascript/JavascriptModulesPlugin").StartupRenderContext} StartupRenderContext */
/** @typedef {import("../javascript/JavascriptModulesPlugin").ModuleRenderContext} ModuleRenderContext */
/** @typedef {import("../util/Hash")} Hash */
declare const COMMON_LIBRARY_NAME_MESSAGE: "Common configuration options that specific library names are 'output.library[.name]', 'entry.xyz.library[.name]', 'ModuleFederationPlugin.name' and 'ModuleFederationPlugin.library[.name]'.";
type Source = import("webpack-sources").Source;
type LibraryOptions = import("../../declarations/WebpackOptions").LibraryOptions;
type LibraryType = import("../../declarations/WebpackOptions").LibraryType;
type Chunk = import("../Chunk");
type ChunkGraph = import("../ChunkGraph");
type Compilation = import("../Compilation");
type ChunkHashContext = import("../Compilation").ChunkHashContext;
type Compiler = import("../Compiler");
type Module = import("../Module");
type RuntimeRequirements = import("../Module").RuntimeRequirements;
type RenderContext = import("../javascript/JavascriptModulesPlugin").RenderContext;
type StartupRenderContext = import("../javascript/JavascriptModulesPlugin").StartupRenderContext;
type ModuleRenderContext = import("../javascript/JavascriptModulesPlugin").ModuleRenderContext;
type Hash = import("../util/Hash");
type LibraryContext<T> = {
    compilation: Compilation;
    chunkGraph: ChunkGraph;
    options: T;
};
type AbstractLibraryPluginOptions = {
    /**
     * name of the plugin
     */
    pluginName: string;
    /**
     * used library type
     */
    type: LibraryType;
};
