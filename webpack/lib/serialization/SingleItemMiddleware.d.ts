export = SingleItemMiddleware;
/**
 * @typedef {any} DeserializedType
 * @typedef {any[]} SerializedType
 * @extends {SerializerMiddleware<any, any[]>}
 */
declare class SingleItemMiddleware extends SerializerMiddleware<any, any[]> {
  constructor();
}
declare namespace SingleItemMiddleware {
  export { DeserializedType, SerializedType };
}
import SerializerMiddleware = require('./SerializerMiddleware');
type DeserializedType = any;
type SerializedType = any[];
