export = Generator;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("./ChunkGraph")} ChunkGraph */
/** @typedef {import("./CodeGenerationResults")} CodeGenerationResults */
/** @typedef {import("./Compilation")} Compilation */
/** @typedef {import("./ConcatenationScope")} ConcatenationScope */
/** @typedef {import("./DependencyTemplate")} DependencyTemplate */
/** @typedef {import("./DependencyTemplates")} DependencyTemplates */
/** @typedef {import("./Module").ConcatenationBailoutReasonContext} ConcatenationBailoutReasonContext */
/** @typedef {import("./ModuleGraph")} ModuleGraph */
/** @typedef {import("./NormalModule")} NormalModule */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("./util/Hash")} Hash */
/** @typedef {import("./util/runtime").RuntimeSpec} RuntimeSpec */
/**
 * @typedef {Object} GenerateContext
 * @property {DependencyTemplates} dependencyTemplates mapping from dependencies to templates
 * @property {RuntimeTemplate} runtimeTemplate the runtime template
 * @property {ModuleGraph} moduleGraph the module graph
 * @property {ChunkGraph} chunkGraph the chunk graph
 * @property {Set<string>} runtimeRequirements the requirements for runtime
 * @property {RuntimeSpec} runtime the runtime
 * @property {ConcatenationScope=} concatenationScope when in concatenated module, information about other concatenated modules
 * @property {CodeGenerationResults=} codeGenerationResults code generation results of other modules (need to have a codeGenerationDependency to use that)
 * @property {string} type which kind of code should be generated
 * @property {function(): Map<string, any>=} getData get access to the code generation data
 */
/**
 * @typedef {Object} UpdateHashContext
 * @property {NormalModule} module the module
 * @property {ChunkGraph} chunkGraph
 * @property {RuntimeSpec} runtime
 * @property {RuntimeTemplate=} runtimeTemplate
 */
/**
 *
 */
declare class Generator {
  /**
   * @param {Record<string, Generator>} map map of types
   * @returns {ByTypeGenerator} generator by type
   */
  static byType(map: Record<string, Generator>): ByTypeGenerator;
  /**
   * @abstract
   * @param {NormalModule} module fresh module
   * @returns {Set<string>} available types (do not mutate)
   */
  getTypes(module: NormalModule): Set<string>;
  /**
   * @abstract
   * @param {NormalModule} module the module
   * @param {string=} type source type
   * @returns {number} estimate size of the module
   */
  getSize(module: NormalModule, type?: string | undefined): number;
  /**
   * @abstract
   * @param {NormalModule} module module for which the code should be generated
   * @param {GenerateContext} generateContext context for generate
   * @returns {Source} generated code
   */
  generate(
    module: NormalModule,
    {
      dependencyTemplates,
      runtimeTemplate,
      moduleGraph,
      type,
    }: GenerateContext,
  ): any;
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
    Compilation,
    ConcatenationScope,
    DependencyTemplate,
    DependencyTemplates,
    ConcatenationBailoutReasonContext,
    ModuleGraph,
    NormalModule,
    RuntimeTemplate,
    Hash,
    RuntimeSpec,
    GenerateContext,
    UpdateHashContext,
  };
}
type NormalModule = import('./NormalModule');
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
  runtimeRequirements: Set<string>;
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
  type: string;
  /**
   * get access to the code generation data
   */
  getData?: (() => Map<string, any>) | undefined;
};
type ConcatenationBailoutReasonContext =
  import('./Module').ConcatenationBailoutReasonContext;
type Hash = import('./util/Hash');
type UpdateHashContext = {
  /**
   * the module
   */
  module: NormalModule;
  chunkGraph: ChunkGraph;
  runtime: RuntimeSpec;
  runtimeTemplate?: RuntimeTemplate | undefined;
};
declare class ByTypeGenerator extends Generator {
  /**
   * @param {Record<string, Generator>} map map of types
   */
  constructor(map: Record<string, Generator>);
  map: Record<string, Generator>;
  _types: Set<string>;
}
type Source = any;
type ChunkGraph = import('./ChunkGraph');
type CodeGenerationResults = import('./CodeGenerationResults');
type Compilation = import('./Compilation');
type ConcatenationScope = import('./ConcatenationScope');
type DependencyTemplate = import('./DependencyTemplate');
type DependencyTemplates = import('./DependencyTemplates');
type ModuleGraph = import('./ModuleGraph');
type RuntimeTemplate = import('./RuntimeTemplate');
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
