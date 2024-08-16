import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type webpack from 'webpack';
import CustomRuntimeModule from './CustomRuntimeModule';
import fs from 'fs';

const { RuntimeModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
import type { Compilation } from 'webpack';

const ModuleDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/ModuleDependency'),
) as typeof import('webpack/lib/dependencies/ModuleDependency');
const WebpackError = require(
  normalizeWebpackPath('webpack/lib/WebpackError'),
) as typeof import('webpack/lib/WebpackError');

class CustomRuntimePlugin {
  private entryPath: string;
  private entryModule: string | number | undefined;
  private bundledCode: string | null = null;
  private inFlight: boolean = false;

  constructor(path: string) {
    this.entryPath = path;
  }

  apply(compiler: webpack.Compiler): void {
    compiler.options.plugins = [];

    compiler.hooks.make.tapAsync(
      'CustomRuntimePlugin',
      (compilation: Compilation, callback: (err?: Error) => void) => {
        if (this.bundledCode) return callback();

        const runtimeModulePath = require
          .resolve('@module-federation/webpack-bundler-runtime/vendor')
          .replace('cjs', 'esm');

        const runtimeModuleContent = fs.readFileSync(
          runtimeModulePath,
          'utf-8',
        );
        const runtimeModuleDataURI = `data:text/javascript;base64,${Buffer.from(runtimeModuleContent).toString('base64')}`;

        const childCompiler = compiler.createChildCompiler(
          compiler.createCompilation(),
          'CustomRuntimePluginCompiler',
          0,
          {
            filename: '[name].js',
            library: {
              type: 'var',
              name: 'federation',
              export: 'default',
            },
          },
          [
            new compiler.webpack.EntryPlugin(
              compiler.context,
              runtimeModulePath,
              {
                name: 'custom-runtime-bundle',
                runtime: 'other',
              },
            ),
            new compiler.webpack.library.EnableLibraryPlugin('var'),
          ],
        );

        childCompiler.options.devtool = undefined;
        childCompiler.options.optimization.moduleIds = 'deterministic';

        console.log('create child compiler for', runtimeModulePath);

        childCompiler.runAsChild(
          (
            err?: Error | null,
            entries?: webpack.Chunk[],
            childCompilation?: webpack.Compilation,
          ) => {
            if (err) return callback(err);
            if (childCompilation && childCompilation.errors.length > 0) {
              return callback(childCompilation.errors[0]);
            }

            const injectChunk =
              childCompilation?.assets['custom-runtime-bundle.js'];
            const entry = childCompilation?.entrypoints.get(
              'custom-runtime-bundle',
            );
            const entryChunk = entry?.getEntrypointChunk();

            if (entryChunk) {
              const entryModule =
                childCompilation?.chunkGraph.getChunkEntryModulesIterable(
                  entryChunk,
                );
              if (entryModule) {
                const modu = Array.from(entryModule)[0];
                this.entryModule =
                  childCompilation?.chunkGraph.getModuleId(modu);
              }
            }

            this.bundledCode = childCompilation?.assets[
              'custom-runtime-bundle.js'
            ].source() as string;
            callback();
          },
        );
      },
    );

    compiler.hooks.thisCompilation.tap(
      'CustomRuntimePlugin',
      (compilation: webpack.Compilation) => {
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'CustomRuntimePlugin',
          (chunk: webpack.Chunk, set: Set<string>) => {
            if (set.has('embeddedFederationRuntime')) return;
            if (!set.has(`${RuntimeGlobals.require}.federation`)) return;

            if (
              this.bundledCode &&
              set.has(`${RuntimeGlobals.require}.federation`)
            ) {
              set.add('embeddedFederationRuntime');
              const runtimeModule = new CustomRuntimeModule(
                this.bundledCode,
                this.entryModule,
              );
              compilation.addRuntimeModule(chunk, runtimeModule);
            }
          },
        );
      },
    );
  }
}

export default CustomRuntimePlugin;
