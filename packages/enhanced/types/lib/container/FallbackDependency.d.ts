export = FallbackDependency;
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class FallbackDependency extends Dependency {
    /**
     * @param {ObjectDeserializerContext} context context
     * @returns {FallbackDependency} deserialize fallback dependency
     */
    static deserialize(context: ObjectDeserializerContext): FallbackDependency;
    /**
     * @param {string[]} requests requests
     */
    constructor(requests: string[]);
    requests: string[];
}
declare namespace FallbackDependency {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import Dependency = require("webpack/lib/Dependency");
type ObjectDeserializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext;
