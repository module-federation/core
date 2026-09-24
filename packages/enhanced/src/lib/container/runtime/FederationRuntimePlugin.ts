import fs from 'fs';
import path from 'path';
import type {
  Compiler,
  WebpackPluginInstance,
  Compilation,
  Chunk,
} from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { moduleFederationPlugin } from '@module-federation/sdk';
import FederationRuntimeModule from './FederationRuntimeModule';
import {
  getFederationGlobalScope,
  normalizeRuntimeInitOptionsWithOutShared,
  createHash,
  normalizeToPosixPath,
  type NormalizedRuntimeInitOptionsWithOutShared,
} from './utils';
import {
  expectedEntry,
  finalizeRuntimeSelection,
  getSelectionSlot,
} from '@module-federation/managers/runtime-selection';
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

type RuntimeEntrySpec = {
  bundler: string;
  esm: string;
  cjs: string;
};

function resolveRuntimeEntry(spec: RuntimeEntrySpec) {
  let lastError: unknown;

  for (const candidate of [spec.bundler, spec.esm, spec.cjs]) {
    try {
      return require.resolve(candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export function resolveRuntimePaths() {
  return {
    runtimeToolsPath: resolveRuntimeEntry({
      bundler: '@module-federation/runtime-tools/bundler',
      esm: '@module-federation/runtime-tools/dist/index.js',
      cjs: '@module-federation/runtime-tools/dist/index.cjs',
    }),
    bundlerRuntimePath: resolveRuntimeEntry({
      bundler: '@module-federation/webpack-bundler-runtime/bundler',
      esm: '@module-federation/webpack-bundler-runtime/dist/index.js',
      cjs: '@module-federation/webpack-bundler-runtime/dist/index.cjs',
    }),
    runtimePath: resolveRuntimeEntry({
      bundler: '@module-federation/runtime/bundler',
      esm: '@module-federation/runtime/dist/index.js',
      cjs: '@module-federation/runtime/dist/index.cjs',
    }),
  };
}

const {
  runtimeToolsPath: RuntimeToolsPath,
  bundlerRuntimePath: BundlerRuntimePath,
  runtimePath: RuntimePath,
} = resolveRuntimePaths();
const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

const runtimePluginStateKey = Symbol.for(
  'module-federation.runtime-plugin-state.v1',
);
type RuntimePluginState = {
  entryFilePath?: string;
  installed: boolean;
};

function getRuntimePluginState(compiler: Compiler): RuntimePluginState {
  const statefulCompiler = compiler as Compiler & {
    [runtimePluginStateKey]?: RuntimePluginState;
  };
  return (statefulCompiler[runtimePluginStateKey] ??= {
    installed: false,
  });
}

class FederationRuntimePlugin {
  options?: moduleFederationPlugin.ModuleFederationPluginOptions;
  entryFilePath: string;
  bundlerRuntimePath: string;
  runtimePath: string;
  runtimeToolsPath: string;
  runtimeInitOptions?: NormalizedRuntimeInitOptionsWithOutShared;
  federationRuntimeDependency?: FederationRuntimeDependency; // Add this line

  constructor(options?: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options ? { ...options } : undefined;
    this.entryFilePath = '';
    this.bundlerRuntimePath = BundlerRuntimePath;
    this.runtimePath = RuntimePath;
    this.runtimeToolsPath = RuntimeToolsPath;
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
      `if(!${federationGlobal}.runtime || !${federationGlobal}.bundlerRuntime){`,
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
      '}',
    ]);
  }

  getFilePath(compiler: Compiler) {
    if (!this.options) {
      return '';
    }

    const state = getRuntimePluginState(compiler);
    const existedFilePath = state.entryFilePath;

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
      entryFilePath = `data:text/javascript;charset=utf-8;base64,${Buffer.from(
        FederationRuntimePlugin.getTemplate(
          compiler,
          this.options,
          this.bundlerRuntimePath,
        ),
        'utf8',
      ).toString('base64')}`;
    }

    state.entryFilePath = entryFilePath;

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
    } catch {
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

    if (!this.entryFilePath) {
      this.prepareRuntime(compiler);
    }
    this.ensureFile(compiler);

    this.federationRuntimeDependency = new FederationRuntimeDependency(
      this.entryFilePath,
    );
    return this.federationRuntimeDependency;
  }

  prependEntry(compiler: Compiler) {
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
          (err) => {
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
    this.runtimeInitOptions = initOptionsWithoutShared;
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

  prepareRuntime(compiler: Compiler) {
    const selection = getSelectionSlot(compiler);
    if (!selection.finalized) {
      finalizeRuntimeSelection(
        compiler,
        compiler.options.target,
        this.options?.implementation ??
          require.resolve('@module-federation/runtime-tools'),
      );
    }
    const image = selection.image;
    if (!image) {
      throw new Error('Runtime family selection did not produce an image.');
    }
    this.bundlerRuntimePath = image.facadeEntry;
    this.runtimePath =
      expectedEntry(image, '@module-federation/runtime$') ??
      image.family.members.runtime.entry;
    this.runtimeToolsPath =
      expectedEntry(image, '@module-federation/runtime-tools$') ??
      image.family.members['runtime-tools'].entry;
    if (
      image.mode === 'conditions' &&
      selection.profile &&
      this.runtimeInitOptions
    ) {
      const capabilities = [
        'remote',
        'shared',
        'snapshotPlugins',
        'containerEntry',
      ] as const;
      this.runtimeInitOptions.runtimeImage = {
        contract: 1,
        compatibilityId: image.family.compatibilityId,
        required: capabilities.filter(
          (capability) => selection.profile?.[capability] === 'required',
        ),
        forbidden: capabilities.filter(
          (capability) => selection.profile?.[capability] === 'forbidden',
        ),
        available: capabilities.filter(
          (capability) => selection.profile?.[capability] !== 'forbidden',
        ),
        target: selection.profile.target,
        entryLoadingIdentity: image.entryLoadingIdentity,
      };
    }
    this.setRuntimeAlias(compiler);
    this.entryFilePath = this.getFilePath(compiler);
  }

  setRuntimeAlias(compiler: Compiler) {
    const alias: any = compiler.options.resolve.alias || {};
    alias['@module-federation/runtime$'] =
      alias['@module-federation/runtime$'] || this.runtimePath;
    alias['@module-federation/runtime-tools$'] =
      alias['@module-federation/runtime-tools$'] || this.runtimeToolsPath;

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

    new EmbedFederationRuntimePlugin().apply(compiler);

    new HoistContainerReferences().apply(compiler);

    const state = getRuntimePluginState(compiler);
    if (!state.installed) {
      this.prependEntry(compiler);
      this.injectRuntime(compiler);
      compiler.hooks.afterResolvers.tap(this.constructor.name, () => {
        this.prepareRuntime(compiler);
      });
      state.installed = true;
    }
  }
}

export default FederationRuntimePlugin;
