import path from 'path';
import fs from 'fs';

import type {
  ModifyEntryOptions,
  EntryStaticNormalized,
} from '../webpack/types';

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function modifyEntry(options: ModifyEntryOptions): void {
  const { compiler, staticEntry, prependEntry } = options;
  const operator = (
    oriEntry: EntryStaticNormalized,
    newEntry: EntryStaticNormalized,
  ): EntryStaticNormalized => Object.assign(oriEntry, newEntry);

  if (typeof compiler.options.entry === 'function') {
    const prevEntryFn = compiler.options.entry;
    compiler.options.entry = async () => {
      let res = await prevEntryFn();
      if (staticEntry) {
        res = operator(res, staticEntry);
      }
      if (prependEntry) {
        prependEntry(res);
      }
      return res;
    };
  } else {
    if (staticEntry) {
      compiler.options.entry = operator(compiler.options.entry, staticEntry);
    }
    if (prependEntry) {
      prependEntry(compiler.options.entry);
    }
  }
}

export const fileExistsWithCaseSync = (filepath: string): boolean => {
  const dir = path.dirname(filepath);
  if (filepath === '/' || filepath === '.') {
    return true;
  }
  const filenames = fs.readdirSync(dir);
  if (filenames.indexOf(path.basename(filepath)) === -1) {
    return false;
  }
  return fileExistsWithCaseSync(dir);
};
