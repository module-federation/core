export = IgnoreErrorModuleFactory;
/** @typedef {import("./ModuleFactory").ModuleFactoryCallback} ModuleFactoryCallback */
/** @typedef {import("./ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("./NormalModuleFactory")} NormalModuleFactory */
/**
 * Ignores error when module is unresolved
 */
declare class IgnoreErrorModuleFactory extends ModuleFactory {
    /**
     * @param {NormalModuleFactory} normalModuleFactory normalModuleFactory instance
     */
    constructor(normalModuleFactory: NormalModuleFactory);
    normalModuleFactory: import("./NormalModuleFactory");
}
declare namespace IgnoreErrorModuleFactory {
    export { ModuleFactoryCallback, ModuleFactoryCreateData, NormalModuleFactory };
}
import ModuleFactory = require("./ModuleFactory");
type ModuleFactoryCallback = import("./ModuleFactory").ModuleFactoryCallback;
type ModuleFactoryCreateData = import("./ModuleFactory").ModuleFactoryCreateData;
type NormalModuleFactory = import("./NormalModuleFactory");
