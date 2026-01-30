import fs from 'fs';
import path from 'path';
class EmitManifest {
  constructor(secondaryTreeShaking) {
    this.secondaryTreeShaking = secondaryTreeShaking;
  }
  apply(compiler) {
    const { secondaryTreeShaking } = this;
    compiler.hooks.compilation.tap(
      'SecondaryTreeShakingPlugin',
      (compilation) => {
        compilation.hooks.processAssets.tapPromise(
          {
            name: 'SecondaryTreeShakingPlugin',
            stage:
              compilation.constructor.PROCESS_ASSETS_STAGE_ADDITIONAL - 1000,
          },
          async () => {
            const treeshakeSharedPlugin = compiler.options.plugins.find(
              (p) => p.name === 'TreeShakingSharedPlugin',
            );
            if (!treeshakeSharedPlugin) {
              return;
            }
            const mfConfig = treeshakeSharedPlugin.mfConfig;
            const fakeManifest = {
              shared: [],
            };

            const { shared } = fakeManifest;
            Object.entries(mfConfig.shared).forEach(
              ([sharedName, sharedConfig]) => {
                shared.push({
                  name: sharedName,
                  version: sharedConfig.version,
                });
              },
            );
            try {
              if (!secondaryTreeShaking) {
                const treeshakeReport = fs.readFileSync(
                  path.resolve(
                    compilation.options.output.path,
                    'independent-packages/shared-tree-shaking-report.json',
                  ),
                );
                const content = JSON.parse(treeshakeReport);
                content.libs.forEach((libInfo) => {
                  const { lib, canTreeShaking, exports } = libInfo;
                  const targetShared = shared.find((s) => s.name === lib);
                  if (targetShared) {
                    targetShared.canTreeshake = canTreeShaking;
                    targetShared.usedExports = exports;
                  }
                });
              }
            } catch (e) {
              console.error(e);
            }
            compilation.emitAsset(
              'mf-manifest.json',
              new compiler.webpack.sources.RawSource(
                JSON.stringify(fakeManifest),
              ),
            );
            compilation.emitAsset(
              'mf-stats.json',
              new compiler.webpack.sources.RawSource(
                JSON.stringify(fakeManifest),
              ),
            );
          },
        );
      },
    );
  }
}
export default EmitManifest;
