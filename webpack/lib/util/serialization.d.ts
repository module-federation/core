declare namespace _exports {
    export { Serializer };
}
declare namespace _exports {
    const register: typeof ObjectMiddleware.register;
    const registerLegacyRequest: typeof ObjectMiddleware.registerLegacyRequest;
    const registerLoader: typeof ObjectMiddleware.registerLoader;
    const registerNotSerializable: typeof ObjectMiddleware.registerNotSerializable;
    const NOT_SERIALIZABLE: {};
    const MEASURE_START_OPERATION: MEASURE_START_OPERATION;
    const MEASURE_END_OPERATION: MEASURE_END_OPERATION;
    const buffersSerializer: import("../serialization/Serializer")<any, BufferSerializableType[], EXPECTED_OBJECT>;
    function createFileSerializer<D, S, C>(fs: IntermediateFileSystem, hashFunction: HashFunction): Serializer<D, S, C>;
}
export = _exports;
/**
 * Defines the serializer type used by this module.
 */
type Serializer<D, S, C> = import("../serialization/Serializer")<D, S, C>;
import ObjectMiddleware = require("../serialization/ObjectMiddleware");
import type { MEASURE_START_OPERATION_TYPE as MEASURE_START_OPERATION_1 } from "../serialization/BinaryMiddleware";
import type { MEASURE_END_OPERATION_TYPE as MEASURE_END_OPERATION_1 } from "../serialization/BinaryMiddleware";
import type { BufferSerializableType } from "../serialization/types";
import type { IntermediateFileSystem } from "../fs/fs";
import type { HashFunction } from "../util/Hash";
