export = ProvidedDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/**
 * @import {
 * 	DependencyKinds,
 * 	ReferencedExports,
 * 	UpdateHashContext,
 * 	ExportInfoName
 * } from "../graph/Dependency"
 */
/** @import { DependencyTemplateContext } from "../template/DependencyTemplate" */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/** @import ModuleGraphConnection from "../graph/ModuleGraphConnection" */
/** @import { Range } from "../javascript/JavascriptParser" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, ExportInfoName[]]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, ExportInfoName[]]>} ObjectSerializerContext */
/** @import Hash from "../util/Hash" */
/** @import { RuntimeSpec } from "../util/runtime" */
declare class ProvidedDependency extends ModuleDependency {
    /**
     * Creates an instance of ProvidedDependency.
     * @param {string} request request
     * @param {string} identifier identifier
     * @param {ExportInfoName[]} ids ids
     * @param {Range} range range
     */
    constructor(request: string, identifier: string, ids: Dependency.ExportInfoName[], range: Range);
    /** @type {string} */
    identifier: string;
    /** @type {string[]} */
    ids: string[];
    /** @type {undefined | string} */
    _hashUpdate: undefined | string;
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
declare namespace ProvidedDependency {
    export { KINDS, ProvidedDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
import Dependency = require("../graph/Dependency");
import type { Range } from "../javascript/JavascriptParser";
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
declare const ProvidedDependencyTemplate_base: typeof import("../template/DependencyTemplate");
declare class ProvidedDependencyTemplate extends ProvidedDependencyTemplate_base {
}
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, Dependency.ExportInfoName[]]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, Dependency.ExportInfoName[]]>;
