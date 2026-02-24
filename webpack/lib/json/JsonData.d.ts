export = JsonData;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
/** @typedef {import("../util/fs").JsonValue} JsonValue */
declare class JsonData {
  /**
   * @param {Buffer | JsonValue} data JSON data
   */
  constructor(data: Buffer | JsonValue);
  /** @type {Buffer | undefined} */
  _buffer: Buffer | undefined;
  /** @type {JsonValue | undefined} */
  _data: JsonValue | undefined;
  /**
   * @returns {JsonValue | undefined} Raw JSON data
   */
  get(): JsonValue | undefined;
  /**
   * @param {Hash} hash hash to be updated
   * @returns {void} the updated hash
   */
  updateHash(hash: Hash): void;
}
declare namespace JsonData {
  export {
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    JsonValue,
  };
}
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type JsonValue = import('../util/fs').JsonValue;
