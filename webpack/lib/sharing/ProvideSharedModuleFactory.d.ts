export = ProvideSharedModuleFactory;
/** @typedef {import("../ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("../ModuleFactory").ModuleFactoryResult} ModuleFactoryResult */
/** @typedef {import("./ProvideSharedDependency")} ProvideSharedDependency */
declare class ProvideSharedModuleFactory extends ModuleFactory {}
declare namespace ProvideSharedModuleFactory {
  export {
    ModuleFactoryCreateData,
    ModuleFactoryResult,
    ProvideSharedDependency,
  };
}
import ModuleFactory = require('../ModuleFactory');
type ModuleFactoryCreateData =
  import('../ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult = import('../ModuleFactory').ModuleFactoryResult;
type ProvideSharedDependency = import('./ProvideSharedDependency');
