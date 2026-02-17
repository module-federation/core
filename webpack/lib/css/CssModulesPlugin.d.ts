export = CssModulesPlugin;
declare class CssModulesPlugin {
  /**
   * @param {Chunk} chunk chunk
   * @param {OutputOptions} outputOptions output options
   * @returns {Chunk["cssFilenameTemplate"] | OutputOptions["cssFilename"] | OutputOptions["cssChunkFilename"]} used filename template
   */
  static getChunkFilenameTemplate(
    chunk: Chunk,
    outputOptions: OutputOptions,
  ):
    | Chunk['cssFilenameTemplate']
    | OutputOptions['cssFilename']
    | OutputOptions['cssChunkFilename'];
  /**
   * @param {Chunk} chunk chunk
   * @param {ChunkGraph} chunkGraph chunk graph
   * @returns {boolean} true, when the chunk has css
   */
  static chunkHasCss(chunk: Chunk, chunkGraph: ChunkGraph): boolean;
  /**
   * @param {CssExperimentOptions} options options
   */
  constructor({ exportsOnly }: CssExperimentOptions);
  _exportsOnly: boolean;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   * @param {Chunk} chunk chunk
   * @param {Iterable<Module>} modules unordered modules
   * @param {Compilation} compilation compilation
   * @returns {Module[]} ordered modules
   */
  getModulesInOrder(
    chunk: Chunk,
    modules: Iterable<Module>,
    compilation: Compilation,
  ): Module[];
  /**
   * @param {Chunk} chunk chunk
   * @param {ChunkGraph} chunkGraph chunk graph
   * @param {Compilation} compilation compilation
   * @returns {Module[]} ordered css modules
   */
  getOrderedChunkCssModules(
    chunk: Chunk,
    chunkGraph: ChunkGraph,
    compilation: Compilation,
  ): Module[];
  /**
   * @param {Object} options options
   * @param {string | undefined} options.uniqueName unique name
   * @param {Chunk} options.chunk chunk
   * @param {ChunkGraph} options.chunkGraph chunk graph
   * @param {CodeGenerationResults} options.codeGenerationResults code generation results
   * @param {CssModule[]} options.modules ordered css modules
   * @returns {Source} generated source
   */
  renderChunk({
    uniqueName,
    chunk,
    chunkGraph,
    codeGenerationResults,
    modules,
  }: {
    uniqueName: string | undefined;
    chunk: Chunk;
    chunkGraph: ChunkGraph;
    codeGenerationResults: CodeGenerationResults;
    modules: CssModule[];
  }): any;
}
declare namespace CssModulesPlugin {
  export {
    Source,
    CssExperimentOptions,
    OutputOptions,
    Chunk,
    ChunkGraph,
    CodeGenerationResults,
    Compilation,
    Compiler,
    Module,
    Memoize,
  };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
type Module = import('../Module');
type Compilation = import('../Compilation');
type ChunkGraph = import('../ChunkGraph');
type CodeGenerationResults = import('../CodeGenerationResults');
import CssModule = require('../CssModule');
type OutputOptions = import('../../declarations/WebpackOptions').Output;
type CssExperimentOptions =
  import('../../declarations/WebpackOptions').CssExperimentOptions;
type Source = any;
type Memoize = <T>(
  fn: memoize.FunctionReturning<T>,
) => memoize.FunctionReturning<T>;
import memoize = require('../util/memoize');
