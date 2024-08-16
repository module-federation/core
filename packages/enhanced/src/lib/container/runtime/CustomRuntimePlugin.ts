import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type webpack from 'webpack';
import CustomRuntimeModule from './CustomRuntimeModule';
import fs from 'fs';

const { RuntimeModule, Template, RuntimeGlobals, WebpackOptionsApply } =
  require(normalizeWebpackPath('webpack')) as typeof import('webpack');
import type { Compilation } from 'webpack';

class RuntimeModuleChunkPlugin {
  apply(compiler: webpack.Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'ModuleChunkFormatPlugin',
      (compilation: Compilation) => {
        const hooks =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation,
          );
        hooks.renderChunk.tap(
          'ModuleChunkFormatPlugin',
          (modules, renderContext) => {
            const { chunk, chunkGraph, runtimeTemplate } = renderContext;

            const source = new compiler.webpack.sources.ConcatSource();
            source.add('var federation = ');
            source.add(modules);
            source.add('\n');
            const entries = Array.from(
              chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunk),
            );
            const loadedChunks = new Set();
            let index = 0;
            for (let i = 0; i < entries.length; i++) {
              const [module, entrypoint] = entries[i];
              const final = i + 1 === entries.length;
              const moduleId = chunkGraph.getModuleId(module);
              source.add('\n');
              if (final) {
                source.add('for (var mod in federation) {\n');
                source.add(
                  `\t${RuntimeGlobals.moduleFactories}[mod] = federation[mod];\n`,
                );
                source.add('}\n');
                source.add('federation = ');
              }
              source.add(
                `${RuntimeGlobals.require}(${JSON.stringify(moduleId)});\n`,
              );
            }
            const str = source.source();
            return source;
          },
        );
      },
    );
  }
}

class CustomRuntimePlugin {
  private entryPath: string;
  private entryModule: string | number | undefined;
  private bundledCode: string | null = null;
  private inFlight: boolean = false;

  constructor(path: string) {
    this.entryPath = path;
    console.log('CUSTOM PLUGNI');
  }

  apply(compiler: webpack.Compiler): void {
    compiler.hooks.make.tapAsync(
      'CustomRuntimePlugin',
      (compilation: Compilation, callback: (err?: Error) => void) => {
        if (this.bundledCode || this.inFlight) return callback();

        const runtimeModulePath = require
          .resolve('@module-federation/webpack-bundler-runtime/vendor')
          .replace('cjs', 'esm');

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
            new RuntimeModuleChunkPlugin(),
          ],
        );

        this.inFlight = true;

        childCompiler.options.devtool = undefined;
        childCompiler.options.optimization.moduleIds = 'deterministic';
        childCompiler.options.optimization.splitChunks = false;
        childCompiler.options.optimization.removeAvailableModules = true;

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
            console.log('code built');
            this.bundledCode =
              (childCompilation?.assets[
                'custom-runtime-bundle.js'
              ]?.source() as string) || null;
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
