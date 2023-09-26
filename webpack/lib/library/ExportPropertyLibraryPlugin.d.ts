export = ExportPropertyLibraryPlugin;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../../declarations/WebpackOptions").LibraryOptions} LibraryOptions */
/** @typedef {import("../../declarations/WebpackOptions").LibraryType} LibraryType */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../javascript/JavascriptModulesPlugin").StartupRenderContext} StartupRenderContext */
/** @template T @typedef {import("./AbstractLibraryPlugin").LibraryContext<T>} LibraryContext<T> */
/**
 * @typedef {Object} ExportPropertyLibraryPluginParsed
 * @property {string | string[]} export
 */
/**
 * @typedef {Object} ExportPropertyLibraryPluginOptions
 * @property {LibraryType} type
 * @property {boolean} nsObjectUsed the namespace object is used
 */
/**
 * @typedef {ExportPropertyLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<ExportPropertyLibraryPluginParsed>}
 */
declare class ExportPropertyLibraryPlugin extends AbstractLibraryPlugin<ExportPropertyLibraryPluginParsed> {
  /**
   * @param {ExportPropertyLibraryPluginOptions} options options
   */
  constructor({ type, nsObjectUsed }: ExportPropertyLibraryPluginOptions);
  nsObjectUsed: boolean;
}
declare namespace ExportPropertyLibraryPlugin {
  export {
    Source,
    LibraryOptions,
    LibraryType,
    Chunk,
    Compiler,
    Module,
    StartupRenderContext,
    LibraryContext,
    ExportPropertyLibraryPluginParsed,
    ExportPropertyLibraryPluginOptions,
    T,
  };
}
type ExportPropertyLibraryPluginParsed = {
  export: string | string[];
};
import AbstractLibraryPlugin = require('./AbstractLibraryPlugin');
type ExportPropertyLibraryPluginOptions = {
  type: LibraryType;
  /**
   * the namespace object is used
   */
  nsObjectUsed: boolean;
};
type Source = any;
type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
type LibraryType = import('../../declarations/WebpackOptions').LibraryType;
type Chunk = import('../Chunk');
type Compiler = import('../Compiler');
type Module = import('../Module');
type StartupRenderContext =
  import('../javascript/JavascriptModulesPlugin').StartupRenderContext;
/**
 * <T>
 */
type LibraryContext<T_1> = import('./AbstractLibraryPlugin').LibraryContext<T>;
type T = ExportPropertyLibraryPluginParsed;
