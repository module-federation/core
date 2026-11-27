export = DelegatedSourceDependency;
declare class DelegatedSourceDependency extends ModuleDependency {
    /**
     * Creates an instance of DelegatedSourceDependency.
     * @param {string} request the request string
     */
    constructor(request: string);
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
