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
            let remoteName;
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
              request: remoteModule.request as string,
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
        // `if(${RuntimeGlobals.hasOwnProperty}(chunkMapping, chunkId)) {`,
        // Template.indent([
        //   `chunkMapping[chunkId].forEach(${runtimeTemplate.basicFunction('id', [
        //     `var getScope = ${RuntimeGlobals.currentRemoteGetScope};`,
        //     'if(!getScope) getScope = [];',
        //     'var data = idToExternalAndNameMapping[id];',
        //     'if(getScope.indexOf(data) >= 0) return;',
        //     'getScope.push(data);',
        //     `if(data.p) return promises.push(data.p);`,
        //     `var onError = ${runtimeTemplate.basicFunction('error', [
        //       'if(!error) error = new Error("Container missing");',
        //       'if(typeof error.message === "string")',
        //       Template.indent(
        //         `error.message += '\\nwhile loading "' + data[1] + '" from ' + data[2];`,
        //       ),
        //       `${
        //         RuntimeGlobals.moduleFactories
        //       }[id] = ${runtimeTemplate.basicFunction('', ['throw error;'])}`,
        //       'data.p = 0;',
        //     ])};`,
        //     `var handleFunction = ${runtimeTemplate.basicFunction(
        //       'fn, arg1, arg2, d, next, first',
        //       [
        //         'try {',
        //         Template.indent([
        //           'var promise = fn(arg1, arg2);',
        //           'if(promise && promise.then) {',
        //           Template.indent([
        //             `var p = promise.then(${runtimeTemplate.returningFunction(
        //               'next(result, d)',
        //               'result',
        //             )}, onError);`,
        //             `if(first) promises.push(data.p = p); else return p;`,
        //           ]),
        //           '} else {',
        //           Template.indent(['return next(promise, d, first);']),
        //           '}',
        //         ]),
        //         '} catch(error) {',
        //         Template.indent(['onError(error);']),
        //         '}',
        //       ],
        //     )}`,
        //     `var onExternal = ${runtimeTemplate.returningFunction(
        //       `external ? handleFunction(${RuntimeGlobals.initializeSharing}, data[0], 0, external, onInitialized, first) : onError()`,
        //       'external, _, first',
        //     )};`,
        //     `var onInitialized = ${runtimeTemplate.returningFunction(
        //       `handleFunction(external.get, data[1], getScope, 0, onFactory, first)`,
        //       '_, external, first',
        //     )};`,
        //     `var onFactory = ${runtimeTemplate.basicFunction('factory', [
        //       'data.p = 1;',
        //       `${
        //         RuntimeGlobals.moduleFactories
        //       }[id] = ${runtimeTemplate.basicFunction('module', [
        //         'module.exports = factory();',
        //       ])}`,
        //     ])};`,
        //     `handleFunction(${RuntimeGlobals.require}, data[2], 0, 0, onExternal, 1);`,
        //   ])});`,
        // ]),
        // '}',
      ])}`,
    ]);
  }
}

export default RemoteRuntimeModule;
