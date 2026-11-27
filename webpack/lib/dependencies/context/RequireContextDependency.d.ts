export = RequireContextDependency;
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import { ContextDependencyOptions } from "./ContextDependency" */
declare class RequireContextDependency extends ContextDependency {
    /**
     * Creates an instance of RequireContextDependency.
     * @param {ContextDependencyOptions} options options
     * @param {Range} range range
     */
    constructor(options: ContextDependency.ContextDependencyOptions, range: Range);
}
declare namespace RequireContextDependency {
    export { ModuleDependencyTemplateAsRequireId as Template };
}
import ContextDependency = require("./ContextDependency");
import type { Range } from "../../javascript/JavascriptParser";
import ModuleDependencyTemplateAsRequireId = require("../core/ModuleDependencyTemplateAsRequireId");
