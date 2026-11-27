export = CssUrlDependency;
declare class CssUrlDependency extends ModuleDependency {
    /**
     * Creates an instance of CssUrlDependency.
     * @param {string} request request
     * @param {Range} range range of the argument
     * @param {"string" | "url" | "src"} urlType dependency type e.g. url() or string
     */
    constructor(request: string, range: Range, urlType: "string" | "url" | "src");
    urlType: "string" | "url" | "src";
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
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize(context: ObjectDeserializerContext): void;
}
declare namespace CssUrlDependency {
    export { CssUrlDependencyTemplate as Template, KINDS, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("../core/ModuleDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare const CssUrlDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class CssUrlDependencyTemplate extends CssUrlDependencyTemplate_base {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Dependency} dependency the dependency for which the template should be applied
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {void}
     */
    apply(dependency: Dependency, source: ReplaceSource, { type, moduleGraph, runtimeTemplate, codeGenerationResults }: DependencyTemplateContext): void;
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
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<["string" | "url" | "src", true | undefined, true | undefined, ("high" | "low" | "auto" | undefined), string | undefined, string | undefined, string | undefined]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<["string" | "url" | "src", true | undefined, true | undefined, ("high" | "low" | "auto" | undefined), string | undefined, string | undefined, string | undefined]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { CssDependencyTemplateContext as DependencyTemplateContext } from "../../template/DependencyTemplate";
import type Module from "../../module/Module";
import type { RuntimeSpec } from "../../util/runtime";
import type CodeGenerationResults from "../../module/CodeGenerationResults";
