export = ProvideSharedModuleFactory;
/** @typedef {import("../ModuleFactory").ModuleFactoryCallback} ModuleFactoryCallback */
/** @typedef {import("../ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("./ProvideSharedDependency")} ProvideSharedDependency */
declare class ProvideSharedModuleFactory extends ModuleFactory {
}
declare namespace ProvideSharedModuleFactory {
    export { ModuleFactoryCallback, ModuleFactoryCreateData, ProvideSharedDependency };
}
import ModuleFactory = require("../ModuleFactory");
type ModuleFactoryCallback = import("../ModuleFactory").ModuleFactoryCallback;
type ModuleFactoryCreateData = import("../ModuleFactory").ModuleFactoryCreateData;
type ProvideSharedDependency = import("./ProvideSharedDependency");
