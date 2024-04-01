import path from 'path';
import fs from 'fs';
import { RspackPluginInstance } from '@rspack/core';
import {
  moduleFederationPlugin,
  normalizeOptions,
} from '@module-federation/sdk';
import {
  NativeFederationTypeScriptHost,
  NativeFederationTypeScriptRemote,
} from '@module-federation/native-federation-typescript/rspack';

export class TypesPlugin implements RspackPluginInstance {
  options: moduleFederationPlugin.ModuleFederationPluginOptions;
  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options;
  }
  apply(compiler) {
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
            extractRemoteTypes: true,
            extractThirdParty: true,
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
