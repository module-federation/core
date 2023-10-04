export = ConstDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../ModuleGraphConnection").ConnectionState} ConnectionState */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
declare class ConstDependency extends NullDependency {
  /**
   * @param {string} expression the expression
   * @param {number | Range} range the source range
   * @param {(string[] | null)=} runtimeRequirements runtime requirements
   */
  constructor(
    expression: string,
    range: number | import('../javascript/JavascriptParser').Range,
    runtimeRequirements?: (string[] | null) | undefined,
  );
  expression: string;
  range: number | import('../javascript/JavascriptParser').Range;
  runtimeRequirements: Set<string>;
  _hashUpdate: string;
}
declare namespace ConstDependency {
  export {
    ConstDependencyTemplate as Template,
    ReplaceSource,
    ChunkGraph,
    Dependency,
    UpdateHashContext,
    DependencyTemplateContext,
    ModuleGraph,
    ConnectionState,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
  };
}
import NullDependency = require('./NullDependency');
declare const ConstDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class ConstDependencyTemplate extends ConstDependencyTemplate_base {}
type ReplaceSource = any;
type ChunkGraph = import('../ChunkGraph');
type Dependency = import('../Dependency');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type ConnectionState = import('../ModuleGraphConnection').ConnectionState;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
