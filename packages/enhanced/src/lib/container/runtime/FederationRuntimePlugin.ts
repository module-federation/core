import type { Compiler, sources } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import FederationRuntimeModule from './FederationRuntimeModule';
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
import HoistContainerReferencesPlugin from '../HoistContainerReferencesPlugin';

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
  externalEntryFilePath?: string;
  bundlerRuntimePath: string;

  constructor(options?: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options ? { ...options } : undefined;
    this.entryFilePath = '';
    this.externalEntryFilePath = '';
    this.bundlerRuntimePath = BundlerRuntimePath;
  }

  static getTemplate(runtimePlugins: string[], bundlerRuntimePath?: string) {
    // internal runtime plugin
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

    return Template.asString([
      //@ts-ignore
      !this.options?.lazy
        ? `import federation from '${normalizedBundlerRuntimePath}'; globalThis.runtime = federation;`
        : 'const federation = globalThis.runtime',
      runtimePluginTemplates,
      `var prevFederation = ${federationGlobal};`,
      `${federationGlobal} = {}`,
      `for(var key in federation){`,
      Template.indent([`${federationGlobal}[key] = federation[key];`]),
      '}',
      `for(var key in prevFederation){`,
      Template.indent([`${federationGlobal}[key] = prevFederation[key];`]),
      '}',
      `if(!${federationGlobal}.instance){`,
      Template.indent([
        runtimePluginNames.length
          ? Template.asString([
              `const pluginsToAdd = [`,
              Template.indent(
                runtimePluginNames.map(
                  (item) => `${item} ? ${item}() : false,`,
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
  ) {
    const hash = createHash(
      `${containerName} ${FederationRuntimePlugin.getTemplate(
        runtimePlugins,
        bundlerRuntimePath,
      )}`,
    );
    return path.join(TEMP_DIR, `entry.${hash}.js`);
  }

  getFilePath() {
    if (this.entryFilePath) {
      return this.entryFilePath;
    }
    //@ts-ignore
    if (this.options.lazy && this.externalEntryFilePath) {
      return this.externalEntryFilePath;
      //@ts-ignore
    }
    if (this.options.lazy) {
      this.externalEntryFilePath = FederationRuntimePlugin.getFilePath(
        this.options.name!,
        this.options.runtimePlugins!,
        this.bundlerRuntimePath,
      );
      return this.externalEntryFilePath;
    }

    if (!this.options) {
      return '';
    }

    this.entryFilePath = FederationRuntimePlugin.getFilePath(
      this.options.name!,
      this.options.runtimePlugins!,
      this.bundlerRuntimePath,
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
        FederationRuntimePlugin.getTemplate(
          this.options.runtimePlugins!,
          this.bundlerRuntimePath,
        ),
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
      // the instance may get the same one if the name is the same https://github.com/module-federation/core/blob/main/packages/runtime/src/index.ts#L18
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
  }
}

export default FederationRuntimePlugin;
