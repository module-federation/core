/* SharedTreeShakingAuditPlugin.js */
/**
 * Rspack / Webpack-compatible plugin.
 * Emits shared-tree-shaking-report.json listing:
 * - resolved entry
 * - provided exports (e.g. Button)
 * - esm-like & sideEffectFree evidence
 * - canTreeShaking "necessary conditions" verdict
 */

function getProvidedExports(compilation, mod, statsModules, identifier) {
  try {
    const mg = compilation.moduleGraph;
    if (!mg) return 'unknown';

    const exportsInfo = mg.getExportsInfo(mod);
    if (!exportsInfo) return 'unknown';

    const provided =
      exportsInfo.getProvidedExports && exportsInfo.getProvidedExports();
    if (Array.isArray(provided))
      return provided.filter((x) => typeof x === 'string');
    const statModule = statsModules.find((x) => x.identifier === identifier);
    if (!statModule) return 'unknown';
    if (statModule.providedExports) return statModule.providedExports;
    return 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

function isEsmLikeModule(mod) {
  const bm = mod && mod.buildMeta;
  if (!bm) return undefined;

  // Different bundler versions expose different flags
  if (typeof bm.exportsType === 'string') return bm.exportsType !== 'default';
  if (typeof bm.strictHarmonyModule === 'boolean')
    return bm.strictHarmonyModule;
  if (typeof bm.harmonyModule === 'boolean') return bm.harmonyModule;

  return undefined;
}

function isSideEffectFree(mod) {
  const fm = mod && mod.factoryMeta;
  if (fm && typeof fm.sideEffectFree === 'boolean') return fm.sideEffectFree;

  const bm = mod && mod.buildMeta;
  if (bm && typeof bm.sideEffectFree === 'boolean') return bm.sideEffectFree;

  return false;
}

class SharedTreeShakingAuditPlugin {
  constructor(opts) {
    opts = opts || {};
    this.options = {
      libs: opts.libs || [],
      filename: opts.filename || 'shared-tree-shaking-report.json',
      entryOnly: opts.entryOnly !== undefined ? !!opts.entryOnly : true,
      debug: !!opts.debug,
    };
  }

  apply(compiler) {
    const pluginName = 'SharedTreeShakingAuditPlugin';

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      const collectSharedEntryPlugin = compiler.options.plugins.find(
        (p) => p.name === 'CollectSharedEntryPlugin',
      );
      if (!collectSharedEntryPlugin) {
        return;
      }
      // 尽量在较晚阶段收集信息
      const stage =
        (compiler.webpack &&
          compiler.webpack.Compilation &&
          compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE) ||
        4000;

      compilation.hooks.processAssets.tapPromise(
        { name: pluginName, stage },
        async () => {
          const reports = [];

          const statsModules = compilation.getStats().toJson().modules;
          for (const libName of this.options.libs) {
            const report = {
              lib: libName,
              resolvedEntry: undefined,
              entryModuleIdentifier: undefined,

              canTreeShaking: false,
              reasons: [],
              evidence: {},
              exports: 'unknown',
            };

            if (!libName) {
              report.reasons.push('lib configuration is empty');
              reports.push(report);
              continue;
            }

            let entryModule = undefined;

            for (const mod of compilation.modules) {
              const res = mod && mod.resource;
              if (!res || typeof res !== 'string') continue;

              if (mod.rawRequest === libName) {
                entryModule = mod;
                break;
              }
            }

            if (!entryModule) {
              report.reasons.push(`can not find module for ${libName}`);
              reports.push(report);
              continue;
            }

            report.entryModuleIdentifier =
              (typeof entryModule.identifier === 'function' &&
                entryModule.identifier()) ||
              entryModule.debugId ||
              'unknown';

            const providedExports = getProvidedExports(
              compilation,
              entryModule,
              statsModules,
              report.entryModuleIdentifier,
            );
            report.exports = providedExports;

            const esmLike = isEsmLikeModule(entryModule);
            const sideEffectFree = isSideEffectFree(entryModule);

            report.evidence.isEsmLike = esmLike;
            report.evidence.sideEffectFree = sideEffectFree;
            report.evidence.buildMeta = entryModule.buildMeta;
            report.evidence.factoryMeta = entryModule.factoryMeta;

            if (esmLike === false)
              report.reasons.push(
                'entry module is not ESM (likely CJS), static treeshake is hard',
              );
            if (sideEffectFree === false)
              report.reasons.push(
                'sideEffectFree=false, treeshake might be forbidden',
              );

            const canTreeshake = esmLike !== false && sideEffectFree !== false;
            report.canTreeShaking = canTreeshake;

            if (canTreeshake) {
              report.reasons.push(
                'entry module is ESM-like and not marked as side-effect, necessary conditions are met',
              );
            }

            if (this.options.debug) {
              compilation.warnings.push(
                new Error(
                  `[${pluginName}] ${libName} entry=${resolvedEntry} exports=${Array.isArray(providedExports) ? providedExports.length : providedExports}`,
                ),
              );
            }

            reports.push(report);
          }

          const output = {
            generatedAt: new Date().toISOString(),
            libs: reports,
          };

          const json = JSON.stringify(output, null, 2);

          // emit asset
          const RawSource =
            compiler.webpack &&
            compiler.webpack.sources &&
            compiler.webpack.sources.RawSource
              ? compiler.webpack.sources.RawSource
              : null;

          if (!RawSource) {
            compilation.assets[this.options.filename] = {
              source: () => json,
              size: () => json.length,
            };
          } else {
            compilation.emitAsset(this.options.filename, new RawSource(json));
          }
        },
      );
    });
  }
}

export default SharedTreeShakingAuditPlugin;
