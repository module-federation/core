import type { Compilation, Compiler, Chunk } from 'webpack';

type EnhancedModuleExports = typeof import('@module-federation/enhanced');
type InvertedContainerRuntimeModuleFactory =
  typeof import('./InvertedContainerRuntimeModule').default;

const runtimeRequireFromModule = new Function(
  'moduleRef',
  'id',
  'return moduleRef && moduleRef.require ? moduleRef.require(id) : undefined',
) as (moduleRef: { require(id: string): any } | undefined, id: string) => any;

const runtimeRequire = (id: string) =>
  runtimeRequireFromModule(
    typeof module !== 'undefined' ? module : undefined,
    id,
  );

const loadEnhanced = (): EnhancedModuleExports => {
  const enhancedModule = runtimeRequire('@module-federation/enhanced') as
    | EnhancedModuleExports
    | { default: EnhancedModuleExports };

  return (enhancedModule as { default?: EnhancedModuleExports }).default
    ? (enhancedModule as { default: EnhancedModuleExports }).default
    : (enhancedModule as EnhancedModuleExports);
};

const loadInvertedContainerRuntimeModule =
  (): InvertedContainerRuntimeModuleFactory => {
    const runtimeModule = runtimeRequire('./InvertedContainerRuntimeModule') as
      | InvertedContainerRuntimeModuleFactory
      | { default: InvertedContainerRuntimeModuleFactory };

    return (
      runtimeModule as { default?: InvertedContainerRuntimeModuleFactory }
    ).default
      ? (runtimeModule as { default: InvertedContainerRuntimeModuleFactory })
          .default
      : (runtimeModule as InvertedContainerRuntimeModuleFactory);
  };

class InvertedContainerPlugin {
  public apply(compiler: Compiler): void {
    const { FederationModulesPlugin, dependencies } = loadEnhanced();
    const createInvertedContainerRuntimeModule =
      loadInvertedContainerRuntimeModule();
    const InvertedContainerRuntimeModule = createInvertedContainerRuntimeModule(
      compiler.webpack,
    );

    compiler.hooks.thisCompilation.tap(
      'EmbeddedContainerPlugin',
      (compilation: Compilation) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const containers = new Set();
        hooks.addContainerEntryDependency.tap(
          'EmbeddedContainerPlugin',
          (dependency) => {
            if (dependency instanceof dependencies.ContainerEntryDependency) {
              containers.add(dependency);
            }
          },
        );
        // Adding the runtime module
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'EmbeddedContainerPlugin',
          (chunk, set) => {
            compilation.addRuntimeModule(
              chunk,
              new InvertedContainerRuntimeModule({
                containers,
              }),
            );
          },
        );
      },
    );
  }
}

export default InvertedContainerPlugin;
