export = AwaitDependenciesInitFragment;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../Generator").GenerateContext} GenerateContext */
/**
 * @extends {InitFragment<GenerateContext>}
 */
declare class AwaitDependenciesInitFragment extends InitFragment<
  import('../Generator').GenerateContext
> {
  /**
   * @param {Map<string, string>} dependencies maps an import var to an async module that needs to be awaited
   */
  constructor(dependencies: Map<string, string>);
  dependencies: Map<string, string>;
  /**
   * @param {AwaitDependenciesInitFragment} other other AwaitDependenciesInitFragment
   * @returns {AwaitDependenciesInitFragment} AwaitDependenciesInitFragment
   */
  merge(other: AwaitDependenciesInitFragment): AwaitDependenciesInitFragment;
}
declare namespace AwaitDependenciesInitFragment {
  export { Source, GenerateContext };
}
import InitFragment = require('../InitFragment');
type Source = import('webpack-sources').Source;
type GenerateContext = import('../Generator').GenerateContext;
