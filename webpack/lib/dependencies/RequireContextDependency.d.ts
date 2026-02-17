export = RequireContextDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("./ContextDependency").ContextDependencyOptions} ContextDependencyOptions */
declare class RequireContextDependency extends ContextDependency {
    /**
     * @param {ContextDependencyOptions} options options
     * @param {Range} range range
     */
    constructor(options: ContextDependencyOptions, range: Range);
}
declare namespace RequireContextDependency {
    export { ModuleDependencyTemplateAsRequireId as Template, Range, ContextDependencyOptions };
}
import ContextDependency = require("./ContextDependency");
import ModuleDependencyTemplateAsRequireId = require("./ModuleDependencyTemplateAsRequireId");
type Range = import("../javascript/JavascriptParser").Range;
type ContextDependencyOptions = import("./ContextDependency").ContextDependencyOptions;
