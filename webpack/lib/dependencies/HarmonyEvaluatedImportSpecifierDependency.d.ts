export = HarmonyEvaluatedImportSpecifierDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
/** @typedef {import("../ModuleGraphConnection")} ModuleGraphConnection */
/** @typedef {import("../javascript/JavascriptParser").ImportAttributes} ImportAttributes */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./HarmonyImportDependency").Ids} Ids */
/**
 * Dependency for static evaluating import specifier. e.g.
 * @example
 * import a from "a";
 * "x" in a;
 * a.x !== undefined; // if x value statically analyzable
 */
declare class HarmonyEvaluatedImportSpecifierDependency extends HarmonyImportSpecifierDependency {
    /**
     * @param {string} request the request string
     * @param {number} sourceOrder source order
     * @param {Ids} ids ids
     * @param {string} name name
     * @param {Range} range location in source code
     * @param {ImportAttributes | undefined} attributes import assertions
     * @param {string} operator operator
     */
    constructor(request: string, sourceOrder: number, ids: Ids, name: string, range: Range, attributes: ImportAttributes | undefined, operator: string);
    operator: string;
}
declare namespace HarmonyEvaluatedImportSpecifierDependency {
    export { HarmonyEvaluatedImportSpecifierDependencyTemplate as Template, ReplaceSource, Dependency, DependencyTemplateContext, BuildMeta, ModuleGraphConnection, ImportAttributes, Range, ObjectDeserializerContext, ObjectSerializerContext, Ids };
}
import HarmonyImportSpecifierDependency = require("./HarmonyImportSpecifierDependency");
declare const HarmonyEvaluatedImportSpecifierDependencyTemplate_base: {
    new (): {
        apply(dependency: import("../Dependency"), source: HarmonyImportSpecifierDependency.ReplaceSource, templateContext: HarmonyImportSpecifierDependency.DependencyTemplateContext): void;
        _getCodeForIds(dep: HarmonyImportSpecifierDependency, source: HarmonyImportSpecifierDependency.ReplaceSource, templateContext: HarmonyImportSpecifierDependency.DependencyTemplateContext, ids: HarmonyImportSpecifierDependency.Ids): string;
    };
    getImportEmittedRuntime(module: Module, referencedModule: Module): RuntimeSpec | boolean;
};
declare class HarmonyEvaluatedImportSpecifierDependencyTemplate extends HarmonyEvaluatedImportSpecifierDependencyTemplate_base {
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type Dependency = import("../Dependency");
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type BuildMeta = import("../Module").BuildMeta;
type ModuleGraphConnection = import("../ModuleGraphConnection");
type ImportAttributes = import("../javascript/JavascriptParser").ImportAttributes;
type Range = import("../javascript/JavascriptParser").Range;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type Ids = import("./HarmonyImportDependency").Ids;
