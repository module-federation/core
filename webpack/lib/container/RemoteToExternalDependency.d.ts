export = RemoteToExternalDependency;
declare class RemoteToExternalDependency extends ModuleDependency {
    /**
     * Creates an instance of RemoteToExternalDependency.
     * @param {string} request request
     */
    constructor(request: string);
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
