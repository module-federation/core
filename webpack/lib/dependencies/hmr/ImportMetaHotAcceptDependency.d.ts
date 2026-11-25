export = ImportMetaHotAcceptDependency;
/** @import { Range } from "../../javascript/JavascriptParser" */
declare class ImportMetaHotAcceptDependency extends ModuleDependency {
    /**
     * Creates an instance of ImportMetaHotAcceptDependency.
     * @param {string} request the request string
     * @param {Range} range location in source code
     */
    constructor(request: string, range: Range);
}
declare namespace ImportMetaHotAcceptDependency {
    export { ModuleDependencyTemplateAsId as Template };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
import ModuleDependencyTemplateAsId = require("../core/ModuleDependencyTemplateAsId");
