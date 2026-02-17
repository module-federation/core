export = ContextDependencyTemplateAsRequireCall;
declare const ContextDependencyTemplateAsRequireCall_base: typeof import("../DependencyTemplate");
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
declare class ContextDependencyTemplateAsRequireCall extends ContextDependencyTemplateAsRequireCall_base {
}
declare namespace ContextDependencyTemplateAsRequireCall {
    export { ReplaceSource, Range, Dependency, DependencyTemplateContext };
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type Range = import("../javascript/JavascriptParser").Range;
type Dependency = import("../Dependency");
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
