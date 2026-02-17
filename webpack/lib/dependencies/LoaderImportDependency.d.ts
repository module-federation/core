export = LoaderImportDependency;
/** @typedef {import("../Dependency").GetConditionFn} GetConditionFn */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
declare class LoaderImportDependency extends ModuleDependency {
    /**
     * @param {string} request request string
     */
    constructor(request: string);
}
declare namespace LoaderImportDependency {
    export { GetConditionFn, ModuleGraph };
}
import ModuleDependency = require("./ModuleDependency");
type GetConditionFn = import("../Dependency").GetConditionFn;
type ModuleGraph = import("../ModuleGraph");
