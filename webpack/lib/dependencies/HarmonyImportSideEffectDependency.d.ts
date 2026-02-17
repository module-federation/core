export = HarmonyImportSideEffectDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").GetConditionFn} GetConditionFn */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../ModuleGraphConnection").ConnectionState} ConnectionState */
/** @typedef {import("../javascript/JavascriptParser").ImportAttributes} ImportAttributes */
/** @typedef {import("./ImportPhase").ImportPhaseType} ImportPhaseType */
declare class HarmonyImportSideEffectDependency extends HarmonyImportDependency {
    /**
     * @param {string} request the request string
     * @param {number} sourceOrder source order
     * @param {ImportPhaseType} phase import phase
     * @param {ImportAttributes=} attributes import attributes
     */
    constructor(request: string, sourceOrder: number, phase: ImportPhaseType, attributes?: ImportAttributes | undefined);
}
declare namespace HarmonyImportSideEffectDependency {
    export { HarmonyImportSideEffectDependencyTemplate as Template, ReplaceSource, Dependency, GetConditionFn, DependencyTemplateContext, Module, ModuleGraph, ConnectionState, ImportAttributes, ImportPhaseType };
}
import HarmonyImportDependency = require("./HarmonyImportDependency");
declare const HarmonyImportSideEffectDependencyTemplate_base: {
    new (): {
        apply(dependency: import("../Dependency"), source: HarmonyImportDependency.ReplaceSource, templateContext: HarmonyImportDependency.DependencyTemplateContext): void;
    };
    getImportEmittedRuntime(module: HarmonyImportDependency.Module, referencedModule: HarmonyImportDependency.Module): RuntimeSpec | boolean;
};
declare class HarmonyImportSideEffectDependencyTemplate extends HarmonyImportSideEffectDependencyTemplate_base {
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type Dependency = import("../Dependency");
type GetConditionFn = import("../Dependency").GetConditionFn;
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type Module = import("../Module");
type ModuleGraph = import("../ModuleGraph");
type ConnectionState = import("../ModuleGraphConnection").ConnectionState;
type ImportAttributes = import("../javascript/JavascriptParser").ImportAttributes;
type ImportPhaseType = import("./ImportPhase").ImportPhaseType;
