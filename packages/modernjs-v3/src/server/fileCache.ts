import { lstat, readFile } from 'fs/promises';
import { SizeLimitedCache } from '@module-federation/bridge-react/size-limited-cache';

export interface FileResult {
  content: string;
  lastModified: number;
}

export class FileCache {
  private cache: SizeLimitedCache<string, FileResult>;

  constructor(maxSize = 200 * 1024 * 1024) {
    this.cache = new SizeLimitedCache({ maxSize });
  }

  /**
   * Check if file exists and return file info
   * @param filepath Path to the file
   * @returns FileResult or null if file doesn't exist
   */
  async getFile(filepath: string): Promise<FileResult | null> {
    try {
      // lstat alone is enough: ENOENT / access errors return null below.
      const stat = await lstat(filepath);
      const currentModified = stat.mtimeMs;

      // Check if file is in cache and if the cached version is still valid
      const cachedEntry = this.cache.get(filepath);
      if (cachedEntry && currentModified <= cachedEntry.lastModified) {
        return {
          content: cachedEntry.content,
          lastModified: cachedEntry.lastModified,
        };
      }

      // Read file and update cache
      const content = await readFile(filepath, 'utf-8');
      const newEntry: FileResult = {
        content,
        lastModified: currentModified,
      };

      // Charge UTF-8 bytes (never 0 — SizeLimitedCache rejects non-positive sizes).
      const size = Math.max(Buffer.byteLength(content, 'utf8'), 1);
      this.cache.set(filepath, newEntry, { size });

      return {
        content,
        lastModified: currentModified,
      };
    } catch (err) {
      return null;
    }
  }
}

// Export singleton instance
export const fileCache = new FileCache();
