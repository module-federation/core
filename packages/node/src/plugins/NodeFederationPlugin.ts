'use strict';

import type { Compiler, container } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
import {extractUrlAndGlobal} from "@module-federation/utilities";

interface NodeFederationOptions extends ModuleFederationPluginOptions {
  experiments?: Record<string, unknown>;
  verbose?: boolean;
}

interface Context {
  ModuleFederationPlugin?: typeof container.ModuleFederationPlugin;
}

// possible remote evaluators
// this depends on the chunk format selected.
// commonjs2 - it think, is lazily evaluated - beware
// const remote = eval(scriptContent + '\n  try{' + moduleName + '}catch(e) { null; };');
// commonjs - fine to use but exports marker doesnt exist
// const remote = eval('let exports = {};' + scriptContent + 'exports');
// commonjs-module, ideal since it returns a commonjs module format
// const remote = eval(scriptContent + 'module.exports')


export const parseRemotes = (remotes: Record<string, any>) => Object.entries(remotes).reduce((acc, remote) => {
  if(remote[1].startsWith('internal ')) {
    acc[remote[0]] = remote[1];
    return acc;
  }
  if (!remote[1].startsWith('promise ') && remote[1].includes('@')) {
    acc[remote[0]] = `promise ${parseRemoteSyntax(remote[1])}`;
    return acc;
  }
  acc[remote[0]] = remote[1];
  return acc;
}, {} as Record<string, string>);
// server template to convert remote into promise new promise and use require.loadChunk to load the chunk
export const generateRemoteTemplate = (url: string, global: any) => `new Promise(function (resolve, reject) {
throw new Error("Module Federation: generateRemoteTemplate used");
   return {}
  })`;

export const parseRemoteSyntax = (remote: any) => {
  if (typeof remote === 'string' && remote.includes('@')) {
    const [url, global] = extractUrlAndGlobal(remote);
    return generateRemoteTemplate(url, global);
  }

  return remote;
};


class NodeFederationPlugin {
  private _options: ModuleFederationPluginOptions;
  private context: Context;
  private experiments: NodeFederationOptions['experiments'];

  constructor(
    { experiments, verbose, ...options }: NodeFederationOptions,
    context: Context
  ) {
    this._options = options || ({} as ModuleFederationPluginOptions);
    this.context = context || ({} as Context);
    this.experiments = experiments || {};
  }



  apply(compiler: Compiler) {
    // When used with Next.js, context is needed to use Next.js webpack
    const { webpack } = compiler;

    // const defs = {
    //   'process.env.REMOTES': runtime,
    //   'process.env.REMOTE_CONFIG': hot,
    // };

    // new ((webpack && webpack.DefinePlugin) || require("webpack").DefinePlugin)(
    //     defs
    // ).apply(compiler);
    const pluginOptions = {
      ...this._options,
      remotes: parseRemotes(this._options.remotes || {}) as ModuleFederationPluginOptions['remotes'],
    };

    new (this.context.ModuleFederationPlugin ||
      (webpack && webpack.container.ModuleFederationPlugin) ||
      require('webpack/lib/container/ModuleFederationPlugin'))(
      pluginOptions
    ).apply(compiler);
  }
}


export default NodeFederationPlugin;
