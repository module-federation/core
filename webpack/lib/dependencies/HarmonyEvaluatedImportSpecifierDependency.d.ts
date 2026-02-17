export = HarmonyEvaluatedImportSpecifierDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
/** @typedef {import("../ModuleGraphConnection")} ModuleGraphConnection */
/** @typedef {import("../javascript/JavascriptParser").Assertions} Assertions */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/**
 * Dependency for static evaluating import specifier. e.g.
 * @example
 * import a from "a";
 * "x" in a;
 * a.x !== undefined; // if x value statically analyzable
 */
declare class HarmonyEvaluatedImportSpecifierDependency extends HarmonyImportSpecifierDependency {
  /**
   * @param {string} request the request string
   * @param {number} sourceOrder source order
   * @param {TODO} ids ids
   * @param {TODO} name name
   * @param {Range} range location in source code
   * @param {Assertions} assertions assertions
   * @param {string} operator operator
   */
  constructor(
    request: string,
    sourceOrder: number,
    ids: TODO,
    name: TODO,
    range: import('../javascript/JavascriptParser').Range,
    assertions: Assertions,
    operator: string,
  );
  operator: string;
}
declare namespace HarmonyEvaluatedImportSpecifierDependency {
  export {
    HarmonyEvaluatedImportSpecifierDependencyTemplate as Template,
    ReplaceSource,
    ChunkGraph,
    Dependency,
    DependencyTemplateContext,
    BuildMeta,
    ModuleGraphConnection,
    Assertions,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import HarmonyImportSpecifierDependency = require('./HarmonyImportSpecifierDependency');
type Assertions = import('../javascript/JavascriptParser').Assertions;
declare const HarmonyEvaluatedImportSpecifierDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
    _trimIdsToThoseImported(
      ids: string[],
      moduleGraph: import('../ModuleGraph'),
      dependency: HarmonyImportSpecifierDependency,
    ): string[];
    _getCodeForIds(
      dep: HarmonyImportSpecifierDependency,
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
      ids: string[],
    ): string;
  };
  getImportEmittedRuntime(
    module: import('../Module'),
    referencedModule: import('../Module'),
  ): boolean | import('../util/runtime').RuntimeSpec;
};
declare class HarmonyEvaluatedImportSpecifierDependencyTemplate extends HarmonyEvaluatedImportSpecifierDependencyTemplate_base {}
type ReplaceSource = any;
type ChunkGraph = import('../ChunkGraph');
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type BuildMeta = import('../Module').BuildMeta;
type ModuleGraphConnection = import('../ModuleGraphConnection');
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
