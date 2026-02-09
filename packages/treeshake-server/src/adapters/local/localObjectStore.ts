import fs from 'node:fs';
import path from 'node:path';
import type { ObjectStore } from '@/adapters/types';

export class LocalObjectStore implements ObjectStore {
  private readonly rootDir: string;
  private readonly publicBaseUrl: string;

  constructor(opts?: { rootDir?: string; publicBaseUrl?: string }) {
    this.rootDir = opts?.rootDir ?? path.join(process.cwd(), 'log', 'static');
    const port = process.env.PORT || 3000;
    const base =
      opts?.publicBaseUrl === '/'
        ? `http://localhost:${port}/`
        : (opts?.publicBaseUrl ?? '/');
    this.publicBaseUrl = base.endsWith('/') ? base : `${base}/`;
  }

  public async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.rootDir, key.replace(/^\//, ''));
    try {
      const stat = await fs.promises.stat(filePath);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  public async uploadFile(localPath: string, key: string): Promise<void> {
    const rel = key.replace(/^\//, '');
    const dest = path.join(this.rootDir, rel);
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    await fs.promises.copyFile(localPath, dest);
  }

  public publicUrl(key: string): string {
    return `${this.publicBaseUrl}${key.replace(/^\//, '')}`;
  }
}
