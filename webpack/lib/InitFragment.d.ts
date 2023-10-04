export = InitFragment;
/**
 * @template Context
 */
declare class InitFragment<Context> {
  /**
   * @template Context
   * @template T
   * @param {Source} source sources
   * @param {InitFragment<T>[]} initFragments init fragments
   * @param {Context} context context
   * @returns {Source} source
   */
  static addToSource<Context_1, T>(
    source: any,
    initFragments: import('./InitFragment')<T>[],
    context: Context_1,
  ): any;
  /**
   * @param {string|Source} content the source code that will be included as initialization code
   * @param {number} stage category of initialization code (contribute to order)
   * @param {number} position position in the category (contribute to order)
   * @param {string=} key unique key to avoid emitting the same initialization code twice
   * @param {string|Source=} endContent the source code that will be included at the end of the module
   */
  constructor(
    content: string | Source,
    stage: number,
    position: number,
    key?: string | undefined,
    endContent?: (string | Source) | undefined,
  );
  content: any;
  stage: number;
  position: number;
  key: string;
  endContent: any;
  /**
   * @param {Context} context context
   * @returns {string|Source} the source code that will be included as initialization code
   */
  getContent(context: Context): string | Source;
  /**
   * @param {Context} context context
   * @returns {string|Source=} the source code that will be included at the end of the module
   */
  getEndContent(context: Context): (string | Source) | undefined;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize(context: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize(context: ObjectDeserializerContext): void;
  merge: any;
}
declare namespace InitFragment {
  export {
    STAGE_CONSTANTS,
    STAGE_ASYNC_BOUNDARY,
    STAGE_HARMONY_EXPORTS,
    STAGE_HARMONY_IMPORTS,
    STAGE_PROVIDES,
    STAGE_ASYNC_DEPENDENCIES,
    STAGE_ASYNC_HARMONY_IMPORTS,
    Source,
    GenerateContext,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
type Source = any;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
declare var STAGE_CONSTANTS: number;
declare var STAGE_ASYNC_BOUNDARY: number;
declare var STAGE_HARMONY_EXPORTS: number;
declare var STAGE_HARMONY_IMPORTS: number;
declare var STAGE_PROVIDES: number;
declare var STAGE_ASYNC_DEPENDENCIES: number;
declare var STAGE_ASYNC_HARMONY_IMPORTS: number;
type GenerateContext = import('./Generator').GenerateContext;
