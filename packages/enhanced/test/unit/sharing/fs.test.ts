/*
 * @rstest-environment node
 */

import { Volume, createFsFromVolume } from 'memfs';
import {
  dirname,
  join,
  mkdirpSync,
  readJson,
  type MkdirSyncFileSystem,
  type PathFileSystem,
} from '../../../src/lib/fs';

describe('local fs utilities (packages/enhanced/src/lib/fs.ts)', () => {
  describe('join and dirname', () => {
    it('prefers custom filesystem join and dirname methods when provided', () => {
      const customFs: PathFileSystem = {
        join: (a, b) => `custom:${a}::${b}`,
        dirname: (p) => `parent(${p})`,
      };

      expect(join(customFs, 'virtual://root', 'pkg.json')).toBe(
        'custom:virtual://root::pkg.json',
      );
      expect(dirname(customFs, 'virtual://root/pkg.json')).toBe(
        'parent(virtual://root/pkg.json)',
      );
    });

    it('handles POSIX absolute paths', () => {
      expect(join(undefined, '/workspace/app', 'package.json')).toBe(
        '/workspace/app/package.json',
      );
      expect(join(undefined, '/workspace/app/', '../shared/pkg.json')).toBe(
        '/workspace/shared/pkg.json',
      );
      expect(dirname(undefined, '/workspace/app/src')).toBe('/workspace/app');
      expect(dirname(undefined, '/')).toBe('/');
    });

    it('handles Windows drive and UNC absolute paths', () => {
      expect(join(undefined, 'C:\\workspace\\app', 'package.json')).toBe(
        'C:\\workspace\\app\\package.json',
      );
      expect(dirname(undefined, 'C:\\workspace\\app\\src')).toBe(
        'C:\\workspace\\app',
      );
      expect(dirname(undefined, 'C:\\')).toBe('C:\\');
      expect(join(undefined, '\\\\server\\share\\app', 'package.json')).toBe(
        '\\\\server\\share\\app\\package.json',
      );
    });

    it('throws for non-absolute paths without custom fs methods', () => {
      expect(() => join(undefined, 'relative/dir', 'file.js')).toThrow(
        /neither a posix nor a windows path/,
      );
      expect(() => dirname(undefined, 'relative/dir')).toThrow(
        /neither a posix nor a windows path/,
      );
    });
  });

  describe('readJson', () => {
    it('delegates to custom fs.readJson when available', async () => {
      const customFs = {
        readFile: rs.fn(),
        readJson: rs.fn((_p: string, cb: any) =>
          cb(null, { name: 'custom-json', version: '1.2.3' }),
        ),
      };

      const data = await new Promise<Record<string, any> | undefined>(
        (resolve, reject) => {
          readJson(customFs as any, '/app/package.json', (err, res) =>
            err ? reject(err) : resolve(res),
          );
        },
      );

      expect(data).toEqual({ name: 'custom-json', version: '1.2.3' });
      expect(customFs.readJson).toHaveBeenCalledTimes(1);
      expect(customFs.readFile).not.toHaveBeenCalled();
    });

    it('reads and parses JSON from memfs and propagates ENOENT and SyntaxError', async () => {
      const vol = Volume.fromJSON({
        '/project/package.json': JSON.stringify({
          name: 'demo',
          version: '2.0.0',
        }),
        '/project/broken.json': '{ invalid json',
      });
      const memfs = createFsFromVolume(vol);

      const valid = await new Promise<Record<string, any> | undefined>(
        (resolve, reject) => {
          readJson(memfs as any, '/project/package.json', (err, res) =>
            err ? reject(err) : resolve(res),
          );
        },
      );
      expect(valid).toEqual({ name: 'demo', version: '2.0.0' });

      const enoentErr = await new Promise<NodeJS.ErrnoException | null>(
        (resolve) => {
          readJson(memfs as any, '/project/missing.json', (err) =>
            resolve(err as NodeJS.ErrnoException | null),
          );
        },
      );
      expect(enoentErr?.code).toBe('ENOENT');

      const parseErr = await new Promise<Error | null>((resolve) => {
        readJson(memfs as any, '/project/broken.json', (err) => resolve(err));
      });
      expect(parseErr).toBeInstanceOf(SyntaxError);
    });
  });

  describe('mkdirpSync', () => {
    it('creates nested directories recursively on a virtual FS without recursive option support', () => {
      const existingDirs = new Set<string>(['/']);
      const createdOrder: string[] = [];

      const nonRecursiveVirtualFs: MkdirSyncFileSystem = {
        mkdirSync: (dir: string, ...extraArgs: unknown[]) => {
          if (extraArgs.length > 0) {
            throw new TypeError(
              'Virtual FS mkdirSync does not support options argument',
            );
          }
          if (existingDirs.has(dir)) {
            const err = new Error(`EEXIST: ${dir}`) as NodeJS.ErrnoException;
            err.code = 'EEXIST';
            throw err;
          }
          const parent = dirname(undefined, dir);
          if (!existingDirs.has(parent)) {
            const err = new Error(`ENOENT: ${dir}`) as NodeJS.ErrnoException;
            err.code = 'ENOENT';
            throw err;
          }
          existingDirs.add(dir);
          createdOrder.push(dir);
        },
      };

      mkdirpSync(nonRecursiveVirtualFs, '/a/b/c/d');
      expect(createdOrder).toEqual(['/a', '/a/b', '/a/b/c', '/a/b/c/d']);

      // Idempotent when directory already exists
      expect(() => mkdirpSync(nonRecursiveVirtualFs, '/a/b/c/d')).not.toThrow();
    });

    it('creates nested directories in memfs', () => {
      const vol = new Volume();
      const memfs = createFsFromVolume(vol);

      mkdirpSync(memfs as any, '/nested/dir/path');
      expect(memfs.statSync('/nested/dir/path').isDirectory()).toBe(true);
    });

    it('rethrows non-ENOENT/EEXIST errors such as EACCES', () => {
      const failingFs: MkdirSyncFileSystem = {
        mkdirSync: () => {
          const err = new Error('permission denied') as NodeJS.ErrnoException;
          err.code = 'EACCES';
          throw err;
        },
      };

      expect(() => mkdirpSync(failingFs, '/protected/dir')).toThrow(
        'permission denied',
      );
    });
  });
});
