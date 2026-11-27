export = DllEntryDependency;
/** @import EntryDependency from "../entry/EntryDependency" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[EntryDependency[], string]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[EntryDependency[], string]>} ObjectSerializerContext */
declare class DllEntryDependency extends Dependency {
    /**
     * Creates an instance of DllEntryDependency.
     * @param {EntryDependency[]} dependencies dependencies
     * @param {string} name name
     */
    constructor(dependencies: EntryDependency[], name: string);
    /** @type {EntryDependency[]} */
    dependencies: EntryDependency[];
    /** @type {string} */
    name: string;
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
declare namespace DllEntryDependency {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import Dependency = require("../graph/Dependency");
import type EntryDependency from "../entry/EntryDependency";
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[EntryDependency[], string]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[EntryDependency[], string]>;
