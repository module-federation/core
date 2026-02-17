export = FallbackModuleFactory;
declare class FallbackModuleFactory extends ModuleFactory {}
declare namespace FallbackModuleFactory {
  export { ModuleFactoryCreateData, ModuleFactoryResult, FallbackDependency };
}
import ModuleFactory = require('../ModuleFactory');
type ModuleFactoryCreateData =
  import('../ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult = import('../ModuleFactory').ModuleFactoryResult;
type FallbackDependency = import('./FallbackDependency');
