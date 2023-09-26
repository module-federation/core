export = ConcatenationScope;
/**
 * @typedef {Object} ExternalModuleInfo
 * @property {number} index
 * @property {Module} module
 */
/**
 * @typedef {Object} ConcatenatedModuleInfo
 * @property {number} index
 * @property {Module} module
 * @property {Map<string, string>} exportMap mapping from export name to symbol
 * @property {Map<string, string>} rawExportMap mapping from export name to symbol
 * @property {string=} namespaceExportSymbol
 */
/** @typedef {ConcatenatedModuleInfo | ExternalModuleInfo} ModuleInfo */
/**
 * @typedef {Object} ModuleReferenceOptions
 * @property {string[]} ids the properties/exports of the module
 * @property {boolean} call true, when this referenced export is called
 * @property {boolean} directImport true, when this referenced export is directly imported (not via property access)
 * @property {boolean | undefined} asiSafe if the position is ASI safe or unknown
 */
declare class ConcatenationScope {
  /**
   * @param {string} name the identifier
   * @returns {boolean} true, when it's an module reference
   */
  static isModuleReference(name: string): boolean;
  /**
   * @param {string} name the identifier
   * @returns {ModuleReferenceOptions & { index: number } | null} parsed options and index
   */
  static matchModuleReference(name: string): ModuleReferenceOptions & {
    index: number;
  };
  /**
   * @param {ModuleInfo[] | Map<Module, ModuleInfo>} modulesMap all module info by module
   * @param {ConcatenatedModuleInfo} currentModule the current module info
   */
  constructor(
    modulesMap: ModuleInfo[] | Map<Module, ModuleInfo>,
    currentModule: ConcatenatedModuleInfo,
  );
  _currentModule: ConcatenatedModuleInfo;
  _modulesMap: Map<import('./Module'), ModuleInfo>;
  /**
   * @param {Module} module the referenced module
   * @returns {boolean} true, when it's in the scope
   */
  isModuleInScope(module: Module): boolean;
  /**
   *
   * @param {string} exportName name of the export
   * @param {string} symbol identifier of the export in source code
   */
  registerExport(exportName: string, symbol: string): void;
  /**
   *
   * @param {string} exportName name of the export
   * @param {string} expression expression to be used
   */
  registerRawExport(exportName: string, expression: string): void;
  /**
   * @param {string} symbol identifier of the export in source code
   */
  registerNamespaceExport(symbol: string): void;
  /**
   *
   * @param {Module} module the referenced module
   * @param {Partial<ModuleReferenceOptions>} options options
   * @returns {string} the reference as identifier
   */
  createModuleReference(
    module: Module,
    { ids, call, directImport, asiSafe }: Partial<ModuleReferenceOptions>,
  ): string;
}
declare namespace ConcatenationScope {
  export {
    DEFAULT_EXPORT,
    NAMESPACE_OBJECT_EXPORT,
    Module,
    ExternalModuleInfo,
    ConcatenatedModuleInfo,
    ModuleInfo,
    ModuleReferenceOptions,
  };
}
type ConcatenatedModuleInfo = {
  index: number;
  module: Module;
  /**
   * mapping from export name to symbol
   */
  exportMap: Map<string, string>;
  /**
   * mapping from export name to symbol
   */
  rawExportMap: Map<string, string>;
  namespaceExportSymbol?: string | undefined;
};
type ModuleInfo = ConcatenatedModuleInfo | ExternalModuleInfo;
type Module = import('./Module');
type ModuleReferenceOptions = {
  /**
   * the properties/exports of the module
   */
  ids: string[];
  /**
   * true, when this referenced export is called
   */
  call: boolean;
  /**
   * true, when this referenced export is directly imported (not via property access)
   */
  directImport: boolean;
  /**
   * if the position is ASI safe or unknown
   */
  asiSafe: boolean | undefined;
};
declare const DEFAULT_EXPORT: '__WEBPACK_DEFAULT_EXPORT__';
declare const NAMESPACE_OBJECT_EXPORT: '__WEBPACK_NAMESPACE_OBJECT__';
type ExternalModuleInfo = {
  index: number;
  module: Module;
};
