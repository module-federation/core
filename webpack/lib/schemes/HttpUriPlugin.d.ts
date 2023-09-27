export = HttpUriPlugin;
declare class HttpUriPlugin {
  /**
   * @param {HttpUriPluginOptions} options options
   */
  constructor(options: HttpUriPluginOptions);
  _lockfileLocation: string;
  _cacheLocation: string | false;
  _upgrade: boolean;
  _frozen: boolean;
  _allowedUris: import('../../declarations/plugins/schemes/HttpUriPlugin').HttpUriOptionsAllowedUris;
  _proxy: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace HttpUriPlugin {
  export { HttpUriPluginOptions, Compiler, LockfileEntry };
}
type Compiler = import('../Compiler');
type HttpUriPluginOptions =
  import('../../declarations/plugins/schemes/HttpUriPlugin').HttpUriPluginOptions;
type LockfileEntry = {
  resolved: string;
  integrity: string;
  contentType: string;
};
