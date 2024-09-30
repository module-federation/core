import type {
  Compiler,
  WebpackPluginInstance,
  Compilation,
  Chunk,
  ResolveOptions,
} from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import FederationRuntimeModule from './FederationRuntimeModule';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import {
  getFederationGlobalScope,
  normalizeRuntimeInitOptionsWithOutShared,
  modifyEntry,
  createHash,
  normalizeToPosixPath,
} from './utils';
import fs from 'fs';
import path from 'path';
import { TEMP_DIR } from '../constant';
import EmbedFederationRuntimePlugin from './EmbedFederationRuntimePlugin';
import FederationModulesPlugin from './FederationModulesPlugin';
import HoistContainerReferences from '../HoistContainerReferencesPlugin';
import pBtoa from 'btoa';
import ContainerEntryDependency from '../ContainerEntryDependency';
import FederationRuntimeDependency from './FederationRuntimeDependency';
import ProvideSharedDependency from '../../sharing/ProvideSharedDependency';
import { ResolveAlias } from 'webpack/declarations/WebpackOptions';

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

const EmbeddedBundlerRuntimePath = require.resolve(
  '@module-federation/webpack-bundler-runtime/embedded',
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

const onceForCompler = new WeakSet();

class FederationRuntimePlugin {
  options?: moduleFederationPlugin.ModuleFederationPluginOptions;
  entryFilePath: string;
  bundlerRuntimePath: string;
  embeddedBundlerRuntimePath: string;
  embeddedEntryFilePath: string;
  federationRuntimeDependency?: FederationRuntimeDependency;
  minimalFederationRuntimeDependency?: FederationRuntimeDependency;

  constructor(options?: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options ? { ...options } : undefined;
    this.entryFilePath = '';
    this.bundlerRuntimePath = BundlerRuntimePath;
    this.federationRuntimeDependency = undefined;
    this.minimalFederationRuntimeDependency = undefined;
    this.embeddedBundlerRuntimePath = EmbeddedBundlerRuntimePath;
    this.embeddedEntryFilePath = '';
  }

  static getTemplate(
    runtimePlugins: string[],
    bundlerRuntimePath?: string,
    embeddedBundlerRuntimePath?: string,
    experiments?: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'],
    useMinimalRuntime: boolean = false,
  ) {
    const normalizedBundlerRuntimePath = normalizeToPosixPath(
      useMinimalRuntime
        ? embeddedBundlerRuntimePath || EmbeddedBundlerRuntimePath
        : bundlerRuntimePath || BundlerRuntimePath,
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
    ]);

    if (useMinimalRuntime) {
      return Template.asString([
        `import federation from '${normalizedBundlerRuntimePath}';`,
        runtimePluginTemplates,
        embedRuntimeLines,
        `if(!${federationGlobal}.instance){`,
        Template.indent([
          runtimePluginNames.length
            ? Template.asString([
                `const pluginsToAdd = [`,
                Template.indent(
                  runtimePluginNames.map(
                    (item) =>
                      `${item} ? (${item}.default || ${item})() : false,`,
                  ),
                ),
                `].filter(Boolean);`,
                `${federationGlobal}.initOptions.plugins = ${federationGlobal}.initOptions.plugins ? `,
                `${federationGlobal}.initOptions.plugins.concat(pluginsToAdd) : pluginsToAdd;`,
              ])
            : '',
        ]),
        `${federationGlobal}.instance = federation.runtime.init(${federationGlobal}.initOptions);`,
        `if(${federationGlobal}.attachShareScopeMap){`,
        Template.indent([
          `${federationGlobal}.attachShareScopeMap(${RuntimeGlobals.require})`,
        ]),
        '}',
        `if(${federationGlobal}.installInitialConsumes){`,
        Template.indent([`${federationGlobal}.installInitialConsumes()`]),
        '}',
        `}`,
      ]);
    }

    return Template.asString([
      `import federation from '${normalizedBundlerRuntimePath}';`,
      runtimePluginTemplates,
      embedRuntimeLines,
      `if(!${federationGlobal}.instance){`,
      Template.indent([
        runtimePluginNames.length
          ? Template.asString([
              `const pluginsToAdd = [`,
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
      '}',
    ]);
  }

  static getFilePath(
    containerName: string,
    runtimePlugins: string[],
    bundlerRuntimePath?: string,
    embeddedBundlerRuntimePath?: string,
    experiments?: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'],
    useMinimalRuntime: boolean = false,
  ) {
    const hash = createHash(
      `${containerName} ${FederationRuntimePlugin.getTemplate(
        runtimePlugins,
        bundlerRuntimePath,
        embeddedBundlerRuntimePath,
        experiments,
        useMinimalRuntime,
      )}`,
    );
    return path.join(TEMP_DIR, `entry.${hash}.js`);
  }

  getFilePath(useMinimalRuntime: boolean = false) {
    if (!this.options) {
      return '';
    }

    const cachedFilePath = useMinimalRuntime
      ? this.embeddedEntryFilePath
      : this.entryFilePath;
    if (cachedFilePath) {
      return cachedFilePath;
    }

    const filePath = this.options.virtualRuntimeEntry
      ? `data:text/javascript;charset=utf-8;base64,${pBtoa(
          FederationRuntimePlugin.getTemplate(
            this.options.runtimePlugins!,
            this.bundlerRuntimePath,
            this.embeddedBundlerRuntimePath,
            this.options.experiments,
            useMinimalRuntime,
          ),
        )}`
      : FederationRuntimePlugin.getFilePath(
          this.options.name!,
          this.options.runtimePlugins!,
          this.bundlerRuntimePath,
          this.embeddedBundlerRuntimePath,
          this.options.experiments,
          useMinimalRuntime,
        );

    if (useMinimalRuntime) {
      this.embeddedEntryFilePath = filePath;
    } else {
      this.entryFilePath = filePath;
    }

    return filePath;
  }

  ensureFile(useMinimalRuntime: boolean = false) {
    if (!this.options) {
      return;
    }
    const filePath = this.getFilePath(useMinimalRuntime);
    try {
      fs.readFileSync(filePath);
    } catch (err) {
      mkdirpSync(fs, TEMP_DIR);
      fs.writeFileSync(
        filePath,
        FederationRuntimePlugin.getTemplate(
          this.options.runtimePlugins!,
          this.bundlerRuntimePath,
          this.embeddedBundlerRuntimePath,
          this.options.experiments,
          useMinimalRuntime,
        ),
      );
    }
  }

  getDependency() {
    if (this.federationRuntimeDependency)
      return this.federationRuntimeDependency;
    this.federationRuntimeDependency = new FederationRuntimeDependency(
      this.getFilePath(),
    );
    return this.federationRuntimeDependency;
  }

  getMinimalDependency() {
    if (this.minimalFederationRuntimeDependency)
      return this.minimalFederationRuntimeDependency;
    this.minimalFederationRuntimeDependency = new FederationRuntimeDependency(
      this.getFilePath(true),
      true,
    );
    return this.minimalFederationRuntimeDependency;
  }

  prependEntry(compiler: Compiler) {
    if (!this.options?.virtualRuntimeEntry) {
      this.ensureFile();
    }

    const useHost = this.options?.experiments?.federationRuntime === 'use-host';

    if (useHost) {
      this.ensureFile(true);
    }

    compiler.hooks.finishMake.tapAsync(
      this.constructor.name,
      async (
        compilation: Compilation,
        callback: (err?: Error | null) => void,
      ) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const logger = compilation.getLogger('FederationRuntimePlugin');

        const addInclude = async (
          name: string | undefined,
          dependency: FederationRuntimeDependency,
          isMinimal: boolean = false,
        ) => {
          return new Promise<void>((resolve, reject) => {
            compilation.addInclude(
              compiler.context,
              dependency,
              { name },
              (err, module) => {
                if (err) {
                  logger.error(
                    `Error adding ${isMinimal ? 'minimal ' : ''}federation runtime module:`,
                    err,
                  );
                  return reject(err);
                }
                hooks.addFederationRuntimeModule.call(dependency);
                resolve();
              },
            );
          });
        };

        try {
          const promises = [];
          if (useHost) {
            for (const [name, entry] of compilation.entries) {
              if (
                !(entry.dependencies[0] instanceof ContainerEntryDependency)
              ) {
                promises.push(addInclude(name, this.getDependency()));
              }
            }
            promises.push(
              addInclude(undefined, this.getMinimalDependency(), true),
            );
          } else {
            promises.push(addInclude(undefined, this.getDependency()));
          }
          await Promise.all(promises);
          callback();
        } catch (err) {
          callback(err as Error);
        }
      },
    );

    compiler.hooks.thisCompilation.tap(
      this.constructor.name,
      (compilation: Compilation, { normalModuleFactory }) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const federationRuntimeDependency = this.getDependency();

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

    if (!this.options?.experiments?.federationRuntime) {
      const entryFilePath = this.getFilePath();
      modifyEntry({
        compiler,
        prependEntry: (entry) => {
          Object.keys(entry).forEach((entryName) => {
            const entryItem = entry[entryName];
            if (!entryItem.import) {
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
      (compilation: Compilation, { normalModuleFactory }) => {
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
    const useExperimentalRuntime = experiments?.federationRuntime;
    let runtimePath = useExperimentalRuntime
      ? EmbeddedRuntimePath
      : RuntimePath;

    if (implementation) {
      runtimePath = require.resolve(
        `@module-federation/runtime${useExperimentalRuntime ? '/embedded' : ''}`,
        { paths: [implementation] },
      );
    }

    if (useExperimentalRuntime) {
      runtimePath = runtimePath.replace('.cjs', '.esm');
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

      this.embeddedBundlerRuntimePath = require.resolve(
        '@module-federation/webpack-bundler-runtime/embedded',
        {
          paths: [this.options.implementation],
        },
      );
    }

    if (this.options?.experiments?.federationRuntime) {
      this.bundlerRuntimePath = this.bundlerRuntimePath.replace(
        '.cjs.js',
        '.esm.js',
      );

      this.embeddedBundlerRuntimePath = this.embeddedBundlerRuntimePath.replace(
        '.cjs.js',
        '.esm.js',
      );

      new EmbedFederationRuntimePlugin(this.options.experiments).apply(
        compiler,
      );

      new HoistContainerReferences(this.options.experiments).apply(compiler);

      new compiler.webpack.NormalModuleReplacementPlugin(
        /@module-federation\/runtime(?!\/embedded)/,
        (resolveData) => {
          if (/webpack-bundler-runtime/.test(resolveData.contextInfo.issuer)) {
            resolveData.request = RuntimePath.replace('cjs', 'esm');

            if (resolveData.createData) {
              resolveData.createData.request = resolveData.request;
            }
          }
        },
      ).apply(compiler);
    }
    // dont run multiple times on every apply()
    if (!onceForCompler.has(compiler)) {
      this.prependEntry(compiler);
      this.injectRuntime(compiler);
      this.setRuntimeAlias(compiler);
      onceForCompler.add(compiler);
    }
  }
}

export default FederationRuntimePlugin;
