export = InitFragment;
/**
 * @template GenerateContext
 * @implements {MaybeMergeableInitFragment<GenerateContext>}
 */
declare class InitFragment<GenerateContext>
  implements MaybeMergeableInitFragment<GenerateContext>
{
  /**
   * @template Context
   * @param {Source} source sources
   * @param {MaybeMergeableInitFragment<Context>[]} initFragments init fragments
   * @param {Context} context context
   * @returns {Source} source
   */
  static addToSource<Context>(
    source: Source,
    initFragments: MaybeMergeableInitFragment<Context>[],
    context: Context,
  ): Source;
  /**
   * @param {string | Source | undefined} content the source code that will be included as initialization code
   * @param {number} stage category of initialization code (contribute to order)
   * @param {number} position position in the category (contribute to order)
   * @param {InitFragmentKey=} key unique key to avoid emitting the same initialization code twice
   * @param {string | Source=} endContent the source code that will be included at the end of the module
   */
  constructor(
    content: string | Source | undefined,
    stage: number,
    position: number,
    key?: InitFragmentKey | undefined,
    endContent?: (string | Source) | undefined,
  );
  content: string | import('webpack-sources').Source;
  stage: number;
  position: number;
  key: string;
  endContent: string | import('webpack-sources').Source;
  /**
   * @param {GenerateContext} context context
   * @returns {string | Source | undefined} the source code that will be included as initialization code
   */
  getContent(context: GenerateContext): string | Source | undefined;
  /**
   * @param {GenerateContext} context context
   * @returns {string | Source | undefined} the source code that will be included at the end of the module
   */
  getEndContent(context: GenerateContext): string | Source | undefined;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize(context: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize(context: ObjectDeserializerContext): void;
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
    InitFragmentKey,
    MaybeMergeableInitFragment,
  };
}
declare var STAGE_CONSTANTS: number;
declare var STAGE_ASYNC_BOUNDARY: number;
declare var STAGE_HARMONY_EXPORTS: number;
declare var STAGE_HARMONY_IMPORTS: number;
declare var STAGE_PROVIDES: number;
declare var STAGE_ASYNC_DEPENDENCIES: number;
declare var STAGE_ASYNC_HARMONY_IMPORTS: number;
type Source = import('webpack-sources').Source;
type GenerateContext = import('./Generator').GenerateContext;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type InitFragmentKey = string;
type MaybeMergeableInitFragment<GenerateContext> = {
  key?: InitFragmentKey | undefined;
  stage: number;
  position: number;
  getContent: (context: GenerateContext) => string | Source | undefined;
  getEndContent: (context: GenerateContext) => string | Source | undefined;
  merge?:
    | ((
        fragments: MaybeMergeableInitFragment<GenerateContext>,
      ) => MaybeMergeableInitFragment<GenerateContext>)
    | undefined;
  mergeAll?:
    | ((
        fragments: MaybeMergeableInitFragment<GenerateContext>[],
      ) => MaybeMergeableInitFragment<GenerateContext>[])
    | undefined;
};
