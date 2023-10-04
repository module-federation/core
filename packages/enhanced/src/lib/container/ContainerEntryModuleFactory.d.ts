export = ContainerEntryModuleFactory;
declare class ContainerEntryModuleFactory extends ModuleFactory {}
declare namespace ContainerEntryModuleFactory {
  export {
    ModuleFactoryCreateData,
    ModuleFactoryResult,
    ContainerEntryDependency,
  };
}
import ModuleFactory = require('webpack/lib/ModuleFactory');
type ModuleFactoryCreateData =
  import('webpack/lib/ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult =
  import('webpack/lib/ModuleFactory').ModuleFactoryResult;
type ContainerEntryDependency = import('./ContainerEntryDependency');
