export = DllModuleFactory;
/** @typedef {import("./ModuleFactory").ModuleFactoryCallback} ModuleFactoryCallback */
/** @typedef {import("./ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("./dependencies/DllEntryDependency")} DllEntryDependency */
declare class DllModuleFactory extends ModuleFactory {
  hooks: Readonly<{}>;
}
declare namespace DllModuleFactory {
  export { ModuleFactoryCallback, ModuleFactoryCreateData, DllEntryDependency };
}
import ModuleFactory = require('./ModuleFactory');
type ModuleFactoryCallback = import('./ModuleFactory').ModuleFactoryCallback;
type ModuleFactoryCreateData =
  import('./ModuleFactory').ModuleFactoryCreateData;
type DllEntryDependency = import('./dependencies/DllEntryDependency');
