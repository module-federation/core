export = BinaryMiddleware;
/**
 * @typedef {PrimitiveSerializableType[]} DeserializedType
 * @typedef {BufferSerializableType[]} SerializedType
 * @extends {SerializerMiddleware<DeserializedType, SerializedType>}
 */
declare class BinaryMiddleware extends SerializerMiddleware<
  DeserializedType,
  SerializedType
> {
  constructor();
  _serializeLazy(fn: any, context: any): () => any;
  /**
   * @param {DeserializedType} data data
   * @param {Object} context context object
   * @param {{ leftOverBuffer: Buffer | null, allocationSize: number, increaseCounter: number }} allocationScope allocation scope
   * @returns {SerializedType} serialized data
   */
  _serialize(
    data: DeserializedType,
    context: any,
    allocationScope?: {
      leftOverBuffer: Buffer | null;
      allocationSize: number;
      increaseCounter: number;
    },
  ): SerializedType;
  _createLazyDeserialized(content: any, context: any): () => any;
  _deserializeLazy(fn: any, context: any): () => any;
  /**
   * @param {SerializedType} data data
   * @param {Object} context context object
   * @returns {DeserializedType} deserialized data
   */
  _deserialize(data: SerializedType, context: any): DeserializedType;
}
declare namespace BinaryMiddleware {
  export {
    MEASURE_START_OPERATION,
    MEASURE_END_OPERATION,
    BufferSerializableType,
    PrimitiveSerializableType,
    MEASURE_START_OPERATION_TYPE,
    MEASURE_END_OPERATION_TYPE,
    DeserializedType,
    SerializedType,
  };
}
type DeserializedType = PrimitiveSerializableType[];
type SerializedType = BufferSerializableType[];
import SerializerMiddleware = require('./SerializerMiddleware');
declare const MEASURE_START_OPERATION: unique symbol;
declare const MEASURE_END_OPERATION: unique symbol;
type BufferSerializableType = import('./types').BufferSerializableType;
type PrimitiveSerializableType = import('./types').PrimitiveSerializableType;
type MEASURE_START_OPERATION_TYPE = typeof MEASURE_START_OPERATION;
type MEASURE_END_OPERATION_TYPE = typeof MEASURE_END_OPERATION;
