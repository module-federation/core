export = ExternalModuleInitFragmentDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../dependencies/ExternalModuleInitFragment").ArrayImportSpecifiers} ArrayImportSpecifiers */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ExternalModuleInitFragmentDependency extends NullDependency {
    /**
     * @param {string} module module
     * @param {ArrayImportSpecifiers} importSpecifiers import specifiers
     * @param {string | undefined} defaultImport default import
     */
    constructor(module: string, importSpecifiers: ArrayImportSpecifiers, defaultImport: string | undefined);
    importedModule: string;
    specifiers: ExternalModuleInitFragment.ArrayImportSpecifiers;
    default: string;
    /**
     * @returns {string} hash update
     */
    _createHashUpdate(): string;
}
declare namespace ExternalModuleInitFragmentDependency {
    export { ExternalModuleConstDependencyTemplate as Template, ReplaceSource, Dependency, DependencyTemplateContext, Range, ArrayImportSpecifiers, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("./NullDependency");
import ExternalModuleInitFragment = require("./ExternalModuleInitFragment");
declare class ExternalModuleConstDependencyTemplate extends DependencyTemplate {
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type Dependency = import("../Dependency");
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type Range = import("../javascript/JavascriptParser").Range;
type ArrayImportSpecifiers = import("../dependencies/ExternalModuleInitFragment").ArrayImportSpecifiers;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
import DependencyTemplate = require("../DependencyTemplate");
