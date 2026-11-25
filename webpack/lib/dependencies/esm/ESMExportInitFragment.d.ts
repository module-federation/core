export = ESMExportInitFragment;
/**
 * Represents ESMExportInitFragment.
 * @extends {InitFragment<GenerateContext>} Context
 */
declare class ESMExportInitFragment extends InitFragment<GenerateContext> {
    /**
     * Creates an instance of ESMExportInitFragment.
     * @param {string} exportsArgument the exports identifier
     * @param {ExportMap} exportMap mapping from used name to exposed variable name
     * @param {UnusedExports} unusedExports list of unused export names
     * @param {boolean} onDemand leave the call out of the source and hand it over in the code generation data, with the binding each export reads (see `KnownMeta.onDemandExports`)
     */
    constructor(exportsArgument: string, exportMap?: ExportMap, unusedExports?: UnusedExports, onDemand?: boolean);
    /** @type {string} */
    exportsArgument: string;
    /** @type {ExportMap} */
    exportMap: ExportMap;
    /** @type {UnusedExports} */
    unusedExports: UnusedExports;
    /** @type {boolean} */
    onDemand: boolean;
    _generated: boolean;
    _defsValue: string[];
    _defsGetter: string[];
    /**
     * Returns the source code that will be included as initialization code.
     * @param {GenerateContext} context context
     * @returns {void}
     */
    _generate({ runtimeTemplate }: GenerateContext): void;
    /**
     * Merges the provided values into a single result.
     * @param {ESMExportInitFragment[]} fragments all fragments to merge
     * @returns {ESMExportInitFragment} merged fragment
     */
    mergeAll(fragments: ESMExportInitFragment[]): ESMExportInitFragment;
    /**
     * Returns merged result.
     * @param {ESMExportInitFragment} other other
     * @returns {ESMExportInitFragment} merged result
     */
    merge(other: ESMExportInitFragment): ESMExportInitFragment;
}
declare namespace ESMExportInitFragment {
    export { ExportBindingType, ExportMapEntry, ExportMap, UnusedExports };
}
import type { GenerateContext } from "../../module/Generator";
import InitFragment = require("../../template/InitFragment");
declare const ExportBindingType: Readonly<{
    Getter: 0;
    Value: 1;
}>;
type ExportMapEntry = {
    /**
     * the expression the definition reads, comment included
     */
    value: string;
    /**
     * how the export is defined
     */
    type: typeof ExportBindingType.Getter | typeof ExportBindingType.Value;
    /**
     * the binding of the module's own body the export reads, exported natively where the definition is left out on demand
     */
    finalName?: string | undefined;
};
type ExportMap = Map<UsedName, ExportMapEntry>;
type UnusedExports = Set<string>;
import type { UsedName } from "../../graph/ExportsInfo";
