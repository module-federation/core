export = BinaryMiddleware;
/** @typedef {PrimitiveSerializableType[]} DeserializedType */
/** @typedef {BufferSerializableType[]} SerializedType} */
/** @typedef {{ retainedBuffer?: (x: Buffer) => Buffer }} Context} */
/**
 * @template LazyInputValue
 * @template LazyOutputValue
 * @typedef {import("./SerializerMiddleware").LazyFunction<LazyInputValue, LazyOutputValue, BinaryMiddleware, undefined>} LazyFunction
 */
/**
 * @extends {SerializerMiddleware<DeserializedType, SerializedType, Context>}
 */
declare class BinaryMiddleware extends SerializerMiddleware<
  DeserializedType,
  SerializedType,
  Context
> {
  constructor();
  /**
   * @param {LazyFunction<DeserializedType, SerializedType>} fn lazy function
   * @param {Context} context serialize function
   * @returns {LazyFunction<SerializedType, DeserializedType>} new lazy
   */
  _serializeLazy(
    fn: LazyFunction<DeserializedType, SerializedType>,
    context: Context,
  ): LazyFunction<SerializedType, DeserializedType>;
  /**
   * @param {DeserializedType} data data
   * @param {Context} context context object
   * @param {{ leftOverBuffer: Buffer | null, allocationSize: number, increaseCounter: number }} allocationScope allocation scope
   * @returns {SerializedType} serialized data
   */
  _serialize(
    data: DeserializedType,
    context: Context,
    allocationScope?: {
      leftOverBuffer: Buffer | null;
      allocationSize: number;
      increaseCounter: number;
    },
  ): SerializedType;
  /**
   * @private
   * @param {SerializedType} content content
   * @param {Context} context context object
   * @returns {LazyFunction<DeserializedType, SerializedType>} lazy function
   */
  private _createLazyDeserialized;
  /**
   * @private
   * @param {LazyFunction<SerializedType, DeserializedType>} fn lazy function
   * @param {Context} context context object
   * @returns {LazyFunction<DeserializedType, SerializedType>} new lazy
   */
  private _deserializeLazy;
  /**
   * @param {SerializedType} data data
   * @param {Context} context context object
   * @returns {DeserializedType} deserialized data
   */
  _deserialize(data: SerializedType, context: Context): DeserializedType;
}
declare namespace BinaryMiddleware {
  export {
    MEASURE_END_OPERATION,
    MEASURE_START_OPERATION,
    BufferSerializableType,
    PrimitiveSerializableType,
    MEASURE_START_OPERATION_TYPE,
    MEASURE_END_OPERATION_TYPE,
    DeserializedType,
    SerializedType,
    Context,
    LazyFunction,
  };
}
import SerializerMiddleware = require('./SerializerMiddleware');
declare const MEASURE_END_OPERATION: unique symbol;
declare const MEASURE_START_OPERATION: unique symbol;
type BufferSerializableType = import('./types').BufferSerializableType;
type PrimitiveSerializableType = import('./types').PrimitiveSerializableType;
type MEASURE_START_OPERATION_TYPE = typeof MEASURE_START_OPERATION;
type MEASURE_END_OPERATION_TYPE = typeof MEASURE_END_OPERATION;
type DeserializedType = PrimitiveSerializableType[];
/**
 * }
 */
type SerializedType = BufferSerializableType[];
/**
 * }
 */
type Context = {
  retainedBuffer?: (x: Buffer) => Buffer;
};
type LazyFunction<LazyInputValue, LazyOutputValue> =
  import('./SerializerMiddleware').LazyFunction<
    LazyInputValue,
    LazyOutputValue,
    BinaryMiddleware,
    undefined
  >;
