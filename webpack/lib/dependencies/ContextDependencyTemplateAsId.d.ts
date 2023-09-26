export = ContextDependencyTemplateAsId;
declare const ContextDependencyTemplateAsId_base: typeof import('../DependencyTemplate');
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
declare class ContextDependencyTemplateAsId extends ContextDependencyTemplateAsId_base {}
declare namespace ContextDependencyTemplateAsId {
  export { ReplaceSource, Dependency, DependencyTemplateContext };
}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
