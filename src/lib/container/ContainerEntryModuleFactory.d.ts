export = ContainerEntryModuleFactory;
declare class ContainerEntryModuleFactory {
    /**
     * @param {ModuleFactoryCreateData} data data object
     * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
     * @returns {void}
     */
    create({ dependencies: [dependency] }: any, callback: (arg0: (Error | null) | undefined, arg1: ModuleFactoryResult | undefined) => void): void;
}
declare namespace ContainerEntryModuleFactory {
    export { ModuleFactoryCreateData, ModuleFactoryResult, ContainerEntryDependency };
}
type ModuleFactoryResult = any;
type ModuleFactoryCreateData = any;
type ContainerEntryDependency = import("./ContainerEntryDependency");
