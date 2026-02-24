export = HarmonyExportInitFragment;
/**
 * @extends {InitFragment<GenerateContext>} Context
 */
declare class HarmonyExportInitFragment extends InitFragment<
  import('../Generator').GenerateContext
> {
  /**
   * @param {string} exportsArgument the exports identifier
   * @param {Map<string, string>} exportMap mapping from used name to exposed variable name
   * @param {Set<string>} unusedExports list of unused export names
   */
  constructor(
    exportsArgument: string,
    exportMap?: Map<string, string>,
    unusedExports?: Set<string>,
  );
  exportsArgument: string;
  exportMap: Map<string, string>;
  unusedExports: Set<string>;
  /**
   * @param {HarmonyExportInitFragment[]} fragments all fragments to merge
   * @returns {HarmonyExportInitFragment} merged fragment
   */
  mergeAll(fragments: HarmonyExportInitFragment[]): HarmonyExportInitFragment;
  /**
   * @param {HarmonyExportInitFragment} other other
   * @returns {HarmonyExportInitFragment} merged result
   */
  merge(other: HarmonyExportInitFragment): HarmonyExportInitFragment;
}
declare namespace HarmonyExportInitFragment {
  export { Source, GenerateContext };
}
import InitFragment = require('../InitFragment');
type Source = import('webpack-sources').Source;
type GenerateContext = import('../Generator').GenerateContext;
