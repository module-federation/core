export = ProvideForSharedDependency;
declare class ProvideForSharedDependency extends ModuleDependency {
    /**
     * @param {string} request request string
     */
    constructor(request: string);
}
import ModuleDependency = require("../dependencies/ModuleDependency");
