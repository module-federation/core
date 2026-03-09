export = ModuleDecoratorDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency").ReferencedExports} ReferencedExports */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class ModuleDecoratorDependency extends NullDependency {
  /**
   * @param {string} decorator the decorator requirement
   * @param {boolean} allowExportsAccess allow to access exports from module
   */
  constructor(decorator: string, allowExportsAccess: boolean);
  decorator: string;
  allowExportsAccess: boolean;
  _hashUpdate: string;
}
declare namespace ModuleDecoratorDependency {
  export {
    ModuleDecoratorDependencyTemplate as Template,
    ReplaceSource,
    ReferencedExports,
    UpdateHashContext,
    DependencyTemplateContext,
    ModuleGraph,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    RuntimeSpec,
  };
}
import NullDependency = require('./NullDependency');
declare const ModuleDecoratorDependencyTemplate_base: {
  new (): {
    apply(
      dependency: Dependency,
      source: NullDependency.ReplaceSource,
      templateContext: NullDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class ModuleDecoratorDependencyTemplate extends ModuleDecoratorDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type ReferencedExports = import('../Dependency').ReferencedExports;
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
import Dependency = require('../Dependency');
