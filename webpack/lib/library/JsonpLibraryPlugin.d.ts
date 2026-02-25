export = JsonpLibraryPlugin;
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
 * @typedef {object} JsonpLibraryPluginOptions
 * @property {LibraryType} type
 */
/**
 * @typedef {object} JsonpLibraryPluginParsed
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
    RenderContext,
    Hash,
    LibraryContext,
    JsonpLibraryPluginOptions,
    JsonpLibraryPluginParsed,
    T,
  };
}
import AbstractLibraryPlugin = require('./AbstractLibraryPlugin');
type Source = import('webpack-sources').Source;
type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
type LibraryType = import('../../declarations/WebpackOptions').LibraryType;
type Chunk = import('../Chunk');
type ChunkHashContext = import('../Compilation').ChunkHashContext;
type RenderContext =
  import('../javascript/JavascriptModulesPlugin').RenderContext;
type Hash = import('../util/Hash');
/**
 * <T>
 */
type LibraryContext<T> = import('./AbstractLibraryPlugin').LibraryContext<T>;
type JsonpLibraryPluginOptions = {
  type: LibraryType;
};
type JsonpLibraryPluginParsed = {
  name: string;
};
type T = JsonpLibraryPluginParsed;
