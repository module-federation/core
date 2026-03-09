export = AssetGenerator;
declare class AssetGenerator extends Generator {
  /**
   * @param {NormalModule} module module
   * @param {RuntimeTemplate} runtimeTemplate runtime template
   * @returns {string} source file name
   */
  static getSourceFileName(
    module: NormalModule,
    runtimeTemplate: RuntimeTemplate,
  ): string;
  /**
   * @param {NormalModule} module module
   * @param {RuntimeTemplate} runtimeTemplate runtime template
   * @returns {[string, string]} return full hash and non-numeric full hash
   */
  static getFullContentHash(
    module: NormalModule,
    runtimeTemplate: RuntimeTemplate,
  ): [string, string];
  /**
   * @param {NormalModule} module module for which the code should be generated
   * @param {Pick<AssetResourceGeneratorOptions, "filename" | "outputPath">} generatorOptions generator options
   * @param {{ runtime: RuntimeSpec, runtimeTemplate: RuntimeTemplate, chunkGraph: ChunkGraph }} generateContext context for generate
   * @param {string} contentHash the content hash
   * @returns {{ filename: string, originalFilename: string, assetInfo: AssetInfo }} info
   */
  static getFilenameWithInfo(
    module: NormalModule,
    generatorOptions: Pick<
      AssetResourceGeneratorOptions,
      'filename' | 'outputPath'
    >,
    {
      runtime,
      runtimeTemplate,
      chunkGraph,
    }: {
      runtime: RuntimeSpec;
      runtimeTemplate: RuntimeTemplate;
      chunkGraph: ChunkGraph;
    },
    contentHash: string,
  ): {
    filename: string;
    originalFilename: string;
    assetInfo: AssetInfo;
  };
  /**
   * @param {NormalModule} module module for which the code should be generated
   * @param {Pick<AssetResourceGeneratorOptions, "publicPath">} generatorOptions generator options
   * @param {GenerateContext} generateContext context for generate
   * @param {string} filename the filename
   * @param {AssetInfo} assetInfo the asset info
   * @param {string} contentHash the content hash
   * @returns {{ assetPath: string, assetInfo: AssetInfo }} asset path and info
   */
  static getAssetPathWithInfo(
    module: NormalModule,
    generatorOptions: Pick<AssetResourceGeneratorOptions, 'publicPath'>,
    {
      runtime,
      runtimeTemplate,
      type,
      chunkGraph,
      runtimeRequirements,
    }: GenerateContext,
    filename: string,
    assetInfo: AssetInfo,
    contentHash: string,
  ): {
    assetPath: string;
    assetInfo: AssetInfo;
  };
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {AssetGeneratorOptions["dataUrl"]=} dataUrlOptions the options for the data url
   * @param {AssetModuleFilename=} filename override for output.assetModuleFilename
   * @param {RawPublicPath=} publicPath override for output.assetModulePublicPath
   * @param {AssetModuleOutputPath=} outputPath the output path for the emitted file which is not included in the runtime import
   * @param {boolean=} emit generate output asset
   */
  constructor(
    moduleGraph: ModuleGraph,
    dataUrlOptions?: AssetGeneratorOptions['dataUrl'] | undefined,
    filename?: AssetModuleFilename | undefined,
    publicPath?: RawPublicPath | undefined,
    outputPath?: AssetModuleOutputPath | undefined,
    emit?: boolean | undefined,
  );
  dataUrlOptions: import('../../declarations/WebpackOptions').AssetGeneratorDataUrl;
  filename: import('../../declarations/WebpackOptions').AssetModuleFilename;
  publicPath: import('../../declarations/WebpackOptions').RawPublicPath;
  outputPath: import('../../declarations/WebpackOptions').AssetModuleOutputPath;
  emit: boolean;
  _moduleGraph: import('../ModuleGraph');
  /**
   * @param {NormalModule} module module
   * @returns {string} mime type
   */
  getMimeType(module: NormalModule): string;
  /**
   * @param {NormalModule} module module for which the code should be generated
   * @returns {string} DataURI
   */
  generateDataUri(module: NormalModule): string;
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
declare namespace AssetGenerator {
  export {
    Source,
    AssetGeneratorDataUrlOptions,
    AssetGeneratorOptions,
    AssetModuleFilename,
    AssetModuleOutputPath,
    AssetResourceGeneratorOptions,
    RawPublicPath,
    ChunkGraph,
    AssetInfo,
    GenerateContext,
    UpdateHashContext,
    NameForCondition,
    BuildInfo,
    ConcatenationBailoutReasonContext,
    SourceType,
    SourceTypes,
    ModuleGraph,
    NormalModule,
    RuntimeTemplate,
    Hash,
    RuntimeSpec,
  };
}
import Generator = require('../Generator');
type Source = import('webpack-sources').Source;
type AssetGeneratorDataUrlOptions =
  import('../../declarations/WebpackOptions').AssetGeneratorDataUrlOptions;
type AssetGeneratorOptions =
  import('../../declarations/WebpackOptions').AssetGeneratorOptions;
type AssetModuleFilename =
  import('../../declarations/WebpackOptions').AssetModuleFilename;
type AssetModuleOutputPath =
  import('../../declarations/WebpackOptions').AssetModuleOutputPath;
type AssetResourceGeneratorOptions =
  import('../../declarations/WebpackOptions').AssetResourceGeneratorOptions;
type RawPublicPath = import('../../declarations/WebpackOptions').RawPublicPath;
type ChunkGraph = import('../ChunkGraph');
type AssetInfo = import('../Compilation').AssetInfo;
type GenerateContext = import('../Generator').GenerateContext;
type UpdateHashContext = import('../Generator').UpdateHashContext;
type NameForCondition = import('../Module').NameForCondition;
type BuildInfo = import('../Module').BuildInfo;
type ConcatenationBailoutReasonContext =
  import('../Module').ConcatenationBailoutReasonContext;
type SourceType = import('../Module').SourceType;
type SourceTypes = import('../Module').SourceTypes;
type ModuleGraph = import('../ModuleGraph');
type NormalModule = import('../NormalModule');
type RuntimeTemplate = import('../RuntimeTemplate');
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
