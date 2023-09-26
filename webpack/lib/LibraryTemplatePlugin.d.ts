export = LibraryTemplatePlugin;
/** @typedef {import("../declarations/WebpackOptions").AuxiliaryComment} AuxiliaryComment */
/** @typedef {import("../declarations/WebpackOptions").LibraryExport} LibraryExport */
/** @typedef {import("../declarations/WebpackOptions").LibraryName} LibraryName */
/** @typedef {import("../declarations/WebpackOptions").LibraryType} LibraryType */
/** @typedef {import("../declarations/WebpackOptions").UmdNamedDefine} UmdNamedDefine */
/** @typedef {import("./Compiler")} Compiler */
declare class LibraryTemplatePlugin {
  /**
   * @param {LibraryName} name name of library
   * @param {LibraryType} target type of library
   * @param {UmdNamedDefine} umdNamedDefine setting this to true will name the UMD module
   * @param {AuxiliaryComment} auxiliaryComment comment in the UMD wrapper
   * @param {LibraryExport} exportProperty which export should be exposed as library
   */
  constructor(
    name: LibraryName,
    target: LibraryType,
    umdNamedDefine: UmdNamedDefine,
    auxiliaryComment: AuxiliaryComment,
    exportProperty: LibraryExport,
  );
  library: {
    type: string;
    name: import('../declarations/WebpackOptions').LibraryName;
    umdNamedDefine: boolean;
    auxiliaryComment: import('../declarations/WebpackOptions').AuxiliaryComment;
    export: import('../declarations/WebpackOptions').LibraryExport;
  };
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace LibraryTemplatePlugin {
  export {
    AuxiliaryComment,
    LibraryExport,
    LibraryName,
    LibraryType,
    UmdNamedDefine,
    Compiler,
  };
}
type Compiler = import('./Compiler');
type LibraryName = import('../declarations/WebpackOptions').LibraryName;
type LibraryType = import('../declarations/WebpackOptions').LibraryType;
type UmdNamedDefine = import('../declarations/WebpackOptions').UmdNamedDefine;
type AuxiliaryComment =
  import('../declarations/WebpackOptions').AuxiliaryComment;
type LibraryExport = import('../declarations/WebpackOptions').LibraryExport;
