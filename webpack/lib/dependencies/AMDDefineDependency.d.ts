export = AMDDefineDependency;
declare class AMDDefineDependency extends NullDependency {
  /**
   * @param {Range} range range
   * @param {Range | null} arrayRange array range
   * @param {Range | null} functionRange function range
   * @param {Range | null} objectRange object range
   * @param {string | null} namedModule true, when define is called with a name
   */
  constructor(
    range: Range,
    arrayRange: Range | null,
    functionRange: Range | null,
    objectRange: Range | null,
    namedModule: string | null,
  );
  range: import('../javascript/JavascriptParser').Range;
  arrayRange: import('../javascript/JavascriptParser').Range;
  functionRange: import('../javascript/JavascriptParser').Range;
  objectRange: import('../javascript/JavascriptParser').Range;
  namedModule: string;
  localModule: any;
}
declare namespace AMDDefineDependency {
  export {
    AMDDefineDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    DependencyTemplateContext,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import NullDependency = require('./NullDependency');
declare const AMDDefineDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: NullDependency.ReplaceSource,
      templateContext: NullDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class AMDDefineDependencyTemplate extends AMDDefineDependencyTemplate_base {
  /**
   * @param {AMDDefineDependency} dependency dependency
   * @returns {string} variable name
   */
  localModuleVar(dependency: AMDDefineDependency): string;
  /**
   * @param {AMDDefineDependency} dependency dependency
   * @returns {string} branch
   */
  branch(dependency: AMDDefineDependency): string;
  /**
   * @param {AMDDefineDependency} dependency dependency
   * @param {ReplaceSource} source source
   * @param {string} definition definition
   * @param {string} text text
   */
  replace(
    dependency: AMDDefineDependency,
    source: ReplaceSource,
    definition: string,
    text: string,
  ): void;
}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
