export = RuntimeRequirementsDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
declare class RuntimeRequirementsDependency extends NullDependency {
  /**
   * @param {string[]} runtimeRequirements runtime requirements
   */
  constructor(runtimeRequirements: string[]);
  runtimeRequirements: Set<string>;
  _hashUpdate: string;
}
declare namespace RuntimeRequirementsDependency {
  export {
    RuntimeRequirementsDependencyTemplate as Template,
    ReplaceSource,
    ChunkGraph,
    Dependency,
    UpdateHashContext,
    DependencyTemplateContext,
    ModuleGraph,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
  };
}
import NullDependency = require('./NullDependency');
declare const RuntimeRequirementsDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class RuntimeRequirementsDependencyTemplate extends RuntimeRequirementsDependencyTemplate_base {}
type ReplaceSource = any;
type ChunkGraph = import('../ChunkGraph');
type Dependency = import('../Dependency');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
