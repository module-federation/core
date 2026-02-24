export = DelegatedModuleFactoryPlugin;
declare class DelegatedModuleFactoryPlugin {
  /**
   * @param {Options} options options
   */
  constructor(options: Options);
  options: Options;
  /**
   * @param {NormalModuleFactory} normalModuleFactory the normal module factory
   * @returns {void}
   */
  apply(normalModuleFactory: NormalModuleFactory): void;
}
declare namespace DelegatedModuleFactoryPlugin {
  export {
    DllReferencePluginOptions,
    DllReferencePluginOptionsContent,
    DelegatedModuleSourceRequest,
    DelegatedModuleType,
    NormalModuleFactory,
    AssociatedObjectForCache,
    Options,
  };
}
type DllReferencePluginOptions =
  import('../declarations/plugins/DllReferencePlugin').DllReferencePluginOptions;
type DllReferencePluginOptionsContent =
  import('../declarations/plugins/DllReferencePlugin').DllReferencePluginOptionsContent;
type DelegatedModuleSourceRequest =
  import('./DelegatedModule').DelegatedModuleSourceRequest;
type DelegatedModuleType = import('./DelegatedModule').DelegatedModuleType;
type NormalModuleFactory = import('./NormalModuleFactory');
type AssociatedObjectForCache =
  import('./util/identifier').AssociatedObjectForCache;
type Options = {
  /**
   * source
   */
  source: DelegatedModuleSourceRequest;
  /**
   * absolute context path to which lib ident is relative to
   */
  context: NonNullable<DllReferencePluginOptions['context']>;
  /**
   * content
   */
  content: DllReferencePluginOptionsContent;
  /**
   * type
   */
  type: DllReferencePluginOptions['type'];
  /**
   * extensions
   */
  extensions: DllReferencePluginOptions['extensions'];
  /**
   * scope
   */
  scope: DllReferencePluginOptions['scope'];
  /**
   * object for caching
   */
  associatedObjectForCache?: AssociatedObjectForCache | undefined;
};
