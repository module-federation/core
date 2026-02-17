export = AmdLibraryPlugin;
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
 * @typedef {object} AmdLibraryPluginOptions
 * @property {LibraryType} type
 * @property {boolean=} requireAsWrapper
 */
/**
 * @typedef {object} AmdLibraryPluginParsed
 * @property {string} name
 * @property {string} amdContainer
 */
/**
 * @typedef {AmdLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<AmdLibraryPluginParsed>}
 */
declare class AmdLibraryPlugin extends AbstractLibraryPlugin<AmdLibraryPluginParsed> {
    /**
     * @param {AmdLibraryPluginOptions} options the plugin options
     */
    constructor(options: AmdLibraryPluginOptions);
    requireAsWrapper: boolean;
}
declare namespace AmdLibraryPlugin {
    export { Source, LibraryOptions, LibraryType, Chunk, ChunkHashContext, RenderContext, Hash, LibraryContext, AmdLibraryPluginOptions, AmdLibraryPluginParsed, T };
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
type AmdLibraryPluginOptions = {
    type: LibraryType;
    requireAsWrapper?: boolean | undefined;
};
type AmdLibraryPluginParsed = {
    name: string;
    amdContainer: string;
};
type T = AmdLibraryPluginParsed;
