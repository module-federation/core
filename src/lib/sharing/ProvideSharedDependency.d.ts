export = ProvideSharedDependency;
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ProvideSharedDependency {
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
    get type(): string;
    /**
     * @returns {string | null} an identifier to merge equal requests
     */
    getResourceIdentifier(): string | null;
    /**
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace ProvideSharedDependency {
    export { shareScope, ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectSerializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext;
type ObjectDeserializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext;
declare var shareScope: any;
