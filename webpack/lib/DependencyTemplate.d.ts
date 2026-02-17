export = DependencyTemplate;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("./ChunkGraph")} ChunkGraph */
/** @typedef {import("./CodeGenerationResults")} CodeGenerationResults */
/** @typedef {import("./ConcatenationScope")} ConcatenationScope */
/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./Dependency").RuntimeSpec} RuntimeSpec */
/** @typedef {import("./DependencyTemplates")} DependencyTemplates */
/** @typedef {import("./Generator").GenerateContext} GenerateContext */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./Module").RuntimeRequirements} RuntimeRequirements */
/** @typedef {import("./ModuleGraph")} ModuleGraph */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */
/**
 * @template T
 * @typedef {import("./InitFragment")<T>} InitFragment
 */
/**
 * @typedef {object} DependencyTemplateContext
 * @property {RuntimeTemplate} runtimeTemplate the runtime template
 * @property {DependencyTemplates} dependencyTemplates the dependency templates
 * @property {ModuleGraph} moduleGraph the module graph
 * @property {ChunkGraph} chunkGraph the chunk graph
 * @property {RuntimeRequirements} runtimeRequirements the requirements for runtime
 * @property {Module} module current module
 * @property {RuntimeSpec} runtime current runtimes, for which code is generated
 * @property {InitFragment<GenerateContext>[]} initFragments mutable array of init fragments for the current module
 * @property {ConcatenationScope=} concatenationScope when in a concatenated module, information about other concatenated modules
 * @property {CodeGenerationResults} codeGenerationResults the code generation results
 * @property {InitFragment<GenerateContext>[]} chunkInitFragments chunkInitFragments
 */
/**
 * @typedef {object} CssDependencyTemplateContextExtras
 * @property {CssData} cssData the css exports data
 * @property {string} type the css exports data
 */
/**
 * @typedef {object} CssData
 * @property {boolean} esModule whether export __esModule
 * @property {Map<string, string>} exports the css exports
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
    source: ReplaceSource,
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
    Module,
    RuntimeRequirements,
    ModuleGraph,
    RuntimeTemplate,
    InitFragment,
    DependencyTemplateContext,
    CssDependencyTemplateContextExtras,
    CssData,
    CssDependencyTemplateContext,
  };
}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type ChunkGraph = import('./ChunkGraph');
type CodeGenerationResults = import('./CodeGenerationResults');
type ConcatenationScope = import('./ConcatenationScope');
type Dependency = import('./Dependency');
type RuntimeSpec = import('./Dependency').RuntimeSpec;
type DependencyTemplates = import('./DependencyTemplates');
type GenerateContext = import('./Generator').GenerateContext;
type Module = import('./Module');
type RuntimeRequirements = import('./Module').RuntimeRequirements;
type ModuleGraph = import('./ModuleGraph');
type RuntimeTemplate = import('./RuntimeTemplate');
type InitFragment<T> = import('./InitFragment')<T>;
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
  runtimeRequirements: RuntimeRequirements;
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
  /**
   * chunkInitFragments
   */
  chunkInitFragments: InitFragment<GenerateContext>[];
};
type CssDependencyTemplateContextExtras = {
  /**
   * the css exports data
   */
  cssData: CssData;
  /**
   * the css exports data
   */
  type: string;
};
type CssData = {
  /**
   * whether export __esModule
   */
  esModule: boolean;
  /**
   * the css exports
   */
  exports: Map<string, string>;
};
type CssDependencyTemplateContext = DependencyTemplateContext &
  CssDependencyTemplateContextExtras;
