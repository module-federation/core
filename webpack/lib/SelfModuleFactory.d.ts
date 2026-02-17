export = SelfModuleFactory;
/** @typedef {import("./ModuleFactory").ModuleFactoryCallback} ModuleFactoryCallback */
/** @typedef {import("./ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("./ModuleGraph")} ModuleGraph */
declare class SelfModuleFactory {
    /**
     * @param {ModuleGraph} moduleGraph module graph
     */
    constructor(moduleGraph: ModuleGraph);
    moduleGraph: import("./ModuleGraph");
    /**
     * @param {ModuleFactoryCreateData} data data object
     * @param {ModuleFactoryCallback} callback callback
     * @returns {void}
     */
    create(data: ModuleFactoryCreateData, callback: ModuleFactoryCallback): void;
}
declare namespace SelfModuleFactory {
    export { ModuleFactoryCallback, ModuleFactoryCreateData, ModuleGraph };
}
type ModuleFactoryCallback = import("./ModuleFactory").ModuleFactoryCallback;
type ModuleFactoryCreateData = import("./ModuleFactory").ModuleFactoryCreateData;
type ModuleGraph = import("./ModuleGraph");
