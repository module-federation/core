export = LoaderDependency;
/** @import { GetConditionFn } from "../graph/Dependency" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
declare class LoaderDependency extends ModuleDependency {
    /**
     * Creates an instance of LoaderDependency.
     * @param {string} request request string
     */
    constructor(request: string);
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
