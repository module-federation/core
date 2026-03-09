export = ExternalModuleFactoryPlugin;
declare class ExternalModuleFactoryPlugin {
  /**
   * @param {ExternalsType} type default external type
   * @param {Externals} externals externals config
   */
  constructor(type: ExternalsType, externals: Externals);
  type: import('../declarations/WebpackOptions').ExternalsType;
  externals: import('../declarations/WebpackOptions').Externals;
  /**
   * @param {NormalModuleFactory} normalModuleFactory the normal module factory
   * @returns {void}
   */
  apply(normalModuleFactory: NormalModuleFactory): void;
}
declare namespace ExternalModuleFactoryPlugin {
  export {
    ResolveContext,
    ResolveOptions,
    ExternalsType,
    ExternalItemValue,
    ExternalItemObjectKnown,
    ExternalItemObjectUnknown,
    Externals,
    DependencyMeta,
    IssuerLayer,
    ModuleFactoryCreateDataContextInfo,
    NormalModuleFactory,
    ExternalItemFunctionDataGetResolveCallbackResult,
    ExternalItemFunctionDataGetResolveResult,
    ExternalItemFunctionDataGetResolve,
    ExternalItemFunctionData,
    ExternalItemFunctionCallback,
    ExternalItemFunctionPromise,
    ExternalItemObject,
    ExternalWeakCache,
    ExternalValue,
  };
}
type ResolveContext = import('enhanced-resolve').ResolveContext;
type ResolveOptions = import('../declarations/WebpackOptions').ResolveOptions;
type ExternalsType = import('../declarations/WebpackOptions').ExternalsType;
type ExternalItemValue =
  import('../declarations/WebpackOptions').ExternalItemValue;
type ExternalItemObjectKnown =
  import('../declarations/WebpackOptions').ExternalItemObjectKnown;
type ExternalItemObjectUnknown =
  import('../declarations/WebpackOptions').ExternalItemObjectUnknown;
type Externals = import('../declarations/WebpackOptions').Externals;
type DependencyMeta = import('./ExternalModule').DependencyMeta;
type IssuerLayer = import('./ModuleFactory').IssuerLayer;
type ModuleFactoryCreateDataContextInfo =
  import('./ModuleFactory').ModuleFactoryCreateDataContextInfo;
type NormalModuleFactory = import('./NormalModuleFactory');
type ExternalItemFunctionDataGetResolveCallbackResult = (
  context: string,
  request: string,
  callback: (
    err?: Error | null,
    result?: string | false,
    resolveRequest?: import('enhanced-resolve').ResolveRequest,
  ) => void,
) => void;
type ExternalItemFunctionDataGetResolveResult = (
  context: string,
  request: string,
) => Promise<string>;
type ExternalItemFunctionDataGetResolve = (
  options?: ResolveOptions,
) =>
  | ExternalItemFunctionDataGetResolveCallbackResult
  | ExternalItemFunctionDataGetResolveResult;
type ExternalItemFunctionData = {
  /**
   * the directory in which the request is placed
   */
  context: string;
  /**
   * contextual information
   */
  contextInfo: ModuleFactoryCreateDataContextInfo;
  /**
   * the category of the referencing dependency
   */
  dependencyType: string;
  /**
   * get a resolve function with the current resolver options
   */
  getResolve: ExternalItemFunctionDataGetResolve;
  /**
   * the request as written by the user in the require/import expression/statement
   */
  request: string;
};
type ExternalItemFunctionCallback = (
  data: ExternalItemFunctionData,
  callback: (err?: Error | null, result?: ExternalItemValue) => void,
) => void;
type ExternalItemFunctionPromise = (
  data: import('../lib/ExternalModuleFactoryPlugin').ExternalItemFunctionData,
) => Promise<ExternalItemValue>;
type ExternalItemObject = ExternalItemObjectKnown & ExternalItemObjectUnknown;
type ExternalWeakCache<T extends ExternalItemObject> = WeakMap<
  T,
  Map<IssuerLayer, Omit<T, 'byLayer'>>
>;
type ExternalValue =
  | string
  | string[]
  | boolean
  | Record<string, string | string[]>;
