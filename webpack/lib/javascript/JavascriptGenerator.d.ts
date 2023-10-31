export = JavascriptGenerator;
declare class JavascriptGenerator extends Generator {
  /**
   * @param {Module} module the module to generate
   * @param {InitFragment[]} initFragments mutable list of init fragments
   * @param {ReplaceSource} source the current replace source which can be modified
   * @param {GenerateContext} generateContext the generateContext
   * @returns {void}
   */
  sourceModule(
    module: Module,
    initFragments: InitFragment<any>[],
    source: ReplaceSource,
    generateContext: GenerateContext,
  ): void;
  /**
   * @param {Module} module the module to generate
   * @param {DependenciesBlock} block the dependencies block which will be processed
   * @param {InitFragment[]} initFragments mutable list of init fragments
   * @param {ReplaceSource} source the current replace source which can be modified
   * @param {GenerateContext} generateContext the generateContext
   * @returns {void}
   */
  sourceBlock(
    module: Module,
    block: DependenciesBlock,
    initFragments: InitFragment<any>[],
    source: ReplaceSource,
    generateContext: GenerateContext,
  ): void;
  /**
   * @param {Module} module the current module
   * @param {Dependency} dependency the dependency to generate
   * @param {InitFragment[]} initFragments mutable list of init fragments
   * @param {ReplaceSource} source the current replace source which can be modified
   * @param {GenerateContext} generateContext the render context
   * @returns {void}
   */
  sourceDependency(
    module: Module,
    dependency: Dependency,
    initFragments: InitFragment<any>[],
    source: ReplaceSource,
    generateContext: GenerateContext,
  ): void;
}
declare namespace JavascriptGenerator {
  export {
    Source,
    DependenciesBlock,
    Dependency,
    DependencyTemplates,
    GenerateContext,
    Module,
    ConcatenationBailoutReasonContext,
    NormalModule,
    RuntimeTemplate,
  };
}
import Generator = require('../Generator');
type Module = import('../Module');
import InitFragment = require('../InitFragment');
type GenerateContext = import('../Generator').GenerateContext;
type DependenciesBlock = import('../DependenciesBlock');
type Dependency = import('../Dependency');
type Source = any;
type DependencyTemplates = import('../DependencyTemplates');
type ConcatenationBailoutReasonContext =
  import('../Module').ConcatenationBailoutReasonContext;
type NormalModule = import('../NormalModule');
type RuntimeTemplate = import('../RuntimeTemplate');
