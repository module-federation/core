import fs from 'fs';
import path from 'path';
import pBtoa from 'btoa';
import type {
  Compiler,
  WebpackPluginInstance,
  Compilation,
  Chunk,
} from 'webpack';
import type Entrypoint from 'webpack/lib/Entrypoint';
import type RuntimeModule from 'webpack/lib/RuntimeModule';
import type { EntryDescription } from 'webpack/lib/Entrypoint';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { PrefetchPlugin } from '@module-federation/data-prefetch/cli';
import { moduleFederationPlugin } from '@module-federation/sdk';
import FederationRuntimeModule from './FederationRuntimeModule';
import {
  getFederationGlobalScope,
  normalizeRuntimeInitOptionsWithOutShared,
  modifyEntry,
  createHash,
  normalizeToPosixPath,
} from './utils';
import { TEMP_DIR } from '../constant';
import EmbedFederationRuntimePlugin from './EmbedFederationRuntimePlugin';
import FederationModulesPlugin from './FederationModulesPlugin';
import HoistContainerReferences from '../HoistContainerReferencesPlugin';
import FederationRuntimeDependency from './FederationRuntimeDependency';

const ModuleDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/ModuleDependency'),
) as typeof import('webpack/lib/dependencies/ModuleDependency');

const { RuntimeGlobals, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const { mkdirpSync } = require(
  normalizeWebpackPath('webpack/lib/util/fs'),
) as typeof import('webpack/lib/util/fs');

const RuntimeToolsPath = require.resolve(
  '@module-federation/runtime-tools/dist/index.esm.js',
);
const BundlerRuntimePath = require.resolve(
  '@module-federation/webpack-bundler-runtime/dist/index.esm.js',
  {
    paths: [RuntimeToolsPath],
  },
);
const RuntimePath = require.resolve(
  '@module-federation/runtime/dist/index.esm.js',
  {
    paths: [RuntimeToolsPath],
  },
);
const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

const onceForCompiler = new WeakSet<Compiler>();
const onceForCompilerEntryMap = new WeakMap<Compiler, string>();

class FederationRuntimePlugin {
  options?: moduleFederationPlugin.ModuleFederationPluginOptions;
  entryFilePath: string;
  bundlerRuntimePath: string;
  federationRuntimeDependency?: FederationRuntimeDependency; // Add this line
  private asyncEntrypointRuntimeMap = new WeakMap<Entrypoint, string>();
  private asyncEntrypointRuntimeSeed = 0;

  constructor(options?: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options ? { ...options } : undefined;
    this.entryFilePath = '';
    this.bundlerRuntimePath = BundlerRuntimePath;
    this.federationRuntimeDependency = undefined; // Initialize as undefined
  }

  static getTemplate(
    compiler: Compiler,
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
    bundlerRuntimePath?: string,
    experiments?: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'],
  ) {
    // internal runtime plugin
    const runtimePlugins = options.runtimePlugins;
    const normalizedBundlerRuntimePath = normalizeToPosixPath(
      bundlerRuntimePath || BundlerRuntimePath,
    );

    let runtimePluginTemplates = '';
    const runtimePluginNames: string[] = [];

    if (Array.isArray(runtimePlugins)) {
      runtimePlugins.forEach((runtimePlugin, index) => {
        const runtimePluginName = `plugin_${index}`;
        const runtimePluginPath = normalizeToPosixPath(
          path.isAbsolute(runtimePlugin)
            ? runtimePlugin
            : path.join(process.cwd(), runtimePlugin),
        );

        runtimePluginTemplates += `import ${runtimePluginName} from '${runtimePluginPath}';\n`;
        runtimePluginNames.push(runtimePluginName);
      });
    }
    const embedRuntimeLines = Template.asString([
      `if(!${federationGlobal}.runtime){`,
      Template.indent([
        `var prevFederation = ${federationGlobal};`,
        `${federationGlobal} = {}`,
        `for(var key in federation){`,
        Template.indent([`${federationGlobal}[key] = federation[key];`]),
        '}',
        `for(var key in prevFederation){`,
        Template.indent([`${federationGlobal}[key] = prevFederation[key];`]),
        '}',
      ]),
      '}',
    ]);

    return Template.asString([
      `import federation from '${normalizedBundlerRuntimePath}';`,
      runtimePluginTemplates,
      embedRuntimeLines,
      `if(!${federationGlobal}.instance){`,
      Template.indent([
        runtimePluginNames.length
          ? Template.asString([
              `var pluginsToAdd = [`,
              Template.indent(
                runtimePluginNames.map(
                  (item) => `${item} ? (${item}.default || ${item})() : false,`,
                ),
              ),
              `].filter(Boolean);`,
              `${federationGlobal}.initOptions.plugins = ${federationGlobal}.initOptions.plugins ? `,
              `${federationGlobal}.initOptions.plugins.concat(pluginsToAdd) : pluginsToAdd;`,
            ])
          : '',
        `${federationGlobal}.instance = ${federationGlobal}.runtime.init(${federationGlobal}.initOptions);`,
        `if(${federationGlobal}.attachShareScopeMap){`,
        Template.indent([
          `${federationGlobal}.attachShareScopeMap(${RuntimeGlobals.require})`,
        ]),
        '}',
        `if(${federationGlobal}.installInitialConsumes){`,
        Template.indent([`${federationGlobal}.installInitialConsumes()`]),
        '}',
      ]),
      PrefetchPlugin.addRuntime(compiler, {
        name: options.name!,
      }),
      '}',
    ]);
  }

  getFilePath(compiler: Compiler) {
    if (!this.options) {
      return '';
    }

    const existedFilePath = onceForCompilerEntryMap.get(compiler);

    if (existedFilePath) {
      return existedFilePath;
    }

    let entryFilePath = '';
    if (!this.options?.virtualRuntimeEntry) {
      const containerName = this.options.name;
      const hash = createHash(
        `${containerName} ${FederationRuntimePlugin.getTemplate(
          compiler,
          this.options,
          this.bundlerRuntimePath,
          this.options.experiments,
        )}`,
      );
      entryFilePath = path.join(TEMP_DIR, `entry.${hash}.js`);
    } else {
      entryFilePath = `data:text/javascript;charset=utf-8;base64,${pBtoa(
        FederationRuntimePlugin.getTemplate(
          compiler,
          this.options,
          this.bundlerRuntimePath,
          this.options.experiments,
        ),
      )}`;
    }

    onceForCompilerEntryMap.set(compiler, entryFilePath);

    return entryFilePath;
  }

  ensureFile(compiler: Compiler) {
    if (!this.options) {
      return;
    }
    // skip virtual entry
    if (this.options?.virtualRuntimeEntry) {
      return;
    }
    const filePath = this.entryFilePath;
    try {
      fs.readFileSync(filePath);
    } catch (err) {
      mkdirpSync(fs, TEMP_DIR);
      fs.writeFileSync(
        filePath,
        FederationRuntimePlugin.getTemplate(
          compiler,
          this.options,
          this.bundlerRuntimePath,
          this.options.experiments,
        ),
      );
    }
  }

  getDependency(compiler: Compiler) {
    if (this.federationRuntimeDependency)
      return this.federationRuntimeDependency;

    this.ensureFile(compiler);

    this.federationRuntimeDependency = new FederationRuntimeDependency(
      this.entryFilePath,
    );
    return this.federationRuntimeDependency;
  }

  prependEntry(compiler: Compiler) {
    if (!this.options?.virtualRuntimeEntry) {
      this.ensureFile(compiler);
    }

    compiler.hooks.thisCompilation.tap(
      this.constructor.name,
      (compilation: Compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          FederationRuntimeDependency,
          normalModuleFactory,
        );
        compilation.dependencyTemplates.set(
          FederationRuntimeDependency,
          new ModuleDependency.Template(),
        );
      },
    );
    compiler.hooks.make.tapAsync(
      this.constructor.name,
      (compilation: Compilation, callback) => {
        const federationRuntimeDependency = this.getDependency(compiler);
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        compilation.addInclude(
          compiler.context,
          federationRuntimeDependency,
          { name: undefined },
          (err, module) => {
            if (err) {
              return callback(err);
            }
            hooks.addFederationRuntimeDependency.call(
              federationRuntimeDependency,
            );
            callback();
          },
        );
      },
    );
  }

  injectRuntime(compiler: Compiler) {
    if (!this.options || !this.options.name) {
      return;
    }
    const name = this.options.name;
    const initOptionsWithoutShared = normalizeRuntimeInitOptionsWithOutShared(
      this.options,
    );
    const federationGlobal = getFederationGlobalScope(
      RuntimeGlobals || ({} as typeof RuntimeGlobals),
    );

    compiler.hooks.thisCompilation.tap(
      this.constructor.name,
      (compilation: Compilation) => {
        this.ensureAsyncEntrypointsHaveDedicatedRuntime(compiler, compilation);
        const handler = (chunk: Chunk, runtimeRequirements: Set<string>) => {
          if (runtimeRequirements.has(federationGlobal)) return;
          runtimeRequirements.add(federationGlobal);
          runtimeRequirements.add(RuntimeGlobals.interceptModuleExecution);
          runtimeRequirements.add(RuntimeGlobals.moduleCache);
          runtimeRequirements.add(RuntimeGlobals.compatGetDefaultExport);

          compilation.addRuntimeModule(
            chunk,
            new FederationRuntimeModule(
              runtimeRequirements,
              name,
              initOptionsWithoutShared,
            ),
          );
        };

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          this.constructor.name,
          (chunk: Chunk, runtimeRequirements: Set<string>) => {
            if (!chunk.hasRuntime()) return;
            if (runtimeRequirements.has(RuntimeGlobals.initializeSharing))
              return;
            if (runtimeRequirements.has(RuntimeGlobals.currentRemoteGetScope))
              return;
            if (runtimeRequirements.has(RuntimeGlobals.shareScopeMap)) return;
            if (runtimeRequirements.has(federationGlobal)) return;
            handler(chunk, runtimeRequirements);
          },
        );

        // if federation runtime requirements exist
        // attach runtime module to the chunk
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.initializeSharing)
          .tap(this.constructor.name, handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.currentRemoteGetScope)
          .tap(this.constructor.name, handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.shareScopeMap)
          .tap(this.constructor.name, handler);
        compilation.hooks.runtimeRequirementInTree
          .for(federationGlobal)
          .tap(this.constructor.name, handler);
      },
    );
  }

  private ensureAsyncEntrypointsHaveDedicatedRuntime(
    compiler: Compiler,
    compilation: Compilation,
  ) {
    compilation.hooks.optimizeChunks.tap(
      {
        name: this.constructor.name,
        stage: 10,
      },
      () => {
        const runtimeChunkUsage = new Map<Chunk, number>();

        for (const [, entrypoint] of compilation.entrypoints) {
          const runtimeChunk = entrypoint.getRuntimeChunk();
          if (runtimeChunk) {
            runtimeChunkUsage.set(
              runtimeChunk,
              (runtimeChunkUsage.get(runtimeChunk) || 0) + 1,
            );
          }
        }

        let hasSharedRuntime = false;
        for (const usage of runtimeChunkUsage.values()) {
          if (usage > 1) {
            hasSharedRuntime = true;
            break;
          }
        }

        for (const [name, entrypoint] of compilation.entrypoints) {
          if (entrypoint.isInitial()) continue;

          const entryChunk = entrypoint.getEntrypointChunk();
          if (!entryChunk) continue;

          const originalRuntimeChunk = entrypoint.getRuntimeChunk();
          if (!originalRuntimeChunk) {
            continue;
          }

          if (hasSharedRuntime && originalRuntimeChunk !== entryChunk) {
            const runtimeReferences =
              runtimeChunkUsage.get(originalRuntimeChunk) || 0;
            if (runtimeReferences > 1) {
              const runtimeName = this.getAsyncEntrypointRuntimeName(
                name,
                entrypoint,
                entryChunk,
              );
              entrypoint.setRuntimeChunk(entryChunk);
              entrypoint.options.runtime = runtimeName;
              entryChunk.runtime = runtimeName;

              const chunkGraph = compilation.chunkGraph;
              if (chunkGraph) {
                const chunkRuntimeRequirements =
                  chunkGraph.getChunkRuntimeRequirements(originalRuntimeChunk);
                if (chunkRuntimeRequirements.size) {
                  chunkGraph.addChunkRuntimeRequirements(
                    entryChunk,
                    new Set(chunkRuntimeRequirements),
                  );
                }

                const treeRuntimeRequirements =
                  chunkGraph.getTreeRuntimeRequirements(originalRuntimeChunk);
                if (treeRuntimeRequirements.size) {
                  chunkGraph.addTreeRuntimeRequirements(
                    entryChunk,
                    treeRuntimeRequirements,
                  );
                }

                for (const module of chunkGraph.getChunkModulesIterable(
                  originalRuntimeChunk,
                )) {
                  if (!chunkGraph.isModuleInChunk(module, entryChunk)) {
                    chunkGraph.connectChunkAndModule(entryChunk, module);
                  }
                }

                const runtimeModules = Array.from(
                  chunkGraph.getChunkRuntimeModulesIterable(
                    originalRuntimeChunk,
                  ) as Iterable<RuntimeModule>,
                );
                for (const runtimeModule of runtimeModules) {
                  chunkGraph.connectChunkAndRuntimeModule(
                    entryChunk,
                    runtimeModule,
                  );
                }
              }
            }
          }

          const activeRuntimeChunk = entrypoint.getRuntimeChunk();
          if (activeRuntimeChunk && activeRuntimeChunk !== entryChunk) {
            this.relocateRemoteRuntimeModules(
              compilation,
              entryChunk,
              activeRuntimeChunk,
            );
          }
        }
      },
    );
  }

  private getAsyncEntrypointRuntimeName(
    name: string | undefined,
    entrypoint: Entrypoint,
    entryChunk: Chunk,
  ): string {
    const existing = this.asyncEntrypointRuntimeMap.get(entrypoint);
    if (existing) return existing;

    const chunkName = entryChunk.name;
    if (chunkName) {
      this.asyncEntrypointRuntimeMap.set(entrypoint, chunkName);
      return chunkName;
    }

    const baseName = name || entrypoint.options?.name || 'async-entry';
    const sanitized = baseName.replace(/[^a-z0-9_\-]/gi, '-');
    const prefix = sanitized.length ? sanitized : 'async-entry';
    const identifier =
      entryChunk.id ??
      (entryChunk as any).debugId ??
      ((entryChunk as any).ids && (entryChunk as any).ids[0]);

    let suffix: string | number | undefined = identifier;
    if (typeof suffix === 'string') {
      suffix = suffix.replace(/[^a-z0-9_\-]/gi, '-');
    }

    if (suffix === undefined) {
      const fallbackSource = `${prefix}-${entrypoint.options?.runtime ?? ''}-${entryChunk.runtime ?? ''}`;
      suffix = createHash(fallbackSource).slice(0, 8);
    }

    const uniqueName = `${prefix}-runtime-${suffix}`;
    this.asyncEntrypointRuntimeMap.set(entrypoint, uniqueName);
    return uniqueName;
  }

  private relocateRemoteRuntimeModules(
    compilation: Compilation,
    sourceChunk: Chunk,
    targetChunk: Chunk,
  ) {
    const { chunkGraph } = compilation;
    if (!chunkGraph) {
      return;
    }

    const runtimeModules = Array.from(
      (chunkGraph.getChunkRuntimeModulesIterable(sourceChunk) ||
        []) as Iterable<RuntimeModule>,
    );

    const remoteRuntimeModules = runtimeModules.filter((runtimeModule) => {
      const ctorName = runtimeModule.constructor?.name;
      return ctorName && ctorName.includes('RemoteRuntimeModule');
    });

    if (!remoteRuntimeModules.length) {
      return;
    }

    for (const runtimeModule of remoteRuntimeModules) {
      chunkGraph.connectChunkAndRuntimeModule(targetChunk, runtimeModule);
      chunkGraph.disconnectChunkAndRuntimeModule(sourceChunk, runtimeModule);
    }

    const chunkRuntimeRequirements =
      chunkGraph.getChunkRuntimeRequirements(sourceChunk);
    if (chunkRuntimeRequirements.size) {
      chunkGraph.addChunkRuntimeRequirements(
        targetChunk,
        new Set(chunkRuntimeRequirements),
      );
    }

    const treeRuntimeRequirements =
      chunkGraph.getTreeRuntimeRequirements(sourceChunk);
    if (treeRuntimeRequirements.size) {
      chunkGraph.addTreeRuntimeRequirements(
        targetChunk,
        treeRuntimeRequirements,
      );
    }
  }

  getRuntimeAlias(compiler: Compiler) {
    const { implementation } = this.options || {};
    let runtimePath = RuntimePath;
    const alias: any = compiler.options.resolve.alias || {};

    if (alias['@module-federation/runtime$']) {
      runtimePath = alias['@module-federation/runtime$'];
    } else {
      if (implementation) {
        runtimePath = require.resolve(
          `@module-federation/runtime/dist/index.esm.js`,
          {
            paths: [implementation],
          },
        );
      }
    }

    return runtimePath;
  }

  setRuntimeAlias(compiler: Compiler) {
    const { implementation } = this.options || {};
    const alias: any = compiler.options.resolve.alias || {};
    const runtimePath = this.getRuntimeAlias(compiler);
    alias['@module-federation/runtime$'] =
      alias['@module-federation/runtime$'] || runtimePath;
    alias['@module-federation/runtime-tools$'] =
      alias['@module-federation/runtime-tools$'] ||
      implementation ||
      RuntimeToolsPath;

    // Set up aliases for the federation runtime and tools
    // This ensures that the correct versions are used throughout the project
    compiler.options.resolve.alias = alias;
  }

  apply(compiler: Compiler) {
    const useModuleFederationPlugin = compiler.options.plugins.find(
      (p): p is WebpackPluginInstance & { _options?: any } => {
        if (typeof p !== 'object' || !p) {
          return false;
        }
        return p['name'] === 'ModuleFederationPlugin';
      },
    );

    if (useModuleFederationPlugin && !this.options) {
      this.options = useModuleFederationPlugin._options;
    }

    const useContainerPlugin = compiler.options.plugins.find(
      (p): p is WebpackPluginInstance & { _options?: any } => {
        if (typeof p !== 'object' || !p) {
          return false;
        }

        return p['name'] === 'ContainerPlugin';
      },
    );

    if (useContainerPlugin && !this.options) {
      this.options = useContainerPlugin._options;
    }

    if (!useContainerPlugin && !useModuleFederationPlugin) {
      this.options = {
        remotes: {},
        ...this.options,
      };
    }
    if (this.options && !this.options?.name) {
      //! the instance may get the same one if the name is the same https://github.com/module-federation/core/blob/main/packages/runtime/src/index.ts#L18
      this.options.name =
        compiler.options.output.uniqueName || `container_${Date.now()}`;
    }

    if (this.options?.implementation) {
      this.bundlerRuntimePath = require.resolve(
        '@module-federation/webpack-bundler-runtime/dist/index.esm.js',
        {
          paths: [this.options.implementation],
        },
      );
    }

    this.entryFilePath = this.getFilePath(compiler);

    new EmbedFederationRuntimePlugin().apply(compiler);

    new HoistContainerReferences().apply(compiler);

    // dont run multiple times on every apply()
    if (!onceForCompiler.has(compiler)) {
      this.prependEntry(compiler);
      this.injectRuntime(compiler);
      this.setRuntimeAlias(compiler);
      onceForCompiler.add(compiler);
    }
  }
}

export default FederationRuntimePlugin;
