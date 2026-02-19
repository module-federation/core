export = ModuleLibraryPlugin;
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
    LibraryExport,
    Chunk,
    Compiler,
    Module,
    BuildMeta,
    RuntimeRequirements,
    StartupRenderContext,
    ModuleRenderContext,
    LibraryContext,
    ModuleLibraryPluginOptions,
    ModuleLibraryPluginParsed,
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
type Compiler = import('../Compiler');
type Module = import('../Module');
type BuildMeta = import('../Module').BuildMeta;
type RuntimeRequirements = import('../Module').RuntimeRequirements;
type StartupRenderContext =
  import('../javascript/JavascriptModulesPlugin').StartupRenderContext;
type ModuleRenderContext =
  import('../javascript/JavascriptModulesPlugin').ModuleRenderContext;
/**
 * <T>
 */
type LibraryContext<T> = import('./AbstractLibraryPlugin').LibraryContext<T>;
type ModuleLibraryPluginOptions = {
  type: LibraryType;
};
type ModuleLibraryPluginParsed = {
  name: string;
  export?: LibraryExport | undefined;
};
type T = ModuleLibraryPluginParsed;
