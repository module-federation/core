export = JsonpLibraryPlugin;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../../declarations/WebpackOptions").LibraryOptions} LibraryOptions */
/** @typedef {import("../../declarations/WebpackOptions").LibraryType} LibraryType */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compilation").ChunkHashContext} ChunkHashContext */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../javascript/JavascriptModulesPlugin").RenderContext} RenderContext */
/** @typedef {import("../util/Hash")} Hash */
/** @template T @typedef {import("./AbstractLibraryPlugin").LibraryContext<T>} LibraryContext<T> */
/**
 * @typedef {Object} JsonpLibraryPluginOptions
 * @property {LibraryType} type
 */
/**
 * @typedef {Object} JsonpLibraryPluginParsed
 * @property {string} name
 */
/**
 * @typedef {JsonpLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<JsonpLibraryPluginParsed>}
 */
declare class JsonpLibraryPlugin extends AbstractLibraryPlugin<JsonpLibraryPluginParsed> {
  /**
   * @param {JsonpLibraryPluginOptions} options the plugin options
   */
  constructor(options: JsonpLibraryPluginOptions);
}
declare namespace JsonpLibraryPlugin {
  export {
    Source,
    LibraryOptions,
    LibraryType,
    Chunk,
    ChunkHashContext,
    Compiler,
    RenderContext,
    Hash,
    LibraryContext,
    JsonpLibraryPluginOptions,
    JsonpLibraryPluginParsed,
    T,
  };
}
type JsonpLibraryPluginParsed = {
  name: string;
};
import AbstractLibraryPlugin = require('./AbstractLibraryPlugin');
type JsonpLibraryPluginOptions = {
  type: LibraryType;
};
type Source = any;
type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
type LibraryType = import('../../declarations/WebpackOptions').LibraryType;
type Chunk = import('../Chunk');
type ChunkHashContext = import('../Compilation').ChunkHashContext;
type Compiler = import('../Compiler');
type RenderContext =
  import('../javascript/JavascriptModulesPlugin').RenderContext;
type Hash = import('../util/Hash');
/**
 * <T>
 */
type LibraryContext<T_1> = import('./AbstractLibraryPlugin').LibraryContext<T>;
type T = JsonpLibraryPluginParsed;
