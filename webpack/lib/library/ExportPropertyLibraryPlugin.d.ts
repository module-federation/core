export = ExportPropertyLibraryPlugin;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../../declarations/WebpackOptions").LibraryOptions} LibraryOptions */
/** @typedef {import("../../declarations/WebpackOptions").LibraryType} LibraryType */
/** @typedef {import("../../declarations/WebpackOptions").LibraryExport} LibraryExport */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").RuntimeRequirements} RuntimeRequirements */
/** @typedef {import("../javascript/JavascriptModulesPlugin").StartupRenderContext} StartupRenderContext */
/**
 * @template T
 * @typedef {import("./AbstractLibraryPlugin").LibraryContext<T>} LibraryContext<T>
 */
/**
 * @typedef {object} ExportPropertyLibraryPluginParsed
 * @property {LibraryExport=} export
 */
/**
 * @typedef {object} ExportPropertyLibraryPluginOptions
 * @property {LibraryType} type
 */
/**
 * @typedef {ExportPropertyLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<ExportPropertyLibraryPluginParsed>}
 */
declare class ExportPropertyLibraryPlugin extends AbstractLibraryPlugin<ExportPropertyLibraryPluginParsed> {
  /**
   * @param {ExportPropertyLibraryPluginOptions} options options
   */
  constructor({ type }: ExportPropertyLibraryPluginOptions);
}
declare namespace ExportPropertyLibraryPlugin {
  export {
    Source,
    LibraryOptions,
    LibraryType,
    LibraryExport,
    Chunk,
    Module,
    RuntimeRequirements,
    StartupRenderContext,
    LibraryContext,
    ExportPropertyLibraryPluginParsed,
    ExportPropertyLibraryPluginOptions,
    T,
  };
}
import AbstractLibraryPlugin = require('./AbstractLibraryPlugin');
type Source = import('webpack-sources').Source;
type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
type LibraryType = import('../../declarations/WebpackOptions').LibraryType;
type LibraryExport = import('../../declarations/WebpackOptions').LibraryExport;
type Chunk = import('../Chunk');
type Module = import('../Module');
type RuntimeRequirements = import('../Module').RuntimeRequirements;
type StartupRenderContext =
  import('../javascript/JavascriptModulesPlugin').StartupRenderContext;
/**
 * <T>
 */
type LibraryContext<T> = import('./AbstractLibraryPlugin').LibraryContext<T>;
type ExportPropertyLibraryPluginParsed = {
  export?: LibraryExport | undefined;
};
type ExportPropertyLibraryPluginOptions = {
  type: LibraryType;
};
type T = ExportPropertyLibraryPluginParsed;
