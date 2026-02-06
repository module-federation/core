import fs from 'fs';
import path from 'path';
import pBtoa from 'btoa';
import type {
  Compiler,
  WebpackPluginInstance,
  Compilation,
  Chunk,
} from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { PrefetchPlugin } from '@module-federation/data-prefetch/cli';
import { moduleFederationPlugin } from '@module-federation/sdk';
import FederationRuntimeModule from './FederationRuntimeModule';
import {
  getFederationGlobalScope,
  normalizeRuntimeInitOptionsWithOutShared,
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

function resolveModule(
  candidates: string[],
  options?: NodeJS.RequireResolveOptions,
): string {
  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return require.resolve(candidate, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw (
    lastError ??
    new Error(`Unable to resolve any module from: ${candidates.join(', ')}`)
  );
}

const RuntimeToolsPath = resolveModule([
  '@module-federation/runtime-tools/dist/index.esm.js',
  '@module-federation/runtime-tools/dist/index.js',
  '@module-federation/runtime-tools/dist/index.cjs.cjs',
  '@module-federation/runtime-tools',
]);
const BundlerRuntimePath = resolveModule(
  [
    '@module-federation/webpack-bundler-runtime/dist/index.esm.js',
    '@module-federation/webpack-bundler-runtime/dist/index.js',
    '@module-federation/webpack-bundler-runtime/dist/index.cjs.cjs',
    '@module-federation/webpack-bundler-runtime',
  ],
  {
    paths: [RuntimeToolsPath],
  },
);
const RuntimePath = resolveModule(
  [
    '@module-federation/runtime/dist/index.esm.js',
    '@module-federation/runtime/dist/index.js',
    '@module-federation/runtime/dist/index.cjs.cjs',
    '@module-federation/runtime',
  ],
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
  ) {
    // internal runtime plugin
    const runtimePlugins = options.runtimePlugins;
    const normalizedBundlerRuntimePath = normalizeToPosixPath(
      bundlerRuntimePath || BundlerRuntimePath,
    );

    let runtimePluginTemplates = '';
    const runtimePluginCalls: string[] = [];

    if (Array.isArray(runtimePlugins)) {
      runtimePlugins.forEach((runtimePlugin, index) => {
        if (!runtimePlugin) {
          return;
        }
        const runtimePluginName = `plugin_${index}`;
        const runtimePluginEntry = Array.isArray(runtimePlugin)
          ? runtimePlugin[0]
          : runtimePlugin;
        const runtimePluginPath = normalizeToPosixPath(
          path.isAbsolute(runtimePluginEntry)
            ? runtimePluginEntry
            : path.join(process.cwd(), runtimePluginEntry),
        );
        const paramsStr =
          Array.isArray(runtimePlugin) && runtimePlugin.length > 1
            ? JSON.stringify(runtimePlugin[1])
            : 'undefined';
        runtimePluginTemplates += `import ${runtimePluginName} from '${runtimePluginPath}';\n`;
        runtimePluginCalls.push(
          `${runtimePluginName} ? (${runtimePluginName}.default || ${runtimePluginName})(${paramsStr}) : false`,
        );
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
        runtimePluginCalls.length
          ? Template.asString([
              `var pluginsToAdd = [`,
              Template.indent(
                Template.indent(runtimePluginCalls.map((call) => `${call},`)),
              ),
              `].filter(Boolean);`,
              `${federationGlobal}.initOptions.plugins = ${federationGlobal}.initOptions.plugins ? `,
              `${federationGlobal}.initOptions.plugins.concat(pluginsToAdd) : pluginsToAdd;`,
            ])
          : '',
        // `${federationGlobal}.instance = ${federationGlobal}.runtime.init(${federationGlobal}.initOptions);`,
        `${federationGlobal}.instance = ${federationGlobal}.bundlerRuntime.init({webpackRequire:${RuntimeGlobals.require}});`,
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
        )}`,
      );
      entryFilePath = path.join(TEMP_DIR, `entry.${hash}.js`);
    } else {
      entryFilePath = `data:text/javascript;charset=utf-8;base64,${pBtoa(
        FederationRuntimePlugin.getTemplate(
          compiler,
          this.options,
          this.bundlerRuntimePath,
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
    const outputFs = (compiler as unknown as { outputFileSystem?: unknown })
      .outputFileSystem;
    const fsLike =
      outputFs &&
      typeof (outputFs as typeof fs).readFileSync === 'function' &&
      typeof (outputFs as typeof fs).writeFileSync === 'function'
        ? (outputFs as typeof fs)
        : fs;
    try {
      fsLike.readFileSync(filePath);
    } catch (err) {
      mkdirpSync(fsLike as any, TEMP_DIR);
      fsLike.writeFileSync(
        filePath,
        FederationRuntimePlugin.getTemplate(
          compiler,
          this.options,
          this.bundlerRuntimePath,
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
    const useSharedContainerPlugin = compiler.options.plugins.find(
      (p): p is WebpackPluginInstance & { _options?: any } => {
        if (typeof p !== 'object' || !p) {
          return false;
        }
        return p['name'] === 'SharedContainerPlugin';
      },
    );
    // share container plugin should not inject mf runtime
    if (useSharedContainerPlugin) {
      return;
    }
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
      this.bundlerRuntimePath = resolveModule(
        [
          '@module-federation/webpack-bundler-runtime/dist/index.esm.js',
          '@module-federation/webpack-bundler-runtime/dist/index.js',
          '@module-federation/webpack-bundler-runtime/dist/index.cjs.cjs',
          '@module-federation/webpack-bundler-runtime',
        ],
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
