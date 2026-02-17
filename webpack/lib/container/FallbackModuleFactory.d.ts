export = FallbackModuleFactory;
declare class FallbackModuleFactory extends ModuleFactory {
}
declare namespace FallbackModuleFactory {
    export { ModuleFactoryCallback, ModuleFactoryCreateData, FallbackDependency };
}
import ModuleFactory = require("../ModuleFactory");
type ModuleFactoryCallback = import("../ModuleFactory").ModuleFactoryCallback;
type ModuleFactoryCreateData = import("../ModuleFactory").ModuleFactoryCreateData;
type FallbackDependency = import("./FallbackDependency");
