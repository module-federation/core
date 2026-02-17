export = CssUrlDependency;
declare class CssUrlDependency extends ModuleDependency {
  /**
   * @param {string} request request
   * @param {Range} range range of the argument
   * @param {"string" | "url" | "src"} urlType dependency type e.g. url() or string
   */
  constructor(request: string, range: Range, urlType: 'string' | 'url' | 'src');
  urlType: 'string' | 'url' | 'src';
}
declare namespace CssUrlDependency {
  export {
    CssUrlDependencyTemplate as Template,
    PUBLIC_PATH_AUTO,
    ReplaceSource,
    CodeGenerationResults,
    Dependency,
    DependencyTemplateContext,
    Module,
    CodeGenerationResult,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
declare const CssUrlDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class CssUrlDependencyTemplate extends CssUrlDependencyTemplate_base {
  /**
   * @param {Dependency} dependency the dependency for which the template should be applied
   * @param {ReplaceSource} source the current replace source which can be modified
   * @param {DependencyTemplateContext} templateContext the context object
   * @returns {void}
   */
  apply(
    dependency: Dependency,
    source: ReplaceSource,
    {
      type,
      moduleGraph,
      runtimeTemplate,
      codeGenerationResults,
    }: DependencyTemplateContext,
  ): void;
  /**
   * @param {object} options options object
   * @param {Module} options.module the module
   * @param {RuntimeSpec=} options.runtime runtime
   * @param {CodeGenerationResults} options.codeGenerationResults the code generation results
   * @returns {string} the url of the asset
   */
  assetUrl({
    runtime,
    module,
    codeGenerationResults,
  }: {
    module: Module;
    runtime?: RuntimeSpec | undefined;
    codeGenerationResults: CodeGenerationResults;
  }): string;
}
declare var PUBLIC_PATH_AUTO: string;
type ReplaceSource = import('webpack-sources').ReplaceSource;
type CodeGenerationResults = import('../CodeGenerationResults');
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').CssDependencyTemplateContext;
type Module = import('../Module');
type CodeGenerationResult = import('../Module').CodeGenerationResult;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
