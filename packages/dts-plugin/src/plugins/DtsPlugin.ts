import { DevPlugin } from './DevPlugin';
import { normalizeOptions } from '@module-federation/sdk';
import {
  ConsumeTypesPlugin,
  DEFAULT_CONSUME_TYPES,
} from './ConsumeTypesPlugin';
import {
  GenerateTypesPlugin,
  DEFAULT_GENERATE_TYPES,
} from './GenerateTypesPlugin';
import { isTSProject } from '../core';

import { type moduleFederationPlugin } from '@module-federation/sdk';
import type { Compiler, WebpackPluginInstance } from 'webpack';

export const normalizeDtsOptions = (
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
  context: string,
  defaultOptions?: {
    defaultGenerateOptions?: moduleFederationPlugin.DtsRemoteOptions;
    defaultConsumeOptions?: moduleFederationPlugin.DtsHostOptions;
  },
) => {
  return normalizeOptions<moduleFederationPlugin.PluginDtsOptions>(
    isTSProject(options.dts, context),
    {
      generateTypes:
        defaultOptions?.defaultGenerateOptions || DEFAULT_GENERATE_TYPES,
      consumeTypes:
        defaultOptions?.defaultConsumeOptions || DEFAULT_CONSUME_TYPES,
      extraOptions: {},
      displayErrorInTerminal: true,
    },
    'mfOptions.dts',
  )(options.dts);
};

export class DtsPlugin implements WebpackPluginInstance {
  options: moduleFederationPlugin.ModuleFederationPluginOptions;
  clonedOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options;
    // Create a shallow clone of the options object to avoid mutating the original
    this.clonedOptions = { ...options };
  }

  apply(compiler: Compiler) {
    const { options, clonedOptions } = this;

    // Clean up query parameters in exposes paths without mutating original
    if (options.exposes && typeof options.exposes === 'object') {
      const cleanedExposes: Record<string, any> = {};
      Object.entries(options.exposes).forEach(([key, value]) => {
        if (typeof value === 'string') {
          cleanedExposes[key] = value.split('?')[0];
        } else {
          cleanedExposes[key] = value;
        }
      });
      clonedOptions.exposes = cleanedExposes;
    }

    const normalizedDtsOptions = normalizeDtsOptions(
      clonedOptions,
      compiler.context,
    );

    if (typeof normalizedDtsOptions !== 'object') {
      return;
    }

    let fetchRemoteTypeUrlsResolve: (
      options: moduleFederationPlugin.RemoteTypeUrls,
    ) => void;
    const fetchRemoteTypeUrlsPromise: Promise<
      moduleFederationPlugin.DtsHostOptions['remoteTypeUrls'] | undefined
    > = new Promise((resolve) => {
      fetchRemoteTypeUrlsResolve = resolve;
    });

    let generateTypesPromiseResolve;
    const generateTypesPromise: Promise<void> = new Promise((resolve) => {
      generateTypesPromiseResolve = resolve;
    });

    // Because the plugin will delete dist/@mf-types.zip while generating types, which will be used in GenerateTypesPlugin
    // So it should apply after GenerateTypesPlugin
    new DevPlugin(
      clonedOptions,
      normalizedDtsOptions,
      generateTypesPromise,
      fetchRemoteTypeUrlsPromise,
    ).apply(compiler);

    // The exposes files may use remote types, so it need to consume types first, otherwise the generate types will fail
    new GenerateTypesPlugin(
      clonedOptions,
      normalizedDtsOptions,
      fetchRemoteTypeUrlsPromise,
      generateTypesPromiseResolve,
    ).apply(compiler);

    new ConsumeTypesPlugin(
      clonedOptions,
      normalizedDtsOptions,
      fetchRemoteTypeUrlsResolve,
    ).apply(compiler);
  }

  addRuntimePlugins() {
    const { options, clonedOptions } = this;
    if (!clonedOptions.runtimePlugins) {
      return;
    }
    if (!options.runtimePlugins) {
      options.runtimePlugins = [];
    }
    clonedOptions.runtimePlugins.forEach((plugin) => {
      options.runtimePlugins.includes(plugin) ||
        options.runtimePlugins.push(plugin);
    });
  }
}
