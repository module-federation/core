export = PrefetchDependency;
declare class PrefetchDependency extends ModuleDependency {
    /**
     * @param {string} request the request string
     */
    constructor(request: string);
}
import ModuleDependency = require("./ModuleDependency");
