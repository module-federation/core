export = ProvideSharedModuleFactory;
/** @typedef {import("webpack/lib/ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("webpack/lib/ModuleFactory").ModuleFactoryResult} ModuleFactoryResult */
/** @typedef {import("./ProvideSharedDependency")} ProvideSharedDependency */
declare class ProvideSharedModuleFactory {
    /**
     * @param {ModuleFactoryCreateData} data data object
     * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
     * @returns {void}
     */
    create(data: any, callback: (arg0: (Error | null) | undefined, arg1: ModuleFactoryResult | undefined) => void): void;
}
declare namespace ProvideSharedModuleFactory {
    export { ModuleFactoryCreateData, ModuleFactoryResult, ProvideSharedDependency };
}
type ModuleFactoryResult = any;
type ModuleFactoryCreateData = any;
type ProvideSharedDependency = import("./ProvideSharedDependency");
