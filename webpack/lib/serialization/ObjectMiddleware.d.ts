export = ObjectMiddleware;
/** @typedef {ComplexSerializableType[]} DeserializedType */
/** @typedef {PrimitiveSerializableType[]} SerializedType */
/** @typedef {{ logger: Logger }} Context */
/**
 * @extends {SerializerMiddleware<DeserializedType, SerializedType, Context>}
 */
declare class ObjectMiddleware extends SerializerMiddleware<
  DeserializedType,
  SerializedType,
  Context
> {
  /**
   * @param {RegExp} regExp RegExp for which the request is tested
   * @param {(request: string) => boolean} loader loader to load the request, returns true when successful
   * @returns {void}
   */
  static registerLoader(
    regExp: RegExp,
    loader: (request: string) => boolean,
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
  /**
   * @param {Constructor} object for serialization
   * @returns {SerializerConfigWithSerializer} Serializer config
   */
  static getSerializerFor(object: Constructor): SerializerConfigWithSerializer;
  /**
   * @param {string} request request
   * @param {string} name name
   * @returns {ObjectSerializer} serializer
   */
  static getDeserializerFor(request: string, name: string): ObjectSerializer;
  /**
   * @param {string} request request
   * @param {string} name name
   * @returns {ObjectSerializer | undefined} serializer
   */
  static _getDeserializerForWithoutError(
    request: string,
    name: string,
  ): ObjectSerializer | undefined;
  /**
   * @param {(context: ObjectSerializerContext | ObjectDeserializerContext) => void} extendContext context extensions
   * @param {string | Hash} hashFunction hash function to use
   */
  constructor(
    extendContext: (
      context: ObjectSerializerContext | ObjectDeserializerContext,
    ) => void,
    hashFunction?: string | Hash,
  );
  extendContext: (
    context: ObjectSerializerContext | ObjectDeserializerContext,
  ) => void;
  _hashFunction: string | typeof import('../util/Hash');
}
declare namespace ObjectMiddleware {
  export {
    NOT_SERIALIZABLE,
    Logger,
    Hash,
    LazyOptions,
    ComplexSerializableType,
    PrimitiveSerializableType,
    Constructor,
    ObjectSerializerSnapshot,
    ReferenceableItem,
    ObjectSerializerContext,
    ObjectDeserializerContext,
    ObjectSerializer,
    SerializerConfig,
    SerializerConfigWithSerializer,
    DeserializedType,
    SerializedType,
    Context,
  };
}
import SerializerMiddleware = require('./SerializerMiddleware');
declare const NOT_SERIALIZABLE: {};
type Logger = import('../logging/Logger').Logger;
type Hash = typeof import('../util/Hash');
type LazyOptions = import('./SerializerMiddleware').LazyOptions;
type ComplexSerializableType = import('./types').ComplexSerializableType;
type PrimitiveSerializableType = import('./types').PrimitiveSerializableType;
type Constructor = new (...params: EXPECTED_ANY[]) => EXPECTED_ANY;
type ObjectSerializerSnapshot = {
  length: number;
  cycleStackSize: number;
  referenceableSize: number;
  currentPos: number;
  objectTypeLookupSize: number;
  currentPosTypeLookup: number;
};
type ReferenceableItem = EXPECTED_OBJECT | string;
type ObjectSerializerContext = {
  write: (value: EXPECTED_ANY) => void;
  setCircularReference: (value: ReferenceableItem) => void;
  snapshot: () => ObjectSerializerSnapshot;
  rollback: (snapshot: ObjectSerializerSnapshot) => void;
  writeLazy?: ((item: EXPECTED_ANY | (() => EXPECTED_ANY)) => void) | undefined;
  writeSeparate?:
    | ((
        item: EXPECTED_ANY | (() => EXPECTED_ANY),
        obj: LazyOptions | undefined,
      ) => import('./SerializerMiddleware').LazyFunction<
        EXPECTED_ANY,
        EXPECTED_ANY,
        EXPECTED_ANY,
        LazyOptions
      >)
    | undefined;
};
type ObjectDeserializerContext = {
  read: () => EXPECTED_ANY;
  setCircularReference: (value: ReferenceableItem) => void;
};
type ObjectSerializer = {
  serialize: (value: EXPECTED_ANY, context: ObjectSerializerContext) => void;
  deserialize: (context: ObjectDeserializerContext) => EXPECTED_ANY;
};
type SerializerConfig = {
  request?: string;
  name?: string | number | null;
  serializer?: ObjectSerializer;
};
type SerializerConfigWithSerializer = {
  request?: string;
  name?: string | number | null;
  serializer: ObjectSerializer;
};
type DeserializedType = ComplexSerializableType[];
type SerializedType = PrimitiveSerializableType[];
type Context = {
  logger: Logger;
};
