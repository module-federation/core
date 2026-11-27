export = DllModule;
declare class DllModule extends Module {
    /**
     * Creates an instance of DllModule.
     * @param {string} context context path
     * @param {Dependency[]} dependencies dependencies
     * @param {string} name name
     */
    constructor(context: string, dependencies: Dependency[], name: string);
    /** @type {string} */
    name: string;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: Dependency.UpdateHashContext): void;
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
declare namespace DllModule {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import Module = require("../module/Module");
import type Hash from "../util/Hash";
import type Dependency from "../graph/Dependency";
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string]>;
