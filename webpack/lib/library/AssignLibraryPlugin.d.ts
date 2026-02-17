export = AssignLibraryPlugin;
/**
 * @typedef {Object} AssignLibraryPluginOptions
 * @property {LibraryType} type
 * @property {string[] | "global"} prefix name prefix
 * @property {string | false} declare declare name as variable
 * @property {"error"|"static"|"copy"|"assign"} unnamed behavior for unnamed library name
 * @property {"copy"|"assign"=} named behavior for named library name
 */
/**
 * @typedef {Object} AssignLibraryPluginParsed
 * @property {string | string[]} name
 * @property {string | string[] | undefined} export
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
  prefix: string[] | 'global';
  declare: string | false;
  unnamed: 'error' | 'copy' | 'assign' | 'static';
  named: 'copy' | 'assign';
  /**
   * @param {Compilation} compilation the compilation
   * @returns {string[]} the prefix
   */
  _getPrefix(compilation: Compilation): string[];
  /**
   * @param {AssignLibraryPluginParsed} options the library options
   * @param {Chunk} chunk the chunk
   * @param {Compilation} compilation the compilation
   * @returns {Array<string>} the resolved full name
   */
  _getResolvedFullName(
    options: AssignLibraryPluginParsed,
    chunk: Chunk,
    compilation: Compilation,
  ): Array<string>;
}
declare namespace AssignLibraryPlugin {
  export {
    Source,
    LibraryOptions,
    LibraryType,
    Chunk,
    Compilation,
    ChunkHashContext,
    Compiler,
    Module,
    RenderContext,
    StartupRenderContext,
    Hash,
    LibraryContext,
    AssignLibraryPluginOptions,
    AssignLibraryPluginParsed,
    T,
  };
}
type AssignLibraryPluginParsed = {
  name: string | string[];
  export: string | string[] | undefined;
};
import AbstractLibraryPlugin = require('./AbstractLibraryPlugin');
type Compilation = import('../Compilation');
type Chunk = import('../Chunk');
type AssignLibraryPluginOptions = {
  type: LibraryType;
  /**
   * name prefix
   */
  prefix: string[] | 'global';
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
type Source = any;
type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
type LibraryType = import('../../declarations/WebpackOptions').LibraryType;
type ChunkHashContext = import('../Compilation').ChunkHashContext;
type Compiler = import('../Compiler');
type Module = import('../Module');
type RenderContext =
  import('../javascript/JavascriptModulesPlugin').RenderContext;
type StartupRenderContext =
  import('../javascript/JavascriptModulesPlugin').StartupRenderContext;
type Hash = import('../util/Hash');
/**
 * <T>
 */
type LibraryContext<T_1> = import('./AbstractLibraryPlugin').LibraryContext<T>;
type T = AssignLibraryPluginParsed;
