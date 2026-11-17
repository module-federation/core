export = FallbackItemDependency;
declare class FallbackItemDependency extends ModuleDependency {
    /**
     * Creates an instance of FallbackItemDependency.
     * @param {string} request request
     */
    constructor(request: string);
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
