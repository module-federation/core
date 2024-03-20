import fs from 'fs-extra';
import path from 'path';

export function ensureTempDir(filePath: string): void {
  try {
    const dir = path.dirname(filePath);
    fs.ensureDirSync(dir);
  } catch (_err) {
    // noop
  }
}

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}
