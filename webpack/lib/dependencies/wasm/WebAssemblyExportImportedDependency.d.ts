export = WebAssemblyExportImportedDependency;
/** @import { ReferencedExports, TRANSITIVE, DependencyKinds } from "../../graph/Dependency" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, string]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, string]>} ObjectSerializerContext */
/** @import { RuntimeSpec } from "../../util/runtime" */
declare class WebAssemblyExportImportedDependency extends ModuleDependency {
    /**
     * Creates an instance of WebAssemblyExportImportedDependency.
     * @param {string} exportName export name
     * @param {string} request request
     * @param {string} name name
     * @param {string} valueType value type
     */
    constructor(exportName: string, request: string, name: string, valueType: string);
    /** @type {string} */
    exportName: string;
    /** @type {string} */
    name: string;
    /** @type {string} */
    valueType: string;
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
declare namespace WebAssemblyExportImportedDependency {
    export { KINDS, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("../core/ModuleDependency");
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, string]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, string]>;
import Dependency = require("../../graph/Dependency");
