export = DllModuleFactory;
/**
 * @import {
 * 	ModuleFactoryCallback,
 * 	ModuleFactoryCreateData
 * } from "../module/ModuleFactory"
 */
/** @import DllEntryDependency from "./DllEntryDependency" */
declare class DllModuleFactory extends ModuleFactory {
    hooks: Readonly<{}>;
}
import ModuleFactory = require("../module/ModuleFactory");
