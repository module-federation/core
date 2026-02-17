export = ModuleFactory;
/** @typedef {import("../declarations/WebpackOptions").ResolveOptions} ResolveOptions */
/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./Module")} Module */
/**
 * @typedef {object} ModuleFactoryResult
 * @property {Module=} module the created module or unset if no module was created
 * @property {Set<string>=} fileDependencies
 * @property {Set<string>=} contextDependencies
 * @property {Set<string>=} missingDependencies
 * @property {boolean=} cacheable allow to use the unsafe cache
 */
/** @typedef {string | null} IssuerLayer */
/**
 * @typedef {object} ModuleFactoryCreateDataContextInfo
 * @property {string} issuer
 * @property {IssuerLayer} issuerLayer
 * @property {string=} compiler
 */
/**
 * @typedef {object} ModuleFactoryCreateData
 * @property {ModuleFactoryCreateDataContextInfo} contextInfo
 * @property {ResolveOptions=} resolveOptions
 * @property {string} context
 * @property {Dependency[]} dependencies
 */
/**
 * @typedef {(err?: Error | null, result?: ModuleFactoryResult) => void} ModuleFactoryCallback
 */
declare class ModuleFactory {
  /**
   * @abstract
   * @param {ModuleFactoryCreateData} data data object
   * @param {ModuleFactoryCallback} callback callback
   * @returns {void}
   */
  create(data: ModuleFactoryCreateData, callback: ModuleFactoryCallback): void;
}
declare namespace ModuleFactory {
  export {
    ResolveOptions,
    Dependency,
    Module,
    ModuleFactoryResult,
    IssuerLayer,
    ModuleFactoryCreateDataContextInfo,
    ModuleFactoryCreateData,
    ModuleFactoryCallback,
  };
}
type ResolveOptions = import('../declarations/WebpackOptions').ResolveOptions;
type Dependency = import('./Dependency');
type Module = import('./Module');
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
type IssuerLayer = string | null;
type ModuleFactoryCreateDataContextInfo = {
  issuer: string;
  issuerLayer: IssuerLayer;
  compiler?: string | undefined;
};
type ModuleFactoryCreateData = {
  contextInfo: ModuleFactoryCreateDataContextInfo;
  resolveOptions?: ResolveOptions | undefined;
  context: string;
  dependencies: Dependency[];
};
type ModuleFactoryCallback = (
  err?: Error | null,
  result?: ModuleFactoryResult,
) => void;
