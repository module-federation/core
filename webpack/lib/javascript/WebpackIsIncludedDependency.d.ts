export = WebpackIsIncludedDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { ReferencedExports } from "../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../template/DependencyTemplate" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/** @import { Range } from "../javascript/JavascriptParser" */
/** @import { RuntimeSpec } from "../util/runtime" */
declare class WebpackIsIncludedDependency extends ModuleDependency {
    /**
     * Creates an instance of WebpackIsIncludedDependency.
     * @param {string} request the request string
     * @param {Range} range location in source code
     */
    constructor(request: string, range: Range);
}
declare namespace WebpackIsIncludedDependency {
    export { WebpackIsIncludedDependencyTemplate as Template };
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
import type { Range } from "../javascript/JavascriptParser";
declare const WebpackIsIncludedDependencyTemplate_base: typeof import("../template/DependencyTemplate");
declare class WebpackIsIncludedDependencyTemplate extends WebpackIsIncludedDependencyTemplate_base {
}
