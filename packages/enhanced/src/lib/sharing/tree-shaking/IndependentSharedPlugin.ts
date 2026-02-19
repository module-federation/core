import * as fs from 'fs';
import * as path from 'path';
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

const filterPlugin = (
  plugin: WebpackOptionsNormalized['plugins'][0],
  treeShakingSharedExcludePlugins: string[] = [],
) => {
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
    'TreeShakingSharedPlugin',
    ...treeShakingSharedExcludePlugins,
  ].includes(pluginName);
};

const resolveOutputDir = (outputDir: string, shareName?: string) => {
  return shareName ? path.join(outputDir, encodeName(shareName)) : outputDir;
};

export interface IndependentSharePluginOptions {
  name: string;
  shared: moduleFederationPlugin.Shared;
  library?: moduleFederationPlugin.LibraryOptions;
  outputDir?: string;
  plugins?: WebpackPluginInstance[];
  treeShaking?: boolean;
  manifest?: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'];
  injectTreeShakingUsedExports?: boolean;
  treeShakingSharedExcludePlugins?: string[];
}

export default class IndependentSharedPlugin {
  mfName: string;
  shared: moduleFederationPlugin.Shared;
  library?: moduleFederationPlugin.LibraryOptions;
  sharedOptions: NormalizedSharedOptions;
  outputDir: string;
  plugins: WebpackPluginInstance[];
  treeShaking?: boolean;
  manifest?: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'];
  injectTreeShakingUsedExports?: boolean;
  buildAssets: ShareFallback = {};
  treeShakingSharedExcludePlugins?: string[];

  name = 'IndependentSharedPlugin';
  constructor(options: IndependentSharePluginOptions) {
    const {
      outputDir,
      plugins,
      treeShaking,
      shared,
      name,
      manifest,
      injectTreeShakingUsedExports,
      library,
      treeShakingSharedExcludePlugins,
    } = options;
    this.shared = shared;
    this.treeShakingSharedExcludePlugins = treeShakingSharedExcludePlugins;
    this.mfName = name;
    this.outputDir = outputDir || 'independent-packages';
    this.plugins = plugins || [];
    this.treeShaking = treeShaking;
    this.manifest = manifest;
    this.injectTreeShakingUsedExports = injectTreeShakingUsedExports ?? true;
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
    let runCount = 0;

    compiler.hooks.beforeRun.tapPromise('IndependentSharedPlugin', async () => {
      if (runCount) {
        return;
      }
      await this.createIndependentCompilers(compiler);
      runCount++;
    });

    compiler.hooks.watchRun.tapPromise('IndependentSharedPlugin', async () => {
      if (runCount) {
        return;
      }
      await this.createIndependentCompilers(compiler);
      runCount++;
    });

    compiler.hooks.thisCompilation.tap(
      'IndependentSharedPlugin',
      (compilation) => {
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
        // inject buildAssets to stats
        if (!manifest) {
          return;
        }
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
      },
    );
  }

  private createEntry(context: string) {
    const { sharedOptions } = this;
    const entryContent = sharedOptions.reduce((acc, cur, index) => {
      return `${acc}import shared_${index} from '${cur[0]}';\n`;
    }, '');
    const entryPath = path.resolve(
      context,
      'node_modules',
      '.federation',
      // name,
      'shared-entry.js',
    );
    if (!fs.existsSync(path.dirname(entryPath))) {
      fs.mkdirSync(path.dirname(entryPath), { recursive: true });
    }
    fs.writeFileSync(entryPath, entryContent);
    return entryPath;
  }

  private async createIndependentCompilers(parentCompiler: Compiler) {
    const { sharedOptions, outputDir } = this;
    console.log('Start building shared fallback resources ...');

    const shareRequestsMap: ShareRequestsMap =
      await this.createIndependentCompiler(parentCompiler);

    await Promise.all(
      sharedOptions.map(async ([shareName, shareConfig]) => {
        if (!shareConfig.treeShaking) {
          return;
        }
        const shareRequests = shareRequestsMap[shareName].requests;
        await Promise.all(
          shareRequests.map(async ([request, version]) => {
            const sharedConfig = sharedOptions.find(
              ([name]) => name === shareName,
            )?.[1];
            const [shareFileName, globalName, sharedVersion] =
              await this.createIndependentCompiler(parentCompiler, {
                shareRequestsMap,
                currentShare: {
                  shareName,
                  version,
                  request,
                  independentShareFileName: sharedConfig?.treeShaking?.filename,
                },
              });
            if (typeof shareFileName === 'string') {
              this.buildAssets[shareName] ||= [];
              this.buildAssets[shareName].push([
                path.join(
                  resolveOutputDir(outputDir, shareName),
                  shareFileName,
                ),
                sharedVersion,
                globalName,
              ]);
            }
          }),
        );
      }),
    );

    console.log('All shared fallback have been compiled successfully');
  }

  private async createIndependentCompiler(
    parentCompiler: Compiler,
    extraOptions?: {
      currentShare: Omit<SharedContainerPluginOptions, 'mfName'>;
      shareRequestsMap: ShareRequestsMap;
    },
  ) {
    const {
      treeShaking,
      plugins,
      outputDir,
      sharedOptions,
      mfName,
      library,
      treeShakingSharedExcludePlugins,
    } = this;
    const outputDirWithShareName = resolveOutputDir(
      outputDir,
      extraOptions?.currentShare?.shareName || '',
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
        mfName: `${mfName}_${treeShaking ? 't' : 'f'}`,
        library: library,
        ...extraOptions.currentShare,
      });
      (parentConfig.plugins || []).forEach((plugin) => {
        if (
          plugin !== undefined &&
          typeof plugin !== 'string' &&
          filterPlugin(plugin, treeShakingSharedExcludePlugins)
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

      if (treeShaking) {
        finalPlugins.push(
          new SharedUsedExportsOptimizerPlugin(
            sharedOptions,
            this.injectTreeShakingUsedExports,
            [IGNORED_ENTRY],
            this.manifest,
          ),
        );
      }
    }
    finalPlugins.push(extraPlugin);
    const fullOutputDir = path.resolve(
      parentCompiler.outputPath,
      outputDirWithShareName,
    );
    const parentResolve = parentConfig.resolve || {};
    const resolveModules = new Set(
      Array.isArray(parentResolve.modules)
        ? parentResolve.modules
        : parentResolve.modules
          ? [parentResolve.modules]
          : ['node_modules'],
    );
    if (parentCompiler.context) {
      resolveModules.add(path.join(parentCompiler.context, 'node_modules'));
    }

    // @ts-ignore webpack version is not the same as the one used in the plugin
    const compilerConfig: Configuration = {
      ...parentConfig,
      mode: parentConfig.mode || 'development',
      ignoreWarnings: [],
      entry: {
        [IGNORED_ENTRY]: this.createEntry(parentCompiler.context),
      },
      resolve: {
        ...parentResolve,
        modules: Array.from(resolveModules),
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
        const shareName = currentShare?.shareName || 'unknown shared package';
        const hasStatsErrors =
          !!stats &&
          (stats.hasErrors?.() || stats.toJson?.()?.errors?.length > 0);
        if (err || hasStatsErrors) {
          const lines: string[] = [];
          if (err) {
            const errMsg = (err && (err.stack || err.message)) || String(err);
            lines.push(`Compiler error: ${errMsg}`);
          }
          if (stats?.toJson) {
            const json = stats.toJson({
              all: false,
              errors: true,
              warnings: false,
              errorDetails: true,
              moduleTrace: true,
            } as any);
            const errors = (json && json.errors) || [];
            if (errors.length) {
              lines.push(`Webpack errors (${errors.length}):`);
              const max = 5;
              for (let i = 0; i < Math.min(errors.length, max); i++) {
                const e: any = errors[i];
                const where =
                  e.moduleName || e.file || e.moduleIdentifier || '';
                const loc = e.loc ? ` @ ${e.loc}` : '';
                const msg = e.message || e.details || String(e);
                lines.push(`  [${i + 1}] ${where}${loc}`);
                lines.push(`      ${msg}`);
              }
              if (errors.length > max) {
                lines.push(`  ... and ${errors.length - max} more errors`);
              }
            }
          }
          console.error(
            `❌ Shared "${shareName}" compilation failed\n${lines.join('\n')}`,
          );
          reject(err || new Error(`Shared "${shareName}" compilation failed`));
          return;
        }

        shareRequestsMap &&
          console.log(`Shared "${shareName}" compilation succeeded`);

        resolve(extraPlugin.getData());
      });
    });
  }
}
