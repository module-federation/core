export = AMDRequireArrayDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./AMDRequireItemDependency")} AMDRequireItemDependency */
declare class AMDRequireArrayDependency extends NullDependency {
    /**
     * @param {(string | LocalModuleDependency | AMDRequireItemDependency)[]} depsArray deps array
     * @param {Range} range range
     */
    constructor(depsArray: (string | LocalModuleDependency | AMDRequireItemDependency)[], range: Range);
    depsArray: (string | LocalModuleDependency | import("./AMDRequireItemDependency"))[];
    range: import("../javascript/JavascriptParser").Range;
}
declare namespace AMDRequireArrayDependency {
    export { AMDRequireArrayDependencyTemplate as Template, ReplaceSource, Dependency, DependencyTemplateContext, Range, ObjectDeserializerContext, ObjectSerializerContext, AMDRequireItemDependency };
}
import NullDependency = require("./NullDependency");
import LocalModuleDependency = require("./LocalModuleDependency");
declare class AMDRequireArrayDependencyTemplate extends DependencyTemplate {
    /**
     * @param {AMDRequireArrayDependency} dep the dependency for which the template should be applied
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {string} content
     */
    getContent(dep: AMDRequireArrayDependency, templateContext: DependencyTemplateContext): string;
    /**
     * @param {string | LocalModuleDependency | AMDRequireItemDependency} dep the dependency for which the template should be applied
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {string} content
     */
    contentForDependency(dep: string | LocalModuleDependency | AMDRequireItemDependency, { runtimeTemplate, moduleGraph, chunkGraph, runtimeRequirements }: DependencyTemplateContext): string;
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type Dependency = import("../Dependency");
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type Range = import("../javascript/JavascriptParser").Range;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type AMDRequireItemDependency = import("./AMDRequireItemDependency");
import DependencyTemplate = require("../DependencyTemplate");
