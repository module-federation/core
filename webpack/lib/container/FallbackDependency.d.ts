export = FallbackDependency;
/** @import { ExternalRequests } from "./RemoteModule" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[ExternalRequests]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[ExternalRequests]>} ObjectSerializerContext */
declare class FallbackDependency extends Dependency {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {FallbackDependency} deserialize fallback dependency
     */
    static deserialize(context: ObjectDeserializerContext): FallbackDependency;
    /**
     * Creates an instance of FallbackDependency.
     * @param {ExternalRequests} requests requests
     */
    constructor(requests: ExternalRequests);
    /** @type {ExternalRequests} */
    requests: ExternalRequests;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace FallbackDependency {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import Dependency = require("../graph/Dependency");
import type { ExternalRequests } from "./RemoteModule";
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[ExternalRequests]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[ExternalRequests]>;
