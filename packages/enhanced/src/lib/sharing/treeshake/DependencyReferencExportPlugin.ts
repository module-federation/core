import type { WebpackPluginInstance, Compiler, Dependency } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

export type CustomReferencedExports = { [sharedName: string]: string[] };
export default class DependencyReferencExportPlugin
  implements WebpackPluginInstance
{
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  sharedRequest: string[];
  sharedReferenceExports: Map<string, Map<string, Set<string>>>;
  name = 'DependencyReferencExportPlugin';
  customReferencedExports: CustomReferencedExports;
  ignoredRuntime: string[];

  constructor(
    mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
    ignoredRuntime?: string[],
    customReferencedExports?: CustomReferencedExports,
  ) {
    this.mfConfig = mfConfig;
    this.sharedRequest = [];
    this.sharedReferenceExports = new Map();
    this.ignoredRuntime = ignoredRuntime || [];

    Object.keys(this.mfConfig.shared || {}).forEach((key) => {
      this.sharedRequest.push(key);
      this.sharedReferenceExports.set(key, new Map());
    });

    this.customReferencedExports = customReferencedExports || {};
  }

  private applyCustomReferencedExports(runtimeSet: Set<string>) {
    const { sharedReferenceExports, customReferencedExports } = this;
    if (!Object.keys(customReferencedExports).length) {
      return;
    }
    runtimeSet.forEach((runtime) => {
      if (this.ignoredRuntime.includes(runtime)) {
        return;
      }
      Object.keys(customReferencedExports).forEach((shareKey) => {
        const customExports = this.customReferencedExports[shareKey];
        if (!sharedReferenceExports.get(shareKey)) {
          sharedReferenceExports.set(shareKey, new Map());
        }
        const sharedExports = sharedReferenceExports.get(shareKey)!;
        if (!sharedExports.get(runtime)) {
          sharedExports.set(runtime, new Set());
        }
        const runtimeExports = sharedExports.get(runtime)!;
        customExports.forEach((item) => {
          runtimeExports.add(item);
        });
      });
    });
  }

  apply(compiler: Compiler) {
    const { sharedReferenceExports, sharedRequest, customReferencedExports } =
      this;
    const runtimeSet: Set<string> = new Set();
    compiler.hooks.compilation.tap(
      'DependencyReferencExportPlugin',
      (compilation) => {
        compilation.hooks.dependencyReferencedExports.tap(
          'DependencyReferencExportPlugin',
          (referencedExports, dependency, runtime) => {
            runtimeSet.add(runtime as string);
            if (!('request' in dependency)) {
              return referencedExports;
            }
            const shareKey = dependency.request;
            if (
              typeof shareKey !== 'string' ||
              dependency.type !== 'harmony import specifier' ||
              !sharedRequest.includes(shareKey)
            ) {
              return referencedExports;
            }
            if (!referencedExports.length) {
              return referencedExports;
            }

            referencedExports.forEach((item) => {
              if (!Array.isArray(item)) {
                return;
              }
              if (typeof runtime !== 'string') {
                return;
              }
              item.forEach((i) => {
                const moduleExports = sharedReferenceExports.get(shareKey);
                if (!moduleExports) {
                  return;
                }
                let runtimeExports: Set<string> | undefined =
                  moduleExports.get(runtime);
                if (!runtimeExports) {
                  runtimeExports = new Set();
                  moduleExports.set(runtime, runtimeExports);
                }
                runtimeExports.add(i);
              });
            });

            return referencedExports;
          },
        );

        compilation.hooks.optimizeDependencies.tap(
          {
            name: 'DependencyReferencExportPlugin',
            stage: 1,
          },
          (modules) => {
            this.applyCustomReferencedExports(runtimeSet);
            const sharedModules = [...modules].filter((m) =>
              [
                'consume-shared-module',
                'provide-module',
                'shaked-shared-module',
              ].includes(m.type),
            );
            const moduleGraph = compilation.moduleGraph;
            sharedModules.forEach((module) => {
              // @ts-ignore FIXME: need to add general shareKey field
              const shareKey = module.options?.shareKey || module._name;
              if (!shareKey) {
                return;
              }
              const runtimeReferenceExports =
                sharedReferenceExports.get(shareKey);
              if (!runtimeReferenceExports || !runtimeReferenceExports.size) {
                return;
              }

              // mark used exports
              const handleDependency = (dep: Dependency) => {
                [...runtimeReferenceExports.keys()].forEach((runtime) => {
                  const usedExport = [
                    ...(runtimeReferenceExports.get(runtime) || []),
                  ];

                  const referencedModule = moduleGraph.getModule(dep);
                  if (!referencedModule) return;

                  const exportsInfo =
                    moduleGraph.getExportsInfo(referencedModule);

                  for (let i = 0; i < usedExport.length; i++) {
                    const exportInfo = exportsInfo.getExportInfo(usedExport[i]);
                    exportInfo.setUsed(
                      compiler.webpack.UsageState.Used,
                      runtime,
                    );
                  }
                });
              };

              module.blocks.forEach((block) => {
                block.dependencies.forEach((dep) => {
                  handleDependency(dep);
                });
              });

              module.dependencies.forEach((dep) => {
                handleDependency(dep);
              });

              module.factoryMeta ||= {};
              module.factoryMeta.sideEffectFree = true;

              const realSharedModule = [...modules].find(
                (m) =>
                  'rawRequest' in m &&
                  // @ts-ignore
                  m.rawRequest === (module._request || shareKey),
              );
              if (!realSharedModule) {
                return;
              }
              const exportsInfo =
                compilation.moduleGraph.getExportsInfo(realSharedModule);
              let canUpdateModuleUsedStage = true;

              runtimeReferenceExports.forEach((_, runtime) => {
                for (const subExport of exportsInfo.exports) {
                  if (subExport.getUsed(runtime) !== 3) {
                    if (
                      runtimeReferenceExports.get(runtime)?.has(subExport.name)
                    ) {
                      continue;
                    }
                    canUpdateModuleUsedStage = false;
                    break;
                  }
                }
              });

              if (canUpdateModuleUsedStage) {
                runtimeReferenceExports.forEach((_, runtime) => {
                  for (const exportInfo of exportsInfo.exports) {
                    exportInfo.setUsedConditionally(
                      (used) => used === 3,
                      0,
                      runtime,
                    );
                  }
                  exportsInfo.otherExportsInfo.setUsedConditionally(
                    (used) => used === 3,
                    0,
                    runtime,
                  );
                });
              }
            });
          },
        );

        compilation.hooks.processAssets.tapPromise(
          {
            name: 'generateStats',
            stage:
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              (compilation.constructor as any)
                .PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
          },
          async () => {
            const manifest = compilation.getAsset('mf-manifest.json');
            if (!manifest) {
              return;
            }
            const manifestContent = JSON.parse(
              manifest.source.source().toString(),
            );

            for (const key of sharedReferenceExports.keys()) {
              const sharedModule = manifestContent.shared.find(
                (s: any) => s.name === key,
              );
              if (!sharedModule) {
                continue;
              }

              const sharedReferenceExport = sharedReferenceExports.get(key);
              sharedModule.referenceExports = [
                ...sharedReferenceExport!.entries(),
              ].map((item) => {
                return [item[0], [...item[1]]];
              });
            }

            compilation.updateAsset(
              'mf-manifest.json',
              new compiler.webpack.sources.RawSource(
                JSON.stringify(manifestContent),
              ),
            );
          },
        );
      },
    );
  }
}
