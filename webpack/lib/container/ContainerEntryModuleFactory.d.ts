export = ContainerEntryModuleFactory;
declare class ContainerEntryModuleFactory extends ModuleFactory {}
declare namespace ContainerEntryModuleFactory {
  export {
    ModuleFactoryCreateData,
    ModuleFactoryResult,
    ContainerEntryDependency,
  };
}
import ModuleFactory = require('../ModuleFactory');
type ModuleFactoryCreateData =
  import('../ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult = import('../ModuleFactory').ModuleFactoryResult;
type ContainerEntryDependency = import('./ContainerEntryDependency');
