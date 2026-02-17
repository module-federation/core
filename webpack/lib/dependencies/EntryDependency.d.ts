export = EntryDependency;
declare class EntryDependency extends ModuleDependency {
    /**
     * @param {string} request request path for entry
     */
    constructor(request: string);
}
import ModuleDependency = require("./ModuleDependency");
