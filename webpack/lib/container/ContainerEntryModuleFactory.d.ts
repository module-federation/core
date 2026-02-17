export = ContainerEntryModuleFactory;
declare class ContainerEntryModuleFactory extends ModuleFactory {
}
declare namespace ContainerEntryModuleFactory {
    export { ModuleFactoryCallback, ModuleFactoryCreateData, ContainerEntryDependency };
}
import ModuleFactory = require("../ModuleFactory");
type ModuleFactoryCallback = import("../ModuleFactory").ModuleFactoryCallback;
type ModuleFactoryCreateData = import("../ModuleFactory").ModuleFactoryCreateData;
type ContainerEntryDependency = import("./ContainerEntryDependency");
