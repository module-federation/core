export = AssetGenerator;
declare class AssetGenerator extends Generator {
  /**
   * @param {AssetGeneratorOptions["dataUrl"]=} dataUrlOptions the options for the data url
   * @param {string=} filename override for output.assetModuleFilename
   * @param {RawPublicPath=} publicPath override for output.assetModulePublicPath
   * @param {AssetModuleOutputPath=} outputPath the output path for the emitted file which is not included in the runtime import
   * @param {boolean=} emit generate output asset
   */
  constructor(
    dataUrlOptions?: AssetGeneratorOptions['dataUrl'] | undefined,
    filename?: string | undefined,
    publicPath?: RawPublicPath | undefined,
    outputPath?: AssetModuleOutputPath | undefined,
    emit?: boolean | undefined,
  );
  dataUrlOptions: import('../../declarations/WebpackOptions').AssetGeneratorDataUrl;
  filename: string;
  publicPath: import('../../declarations/WebpackOptions').RawPublicPath;
  outputPath: import('../../declarations/WebpackOptions').AssetModuleOutputPath;
  emit: boolean;
  /**
   * @param {NormalModule} module module
   * @param {RuntimeTemplate} runtimeTemplate runtime template
   * @returns {string} source file name
   */
  getSourceFileName(
    module: NormalModule,
    runtimeTemplate: RuntimeTemplate,
  ): string;
  /**
   * @param {NormalModule} module module
   * @returns {string} mime type
   */
  getMimeType(module: NormalModule): string;
}
declare namespace AssetGenerator {
  export {
    Source,
    AssetGeneratorOptions,
    AssetModuleOutputPath,
    RawPublicPath,
    Compilation,
    Compiler,
    GenerateContext,
    UpdateHashContext,
    Module,
    ConcatenationBailoutReasonContext,
    NormalModule,
    RuntimeTemplate,
    Hash,
  };
}
import Generator = require('../Generator');
type NormalModule = import('../NormalModule');
type RuntimeTemplate = import('../RuntimeTemplate');
type AssetGeneratorOptions =
  import('../../declarations/WebpackOptions').AssetGeneratorOptions;
type RawPublicPath = import('../../declarations/WebpackOptions').RawPublicPath;
type AssetModuleOutputPath =
  import('../../declarations/WebpackOptions').AssetModuleOutputPath;
type Source = any;
type Compilation = import('../Compilation');
type Compiler = import('../Compiler');
type GenerateContext = import('../Generator').GenerateContext;
type UpdateHashContext = import('../Generator').UpdateHashContext;
type Module = import('../Module');
type ConcatenationBailoutReasonContext =
  import('../Module').ConcatenationBailoutReasonContext;
type Hash = import('../util/Hash');
