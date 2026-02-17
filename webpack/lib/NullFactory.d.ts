export = NullFactory;
/** @typedef {import("./ModuleFactory").ModuleFactoryCallback} ModuleFactoryCallback */
/** @typedef {import("./ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
declare class NullFactory extends ModuleFactory {
}
declare namespace NullFactory {
    export { ModuleFactoryCallback, ModuleFactoryCreateData };
}
import ModuleFactory = require("./ModuleFactory");
type ModuleFactoryCallback = import("./ModuleFactory").ModuleFactoryCallback;
type ModuleFactoryCreateData = import("./ModuleFactory").ModuleFactoryCreateData;
