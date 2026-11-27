export = ProvideForSharedDependency;
declare class ProvideForSharedDependency extends ModuleDependency {
    /**
     * Creates an instance of ProvideForSharedDependency.
     * @param {string} request request string
     */
    constructor(request: string);
}
declare namespace ProvideForSharedDependency {
    let KINDS: Set<keyof DependencyKinds>;
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
import type { DependencyKinds } from "../graph/Dependency";
