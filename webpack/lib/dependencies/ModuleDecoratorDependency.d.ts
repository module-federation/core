export = ModuleDecoratorDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../DependencyTemplates")} DependencyTemplates */
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
    ChunkGraph,
    ReferencedExport,
    UpdateHashContext,
    DependencyTemplateContext,
    DependencyTemplates,
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
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class ModuleDecoratorDependencyTemplate extends ModuleDecoratorDependencyTemplate_base {}
type ReplaceSource = any;
type ChunkGraph = import('../ChunkGraph');
type ReferencedExport = import('../Dependency').ReferencedExport;
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type DependencyTemplates = import('../DependencyTemplates');
type ModuleGraph = import('../ModuleGraph');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
import Dependency = require('../Dependency');
