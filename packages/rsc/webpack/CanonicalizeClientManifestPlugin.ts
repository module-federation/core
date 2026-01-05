import type { Compiler } from 'webpack';

type CanonicalizeClientManifestPluginOptions = {
  manifestFilename?: string;
  sourceDirNames?: string[];
  distDirName?: string;
};

export default class CanonicalizeClientManifestPlugin {
  manifestFilename: string;
  sourceDirNames: string[];
  distDirName: string;

  constructor(options: CanonicalizeClientManifestPluginOptions = {}) {
    this.manifestFilename =
      options.manifestFilename || 'react-client-manifest.json';
    this.sourceDirNames = options.sourceDirNames || ['src', 'framework'];
    this.distDirName = options.distDirName || 'dist';
  }

  apply(compiler: Compiler) {
    const { Compilation, sources } = compiler.webpack;

    compiler.hooks.thisCompilation.tap(
      'CanonicalizeClientManifestPlugin',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'CanonicalizeClientManifestPlugin',
            stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            const asset = compilation.getAsset(this.manifestFilename);
            if (!asset) return;

            let manifest;
            try {
              manifest = JSON.parse(asset.source.source().toString());
            } catch (_e) {
              return;
            }

            if (!manifest || typeof manifest !== 'object') return;

            const entries = Object.entries(manifest);
            if (!entries.length) return;

            const keys = new Set(Object.keys(manifest));
            const distMarker = `/${this.distDirName}/`;

            for (const [key] of entries) {
              if (!key.includes(distMarker)) continue;

              const candidates = this.sourceDirNames.map((dir) =>
                key.replace(distMarker, `/${dir}/`),
              );

              if (candidates.some((candidate) => keys.has(candidate))) {
                delete manifest[key];
              }
            }

            compilation.updateAsset(
              this.manifestFilename,
              new sources.RawSource(JSON.stringify(manifest, null, 2)),
            );
          },
        );
      },
    );
  }
}
