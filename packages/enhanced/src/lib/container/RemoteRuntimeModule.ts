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
import type { ModuleIdToRemoteDataMapping } from '@module-federation/webpack-bundler-runtime';

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
    const moduleIdToRemoteDataMapping: ModuleIdToRemoteDataMapping = {};

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

          moduleIdToRemoteDataMapping[id] = {
            shareScope: shareScope as string,
            name,
            externalModuleId: externalModuleId as string,
            remoteName: '',
          };
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
          });
        }
      }
    }
    const federationGlobal = getFederationGlobalScope(
      RuntimeGlobals || ({} as typeof RuntimeGlobals),
    );

    return Template.asString([
      `${RuntimeGlobals.require}.remotesLoadingData.chunkMapping = ${JSON.stringify(
        chunkToRemotesMapping,
        null,
        '\t',
      )};`,
      `${RuntimeGlobals.require}.remotesLoadingData.moduleIdToRemoteDataMapping = ${JSON.stringify(
        moduleIdToRemoteDataMapping,
        null,
        '\t',
      )};`,
      `${
        RuntimeGlobals.ensureChunkHandlers
      }.remotes = ${runtimeTemplate.basicFunction('chunkId, promises', [
        `${federationGlobal}.bundlerRuntime.remotes({ chunkId, promises, webpackRequire:${RuntimeGlobals.require}});`,
      ])}`,
    ]);
  }
}

export default RemoteRuntimeModule;
