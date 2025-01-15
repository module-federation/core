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
      extractThirdParty: true,
      extractRemoteTypes: true,
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

    let consumeTypesPromiseResolve;
    const consumeTypesPromise: Promise<void> = new Promise((resolve) => {
      consumeTypesPromiseResolve = resolve;
    });

    let generateTypesPromiseResolve;
    const generateTypesPromise: Promise<void> = new Promise((resolve) => {
      generateTypesPromiseResolve = resolve;
    });

    // Because the plugin will delete dist/@mf-types.zip while generating types, which will be used in GenerateTypesPlugin
    // So it should apply after GenerateTypesPlugin
    new DevPlugin(options, normalizedDtsOptions, generateTypesPromise).apply(
      compiler,
    );

    // The exposes files may use remote types, so it need to consume types first, otherwise the generate types will fail
    new GenerateTypesPlugin(
      options,
      normalizedDtsOptions,
      defaultGenerateTypes,
      consumeTypesPromise,
      generateTypesPromiseResolve,
    ).apply(compiler);

    new ConsumeTypesPlugin(
      options,
      normalizedDtsOptions,
      defaultConsumeTypes,
      consumeTypesPromiseResolve,
    ).apply(compiler);
  }
}
