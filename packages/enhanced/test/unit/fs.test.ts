import path from 'node:path';
import { createFsFromVolume, Volume } from 'memfs';
import {
  dirname,
  join,
  readJson,
  type InputFileSystem,
} from '../../src/lib/fs';

describe('compiler filesystem helpers', () => {
  it.each([
    ['/project/packages', '/project/packages/package.json', '/project'],
    [
      'C:\\project\\packages',
      'C:\\project\\packages\\package.json',
      'C:\\project',
    ],
    [
      '\\\\server\\share\\packages',
      '\\\\server\\share\\packages\\package.json',
      '\\\\server\\share\\',
    ],
  ])('preserves the path convention of %s', (directory, file, parent) => {
    const fs = {} as InputFileSystem;
    expect(join(fs, directory, 'package.json')).toBe(file);
    expect(dirname(fs, directory)).toBe(parent);
  });

  it('honors custom filesystem path operations', () => {
    const fs = {
      join: rs.fn(() => 'custom-file'),
      dirname: rs.fn(() => 'custom-parent'),
    } as unknown as InputFileSystem;
    expect(join(fs, 'virtual:package', 'package.json')).toBe('custom-file');
    expect(dirname(fs, 'virtual:package')).toBe('custom-parent');
  });

  it('uses a filesystem-provided JSON reader', () => {
    const data = { version: '1.0.0' };
    const fs = {
      readJson: rs.fn((_file, callback) => callback(null, data)),
      readFile: rs.fn(),
    } as unknown as InputFileSystem;
    const callback = rs.fn();
    readJson(fs, '/package.json', callback);
    expect(callback).toHaveBeenCalledWith(null, data);
    expect(fs.readFile).not.toHaveBeenCalled();
  });

  it('reads JSON through the compiler virtual filesystem', async () => {
    const fs = createFsFromVolume(
      Volume.fromJSON({ '/package.json': '{"version":"1.0.0"}' }),
    ) as unknown as InputFileSystem;
    const data = await new Promise((resolve, reject) => {
      readJson(fs, '/package.json', (error, data) =>
        error ? reject(error) : resolve(data),
      );
    });
    expect(data).toEqual({ version: '1.0.0' });
  });

  it.each(['missing.json', 'invalid.json'])(
    'forwards errors reading %s',
    async (file) => {
      const fs = createFsFromVolume(
        Volume.fromJSON({ '/invalid.json': '{ invalid json' }),
      ) as unknown as InputFileSystem;
      const error = await new Promise((resolve) => {
        readJson(fs, path.posix.join('/', file), (error) => resolve(error));
      });
      expect(error).toBeInstanceOf(Error);
    },
  );
});
