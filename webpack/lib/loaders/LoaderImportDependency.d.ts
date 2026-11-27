export = LoaderImportDependency;
/** @import { GetConditionFn, DependencyKinds } from "../graph/Dependency" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
declare class LoaderImportDependency extends ModuleDependency {
    /**
     * Creates an instance of LoaderImportDependency.
     * @param {string} request request string
     */
    constructor(request: string);
}
declare namespace LoaderImportDependency {
    let KINDS: Set<keyof DependencyKinds>;
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
import type { DependencyKinds } from "../graph/Dependency";
