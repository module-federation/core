/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

import  Compiler from 'webpack/lib/Compiler';
import createSchemaValidation from 'webpack/lib/util/create-schema-validation';
import { ContainerReferencePluginOptions, RemotesConfig } from './ContainerReferencePluginTypes';
import FallbackDependency from './FallbackDependency';
import FallbackItemDependency from './FallbackItemDependency';
import FallbackModuleFactory from './FallbackModuleFactory';
import RemoteModule from './RemoteModule';
import RemoteRuntimeModule from './RemoteRuntimeModule';
import RemoteToExternalDependency from './RemoteToExternalDependency';
import { parseOptions } from './options';
import ExternalsPlugin from 'webpack/lib/ExternalsPlugin';
import Compilation from 'webpack/lib/Compilation';
import NormalModuleFactory, { ResolveData } from 'webpack/lib/NormalModuleFactory';
import { ExternalsType } from 'webpack/declarations/plugins/container/ContainerReferencePlugin';
import {Module} from "webpack/lib/Module";
/** @typedef {import("webpack/declarations/plugins/container/ContainerReferencePlugin").ContainerReferencePluginOptions} ContainerReferencePluginOptions */
/** @typedef {import("webpack/declarations/plugins/container/ContainerReferencePlugin").RemotesConfig} RemotesConfig */
/** @typedef {import("webpack/lib/Compiler")} Compiler */

const validate = createSchemaValidation(
	//eslint-disable-next-line
	require('../../schemas/plugins/container/ContainerReferencePlugin.check.js'),
	() => require('../../schemas/plugins/container/ContainerReferencePlugin.json'),
	{
	  name: 'Container Reference Plugin',
	  baseDataPath: 'options',
	}
  );
  

  const slashCode = '/'.charCodeAt(0);

class ContainerReferencePlugin {
	private _remoteType: ExternalsType;
	private _remotes: [string, RemotesConfig][];
  

	constructor(options: ContainerReferencePluginOptions) {
		validate(options);

    this._remoteType = options.remoteType;
	this._remotes = parseOptions(
		options.remotes,
		(item) => ({
		  external: Array.isArray(item) ? item : [item],
		  shareScope: options.shareScope || 'default',
		}),
		(item) => ({
		  external: Array.isArray(item.external) ? item.external : [item.external],
		  shareScope: item.shareScope || options.shareScope || 'default',
		})
	  );
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void {
    const { _remotes: remotes, _remoteType: remoteType } = this;


    /** @type {Record<string, string>} */
	const remoteExternals: Record<string, string> = {};

    for (const [key, config] of remotes) {
      let i = 0;
      for (const external of config.external) {
		if (typeof external === 'string' && external.startsWith('internal ')) continue;

        remoteExternals[
          `webpack/container/reference/${key}${i ? `/fallback-${i}` : ''}`
        ] = external;
        i++;
      }
    }

    new ExternalsPlugin(remoteType, remoteExternals).apply(compiler);

    compiler.hooks.compilation.tap(
      'ContainerReferencePlugin',
      (compilation : Compilation, { normalModuleFactory } : {normalModuleFactory: NormalModuleFactory}) => {
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
          (data : ResolveData): Module => {
            if (!data.request.includes('!')) {
              for (const [key, config] of remotes) {
                if (
                  data.request.startsWith(`${key}`) &&
                  (data.request.length === key.length ||
                    data.request.charCodeAt(key.length) === slashCode)
                ) {
                  return new RemoteModule(
                    data.request,
                    config.external.map((external : any, i : any) =>
                      external.startsWith('internal ')
                        ? external.slice(9)
                        : `webpack/container/reference/${key}${
                            i ? `/fallback-${i}` : ''
                          }`,
                    ),
                    `${data.request.slice(key.length)}`,
                    config.shareScope,
                  );
                }
              }
            }
		
          },
        );

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.ensureChunkHandlers)
          .tap('ContainerReferencePlugin', (chunk, set) => {
            set.add(RuntimeGlobals.module);
            set.add(RuntimeGlobals.moduleFactoriesAddOnly);
            set.add(RuntimeGlobals.hasOwnProperty);
            set.add(RuntimeGlobals.initializeSharing);
            set.add(RuntimeGlobals.shareScopeMap);
            compilation.addRuntimeModule(chunk, new RemoteRuntimeModule());
          });
      },
    );
  }
}

export default ContainerReferencePlugin;
