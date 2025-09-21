import type { moduleFederationPlugin } from '@module-federation/sdk';
import { assert, encodeName } from '@module-federation/sdk';
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

const PLUGIN_NAME = 'SharedContainerPlugin';
const HOT_UPDATE_SUFFIX = '.hot-update';

class SharedContainerPlugin {
  _options: {
    name: string;
    currentShared: string;
    libraryType?: moduleFederationPlugin.LibraryType;
  };
  name: string;
  resolvedProvideMap: ResolvedProvideMap;
  filename = '';
  outputDirName: string;

  constructor(
    mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
    currentShared: string,
    resolvedProvideMap: ResolvedProvideMap,
    outputDirName: string,
  ) {
    this.name = PLUGIN_NAME;
    this.outputDirName = outputDirName;

    this._options = {
      name: mfConfig.name!,
      currentShared,
      libraryType: mfConfig.library?.type || 'global',
    };
    this.resolvedProvideMap = resolvedProvideMap;
  }

  getData() {
    return `${this.outputDirName}/${this.filename}`;
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
            filename: encodeName(
              `${currentShared}_${name}${process.env['NODE_ENV'] === 'development' ? '' : '.[chunkhash:8]'}`,
              '',
              true,
            ),
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
            set.add(compiler.webpack.RuntimeGlobals.runtimeId);
            compilation.addRuntimeModule(
              chunk,
              new FederationRuntimeModule(set, name, { name, remotes: [] }),
            );
          },
        );

        compilation.hooks.processAssets.tapPromise(
          {
            name: 'getFileName',
            stage:
              // @ts-ignore use runtime variable in case peer dep not installed
              compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
          },
          async () => {
            const remoteEntryPoint = compilation.entrypoints.get(currentShared);
            assert(
              remoteEntryPoint,
              `Can not get shared ${currentShared} entryPoint!`,
            );
            const remoteEntryNameChunk =
              compilation.namedChunks.get(currentShared);
            assert(
              remoteEntryNameChunk,
              `Can not get shared ${currentShared} chunk!`,
            );

            const files = Array.from(
              remoteEntryNameChunk.files as Iterable<string>,
            ).filter(
              (f: string) =>
                !f.includes(HOT_UPDATE_SUFFIX) && !f.endsWith('.css'),
            );
            assert(
              files.length > 0,
              `no files found for shared ${currentShared} chunk`,
            );
            assert(
              files.length === 1,
              `shared ${currentShared} chunk should not have multiple files!, current files: ${files.join(
                ',',
              )}`,
            );
            this.filename = files[0];
          },
        );
      },
    );
  }
}

export default SharedContainerPlugin;
