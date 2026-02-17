export = PureExpressionDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").RuntimeSpec} RuntimeSpec */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../ModuleGraphConnection").ConnectionState} ConnectionState */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
declare class PureExpressionDependency extends NullDependency {
  /**
   * @param {Range} range the source range
   */
  constructor(range: Range);
  range: import('../javascript/JavascriptParser').Range;
  /** @type {Set<string> | false} */
  usedByExports: Set<string> | false;
  /**
   * @param {ModuleGraph} moduleGraph module graph
   * @param {RuntimeSpec} runtime current runtimes
   * @returns {boolean | RuntimeSpec} runtime condition
   */
  _getRuntimeCondition(
    moduleGraph: ModuleGraph,
    runtime: RuntimeSpec,
  ): boolean | RuntimeSpec;
}
declare namespace PureExpressionDependency {
  export {
    PureExpressionDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    RuntimeSpec,
    UpdateHashContext,
    DependencyTemplateContext,
    Module,
    ModuleGraph,
    ConnectionState,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
  };
}
import NullDependency = require('./NullDependency');
declare const PureExpressionDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: NullDependency.ReplaceSource,
      templateContext: NullDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class PureExpressionDependencyTemplate extends PureExpressionDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type RuntimeSpec = import('../Dependency').RuntimeSpec;
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
type ModuleGraph = import('../ModuleGraph');
type ConnectionState = import('../ModuleGraphConnection').ConnectionState;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
