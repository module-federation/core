import fs from 'node:fs/promises';
import path from 'node:path';
import {
  getManifestFileName,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import type { Compiler, WebpackPluginInstance } from 'webpack';

const PUBLISHED_SERVER_ASSET_DIRECTORY = path.join('static', 'ssr');

const getPublishedServerAssetDirectory = (
  outputPath: string,
): string | undefined => {
  const resolvedOutputPath = path.resolve(outputPath);
  const serverSegment = `${path.sep}server`;
  const serverIndex = resolvedOutputPath.lastIndexOf(serverSegment);

  if (serverIndex === -1) {
    return undefined;
  }

  return path.join(
    resolvedOutputPath.slice(0, serverIndex),
    PUBLISHED_SERVER_ASSET_DIRECTORY,
  );
};

export class PublishServerAssetsPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler): void {
    compiler.hooks.afterEmit.tapPromise(
      'NextjsMfPublishServerAssetsPlugin',
      async () => {
        const destination = getPublishedServerAssetDirectory(
          compiler.outputPath,
        );
        if (!destination) {
          return;
        }

        await fs.mkdir(destination, { recursive: true });
        await fs.cp(compiler.outputPath, destination, {
          recursive: true,
          force: true,
        });
      },
    );
  }
}

export class PersistManifestAssetsPlugin implements WebpackPluginInstance {
  private readonly assetBaseNames: Set<string>;

  constructor(
    manifest: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'],
  ) {
    const { manifestFileName, statsFileName } = getManifestFileName(manifest);
    this.assetBaseNames = new Set([
      path.posix.basename(manifestFileName),
      path.posix.basename(statsFileName),
    ]);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.afterEmit.tapPromise(
      'NextjsMfPersistManifestAssetsPlugin',
      async (compilation) => {
        const manifestAssets = compilation
          .getAssets()
          .filter((asset) =>
            this.assetBaseNames.has(path.posix.basename(asset.name)),
          );

        await Promise.all(
          manifestAssets.map(async (asset) => {
            const assetPath = path.join(compiler.outputPath, asset.name);
            await fs.mkdir(path.dirname(assetPath), { recursive: true });
            await fs.writeFile(assetPath, asset.source.source().toString());
          }),
        );
      },
    );
  }
}

export { getPublishedServerAssetDirectory };
