import fs from 'fs';
import { TypesStatsJson } from '../types';

export class TypesCache {
  private static fsCache = new Map<string, string[]>();

  private static typesCache = new Map<string, TypesStatsJson>();

  static getFsFiles(directory: string) {
    // Simple caching mechanism to improve performance reading the file system
    if (this.fsCache.has(directory)) {
      return this.fsCache.get(directory);
    }

    const files = fs.readdirSync(directory);
    this.fsCache.set(directory, files);

    return files;
  }

  static getCacheBustedFiles(remote: string, statsJson: TypesStatsJson) {
    const stats = this.typesCache.get(remote);

    if (!stats) {
      this.typesCache.set(remote, statsJson);
    }

    const cachedFiles = stats?.files;
    const { files } = statsJson;

    const filesToCacheBust: string[] = [];
    const filesToDelete: string[] = [];

    // No 'cached files' => No types downloaded
    // Go head and download all the files, no need to cache bust
    if (!cachedFiles) {
      return {
        filesToCacheBust: Object.keys(files),
        filesToDelete,
      };
    }

    Object.entries(cachedFiles).forEach(([filename, hash]) => {
      const remoteFileHash = files[filename];

      if (remoteFileHash) {
        if (remoteFileHash !== hash) {
          filesToCacheBust.push(filename);
        }
      } else {
        filesToDelete.push(filename);
      }
    });

    return {
      filesToCacheBust,
      filesToDelete,
    };
  }
}
