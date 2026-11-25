export = ProvideSharedDependency;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, string, string | false, boolean]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, string, string | false, boolean]>} ObjectSerializerContext */
declare class ProvideSharedDependency extends Dependency {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {ProvideSharedDependency} deserialize fallback dependency
     */
    static deserialize(context: ObjectDeserializerContext): ProvideSharedDependency;
    /**
     * Creates an instance of ProvideSharedDependency.
     * @param {string} shareScope share scope
     * @param {string} name module name
     * @param {string | false} version version
     * @param {string} request request
     * @param {boolean} eager true, if this is an eager dependency
     */
    constructor(shareScope: string, name: string, version: string | false, request: string, eager: boolean);
    /** @type {string} */
    shareScope: string;
    /** @type {string} */
    name: string;
    /** @type {string | false} */
    version: string | false;
    /** @type {string} */
    request: string;
    /** @type {boolean} */
    eager: boolean;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace ProvideSharedDependency {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import Dependency = require("../graph/Dependency");
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, string, string, string | false, boolean]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, string, string, string | false, boolean]>;
