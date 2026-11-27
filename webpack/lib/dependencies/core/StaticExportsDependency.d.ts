export = StaticExportsDependency;
/** @import { ExportsSpec, DependencyKinds } from "../../graph/Dependency" */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @typedef {string[] | true} Exports */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Exports, boolean]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Exports, boolean]>} ObjectSerializerContext */
declare class StaticExportsDependency extends NullDependency {
    /**
     * Creates an instance of StaticExportsDependency.
     * @param {Exports} exports export names
     * @param {boolean} canMangle true, if mangling exports names is allowed
     */
    constructor(exports: Exports, canMangle: boolean);
    /** @type {Exports} */
    exports: Exports;
    /** @type {boolean} */
    canMangle: boolean;
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
declare namespace StaticExportsDependency {
    export { KINDS, Exports, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("./NullDependency");
declare var KINDS: Set<keyof DependencyKinds>;
type Exports = string[] | true;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[Exports, boolean]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[Exports, boolean]>;
import type { DependencyKinds } from "../../graph/Dependency";
