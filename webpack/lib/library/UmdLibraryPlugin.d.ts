export = UmdLibraryPlugin;
/** @typedef {string | string[] | LibraryCustomUmdObject} UmdLibraryPluginName */
/**
 * @typedef {Object} UmdLibraryPluginOptions
 * @property {LibraryType} type
 * @property {boolean=} optionalAmdExternalAsGlobal
 */
/**
 * @typedef {Object} UmdLibraryPluginParsed
 * @property {string | string[]} name
 * @property {LibraryCustomUmdObject} names
 * @property {string | LibraryCustomUmdCommentObject} auxiliaryComment
 * @property {boolean} namedDefine
 */
/**
 * @typedef {UmdLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<UmdLibraryPluginParsed>}
 */
declare class UmdLibraryPlugin extends AbstractLibraryPlugin<UmdLibraryPluginParsed> {
  /**
   * @param {UmdLibraryPluginOptions} options the plugin option
   */
  constructor(options: UmdLibraryPluginOptions);
  optionalAmdExternalAsGlobal: boolean;
}
declare namespace UmdLibraryPlugin {
  export {
    Source,
    LibraryCustomUmdCommentObject,
    LibraryCustomUmdObject,
    LibraryName,
    LibraryOptions,
    LibraryType,
    Compiler,
    RenderContext,
    Hash,
    LibraryContext,
    UmdLibraryPluginName,
    UmdLibraryPluginOptions,
    UmdLibraryPluginParsed,
    T,
  };
}
type UmdLibraryPluginParsed = {
  name: string | string[];
  names: LibraryCustomUmdObject;
  auxiliaryComment: string | LibraryCustomUmdCommentObject;
  namedDefine: boolean;
};
import AbstractLibraryPlugin = require('./AbstractLibraryPlugin');
type UmdLibraryPluginOptions = {
  type: LibraryType;
  optionalAmdExternalAsGlobal?: boolean | undefined;
};
type Source = any;
type LibraryCustomUmdCommentObject =
  import('../../declarations/WebpackOptions').LibraryCustomUmdCommentObject;
type LibraryCustomUmdObject =
  import('../../declarations/WebpackOptions').LibraryCustomUmdObject;
type LibraryName = import('../../declarations/WebpackOptions').LibraryName;
type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
type LibraryType = import('../../declarations/WebpackOptions').LibraryType;
type Compiler = import('../Compiler');
type RenderContext =
  import('../javascript/JavascriptModulesPlugin').RenderContext;
type Hash = import('../util/Hash');
/**
 * <T>
 */
type LibraryContext<T_1> = import('./AbstractLibraryPlugin').LibraryContext<T>;
type UmdLibraryPluginName = string | string[] | LibraryCustomUmdObject;
type T = UmdLibraryPluginParsed;
