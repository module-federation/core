export = ConditionalInitFragment;
/**
 * @typedef {GenerateContext} Context
 * @extends {InitFragment<Context>}
 */
declare class ConditionalInitFragment extends InitFragment<
  import('./Generator').GenerateContext
> {
  /**
   * @param {string|Source} content the source code that will be included as initialization code
   * @param {number} stage category of initialization code (contribute to order)
   * @param {number} position position in the category (contribute to order)
   * @param {string | undefined} key unique key to avoid emitting the same initialization code twice
   * @param {RuntimeSpec | boolean} runtimeCondition in which runtime this fragment should be executed
   * @param {string|Source=} endContent the source code that will be included at the end of the module
   */
  constructor(
    content: string | Source,
    stage: number,
    position: number,
    key: string | undefined,
    runtimeCondition?: RuntimeSpec | boolean,
    endContent?: (string | Source) | undefined,
  );
  runtimeCondition: boolean | import('./util/runtime').RuntimeSpec;
  /**
   * @param {ConditionalInitFragment} other fragment to merge with
   * @returns {ConditionalInitFragment} merged fragment
   */
  merge(other: ConditionalInitFragment): ConditionalInitFragment;
}
declare namespace ConditionalInitFragment {
  export { Source, GenerateContext, RuntimeSpec, Context };
}
import InitFragment = require('./InitFragment');
type Source = any;
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type GenerateContext = import('./Generator').GenerateContext;
type Context = GenerateContext;
