import type { Compiler, WebpackPluginInstance } from 'webpack';
import {
  normalizeOptions,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import { validateOptions, consumeTypes } from '../core/index';

export class ConsumeTypesPlugin implements WebpackPluginInstance {
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  dtsOptions: moduleFederationPlugin.PluginDtsOptions;
  defaultOptions: moduleFederationPlugin.DtsHostOptions;
  constructor(
    pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions,
    dtsOptions: moduleFederationPlugin.PluginDtsOptions,
    defaultOptions: moduleFederationPlugin.DtsHostOptions,
  ) {
    this.pluginOptions = pluginOptions;
    this.dtsOptions = dtsOptions;
    this.defaultOptions = defaultOptions;
  }

  apply(compiler: Compiler) {
    const { dtsOptions, defaultOptions, pluginOptions } = this;

    const normalizedConsumeTypes =
      normalizeOptions<moduleFederationPlugin.DtsRemoteOptions>(
        true,
        defaultOptions,
        'mfOptions.dts.consumeTypes',
      )(dtsOptions.consumeTypes);

    if (!normalizedConsumeTypes) {
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
    };

    validateOptions(finalOptions.host);

    // only consume once , if remotes update types , DevPlugin will auto sync the latest types
    consumeTypes(finalOptions);
  }
}
