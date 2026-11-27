export = AMDRequireItemDependency;
/** @import { Range } from "../../javascript/JavascriptParser" */
declare class AMDRequireItemDependency extends ModuleDependency {
    /**
     * Creates an instance of AMDRequireItemDependency.
     * @param {string} request the request string
     * @param {Range=} range location in source code
     */
    constructor(request: string, range?: Range | undefined);
}
declare namespace AMDRequireItemDependency {
    export { ModuleDependencyTemplateAsRequireId as Template };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
import ModuleDependencyTemplateAsRequireId = require("../core/ModuleDependencyTemplateAsRequireId");
