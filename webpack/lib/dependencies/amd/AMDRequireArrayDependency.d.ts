export = AMDRequireArrayDependency;
/** @import LocalModuleDependency from "./LocalModuleDependency" */
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import AMDRequireItemDependency from "./AMDRequireItemDependency" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[(string | LocalModuleDependency | AMDRequireItemDependency)[], Range]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[(string | LocalModuleDependency | AMDRequireItemDependency)[], Range]>} ObjectSerializerContext */
declare class AMDRequireArrayDependency extends NullDependency {
    /**
     * Creates an instance of AMDRequireArrayDependency.
     * @param {(string | LocalModuleDependency | AMDRequireItemDependency)[]} depsArray deps array
     * @param {Range} range range
     */
    constructor(depsArray: (string | LocalModuleDependency | AMDRequireItemDependency)[], range: Range);
    depsArray: (string | LocalModuleDependency | AMDRequireItemDependency)[];
    range: Range;
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
declare namespace AMDRequireArrayDependency {
    export { AMDRequireArrayDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type LocalModuleDependency from "./LocalModuleDependency";
import type AMDRequireItemDependency from "./AMDRequireItemDependency";
import type { Range } from "../../javascript/JavascriptParser";
declare class AMDRequireArrayDependencyTemplate extends DependencyTemplate {
    /**
     * Returns content.
     * @param {AMDRequireArrayDependency} dep the dependency for which the template should be applied
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {string} content
     */
    getContent(dep: AMDRequireArrayDependency, templateContext: DependencyTemplate.DependencyTemplateContext): string;
    /**
     * Content for dependency.
     * @param {string | LocalModuleDependency | AMDRequireItemDependency} dep the dependency for which the template should be applied
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {string} content
     */
    contentForDependency(dep: string | LocalModuleDependency | AMDRequireItemDependency, { runtimeTemplate, moduleGraph, chunkGraph, runtimeRequirements }: DependencyTemplate.DependencyTemplateContext): string;
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[(string | LocalModuleDependency | AMDRequireItemDependency)[], Range]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[(string | LocalModuleDependency | AMDRequireItemDependency)[], Range]>;
import DependencyTemplate = require("../../template/DependencyTemplate");
