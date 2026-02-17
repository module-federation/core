export = NullFactory;
/** @typedef {import("./ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("./ModuleFactory").ModuleFactoryResult} ModuleFactoryResult */
declare class NullFactory extends ModuleFactory {}
declare namespace NullFactory {
  export { ModuleFactoryCreateData, ModuleFactoryResult };
}
import ModuleFactory = require('./ModuleFactory');
type ModuleFactoryCreateData =
  import('./ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult = import('./ModuleFactory').ModuleFactoryResult;
