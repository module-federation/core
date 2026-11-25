export = PrefetchDependency;
declare class PrefetchDependency extends ModuleDependency {
    /**
     * Creates an instance of PrefetchDependency.
     * @param {string} request the request string
     */
    constructor(request: string);
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
