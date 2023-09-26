export = CssSelfLocalIdentifierDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency").ExportsSpec} ExportsSpec */
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../DependencyTemplate").CssDependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../css/CssParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class CssSelfLocalIdentifierDependency extends CssLocalIdentifierDependency {
  /**
   * @param {string} name name
   * @param {Range} range range
   * @param {string=} prefix prefix
   * @param {Set<string>=} declaredSet set of declared names (will only be active when in declared set)
   */
  constructor(
    name: string,
    range: import('../css/CssParser').Range,
    prefix?: string | undefined,
    declaredSet?: Set<string> | undefined,
  );
  declaredSet: Set<string>;
}
declare namespace CssSelfLocalIdentifierDependency {
  export {
    CssSelfLocalIdentifierDependencyTemplate as Template,
    ReplaceSource,
    ExportsSpec,
    ReferencedExport,
    DependencyTemplateContext,
    ModuleGraph,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
  };
}
import CssLocalIdentifierDependency = require('./CssLocalIdentifierDependency');
declare const CssSelfLocalIdentifierDependencyTemplate_base: {
  new (): {
    apply(
      dependency: Dependency,
      source: any,
      {
        module,
        moduleGraph,
        chunkGraph,
        runtime,
        runtimeTemplate,
        cssExports,
      }: import('../DependencyTemplate').CssDependencyTemplateContext,
    ): void;
  };
};
declare class CssSelfLocalIdentifierDependencyTemplate extends CssSelfLocalIdentifierDependencyTemplate_base {}
type ReplaceSource = any;
type ExportsSpec = import('../Dependency').ExportsSpec;
type ReferencedExport = import('../Dependency').ReferencedExport;
type DependencyTemplateContext =
  import('../DependencyTemplate').CssDependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type Range = import('../css/CssParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
import Dependency = require('../Dependency');
