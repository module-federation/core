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
import SharedUsedExportsOptimizerRuntimeModule, {
  ReferencedExports,
} from './SharedUsedExportsOptimizerRuntimeModule';
import { NormalizedSharedOptions } from '../SharePlugin';
import ConsumeSharedModule from '../ConsumeSharedModule';
import ProvideSharedModule from '../ProvideSharedModule';
import SharedEntryModule from './SharedContainerPlugin/SharedEntryModule';

export type CustomReferencedExports = { [sharedName: string]: string[] };

function isHarmonyImportSpecifierDependency(
  dependency: Dependency,
): dependency is dependencies.HarmonyImportSpecifierDependency {
  return dependency.type === 'harmony import specifier';
}

// dynamic import import('ui-lib')
function isImportDependency(dependency: Dependency) {
  return dependency.type === 'import()';
}

export default class SharedUsedExportsOptimizerPlugin
  implements WebpackPluginInstance
{
  name = 'SharedUsedExportsOptimizerPlugin';

  sharedReferencedExports: ReferencedExports;
  private sharedOptions: NormalizedSharedOptions;
  private injectTreeShakingUsedExports: boolean;
  private manifestOptions: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'];
  ignoredRuntime: string[];

  constructor(
    sharedOptions: NormalizedSharedOptions,
    injectTreeShakingUsedExports?: boolean,
    ignoredRuntime?: string[],
    manifestOptions?: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'],
  ) {
    this.sharedOptions = sharedOptions;
    this.injectTreeShakingUsedExports = injectTreeShakingUsedExports ?? true;
    this.manifestOptions = manifestOptions ?? {};
    this.sharedReferencedExports = new Map();
    this.sharedOptions.forEach(([key, config]) => {
      if (!config.treeShaking) {
        return;
      }
      this.sharedReferencedExports.set(key, new Set());
    });
    this.ignoredRuntime = ignoredRuntime || [];
  }

  private applyCustomReferencedExports() {
    const { sharedReferencedExports, sharedOptions } = this;
    const addCustomExports = (shareKey: string, exports: string[]) => {
      if (!sharedReferencedExports.get(shareKey)) {
        sharedReferencedExports.set(shareKey, new Set());
      }
      const sharedExports = sharedReferencedExports.get(shareKey)!;

      exports.forEach((item) => {
        sharedExports.add(item);
      });
    };

    sharedOptions.forEach(([shareKey, config]) => {
      if (config.treeShaking?.usedExports) {
        addCustomExports(shareKey, config.treeShaking.usedExports);
      }
    });
  }

  apply(compiler: Compiler) {
    const {
      sharedReferencedExports,
      sharedOptions,
      injectTreeShakingUsedExports,
      manifestOptions,
    } = this;
    if (!sharedOptions.length) {
      return;
    }
    compiler.hooks.compilation.tap(
      'SharedUsedExportsOptimizerPlugin',
      (compilation) => {
        // collect referenced export
        compilation.hooks.dependencyReferencedExports.tap(
          'SharedUsedExportsOptimizerPlugin',
          (referencedExports, dependency, runtime) => {
            if (!('request' in dependency)) {
              return referencedExports;
            }
            const shareKey = dependency.request;
            if (
              typeof shareKey !== 'string' ||
              sharedOptions.every(([key]) => key !== shareKey)
            ) {
              return referencedExports;
            }
            let currentReferencedExports = referencedExports;
            if (
              isImportDependency(dependency) &&
              referencedExports ===
                compilation.compiler.webpack.Dependency
                  .EXPORTS_OBJECT_REFERENCED
            ) {
              sharedReferencedExports.delete(shareKey);
              return currentReferencedExports;
            }
            if (
              isHarmonyImportSpecifierDependency(dependency) &&
              dependency.ids &&
              dependency.ids[0] === 'default'
            ) {
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
              if (typeof runtime !== 'string') {
                return;
              }
              const exportNames: string[] = [];
              if (Array.isArray(item)) {
                exportNames.push(...item);
              } else if (Array.isArray(item.name)) {
                exportNames.push(...item.name);
              }

              exportNames.forEach((i) => {
                const moduleExports = sharedReferencedExports.get(shareKey);
                if (!moduleExports) {
                  return;
                }
                moduleExports.add(i);
              });
            });

            return referencedExports;
          },
        );

        // treeShaking shared module
        compilation.hooks.optimizeDependencies.tap(
          {
            name: 'SharedUsedExportsOptimizerPlugin',
            stage: 1,
          },
          (modules) => {
            this.applyCustomReferencedExports();
            const sharedModules = [...modules].filter((m) =>
              [
                'consume-shared-module',
                'provide-module',
                'shared-entry-module',
              ].includes(m.type),
            ) as (
              | ConsumeSharedModule
              | ProvideSharedModule
              | SharedEntryModule
            )[];
            const moduleGraph = compilation.moduleGraph;
            sharedModules.forEach((module) => {
              const shareKey =
                (module as ConsumeSharedModule).options?.shareKey ||
                // @ts-expect-error FIXME: need to add general shareKey field
                (module as ProvideSharedModule)._name ||
                // @ts-ignore
                (module as SharedEntryModule)._name;
              if (!shareKey) {
                return;
              }
              if (
                !sharedOptions.find(([key]) => key === shareKey)?.[1]
                  .treeShaking
              ) {
                return;
              }
              const referenceExports = sharedReferencedExports.get(shareKey);
              if (!referenceExports || !referenceExports.size) {
                return;
              }
              const realSharedModule = [...modules].find(
                (m) => 'rawRequest' in m && m.rawRequest === shareKey,
              );
              if (realSharedModule?.factoryMeta?.sideEffectFree !== true) {
                referenceExports.clear();
                return;
              }
              // mark used exports
              const handleDependency = (dep: Dependency) => {
                const usedExport = [...referenceExports];

                const referencedModule = moduleGraph.getModule(dep);
                if (!referencedModule) return;

                const exportsInfo =
                  moduleGraph.getExportsInfo(referencedModule);

                for (let i = 0; i < usedExport.length; i++) {
                  const exportInfo = exportsInfo.getExportInfo(usedExport[i]);
                  exportInfo.setUsed(
                    compiler.webpack.UsageState.Used,
                    undefined,
                  );
                }
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
              for (const subExport of exportsInfo.exports) {
                const used = subExport.getUsed(undefined);
                if (used !== 3 && used !== 0) {
                  if (referenceExports.has(subExport.name)) {
                    continue;
                  }
                  canUpdateModuleUsedStage = false;
                  break;
                }
              }

              if (canUpdateModuleUsedStage) {
                for (const exportInfo of exportsInfo.exports) {
                  exportInfo.setUsedConditionally(
                    (used) => used === 3,
                    0,
                    undefined,
                  );
                }
                // exportsInfo.otherExportsInfo.setUsedConditionally(
                //   (used) => used === 3,
                //   0,
                //   undefined,
                // );
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
                sharedModule.usedExports = [...sharedReferenceExports];
              }

              compilation.updateAsset(
                statsFileName,
                new (
                  compiler.webpack?.sources ||
                  // eslint-disable-next-line @typescript-eslint/no-var-requires
                  require('webpack').sources
                ).RawSource(JSON.stringify(statsContent, null, 2)),
              );
            },
          );
        }

        if (!injectTreeShakingUsedExports) {
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
