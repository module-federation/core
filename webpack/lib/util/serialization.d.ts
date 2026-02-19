declare namespace _exports {
  export {
    MEASURE_END_OPERATION,
    MEASURE_START_OPERATION,
    Hash,
    IntermediateFileSystem,
    Serializer,
  };
}
declare namespace _exports {
  const register: typeof import('../serialization/ObjectMiddleware').register;
  const registerLoader: typeof import('../serialization/ObjectMiddleware').registerLoader;
  const registerNotSerializable: typeof import('../serialization/ObjectMiddleware').registerNotSerializable;
  const NOT_SERIALIZABLE: {};
  type MEASURE_START_OPERATION =
    import('../serialization/BinaryMiddleware').MEASURE_START_OPERATION_TYPE;
  const MEASURE_START_OPERATION: MEASURE_START_OPERATION;
  type MEASURE_END_OPERATION =
    import('../serialization/BinaryMiddleware').MEASURE_END_OPERATION_TYPE;
  const MEASURE_END_OPERATION: MEASURE_END_OPERATION;
  const buffersSerializer: import('../serialization/Serializer')<
    EXPECTED_ANY,
    EXPECTED_ANY,
    EXPECTED_ANY
  >;
  function createFileSerializer<D, S, C>(
    fs: IntermediateFileSystem,
    hashFunction: string | Hash,
  ): Serializer<D, S, C>;
}
export = _exports;
type Hash = typeof import('../util/Hash');
type IntermediateFileSystem = import('../util/fs').IntermediateFileSystem;
type Serializer<D, S, C> = import('../serialization/Serializer')<D, S, C>;
