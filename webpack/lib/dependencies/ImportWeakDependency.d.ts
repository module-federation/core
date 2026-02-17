export = ImportWeakDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
/** @typedef {import("../javascript/JavascriptParser").ImportAttributes} ImportAttributes */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {ImportDependency.RawReferencedExports} RawReferencedExports */
/** @typedef {import("./ImportPhase").ImportPhaseType} ImportPhaseType */
declare class ImportWeakDependency extends ImportDependency {
}
declare namespace ImportWeakDependency {
    export { ImportDependencyTemplate as Template, ReplaceSource, Dependency, DependencyTemplateContext, Module, BuildMeta, ImportAttributes, Range, RawReferencedExports, ImportPhaseType };
}
import ImportDependency = require("./ImportDependency");
declare const ImportDependencyTemplate_base: {
    new (): {
        apply(dependency: import("../Dependency"), source: ImportDependency.ReplaceSource, { runtimeTemplate, module, moduleGraph, chunkGraph, runtimeRequirements }: ImportDependency.DependencyTemplateContext): void;
    };
};
declare class ImportDependencyTemplate extends ImportDependencyTemplate_base {
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type Dependency = import("../Dependency");
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type Module = import("../Module");
type BuildMeta = import("../Module").BuildMeta;
type ImportAttributes = import("../javascript/JavascriptParser").ImportAttributes;
type Range = import("../javascript/JavascriptParser").Range;
type RawReferencedExports = ImportDependency.RawReferencedExports;
type ImportPhaseType = import("./ImportPhase").ImportPhaseType;
