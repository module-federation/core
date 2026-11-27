export = RequireResolveDependency;
/** @import { ReferencedExports } from "../../graph/Dependency" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import { RuntimeSpec } from "../../util/runtime" */
declare class RequireResolveDependency extends ModuleDependency {
    /**
     * Creates an instance of RequireResolveDependency.
     * @param {string} request the request string
     * @param {Range} range location in source code
     * @param {string=} context context
     */
    constructor(request: string, range: Range, context?: string | undefined);
}
declare namespace RequireResolveDependency {
    export { ModuleDependencyAsId as Template };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
import ModuleDependencyAsId = require("../core/ModuleDependencyTemplateAsId");
