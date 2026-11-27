export = RequireIncludeDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { ReferencedExports } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import { RuntimeSpec } from "../../util/runtime" */
declare class RequireIncludeDependency extends ModuleDependency {
    /**
     * Creates an instance of RequireIncludeDependency.
     * @param {string} request the request string
     * @param {Range} range location in source code
     */
    constructor(request: string, range: Range);
}
declare namespace RequireIncludeDependency {
    export { RequireIncludeDependencyTemplate as Template };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const RequireIncludeDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class RequireIncludeDependencyTemplate extends RequireIncludeDependencyTemplate_base {
}
