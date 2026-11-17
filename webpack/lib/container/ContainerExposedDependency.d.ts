export = ContainerExposedDependency;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string]>} ObjectSerializerContext */
declare class ContainerExposedDependency extends ModuleDependency {
    /**
     * Creates an instance of ContainerExposedDependency.
     * @param {string} exposedName public name
     * @param {string} request request to module
     */
    constructor(exposedName: string, request: string);
    /** @type {string} */
    exposedName: string;
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
declare namespace ContainerExposedDependency {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("../dependencies/core/ModuleDependency");
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string]>;
