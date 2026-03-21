import fs from 'node:fs/promises';
import path from 'node:path';
import {
  getManifestFileName,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import type { Compiler, WebpackPluginInstance } from '@rspack/core';

const PUBLISHED_SERVER_ASSET_DIRECTORY = path.join('static', 'ssr');

const findJsonDocumentEnd = (source: string): number | undefined => {
  let depth = 0;
  let started = false;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index++) {
    const character = source[index];

    if (!started) {
      if (character.trim() === '') {
        continue;
      }

      if (character !== '{' && character !== '[') {
        return undefined;
      }

      started = true;
      depth = 1;
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === '\\') {
        escaped = true;
        continue;
      }

      if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === '{' || character === '[') {
      depth += 1;
      continue;
    }

    if (character === '}' || character === ']') {
      depth -= 1;

      if (depth === 0) {
        return index + 1;
      }
    }
  }

  return undefined;
};

const sanitizePersistedAssetSource = (source: string): string => {
  const documentEnd = findJsonDocumentEnd(source);

  if (documentEnd === undefined) {
    return source;
  }

  const trailingContent = source.slice(documentEnd).trim();
  if (!trailingContent) {
    return source;
  }

  return source.slice(0, documentEnd);
};

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
        const manifestAssetsByPath = new Map<string, string>();
        const manifestAssets = compilation
          .getAssets()
          .filter((asset) =>
            this.assetBaseNames.has(path.posix.basename(asset.name)),
          );

        for (const asset of manifestAssets) {
          const assetPath = path.join(compiler.outputPath, asset.name);
          const assetSource = sanitizePersistedAssetSource(
            asset.source.source().toString(),
          );
          manifestAssetsByPath.set(assetPath, assetSource);
        }

        for (const [assetPath, assetSource] of Array.from(
          manifestAssetsByPath.entries(),
        ).sort(([left], [right]) => left.localeCompare(right))) {
          await fs.mkdir(path.dirname(assetPath), { recursive: true });
          await fs.writeFile(assetPath, assetSource);
        }
      },
    );
  }
}

export { getPublishedServerAssetDirectory };
