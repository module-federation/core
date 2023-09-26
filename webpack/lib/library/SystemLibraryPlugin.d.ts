export = SystemLibraryPlugin;
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
 * @typedef {Object} SystemLibraryPluginOptions
 * @property {LibraryType} type
 */
/**
 * @typedef {Object} SystemLibraryPluginParsed
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
    SystemLibraryPluginOptions,
    SystemLibraryPluginParsed,
    T,
  };
}
type SystemLibraryPluginParsed = {
  name: string;
};
import AbstractLibraryPlugin = require('./AbstractLibraryPlugin');
type SystemLibraryPluginOptions = {
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
type T = SystemLibraryPluginParsed;
