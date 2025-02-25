import type { Compiler, WebpackPluginInstance } from 'webpack';
import {
  normalizeOptions,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import { validateOptions, consumeTypes } from '../core/index';
import { isPrd } from './utils';

export class ConsumeTypesPlugin implements WebpackPluginInstance {
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  dtsOptions: moduleFederationPlugin.PluginDtsOptions;
  defaultOptions: moduleFederationPlugin.DtsHostOptions;
  callback: () => void;

  constructor(
    pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions,
    dtsOptions: moduleFederationPlugin.PluginDtsOptions,
    defaultOptions: moduleFederationPlugin.DtsHostOptions,
    callback: () => void,
  ) {
    this.pluginOptions = pluginOptions;
    this.dtsOptions = dtsOptions;
    this.defaultOptions = defaultOptions;
    this.callback = callback;
  }

  apply(compiler: Compiler) {
    const { dtsOptions, defaultOptions, pluginOptions, callback } = this;

    if (isPrd()) {
      callback();
      return;
    }

    const normalizedConsumeTypes =
      normalizeOptions<moduleFederationPlugin.DtsRemoteOptions>(
        true,
        defaultOptions,
        'mfOptions.dts.consumeTypes',
      )(dtsOptions.consumeTypes);

    if (!normalizedConsumeTypes) {
      callback();
      return;
    }

    const finalOptions = {
      host: {
        implementation: dtsOptions.implementation,
        context: compiler.context,
        moduleFederationConfig: pluginOptions,
        ...normalizedConsumeTypes,
      },
      extraOptions: dtsOptions.extraOptions || {},
      displayErrorInTerminal: dtsOptions.displayErrorInTerminal,
    };

    validateOptions(finalOptions.host);

    const promise = consumeTypes(finalOptions)
      .then(() => {
        callback();
      })
      .catch(() => {
        callback();
      });

    compiler.hooks.thisCompilation.tap('mf:generateTypes', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'mf:generateTypes',
          stage:
            // @ts-expect-error use runtime variable in case peer dep not installed , it should execute before generate types
            compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER - 1,
        },
        async () => {
          // await consume types promise to make sure the consumer not throw types error
          await promise;
        },
      );
    });
    // only consume once , if remotes update types , DevPlugin will auto sync the latest types
  }
}
