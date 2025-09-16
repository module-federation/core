import * as fs from 'node:fs';
import * as path from 'node:path';
import type { WebpackPluginInstance, Compiler } from 'webpack';
import TreeshakeConsumeSharedPlugin from './TreeshakeConsumeSharedPlugin';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import { encodeName } from '@module-federation/sdk';
import CollectSharedEntryPlugin, {
  type ResolvedProvideMap,
} from './CollectSharedEntryPlugin';
import DependencyReferencExportPlugin from './DependencyReferencExportPlugin';
import ShakeSharedPlugin from './ShakeSharedPlugin/ShakeSharedPlugin';

const filterPlugin = (plugin: WebpackPluginInstance) => {
  if (!plugin) {
    return true;
  }
  const pluginName = plugin['name'] || plugin['constructor']?.name;
  if (!pluginName) {
    return true;
  }
  return ![
    'IndependentCompilerPlugin',
    'ModuleFederationPlugin',
    'DependencyReferencExportPlugin',
    'HtmlWebpackPlugin',
  ].includes(pluginName);
};

export interface IndependentCompilerPluginOptions {
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  outputDir?: string;
}

export default class IndependentCompilerPlugin {
  private options: Required<IndependentCompilerPluginOptions>;
  private compilers: Map<string, Compiler> = new Map();
  sharedPathSet: Set<string> = new Set();

  name = 'IndependentCompilerPlugin';
  constructor(options: IndependentCompilerPluginOptions) {
    this.options = {
      outputDir: 'dist/independent-packages',
      ...options,
    };
  }

  apply(compiler: Compiler) {
    const { mfConfig, outputDir } = this.options;

    // 确保输出目录存在
    compiler.hooks.beforeRun.tapAsync(
      'IndependentCompilerPlugin',
      async (compiler, callback) => {
        console.log('beforeRun');
        if (outputDir) {
          const fullOutputDir = path.resolve(compiler.context, outputDir);
          if (!fs.existsSync(fullOutputDir)) {
            fs.mkdirSync(fullOutputDir, { recursive: true });
          }
        }
        // only call once
        await this.createIndependentCompilers(compiler, mfConfig);
        callback();
      },
    );

    // 清理钩子
    compiler.hooks.shutdown.tapAsync(
      'IndependentCompilerPlugin',
      (callback) => {
        this.cleanup();
        callback();
      },
    );
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

  private async createIndependentCompilers(
    parentCompiler: Compiler,
    mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  ) {
    const { sharedPathSet } = this;
    console.log('🚀 开始创建独立编译器...');

    // if (this.options.parallel) {
    //   await Promise.all(
    //     packages.map(pkg =>
    //       this.createIndependentCompiler(parentCompiler, pkg),
    //     ),
    //   );
    // } else {
    //   for (const pkg of packages) {
    //     await this.createIndependentCompiler(parentCompiler, pkg);
    //   }
    // }

    const resolvedProvideMap = await this.createIndependentCompiler(
      parentCompiler,
      mfConfig,
    );

    await Promise.all(
      Object.keys(mfConfig.shared as Record<string, any>).map(
        async (currentShared) => {
          const sharedPath = await this.createIndependentCompiler(
            parentCompiler,
            mfConfig,
            currentShared,
            resolvedProvideMap,
          );
          typeof sharedPath === 'string' && sharedPathSet.add(sharedPath);
        },
      ),
    );

    console.log('✅ 所有独立包编译完成');
  }

  private getCustomReferencedExports() {
    try {
      const customReferencedExports = JSON.parse(
        process.env['MF_CUSTOM_REFERENCED_EXPORTS'] || '',
      );
      return customReferencedExports;
    } catch (e) {
      return {};
    }
  }

  private async createIndependentCompiler(
    parentCompiler: Compiler,
    mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
    currentShared?: string,
    resolvedProvideMap?: ResolvedProvideMap,
  ) {
    // const { name, entry, output, libraryName } = pkg;
    const outputPath = path.resolve(
      parentCompiler.context,
      this.options.outputDir,
      encodeName(currentShared || ''),
    );

    // 获取父编译器的完整配置
    const parentConfig = parentCompiler.options;

    const extraPlugin = !resolvedProvideMap
      ? new CollectSharedEntryPlugin(mfConfig)
      : new ShakeSharedPlugin(mfConfig, currentShared!, resolvedProvideMap);

    // 创建独立编译器配置，完全继承父配置
    const compilerConfig: Compiler['options'] = {
      ...parentConfig,
      // 基础配置继承
      mode: parentConfig.mode || 'development',

      // 入口配置
      // entry: path.resolve(parentCompiler.context, entry),
      // entry: 'data:application/node;base64,',
      // @ts-ignore
      entry: this.createEntry(mfConfig),

      // 输出配置
      output: {
        path: outputPath,
        // filename: output || `${name}.js`,
        // library: {
        //   type: 'umd',
        //   name: libraryName || `__${name.replace(/-/g, '_')}__`,
        // },
        clean: true,
        publicPath: parentConfig.output?.publicPath || 'auto',
      },

      // 插件继承
      plugins: [
        ...(parentConfig.plugins || []).filter(
          (plugin): plugin is WebpackPluginInstance =>
            plugin !== undefined &&
            typeof plugin !== 'string' &&
            filterPlugin(plugin as WebpackPluginInstance),
        ),
        extraPlugin,
        resolvedProvideMap
          ? // ignore default virtual entry('main')
            new DependencyReferencExportPlugin(
              mfConfig,
              ['main'],
              this.getCustomReferencedExports(),
            )
          : null,
        resolvedProvideMap
          ? new TreeshakeConsumeSharedPlugin({
              consumes: Object.keys(
                mfConfig.shared as Record<string, any>,
              ).reduce((acc, cur) => {
                if (cur !== currentShared) {
                  // @ts-ignore
                  acc[cur] = {
                    // use current host shared
                    import: false,
                  };
                }
                return acc;
              }, {}),
            })
          : null,
      ].filter(Boolean),

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
    currentShared && this.compilers.set(currentShared, compiler);

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return new Promise<any>((resolve, reject) => {
      compiler.run((err: any, stats: any) => {
        if (err || stats?.hasErrors()) {
          console.error(
            `❌ 独立包 ${currentShared} 编译失败:`,
            err || stats?.toString(),
          );
          reject(err || new Error(`独立包 ${currentShared} 编译失败`));
          return;
        }

        resolvedProvideMap &&
          console.log(
            // `✅ 独立包 ${name} 编译成功: ${path.join(outputPath, output || `${name}.js`)}`,
            `✅ 独立包 ${currentShared} 编译成功`,
          );

        if (stats) {
          resolvedProvideMap && console.log(`📊 ${currentShared} 编译统计:`);
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
