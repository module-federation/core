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
import { containerReferencePlugin } from '@module-federation/sdk';
import FederationRuntimePlugin from './runtime/FederationRuntimePlugin';
import schema from '../../schemas/container/ContainerReferencePlugin';
import checkOptions from '../../schemas/container/ContainerReferencePlugin.check';

const { ExternalsPlugin } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const createSchemaValidation = require(
  normalizeWebpackPath('webpack/lib/util/create-schema-validation'),
) as typeof import('webpack/lib/util/create-schema-validation');

const validate = createSchemaValidation(
  //eslint-disable-next-line
  checkOptions,
  () => schema,
  {
    name: 'Container Reference Plugin',
    baseDataPath: 'options',
  },
);

const slashCode = '/'.charCodeAt(0);

class ContainerReferencePlugin {
  private _remoteType: containerReferencePlugin.ExternalsType;
  private _remotes: [string, containerReferencePlugin.RemotesConfig][];

  constructor(
    options: containerReferencePlugin.ContainerReferencePluginOptions,
  ) {
    validate(options);

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
    new FederationRuntimePlugin().apply(compiler);
    /** @type {Record<string, string>} */
    const remoteExternals: Record<string, string> = {};

    for (const [key, config] of remotes) {
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

        normalModuleFactory.hooks.factorize.tap(
          'ContainerReferencePlugin',
          // @ts-ignore
          (data) => {
            if (!data.request.includes('!')) {
              for (const [key, config] of remotes) {
                if (
                  data.request.startsWith(`${key}`) &&
                  (data.request.length === key.length ||
                    data.request.charCodeAt(key.length) === slashCode)
                ) {
                  return new RemoteModule(
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
                }
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
