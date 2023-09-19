export = FallbackDependency;
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class FallbackDependency {
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
    /**
     * @returns {string | null} an identifier to merge equal requests
     */
    getResourceIdentifier(): string | null;
    get type(): string;
    get category(): string;
    /**
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace FallbackDependency {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectSerializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext;
type ObjectDeserializerContext = import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext;
