export = FileMiddleware;
/** @typedef {BufferSerializableType[]} DeserializedType */
/** @typedef {true} SerializedType */
/** @typedef {{ filename: string, extension?: string }} Context */
/**
 * @extends {SerializerMiddleware<DeserializedType, SerializedType, Context>}
 */
declare class FileMiddleware extends SerializerMiddleware<
  DeserializedType,
  true,
  Context
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
    IStats,
    IntermediateFileSystem,
    BufferSerializableType,
    BackgroundJob,
    SerializeResult,
    LazyOptions,
    LazyFunction,
    DeserializedType,
    SerializedType,
    Context,
  };
}
import SerializerMiddleware = require('./SerializerMiddleware');
type Hash = typeof import('../util/Hash');
type IStats = import('../util/fs').IStats;
type IntermediateFileSystem = import('../util/fs').IntermediateFileSystem;
type BufferSerializableType = import('./types').BufferSerializableType;
type BackgroundJob = Promise<void | void[]>;
type SerializeResult = {
  name: string | false;
  size: number;
  backgroundJob?: BackgroundJob | undefined;
};
type LazyOptions = {
  name: string;
  size: number;
};
type LazyFunction = import('./SerializerMiddleware').LazyFunction<
  BufferSerializableType[],
  Buffer,
  FileMiddleware,
  LazyOptions
>;
type DeserializedType = BufferSerializableType[];
type SerializedType = true;
type Context = {
  filename: string;
  extension?: string;
};
