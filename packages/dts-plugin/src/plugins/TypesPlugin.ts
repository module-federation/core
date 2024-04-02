import {
  normalizeOptions,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import type { Compiler, WebpackPluginInstance } from 'webpack';
import {
  NativeFederationTypeScriptHost,
  NativeFederationTypeScriptRemote,
} from '@module-federation/native-federation-typescript/webpack';
import { isTSProject } from './utils';

class TypesPlugin implements WebpackPluginInstance {
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
        isTSProject(undefined, compiler.context),
        {
          generateTypes: defaultGenerateTypes,
          consumeTypes: defaultConsumeTypes,
          extraOptions: {},
        },
        'mfOptions.dts',
      )(options.dts);

    if (typeof normalizedDtsOptions === 'object') {
      const normalizedGenerateTypes =
        normalizeOptions<moduleFederationPlugin.DtsRemoteOptions>(
          true,
          defaultGenerateTypes,
          'mfOptions.dts.generateTypes',
        )(normalizedDtsOptions.generateTypes);

      if (normalizedGenerateTypes) {
        NativeFederationTypeScriptRemote({
          remote: {
            implementation: normalizedDtsOptions.implementation,
            context: compiler.context,
            moduleFederationConfig: options,
            ...normalizedGenerateTypes,
          },
          extraOptions: normalizedDtsOptions.extraOptions || {},
          // @ts-ignore
        }).apply(compiler);
      }

      const normalizedConsumeTypes =
        normalizeOptions<moduleFederationPlugin.DtsRemoteOptions>(
          true,
          defaultConsumeTypes,
          'mfOptions.dts.consumeTypes',
        )(normalizedDtsOptions.consumeTypes);
      if (normalizedConsumeTypes) {
        NativeFederationTypeScriptHost({
          host: {
            implementation: normalizedDtsOptions.implementation,
            context: compiler.context,
            moduleFederationConfig: options,
            ...normalizedConsumeTypes,
          },
          extraOptions: normalizedDtsOptions.extraOptions || {},
          // @ts-ignore
        }).apply(compiler);
      }
    }
  }
}

export { TypesPlugin };
