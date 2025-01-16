import type { Compiler, RspackPluginInstance } from '@rspack/core';
// @ts-ignore
import pBtoa from 'btoa';

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
  private _name: string;
  private _getPublicPath: string;

  constructor(name: string, getPublicPath: string) {
    this._name = name;
    this._getPublicPath = getPublicPath;
  }

  apply(compiler: Compiler): void {
    let code;
    const sanitizedPublicPath = escapeUnsafeChars(this._getPublicPath);

    if (!this._getPublicPath.startsWith('function')) {
      code = `${
        compiler.webpack.RuntimeGlobals.publicPath
      } = new Function(${JSON.stringify(sanitizedPublicPath)})()`;
    } else {
      code = `(${sanitizedPublicPath}(${compiler.webpack.RuntimeGlobals.publicPath}))`;
    }
    const base64Code = pBtoa(code);
    const dataUrl = `data:text/javascript;base64,${base64Code}`;

    compiler.hooks.afterPlugins.tap('VmokRemoteEntryPlugin', () => {
      new compiler.webpack.EntryPlugin(compiler.context, dataUrl, {
        name: this._name,
      }).apply(compiler);
    });
  }
}
