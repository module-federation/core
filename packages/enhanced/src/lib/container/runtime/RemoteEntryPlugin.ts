import type { Compiler, WebpackPluginInstance } from 'webpack';
import pBtoa from 'btoa';

export class RemoteEntryPlugin implements WebpackPluginInstance {
  readonly name = 'VmokRemoteEntryPlugin';
  private _name: string;
  private _getPublicPath: string;

  constructor(name: string, getPublicPath: string) {
    this._name = name;
    this._getPublicPath = getPublicPath;
  }

  apply(compiler: Compiler): void {
    if (!this._getPublicPath.startsWith('function')) {
      throw new Error(
        'getPublicPath: requires a string that starts with "function(path){return path}"',
      );
    }
    const code = ` (${this._getPublicPath})(${compiler.webpack.RuntimeGlobals.publicPath})`;
    const base64Code = btoa(code);
    const dataUrl = `data:text/javascript;base64,${base64Code}`;

    compiler.hooks.afterPlugins.tap('VmokRemoteEntryPlugin', () => {
      new compiler.webpack.EntryPlugin(compiler.context, dataUrl, {
        name: this._name,
      }).apply(compiler);
    });
  }
}
