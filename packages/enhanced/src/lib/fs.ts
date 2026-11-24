/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

import path from 'node:path';
import type { InputFileSystem, OutputFileSystem } from 'webpack/lib/fs/fs';

export type PathFileSystem = Partial<
  Pick<InputFileSystem & OutputFileSystem, 'join' | 'dirname'>
>;

export type ReadJsonCallback = (
  err: NodeJS.ErrnoException | Error | null,
  result?: Record<string, any>,
) => void;

export type ReadJsonFileSystem = Pick<InputFileSystem, 'readFile'> &
  Partial<Pick<InputFileSystem, 'readJson' | 'join' | 'dirname'>>;

export type MkdirSyncFileSystem = PathFileSystem & {
  mkdirSync: (dir: string) => unknown;
};

/**
 * Join a path with a filename using a custom filesystem's `join` when available,
 * falling back to POSIX or Windows path semantics based on `rootPath`.
 */
export function join(
  fs: PathFileSystem | undefined,
  rootPath: string,
  filename: string,
): string {
  if (fs && typeof fs.join === 'function') {
    return fs.join(rootPath, filename);
  }
  if (path.posix.isAbsolute(rootPath)) {
    return path.posix.join(rootPath, filename);
  }
  if (path.win32.isAbsolute(rootPath)) {
    return path.win32.join(rootPath, filename);
  }
  throw new Error(
    `${rootPath} is neither a posix nor a windows path, and there is no 'join' method defined in the file system`,
  );
}

/**
 * Return the parent directory of an absolute path using a custom filesystem's
 * `dirname` when available, falling back to POSIX or Windows path semantics.
 */
export function dirname(
  fs: PathFileSystem | undefined,
  absPath: string,
): string {
  if (fs && typeof fs.dirname === 'function') {
    return fs.dirname(absPath);
  }
  if (path.posix.isAbsolute(absPath)) {
    return path.posix.dirname(absPath);
  }
  if (path.win32.isAbsolute(absPath)) {
    return path.win32.dirname(absPath);
  }
  throw new Error(
    `${absPath} is neither a posix nor a windows path, and there is no 'dirname' method defined in the file system`,
  );
}

/**
 * Read and parse a JSON file from a webpack InputFileSystem (supporting
 * `fs.readJson` as well as virtual filesystems such as memfs).
 */
export function readJson(
  fs: ReadJsonFileSystem,
  filePath: string,
  callback: ReadJsonCallback,
): void {
  if ('readJson' in fs && typeof fs.readJson === 'function') {
    fs.readJson(
      filePath,
      callback as Parameters<NonNullable<InputFileSystem['readJson']>>[1],
    );
    return;
  }
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      return callback(err);
    }
    let data: Record<string, any>;
    try {
      const content =
        typeof buf === 'string' ? buf : (buf as Buffer).toString('utf8');
      data = JSON.parse(content);
    } catch (parseErr) {
      return callback(parseErr as Error);
    }
    return callback(null, data);
  });
}

/**
 * Synchronously create a directory and all missing parent directories without
 * assuming `fs.mkdirSync` supports `{ recursive: true }`.
 */
export function mkdirpSync(fs: MkdirSyncFileSystem, dirPath: string): void {
  try {
    fs.mkdirSync(dirPath);
  } catch (err) {
    if (!err) {
      return;
    }
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      const parentDir = dirname(fs, dirPath);
      if (!parentDir || parentDir === dirPath) {
        throw err;
      }
      mkdirpSync(fs, parentDir);
      try {
        fs.mkdirSync(dirPath);
      } catch (err2) {
        const code2 = (err2 as NodeJS.ErrnoException | undefined)?.code;
        if (code2 === 'EEXIST' || code2 === 'EISDIR') {
          return;
        }
        throw err2;
      }
      return;
    }
    if (code === 'EEXIST' || code === 'EISDIR') {
      return;
    }
    throw err;
  }
}
