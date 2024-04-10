import {
  normalizeOptions,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import type { Compiler, WebpackPluginInstance } from 'webpack';
import { ConsumeTypesPlugin } from './ConsumeTypesPlugin';
import { GenerateTypesPlugin } from './GenerateTypesPlugin';
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

    if (typeof normalizedDtsOptions !== 'object') {
      return;
    }

    new GenerateTypesPlugin(
      options,
      normalizedDtsOptions,
      defaultGenerateTypes,
    ).apply(compiler);
    new ConsumeTypesPlugin(
      options,
      normalizedDtsOptions,
      defaultConsumeTypes,
    ).apply(compiler);
  }
}

export { TypesPlugin };
