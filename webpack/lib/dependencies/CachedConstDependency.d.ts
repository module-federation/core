export = CachedConstDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../DependencyTemplates")} DependencyTemplates */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
declare class CachedConstDependency extends NullDependency {
  /**
   * @param {string} expression expression
   * @param {Range} range range
   * @param {string} identifier identifier
   */
  constructor(
    expression: string,
    range: import('../javascript/JavascriptParser').Range,
    identifier: string,
  );
  expression: string;
  range: import('../javascript/JavascriptParser').Range;
  identifier: string;
  _hashUpdate: string;
}
declare namespace CachedConstDependency {
  export {
    CachedConstDependencyTemplate as Template,
    ReplaceSource,
    ChunkGraph,
    Dependency,
    UpdateHashContext,
    DependencyTemplateContext,
    DependencyTemplates,
    ModuleGraph,
    RuntimeTemplate,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
  };
}
import NullDependency = require('./NullDependency');
declare class CachedConstDependencyTemplate extends DependencyTemplate {}
type ReplaceSource = any;
type ChunkGraph = import('../ChunkGraph');
type Dependency = import('../Dependency');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type DependencyTemplates = import('../DependencyTemplates');
type ModuleGraph = import('../ModuleGraph');
type RuntimeTemplate = import('../RuntimeTemplate');
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
import DependencyTemplate = require('../DependencyTemplate');
