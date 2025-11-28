import type {
  WebpackPluginInstance,
  Compiler,
  Dependency,
  dependencies,
} from 'webpack';
import {
  moduleFederationPlugin,
  type Stats,
  getManifestFileName,
} from '@module-federation/sdk';
import SharedUsedExportsOptimizerRuntimeModule from './SharedUsedExportsOptimizerRuntimeModule';
import { NormalizedSharedOptions } from '../SharePlugin';
import ConsumeSharedModule from '../ConsumeSharedModule';
import ProvideSharedModule from '../ProvideSharedModule';

type ReferencedExports = Map<string, Map<string, Set<string>>>;

export type CustomReferencedExports = { [sharedName: string]: string[] };

function isHarmonyImportSpecifierDependency(
  dependency: Dependency,
): dependency is dependencies.HarmonyImportSpecifierDependency {
  return dependency.type === 'harmony import specifier';
}

export default class SharedUsedExportsOptimizerPlugin
  implements WebpackPluginInstance
{
  name = 'SharedUsedExportsOptimizerPlugin';

  sharedReferencedExports: ReferencedExports;
  private sharedOptions: NormalizedSharedOptions;
  private injectUsedExports: boolean;
  private manifestOptions: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'];
  ignoredRuntime: string[];

  constructor(
    sharedOptions: NormalizedSharedOptions,
    injectUsedExports?: boolean,
    ignoredRuntime?: string[],
    manifestOptions?: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'],
  ) {
    this.sharedOptions = sharedOptions;
    this.injectUsedExports = injectUsedExports ?? true;
    this.manifestOptions = manifestOptions ?? {};
    this.sharedReferencedExports = new Map();
    this.sharedOptions.forEach(([key, _config]) => {
      this.sharedReferencedExports.set(key, new Map());
    });
    this.ignoredRuntime = ignoredRuntime || [];
  }

  private applyCustomReferencedExports(runtimeSet: Set<string>) {
    const { sharedReferencedExports, sharedOptions } = this;
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
    });
  }

  apply(compiler: Compiler) {
    const {
      sharedReferencedExports,
      sharedOptions,
      injectUsedExports,
      manifestOptions,
    } = this;
    if (!sharedOptions.length) {
      return;
    }
    const runtimeSet: Set<string> = new Set();
    compiler.hooks.compilation.tap(
      'SharedUsedExportsOptimizerPlugin',
      (compilation) => {
        // collect referenced export
        compilation.hooks.dependencyReferencedExports.tap(
          'SharedUsedExportsOptimizerPlugin',
          (referencedExports, dependency, runtime) => {
            runtimeSet.add(runtime as string);
            if (!('request' in dependency)) {
              return referencedExports;
            }
            const shareKey = dependency.request;
            if (
              typeof shareKey !== 'string' ||
              !isHarmonyImportSpecifierDependency(dependency) ||
              sharedOptions.every(([key]) => key !== shareKey)
            ) {
              return referencedExports;
            }
            let currentReferencedExports = referencedExports;
            if (dependency.ids && dependency.ids[0] === 'default') {
              const { ids, referencedPropertiesInDestructuring } = dependency;
              const getOriginalReferencedExports = () => {
                if (referencedPropertiesInDestructuring) {
                  /** @type {string[][]} */
                  const refs = [];
                  for (const key of referencedPropertiesInDestructuring) {
                    refs.push({
                      name: ids ? ids.concat([key]) : [key],
                      canMangle: false,
                    });
                  }
                  return refs;
                }
                return ids ? [ids] : [[]];
              };
              currentReferencedExports = getOriginalReferencedExports();
            }
            if (!currentReferencedExports.length) {
              return referencedExports;
            }

            currentReferencedExports.forEach((item) => {
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
            name: 'SharedUsedExportsOptimizerPlugin',
            stage: 1,
          },
          (modules) => {
            this.applyCustomReferencedExports(runtimeSet);
            const sharedModules = [...modules].filter((m) =>
              ['consume-shared-module', 'provide-module'].includes(m.type),
            ) as (ConsumeSharedModule | ProvideSharedModule)[];
            const moduleGraph = compilation.moduleGraph;
            sharedModules.forEach((module) => {
              const shareKey =
                (module as ConsumeSharedModule).options?.shareKey ||
                // @ts-expect-error FIXME: need to add general shareKey field
                (module as ProvideSharedModule)._name;
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
                (m) => 'rawRequest' in m && m.rawRequest === shareKey,
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
        if (manifestOptions) {
          compilation.hooks.processAssets.tapPromise(
            {
              name: 'injectReferenceExports',
              stage: (compilation.constructor as any)
                .PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
            },
            async () => {
              const { statsFileName } = getManifestFileName(manifestOptions);
              const stats = compilation.getAsset(statsFileName);
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
                statsFileName,
                new compiler.webpack.sources.RawSource(
                  JSON.stringify(statsContent),
                ),
              );
            },
          );
        }

        if (!injectUsedExports) {
          return;
        }
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'SharedUsedExportsOptimizerPlugin',
          (chunk, set) => {
            set.add(compiler.webpack.RuntimeGlobals.runtimeId);

            // inject usedExports info to bundler runtime
            compilation.addRuntimeModule(
              chunk,
              new SharedUsedExportsOptimizerRuntimeModule(
                this.sharedReferencedExports,
              ),
            );
          },
        );
      },
    );
  }
}
