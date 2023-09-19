export = FallbackModuleFactory;
declare class FallbackModuleFactory {
    /**
     * @param {ModuleFactoryCreateData} data data object
     * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
     * @returns {void}
     */
    create({ dependencies: [dependency] }: any, callback: (arg0: (Error | null) | undefined, arg1: ModuleFactoryResult | undefined) => void): void;
}
declare namespace FallbackModuleFactory {
    export { ModuleFactoryCreateData, ModuleFactoryResult, FallbackDependency };
}
type ModuleFactoryResult = any;
type ModuleFactoryCreateData = any;
type FallbackDependency = import("./FallbackDependency");
