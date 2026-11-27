export = EntryDependency;
declare class EntryDependency extends ModuleDependency {
    /**
     * Creates an instance of EntryDependency.
     * @param {string} request request path for entry
     */
    constructor(request: string);
}
declare namespace EntryDependency {
    let KINDS: Set<keyof DependencyKinds>;
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
import type { DependencyKinds } from "../graph/Dependency";
