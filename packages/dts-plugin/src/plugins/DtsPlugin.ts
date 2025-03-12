import { DevPlugin } from './DevPlugin';
import { normalizeOptions } from '@module-federation/sdk';
import { ConsumeTypesPlugin } from './ConsumeTypesPlugin';
import { GenerateTypesPlugin } from './GenerateTypesPlugin';
import { isTSProject } from '../core';

import { type moduleFederationPlugin } from '@module-federation/sdk';
import type { Compiler, WebpackPluginInstance } from 'webpack';

export class DtsPlugin implements WebpackPluginInstance {
  options: moduleFederationPlugin.ModuleFederationPluginOptions;
  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    const { options } = this;

    const defaultGenerateTypes = {
      generateAPITypes: true,
      compileInChildProcess: true,
      abortOnError: false,
      extractThirdParty: false,
      extractRemoteTypes: false,
    };
    const defaultConsumeTypes = { abortOnError: false, consumeAPITypes: true };
    const normalizedDtsOptions =
      normalizeOptions<moduleFederationPlugin.PluginDtsOptions>(
        isTSProject(options.dts, compiler.context),
        {
          generateTypes: defaultGenerateTypes,
          consumeTypes: defaultConsumeTypes,
          extraOptions: {},
          displayErrorInTerminal: true,
        },
        'mfOptions.dts',
      )(options.dts);

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
      options,
      normalizedDtsOptions,
      generateTypesPromise,
      fetchRemoteTypeUrlsPromise,
    ).apply(compiler);

    // The exposes files may use remote types, so it need to consume types first, otherwise the generate types will fail
    new GenerateTypesPlugin(
      options,
      normalizedDtsOptions,
      defaultGenerateTypes,
      fetchRemoteTypeUrlsPromise,
      generateTypesPromiseResolve,
    ).apply(compiler);

    new ConsumeTypesPlugin(
      options,
      normalizedDtsOptions,
      defaultConsumeTypes,
      fetchRemoteTypeUrlsResolve,
    ).apply(compiler);
  }
}
