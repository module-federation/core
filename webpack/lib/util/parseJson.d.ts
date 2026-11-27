export = parseJson;
/**
 * @template [R=JsonValue]
 * @callback ParseJsonFn
 * @param {string} raw text
 * @param {(this: JsonObject | JsonArray, key: string, value: JsonValue) => JsonValue=} reviver reviver
 * @returns {R} parsed JSON
 */
/** @type {ParseJsonFn} */
declare const parseJson: ParseJsonFn;
declare namespace parseJson {
    export { ParseJsonFn };
}
type ParseJsonFn<R = JsonValue> = (raw: string, reviver?: ((this: JsonObject | JsonArray, key: string, value: JsonValue) => JsonValue) | undefined) => R;
import type { JsonValue } from "../fs/fs";
import type { JsonObject } from "../fs/fs";
import type { JsonArray } from "../fs/fs";
