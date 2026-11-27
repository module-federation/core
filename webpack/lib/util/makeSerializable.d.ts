declare namespace _exports {
    export { SerializableClass, SerializableClassConstructor };
}
declare function _exports<T extends new (...params: never[]) => EXPECTED_OBJECT>(Constructor: T, request: string | (string | [string, string | null])[], name?: (string | null) | undefined): void;
export = _exports;
type SerializableClass = {
    serialize: (context: ObjectSerializerContext) => void;
    deserialize: (context: ObjectDeserializerContext) => void;
};
/**
 * Defines the serializable class constructor type used by this module.
 */
type SerializableClassConstructor<T extends SerializableClass> = (new (...params: never[]) => T) & {
    deserialize?: (context: ObjectDeserializerContext) => T;
};
import type { ObjectSerializerContext } from "../serialization/ObjectMiddleware";
import type { ObjectDeserializerContext } from "../serialization/ObjectMiddleware";
