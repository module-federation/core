export = SystemLibraryPlugin;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../../declarations/WebpackOptions").LibraryOptions} LibraryOptions */
/** @typedef {import("../../declarations/WebpackOptions").LibraryType} LibraryType */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compilation").ChunkHashContext} ChunkHashContext */
/** @typedef {import("../javascript/JavascriptModulesPlugin").RenderContext} RenderContext */
/** @typedef {import("../util/Hash")} Hash */
/**
 * @template T
 * @typedef {import("./AbstractLibraryPlugin").LibraryContext<T>} LibraryContext<T>
 */
/**
 * @typedef {object} SystemLibraryPluginOptions
 * @property {LibraryType} type
 */
/**
 * @typedef {object} SystemLibraryPluginParsed
 * @property {string} name
 */
/**
 * @typedef {SystemLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<SystemLibraryPluginParsed>}
 */
declare class SystemLibraryPlugin extends AbstractLibraryPlugin<SystemLibraryPluginParsed> {
    /**
     * @param {SystemLibraryPluginOptions} options the plugin options
     */
    constructor(options: SystemLibraryPluginOptions);
}
declare namespace SystemLibraryPlugin {
    export { Source, LibraryOptions, LibraryType, Chunk, ChunkHashContext, RenderContext, Hash, LibraryContext, SystemLibraryPluginOptions, SystemLibraryPluginParsed, T };
}
import AbstractLibraryPlugin = require("./AbstractLibraryPlugin");
type Source = import("webpack-sources").Source;
type LibraryOptions = import("../../declarations/WebpackOptions").LibraryOptions;
type LibraryType = import("../../declarations/WebpackOptions").LibraryType;
type Chunk = import("../Chunk");
type ChunkHashContext = import("../Compilation").ChunkHashContext;
type RenderContext = import("../javascript/JavascriptModulesPlugin").RenderContext;
type Hash = import("../util/Hash");
/**
 * <T>
 */
type LibraryContext<T> = import("./AbstractLibraryPlugin").LibraryContext<T>;
type SystemLibraryPluginOptions = {
    type: LibraryType;
};
type SystemLibraryPluginParsed = {
    name: string;
};
type T = SystemLibraryPluginParsed;
