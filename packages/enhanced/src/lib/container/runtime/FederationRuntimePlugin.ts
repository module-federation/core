import type {
  Compiler,
  WebpackPluginInstance,
  Compilation,
  Chunk,
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
import CustomRuntimePlugin from './CustomRuntimePlugin';
import ContainerEntryModule from '../ContainerEntryModule';

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

const VendoredBundlerRuntimePath = require.resolve(
  '@module-federation/webpack-bundler-runtime/vendor',
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

class FederationRuntimePlugin {
  options?: moduleFederationPlugin.ModuleFederationPluginOptions;
  entryFilePath: string;
  bundlerRuntimePath: string;

  constructor(options?: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options ? { ...options } : undefined;
    this.entryFilePath = '';
    this.bundlerRuntimePath = this.getBundlerRuntimePath();
  }

  getBundlerRuntimePath() {
    return this.options?.embedRuntime
      ? VendoredBundlerRuntimePath
      : BundlerRuntimePath;
  }

  static getTemplate(
    runtimePlugins: string[],
    bundlerRuntimePath?: string,
    embedRuntime: boolean = false,
  ) {
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

    const embedRuntimeLines = embedRuntime
      ? '//using embedded runtime module, will not inject runtime in entry'
      : Template.asString([
          `var prevFederation = ${federationGlobal};`,
          `${federationGlobal} = {}`,
          `for(var key in federation){`,
          Template.indent([`${federationGlobal}[key] = federation[key];`]),
          '}',
          `for(var key in prevFederation){`,
          Template.indent([`${federationGlobal}[key] = prevFederation[key];`]),
          '}',
        ]);

    return Template.asString([
      embedRuntime
        ? ''
        : `import federation from '${normalizedBundlerRuntimePath}';`,
      runtimePluginTemplates,
      embedRuntimeLines,
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
    embedRuntime: boolean = false,
  ) {
    const hash = createHash(
      `${containerName} ${FederationRuntimePlugin.getTemplate(
        runtimePlugins,
        bundlerRuntimePath,
        embedRuntime,
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
      this.options.embedRuntime,
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
          this.options.embedRuntime,
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
      (compilation: Compilation, { normalModuleFactory }) => {
        const isEnabledForChunk = (chunk: Chunk): boolean => {
          const [entryModule] =
            compilation.chunkGraph.getChunkEntryModulesIterable(chunk) || [];
          return entryModule instanceof ContainerEntryModule;
        };
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
    let runtimePath = this.options?.embedRuntime
      ? EmbeddedRuntimePath
      : RuntimePath;
    if (this.options?.implementation) {
      runtimePath = require.resolve(
        `@module-federation/runtime${this.options?.embedRuntime ? '/embedded' : ''}`,
        {
          paths: [this.options.implementation],
        },
      );
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
    const useModuleFederationPlugin = compiler.options.plugins.find(
      (p: WebpackPluginInstance) => {
        if (typeof p !== 'object' || !p) {
          return false;
        }
        return p['name'] === 'ModuleFederationPlugin';
      },
    );

    if (useModuleFederationPlugin && !this.options) {
      // @ts-ignore
      this.options = useModuleFederationPlugin._options;
    }

    const useContainerPlugin = compiler.options.plugins.find(
      (p: WebpackPluginInstance) => {
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
      const runtimePath = this.options.embedRuntime
        ? '@module-federation/webpack-bundler-runtime/vendor'
        : '@module-federation/webpack-bundler-runtime';
      this.bundlerRuntimePath = require.resolve(runtimePath, {
        paths: [this.options.implementation],
      });
    }
    if (this.options?.embedRuntime) {
      new CustomRuntimePlugin(this.bundlerRuntimePath, TEMP_DIR).apply(
        compiler,
      );
    }
    this.prependEntry(compiler);
    this.injectRuntime(compiler);
    this.setRuntimeAlias(compiler);
  }
}

export default FederationRuntimePlugin;
