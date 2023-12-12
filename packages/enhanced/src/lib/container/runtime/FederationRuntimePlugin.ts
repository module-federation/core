import type { Compiler, sources } from 'webpack';
import { Template } from 'webpack';
import RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import FederationRuntimeModule from './FederationRuntimeModule';
import {
  getFederationGlobalScope,
  normalizeRuntimeInitOptionsWithOutShared,
  modifyEntry,
  createHash,
} from './utils';
import { mkdirpSync } from 'webpack/lib/util/fs';
import fs from 'fs';
import path from 'path';
import { TEMP_DIR } from '../constant';
import type { ModuleFederationPluginOptions } from '../../../declarations/plugins/container/ModuleFederationPlugin';

const BundlerRuntimePath = require.resolve(
  '@module-federation/webpack-bundler-runtime',
);
const RuntimePath = require.resolve('@module-federation/runtime', {
  paths: [BundlerRuntimePath],
});
const InitializeRemoteEntryRuntimePluginPath = require.resolve(
  './InitializeRemoteEntryRuntimePlugin',
);

const DEFAULT_REMOTE_ENTRY = 'remoteEntry.js';

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class FederationRuntimePlugin {
  options?: ModuleFederationPluginOptions;
  entryFilePath: string;

  constructor(options?: ModuleFederationPluginOptions) {
    this.options = options;
    this.entryFilePath = '';
  }

  static getTemplate(runtimePlugins: string[]) {
    // internal runtime plugin
    const internalRuntimePlugin = `import initializeRemoteEntryRuntimePlugin from '${InitializeRemoteEntryRuntimePluginPath}';\n`;
    const internalRuntimePluginName = 'initializeRemoteEntryRuntimePlugin';
    let runtimePluginTemplates = '';
    const runtimePLuginNames: string[] = [];

    if (Array.isArray(runtimePlugins)) {
      runtimePlugins.forEach((runtimePlugin, index) => {
        const runtimePluginName = `plugin_${index}`;
        const runtimePluginPath = path.isAbsolute(runtimePlugin)
          ? runtimePlugin
          : path.join(process.cwd(), runtimePlugin);

        runtimePluginTemplates += `import ${runtimePluginName} from '${runtimePluginPath}';\n`;
        runtimePLuginNames.push(runtimePluginName);
      });
    }
    runtimePluginTemplates += internalRuntimePlugin;
    runtimePLuginNames.push(internalRuntimePluginName);

    return Template.asString([
      `import federation from '${BundlerRuntimePath}';`,
      runtimePluginTemplates,
      `${federationGlobal} = {...federation,...${federationGlobal}};`,
      runtimePLuginNames.length
        ? Template.asString([
            `${federationGlobal}.initOptions.plugins = ([`,
            Template.indent(runtimePLuginNames.map((item) => `${item}(),`)),
            '])',
          ])
        : '',
      `${federationGlobal}.instance = ${federationGlobal}.runtime.init(${federationGlobal}.initOptions);`,
      `if(${federationGlobal}.installInitialConsumes){`,
      Template.indent([`${federationGlobal}.installInitialConsumes()`]),
      '}',
    ]);
  }

  static getFilePath(containerName: string, runtimePlugins: string[]) {
    const hash = createHash(
      `${containerName} ${FederationRuntimePlugin.getTemplate(runtimePlugins)}`,
    );
    return path.join(TEMP_DIR, `entry.${hash}.js`);
  }

  getFilePath() {
    if (this.entryFilePath) {
      return this.entryFilePath;
    }

    if (!this.options) {
      return '';
    }

    this.entryFilePath = FederationRuntimePlugin.getFilePath(
      this.options.name!,
      this.options.runtimePlugins!,
    );
    return this.entryFilePath;
  }

  ensureFile() {
    if (!this.options) {
      return;
    }
    const filePath = this.getFilePath();
    try {
      fs.readFileSync(filePath);
    } catch (err) {
      mkdirpSync(fs, TEMP_DIR);
      fs.writeFileSync(
        filePath,
        FederationRuntimePlugin.getTemplate(this.options.runtimePlugins!),
      );
    }
  }

  prependEntry(compiler: Compiler) {
    this.ensureFile();
    const entryFilePath = this.getFilePath();

    modifyEntry({
      compiler,
      prependEntry: (entry) => {
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

  injectRuntime(compiler: Compiler) {
    if (!this.options || !this.options.name) {
      return;
    }
    const name = this.options.name;
    const initOptionsWithoutShared = normalizeRuntimeInitOptionsWithOutShared(
      this.options,
    );
    const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

    compiler.hooks.thisCompilation.tap(
      this.constructor.name,
      (compilation, { normalModuleFactory }) => {
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          this.constructor.name,
          // Setup react-refresh globals with a Webpack runtime module
          (chunk, runtimeRequirements) => {
            if (runtimeRequirements.has(federationGlobal)) {
              return;
            }
            runtimeRequirements.add(RuntimeGlobals.interceptModuleExecution);
            runtimeRequirements.add(RuntimeGlobals.moduleCache);
            runtimeRequirements.add(RuntimeGlobals.compatGetDefaultExport);
            runtimeRequirements.add(RuntimeGlobals.global);
            runtimeRequirements.add(federationGlobal);
            compilation.addRuntimeModule(
              chunk,
              new FederationRuntimeModule(
                runtimeRequirements,
                name,
                initOptionsWithoutShared,
              ),
            );
          },
        );
      },
    );
  }

  // merge runtime chunk into container
  mergeContainerRuntime(compiler: Compiler) {
    if (!this.options) {
      return;
    }

    const { name, filename } = this.options;
    if (!name || !filename) {
      return;
    }

    let enableRuntimeChunk = false;

    if (compiler.options.optimization) {
      switch (typeof compiler.options.optimization.runtimeChunk) {
        case 'boolean':
          enableRuntimeChunk = compiler.options.optimization.runtimeChunk;
          break;
        case 'object':
          enableRuntimeChunk = true;
          break;
        default:
          enableRuntimeChunk = false;
          break;
      }
    }

    // merge runtime into container
    if (enableRuntimeChunk) {
      compiler.hooks.emit.tap(
        'EnableSingleRunTimeForFederationPlugin',
        (compilation) => {
          const { assets } = compilation;
          const entryPoint = compilation.entrypoints.get(name);
          if (!entryPoint) {
            return;
          }

          const runtimeChunk = entryPoint.getRuntimeChunk();
          if (!runtimeChunk) {
            return;
          }
          const runtimeAssets: sources.Source[] = [];
          runtimeChunk.files.forEach((fileName) => {
            runtimeAssets.push(assets[fileName]);
          });
          const remoteEntry = assets[filename || DEFAULT_REMOTE_ENTRY];
          const mergedSource = new compiler.webpack.sources.ConcatSource(
            ...runtimeAssets,
            remoteEntry,
          );
          assets[filename || DEFAULT_REMOTE_ENTRY] = mergedSource;
        },
      );
    }
  }

  setRuntimeAlias(compiler: Compiler) {
    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
      '@module-federation/runtime$': RuntimePath,
    };
  }

  apply(compiler: Compiler) {
    const useModuleFederationPlugin = compiler.options.plugins.find((p) => {
      if (typeof p !== 'object' || !p) {
        return false;
      }
      return (
        p['name'] === 'ModuleFederationPlugin' ||
        p.constructor.name === 'ModuleFederationPlugin'
      );
    });

    if (useModuleFederationPlugin && !this.options) {
      // @ts-ignore
      this.options = useModuleFederationPlugin._options;
    }

    const useContainerPlugin = compiler.options.plugins.find((p) => {
      if (typeof p !== 'object' || !p) {
        return false;
      }

      return (
        p['name'] === 'ContainerPlugin' ||
        p.constructor.name === 'ContainerPlugin'
      );
    });

    if (useContainerPlugin && !this.options) {
      // @ts-ignore
      this.options = useContainerPlugin._options;
    }

    if (!useContainerPlugin && !useModuleFederationPlugin) {
      this.options = {
        ...this.options,
        name: compiler.options.output.uniqueName || 'container',
        remotes: {},
      };
    }

    this.prependEntry(compiler);
    this.injectRuntime(compiler);
    this.setRuntimeAlias(compiler);
  }
}

export default FederationRuntimePlugin;
