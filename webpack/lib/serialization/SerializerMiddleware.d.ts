export = SerializerMiddleware;
/**
 * @template DeserializedType
 * @template SerializedType
 */
declare class SerializerMiddleware<DeserializedType, SerializedType> {
  /**
   * @param {any | function(): Promise<any> | any} value contained value or function to value
   * @param {SerializerMiddleware<any, any>} target target middleware
   * @param {object=} options lazy options
   * @param {any=} serializedValue serialized value
   * @returns {function(): Promise<any> | any} lazy function
   */
  static createLazy(
    value: any | (() => Promise<any> | any),
    target: SerializerMiddleware<any, any>,
    options?: object | undefined,
    serializedValue?: any | undefined,
  ): () => Promise<any> | any;
  /**
   * @param {function(): Promise<any> | any} fn lazy function
   * @param {SerializerMiddleware<any, any>=} target target middleware
   * @returns {boolean} true, when fn is a lazy function (optionally of that target)
   */
  static isLazy(
    fn: () => Promise<any> | any,
    target?: SerializerMiddleware<any, any> | undefined,
  ): boolean;
  /**
   * @param {function(): Promise<any> | any} fn lazy function
   * @returns {object} options
   */
  static getLazyOptions(fn: () => Promise<any> | any): object;
  /**
   * @param {function(): Promise<any> | any} fn lazy function
   * @returns {any} serialized value
   */
  static getLazySerializedValue(fn: () => Promise<any> | any): any;
  /**
   * @param {function(): Promise<any> | any} fn lazy function
   * @param {any} value serialized value
   * @returns {void}
   */
  static setLazySerializedValue(fn: () => Promise<any> | any, value: any): void;
  /**
   * @param {function(): Promise<any> | any} lazy lazy function
   * @param {function(any): Promise<any> | any} serialize serialize function
   * @returns {function(): Promise<any> | any} new lazy
   */
  static serializeLazy(
    lazy: () => Promise<any> | any,
    serialize: (arg0: any) => Promise<any> | any,
  ): () => Promise<any> | any;
  /**
   * @param {function(): Promise<any> | any} lazy lazy function
   * @param {function(any): Promise<any> | any} deserialize deserialize function
   * @returns {function(): Promise<any> | any} new lazy
   */
  static deserializeLazy(
    lazy: () => Promise<any> | any,
    deserialize: (arg0: any) => Promise<any> | any,
  ): () => Promise<any> | any;
  /**
   * @param {function(): Promise<any> | any} lazy lazy function
   * @returns {function(): Promise<any> | any} new lazy
   */
  static unMemoizeLazy(
    lazy: () => Promise<any> | any,
  ): () => Promise<any> | any;
  /**
   * @abstract
   * @param {DeserializedType} data data
   * @param {Object} context context object
   * @returns {SerializedType|Promise<SerializedType>} serialized data
   */
  serialize(
    data: DeserializedType,
    context: any,
  ): SerializedType | Promise<SerializedType>;
  /**
   * @abstract
   * @param {SerializedType} data data
   * @param {Object} context context object
   * @returns {DeserializedType|Promise<DeserializedType>} deserialized data
   */
  deserialize(
    data: SerializedType,
    context: any,
  ): DeserializedType | Promise<DeserializedType>;
}
