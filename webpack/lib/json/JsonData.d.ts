export = JsonData;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
/** @typedef {import("./JsonModulesPlugin").RawJsonData} RawJsonData */
declare class JsonData {
  /**
   * @param {Buffer | RawJsonData} data JSON data
   */
  constructor(data: Buffer | RawJsonData);
  /** @type {Buffer | undefined} */
  _buffer: Buffer | undefined;
  /** @type {RawJsonData | undefined} */
  _data: RawJsonData | undefined;
  /**
   * @returns {RawJsonData|undefined} Raw JSON data
   */
  get(): RawJsonData | undefined;
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
    RawJsonData,
  };
}
type RawJsonData = import('./JsonModulesPlugin').RawJsonData;
type Hash = import('../util/Hash');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
