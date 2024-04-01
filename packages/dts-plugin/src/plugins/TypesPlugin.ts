import path from 'path';
import fs from 'fs';
import {
  normalizeOptions,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import type { Compiler, WebpackPluginInstance } from 'webpack';
import {
  NativeFederationTypeScriptHost,
  NativeFederationTypeScriptRemote,
} from '@module-federation/native-federation-typescript/webpack';

class TypesPlugin implements WebpackPluginInstance {
  options: moduleFederationPlugin.ModuleFederationPluginOptions;
  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    const { options } = this;
    const isTSProject = (tsConfigPath?: string, context = process.cwd()) => {
      try {
        let filepath = tsConfigPath
          ? tsConfigPath
          : path.resolve(context, './tsconfig.json');
        if (!path.isAbsolute(filepath)) {
          filepath = path.resolve(context, filepath);
        }
        return fs.existsSync(filepath);
      } catch (err) {
        return false;
      }
    };

    const normalizedDtsOptions =
      normalizeOptions<moduleFederationPlugin.PluginDtsOptions>(
        isTSProject(undefined, compiler.context),
        {
          disableGenerateTypes: false,
          disableConsumeTypes: false,
          remote: {
            generateAPITypes: true,
            compileInChildProcess: true,
            abortOnError: false,
            extractThirdParty: true,
            extractRemoteTypes: true,
          },
          host: { abortOnError: false, consumeAPITypes: true },
          extraOptions: {},
        },
        'mfOptions.dts',
      )(options.dts);
    if (typeof normalizedDtsOptions === 'object') {
      if (!normalizedDtsOptions.disableGenerateTypes) {
        NativeFederationTypeScriptRemote({
          remote: {
            implementation: normalizedDtsOptions.implementation,
            context: compiler.context,
            moduleFederationConfig: options,
            ...normalizedDtsOptions.remote,
          },
          extraOptions: normalizedDtsOptions.extraOptions || {},
          // @ts-ignore
        }).apply(compiler);
      }
      if (!normalizedDtsOptions.disableConsumeTypes) {
        NativeFederationTypeScriptHost({
          host: {
            implementation: normalizedDtsOptions.implementation,
            context: compiler.context,
            moduleFederationConfig: options,
            ...normalizedDtsOptions.host,
          },
          extraOptions: normalizedDtsOptions.extraOptions || {},
          // @ts-ignore
        }).apply(compiler);
      }
    }
  }
}

export { TypesPlugin };
