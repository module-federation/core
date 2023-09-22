export = ProvideSharedDependency;
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ProvideSharedDependency extends Dependency {
    /**
     * @param {ObjectDeserializerContext} context context
     * @returns {ProvideSharedDependency} deserialize fallback dependency
     */
    static deserialize(context: ObjectDeserializerContext): ProvideSharedDependency;
    /**
     * @param {string} shareScope share scope
     * @param {string} name module name
     * @param {string | false} version version
     * @param {string} request request
     * @param {boolean} eager true, if this is an eager dependency
     */
    constructor(shareScope: string, name: string, version: string | false, request: string, eager: boolean);
    shareScope: string;
    name: string;
    version: string | false;
    request: string;
    eager: boolean;
    /**
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace ProvideSharedDependency {
    export { shareScope, ObjectDeserializerContext, ObjectSerializerContext };
}
import Dependency = require("webpack/lib/Dependency");
type ObjectSerializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext;
type ObjectDeserializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext;
declare var shareScope: any;
