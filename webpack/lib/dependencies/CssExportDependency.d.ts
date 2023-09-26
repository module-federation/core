export = CssExportDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").ExportsSpec} ExportsSpec */
/** @typedef {import("../DependencyTemplate").CssDependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class CssExportDependency extends NullDependency {
  /**
   * @param {string} name name
   * @param {string} value value
   */
  constructor(name: string, value: string);
  name: string;
  value: string;
}
declare namespace CssExportDependency {
  export {
    CssExportDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    ExportsSpec,
    DependencyTemplateContext,
    ModuleGraph,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import NullDependency = require('./NullDependency');
declare const CssExportDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class CssExportDependencyTemplate extends CssExportDependencyTemplate_base {
  /**
   * @param {Dependency} dependency the dependency for which the template should be applied
   * @param {ReplaceSource} source the current replace source which can be modified
   * @param {DependencyTemplateContext} templateContext the context object
   * @returns {void}
   */
  apply(
    dependency: Dependency,
    source: any,
    { cssExports }: DependencyTemplateContext,
  ): void;
}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type ExportsSpec = import('../Dependency').ExportsSpec;
type DependencyTemplateContext =
  import('../DependencyTemplate').CssDependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
