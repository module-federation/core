import type {
  containerPlugin,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import { encodeName } from '@module-federation/sdk';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import type { Compilation, Compiler, WebpackError } from 'webpack';
import type { ResolvedProvideMap } from '../CollectSharedEntryPlugin';
import SharedDependency from './SharedDependency';
import SharedEntryDependency from './SharedEntryDependency';
import SharedEntryModuleFactory from './SharedEntryModuleFactory';
import { getFederationGlobalScope } from '../../../container/runtime/utils';
import FederationRuntimeModule from '../../../container/runtime/FederationRuntimeModule';

const EntryDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/EntryDependency'),
) as typeof import('webpack/lib/dependencies/EntryDependency');

const PLUGIN_NAME = 'ShakeSharedPlugin';

class ShakeSharedPlugin {
  _options: {
    name: string;
    currentShared: string;
    libraryType?: containerPlugin.LibraryType;
  };
  name: string;
  resolvedProvideMap: ResolvedProvideMap;

  constructor(
    mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
    currentShared: string,
    resolvedProvideMap: ResolvedProvideMap,
  ) {
    this.name = PLUGIN_NAME;

    this._options = {
      name: mfConfig.name!,
      currentShared,
      libraryType: mfConfig.library?.type || 'global',
    };
    this.resolvedProvideMap = resolvedProvideMap;
  }

  getData() {
    return 'xxxxx';
  }

  apply(compiler: Compiler): void {
    const { libraryType, currentShared, name } = this._options;
    const { resolvedProvideMap } = this;

    if (
      libraryType &&
      compiler.options.output &&
      compiler.options.output.enabledLibraryTypes &&
      !compiler.options.output.enabledLibraryTypes.includes(libraryType)
    ) {
      compiler.options.output.enabledLibraryTypes.push(libraryType);
    }

    compiler.hooks.make.tapAsync(
      PLUGIN_NAME,
      async (
        compilation: Compilation,
        callback: (error?: WebpackError | null | undefined) => void,
      ) => {
        if (!resolvedProvideMap) return;
        const resource = resolvedProvideMap.get(currentShared)?.resource;
        if (!resource) {
          return callback();
        }
        const dep = new SharedEntryDependency(currentShared, resource);
        dep.loc = { name: currentShared };

        compilation.addEntry(
          compilation.options.context || '',
          dep,
          {
            name: currentShared,
            filename: encodeName(`${currentShared}_${name}`, '', true),
            library: {
              type: libraryType!,
              name: encodeName(`${currentShared}_${name}`),
            },
          },
          (error: WebpackError | null | undefined) => {
            if (error) {
              throw error;
            }
          },
        );

        callback();
      },
    );

    // add the container entry module
    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          SharedEntryDependency,
          new SharedEntryModuleFactory(),
        );

        compilation.dependencyFactories.set(
          SharedDependency,
          normalModuleFactory,
        );

        if (!compilation.dependencyFactories.has(EntryDependency)) {
          compilation.dependencyFactories.set(
            EntryDependency,
            normalModuleFactory,
          );
        }

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          PLUGIN_NAME,
          (chunk, set) => {
            set.add(getFederationGlobalScope(compiler.webpack.RuntimeGlobals));
            compilation.addRuntimeModule(
              chunk,
              new FederationRuntimeModule(set, name, { name, remotes: [] }),
            );
          },
        );
      },
    );
  }
}

export default ShakeSharedPlugin;
