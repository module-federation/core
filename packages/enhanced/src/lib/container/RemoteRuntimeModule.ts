/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compilation } from 'webpack';
import RemoteModule from './RemoteModule';
import { getFederationGlobalScope } from './runtime/utils';
import type ExternalModule from 'webpack/lib/ExternalModule';
import type FallbackModule from './FallbackModule';
import type { RemotesOptions } from '@module-federation/webpack-bundler-runtime';

const extractUrlAndGlobal = require(
  normalizeWebpackPath('webpack/lib/util/extractUrlAndGlobal'),
) as typeof import('webpack/lib/util/extractUrlAndGlobal');

const { Template, RuntimeModule, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class RemoteRuntimeModule extends RuntimeModule {
  constructor() {
    super('remotes loading');
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate(): string | null {
    const { compilation, chunkGraph } = this;
    const { runtimeTemplate, moduleGraph } = compilation as Compilation;
    const chunkToRemotesMapping: Record<string, any> = {};
    const idToExternalAndNameMapping: Record<string | number, any> = {};
    const idToRemoteMap: RemotesOptions['idToRemoteMap'] = {};
    // let chunkReferences: Set<Chunk> = new Set();

    // if (this.chunk && chunkGraph) {
    //   const requirements = chunkGraph.getTreeRuntimeRequirements(this.chunk);
    //   if (requirements.has('federation-entry-startup')) {
    //     chunkReferences = this.chunk.getAllReferencedChunks();
    //   } else {
    //     // remote entry doesnt need federation startup, can have async chunk map only
    //     chunkReferences = this.chunk.getAllAsyncChunks();
    //   }
    // }

    const allChunks = [
      ...Array.from(this.chunk?.getAllReferencedChunks() || []),
    ];

    for (const chunk of allChunks) {
      const modules = chunkGraph?.getChunkModulesIterableBySourceType(
        chunk,
        'remote',
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
        if (id !== undefined) {
          //@ts-ignore
          remotes.push(id);

          idToExternalAndNameMapping[id] = [shareScope, name, externalModuleId];
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
              externalModuleId,
            });
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
      `${federationGlobal}.bundlerRuntimeOptions.remotes = {idToRemoteMap,chunkMapping, idToExternalAndNameMapping, webpackRequire:${RuntimeGlobals.require}};`,
      `${
        RuntimeGlobals.ensureChunkHandlers
      }.remotes = ${runtimeTemplate.basicFunction('chunkId, promises', [
        `${federationGlobal}.bundlerRuntime.remotes({idToRemoteMap,chunkMapping, idToExternalAndNameMapping, chunkId, promises, webpackRequire:${RuntimeGlobals.require}});`,
      ])}`,
    ]);
  }
}

export default RemoteRuntimeModule;
