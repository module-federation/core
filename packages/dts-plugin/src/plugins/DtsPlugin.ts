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
        },
        'mfOptions.dts',
      )(options.dts);

    if (typeof normalizedDtsOptions !== 'object') {
      return;
    }

    let resolve;

    const fetchTypesPromise: Promise<void> = new Promise((res, rej) => {
      resolve = res;
    });

    new DevPlugin(options, fetchTypesPromise).apply(compiler);

    new GenerateTypesPlugin(
      options,
      normalizedDtsOptions,
      defaultGenerateTypes,
      fetchTypesPromise,
    ).apply(compiler);
    new ConsumeTypesPlugin(
      options,
      normalizedDtsOptions,
      defaultConsumeTypes,
      resolve,
    ).apply(compiler);
  }
}
