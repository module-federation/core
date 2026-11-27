export = AbstractLibraryPlugin;
/**
 * Defines the library context type used by this module.
 * @template T
 * @typedef {object} LibraryContext
 * @property {Compilation} compilation
 * @property {ChunkGraph} chunkGraph
 * @property {T} options
 */
/**
 * Defines the abstract library plugin options type used by this module.
 * @typedef {object} AbstractLibraryPluginOptions
 * @property {string} pluginName name of the plugin
 * @property {LibraryType} type used library type
 */
/**
 * Represents AbstractLibraryPlugin.
 * @template T
 */
declare class AbstractLibraryPlugin<T> {
    /**
     * Creates an instance of AbstractLibraryPlugin.
     * @param {AbstractLibraryPluginOptions} options options
     */
    constructor({ pluginName, type }: AbstractLibraryPluginOptions);
    /** @type {AbstractLibraryPluginOptions["pluginName"]} */
    _pluginName: AbstractLibraryPluginOptions["pluginName"];
    /** @type {AbstractLibraryPluginOptions["type"]} */
    _type: AbstractLibraryPluginOptions["type"];
    /** @type {WeakMap<LibraryOptions, T>} */
    _parseCache: WeakMap<LibraryOptions, T>;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
    /**
     * Parse options cached.
     * @param {LibraryOptions=} library normalized library option
     * @returns {T | false} preprocess as needed by overriding
     */
    _parseOptionsCached(library?: LibraryOptions | undefined): T | false;
    /**
     * Returns preprocess as needed by overriding.
     * @abstract
     * @param {LibraryOptions} library normalized library option
     * @returns {T} preprocess as needed by overriding
     */
    parseOptions(library: LibraryOptions): T;
    /**
     * Finish entry module.
     * @param {Module} module the exporting entry module
     * @param {string} entryName the name of the entrypoint
     * @param {LibraryContext<T>} libraryContext context
     * @returns {void}
     */
    finishEntryModule(module: Module, entryName: string, libraryContext: LibraryContext<T>): void;
    /**
     * Embed in runtime bailout.
     * @param {Module} module the exporting entry module
     * @param {RenderContext} renderContext render context
     * @param {LibraryContext<T>} libraryContext context
     * @returns {string | undefined} bailout reason
     */
    embedInRuntimeBailout(module: Module, renderContext: JavascriptModulesPlugin.RenderContext, libraryContext: LibraryContext<T>): string | undefined;
    /**
     * Strict runtime bailout.
     * @param {RenderContext} renderContext render context
     * @param {LibraryContext<T>} libraryContext context
     * @returns {string | undefined} bailout reason
     */
    strictRuntimeBailout(renderContext: JavascriptModulesPlugin.RenderContext, libraryContext: LibraryContext<T>): string | undefined;
    /**
     * Processes the provided chunk.
     * @param {Chunk} chunk the chunk
     * @param {RuntimeRequirements} set runtime requirements
     * @param {LibraryContext<T>} libraryContext context
     * @returns {void}
     */
    runtimeRequirements(chunk: Chunk, set: Module.RuntimeRequirements, libraryContext: LibraryContext<T>): void;
    /**
     * Returns source with library export.
     * @param {Source} source source
     * @param {RenderContext} renderContext render context
     * @param {LibraryContext<T>} libraryContext context
     * @returns {Source} source with library export
     */
    render(source: Source, renderContext: JavascriptModulesPlugin.RenderContext, libraryContext: LibraryContext<T>): Source;
    /**
     * Renders source with library export.
     * @param {Source} source source
     * @param {Module} module module
     * @param {StartupRenderContext} renderContext render context
     * @param {LibraryContext<T>} libraryContext context
     * @returns {Source} source with library export
     */
    renderStartup(source: Source, module: Module, renderContext: JavascriptModulesPlugin.StartupRenderContext, libraryContext: LibraryContext<T>): Source;
    /**
     * Renders module content.
     * @param {Source} source source
     * @param {Module} module module
     * @param {ModuleRenderContext} renderContext render context
     * @param {Omit<LibraryContext<T>, "options">} libraryContext context
     * @returns {Source} source with library export
     */
    renderModuleContent(source: Source, module: Module, renderContext: JavascriptModulesPlugin.ModuleRenderContext, libraryContext: Omit<LibraryContext<T>, "options">): Source;
    /**
     * Processes the provided chunk.
     * @param {Chunk} chunk the chunk
     * @param {Hash} hash hash
     * @param {ChunkHashContext} chunkHashContext chunk hash context
     * @param {LibraryContext<T>} libraryContext context
     * @returns {void}
     */
    chunkHash(chunk: Chunk, hash: Hash, chunkHashContext: Compilation.ChunkHashContext, libraryContext: LibraryContext<T>): void;
}
declare namespace AbstractLibraryPlugin {
    export { COMMON_LIBRARY_NAME_MESSAGE, LibraryContext, AbstractLibraryPluginOptions };
}
import type { LibraryOptions } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
import type Module from "../module/Module";
import JavascriptModulesPlugin = require("../javascript/JavascriptModulesPlugin");
import type Chunk from "../graph/Chunk";
import type { Source } from "webpack-sources";
import type Hash from "../util/Hash";
import type Compilation from "../Compilation";
/** @import { Source } from "webpack-sources" */
/**
 * @import {
 * 	LibraryOptions,
 * 	LibraryType
 * } from "../../declarations/WebpackOptions"
 */
/** @import Chunk from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import Compilation, { ChunkHashContext } from "../Compilation" */
/** @import Compiler from "../Compiler" */
/** @import Module, { RuntimeRequirements } from "../module/Module" */
/**
 * @import {
 * 	RenderContext,
 * 	StartupRenderContext,
 * 	ModuleRenderContext
 * } from "../javascript/JavascriptModulesPlugin"
 */
/** @import Hash from "../util/Hash" */
declare const COMMON_LIBRARY_NAME_MESSAGE: "Common configuration options that specific library names are 'output.library[.name]', 'entry.xyz.library[.name]', 'ModuleFederationPlugin.name' and 'ModuleFederationPlugin.library[.name]'.";
/**
 * Defines the library context type used by this module.
 */
type LibraryContext<T> = {
    compilation: Compilation;
    chunkGraph: ChunkGraph;
    options: T;
};
/**
 * Defines the abstract library plugin options type used by this module.
 */
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
import type ChunkGraph from "../graph/ChunkGraph";
import type { LibraryType } from "../../declarations/WebpackOptions";
