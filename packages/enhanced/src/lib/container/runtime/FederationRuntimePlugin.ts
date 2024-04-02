import type { Compiler, Chunk } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import FederationRuntimeModule from './FederationRuntimeModule';
import EagerRuntimeModule from '../../eager/EagerRuntimeModule';
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
import type { moduleFederationPlugin } from '@module-federation/sdk';
import HoistContainerReferences from '../HoistContainerReferencesPlugin';
import ProvideEagerModulePlugin from '../../eager/ProvideEagerModulePlugin';

type RuntimePlugin = string | { import: string; async: boolean };

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

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class FederationRuntimePlugin {
  options?: moduleFederationPlugin.ModuleFederationPluginOptions;
  entryFilePath: string;
  pluginsFilePath: string; // New path for plugins file
  asyncPluginsFilePath: string; // New path for ASYNC plugins file
  bundlerRuntimePath: string;

  constructor(options?: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options ? { ...options } : undefined;
    this.entryFilePath = '';
    this.pluginsFilePath = ''; // Initialize plugins file path
    this.asyncPluginsFilePath = ''; // Initialize plugins file path
    this.bundlerRuntimePath = BundlerRuntimePath;
  }

  static getTemplate(bundlerRuntimePath: string) {
    // internal runtime plugin
    const normalizedBundlerRuntimePath = normalizeToPosixPath(
      bundlerRuntimePath || BundlerRuntimePath,
    );
    return Template.asString([
      `import federation from '${normalizedBundlerRuntimePath}';`,
      `${federationGlobal} = {...federation,...${federationGlobal}};`,
      `if(!${federationGlobal}.instance){`,
      Template.indent([
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

  static getPluginsTemplate(runtimePlugins: RuntimePlugin[]) {
    let runtimePluginTemplates = '';
    const runtimePluginNames: string[] = [];

    if (Array.isArray(runtimePlugins)) {
      runtimePlugins.forEach((runtimePlugin, index) => {
        let plugin;
        if (typeof runtimePlugin === 'string') {
          plugin = runtimePlugin;
        } else {
          plugin = runtimePlugin.import;
          if (runtimePlugin.async) return;
        }
        const runtimePluginName = `plugin_${index}`;
        const runtimePluginPath = normalizeToPosixPath(
          path.isAbsolute(plugin) ? plugin : path.join(process.cwd(), plugin),
        );

        runtimePluginTemplates += `import ${runtimePluginName} from '${runtimePluginPath}';\n`;
        runtimePluginNames.push(runtimePluginName);
      });
    }

    return Template.asString([
      runtimePluginTemplates,
      `if(${federationGlobal}.instance){`,
      Template.indent([
        runtimePluginNames.length
          ? Template.asString([
              `${federationGlobal}.initOptions.plugins = ${federationGlobal}.initOptions.plugins ? ${federationGlobal}.initOptions.plugins.concat([`,
              Template.indent(runtimePluginNames.map((item) => `${item}(),`)),
              ']) : [',
              Template.indent(runtimePluginNames.map((item) => `${item}(),`)),
              '];',
            ])
          : '',
        `${federationGlobal}.runtime.init(${federationGlobal}.initOptions);`, //init again with plugins attached.
      ]),
      '}',
    ]);
  }
  static getAsyncPluginsTemplate(runtimePlugins: RuntimePlugin[]) {
    let runtimePluginTemplates = '';
    const runtimePluginNames: string[] = [];

    if (Array.isArray(runtimePlugins)) {
      runtimePlugins.forEach((runtimePlugin, index) => {
        let plugin;
        if (typeof runtimePlugin === 'string') {
          plugin = runtimePlugin;
        } else {
          plugin = runtimePlugin.import;
          if (!runtimePlugin.async) return;
        }
        const runtimePluginName = `async_plugin_${index}`;
        const runtimePluginPath = normalizeToPosixPath(
          path.isAbsolute(plugin) ? plugin : path.join(process.cwd(), plugin),
        );

        runtimePluginTemplates += `import ${runtimePluginName} from '${runtimePluginPath}';\n`;
        runtimePluginNames.push(runtimePluginName);
      });
    }

    return Template.asString([
      runtimePluginTemplates,
      `if(${federationGlobal}.instance){`,
      Template.indent([
        runtimePluginNames.length
          ? Template.asString([
              `${federationGlobal}.initOptions.plugins = ${federationGlobal}.initOptions.plugins ? ${federationGlobal}.initOptions.plugins.concat([`,
              Template.indent(runtimePluginNames.map((item) => `${item}(),`)),
              ']) : [',
              Template.indent(runtimePluginNames.map((item) => `${item}(),`)),
              '];',
            ])
          : '',
        `${federationGlobal}.runtime.registerPlugins(${federationGlobal}.initOptions.plugins);`, // async register plugins after eager init
      ]),
      '}',
    ]);
  }

  ensureFiles() {
    if (!this.options) {
      return;
    }

    const federationTemplate = FederationRuntimePlugin.getTemplate(
      this.bundlerRuntimePath,
    );
    const pluginsTemplate = FederationRuntimePlugin.getPluginsTemplate(
      this.options.runtimePlugins || [],
    );
    const asyncPluginsTemplate =
      FederationRuntimePlugin.getAsyncPluginsTemplate(
        this.options.runtimePlugins || [],
      );

    const federationHash = createHash(federationTemplate);
    const pluginsHash = createHash(pluginsTemplate);
    const asyncPluginsHash = createHash(asyncPluginsTemplate);

    this.entryFilePath = path.join(TEMP_DIR, `federation.${federationHash}.js`);
    this.pluginsFilePath = path.join(TEMP_DIR, `plugins.${pluginsHash}.js`);
    this.asyncPluginsFilePath = path.join(
      TEMP_DIR,
      `async.${asyncPluginsHash}.js`,
    );

    this.writeFile(this.entryFilePath, federationTemplate);
    this.writeFile(this.pluginsFilePath, pluginsTemplate);
    this.writeFile(this.asyncPluginsFilePath, asyncPluginsTemplate);
  }

  writeFile(filePath: string, content: string) {
    try {
      fs.readFileSync(filePath);
    } catch (err) {
      mkdirpSync(fs, path.dirname(filePath));
      fs.writeFileSync(filePath, content);
    }
  }

  prependEntry(compiler: Compiler) {
    this.ensureFiles();
    new ProvideEagerModulePlugin({
      provides: [
        {
          [this.entryFilePath]: {
            shareKey: this.entryFilePath,
            shareScope: undefined,
            version: false,
            eager: true,
            requiredVersion: false,
            strictVersion: undefined,
            singleton: undefined,
          },
          [this.pluginsFilePath]: {
            shareKey: this.pluginsFilePath,
            shareScope: undefined,
            version: false,
            eager: true,
            requiredVersion: false,
            strictVersion: undefined,
            singleton: undefined,
          },
          [this.asyncPluginsFilePath]: {
            shareKey: this.asyncPluginsFilePath,
            shareScope: undefined,
            version: false,
            eager: true,
            requiredVersion: false,
            strictVersion: undefined,
            singleton: undefined,
          },
        },
      ],
    }).apply(compiler);
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
      (compilation, { normalModuleFactory }) => {
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          this.constructor.name,
          (chunk, runtimeRequirements) => {
            if (runtimeRequirements.has(federationGlobal)) {
              return;
            }
            runtimeRequirements.add(RuntimeGlobals.interceptModuleExecution);
            runtimeRequirements.add(RuntimeGlobals.moduleCache);
            runtimeRequirements.add(RuntimeGlobals.compatGetDefaultExport);
            runtimeRequirements.add(federationGlobal);

            const includesEagerModules =
              compilation.chunkGraph.getChunkModulesIterableBySourceType(
                chunk,
                'eager-init',
              );
            compilation.addRuntimeModule(
              chunk,
              new FederationRuntimeModule(
                runtimeRequirements,
                name,
                initOptionsWithoutShared,
              ),
            );
            if (includesEagerModules) {
              compilation.addRuntimeModule(chunk, new EagerRuntimeModule());
            }
          },
        );
      },
    );
  }

  setRuntimeAlias(compiler: Compiler) {
    let runtimePath = RuntimePath;
    if (this.options?.implementation) {
      runtimePath = require.resolve('@module-federation/runtime', {
        paths: [this.options.implementation],
      });
    }
    if (Array.isArray(compiler.options.resolve.alias)) {
      return;
    }

    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
    };

    if (!compiler.options.resolve.alias['@module-federation/runtime$']) {
      compiler.options.resolve.alias['@module-federation/runtime$'] =
        runtimePath;
    }
    if (!compiler.options.resolve.alias['@module-federation/runtime-tools$']) {
      compiler.options.resolve.alias['@module-federation/runtime-tools$'] =
        this.options?.implementation || RuntimeToolsPath;
    }
  }

  apply(compiler: Compiler) {
    const useModuleFederationPlugin = compiler.options.plugins.find((p) => {
      if (typeof p !== 'object' || !p) {
        return false;
      }
      return p['name'] === 'ModuleFederationPlugin';
    });

    if (useModuleFederationPlugin && !this.options) {
      // @ts-ignore
      this.options = useModuleFederationPlugin._options;
    }

    const useContainerPlugin = compiler.options.plugins.find((p) => {
      if (typeof p !== 'object' || !p) {
        return false;
      }

      return p['name'] === 'ContainerPlugin';
    });

    if (useContainerPlugin && !this.options) {
      // @ts-ignore
      this.options = useContainerPlugin._options;
    }

    if (!useContainerPlugin && !useModuleFederationPlugin) {
      this.options = {
        remotes: {},
        ...this.options,
      };
    }
    if (this.options && !this.options?.name) {
      // the instance may get the same one if the name is the same https://github.com/module-federation/universe/blob/main/packages/runtime/src/index.ts#L18
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

    this.prependEntry(compiler);
    this.injectRuntime(compiler);
    this.setRuntimeAlias(compiler);

    new HoistContainerReferences().apply(compiler);
  }
}

export default FederationRuntimePlugin;
