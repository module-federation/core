export = ProvideSharedDependency;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
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
}
declare namespace ProvideSharedDependency {
    export { shareScope, ObjectDeserializerContext, ObjectSerializerContext };
}
import Dependency = require("../Dependency");
declare var shareScope: EXPECTED_ANY;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
