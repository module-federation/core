export = FallbackModule;
declare class FallbackModule extends Module {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {FallbackModule} deserialized fallback module
     */
    static deserialize(context: ObjectDeserializerContext): FallbackModule;
    /**
     * Creates an instance of FallbackModule.
     * @param {ExternalRequests} requests list of requests to choose one
     */
    constructor(requests: ExternalRequests);
    /** @type {ExternalRequests} */
    requests: ExternalRequests;
    /** @type {string} */
    _identifier: string;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace FallbackModule {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import Module = require("../module/Module");
import type { ExternalRequests } from "./RemoteModule";
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[ExternalRequests]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[ExternalRequests]>;
