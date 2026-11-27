export = ConsumeSharedFallbackDependency;
declare class ConsumeSharedFallbackDependency extends ModuleDependency {
    /**
     * Creates an instance of ConsumeSharedFallbackDependency.
     * @param {string} request the request
     */
    constructor(request: string);
}
declare namespace ConsumeSharedFallbackDependency {
    let KINDS: Set<keyof DependencyKinds>;
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
import type { DependencyKinds } from "../graph/Dependency";
