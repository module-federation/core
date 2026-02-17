export = FallbackDependency;
/** @typedef {import("./RemoteModule").ExternalRequests} ExternalRequests */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class FallbackDependency extends Dependency {
    /**
     * @param {ObjectDeserializerContext} context context
     * @returns {FallbackDependency} deserialize fallback dependency
     */
    static deserialize(context: ObjectDeserializerContext): FallbackDependency;
    /**
     * @param {ExternalRequests} requests requests
     */
    constructor(requests: ExternalRequests);
    requests: import("./RemoteModule").ExternalRequests;
}
declare namespace FallbackDependency {
    export { ExternalRequests, ObjectDeserializerContext, ObjectSerializerContext };
}
import Dependency = require("../Dependency");
type ExternalRequests = import("./RemoteModule").ExternalRequests;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
