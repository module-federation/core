/** @jest-environment node */
import { createRequire } from 'node:module';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, sep } from 'node:path';
import {
  getWebpackPath,
  normalizeWebpackPath,
} from '../src/normalize-webpack-path';

const webpackRequire = createRequire(import.meta.url);
const legacyRequests = [
  'webpack/lib/util/extractUrlAndGlobal',
  'webpack/lib/util/semver',
  'webpack/lib/util/fs',
  'webpack/lib/ModuleFactory',
  'webpack/lib/dependencies/StaticExportsDependency',
  'webpack/lib/dependencies/EntryDependency',
  'webpack/lib/dependencies/ModuleDependency',
  'webpack/lib/HotUpdateChunk',
];

const assertModuleBehavior = (request: string, helper: any) => {
  if (request.endsWith('/extractUrlAndGlobal')) {
    expect(helper('app@https://example.com/remoteEntry.js')).toEqual([
      'https://example.com/remoteEntry.js',
      'app',
    ]);
  } else if (request.endsWith('/semver')) {
    expect(helper.satisfy(helper.parseRange('^2.0.0'), '2.3.0')).toBe(true);
    expect(helper.satisfy(helper.parseRange('^2.0.0'), '3.0.0')).toBe(false);
  } else if (request.endsWith('/fs')) {
    expect(helper.join({ join: resolve }, '/parent', 'child')).toBe(
      resolve('/parent', 'child'),
    );
  } else {
    expect(helper.name).toBe(request.split('/').pop());
  }
};

describe('normalizeWebpackPath', () => {
  const originalWebpackPath = process.env['FEDERATION_WEBPACK_PATH'];

  beforeEach(() => {
    delete process.env['FEDERATION_WEBPACK_PATH'];
  });

  afterEach(() => {
    if (originalWebpackPath === undefined) {
      delete process.env['FEDERATION_WEBPACK_PATH'];
    } else {
      process.env['FEDERATION_WEBPACK_PATH'] = originalWebpackPath;
    }
  });

  it('preserves bare webpack and requests outside the relocation map', () => {
    expect(normalizeWebpackPath('webpack')).toBe('webpack');
    expect(normalizeWebpackPath('webpack/lib/RuntimeModule')).toBe(
      'webpack/lib/RuntimeModule',
    );
    expect(normalizeWebpackPath('webpack/lib/not-a-real-module')).toBe(
      'webpack/lib/not-a-real-module',
    );
    expect(normalizeWebpackPath('toString')).toBe('toString');
  });

  it.each(legacyRequests)(
    'preserves the installed legacy module %s',
    (request) => {
      expect(normalizeWebpackPath(request)).toBe(request);
      expect(webpackRequire(normalizeWebpackPath(request))).toBe(
        webpackRequire(request),
      );
    },
  );

  it('preserves the original request when neither location exists', () => {
    const directory = mkdtempSync(resolve(tmpdir(), 'mf-webpack-path-'));
    try {
      process.env['FEDERATION_WEBPACK_PATH'] = resolve(
        directory,
        'lib/index.js',
      );
      const normalized = normalizeWebpackPath('webpack/lib/util/semver');
      expect(normalized).toBe(resolve(directory, 'lib/util/semver'));
      expect(() => webpackRequire(normalized)).toThrow('Cannot find module');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('resolves the compiler package when installed under an alias', () => {
    const directory = mkdtempSync(resolve(tmpdir(), 'mf-aliased-webpack-'));
    try {
      mkdirSync(resolve(directory, 'lib'));
      writeFileSync(
        resolve(directory, 'package.json'),
        JSON.stringify({ name: 'webpack', main: 'lib/index.js' }),
      );
      writeFileSync(
        resolve(directory, 'lib/index.js'),
        "module.exports = require('./webpack');",
      );
      writeFileSync(
        resolve(directory, 'lib/webpack.js'),
        'module.exports = function webpack() { throw new Error("missing options"); };',
      );
      const webpack = webpackRequire(directory);
      const compiler = {
        webpack: () => webpack(),
      } as unknown as import('webpack').Compiler;
      expect(getWebpackPath(compiler)).toBe(webpackRequire.resolve(directory));
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  describe.each(['webpack', 'webpack-5-112'])(
    '%s compiler installation',
    (name) => {
      let webpackPath: string;

      beforeEach(() => {
        webpackPath = webpackRequire.resolve(name);
        process.env['FEDERATION_WEBPACK_PATH'] = webpackPath;
      });

      it('preserves the selected top-level webpack path', () => {
        expect(normalizeWebpackPath('webpack')).toBe(webpackPath);
      });

      it.each(legacyRequests)(
        'loads the selected compiler internal %s',
        (request) => {
          const internal = normalizeWebpackPath(request);
          expect(
            internal.startsWith(resolve(webpackPath, '../../') + sep),
          ).toBe(true);
          assertModuleBehavior(request, webpackRequire(internal));
        },
      );

      it('resolves the compiler webpack path without a global require', () => {
        const webpack = webpackRequire(name) as typeof import('webpack');
        const compiler = webpack({ mode: 'none', entry: {} });
        try {
          expect(getWebpackPath(compiler)).toBe(webpackPath);
        } finally {
          compiler.close(() => {});
        }
      });
    },
  );
});
