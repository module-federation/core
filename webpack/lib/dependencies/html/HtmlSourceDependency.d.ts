export = HtmlSourceDependency;
declare class HtmlSourceDependency extends ModuleDependency {
    /**
     * Creates an instance of HtmlSourceDependency.
     * @param {string} request request
     * @param {Range} range range of the argument
     */
    constructor(request: string, range: Range);
    /** @type {true | undefined} */
    prefetch: true | undefined;
    /** @type {true | undefined} */
    preload: true | undefined;
    /** @type {"low" | "high" | "auto" | undefined} */
    fetchPriority: "low" | "high" | "auto" | undefined;
    /** @type {string | undefined} */
    asAttribute: string | undefined;
    /** @type {string | undefined} */
    typeAttribute: string | undefined;
    /** @type {string | undefined} */
    mediaAttribute: string | undefined;
    get referencedSourceType(): "asset-url";
}
declare namespace HtmlSourceDependency {
    export { HtmlSourceDependencyTemplate as Template };
    export let KINDS: Set<keyof Dependency.DependencyKinds>;
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const HtmlSourceDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class HtmlSourceDependencyTemplate extends HtmlSourceDependencyTemplate_base {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Dependency} dependency the dependency for which the template should be applied
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {void}
     */
    apply(dependency: Dependency, source: ReplaceSource, { moduleGraph, runtimeTemplate, codeGenerationResults }: DependencyTemplateContext): void;
    /**
     * Returns the url of the asset.
     * @param {object} options options object
     * @param {Module} options.module the module
     * @param {RuntimeSpec=} options.runtime runtime
     * @param {CodeGenerationResults} options.codeGenerationResults the code generation results
     * @returns {string} the url of the asset
     */
    assetUrl({ runtime, module, codeGenerationResults }: {
        module: Module;
        runtime?: RuntimeSpec | undefined;
        codeGenerationResults: CodeGenerationResults;
    }): string;
}
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { CssDependencyTemplateContext as DependencyTemplateContext } from "../../template/DependencyTemplate";
import type Module from "../../module/Module";
import type { RuntimeSpec } from "../../util/runtime";
import type CodeGenerationResults from "../../module/CodeGenerationResults";
