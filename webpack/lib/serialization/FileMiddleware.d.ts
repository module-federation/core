export = FileMiddleware;
/**
 * @typedef {BufferSerializableType[]} DeserializedType
 * @typedef {true} SerializedType
 * @extends {SerializerMiddleware<DeserializedType, SerializedType>}
 */
declare class FileMiddleware extends SerializerMiddleware<
  DeserializedType,
  true
> {
  /**
   * @param {IntermediateFileSystem} fs filesystem
   * @param {string | Hash} hashFunction hash function to use
   */
  constructor(fs: IntermediateFileSystem, hashFunction?: string | Hash);
  fs: import('../util/fs').IntermediateFileSystem;
  _hashFunction: string | typeof import('../util/Hash');
}
declare namespace FileMiddleware {
  export {
    Hash,
    IntermediateFileSystem,
    BufferSerializableType,
    SerializeResult,
    DeserializedType,
    SerializedType,
  };
}
type DeserializedType = BufferSerializableType[];
import SerializerMiddleware = require('./SerializerMiddleware');
type IntermediateFileSystem = import('../util/fs').IntermediateFileSystem;
type Hash = typeof import('../util/Hash');
type BufferSerializableType = import('./types').BufferSerializableType;
type SerializeResult = {
  name: string | false;
  size: number;
  backgroundJob?: Promise<any> | undefined;
};
type SerializedType = true;
