export = RemoteModule;
/** @typedef {string[]} ExternalRequests */
declare class RemoteModule extends Module {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {RemoteModule} deserialized module
     */
    static deserialize(context: ObjectDeserializerContext): RemoteModule;
    /**
     * Creates an instance of RemoteModule.
     * @param {string} request request string
     * @param {ExternalRequests} externalRequests list of external requests to containers
     * @param {string} internalRequest name of exposed module in container
     * @param {string} shareScope the used share scope name
     */
    constructor(request: string, externalRequests: ExternalRequests, internalRequest: string, shareScope: string);
    /** @type {string} */
    request: string;
    /** @type {ExternalRequests} */
    externalRequests: ExternalRequests;
    /** @type {string} */
    internalRequest: string;
    /** @type {string} */
    shareScope: string;
    /** @type {string} */
    _identifier: string;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace RemoteModule {
    export { KINDS, ObjectDeserializerContext, ObjectSerializerContext, ExternalRequests };
}
import Module = require("../module/Module");
declare var KINDS: Set<keyof Module.ModuleKinds>;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, ExternalRequests, string, string]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string, ExternalRequests, string, string]>;
type ExternalRequests = string[];
