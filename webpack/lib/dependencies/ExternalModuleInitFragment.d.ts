export = ExternalModuleInitFragment;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../Generator").GenerateContext} GenerateContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {{ name: string, value?: string }[]} ArrayImportSpecifiers */
/** @typedef {Map<string, Set<string>>} ImportSpecifiers */
/**
 * @extends {InitFragment<GenerateContext>}
 */
declare class ExternalModuleInitFragment extends InitFragment<import("../Generator").GenerateContext> {
    /**
     * @param {string} importedModule imported module
     * @param {ArrayImportSpecifiers | ImportSpecifiers} specifiers import specifiers
     * @param {string=} defaultImport default import
     */
    constructor(importedModule: string, specifiers: ArrayImportSpecifiers | ImportSpecifiers, defaultImport?: string | undefined);
    importedModule: string;
    /** @type {ImportSpecifiers} */
    specifiers: ImportSpecifiers;
    defaultImport: string;
    /**
     * @param {ExternalModuleInitFragment} other other
     * @returns {ExternalModuleInitFragment} ExternalModuleInitFragment
     */
    merge(other: ExternalModuleInitFragment): ExternalModuleInitFragment;
}
declare namespace ExternalModuleInitFragment {
    export { Source, GenerateContext, ObjectDeserializerContext, ObjectSerializerContext, ArrayImportSpecifiers, ImportSpecifiers };
}
import InitFragment = require("../InitFragment");
type Source = import("webpack-sources").Source;
type GenerateContext = import("../Generator").GenerateContext;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type ArrayImportSpecifiers = {
    name: string;
    value?: string;
}[];
type ImportSpecifiers = Map<string, Set<string>>;
