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
declare abstract class ModuleFactory {
  create(
    data: ModuleFactoryCreateData,
    callback: (arg0?: null | Error, arg1?: ModuleFactoryResult) => void,
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
  resolveOptions?: ResolveOptions;
  context: string;
  dependencies: Dependency[];
};
type ModuleFactoryResult = {
  /**
   * the created module or unset if no module was created
   */
  module?: Module;
  fileDependencies?: Set<string>;
  contextDependencies?: Set<string>;
  missingDependencies?: Set<string>;

  /**
   * allow to use the unsafe cache
   */
  cacheable?: boolean;
};
type ResolveOptions = import('../declarations/WebpackOptions').ResolveOptions;
type Dependency = import('./Dependency');
type Module = import('./Module');
type ModuleFactoryCreateDataContextInfo = {
  issuer: string;
  issuerLayer?: null | string;
  compiler: string;
};
