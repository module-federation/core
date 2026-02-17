export = ModuleDependencyTemplateAsRequireId;
declare const ModuleDependencyTemplateAsRequireId_base: typeof import('../DependencyTemplate');
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
declare class ModuleDependencyTemplateAsRequireId extends ModuleDependencyTemplateAsRequireId_base {}
declare namespace ModuleDependencyTemplateAsRequireId {
  export { ReplaceSource, Dependency, DependencyTemplateContext };
}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
