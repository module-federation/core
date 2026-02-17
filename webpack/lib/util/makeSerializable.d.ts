declare namespace _exports {
    export { Constructor, ObjectDeserializerContext, ObjectSerializerContext, SerializableClass, SerializableClassConstructor };
}
declare function _exports<T extends Constructor>(Constructor: T, request: string, name?: (string | null) | undefined): void;
export = _exports;
type Constructor = import("../serialization/ObjectMiddleware").Constructor;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type SerializableClass = {
    serialize: (context: ObjectSerializerContext) => void;
    deserialize: (context: ObjectDeserializerContext) => void;
};
type SerializableClassConstructor<T extends SerializableClass> = (new (...params: EXPECTED_ANY[]) => T) & {
    deserialize?: (context: ObjectDeserializerContext) => T;
};
