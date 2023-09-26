export type MEASURE_END_OPERATION =
  import('../serialization/BinaryMiddleware').MEASURE_END_OPERATION_TYPE;
export type MEASURE_START_OPERATION =
  import('../serialization/BinaryMiddleware').MEASURE_START_OPERATION_TYPE;
export type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
export type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
export type Serializer = import('../serialization/Serializer');
export type Hash = typeof import('../util/Hash');
export type IntermediateFileSystem =
  import('../util/fs').IntermediateFileSystem;
export type MEASURE_START_OPERATION =
  import('../serialization/BinaryMiddleware').MEASURE_START_OPERATION_TYPE;
export type MEASURE_END_OPERATION =
  import('../serialization/BinaryMiddleware').MEASURE_END_OPERATION_TYPE;
declare function createFileSerializer(
  fs: import('../util/fs').IntermediateFileSystem,
  hashFunction: string | typeof import('../util/Hash'),
): import('../serialization/Serializer');
export {};
