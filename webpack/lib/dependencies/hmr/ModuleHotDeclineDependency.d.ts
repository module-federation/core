export = ModuleHotDeclineDependency;
/** @import { Range } from "../../javascript/JavascriptParser" */
declare class ModuleHotDeclineDependency extends ModuleDependency {
    /**
     * Creates an instance of ModuleHotDeclineDependency.
     * @param {string} request the request string
     * @param {Range} range location in source code
     */
    constructor(request: string, range: Range);
}
declare namespace ModuleHotDeclineDependency {
    export { ModuleDependencyTemplateAsId as Template };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
import ModuleDependencyTemplateAsId = require("../core/ModuleDependencyTemplateAsId");
