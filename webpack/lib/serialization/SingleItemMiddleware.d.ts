export = SingleItemMiddleware;
/** @import { ComplexSerializableType } from "./types" */
/** @typedef {ComplexSerializableType} DeserializedType */
/** @typedef {ComplexSerializableType[]} SerializedType */
/** @typedef {EXPECTED_OBJECT} Context */
/**
 * Represents SingleItemMiddleware.
 * @extends {SerializerMiddleware<DeserializedType, SerializedType, Context>}
 */
declare class SingleItemMiddleware extends SerializerMiddleware<any, SerializedType, EXPECTED_OBJECT> {
    constructor();
}
declare namespace SingleItemMiddleware {
    export { DeserializedType, SerializedType, Context };
}
import SerializerMiddleware = require("./SerializerMiddleware");
type DeserializedType = ComplexSerializableType;
type SerializedType = ComplexSerializableType[];
type Context = EXPECTED_OBJECT;
import type { ComplexSerializableType } from "./types";
