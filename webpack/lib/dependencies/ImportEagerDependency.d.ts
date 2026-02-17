export = ImportEagerDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
declare class ImportEagerDependency extends ImportDependency {}
declare namespace ImportEagerDependency {
  export {
    ImportEagerDependencyTemplate as Template,
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
declare const ImportEagerDependencyTemplate_base: {
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
declare class ImportEagerDependencyTemplate extends ImportEagerDependencyTemplate_base {}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type ReferencedExport = import('../Dependency').ReferencedExport;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
type BuildMeta = import('../Module').BuildMeta;
type ModuleGraph = import('../ModuleGraph');
type Range = import('../javascript/JavascriptParser').Range;
