import type { WebpackPluginInstance, Compiler, Dependency } from 'webpack';
import { StatsFileName } from '@module-federation/sdk';
import OptimizeDependencyReferencedExportsRuntimeModule from './OptimizeDependencyReferencedExportsRuntimeModule';
import type { Stats } from '@module-federation/sdk';
import type { ReferencedExports } from './OptimizeDependencyReferencedExportsRuntimeModule';
import type { SharedConfig } from '../../../declarations/plugins/sharing/SharePlugin';

export type CustomReferencedExports = { [sharedName: string]: string[] };

export default class OptimizeDependencyReferencedExportsPlugin
  implements WebpackPluginInstance
{
  sharedOptions: [string, SharedConfig][];
  sharedReferencedExports: ReferencedExports;
  name = 'OptimizeDependencyReferencedExportsPlugin';
  ignoredRuntime: string[];

  constructor(
    sharedOptions: [string, SharedConfig][],
    ignoredRuntime?: string[],
  ) {
    this.sharedOptions = sharedOptions;
    this.sharedReferencedExports = new Map();
    this.ignoredRuntime = ignoredRuntime || [];

    this.sharedOptions.forEach(([key, _config]) => {
      this.sharedReferencedExports.set(key, new Map());
    });
  }

  private getCustomReferencedExports(): CustomReferencedExports {
    try {
      const customReferencedExports = JSON.parse(
        process.env['MF_CUSTOM_REFERENCED_EXPORTS'] || '',
      );
      return customReferencedExports;
    } catch (e) {
      return {};
    }
  }

  private applyCustomReferencedExports(runtimeSet: Set<string>) {
    const { sharedReferencedExports, sharedOptions } = this;
    const customReferencedExports = this.getCustomReferencedExports();
    if (!Object.keys(customReferencedExports).length) {
      return;
    }
    const addCustomExports = (
      shareKey: string,
      runtime: string,
      exports: string[],
    ) => {
      if (!sharedReferencedExports.get(shareKey)) {
        sharedReferencedExports.set(shareKey, new Map());
      }
      const sharedExports = sharedReferencedExports.get(shareKey)!;
      if (!sharedExports.get(runtime)) {
        sharedExports.set(runtime, new Set());
      }
      const runtimeExports = sharedExports.get(runtime)!;
      exports.forEach((item) => {
        runtimeExports.add(item);
      });
    };
    runtimeSet.forEach((runtime) => {
      if (this.ignoredRuntime.includes(runtime)) {
        return;
      }
      sharedOptions.forEach(([shareKey, config]) => {
        if (config.usedExports) {
          addCustomExports(shareKey, runtime, config.usedExports);
        }
      });

      Object.keys(customReferencedExports).forEach((shareKey) => {
        const customExports = customReferencedExports[shareKey];
        addCustomExports(shareKey, runtime, customExports);
      });
    });
  }

  apply(compiler: Compiler) {
    const { sharedReferencedExports, sharedOptions } = this;
    const runtimeSet: Set<string> = new Set();
    compiler.hooks.compilation.tap(
      'OptimizeDependencyReferencedExportsPlugin',
      (compilation) => {
        // collect referenced export
        compilation.hooks.dependencyReferencedExports.tap(
          'OptimizeDependencyReferencedExportsPlugin',
          (referencedExports, dependency, runtime) => {
            runtimeSet.add(runtime as string);
            if (!('request' in dependency)) {
              return referencedExports;
            }
            const shareKey = dependency.request;
            if (
              typeof shareKey !== 'string' ||
              dependency.type !== 'harmony import specifier' ||
              sharedOptions.every(([key]) => key !== shareKey)
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
                const moduleExports = sharedReferencedExports.get(shareKey);
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

        // treeshake shared module
        compilation.hooks.optimizeDependencies.tap(
          {
            name: 'OptimizeDependencyReferencedExportsPlugin',
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
              if (
                !sharedOptions.find(([key]) => key === shareKey)?.[1].treeshake
              ) {
                return;
              }
              const runtimeReferenceExports =
                sharedReferencedExports.get(shareKey);
              if (!runtimeReferenceExports || !runtimeReferenceExports.size) {
                return;
              }
              const realSharedModule = [...modules].find(
                (m) =>
                  'rawRequest' in m &&
                  // @ts-ignore
                  m.rawRequest === shareKey,
              );
              if (realSharedModule?.factoryMeta?.sideEffectFree !== true) {
                runtimeReferenceExports.clear();
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

        // inject reference exports to stats
        compilation.hooks.processAssets.tapPromise(
          {
            name: 'injectReferenceExports',
            stage:
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              (compilation.constructor as any)
                .PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
          },
          async () => {
            const stats = compilation.getAsset(StatsFileName);
            if (!stats) {
              return;
            }
            const statsContent = JSON.parse(
              stats.source.source().toString(),
            ) as Stats;

            for (const key of sharedReferencedExports.keys()) {
              const sharedModule = statsContent.shared.find(
                (s: any) => s.name === key,
              );
              if (!sharedModule) {
                continue;
              }

              const sharedReferenceExports = sharedReferencedExports.get(key);
              if (!sharedReferenceExports) {
                continue;
              }
              sharedModule.usedExports = [
                ...sharedReferenceExports.entries(),
              ].reduce((acc, item) => {
                item[1].forEach((exportName) => {
                  if (!acc.includes(exportName)) {
                    acc.push(exportName);
                  }
                });
                return acc;
              }, [] as string[]);
            }

            compilation.updateAsset(
              StatsFileName,
              new compiler.webpack.sources.RawSource(
                JSON.stringify(statsContent),
              ),
            );
          },
        );

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'OptimizeDependencyReferencedExportsPlugin',
          (chunk, set) => {
            set.add(compiler.webpack.RuntimeGlobals.runtimeId);

            // inject usedExports info to bundler runtime
            compilation.addRuntimeModule(
              chunk,
              new OptimizeDependencyReferencedExportsRuntimeModule(
                this.sharedReferencedExports,
              ),
            );
          },
        );
      },
    );
  }
}
