import fs from 'fs';
import path from 'path';
import pBtoa from 'btoa';
import type {
  Compiler,
  WebpackPluginInstance,
  Compilation,
  Chunk,
} from 'webpack';
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

const RuntimeToolsPath = require.resolve('@module-federation/runtime-tools');

const BundlerRuntimePath = require.resolve(
  '@module-federation/webpack-bundler-runtime',
  {
    paths: [RuntimeToolsPath],
  },
);
const RuntimePath = require.resolve('@module-federation/runtime', {
  paths: [RuntimeToolsPath],
});
const EmbeddedRuntimePath = require.resolve(
  '@module-federation/runtime/embedded',
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

    //if using runtime experiment, use the new include method else patch entry
    if (this.options?.experiments?.federationRuntime) {
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
          const hooks =
            FederationModulesPlugin.getCompilationHooks(compilation);
          compilation.addInclude(
            compiler.context,
            federationRuntimeDependency,
            { name: undefined },
            (err, module) => {
              if (err) {
                return callback(err);
              }
              hooks.addFederationRuntimeModule.call(
                federationRuntimeDependency,
              );
              callback();
            },
          );
        },
      );
    } else {
      const entryFilePath = this.entryFilePath;
      modifyEntry({
        compiler,
        prependEntry: (entry: Record<string, EntryDescription>) => {
          Object.keys(entry).forEach((entryName) => {
            const entryItem = entry[entryName];
            if (!entryItem.import) {
              // TODO: maybe set this variable as constant is better https://github.com/webpack/webpack/blob/main/lib/config/defaults.js#L176
              entryItem.import = ['./src'];
            }
            if (!entryItem.import.includes(entryFilePath)) {
              entryItem.import.unshift(entryFilePath);
            }
          });
        },
      });
    }
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

  setRuntimeAlias(compiler: Compiler) {
    const { experiments, implementation } = this.options || {};
    const isHoisted = experiments?.federationRuntime === 'hoisted';
    let runtimePath = isHoisted ? EmbeddedRuntimePath : RuntimePath;

    if (implementation) {
      runtimePath = require.resolve(
        `@module-federation/runtime${isHoisted ? '/embedded' : ''}`,
        { paths: [implementation] },
      );
    }

    const alias: any = compiler.options.resolve.alias || {};
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
        '@module-federation/webpack-bundler-runtime',
        {
          paths: [this.options.implementation],
        },
      );
    }

    this.entryFilePath = this.getFilePath(compiler);

    if (this.options?.experiments?.federationRuntime === 'hoisted') {
      new EmbedFederationRuntimePlugin().apply(compiler);

      new HoistContainerReferences().apply(compiler);

      new compiler.webpack.NormalModuleReplacementPlugin(
        /@module-federation\/runtime/,
        (resolveData) => {
          if (/webpack-bundler-runtime/.test(resolveData.contextInfo.issuer)) {
            resolveData.request = RuntimePath;

            if (resolveData.createData) {
              resolveData.createData.request = resolveData.request;
            }
          }
        },
      ).apply(compiler);
    }
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
