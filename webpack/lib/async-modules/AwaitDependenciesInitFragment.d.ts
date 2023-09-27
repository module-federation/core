export = AwaitDependenciesInitFragment;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../Generator").GenerateContext} GenerateContext */
/**
 * @typedef {GenerateContext} Context
 */
declare class AwaitDependenciesInitFragment extends InitFragment<any> {
  /**
   * @param {Set<string>} promises the promises that should be awaited
   */
  constructor(promises: Set<string>);
  promises: Set<string>;
  /**
   * @param {AwaitDependenciesInitFragment} other other AwaitDependenciesInitFragment
   * @returns {AwaitDependenciesInitFragment} AwaitDependenciesInitFragment
   */
  merge(other: AwaitDependenciesInitFragment): AwaitDependenciesInitFragment;
  /**
   * @param {Context} context context
   * @returns {string|Source} the source code that will be included as initialization code
   */
  getContent({ runtimeRequirements }: Context): string | Source;
}
declare namespace AwaitDependenciesInitFragment {
  export { Source, GenerateContext, Context };
}
import InitFragment = require('../InitFragment');
type Context = GenerateContext;
type Source = any;
type GenerateContext = import('../Generator').GenerateContext;
