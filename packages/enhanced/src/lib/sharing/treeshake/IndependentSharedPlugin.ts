import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  WebpackPluginInstance,
  Compiler,
  Configuration,
  WebpackOptionsNormalized,
} from 'webpack';
import type { moduleFederationPlugin, Stats } from '@module-federation/sdk';
import {
  encodeName,
  isRequiredVersion,
  StatsFileName,
} from '@module-federation/sdk';
import CollectSharedEntryPlugin, {
  type ShareRequestsMap,
} from './CollectSharedEntryPlugin';
import SharedUsedExportsOptimizerPlugin from './SharedUsedExportsOptimizerPlugin';
import SharedContainerPlugin, {
  SharedContainerPluginOptions,
} from './SharedContainerPlugin/SharedContainerPlugin';
import { parseOptions } from '../../container/options';
import type { SharedConfig } from '../../../declarations/plugins/sharing/SharePlugin';
import ConsumeSharedPlugin from '../ConsumeSharedPlugin';
import { NormalizedSharedOptions } from '../SharePlugin';
import IndependentSharedRuntimeModule from './IndependentSharedRuntimeModule';

const IGNORED_ENTRY = 'ignored-entry';

// { react: [  [ react/19.0.0/index.js , 19.0.0, react_global_name ]  ] }
export type ShareFallback = Record<string, [string, string, string][]>;

export type MakeRequired<T, K extends keyof T> = Required<Pick<T, K>> &
  Omit<T, K>;

const filterPlugin = (plugin: WebpackOptionsNormalized['plugins'][0]) => {
  if (!plugin) {
    return true;
  }
  const pluginName = plugin['name'] || plugin['constructor']?.name;
  if (!pluginName) {
    return true;
  }
  return ![
    'IndependentSharedPlugin',
    'ModuleFederationPlugin',
    'SharedUsedExportsOptimizerPlugin',
    'HtmlWebpackPlugin',
  ].includes(pluginName);
};

export interface IndependentSharePluginOptions {
  name: string;
  shared: moduleFederationPlugin.Shared;
  library?: moduleFederationPlugin.LibraryOptions;
  outputDir?: string;
  outputFilePath?: string;
  plugins?: WebpackPluginInstance[];
  treeshake?: boolean;
  manifest?: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'];
  injectUsedExports?: boolean;
}

export default class IndependentSharedPlugin {
  mfName: string;
  shared: moduleFederationPlugin.Shared;
  library?: moduleFederationPlugin.LibraryOptions;
  sharedOptions: NormalizedSharedOptions;
  outputDir: string;
  outputFilePath?: string;
  plugins: WebpackPluginInstance[];
  treeshake?: boolean;
  manifest?: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'];
  injectUsedExports?: boolean;
  buildAssets: ShareFallback = {};

  name = 'IndependentSharedPlugin';
  constructor(options: IndependentSharePluginOptions) {
    const {
      outputDir,
      outputFilePath,
      plugins,
      treeshake,
      shared,
      name,
      manifest,
      injectUsedExports,
      library,
    } = options;
    this.shared = shared;
    this.mfName = name;
    this.outputDir = outputFilePath ? '' : outputDir || 'independent-packages';
    this.outputFilePath = outputFilePath;
    this.plugins = plugins || [];
    this.treeshake = treeshake;
    this.manifest = manifest;
    this.injectUsedExports = injectUsedExports ?? true;
    this.library = library;
    this.sharedOptions = parseOptions(
      shared,
      (item, key) => {
        if (typeof item !== 'string')
          throw new Error(
            `Unexpected array in shared configuration for key "${key}"`,
          );
        const config: SharedConfig =
          item === key || !isRequiredVersion(item)
            ? {
                import: item,
              }
            : {
                import: key,
                requiredVersion: item,
              };

        return config;
      },
      (item) => {
        return item;
      },
    );
  }

  static IndependentShareBuildAssetsFilename =
    'independent-share-build-assets.json';

  apply(compiler: Compiler) {
    const { manifest } = this;

    compiler.hooks.beforeRun.tapAsync(
      'IndependentSharedPlugin',
      async (compiler, callback) => {
        await this.createIndependentCompilers(compiler);
        callback();
      },
    );

    // inject buildAssets to stats
    if (!manifest) {
      return;
    }
    compiler.hooks.compilation.tap('IndependentSharedPlugin', (compilation) => {
      compilation.hooks.additionalTreeRuntimeRequirements.tap(
        'OptimizeDependencyReferencedExportsPlugin',
        (chunk) => {
          compilation.addRuntimeModule(
            chunk,
            new IndependentSharedRuntimeModule(
              this.buildAssets,
              this.library?.type || 'global',
            ),
          );
        },
      );

      compilation.hooks.processAssets.tapPromise(
        {
          name: 'injectReferenceExports',
          stage:
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            (compilation.constructor as any)
              .PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        async () => {
          const stats = compilation.getAsset(StatsFileName);
          if (!stats) {
            return;
          }
          const statsContent = JSON.parse(
            stats.source.source().toString(),
          ) as Stats;

          const { shared } = statsContent;
          Object.entries(this.buildAssets).forEach(([key, item]) => {
            const targetShared = shared.find((s) => s.name === key);
            if (!targetShared) {
              return;
            }
            item.forEach(([entry, version, globalName]) => {
              if (version === targetShared.version) {
                targetShared.fallback = entry;
                targetShared.fallbackName = globalName;
              }
            });
          });

          compilation.updateAsset(
            StatsFileName,
            new compiler.webpack.sources.RawSource(
              JSON.stringify(statsContent),
            ),
          );
        },
      );
    });
  }

  private createEntry() {
    const { sharedOptions } = this;
    const entryContent = sharedOptions.reduce((acc, cur, index) => {
      return `${acc}import shared_${index} from '${cur[0]}';\n`;
    }, '');
    const entryPath = path.resolve(
      'node_modules',
      '.federation',
      // name,
      'shared-entry.js',
    );
    fs.writeFileSync(entryPath, entryContent);
    return entryPath;
  }

  private async createIndependentCompilers(parentCompiler: Compiler) {
    const { sharedOptions } = this;
    console.log('🚀 Start creating a standalone compiler...');

    // const subOutputDir = path.join(path.dirname(parentCompiler.options.output.path||'') || '', outputDir);
    //   const fullOutputDir = path.resolve(parentCompiler.context,subOutputDir);
    // if (!fs.existsSync(fullOutputDir)) {
    //   fs.mkdirSync(fullOutputDir, { recursive: true });
    // }

    const parentOutputDir = parentCompiler.options.output.path
      ? path.basename(parentCompiler.options.output.path)
      : '';
    const shareRequestsMap: ShareRequestsMap =
      await this.createIndependentCompiler(parentCompiler, parentOutputDir);

    await Promise.all(
      sharedOptions.map(async ([shareName, shareConfig]) => {
        if (!shareConfig.treeshake) {
          return;
        }
        const shareRequests = shareRequestsMap[shareName].requests;
        await Promise.all(
          shareRequests.map(async ([request, version]) => {
            const sharedConfig = sharedOptions.find(
              ([name]) => name === shareName,
            )?.[1];
            const [shareFileName, globalName, sharedVersion] =
              await this.createIndependentCompiler(
                parentCompiler,
                parentOutputDir,
                {
                  shareRequestsMap,
                  currentShare: {
                    shareName,
                    version,
                    request,
                    independentShareFileName:
                      sharedConfig?.independentShareFileName,
                  },
                },
              );
            if (typeof shareFileName === 'string') {
              this.buildAssets[shareName] ||= [];
              this.buildAssets[shareName].push([
                shareFileName,
                sharedVersion,
                globalName,
              ]);
            }
          }),
        );
      }),
    );

    console.log('✅ All independent packages have been compiled successfully');
  }

  private async createIndependentCompiler(
    parentCompiler: Compiler,
    parentOutputDir: string,
    extraOptions?: {
      currentShare: Omit<SharedContainerPluginOptions, 'mfName'>;
      shareRequestsMap: ShareRequestsMap;
    },
  ) {
    const { treeshake, plugins, outputDir, sharedOptions, mfName, library } =
      this;
    const outputDirWithShareName = path.join(
      outputDir,
      encodeName(extraOptions?.currentShare?.shareName || ''),
    );

    const parentConfig = parentCompiler.options;

    const finalPlugins = [];
    let extraPlugin: CollectSharedEntryPlugin | SharedContainerPlugin;
    if (!extraOptions) {
      extraPlugin = new CollectSharedEntryPlugin({
        sharedOptions,
      });
    } else {
      extraPlugin = new SharedContainerPlugin({
        mfName: mfName,
        library: library,
        ...extraOptions.currentShare,
      });
      (parentConfig.plugins || []).forEach((plugin) => {
        if (
          plugin !== undefined &&
          typeof plugin !== 'string' &&
          filterPlugin(plugin)
        ) {
          finalPlugins.push(plugin);
        }
      });
      plugins.forEach((plugin) => {
        finalPlugins.push(plugin);
      });
      finalPlugins.push(
        new ConsumeSharedPlugin({
          consumes: sharedOptions
            .filter(
              ([key, options]) =>
                extraOptions?.currentShare.shareName !==
                (options.shareKey || key),
            )
            .map(([key, options]) => ({
              [key]: {
                import: !extraOptions ? options.import : false,
                shareKey: options.shareKey || key,
                shareScope: options.shareScope,
                requiredVersion: options.requiredVersion,
                strictVersion: options.strictVersion,
                singleton: options.singleton,
                packageName: options.packageName,
                eager: options.eager,
              },
            })),
        }),
      );

      if (treeshake) {
        finalPlugins.push(
          new SharedUsedExportsOptimizerPlugin(
            sharedOptions,
            this.injectUsedExports,
            [IGNORED_ENTRY],
          ),
        );
      }
    }
    finalPlugins.push(extraPlugin);
    const fullOutputDir = path.resolve(
      parentCompiler.context,
      parentOutputDir,
      outputDirWithShareName,
    );
    // @ts-ignore webpack version is not the same as the one used in the plugin
    const compilerConfig: Configuration = {
      ...parentConfig,
      mode: parentConfig.mode || 'development',
      ignoreWarnings: [],
      entry: {
        [IGNORED_ENTRY]: this.createEntry(),
      },

      // 输出配置
      output: {
        path: fullOutputDir,
        clean: true,
        publicPath: parentConfig.output?.publicPath || 'auto',
      },

      // 插件继承
      plugins: finalPlugins,

      // 优化配置继承
      optimization: {
        ...parentConfig.optimization,
        splitChunks: false, // 每个包独立，不拆分
      },
    };

    // 创建独立的 webpack compiler 实例
    const webpack = parentCompiler.webpack;
    const compiler = webpack.webpack(compilerConfig);

    // 设置文件系统
    compiler.inputFileSystem = parentCompiler.inputFileSystem;
    compiler.outputFileSystem = parentCompiler.outputFileSystem;
    compiler.intermediateFileSystem = parentCompiler.intermediateFileSystem;

    const { currentShare, shareRequestsMap } = extraOptions || {};

    return new Promise<any>((resolve, reject) => {
      compiler.run((err: any, stats: any) => {
        if (err || stats?.hasErrors()) {
          console.error(
            `❌ 独立包 ${currentShare?.shareName} 编译失败:`,
            err || stats?.toString(),
          );
          reject(
            err || new Error(`独立包 ${currentShare?.shareName} 编译失败`),
          );
          return;
        }

        shareRequestsMap && console.log(`✅ 独立包 ${currentShare} 编译成功`);

        resolve(extraPlugin.getData());
      });
    });
  }
}
