export = JavascriptGenerator;
declare class JavascriptGenerator extends Generator {
  /**
   * @param {Module} module the current module
   * @param {Dependency} dependency the dependency to generate
   * @param {InitFragment<GenerateContext>[]} initFragments mutable list of init fragments
   * @param {ReplaceSource} source the current replace source which can be modified
   * @param {GenerateContext} generateContext the render context
   * @returns {void}
   */
  sourceDependency(
    module: Module,
    dependency: Dependency,
    initFragments: InitFragment<GenerateContext>[],
    source: ReplaceSource,
    generateContext: GenerateContext,
  ): void;
  /**
   * @param {Module} module the module to generate
   * @param {DependenciesBlock} block the dependencies block which will be processed
   * @param {InitFragment<GenerateContext>[]} initFragments mutable list of init fragments
   * @param {ReplaceSource} source the current replace source which can be modified
   * @param {GenerateContext} generateContext the generateContext
   * @returns {void}
   */
  sourceBlock(
    module: Module,
    block: DependenciesBlock,
    initFragments: InitFragment<GenerateContext>[],
    source: ReplaceSource,
    generateContext: GenerateContext,
  ): void;
  /**
   * @param {Module} module the module to generate
   * @param {InitFragment<GenerateContext>[]} initFragments mutable list of init fragments
   * @param {ReplaceSource} source the current replace source which can be modified
   * @param {GenerateContext} generateContext the generateContext
   * @returns {void}
   */
  sourceModule(
    module: Module,
    initFragments: InitFragment<GenerateContext>[],
    source: ReplaceSource,
    generateContext: GenerateContext,
  ): void;
  /**
   * @param {Error} error the error
   * @param {NormalModule} module module for which the code should be generated
   * @param {GenerateContext} generateContext context for generate
   * @returns {Source | null} generated code
   */
  generateError(
    error: Error,
    module: NormalModule,
    generateContext: GenerateContext,
  ): Source | null;
}
declare namespace JavascriptGenerator {
  export {
    Source,
    DependencyConstructor,
    DependenciesBlock,
    Dependency,
    DependencyTemplate,
    DependencyTemplateContext,
    GenerateContext,
    Module,
    ConcatenationBailoutReasonContext,
    SourceType,
    SourceTypes,
    NormalModule,
  };
}
import Generator = require('../Generator');
import InitFragment = require('../InitFragment');
import { ReplaceSource } from 'webpack-sources';
type Source = import('webpack-sources').Source;
type DependencyConstructor = import('../Compilation').DependencyConstructor;
type DependenciesBlock = import('../DependenciesBlock');
type Dependency = import('../Dependency');
type DependencyTemplate = import('../DependencyTemplate');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type GenerateContext = import('../Generator').GenerateContext;
type Module = import('../Module');
type ConcatenationBailoutReasonContext =
  import('../Module').ConcatenationBailoutReasonContext;
type SourceType = import('../Module').SourceType;
type SourceTypes = import('../Module').SourceTypes;
type NormalModule = import('../NormalModule');
