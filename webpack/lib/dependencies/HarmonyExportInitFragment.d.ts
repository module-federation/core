export = HarmonyExportInitFragment;
/**
 * @typedef {GenerateContext} Context
 */
declare class HarmonyExportInitFragment extends InitFragment<any> {
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
  merge(other: any): import('./HarmonyExportInitFragment');
  /**
   * @param {Context} context context
   * @returns {string|Source} the source code that will be included as initialization code
   */
  getContent({
    runtimeTemplate,
    runtimeRequirements,
  }: Context): string | Source;
}
declare namespace HarmonyExportInitFragment {
  export { Source, GenerateContext, Context };
}
import InitFragment = require('../InitFragment');
type Context = GenerateContext;
type Source = any;
type GenerateContext = import('../Generator').GenerateContext;
