import type { Compiler, Chunk } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import FederationRuntimeModule from './FederationRuntimeModule';
import FederationInitModule from './FederationInitModule';
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
import type { ModuleFederationPluginOptions } from '../../../declarations/plugins/container/ModuleFederationPlugin';
import HoistContainerReferences from '../HoistContainerReferencesPlugin';

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
  options?: ModuleFederationPluginOptions;
  entryFilePath: string;
  pluginsFilePath: string; // New path for plugins file
  bundlerRuntimePath: string;

  constructor(options?: ModuleFederationPluginOptions) {
    this.options = options;
    this.entryFilePath = '';
    this.pluginsFilePath = ''; // Initialize plugins file path
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

  static getPluginsTemplate(runtimePlugins: string[]) {
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

    const federationHash = createHash(federationTemplate);
    const pluginsHash = createHash(pluginsTemplate);

    this.entryFilePath = path.join(TEMP_DIR, `federation.${federationHash}.js`);
    this.pluginsFilePath = path.join(TEMP_DIR, `plugins.${pluginsHash}.js`);

    this.writeFile(this.entryFilePath, federationTemplate);
    this.writeFile(this.pluginsFilePath, pluginsTemplate);
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
    modifyEntry({
      compiler,
      prependEntry: (entry) => {
        Object.keys(entry).forEach((key) => {
          const entryItem = entry[key];
          const prefix = entryItem.runtime ? `-${entryItem.runtime}` : '';
          const runtimePluginKey = `mfp-runtime-plugins${prefix}`;
          const federationRuntimeKey = `federation-runtime${prefix}`;

          entry[runtimePluginKey] = {
            import: [this.pluginsFilePath],
            runtime: entryItem.runtime,
          };

          entry[federationRuntimeKey] = {
            import: [this.entryFilePath],
            runtime: entryItem.runtime,
          };
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
        let chunksRuntimePluginsDependsOn: Set<Chunk> | undefined = undefined;
        compilation.hooks.afterOptimizeChunks.tap(
          this.constructor.name,
          (chunk) => {
            const runtimePluginEntry = compilation.namedChunks.get(
              'mfp-runtime-plugins',
            );
            if (runtimePluginEntry) {
              chunksRuntimePluginsDependsOn =
                runtimePluginEntry.getAllInitialChunks();
            }
          },
        );
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
            compilation.addRuntimeModule(
              chunk,
              new FederationInitModule(
                name,
                this.entryFilePath,
                chunksRuntimePluginsDependsOn,
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

    new HoistContainerReferences().apply(compiler);
  }
}

export default FederationRuntimePlugin;
