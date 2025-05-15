import { fs } from '@modern-js/utils';

export interface FileCacheEntry {
  content: string;
  size: number;
  lastModified: number;
}

export interface FileResult {
  content: string;
  size: number;
}

export class FileCache {
  private cache: Map<string, FileCacheEntry> = new Map();

  /**
   * Check if file exists and return file info
   * @param filepath Path to the file
   * @returns FileResult or null if file doesn't exist
   */
  async getFile(filepath: string): Promise<FileResult | null> {
    // Check if file exists
    if (!(await fs.pathExists(filepath))) {
      return null;
    }

    try {
      const stat = await fs.lstat(filepath);
      const currentModified = stat.mtimeMs;

      // Check if file is in cache and if the cached version is still valid
      const cachedEntry = this.cache.get(filepath);
      if (cachedEntry && currentModified <= cachedEntry.lastModified) {
        return {
          content: cachedEntry.content,
          size: cachedEntry.size,
        };
      }

      // Read file and update cache
      const content = await fs.readFile(filepath, 'utf-8');
      const newEntry: FileCacheEntry = {
        content,
        size: stat.size,
        lastModified: currentModified,
      };

      this.cache.set(filepath, newEntry);

      return {
        content,
        size: stat.size,
      };
    } catch (err) {
      return null;
    }
  }
}

// Export singleton instance
export const fileCache = new FileCache();
