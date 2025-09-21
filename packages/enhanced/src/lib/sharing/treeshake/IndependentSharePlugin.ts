import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  WebpackPluginInstance,
  Compiler,
  WebpackOptionsNormalized,
} from 'webpack';
import TreeshakeConsumeSharedPlugin from './TreeshakeConsumeSharedPlugin';
import type { moduleFederationPlugin, Stats } from '@module-federation/sdk';
import {
  encodeName,
  isRequiredVersion,
  StatsFileName,
} from '@module-federation/sdk';
import CollectSharedEntryPlugin, {
  type ResolvedProvideMap,
} from './CollectSharedEntryPlugin';
import OptimizeDependencyReferencedExportsPlugin from './OptimizeDependencyReferencedExportsPlugin';
import SharedContainerPlugin from './SharedContainerPlugin/SharedContainerPlugin';
import { parseOptions } from '../../container/options';
import type { SharedConfig } from '../../../declarations/plugins/sharing/SharePlugin';
import IndependentShareRuntimeModule from './IndependentShareRuntimeModule';

const IGNORED_ENTRY = 'ignored-entry';

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
    'IndependentSharePlugin',
    'ModuleFederationPlugin',
    'OptimizeDependencyReferencedExportsPlugin',
    'HtmlWebpackPlugin',
  ].includes(pluginName);
};

export interface IndependentSharePluginOptions {
  mfConfig: MakeRequired<
    moduleFederationPlugin.ModuleFederationPluginOptions,
    'shared'
  >;
  outputDir?: string;
  plugins?: WebpackPluginInstance[];
  treeshake?: boolean;
}

export default class IndependentSharePlugin {
  mfConfig: MakeRequired<
    moduleFederationPlugin.ModuleFederationPluginOptions,
    'shared'
  >;
  sharedOptions: [string, SharedConfig][];
  outputDir: string;
  plugins: WebpackPluginInstance[];
  compilers: Map<string, Compiler> = new Map();
  sharedPathSet: Set<string> = new Set();
  treeshake?: boolean;
  buildAssets: Record<string, string> = {};

  name = 'IndependentSharePlugin';
  constructor(options: IndependentSharePluginOptions) {
    const { mfConfig, outputDir, plugins, treeshake } = options;
    if (!mfConfig.shared) {
      throw new Error('IndependentSharePlugin: mfConfig.shared is required');
    }
    this.mfConfig = mfConfig;
    this.outputDir = outputDir || 'independent-packages';
    this.plugins = plugins || [];
    this.treeshake = treeshake;
    this.sharedOptions = parseOptions(
      mfConfig.shared,
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
    const { treeshake } = this;

    compiler.hooks.beforeRun.tapAsync(
      'IndependentSharePlugin',
      async (compiler, callback) => {
        // only call once
        await this.createIndependentCompilers(compiler);
        callback();
      },
    );

    // clean hooks
    compiler.hooks.shutdown.tapAsync('IndependentSharePlugin', (callback) => {
      this.cleanup();
      callback();
    });

    compiler.hooks.compilation.tap('IndependentSharePlugin', (compilation) => {
      compilation.hooks.additionalTreeRuntimeRequirements.tap(
        'OptimizeDependencyReferencedExportsPlugin',
        (chunk) => {
          compilation.addRuntimeModule(
            chunk,
            new IndependentShareRuntimeModule(this.buildAssets),
          );
        },
      );

      // inject buildAssets to stats
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'injectReferenceExports',
          stage:
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            (compilation.constructor as any)
              .PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        async () => {
          // if treeshake is enabled, it means current is second-build -- re-shake assets, no need to modify stats.
          if (treeshake) {
            compilation.emitAsset(
              IndependentSharePlugin.IndependentShareBuildAssetsFilename,
              new compiler.webpack.sources.RawSource(
                JSON.stringify(this.buildAssets),
              ),
            );
            return;
          }

          const stats = compilation.getAsset(StatsFileName);
          if (!stats) {
            return;
          }
          const statsContent = JSON.parse(
            stats.source.source().toString(),
          ) as Stats;

          const { shared } = statsContent;
          Object.entries(this.buildAssets).forEach(([key, value]) => {
            const targetShared = shared.find((s) => s.name === key);
            if (!targetShared) {
              return;
            }
            targetShared.fallback = value;
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

  private createEntry(
    mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  ) {
    const entryContent = Object.keys(
      mfConfig.shared as Record<string, any>,
    ).reduce((acc, cur, index) => {
      return `${acc}import shared_${index} from '${cur}';\n`;
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
    const { sharedPathSet, sharedOptions, buildAssets } = this;
    console.log('🚀 Start creating a standalone compiler...');

    // const subOutputDir = path.join(path.dirname(parentCompiler.options.output.path||'') || '', outputDir);
    //   const fullOutputDir = path.resolve(parentCompiler.context,subOutputDir);
    // if (!fs.existsSync(fullOutputDir)) {
    //   fs.mkdirSync(fullOutputDir, { recursive: true });
    // }

    const parentOutputDir = parentCompiler.options.output.path
      ? path.basename(parentCompiler.options.output.path)
      : '';
    const resolvedProvideMap = await this.createIndependentCompiler(
      parentCompiler,
      parentOutputDir,
    );

    await Promise.all(
      sharedOptions.map(async ([currentShare, shareConfig]) => {
        if (!shareConfig.treeshake) {
          return;
        }
        const sharedPath = await this.createIndependentCompiler(
          parentCompiler,
          parentOutputDir,
          currentShare,
          resolvedProvideMap,
        );
        if (typeof sharedPath === 'string') {
          buildAssets[currentShare] = sharedPath;
          sharedPathSet.add(sharedPath);
        }
      }),
    );

    console.log('✅ All independent packages have been compiled successfully');
  }

  private async createIndependentCompiler(
    parentCompiler: Compiler,
    parentOutputDir: string,
    currentShare?: string,
    resolvedProvideMap?: ResolvedProvideMap,
  ) {
    const { mfConfig, treeshake, plugins, outputDir } = this;
    const outputDirWithShareName = path.join(
      outputDir,
      encodeName(currentShare || ''),
    );

    const parentConfig = parentCompiler.options;

    const finalPlugins = [];
    let extraPlugin: CollectSharedEntryPlugin | SharedContainerPlugin;
    if (!resolvedProvideMap) {
      extraPlugin = new CollectSharedEntryPlugin(mfConfig);
    } else {
      if (!currentShare) {
        throw new Error('Can not get target shared.');
      }
      extraPlugin = new SharedContainerPlugin(
        mfConfig,
        currentShare,
        resolvedProvideMap,
        outputDirWithShareName,
      );
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
        new TreeshakeConsumeSharedPlugin({
          consumes: Object.keys(mfConfig.shared as Record<string, any>).reduce(
            (acc, cur) => {
              if (cur !== currentShare) {
                // @ts-ignore
                acc[cur] = {
                  // use current host shared
                  import: false,
                };
              }
              return acc;
            },
            {},
          ),
        }),
      );

      if (treeshake) {
        finalPlugins.push(
          new OptimizeDependencyReferencedExportsPlugin(
            parseOptions(
              mfConfig.shared,
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
              (item) => item,
            ),
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
    const compilerConfig: Compiler['options'] = {
      ...parentConfig,
      mode: parentConfig.mode || 'development',

      entry: {
        // @ts-ignore
        [IGNORED_ENTRY]: this.createEntry(mfConfig),
      },

      // 输出配置
      output: {
        path: fullOutputDir,
        // filename: output || `${name}.js`,
        // library: {
        //   type: 'umd',
        //   name: libraryName || `__${name.replace(/-/g, '_')}__`,
        // },
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
    // @ts-ignore
    const compiler = webpack.webpack(compilerConfig);

    // 设置文件系统
    // @ts-ignore
    compiler.inputFileSystem = parentCompiler.inputFileSystem;
    // @ts-ignore
    compiler.outputFileSystem = parentCompiler.outputFileSystem;
    // @ts-ignore
    compiler.intermediateFileSystem = parentCompiler.intermediateFileSystem;

    // 存储编译器引用
    currentShare && this.compilers.set(currentShare, compiler);

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return new Promise<any>((resolve, reject) => {
      compiler.run((err: any, stats: any) => {
        if (err || stats?.hasErrors()) {
          console.error(
            `❌ 独立包 ${currentShare} 编译失败:`,
            err || stats?.toString(),
          );
          reject(err || new Error(`独立包 ${currentShare} 编译失败`));
          return;
        }

        resolvedProvideMap &&
          console.log(
            // `✅ 独立包 ${name} 编译成功: ${path.join(outputPath, output || `${name}.js`)}`,
            `✅ 独立包 ${currentShare} 编译成功`,
          );

        if (stats) {
          resolvedProvideMap && console.log(`📊 ${currentShare} 编译统计:`);
          console.log(
            stats.toString({
              colors: true,
              chunks: false,
              modules: false,
            }),
          );
        }

        resolve(extraPlugin.getData());
      });
    });
  }

  // 获取所有编译器的状态
  getCompilerStatus() {
    return Array.from(this.compilers.entries()).map(([name, compiler]) => ({
      name,
      running: compiler.running,
      watching: compiler.watching,
    }));
  }

  // 获取编译结果信息
  getCompilationResults() {
    return Array.from(this.compilers.entries()).map(([name, compiler]) => ({
      name,
      outputPath: path.resolve(compiler.options.output?.path || ''),
      entry: compiler.options.entry,
      library: compiler.options.output?.library,
    }));
  }

  // 清理所有编译器
  private cleanup() {
    this.compilers.forEach((compiler) => {
      if (compiler.watching) {
        compiler.watching.close(() => {
          console.log('👋 编译器已关闭');
        });
      }
    });
    this.compilers.clear();
  }
}
