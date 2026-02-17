export = CommonJsExportRequireDependency;
/** @typedef {Set<string>} Exports */
/** @typedef {Set<string>} Checked */
declare class CommonJsExportRequireDependency extends ModuleDependency {
    /**
     * @param {Range} range range
     * @param {Range | null} valueRange value range
     * @param {CommonJSDependencyBaseKeywords} base base
     * @param {ExportInfoName[]} names names
     * @param {string} request request
     * @param {ExportInfoName[]} ids ids
     * @param {boolean} resultUsed true, when the result is used
     */
    constructor(range: Range, valueRange: Range | null, base: CommonJSDependencyBaseKeywords, names: ExportInfoName[], request: string, ids: ExportInfoName[], resultUsed: boolean);
    valueRange: import("../javascript/JavascriptParser").Range;
    base: import("./CommonJsDependencyHelpers").CommonJSDependencyBaseKeywords;
    names: string[];
    ids: string[];
    resultUsed: boolean;
    asiSafe: any;
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {ExportInfoName[]} the imported id
     */
    getIds(moduleGraph: ModuleGraph): ExportInfoName[];
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ExportInfoName[]} ids the imported ids
     * @returns {void}
     */
    setIds(moduleGraph: ModuleGraph, ids: ExportInfoName[]): void;
    /**
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {RuntimeSpec} runtime the runtime
     * @param {Module} importedModule the imported module (optional)
     * @returns {{ exports?: Exports, checked?: Checked } | undefined} information
     */
    getStarReexports(moduleGraph: ModuleGraph, runtime: RuntimeSpec, importedModule?: Module): {
        exports?: Exports;
        checked?: Checked;
    } | undefined;
}
declare namespace CommonJsExportRequireDependency {
    export { CommonJsExportRequireDependencyTemplate as Template, idsSymbol, ReplaceSource, ExportsSpec, RawReferencedExports, ReferencedExports, TRANSITIVE, DependencyTemplateContext, ExportsInfo, ExportInfo, ExportInfoName, Module, ModuleGraph, Range, ObjectDeserializerContext, ObjectSerializerContext, RuntimeSpec, CommonJSDependencyBaseKeywords, Exports, Checked };
}
import ModuleDependency = require("./ModuleDependency");
declare const CommonJsExportRequireDependencyTemplate_base: typeof import("../DependencyTemplate");
declare class CommonJsExportRequireDependencyTemplate extends CommonJsExportRequireDependencyTemplate_base {
}
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency").ExportsSpec} ExportsSpec */
/** @typedef {import("../Dependency").RawReferencedExports} RawReferencedExports */
/** @typedef {import("../Dependency").ReferencedExports} ReferencedExports */
/** @typedef {import("../Dependency").TRANSITIVE} TRANSITIVE */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ExportsInfo")} ExportsInfo */
/** @typedef {import("../ExportsInfo").ExportInfo} ExportInfo */
/** @typedef {import("../ExportsInfo").ExportInfoName} ExportInfoName */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
/** @typedef {import("./CommonJsDependencyHelpers").CommonJSDependencyBaseKeywords} CommonJSDependencyBaseKeywords */
declare const idsSymbol: unique symbol;
type ReplaceSource = import("webpack-sources").ReplaceSource;
type ExportsSpec = import("../Dependency").ExportsSpec;
type RawReferencedExports = import("../Dependency").RawReferencedExports;
type ReferencedExports = import("../Dependency").ReferencedExports;
type TRANSITIVE = unique symbol;
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type ExportsInfo = import("../ExportsInfo");
type ExportInfo = import("../ExportsInfo").ExportInfo;
type ExportInfoName = import("../ExportsInfo").ExportInfoName;
type Module = import("../Module");
type ModuleGraph = import("../ModuleGraph");
type Range = import("../javascript/JavascriptParser").Range;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type RuntimeSpec = import("../util/runtime").RuntimeSpec;
type CommonJSDependencyBaseKeywords = import("./CommonJsDependencyHelpers").CommonJSDependencyBaseKeywords;
type Exports = Set<string>;
type Checked = Set<string>;
