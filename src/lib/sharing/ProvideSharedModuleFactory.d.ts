export = ProvideSharedModuleFactory;
/** @typedef {import("webpack/lib/ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("webpack/lib/ModuleFactory").ModuleFactoryResult} ModuleFactoryResult */
/** @typedef {import("./ProvideSharedDependency")} ProvideSharedDependency */
declare class ProvideSharedModuleFactory extends ModuleFactory {
    /**
     * @param {ModuleFactoryCreateData} data data object
     * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
     * @returns {void}
     */
    create(data: ModuleFactoryCreateData, callback: (arg0: (Error | null) | undefined, arg1: ModuleFactoryResult | undefined) => void): void;
}
declare namespace ProvideSharedModuleFactory {
    export { ModuleFactoryCreateData, ModuleFactoryResult, ProvideSharedDependency };
}
import ModuleFactory = require("webpack/lib/ModuleFactory");
type ModuleFactoryCreateData = import("webpack/lib/ModuleFactory").ModuleFactoryCreateData;
type ModuleFactoryResult = import("webpack/lib/ModuleFactory").ModuleFactoryResult;
type ProvideSharedDependency = import("./ProvideSharedDependency");
