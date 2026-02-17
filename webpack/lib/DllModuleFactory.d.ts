export = DllModuleFactory;
/** @typedef {import("./ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("./ModuleFactory").ModuleFactoryResult} ModuleFactoryResult */
/** @typedef {import("./dependencies/DllEntryDependency")} DllEntryDependency */
declare class DllModuleFactory extends ModuleFactory {
  hooks: Readonly<{}>;
}
declare namespace DllModuleFactory {
  export { ModuleFactoryCreateData, ModuleFactoryResult, DllEntryDependency };
}
import ModuleFactory = require('./ModuleFactory');
type ModuleFactoryCreateData =
  import('./ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult = import('./ModuleFactory').ModuleFactoryResult;
type DllEntryDependency = import('./dependencies/DllEntryDependency');
