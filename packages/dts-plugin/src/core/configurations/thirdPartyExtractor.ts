import { ExtractorConfig, ExtractorLogLevel } from '@microsoft/api-extractor';
import { RemoteOptions } from '../interfaces/RemoteOptions';
import { CompilerOptions } from 'typescript';
import { PKGJsonManager } from '@module-federation/managers';

export function retrieveExtractorConfig(
  remoteOptions: Required<RemoteOptions>,
  tsConfig: CompilerOptions,
  compiledTypeEntry: string,
) {
  const { context, tsConfigPath } = remoteOptions;
  const pkgManager = new PKGJsonManager();
  pkgManager.readPKGJson(context);
  return ExtractorConfig.prepare({
    configObject: {
      projectFolder: context, // 当前项目地址
      mainEntryPointFilePath: compiledTypeEntry, // 编译后的类型文件地址
      compiler: {
        tsconfigFilePath: tsConfigPath, // tsconfig 路径
        overrideTsconfig: {
          // $schema: 'http://json.schemastore.org/tsconfig',
          compilerOptions: tsConfig, // tsconfig 配置，需要写 declare:true 等一系列配置
        },
      },
      apiReport: {
        enabled: false,
      },
      docModel: {
        enabled: false,
      },
      dtsRollup: {
        enabled: true,
        publicTrimmedFilePath: compiledTypeEntry,
      },
      tsdocMetadata: {
        enabled: false,
      },
      messages: {
        compilerMessageReporting: {
          default: {
            // 输出日志级别，根据配置修改
            logLevel: 'none' as ExtractorLogLevel.None,
          },
        },
        extractorMessageReporting: {
          default: {
            logLevel: 'none' as ExtractorLogLevel.None,
          },
        },
      },
    },
    // api-extractor.json 文件地址 ，先不用提供
    configObjectFullPath: undefined, // '/Users/bytedance/outter/universe/packages/bridge/bridge-react/api-extractor.json'
    // package.json 完整地址，错误时，可以提供更详细的错误栈 '/Users/bytedance/outter/universe/packages/bridge/bridge-react/package.json'
    packageJsonFullPath: pkgManager.pkgJsonPath,
  });
}
