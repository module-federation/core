import type { moduleFederationPlugin } from '@module-federation/sdk';
import { assert, encodeName } from '@module-federation/sdk';
import path from 'path';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import type { Compilation, Compiler, WebpackError } from 'webpack';
import type { ShareRequestsMap } from '../CollectSharedEntryPlugin';
import SharedDependency from './SharedDependency';
import SharedEntryDependency from './SharedEntryDependency';
import SharedEntryModuleFactory from './SharedEntryModuleFactory';
import { getFederationGlobalScope } from '../../../container/runtime/utils';
import FederationRuntimeModule from '../../../container/runtime/FederationRuntimeModule';

const EntryDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/EntryDependency'),
) as typeof import('webpack/lib/dependencies/EntryDependency');

export const PLUGIN_NAME = 'SharedContainerPlugin';
const HOT_UPDATE_SUFFIX = '.hot-update';

export type SharedContainerPluginOptions = {
  mfName: string;
  shareName: string;
  version: string;
  request: string;
  library?: moduleFederationPlugin.LibraryOptions;
  independentShareFileName?: string;
};

class SharedContainerPlugin {
  name = PLUGIN_NAME;
  filename = '';
  _options: {
    name: string;
    request: string;
    version: string;
    fileName: string;
    library: moduleFederationPlugin.LibraryOptions;
  };
  _shareName: string;
  _globalName: string;

  constructor(options: SharedContainerPluginOptions) {
    const { mfName, shareName, request, library, independentShareFileName } =
      options;
    const version = options.version || '0.0.0';
    this._globalName = encodeName(`${mfName}_${shareName}_${version}`);
    const fileName = independentShareFileName || `${version}/share-entry.js`;
    this._shareName = shareName;
    this._options = {
      name: shareName,
      request: request,
      library: (library
        ? { ...library, name: this._globalName }
        : undefined) || {
        type: 'global',
        name: this._globalName,
      },
      version,
      fileName,
    };
  }

  getData() {
    return [this.filename, this._globalName, this._options.version];
  }

  apply(compiler: Compiler): void {
    const { library, name, request, fileName } = this._options;

    if (
      library.type &&
      compiler.options.output &&
      compiler.options.output.enabledLibraryTypes &&
      !compiler.options.output.enabledLibraryTypes.includes(library.type)
    ) {
      compiler.options.output.enabledLibraryTypes.push(library.type);
    }

    compiler.hooks.make.tapAsync(
      PLUGIN_NAME,
      async (
        compilation: Compilation,
        callback: (error?: WebpackError | null | undefined) => void,
      ) => {
        const dep = new SharedEntryDependency(name, request);
        dep.loc = { name: name };

        compilation.addEntry(
          compilation.options.context || '',
          dep,
          {
            name: name,
            filename: fileName,
            library: {
              type: library.type!,
              name: this._globalName,
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
            name: 'getManifestFileName',
            stage:
              // @ts-ignore use runtime variable in case peer dep not installed
              compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
          },
          async () => {
            const remoteEntryPoint = compilation.entrypoints.get(name);
            assert(remoteEntryPoint, `Can not get shared ${name} entryPoint!`);
            const remoteEntryNameChunk = compilation.namedChunks.get(name);
            assert(remoteEntryNameChunk, `Can not get shared ${name} chunk!`);

            const files = Array.from(
              remoteEntryNameChunk.files as Iterable<string>,
            ).filter(
              (f: string) =>
                !f.includes(HOT_UPDATE_SUFFIX) && !f.endsWith('.css'),
            );
            assert(files.length > 0, `no files found for shared ${name} chunk`);
            assert(
              files.length === 1,
              `shared ${name} chunk should not have multiple files!, current files: ${files.join(
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
