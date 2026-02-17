export = SingleItemMiddleware;
/** @typedef {EXPECTED_ANY} DeserializedType */
/** @typedef {EXPECTED_ANY[]} SerializedType */
/** @typedef {EXPECTED_OBJECT} Context */
/**
 * @extends {SerializerMiddleware<DeserializedType, SerializedType, Context>}
 */
declare class SingleItemMiddleware extends SerializerMiddleware<EXPECTED_ANY, SerializedType, EXPECTED_OBJECT> {
    constructor();
}
declare namespace SingleItemMiddleware {
    export { DeserializedType, SerializedType, Context };
}
import SerializerMiddleware = require("./SerializerMiddleware");
type DeserializedType = EXPECTED_ANY;
type SerializedType = EXPECTED_ANY[];
type Context = EXPECTED_OBJECT;
