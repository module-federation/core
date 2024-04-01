export = ObjectMiddleware;
/**
 * @typedef {ComplexSerializableType[]} DeserializedType
 * @typedef {PrimitiveSerializableType[]} SerializedType
 * @extends {SerializerMiddleware<DeserializedType, SerializedType>}
 */
declare class ObjectMiddleware extends SerializerMiddleware<
  DeserializedType,
  SerializedType
> {
  /**
   * @param {RegExp} regExp RegExp for which the request is tested
   * @param {function(string): boolean} loader loader to load the request, returns true when successful
   * @returns {void}
   */
  static registerLoader(
    regExp: RegExp,
    loader: (arg0: string) => boolean,
  ): void;
  /**
   * @param {Constructor} Constructor the constructor
   * @param {string} request the request which will be required when deserializing
   * @param {string | null} name the name to make multiple serializer unique when sharing a request
   * @param {ObjectSerializer} serializer the serializer
   * @returns {void}
   */
  static register(
    Constructor: Constructor,
    request: string,
    name: string | null,
    serializer: ObjectSerializer,
  ): void;
  /**
   * @param {Constructor} Constructor the constructor
   * @returns {void}
   */
  static registerNotSerializable(Constructor: Constructor): void;
  static getSerializerFor(object: any): {
    request?: string;
    name?: string | number;
    serializer?: ObjectSerializer;
  };
  /**
   * @param {string} request request
   * @param {TODO} name name
   * @returns {ObjectSerializer} serializer
   */
  static getDeserializerFor(request: string, name: TODO): ObjectSerializer;
  /**
   * @param {string} request request
   * @param {TODO} name name
   * @returns {ObjectSerializer} serializer
   */
  static _getDeserializerForWithoutError(
    request: string,
    name: TODO,
  ): ObjectSerializer;
  /**
   * @param {function(any): void} extendContext context extensions
   * @param {string | Hash} hashFunction hash function to use
   */
  constructor(extendContext: (arg0: any) => void, hashFunction?: string | Hash);
  extendContext: (arg0: any) => void;
  _hashFunction: string | typeof import('../util/Hash');
}
declare namespace ObjectMiddleware {
  export {
    NOT_SERIALIZABLE,
    Hash,
    ComplexSerializableType,
    PrimitiveSerializableType,
    Constructor,
    ObjectSerializerContext,
    ObjectDeserializerContext,
    ObjectSerializer,
    DeserializedType,
    SerializedType,
  };
}
type DeserializedType = ComplexSerializableType[];
type SerializedType = PrimitiveSerializableType[];
import SerializerMiddleware = require('./SerializerMiddleware');
type Constructor = new (...params: any[]) => any;
type ObjectSerializer = {
  serialize: (arg0: any, arg1: ObjectSerializerContext) => void;
  deserialize: (arg0: ObjectDeserializerContext) => any;
};
type Hash = typeof import('../util/Hash');
declare const NOT_SERIALIZABLE: {};
type ComplexSerializableType = import('./types').ComplexSerializableType;
type PrimitiveSerializableType = import('./types').PrimitiveSerializableType;
type ObjectSerializerContext = {
  write: (arg0: any) => void;
  setCircularReference: (arg0: any) => void;
};
type ObjectDeserializerContext = {
  read: () => any;
  setCircularReference: (arg0: any) => void;
};
