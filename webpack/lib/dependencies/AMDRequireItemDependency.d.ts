export = AMDRequireItemDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
declare class AMDRequireItemDependency extends ModuleDependency {
    /**
     * @param {string} request the request string
     * @param {Range=} range location in source code
     */
    constructor(request: string, range?: Range | undefined);
}
declare namespace AMDRequireItemDependency {
    export { ModuleDependencyTemplateAsRequireId as Template, Range };
}
import ModuleDependency = require("./ModuleDependency");
import ModuleDependencyTemplateAsRequireId = require("./ModuleDependencyTemplateAsRequireId");
type Range = import("../javascript/JavascriptParser").Range;
