export = LocalModuleDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./LocalModule")} LocalModule */
declare class LocalModuleDependency extends NullDependency {
  /**
   * @param {LocalModule} localModule local module
   * @param {Range | undefined} range range
   * @param {boolean} callNew true, when the local module should be called with new
   */
  constructor(
    localModule: LocalModule,
    range: Range | undefined,
    callNew: boolean,
  );
  localModule: import('./LocalModule');
  range: import('../javascript/JavascriptParser').Range;
  callNew: boolean;
}
declare namespace LocalModuleDependency {
  export {
    LocalModuleDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    DependencyTemplateContext,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    LocalModule,
  };
}
import NullDependency = require('./NullDependency');
declare const LocalModuleDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: NullDependency.ReplaceSource,
      templateContext: NullDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class LocalModuleDependencyTemplate extends LocalModuleDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type LocalModule = import('./LocalModule');
