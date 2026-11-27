export = JsonData;
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../serialization/ObjectMiddleware"
 */
/** @import Hash from "../util/Hash" */
/** @import { JsonValue } from "../fs/fs" */
declare class JsonData {
    /**
     * Creates an instance of JsonData.
     * @param {Buffer | JsonValue} data JSON data
     */
    constructor(data: Buffer | JsonValue);
    /** @type {Buffer | undefined} */
    _buffer: Buffer | undefined;
    /** @type {JsonValue | undefined} */
    _data: JsonValue | undefined;
    /**
     * Returns raw JSON data.
     * @returns {JsonValue | undefined} Raw JSON data
     */
    get(): JsonValue | undefined;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash hash to be updated
     * @returns {void} the updated hash
     */
    updateHash(hash: Hash): void;
}
import type { JsonValue } from "../fs/fs";
import type Hash from "../util/Hash";
