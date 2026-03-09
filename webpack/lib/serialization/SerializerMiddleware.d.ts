export = SerializerMiddleware;
/** @typedef {SerializerMiddleware<EXPECTED_ANY, EXPECTED_ANY, Record<string, EXPECTED_ANY>>} LazyTarget */
/** @typedef {Record<string, EXPECTED_ANY>} LazyOptions */
/**
 * @template InputValue
 * @template OutputValue
 * @template {LazyTarget} InternalLazyTarget
 * @template {LazyOptions | undefined} InternalLazyOptions
 * @typedef {(() => InputValue | Promise<InputValue>) & Partial<{ [LAZY_TARGET]: InternalLazyTarget, options: InternalLazyOptions, [LAZY_SERIALIZED_VALUE]?: OutputValue | LazyFunction<OutputValue, InputValue, InternalLazyTarget, InternalLazyOptions> | undefined }>} LazyFunction
 */
/**
 * @template DeserializedType
 * @template SerializedType
 * @template Context
 */
declare class SerializerMiddleware<DeserializedType, SerializedType, Context> {
  /**
   * @template TLazyInputValue
   * @template TLazyOutputValue
   * @template {LazyTarget} TLazyTarget
   * @template {LazyOptions | undefined} TLazyOptions
   * @param {TLazyInputValue | (() => TLazyInputValue)} value contained value or function to value
   * @param {TLazyTarget} target target middleware
   * @param {TLazyOptions=} options lazy options
   * @param {TLazyOutputValue=} serializedValue serialized value
   * @returns {LazyFunction<TLazyInputValue, TLazyOutputValue, TLazyTarget, TLazyOptions>} lazy function
   */
  static createLazy<
    TLazyInputValue,
    TLazyOutputValue,
    TLazyTarget extends LazyTarget,
    TLazyOptions extends LazyOptions | undefined,
  >(
    value: TLazyInputValue | (() => TLazyInputValue),
    target: TLazyTarget,
    options?: TLazyOptions | undefined,
    serializedValue?: TLazyOutputValue | undefined,
  ): LazyFunction<TLazyInputValue, TLazyOutputValue, TLazyTarget, TLazyOptions>;
  /**
   * @template {LazyTarget} TLazyTarget
   * @param {EXPECTED_ANY} fn lazy function
   * @param {TLazyTarget=} target target middleware
   * @returns {fn is LazyFunction<EXPECTED_ANY, EXPECTED_ANY, TLazyTarget, EXPECTED_ANY>} true, when fn is a lazy function (optionally of that target)
   */
  static isLazy<TLazyTarget extends LazyTarget>(
    fn: EXPECTED_ANY,
    target?: TLazyTarget | undefined,
  ): fn is LazyFunction<EXPECTED_ANY, EXPECTED_ANY, TLazyTarget, EXPECTED_ANY>;
  /**
   * @template TLazyInputValue
   * @template TLazyOutputValue
   * @template {LazyTarget} TLazyTarget
   * @template {Record<string, EXPECTED_ANY>} TLazyOptions
   * @param {LazyFunction<TLazyInputValue, TLazyOutputValue, TLazyTarget, TLazyOptions>} fn lazy function
   * @returns {LazyOptions | undefined} options
   */
  static getLazyOptions<
    TLazyInputValue,
    TLazyOutputValue,
    TLazyTarget extends LazyTarget,
    TLazyOptions extends Record<string, EXPECTED_ANY>,
  >(
    fn: LazyFunction<
      TLazyInputValue,
      TLazyOutputValue,
      TLazyTarget,
      TLazyOptions
    >,
  ): LazyOptions | undefined;
  /**
   * @template TLazyInputValue
   * @template TLazyOutputValue
   * @template {LazyTarget} TLazyTarget
   * @template {LazyOptions} TLazyOptions
   * @param {LazyFunction<TLazyInputValue, TLazyOutputValue, TLazyTarget, TLazyOptions> | EXPECTED_ANY} fn lazy function
   * @returns {TLazyOutputValue | undefined} serialized value
   */
  static getLazySerializedValue<
    TLazyInputValue,
    TLazyOutputValue,
    TLazyTarget extends LazyTarget,
    TLazyOptions extends LazyOptions,
  >(
    fn:
      | LazyFunction<
          TLazyInputValue,
          TLazyOutputValue,
          TLazyTarget,
          TLazyOptions
        >
      | EXPECTED_ANY,
  ): TLazyOutputValue | undefined;
  /**
   * @template TLazyInputValue
   * @template TLazyOutputValue
   * @template {LazyTarget} TLazyTarget
   * @template {LazyOptions} TLazyOptions
   * @param {LazyFunction<TLazyInputValue, TLazyOutputValue, TLazyTarget, TLazyOptions>} fn lazy function
   * @param {TLazyOutputValue} value serialized value
   * @returns {void}
   */
  static setLazySerializedValue<
    TLazyInputValue,
    TLazyOutputValue,
    TLazyTarget extends LazyTarget,
    TLazyOptions extends LazyOptions,
  >(
    fn: LazyFunction<
      TLazyInputValue,
      TLazyOutputValue,
      TLazyTarget,
      TLazyOptions
    >,
    value: TLazyOutputValue,
  ): void;
  /**
   * @template TLazyInputValue DeserializedValue
   * @template TLazyOutputValue SerializedValue
   * @template {LazyTarget} TLazyTarget
   * @template {LazyOptions | undefined} TLazyOptions
   * @param {LazyFunction<TLazyInputValue, TLazyOutputValue, TLazyTarget, TLazyOptions>} lazy lazy function
   * @param {(value: TLazyInputValue) => TLazyOutputValue} serialize serialize function
   * @returns {LazyFunction<TLazyOutputValue, TLazyInputValue, TLazyTarget, TLazyOptions>} new lazy
   */
  static serializeLazy<
    TLazyInputValue,
    TLazyOutputValue,
    TLazyTarget extends LazyTarget,
    TLazyOptions extends LazyOptions | undefined,
  >(
    lazy: LazyFunction<
      TLazyInputValue,
      TLazyOutputValue,
      TLazyTarget,
      TLazyOptions
    >,
    serialize: (value: TLazyInputValue) => TLazyOutputValue,
  ): LazyFunction<TLazyOutputValue, TLazyInputValue, TLazyTarget, TLazyOptions>;
  /**
   * @template TLazyInputValue SerializedValue
   * @template TLazyOutputValue DeserializedValue
   * @template {LazyTarget} TLazyTarget
   * @template {LazyOptions | undefined} TLazyOptions
   * @param {LazyFunction<TLazyInputValue, TLazyOutputValue, TLazyTarget, TLazyOptions>} lazy lazy function
   * @param {(data: TLazyInputValue) => TLazyOutputValue} deserialize deserialize function
   * @returns {LazyFunction<TLazyOutputValue, TLazyInputValue, TLazyTarget, TLazyOptions>} new lazy
   */
  static deserializeLazy<
    TLazyInputValue,
    TLazyOutputValue,
    TLazyTarget extends LazyTarget,
    TLazyOptions extends LazyOptions | undefined,
  >(
    lazy: LazyFunction<
      TLazyInputValue,
      TLazyOutputValue,
      TLazyTarget,
      TLazyOptions
    >,
    deserialize: (data: TLazyInputValue) => TLazyOutputValue,
  ): LazyFunction<TLazyOutputValue, TLazyInputValue, TLazyTarget, TLazyOptions>;
  /**
   * @template TLazyInputValue
   * @template TLazyOutputValue
   * @template {LazyTarget} TLazyTarget
   * @template {LazyOptions} TLazyOptions
   * @param {LazyFunction<TLazyInputValue | TLazyOutputValue, TLazyInputValue | TLazyOutputValue, TLazyTarget, TLazyOptions> | undefined} lazy lazy function
   * @returns {LazyFunction<TLazyInputValue | TLazyOutputValue, TLazyInputValue | TLazyOutputValue, TLazyTarget, TLazyOptions> | undefined} new lazy
   */
  static unMemoizeLazy<
    TLazyInputValue,
    TLazyOutputValue,
    TLazyTarget extends LazyTarget,
    TLazyOptions extends LazyOptions,
  >(
    lazy:
      | LazyFunction<
          TLazyInputValue | TLazyOutputValue,
          TLazyInputValue | TLazyOutputValue,
          TLazyTarget,
          TLazyOptions
        >
      | undefined,
  ):
    | LazyFunction<
        TLazyInputValue | TLazyOutputValue,
        TLazyInputValue | TLazyOutputValue,
        TLazyTarget,
        TLazyOptions
      >
    | undefined;
  /**
   * @abstract
   * @param {DeserializedType} data data
   * @param {Context} context context object
   * @returns {SerializedType | Promise<SerializedType> | null} serialized data
   */
  serialize(
    data: DeserializedType,
    context: Context,
  ): SerializedType | Promise<SerializedType> | null;
  /**
   * @abstract
   * @param {SerializedType} data data
   * @param {Context} context context object
   * @returns {DeserializedType | Promise<DeserializedType>} deserialized data
   */
  deserialize(
    data: SerializedType,
    context: Context,
  ): DeserializedType | Promise<DeserializedType>;
}
declare namespace SerializerMiddleware {
  export { LazyTarget, LazyOptions, LazyFunction };
}
type LazyTarget = SerializerMiddleware<
  EXPECTED_ANY,
  EXPECTED_ANY,
  Record<string, EXPECTED_ANY>
>;
type LazyOptions = Record<string, EXPECTED_ANY>;
type LazyFunction<
  InputValue,
  OutputValue,
  InternalLazyTarget extends LazyTarget,
  InternalLazyOptions extends LazyOptions | undefined,
> = (() => InputValue | Promise<InputValue>) &
  Partial<{
    [LAZY_TARGET]: InternalLazyTarget;
    options: InternalLazyOptions;
    [LAZY_SERIALIZED_VALUE]?:
      | OutputValue
      | LazyFunction<
          OutputValue,
          InputValue,
          InternalLazyTarget,
          InternalLazyOptions
        >
      | undefined;
  }>;
declare const LAZY_TARGET: unique symbol;
declare const LAZY_SERIALIZED_VALUE: unique symbol;
