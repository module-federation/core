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
    let code;
    if (!this._getPublicPath.startsWith('function')) {
      code = `${
        compiler.webpack.RuntimeGlobals.publicPath
      } = new Function(${JSON.stringify(this._getPublicPath)})()`;
    } else {
      code = `(${this._getPublicPath})()`;
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
