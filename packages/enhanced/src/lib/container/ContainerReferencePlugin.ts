/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/
import type { Compiler } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

// import * as RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import FallbackDependency from './FallbackDependency';
import FallbackItemDependency from './FallbackItemDependency';
import FallbackModuleFactory from './FallbackModuleFactory';
import RemoteModule from './RemoteModule';
import RemoteRuntimeModule from './RemoteRuntimeModule';
import RemoteToExternalDependency from './RemoteToExternalDependency';
import { parseOptions } from './options';
import type {
  containerReferencePlugin,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import FederationRuntimePlugin from './runtime/FederationRuntimePlugin';
import FederationModulesPlugin from './runtime/FederationModulesPlugin';

const { ExternalsPlugin } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class ContainerReferencePlugin {
  private _remoteType: moduleFederationPlugin.ExternalsType;
  private _remotes: [string, moduleFederationPlugin.RemotesConfig][];

  constructor(
    options: containerReferencePlugin.ContainerReferencePluginOptions,
  ) {
    // validate(options);

    this._remoteType = options.remoteType;
    this._remotes = parseOptions(
      options.remotes,
      (item) => ({
        external: Array.isArray(item) ? item : [item],
        shareScope: options.shareScope || 'default',
      }),
      (item) => ({
        external: Array.isArray(item.external)
          ? item.external
          : [item.external],
        shareScope: item.shareScope || options.shareScope || 'default',
      }),
    );
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void {
    const { _remotes: remotes, _remoteType: remoteType } = this;
    // Short lists are cheaper to scan than to slice and hash request prefixes.
    // For larger lists, store configuration order so the first match still wins.
    const remoteIndex =
      remotes.length > 32 ? new Map<string, number>() : undefined;
    new FederationRuntimePlugin().apply(compiler);
    /** @type {Record<string, string>} */
    const remoteExternals: Record<string, string> = {};

    for (let index = 0; index < remotes.length; index++) {
      const [key, config] = remotes[index];
      if (remoteIndex && !remoteIndex.has(key)) {
        remoteIndex.set(key, index);
      }
      let i = 0;
      for (const external of config.external) {
        if (typeof external === 'string' && external.startsWith('internal ')) {
          continue;
        }
        remoteExternals[
          `webpack/container/reference/${key}${i ? `/fallback-${i}` : ''}`
        ] = external;
        i++;
      }
    }
    const Externals = compiler.webpack.ExternalsPlugin || ExternalsPlugin;
    new Externals(remoteType, remoteExternals).apply(compiler);

    compiler.hooks.compilation.tap(
      'ContainerReferencePlugin',
      (compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          RemoteToExternalDependency,
          normalModuleFactory,
        );

        compilation.dependencyFactories.set(
          FallbackItemDependency,
          normalModuleFactory,
        );

        compilation.dependencyFactories.set(
          FallbackDependency,
          new FallbackModuleFactory(),
        );

        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);

        normalModuleFactory.hooks.factorize.tap(
          'ContainerReferencePlugin',
          //@ts-ignore
          (data) => {
            if (remotes.length > 0 && !data.request.includes('!')) {
              const request = data.request;
              let match = remotes.length;
              if (remoteIndex) {
                match = remoteIndex.get(request) ?? remotes.length;
                for (
                  let end = request.indexOf('/');
                  end !== -1 && match !== 0;
                  end = request.indexOf('/', end + 1)
                ) {
                  const index = remoteIndex.get(request.slice(0, end));
                  if (index !== undefined && index < match) {
                    match = index;
                  }
                }
              } else {
                for (let index = 0; index < remotes.length; index++) {
                  const [key] = remotes[index];
                  if (
                    request.startsWith(key) &&
                    (request.length === key.length ||
                      request.charCodeAt(key.length) === 47)
                  ) {
                    match = index;
                    break;
                  }
                }
              }
              if (match !== remotes.length) {
                const [key, config] = remotes[match];
                const remoteModule = new RemoteModule(
                  data.request,
                  //@ts-ignore
                  config.external.map((external: any, i: any) =>
                    external.startsWith('internal ')
                      ? external.slice(9)
                      : `webpack/container/reference/${key}${
                          i ? `/fallback-${i}` : ''
                        }`,
                  ),
                  `.${data.request.slice(key.length)}`,
                  //@ts-ignore
                  config.shareScope,
                );
                hooks.addRemoteDependency.call(remoteModule);
                return remoteModule;
              }
            }
          },
        );

        compilation.hooks.runtimeRequirementInTree
          .for(compiler.webpack.RuntimeGlobals.ensureChunkHandlers)
          .tap('ContainerReferencePlugin', (chunk, set) => {
            set.add(compiler.webpack.RuntimeGlobals.module);
            set.add(compiler.webpack.RuntimeGlobals.moduleFactoriesAddOnly);
            set.add(compiler.webpack.RuntimeGlobals.hasOwnProperty);
            set.add(compiler.webpack.RuntimeGlobals.initializeSharing);
            set.add(compiler.webpack.RuntimeGlobals.shareScopeMap);
            compilation.addRuntimeModule(chunk, new RemoteRuntimeModule());
          });
      },
    );
  }
}

export default ContainerReferencePlugin;
