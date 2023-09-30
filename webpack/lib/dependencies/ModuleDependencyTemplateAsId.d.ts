export = ModuleDependencyTemplateAsId;
declare const ModuleDependencyTemplateAsId_base: typeof import('../DependencyTemplate');
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
declare class ModuleDependencyTemplateAsId extends ModuleDependencyTemplateAsId_base {}
declare namespace ModuleDependencyTemplateAsId {
  export { ReplaceSource, Dependency, DependencyTemplateContext, Module };
}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
