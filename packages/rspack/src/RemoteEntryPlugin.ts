import pBtoa from 'btoa';
import { ContainerManager } from '@module-federation/managers';
import logger from './logger';

import type { Compiler, RspackPluginInstance } from '@rspack/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';
// @ts-ignore

const charMap: Record<string, string> = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\\': '\\\\',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\0': '\\0',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

function escapeUnsafeChars(str: string) {
  return str.replace(/[<>\b\f\n\r\t\0\u2028\u2029\\]/g, (x) => charMap[x]);
}

export class RemoteEntryPlugin implements RspackPluginInstance {
  readonly name = 'VmokRemoteEntryPlugin';
  _options: moduleFederationPlugin.ModuleFederationPluginOptions;

  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this._options = options;
  }

  apply(compiler: Compiler): void {
    const { name, getPublicPath } = this._options;
    if (!getPublicPath || !name) {
      return;
    }
    const containerManager = new ContainerManager();
    containerManager.init(this._options);
    if (!containerManager.enable) {
      logger.warn(
        "Detect you don't set exposes, 'getPublicPath' will not have effect.",
      );
      return;
    }
    let code;
    const sanitizedPublicPath = escapeUnsafeChars(getPublicPath);

    if (!getPublicPath.startsWith('function')) {
      code = `${
        compiler.webpack.RuntimeGlobals.publicPath
      } = new Function(${JSON.stringify(sanitizedPublicPath)})()`;
    } else {
      code = `(${sanitizedPublicPath}())`;
    }
    const base64Code = pBtoa(code);
    const dataUrl = `data:text/javascript;base64,${base64Code}`;

    compiler.hooks.afterPlugins.tap('VmokRemoteEntryPlugin', () => {
      new compiler.webpack.EntryPlugin(compiler.context, dataUrl, {
        name: name,
      }).apply(compiler);
    });
  }
}
