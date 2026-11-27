export = ImportMetaContextDependency;
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import { ContextDependencyOptions } from "./ContextDependency" */
declare class ImportMetaContextDependency extends ContextDependency {
    /**
     * Creates an instance of ImportMetaContextDependency.
     * @param {ContextDependencyOptions} options options
     * @param {Range} range range
     */
    constructor(options: ContextDependency.ContextDependencyOptions, range: Range);
}
declare namespace ImportMetaContextDependency {
    export { ModuleDependencyTemplateAsRequireId as Template };
}
import ContextDependency = require("./ContextDependency");
import type { Range } from "../../javascript/JavascriptParser";
import ModuleDependencyTemplateAsRequireId = require("../core/ModuleDependencyTemplateAsRequireId");
