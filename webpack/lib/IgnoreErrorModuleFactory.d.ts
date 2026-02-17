export = IgnoreErrorModuleFactory;
/** @typedef {import("./ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("./ModuleFactory").ModuleFactoryResult} ModuleFactoryResult */
/** @typedef {import("./NormalModuleFactory")} NormalModuleFactory */
/**
 * Ignores error when module is unresolved
 */
declare class IgnoreErrorModuleFactory extends ModuleFactory {
  /**
   * @param {NormalModuleFactory} normalModuleFactory normalModuleFactory instance
   */
  constructor(normalModuleFactory: NormalModuleFactory);
  normalModuleFactory: import('./NormalModuleFactory');
}
declare namespace IgnoreErrorModuleFactory {
  export { ModuleFactoryCreateData, ModuleFactoryResult, NormalModuleFactory };
}
import ModuleFactory = require('./ModuleFactory');
type NormalModuleFactory = import('./NormalModuleFactory');
type ModuleFactoryCreateData =
  import('./ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult = import('./ModuleFactory').ModuleFactoryResult;
