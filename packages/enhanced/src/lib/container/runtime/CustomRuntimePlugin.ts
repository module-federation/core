import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import CustomRuntimeModule from './CustomRuntimeModule';
const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
import type { Compiler, Compilation, Chunk, Module, ChunkGraph } from 'webpack';
import { getFederationGlobalScope } from './utils';
import fs from 'fs';
import path from 'path';

const onceForCompilationMap = new WeakMap();
const federationGlobal = getFederationGlobalScope(RuntimeGlobals);
import { ConcatSource } from 'webpack-sources';

class RuntimeModuleChunkPlugin {
  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'ModuleChunkFormatPlugin',
      (compilation: Compilation) => {
        compilation.hooks.optimizeModuleIds.tap(
          'ModuleChunkFormatPlugin',
          (modules: Iterable<Module>) => {
            for (const module of modules) {
              const moduleId = compilation.chunkGraph.getModuleId(module);
              if (typeof moduleId === 'string') {
                compilation.chunkGraph.setModuleId(
                  module,
                  `(embed)${moduleId}`,
                );
              } else {
                compilation.chunkGraph.setModuleId(module, `1000${moduleId}`);
              }
            }
          },
        );

        const hooks =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation,
          );

        hooks.renderChunk.tap(
          'ModuleChunkFormatPlugin',
          (
            modules: any,
            renderContext: { chunk: Chunk; chunkGraph: ChunkGraph },
          ) => {
            const { chunk, chunkGraph } = renderContext;

            const source = new ConcatSource();
            source.add('var federation = ');
            source.add(modules);
            source.add('\n');
            const entries = Array.from(
              chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunk),
            );
            for (let i = 0; i < entries.length; i++) {
              const [module, entrypoint] = entries[i];
              const final = i + 1 === entries.length;
              const moduleId = chunkGraph.getModuleId(module);
              source.add('\n');
              if (final) {
                source.add('for (var mod in federation) {\n');
                source.add(
                  `${RuntimeGlobals.moduleFactories}[mod] = federation[mod];\n`,
                );
                source.add('}\n');
                source.add('federation = ');
              }
              source.add(
                `${RuntimeGlobals.require}(${typeof moduleId === 'number' ? moduleId : JSON.stringify(moduleId)});\n`,
              );
            }
            return source;
          },
        );
      },
    );
  }
}

class CustomRuntimePlugin {
  private entryModule?: string | number;
  private bundlerRuntimePath: string;
  private tempDir: string;

  constructor(path: string, tempDir: string) {
    this.bundlerRuntimePath = path.replace('cjs', 'esm');
    this.tempDir = tempDir;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.make.tapAsync(
      'CustomRuntimePlugin',
      (compilation: Compilation, callback: (err?: Error) => void) => {
        const target = compilation.options.target || 'default';
        const outputPath = path.join(
          this.tempDir,
          `${target}-custom-runtime-bundle.js`,
        );

        if (fs.existsSync(outputPath)) {
          const source = fs.readFileSync(outputPath, 'utf-8');
          onceForCompilationMap.set(compiler, source);
          return callback();
        }

        if (onceForCompilationMap.has(compiler)) return callback();
        onceForCompilationMap.set(compiler, null);

        const childCompiler = compilation.createChildCompiler(
          'EmbedFederationRuntimeCompiler',
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
              this.bundlerRuntimePath,
              {
                name: 'custom-runtime-bundle',
                runtime: 'other',
              },
            ),
            new compiler.webpack.library.EnableLibraryPlugin('var'),
            new RuntimeModuleChunkPlugin(),
          ],
        );

        childCompiler.context = compiler.context;
        childCompiler.options.devtool = undefined;
        childCompiler.options.optimization.splitChunks = false;
        childCompiler.options.optimization.removeAvailableModules = true;
        console.log('Creating child compiler for', this.bundlerRuntimePath);

        childCompiler.hooks.thisCompilation.tap(
          this.constructor.name,
          (childCompilation) => {
            childCompilation.hooks.processAssets.tap(
              this.constructor.name,
              () => {
                const source =
                  childCompilation.assets['custom-runtime-bundle.js'] &&
                  (childCompilation.assets[
                    'custom-runtime-bundle.js'
                  ].source() as string);

                const entry = childCompilation.entrypoints.get(
                  'custom-runtime-bundle',
                );
                const entryChunk = entry?.getEntrypointChunk();

                if (entryChunk) {
                  const entryModule = Array.from(
                    childCompilation.chunkGraph.getChunkEntryModulesIterable(
                      entryChunk,
                    ),
                  )[0];
                  this.entryModule =
                    childCompilation.chunkGraph.getModuleId(entryModule);
                }

                onceForCompilationMap.set(compiler, source);
                fs.writeFileSync(outputPath, source);
                console.log('got compilation asset');
                // Remove all chunk assets
                childCompilation.chunks.forEach((chunk) => {
                  chunk.files.forEach((file) => {
                    childCompilation.deleteAsset(file);
                  });
                });
              },
            );
          },
        );
        childCompiler.runAsChild(
          (
            err?: Error | null,
            entries?: Chunk[],
            childCompilation?: Compilation,
          ) => {
            if (err) {
              return callback(err);
            }

            if (!childCompilation) {
              console.warn(
                'Embed Federation Runtime: Child compilation is undefined',
              );
              return callback();
            }

            if (childCompilation.errors.length) {
              return callback(childCompilation.errors[0]);
            }

            console.log('Code built successfully');

            callback();
          },
        );
      },
    );

    compiler.hooks.thisCompilation.tap(
      'CustomRuntimePlugin',
      (compilation: Compilation) => {
        const handler = (chunk: Chunk, runtimeRequirements: Set<string>) => {
          if (chunk.id === 'build time chunk') {
            return;
          }
          if (runtimeRequirements.has('embeddedFederationRuntime')) return;
          if (!runtimeRequirements.has(federationGlobal)) {
            return;
          }
          const bundledCode = onceForCompilationMap.get(compiler);
          if (!bundledCode) return;
          runtimeRequirements.add('embeddedFederationRuntime');
          const runtimeModule = new CustomRuntimeModule(
            bundledCode,
            this.entryModule,
          );

          compilation.addRuntimeModule(chunk, runtimeModule);
          console.log(`Custom runtime module added to chunk: ${chunk.name}`);
        };
        compilation.hooks.runtimeRequirementInTree
          .for(federationGlobal)
          .tap('CustomRuntimePlugin', handler);
      },
    );
  }
}

export default CustomRuntimePlugin;
