export = DllReferencePlugin;
declare class DllReferencePlugin {
  /**
   * @param {DllReferencePluginOptions} options options object
   */
  constructor(options: DllReferencePluginOptions);
  options: import('../declarations/plugins/DllReferencePlugin').DllReferencePluginOptions;
  /** @type {WeakMap<Object, {path: string, data: DllReferencePluginOptionsManifest?, error: Error?}>} */
  _compilationData: WeakMap<
    any,
    {
      path: string;
      data: DllReferencePluginOptionsManifest | null;
      error: Error | null;
    }
  >;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DllReferencePlugin {
  export {
    Externals,
    DllReferencePluginOptions,
    DllReferencePluginOptionsManifest,
    Compiler,
  };
}
type DllReferencePluginOptionsManifest =
  import('../declarations/plugins/DllReferencePlugin').DllReferencePluginOptionsManifest;
type Compiler = import('./Compiler');
type DllReferencePluginOptions =
  import('../declarations/plugins/DllReferencePlugin').DllReferencePluginOptions;
type Externals = import('../declarations/WebpackOptions').Externals;
