export = Generator;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("./ChunkGraph")} ChunkGraph */
/** @typedef {import("./CodeGenerationResults")} CodeGenerationResults */
/** @typedef {import("./ConcatenationScope")} ConcatenationScope */
/** @typedef {import("./DependencyTemplates")} DependencyTemplates */
/** @typedef {import("./Module").CodeGenerationResultData} CodeGenerationResultData */
/** @typedef {import("./Module").ConcatenationBailoutReasonContext} ConcatenationBailoutReasonContext */
/** @typedef {import("./Module").RuntimeRequirements} RuntimeRequirements */
/** @typedef {import("./Module").SourceType} SourceType */
/** @typedef {import("./Module").SourceTypes} SourceTypes */
/** @typedef {import("./ModuleGraph")} ModuleGraph */
/** @typedef {import("./NormalModule")} NormalModule */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("./util/Hash")} Hash */
/** @typedef {import("./util/runtime").RuntimeSpec} RuntimeSpec */
/**
 * @typedef {object} GenerateContext
 * @property {DependencyTemplates} dependencyTemplates mapping from dependencies to templates
 * @property {RuntimeTemplate} runtimeTemplate the runtime template
 * @property {ModuleGraph} moduleGraph the module graph
 * @property {ChunkGraph} chunkGraph the chunk graph
 * @property {RuntimeRequirements} runtimeRequirements the requirements for runtime
 * @property {RuntimeSpec} runtime the runtime
 * @property {ConcatenationScope=} concatenationScope when in concatenated module, information about other concatenated modules
 * @property {CodeGenerationResults=} codeGenerationResults code generation results of other modules (need to have a codeGenerationDependency to use that)
 * @property {SourceType} type which kind of code should be generated
 * @property {() => CodeGenerationResultData=} getData get access to the code generation data
 */
/**
 * @callback GenerateErrorFn
 * @param {Error} error the error
 * @param {NormalModule} module module for which the code should be generated
 * @param {GenerateContext} generateContext context for generate
 * @returns {Source | null} generated code
 */
/**
 * @typedef {object} UpdateHashContext
 * @property {NormalModule} module the module
 * @property {ChunkGraph} chunkGraph
 * @property {RuntimeSpec} runtime
 * @property {RuntimeTemplate=} runtimeTemplate
 */
declare class Generator {
  /**
   * @param {{ [key in SourceType]?: Generator }} map map of types
   * @returns {ByTypeGenerator} generator by type
   */
  static byType(map: { [key in SourceType]?: Generator }): ByTypeGenerator;
  /**
   * @abstract
   * @param {NormalModule} module fresh module
   * @returns {SourceTypes} available types (do not mutate)
   */
  getTypes(module: NormalModule): SourceTypes;
  /**
   * @abstract
   * @param {NormalModule} module the module
   * @param {SourceType=} type source type
   * @returns {number} estimate size of the module
   */
  getSize(module: NormalModule, type?: SourceType | undefined): number;
  /**
   * @abstract
   * @param {NormalModule} module module for which the code should be generated
   * @param {GenerateContext} generateContext context for generate
   * @returns {Source | null} generated code
   */
  generate(
    module: NormalModule,
    {
      dependencyTemplates,
      runtimeTemplate,
      moduleGraph,
      type,
    }: GenerateContext,
  ): Source | null;
  /**
   * @param {NormalModule} module module for which the bailout reason should be determined
   * @param {ConcatenationBailoutReasonContext} context context
   * @returns {string | undefined} reason why this module can't be concatenated, undefined when it can be concatenated
   */
  getConcatenationBailoutReason(
    module: NormalModule,
    context: ConcatenationBailoutReasonContext,
  ): string | undefined;
  /**
   * @param {Hash} hash hash that will be modified
   * @param {UpdateHashContext} updateHashContext context for updating hash
   */
  updateHash(hash: Hash, { module, runtime }: UpdateHashContext): void;
}
declare namespace Generator {
  export {
    Source,
    ChunkGraph,
    CodeGenerationResults,
    ConcatenationScope,
    DependencyTemplates,
    CodeGenerationResultData,
    ConcatenationBailoutReasonContext,
    RuntimeRequirements,
    SourceType,
    SourceTypes,
    ModuleGraph,
    NormalModule,
    RuntimeTemplate,
    Hash,
    RuntimeSpec,
    GenerateContext,
    GenerateErrorFn,
    UpdateHashContext,
  };
}
declare class ByTypeGenerator extends Generator {
  /**
   * @param {{ [key in SourceType]?: Generator }} map map of types
   */
  constructor(map: { [key in SourceType]?: Generator });
  map: {
    [x: string]: Generator;
  };
  _types: import('./Module').SourceTypes;
  /** @type {GenerateErrorFn | undefined} */
  generateError: GenerateErrorFn | undefined;
}
type Source = import('webpack-sources').Source;
type ChunkGraph = import('./ChunkGraph');
type CodeGenerationResults = import('./CodeGenerationResults');
type ConcatenationScope = import('./ConcatenationScope');
type DependencyTemplates = import('./DependencyTemplates');
type CodeGenerationResultData = import('./Module').CodeGenerationResultData;
type ConcatenationBailoutReasonContext =
  import('./Module').ConcatenationBailoutReasonContext;
type RuntimeRequirements = import('./Module').RuntimeRequirements;
type SourceType = import('./Module').SourceType;
type SourceTypes = import('./Module').SourceTypes;
type ModuleGraph = import('./ModuleGraph');
type NormalModule = import('./NormalModule');
type RuntimeTemplate = import('./RuntimeTemplate');
type Hash = import('./util/Hash');
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type GenerateContext = {
  /**
   * mapping from dependencies to templates
   */
  dependencyTemplates: DependencyTemplates;
  /**
   * the runtime template
   */
  runtimeTemplate: RuntimeTemplate;
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
   * the runtime
   */
  runtime: RuntimeSpec;
  /**
   * when in concatenated module, information about other concatenated modules
   */
  concatenationScope?: ConcatenationScope | undefined;
  /**
   * code generation results of other modules (need to have a codeGenerationDependency to use that)
   */
  codeGenerationResults?: CodeGenerationResults | undefined;
  /**
   * which kind of code should be generated
   */
  type: SourceType;
  /**
   * get access to the code generation data
   */
  getData?: (() => CodeGenerationResultData) | undefined;
};
type GenerateErrorFn = (
  error: Error,
  module: NormalModule,
  generateContext: GenerateContext,
) => Source | null;
type UpdateHashContext = {
  /**
   * the module
   */
  module: NormalModule;
  chunkGraph: ChunkGraph;
  runtime: RuntimeSpec;
  runtimeTemplate?: RuntimeTemplate | undefined;
};
