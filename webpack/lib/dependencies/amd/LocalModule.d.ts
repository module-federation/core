export = LocalModule;
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, number, boolean]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, number, boolean]>} ObjectSerializerContext */
declare class LocalModule {
    /**
     * Creates an instance of LocalModule.
     * @param {string} name name
     * @param {number} idx index
     */
    constructor(name: string, idx: number);
    /** @type {string} */
    name: string;
    /** @type {number} */
    idx: number;
    /** @type {boolean} */
    used: boolean;
    flagUsed(): void;
    /**
     * Returns variable name.
     * @returns {string} variable name
     */
    variableName(): string;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize(context: ObjectDeserializerContext): void;
}
declare namespace LocalModule {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, number, boolean]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, number, boolean]>;
