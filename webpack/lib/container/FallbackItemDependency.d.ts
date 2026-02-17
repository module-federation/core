export = FallbackItemDependency;
declare class FallbackItemDependency extends ModuleDependency {
    /**
     * @param {string} request request
     */
    constructor(request: string);
}
import ModuleDependency = require("../dependencies/ModuleDependency");
