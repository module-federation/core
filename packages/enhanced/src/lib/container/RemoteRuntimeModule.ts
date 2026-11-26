/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compilation } from 'webpack';
import RemoteModule from './RemoteModule';
import {
  FEDERATION_RUNTIME_MODULE_NAME,
  getFederationGlobalScope,
} from './runtime/utils';
import type ExternalModule from 'webpack/lib/externals/ExternalModule';
import type FallbackModule from './FallbackModule';
import type {
  ModuleIdToRemoteDataMapping,
  RemotesOptions,
} from '@module-federation/webpack-bundler-runtime';

const extractUrlAndGlobal = require(
  normalizeWebpackPath('webpack/lib/util/extractUrlAndGlobal'),
) as typeof import('webpack/lib/externals/extractUrlAndGlobal');

const { Template, RuntimeModule, RuntimeGlobals, WebpackError } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const { compareModulesByIdentifier } = require(
  normalizeWebpackPath('webpack/lib/util/comparators'),
) as typeof import('webpack/lib/util/comparators');

class RemoteRuntimeModule extends RuntimeModule {
  constructor() {
    super('remotes loading');
  }

  /**
   * @returns {string | null} runtime code
   */
  /**
   * The emitted code reads `__webpack_require__.federation`, which only the federation runtime module
   * defines. If this runtime lacks it (e.g. a compilation the federation runtime was not injected
   * into), the bundle would throw "Cannot read properties of undefined (reading
   * 'bundlerRuntimeOptions')" at startup, so report it at build time instead.
   */
  private reportMissingFederationRuntime(compilation: Compilation): void {
    const { chunk, chunkGraph } = this;
    if (!chunk || !chunkGraph) return;
    for (const runtimeModule of chunkGraph.getChunkRuntimeModulesIterable(
      chunk,
    )) {
      if (
        (runtimeModule as InstanceType<typeof RuntimeModule>).name ===
        FEDERATION_RUNTIME_MODULE_NAME
      ) {
        return;
      }
    }
    const error = new WebpackError(
      `[Module Federation] The remotes runtime was emitted into chunk "${chunk.name ?? chunk.id}" without the federation runtime. ` +
        'The bundle will throw "Cannot read properties of undefined (reading \'bundlerRuntimeOptions\')" when it starts. ' +
        'This usually means a federation plugin ran in a compilation that the federation runtime was not injected into.',
    );
    error.chunk = chunk;
    compilation.warnings.push(error);
  }

  override generate(): string | null {
    const { compilation, chunkGraph } = this;
    if (compilation) {
      this.reportMissingFederationRuntime(compilation as Compilation);
    }
    const { runtimeTemplate, moduleGraph } = compilation as Compilation;
    const chunkToRemotesMapping: Record<string, any> = {};
    const idToExternalAndNameMapping: Record<string | number, any> = {};
    const idToRemoteMap: RemotesOptions['idToRemoteMap'] = {};
    const moduleIdToRemoteDataMapping: ModuleIdToRemoteDataMapping = {};

    const allChunks = [
      ...Array.from(this.chunk?.getAllReferencedChunks() || []),
    ];

    for (const chunk of allChunks) {
      if (chunk.id === null || chunk.id === undefined) {
        continue;
      }
      const modules = chunkGraph?.getOrderedChunkModulesIterableBySourceType(
        chunk,
        'remote',
        compareModulesByIdentifier,
      );
      if (!modules) {
        continue;
      }
      // @ts-ignore
      const remotes = (chunkToRemotesMapping[chunk.id] = []);
      for (const m of modules) {
        const module: RemoteModule = m as unknown as RemoteModule;
        const name = module.internalRequest;
        // @ts-ignore
        const id = chunkGraph ? chunkGraph.getModuleId(module) : undefined;
        const { shareScope } = module;
        const dep = module.dependencies[0];
        // @ts-ignore
        const externalModule = moduleGraph.getModule(dep) as
          | ExternalModule
          | FallbackModule;
        const externalModuleId =
          chunkGraph && externalModule
            ? // @ts-ignore
              chunkGraph.getModuleId(externalModule)
            : undefined;
        if (id !== undefined && id !== null) {
          //@ts-ignore
          remotes.push(id);

          const normalizedExternalModuleId =
            externalModuleId === null || externalModuleId === undefined
              ? undefined
              : externalModuleId;
          idToExternalAndNameMapping[id] = [
            shareScope,
            name,
            normalizedExternalModuleId,
          ];
          const remoteModules: ExternalModule[] = [];
          // FallbackModule has requests
          if ('requests' in externalModule && externalModule.requests) {
            externalModule.dependencies.forEach((dependency) => {
              const remoteModule = moduleGraph.getModule(dependency);
              if (remoteModule) {
                // @ts-ignore
                remoteModules.push(remoteModule as ExternalModule);
              }
            });
          } else {
            remoteModules.push(externalModule as ExternalModule);
          }

          idToRemoteMap[id] = [];
          remoteModules.forEach((remoteModule) => {
            let remoteName = '';
            try {
              const [_url, name] = extractUrlAndGlobal(
                remoteModule.request as string,
              );
              remoteName = name;
            } catch (err) {
              //noop
            }
            const externalModuleId =
              chunkGraph &&
              remoteModule &&
              // @ts-ignore
              chunkGraph.getModuleId(remoteModule);

            idToRemoteMap[id].push({
              externalType: remoteModule.externalType,
              name: remoteModule.externalType === 'script' ? remoteName : '',
            });
            if (externalModuleId !== null && externalModuleId !== undefined) {
              moduleIdToRemoteDataMapping[id] = {
                shareScope: shareScope,
                name,
                externalModuleId: externalModuleId as string | number,
                // Preserve the extracted remote name so lazy updates can
                // rebuild idToRemoteMap via updateRemoteOptions.
                remoteName: remoteName,
              };
            }
          });
        }
      }
    }
    const federationGlobal = getFederationGlobalScope(
      RuntimeGlobals || ({} as typeof RuntimeGlobals),
    );

    return Template.asString([
      `var chunkMapping = ${JSON.stringify(
        chunkToRemotesMapping,
        null,
        '\t',
      )};`,
      `var idToExternalAndNameMapping = ${JSON.stringify(
        idToExternalAndNameMapping,
        null,
        '\t',
      )};`,
      `var idToRemoteMap = ${JSON.stringify(idToRemoteMap, null, '\t')};`,
      `${federationGlobal}.bundlerRuntimeOptions.remotes.chunkMapping = chunkMapping;`,
      `${federationGlobal}.bundlerRuntimeOptions.remotes.idToExternalAndNameMapping = idToExternalAndNameMapping;`,
      `${federationGlobal}.bundlerRuntimeOptions.remotes.idToRemoteMap = idToRemoteMap;`,
      `${RuntimeGlobals.require}.remotesLoadingData.moduleIdToRemoteDataMapping = ${JSON.stringify(
        moduleIdToRemoteDataMapping,
        null,
        '\t',
      )};`,
      `${
        RuntimeGlobals.ensureChunkHandlers
      }.remotes = ${runtimeTemplate.basicFunction('chunkId, promises', [
        `${federationGlobal}.bundlerRuntime.remotes({idToRemoteMap,chunkMapping, idToExternalAndNameMapping, chunkId, promises, webpackRequire:${RuntimeGlobals.require}});`,
      ])}`,
    ]);
  }
}

export default RemoteRuntimeModule;
