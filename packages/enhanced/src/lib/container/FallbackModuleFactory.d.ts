export = FallbackModuleFactory;
declare class FallbackModuleFactory extends ModuleFactory {}
declare namespace FallbackModuleFactory {
  export { ModuleFactoryCreateData, ModuleFactoryResult, FallbackDependency };
}
import ModuleFactory = require('webpack/lib/ModuleFactory');
type ModuleFactoryCreateData =
  import('webpack/lib/ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult =
  import('webpack/lib/ModuleFactory').ModuleFactoryResult;
type FallbackDependency = import('./FallbackDependency');
