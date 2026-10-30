/*
 * MIT License http://www.opensource.org/licenses/mit-license.php
 * Adapted from webpack's filesystem helpers, Author Tobias Koppers @sokra
 */
import path from 'node:path';
import type { Compiler } from 'webpack';

export type InputFileSystem = NonNullable<Compiler['inputFileSystem']>;

function getPathImplementation(value: string) {
  if (path.posix.isAbsolute(value)) return path.posix;
  if (path.win32.isAbsolute(value)) return path.win32;
  throw new Error(`${value} is neither a posix nor a windows path`);
}

export function join(fs: InputFileSystem, directory: string, file: string) {
  return fs.join
    ? fs.join(directory, file)
    : getPathImplementation(directory).join(directory, file);
}

export function dirname(fs: InputFileSystem, directory: string) {
  return fs.dirname
    ? fs.dirname(directory)
    : getPathImplementation(directory).dirname(directory);
}

export function readJson(
  fs: InputFileSystem,
  file: string,
  callback: (error: Error | null, data?: Record<string, any>) => void,
): void {
  if (fs.readJson) {
    fs.readJson(file, callback);
    return;
  }
  fs.readFile(file, (error, contents) => {
    if (error) return callback(error);
    let data: Record<string, any>;
    try {
      data = JSON.parse(contents!.toString('utf-8'));
    } catch (error) {
      callback(error as Error);
      return;
    }
    callback(null, data);
  });
}
