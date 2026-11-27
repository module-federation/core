export = ContextDependencyTemplateAsRequireCall;
declare const ContextDependencyTemplateAsRequireCall_base: typeof import("../../template/DependencyTemplate");
/** @import { ReplaceSource } from "webpack-sources" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
declare class ContextDependencyTemplateAsRequireCall extends ContextDependencyTemplateAsRequireCall_base {
    /**
     * Rewrites the call around its request, dropping anything the original one
     * carried after it. Overridden where a later argument must be kept.
     * @param {ContextDependency} dep the dependency
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {string} moduleExports the expression the request is passed to
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {void}
     */
    replaceCall(dep: ContextDependency, source: ReplaceSource, moduleExports: string, templateContext: DependencyTemplateContext): void;
}
import ContextDependency = require("./ContextDependency");
import type { ReplaceSource } from "webpack-sources";
import type { DependencyTemplateContext } from "../../template/DependencyTemplate";
