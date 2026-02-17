export = RequireResolveDependency;
/** @typedef {import("../Dependency").ReferencedExports} ReferencedExports */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class RequireResolveDependency extends ModuleDependency {
    /**
     * @param {string} request the request string
     * @param {Range} range location in source code
     * @param {string=} context context
     */
    constructor(request: string, range: Range, context?: string | undefined);
    _context: string;
}
declare namespace RequireResolveDependency {
    export { ModuleDependencyAsId as Template, ReferencedExports, ModuleGraph, Range, RuntimeSpec };
}
import ModuleDependency = require("./ModuleDependency");
import ModuleDependencyAsId = require("./ModuleDependencyTemplateAsId");
type ReferencedExports = import("../Dependency").ReferencedExports;
type ModuleGraph = import("../ModuleGraph");
type Range = import("../javascript/JavascriptParser").Range;
type RuntimeSpec = import("../util/runtime").RuntimeSpec;
