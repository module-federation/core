import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('Webpack internal layout compatibility (real module resolution)', () => {
  let root: string;
  let previousWebpackPath: string | undefined;
  const oldPath = 'webpack/lib/util/extractUrlAndGlobal';
  const newPath = 'webpack/lib/externals/extractUrlAndGlobal';

  const fixture = (request: string, source: string) => {
    const file = path.join(root, request.replace('webpack/', '')) + '.js';
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, source);
    return file;
  };

  beforeEach(() => {
    previousWebpackPath = process.env['FEDERATION_WEBPACK_PATH'];
    root = mkdtempSync(path.join(tmpdir(), 'mf-webpack-layout-'));
    process.env['FEDERATION_WEBPACK_PATH'] = path.join(root, 'lib/index.js');
  });

  afterEach(() => {
    if (previousWebpackPath === undefined) {
      delete process.env['FEDERATION_WEBPACK_PATH'];
    } else {
      process.env['FEDERATION_WEBPACK_PATH'] = previousWebpackPath;
    }
    rmSync(root, { recursive: true, force: true });
  });

  it('prefers the old layout when both candidates exist', () => {
    const oldFile = fixture(oldPath, 'module.exports = "old";');
    fixture(newPath, 'module.exports = "new";');
    expect(normalizeWebpackPath(oldPath)).toBe(oldFile.slice(0, -3));
    expect(require(normalizeWebpackPath(oldPath))).toBe('old');
  });

  it('uses the relocated layout only when the old candidate is absent', () => {
    const newFile = fixture(newPath, 'module.exports = "new";');
    expect(normalizeWebpackPath(oldPath)).toBe(newFile.slice(0, -3));
    expect(require(normalizeWebpackPath(oldPath))).toBe('new');
  });

  it('propagates a missing fallback', () => {
    expect(() => normalizeWebpackPath(oldPath)).toThrow(
      "Cannot find module '" +
        path.join(root, 'lib/externals/extractUrlAndGlobal') +
        "'",
    );
  });

  it('does not hide a nested MODULE_NOT_FOUND from the selected module', () => {
    fixture(
      oldPath,
      'module.exports = require("./missing-nested-dependency");',
    );
    fixture(newPath, 'module.exports = "must not be used";');
    expect(() => require(normalizeWebpackPath(oldPath))).toThrow(
      "Cannot find module './missing-nested-dependency'",
    );
  });

  it('does not execute candidates or hide their execution errors', () => {
    fixture(oldPath, 'throw new Error("broken old module");');
    fixture(newPath, 'module.exports = "must not be used";');
    expect(() => normalizeWebpackPath(oldPath)).not.toThrow();
    expect(() => require(normalizeWebpackPath(oldPath))).toThrow(
      'broken old module',
    );
  });

  it('leaves unmapped requests and the top-level compiler path unchanged', () => {
    expect(normalizeWebpackPath('webpack')).toBe(
      process.env['FEDERATION_WEBPACK_PATH'],
    );
    expect(normalizeWebpackPath('webpack/lib/util/identifier')).toBe(
      path.join(root, 'lib/util/identifier'),
    );
  });

  it.each(['cjs', 'js'])(
    'resolves old and relocated layouts in the emitted %s entry',
    (extension) => {
      const entry = require
        .resolve('@module-federation/sdk/normalize-webpack-path')
        .replace(/\.cjs$/, `.${extension}`);
      const check = (expected: string) => {
        const result = execFileSync(
          process.execPath,
          [
            '--input-type=module',
            '-e',
            `import { pathToFileURL } from 'node:url';
             const { normalizeWebpackPath } = await import(pathToFileURL(${JSON.stringify(entry)}));
             console.log(normalizeWebpackPath(${JSON.stringify(oldPath)}));`,
          ],
          { encoding: 'utf8', env: process.env },
        );
        expect(result.trim()).toBe(expected.slice(0, -3));
      };
      const newFile = fixture(newPath, 'throw new Error("must not execute");');
      check(newFile);
      const oldFile = fixture(oldPath, 'throw new Error("must not execute");');
      check(oldFile);
    },
  );
});

describe('SDK browser entry isolation', () => {
  const webpack = require(
    normalizeWebpackPath('webpack'),
  ) as typeof import('webpack');

  it.each(['cjs', 'js'])(
    'bundles the emitted %s SDK index without Node dependencies',
    async (extension) => {
      const root = mkdtempSync(path.join(tmpdir(), 'mf-sdk-browser-'));
      const sdkEntry = require
        .resolve('@module-federation/sdk')
        .replace(/\.cjs$/, `.${extension}`);
      const entry = path.join(root, 'index.js');
      writeFileSync(
        entry,
        `import * as sdk from ${JSON.stringify(sdkEntry)}; console.log(sdk);`,
      );
      const compiler = webpack({
        mode: 'none',
        target: 'web',
        entry,
        output: { path: path.join(root, 'dist'), filename: 'bundle.js' },
        // Traverse the shared helpers even when their exports could be shaken.
        optimization: { usedExports: false, concatenateModules: false },
      });
      try {
        const stats = await new Promise<import('webpack').Stats>(
          (resolve, reject) => {
            compiler.run((error, stats) => {
              if (error) reject(error);
              else if (stats) resolve(stats);
              else reject(new Error('Webpack returned no stats'));
            });
          },
        );
        expect(stats.toJson({ all: false, errors: true }).errors).toEqual([]);
      } finally {
        await new Promise<void>((resolve, reject) => {
          compiler.close((error) => (error ? reject(error) : resolve()));
        });
        rmSync(root, { recursive: true, force: true });
      }
    },
  );
});
