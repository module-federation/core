declare abstract class ModuleFactory {
  create(
    data: ModuleFactoryCreateData,
    callback: (arg0?: null | Error, arg1?: ModuleFactoryResult) => void,
  ): void;
}

declare interface ModuleFactoryCreateData {
  contextInfo: ModuleFactoryCreateDataContextInfo;
  resolveOptions?: ResolveOptionsWebpackOptions;
  context: string;
  dependencies: Dependency[];
}

declare interface ModuleFactoryCreateDataContextInfo {
  issuer: string;
  issuerLayer?: null | string;
  compiler: string;
}
declare interface ModuleFactoryResult {
  /**
   * the created module or unset if no module was created
   */
  module?: Module;
  fileDependencies?: Set<string>;
  contextDependencies?: Set<string>;
  missingDependencies?: Set<string>;

  /**
   * allow to use the unsafe cache
   */
  cacheable?: boolean;
}
