export = ModuleFactory;
/** @typedef {import("../declarations/WebpackOptions").ResolveOptions} ResolveOptions */
/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./Module")} Module */
/**
 * @typedef {Object} ModuleFactoryResult
 * @property {Module=} module the created module or unset if no module was created
 * @property {Set<string>=} fileDependencies
 * @property {Set<string>=} contextDependencies
 * @property {Set<string>=} missingDependencies
 * @property {boolean=} cacheable allow to use the unsafe cache
 */
/**
 * @typedef {Object} ModuleFactoryCreateDataContextInfo
 * @property {string} issuer
 * @property {string | null=} issuerLayer
 * @property {string} compiler
 */
/**
 * @typedef {Object} ModuleFactoryCreateData
 * @property {ModuleFactoryCreateDataContextInfo} contextInfo
 * @property {ResolveOptions=} resolveOptions
 * @property {string} context
 * @property {Dependency[]} dependencies
 */
declare class ModuleFactory {
  /**
   * @abstract
   * @param {ModuleFactoryCreateData} data data object
   * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
   * @returns {void}
   */
  create(
    data: ModuleFactoryCreateData,
    callback: (
      arg0: (Error | null) | undefined,
      arg1: ModuleFactoryResult | undefined,
    ) => void,
  ): void;
}
declare namespace ModuleFactory {
  export {
    ResolveOptions,
    Dependency,
    Module,
    ModuleFactoryResult,
    ModuleFactoryCreateDataContextInfo,
    ModuleFactoryCreateData,
  };
}
type ModuleFactoryCreateData = {
  contextInfo: ModuleFactoryCreateDataContextInfo;
  resolveOptions?: ResolveOptions | undefined;
  context: string;
  dependencies: Dependency[];
};
type ModuleFactoryResult = {
  /**
   * the created module or unset if no module was created
   */
  module?: Module | undefined;
  fileDependencies?: Set<string> | undefined;
  contextDependencies?: Set<string> | undefined;
  missingDependencies?: Set<string> | undefined;
  /**
   * allow to use the unsafe cache
   */
  cacheable?: boolean | undefined;
};
type ResolveOptions = import('../declarations/WebpackOptions').ResolveOptions;
type Dependency = import('./Dependency');
type Module = import('./Module');
type ModuleFactoryCreateDataContextInfo = {
  issuer: string;
  issuerLayer?: (string | null) | undefined;
  compiler: string;
};
