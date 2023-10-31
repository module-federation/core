export = DependencyTemplate;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("./ChunkGraph")} ChunkGraph */
/** @typedef {import("./CodeGenerationResults")} CodeGenerationResults */
/** @typedef {import("./ConcatenationScope")} ConcatenationScope */
/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./Dependency").RuntimeSpec} RuntimeSpec */
/** @typedef {import("./DependencyTemplates")} DependencyTemplates */
/** @typedef {import("./Generator").GenerateContext} GenerateContext */
/** @template T @typedef {import("./InitFragment")<T>} InitFragment */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./ModuleGraph")} ModuleGraph */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */
/**
 * @typedef {Object} DependencyTemplateContext
 * @property {RuntimeTemplate} runtimeTemplate the runtime template
 * @property {DependencyTemplates} dependencyTemplates the dependency templates
 * @property {ModuleGraph} moduleGraph the module graph
 * @property {ChunkGraph} chunkGraph the chunk graph
 * @property {Set<string>} runtimeRequirements the requirements for runtime
 * @property {Module} module current module
 * @property {RuntimeSpec} runtime current runtimes, for which code is generated
 * @property {InitFragment<GenerateContext>[]} initFragments mutable array of init fragments for the current module
 * @property {ConcatenationScope=} concatenationScope when in a concatenated module, information about other concatenated modules
 * @property {CodeGenerationResults} codeGenerationResults the code generation results
 */
/**
 * @typedef {Object} CssDependencyTemplateContextExtras
 * @property {Map<string, string>} cssExports the css exports
 */
/** @typedef {DependencyTemplateContext & CssDependencyTemplateContextExtras} CssDependencyTemplateContext */
declare class DependencyTemplate {
  /**
   * @abstract
   * @param {Dependency} dependency the dependency for which the template should be applied
   * @param {ReplaceSource} source the current replace source which can be modified
   * @param {DependencyTemplateContext} templateContext the context object
   * @returns {void}
   */
  apply(
    dependency: Dependency,
    source: any,
    templateContext: DependencyTemplateContext,
  ): void;
}
declare namespace DependencyTemplate {
  export {
    ReplaceSource,
    ChunkGraph,
    CodeGenerationResults,
    ConcatenationScope,
    Dependency,
    RuntimeSpec,
    DependencyTemplates,
    GenerateContext,
    InitFragment,
    Module,
    ModuleGraph,
    RuntimeTemplate,
    DependencyTemplateContext,
    CssDependencyTemplateContextExtras,
    CssDependencyTemplateContext,
  };
}
type Dependency = import('./Dependency');
type DependencyTemplateContext = {
  /**
   * the runtime template
   */
  runtimeTemplate: RuntimeTemplate;
  /**
   * the dependency templates
   */
  dependencyTemplates: DependencyTemplates;
  /**
   * the module graph
   */
  moduleGraph: ModuleGraph;
  /**
   * the chunk graph
   */
  chunkGraph: ChunkGraph;
  /**
   * the requirements for runtime
   */
  runtimeRequirements: Set<string>;
  /**
   * current module
   */
  module: Module;
  /**
   * current runtimes, for which code is generated
   */
  runtime: RuntimeSpec;
  /**
   * mutable array of init fragments for the current module
   */
  initFragments: InitFragment<GenerateContext>[];
  /**
   * when in a concatenated module, information about other concatenated modules
   */
  concatenationScope?: ConcatenationScope | undefined;
  /**
   * the code generation results
   */
  codeGenerationResults: CodeGenerationResults;
};
type ReplaceSource = any;
type ChunkGraph = import('./ChunkGraph');
type CodeGenerationResults = import('./CodeGenerationResults');
type ConcatenationScope = import('./ConcatenationScope');
type RuntimeSpec = import('./Dependency').RuntimeSpec;
type DependencyTemplates = import('./DependencyTemplates');
type GenerateContext = import('./Generator').GenerateContext;
type InitFragment<T> = import('./InitFragment')<T>;
type Module = import('./Module');
type ModuleGraph = import('./ModuleGraph');
type RuntimeTemplate = import('./RuntimeTemplate');
type CssDependencyTemplateContextExtras = {
  /**
   * the css exports
   */
  cssExports: Map<string, string>;
};
type CssDependencyTemplateContext = DependencyTemplateContext &
  CssDependencyTemplateContextExtras;
