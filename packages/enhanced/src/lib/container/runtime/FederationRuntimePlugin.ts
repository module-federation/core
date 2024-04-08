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
  bundlerRuntimePath: string;

  constructor(options?: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options ? { ...options } : undefined;
    this.entryFilePath = '';
    this.bundlerRuntimePath = BundlerRuntimePath;
  }

  static getTemplate(
    runtimePlugins: RuntimePlugin[],
    bundlerRuntimePath?: string,
  ) {
    // internal runtime plugin
    const normalizedBundlerRuntimePath = normalizeToPosixPath(
      bundlerRuntimePath || BundlerRuntimePath,
    );

    let runtimePluginTemplates = '';
    let asyncRuntimePluginTemplates = '';
    const runtimePluginNames: string[] = [];
    const asyncRuntimePluginNames: string[] = [];

    if (Array.isArray(runtimePlugins)) {
      runtimePlugins.forEach((runtimePlugin, index) => {
        let plugin;
        let async = false;
        if (typeof runtimePlugin === 'string') {
          plugin = runtimePlugin;
        } else {
          plugin = runtimePlugin.import;
          async = runtimePlugin.async;
        }
        const runtimePluginName = `plugin_${index}`;
        const runtimePluginPath = normalizeToPosixPath(
          path.isAbsolute(plugin) ? plugin : path.join(process.cwd(), plugin),
        );

        if (async) {
          asyncRuntimePluginTemplates += `const ${runtimePluginName} = import(/*webpackMode: "eager"*/'${runtimePluginPath}');\n`;
          asyncRuntimePluginNames.push(runtimePluginName);
        } else {
          runtimePluginTemplates += `import ${runtimePluginName} from '${runtimePluginPath}';\n`;
          runtimePluginNames.push(runtimePluginName);
        }
      });
    }

    return Template.asString([
      `import federation from '${normalizedBundlerRuntimePath}';`,
      runtimePluginTemplates,
      `${federationGlobal} = {...federation,...${federationGlobal}};`,
      `if(!${federationGlobal}.instance){`,
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
      Template.indent([
        asyncRuntimePluginTemplates.length
          ? Template.asString([
              'var promises = []',
              `${RuntimeGlobals.ensureChunkHandlers}.consumes(${RuntimeGlobals.runtimeId},promises)`,
              'console.log(promises);',
              'Promise.all(promises).then(()=>{',
              asyncRuntimePluginTemplates,
              `const asyncPlugins = Promise.all([${Template.indent(
                asyncRuntimePluginNames.map((item) => `${item},`),
              )}]).then(plugins => plugins.map((plugin)=>{
                if(plugin?.default) {
                  return plugin.default()
                }
                return plugin()
              }));`,
              `asyncPlugins.then((resolvedPlugins)=>{`,
              `${federationGlobal}.initOptions.plugins = ${federationGlobal}.initOptions.plugins ? ${federationGlobal}.initOptions.plugins.concat(resolvedPlugins) : resolvedPlugins;`,
              `${federationGlobal}.runtime.registerPlugins(${federationGlobal}.initOptions.plugins);`,
              `});`,
              `});`,
            ])
          : '',
      ]),
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
    new HoistContainerReferencesPlugin(this.options?.name).apply(compiler);
  }
}

export default FederationRuntimePlugin;
