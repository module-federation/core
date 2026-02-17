export = ContextDependencyTemplateAsRequireCall;
declare const ContextDependencyTemplateAsRequireCall_base: typeof import('../DependencyTemplate');
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
declare class ContextDependencyTemplateAsRequireCall extends ContextDependencyTemplateAsRequireCall_base {}
declare namespace ContextDependencyTemplateAsRequireCall {
  export { ReplaceSource, Dependency, DependencyTemplateContext };
}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
