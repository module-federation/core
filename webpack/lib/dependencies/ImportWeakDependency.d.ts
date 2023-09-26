export = ImportWeakDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
declare class ImportWeakDependency extends ImportDependency {}
declare namespace ImportWeakDependency {
  export {
    ImportDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    ReferencedExport,
    DependencyTemplateContext,
    Module,
    BuildMeta,
    ModuleGraph,
    Range,
  };
}
import ImportDependency = require('./ImportDependency');
declare const ImportDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      {
        runtimeTemplate,
        module,
        moduleGraph,
        chunkGraph,
        runtimeRequirements,
      }: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class ImportDependencyTemplate extends ImportDependencyTemplate_base {}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type ReferencedExport = import('../Dependency').ReferencedExport;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
type BuildMeta = import('../Module').BuildMeta;
type ModuleGraph = import('../ModuleGraph');
type Range = import('../javascript/JavascriptParser').Range;
