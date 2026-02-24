export = CachedConstDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/Hash")} Hash */
declare class CachedConstDependency extends NullDependency {
  /**
   * @param {string} expression expression
   * @param {Range | null} range range
   * @param {string} identifier identifier
   * @param {number=} place place where we inject the expression
   */
  constructor(
    expression: string,
    range: Range | null,
    identifier: string,
    place?: number | undefined,
  );
  expression: string;
  range: import('../javascript/JavascriptParser').Range;
  identifier: string;
  place: number;
  _hashUpdate: string;
  /**
   * @returns {string} hash update
   */
  _createHashUpdate(): string;
}
declare namespace CachedConstDependency {
  export {
    PLACE_MODULE,
    PLACE_CHUNK,
    CachedConstDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    UpdateHashContext,
    DependencyTemplateContext,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
  };
}
import NullDependency = require('./NullDependency');
declare var PLACE_MODULE: number;
declare var PLACE_CHUNK: number;
declare class CachedConstDependencyTemplate extends DependencyTemplate {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
import DependencyTemplate = require('../DependencyTemplate');
