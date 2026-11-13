import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
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

  it('uses caller-relative resolution without a compiler path', () => {
    delete process.env['FEDERATION_WEBPACK_PATH'];
    const normalized = normalizeWebpackPath(oldPath);
    expect([oldPath, newPath]).toContain(normalized);
    expect(require(normalized)).toBeInstanceOf(Function);
  });

  const isolatedCaller = (
    name: string,
    webpackFiles: Record<string, string>,
    script: string,
  ) => {
    // The SDK copy lives beside no Webpack at all, so only caller-relative
    // resolution can find the caller's installation.
    const sdkRoot = path.join(root, name, 'sdk');
    const callerRoot = path.join(root, name, 'app');
    mkdirSync(sdkRoot, { recursive: true });
    copyFileSync(
      require.resolve('@module-federation/sdk/normalize-webpack-path'),
      path.join(sdkRoot, 'sdk.cjs'),
    );
    for (const [request, source] of Object.entries(webpackFiles)) {
      const file = path.join(callerRoot, request) + '.js';
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, source);
    }
    const caller = path.join(callerRoot, 'packages/plugin/caller.cjs');
    mkdirSync(path.dirname(caller), { recursive: true });
    writeFileSync(
      caller,
      `const sdk = require(${JSON.stringify(path.join(sdkRoot, 'sdk.cjs'))});
       ${script}`,
    );
    const env = { ...process.env };
    delete env['FEDERATION_WEBPACK_PATH'];
    return JSON.parse(
      execFileSync(process.execPath, [caller], { encoding: 'utf8', env }),
    );
  };
  const resolveScript = `Error.stackTraceLimit = 0;
    const normalized = sdk.normalizeWebpackPath(${JSON.stringify(oldPath)});
    console.log(JSON.stringify([normalized, require(normalized)]));`;

  it('does not require Webpack to be resolvable from the SDK', () => {
    expect(
      isolatedCaller(
        'isolated',
        { [`node_modules/${oldPath}`]: 'module.exports = "caller";' },
        resolveScript,
      ),
    ).toEqual([oldPath, 'caller']);
  });

  it('does not mix in an old layout hoisted above the nearest Webpack', () => {
    expect(
      isolatedCaller(
        'hoisted',
        {
          [`node_modules/${oldPath}`]: 'module.exports = "hoisted old";',
          [`packages/plugin/node_modules/${newPath}`]:
            'module.exports = "nearest new";',
        },
        resolveScript,
      ),
    ).toEqual([newPath, 'nearest new']);
  });

  it('reports no compiler path for a bundled compiler', () => {
    expect(
      isolatedCaller(
        'bundled',
        {
          'packages/plugin/bundle':
            'exports.webpack = function webpack() { throw new Error("bundled"); };',
        },
        `const { webpack } = require('./bundle.js');
         console.log(JSON.stringify(sdk.getWebpackPath({ webpack })));`,
      ),
    ).toBe('');
  });

  it('falls back with Jest-style module resolution errors', () => {
    delete process.env['FEDERATION_WEBPACK_PATH'];
    const isolatedRoot = path.join(root, 'isolated-jest');
    mkdirSync(isolatedRoot, { recursive: true });
    copyFileSync(
      require.resolve('@module-federation/sdk/normalize-webpack-path'),
      path.join(isolatedRoot, 'sdk.cjs'),
    );
    const callerWebpack = path.join(isolatedRoot, 'node_modules', newPath);
    mkdirSync(path.dirname(callerWebpack), { recursive: true });
    writeFileSync(callerWebpack + '.js', 'module.exports = "new";');
    const caller = path.join(isolatedRoot, 'caller.cjs');
    writeFileSync(
      caller,
      `const Module = require('node:module');
       const { normalizeWebpackPath } = require('./sdk.cjs');
       const original = Module._resolveFilename;
       Module._resolveFilename = function (request, ...args) {
         if (request === ${JSON.stringify(oldPath)}) {
           const error = new Error("Cannot find module '" + request + "' from 'caller.cjs'");
           error.code = 'MODULE_NOT_FOUND';
           throw error;
         }
         return original.call(this, request, ...args);
       };
       const normalized = normalizeWebpackPath(${JSON.stringify(oldPath)});
       console.log(JSON.stringify([normalized, require(normalized)]));`,
    );
    const result = execFileSync(process.execPath, [caller], {
      encoding: 'utf8',
      env: process.env,
    });
    expect(JSON.parse(result)).toEqual([newPath, 'new']);
  });

  it('leaves unmapped requests and the top-level compiler path unchanged', () => {
    expect(normalizeWebpackPath('webpack')).toBe(
      process.env['FEDERATION_WEBPACK_PATH'],
    );
    expect(normalizeWebpackPath('webpack/lib/util/identifier')).toBe(
      path.join(root, 'lib/util/identifier'),
    );
  });

  it.each(['cjs', 'mjs'])(
    'detects the active compiler from a %s caller without global require',
    (extension) => {
      const entry = require
        .resolve('@module-federation/sdk/normalize-webpack-path')
        .replace(/\.cjs$/, extension === 'mjs' ? '.js' : '.cjs');
      const webpackEntry = require.resolve('webpack');
      const caller = path.join(root, `compiler.${extension}`);
      writeFileSync(
        caller,
        extension === 'cjs'
          ? `const { getWebpackPath } = require(${JSON.stringify(entry)});
             const webpack = require(${JSON.stringify(webpackEntry)});
             console.log(getWebpackPath({ webpack }));`
          : `import { getWebpackPath } from ${JSON.stringify(entry)};
             import webpack from ${JSON.stringify(webpackEntry)};
             console.log(getWebpackPath({ webpack }));`,
      );
      const result = execFileSync(process.execPath, [caller], {
        encoding: 'utf8',
        env: process.env,
      });
      expect(result.trim()).toBe(webpackEntry);
    },
  );

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

describe('Webpack internal layout compatibility (installed Webpack)', () => {
  const sdkSource = readFileSync(
    path.join(
      path.dirname(
        require.resolve('@module-federation/sdk/normalize-webpack-path'),
      ),
      '../src/normalize-webpack-path.ts',
    ),
    'utf8',
  );
  const aliases = [
    ...sdkSource
      .slice(
        sdkSource.indexOf('const webpackInternalPaths'),
        sdkSource.indexOf('};'),
      )
      .matchAll(/'(webpack\/[^']+)':\s*'(webpack\/[^']+)'/g),
  ].map(([, from, to]) => [from, to]);
  let previousWebpackPath: string | undefined;

  beforeEach(() => {
    previousWebpackPath = process.env['FEDERATION_WEBPACK_PATH'];
    delete process.env['FEDERATION_WEBPACK_PATH'];
  });

  afterEach(() => {
    if (previousWebpackPath !== undefined) {
      process.env['FEDERATION_WEBPACK_PATH'] = previousWebpackPath;
    }
  });

  it('finds the alias map', () => {
    expect(aliases.length).toBeGreaterThanOrEqual(16);
  });

  it('resolves every mapped internal inside the installed Webpack', () => {
    const webpackRoot = path.dirname(require.resolve('webpack/package.json'));
    for (const [from, to] of aliases) {
      const normalized = normalizeWebpackPath(from);
      expect([from, to]).toContain(normalized);
      expect(
        require.resolve(normalized).startsWith(webpackRoot + path.sep),
      ).toBe(true);
    }
  });
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
