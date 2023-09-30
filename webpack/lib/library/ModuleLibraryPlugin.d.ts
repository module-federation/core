export = ModuleLibraryPlugin;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../../declarations/WebpackOptions").LibraryOptions} LibraryOptions */
/** @typedef {import("../../declarations/WebpackOptions").LibraryType} LibraryType */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compilation").ChunkHashContext} ChunkHashContext */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../javascript/JavascriptModulesPlugin").StartupRenderContext} StartupRenderContext */
/** @typedef {import("../util/Hash")} Hash */
/** @template T @typedef {import("./AbstractLibraryPlugin").LibraryContext<T>} LibraryContext<T> */
/**
 * @typedef {Object} ModuleLibraryPluginOptions
 * @property {LibraryType} type
 */
/**
 * @typedef {Object} ModuleLibraryPluginParsed
 * @property {string} name
 */
/**
 * @typedef {ModuleLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<ModuleLibraryPluginParsed>}
 */
declare class ModuleLibraryPlugin extends AbstractLibraryPlugin<ModuleLibraryPluginParsed> {
  /**
   * @param {ModuleLibraryPluginOptions} options the plugin options
   */
  constructor(options: ModuleLibraryPluginOptions);
}
declare namespace ModuleLibraryPlugin {
  export {
    Source,
    LibraryOptions,
    LibraryType,
    Chunk,
    ChunkHashContext,
    Compiler,
    Module,
    StartupRenderContext,
    Hash,
    LibraryContext,
    ModuleLibraryPluginOptions,
    ModuleLibraryPluginParsed,
    T,
  };
}
type ModuleLibraryPluginParsed = {
  name: string;
};
import AbstractLibraryPlugin = require('./AbstractLibraryPlugin');
type ModuleLibraryPluginOptions = {
  type: LibraryType;
};
type Source = any;
type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
type LibraryType = import('../../declarations/WebpackOptions').LibraryType;
type Chunk = import('../Chunk');
type ChunkHashContext = import('../Compilation').ChunkHashContext;
type Compiler = import('../Compiler');
type Module = import('../Module');
type StartupRenderContext =
  import('../javascript/JavascriptModulesPlugin').StartupRenderContext;
type Hash = import('../util/Hash');
/**
 * <T>
 */
type LibraryContext<T_1> = import('./AbstractLibraryPlugin').LibraryContext<T>;
type T = ModuleLibraryPluginParsed;
