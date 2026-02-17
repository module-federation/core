export = AssignLibraryPlugin;
/** @typedef {string[] | "global"} LibraryPrefix */
/**
 * @typedef {object} AssignLibraryPluginOptions
 * @property {LibraryType} type
 * @property {LibraryPrefix} prefix name prefix
 * @property {string | false} declare declare name as variable
 * @property {"error" | "static" | "copy" | "assign"} unnamed behavior for unnamed library name
 * @property {"copy" | "assign"=} named behavior for named library name
 */
/** @typedef {string | string[]} LibraryName */
/**
 * @typedef {object} AssignLibraryPluginParsed
 * @property {LibraryName} name
 * @property {LibraryExport=} export
 */
/**
 * @typedef {AssignLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<AssignLibraryPluginParsed>}
 */
declare class AssignLibraryPlugin extends AbstractLibraryPlugin<AssignLibraryPluginParsed> {
  /**
   * @param {AssignLibraryPluginOptions} options the plugin options
   */
  constructor(options: AssignLibraryPluginOptions);
  prefix: LibraryPrefix;
  declare: string | false;
  unnamed: 'error' | 'static' | 'assign' | 'copy';
  named: 'assign' | 'copy';
  /**
   * @param {Compilation} compilation the compilation
   * @returns {LibraryPrefix} the prefix
   */
  _getPrefix(compilation: Compilation): LibraryPrefix;
  /**
   * @param {AssignLibraryPluginParsed} options the library options
   * @param {Chunk} chunk the chunk
   * @param {Compilation} compilation the compilation
   * @returns {string[]} the resolved full name
   */
  _getResolvedFullName(
    options: AssignLibraryPluginParsed,
    chunk: Chunk,
    compilation: Compilation,
  ): string[];
}
declare namespace AssignLibraryPlugin {
  export {
    Source,
    LibraryOptions,
    LibraryType,
    LibraryExport,
    Chunk,
    Compilation,
    ChunkHashContext,
    Module,
    RuntimeRequirements,
    ExportInfoName,
    RenderContext,
    StartupRenderContext,
    Hash,
    LibraryContext,
    LibraryPrefix,
    AssignLibraryPluginOptions,
    LibraryName,
    AssignLibraryPluginParsed,
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
type Compilation = import('../Compilation');
type ChunkHashContext = import('../Compilation').ChunkHashContext;
type Module = import('../Module');
type RuntimeRequirements = import('../Module').RuntimeRequirements;
type ExportInfoName = import('../ExportsInfo').ExportInfoName;
type RenderContext =
  import('../javascript/JavascriptModulesPlugin').RenderContext;
type StartupRenderContext =
  import('../javascript/JavascriptModulesPlugin').StartupRenderContext;
type Hash = import('../util/Hash');
/**
 * <T>
 */
type LibraryContext<T> = import('./AbstractLibraryPlugin').LibraryContext<T>;
type LibraryPrefix = string[] | 'global';
type AssignLibraryPluginOptions = {
  type: LibraryType;
  /**
   * name prefix
   */
  prefix: LibraryPrefix;
  /**
   * declare name as variable
   */
  declare: string | false;
  /**
   * behavior for unnamed library name
   */
  unnamed: 'error' | 'static' | 'copy' | 'assign';
  /**
   * behavior for named library name
   */
  named?: ('copy' | 'assign') | undefined;
};
type LibraryName = string | string[];
type AssignLibraryPluginParsed = {
  name: LibraryName;
  export?: LibraryExport | undefined;
};
type T = AssignLibraryPluginParsed;
