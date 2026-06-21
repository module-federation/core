import fs from 'node:fs';
import path from 'node:path';
import { vi } from 'vitest';
import { checkVersion, findPackageJson } from '../src/utils';
import { getBridgeRouterAlias } from '../src/router-alias';

const resolveRouterV5 = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v5/react-router-dom',
);
const resolveRouterV5_PkgPath = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v5/react-router-dom/package.json',
);
const resolveRouterV6 = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v6/react-router-dom/dist/main.js',
);
const resolveRouterV6Core = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v6/react-router',
);
const resolveRouterV6App = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v6-app',
);
const resolveRouterV6AppDom = path.resolve(
  resolveRouterV6App,
  'node_modules/react-router-dom',
);
const resolveRouterV6_PkgPath = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v6/react-router-dom/package.json',
);
const resolveRouterV7 = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v7/react-router',
);
const resolveRouterV7_PkgPath = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v7/react-router/package.json',
);
const resolveRouterV8 = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v8/react-router',
);
const resolveRouterV8Entry = path.join(
  resolveRouterV8,
  'dist/production/index.js',
);
const resolveRouterV8_PkgPath = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v8/react-router/package.json',
);

describe('test checkVersion: should return the correct major version for react-router-dom', () => {
  it('should return 5', () => {
    expect(checkVersion('5.0.0')).toBe(5);
  });

  it('should return 5', () => {
    expect(checkVersion('^5.0.0')).toBe(5);
  });

  it('should return 6', () => {
    expect(checkVersion('6.0.0')).toBe(6);
  });

  it('should return 6', () => {
    expect(checkVersion('~6.0.0')).toBe(6);
  });

  it('should return 6', () => {
    expect(checkVersion('^6.0.0')).toBe(6);
  });

  it('should return 7', () => {
    expect(checkVersion('7.0.0')).toBe(7);
  });

  it('should return 7', () => {
    expect(checkVersion('~7.0.0')).toBe(7);
  });

  it('should return 7', () => {
    expect(checkVersion('^7.0.0')).toBe(7);
  });

  it('should return 8', () => {
    expect(checkVersion('8.0.0')).toBe(8);
  });

  it('should return 8', () => {
    expect(checkVersion('^8.0.0')).toBe(8);
  });
});

describe('test findPackageJson: should return the correct package.json path for react-router-dom v5/v6 and react-router v7/v8', () => {
  it('should return the package.json path', () => {
    expect(findPackageJson(resolveRouterV5)).toBe(resolveRouterV5_PkgPath);
    expect(findPackageJson(resolveRouterV6)).toBe(resolveRouterV6_PkgPath);
    expect(findPackageJson(resolveRouterV7)).toBe(resolveRouterV7_PkgPath);
    expect(findPackageJson(resolveRouterV8)).toBe(resolveRouterV8_PkgPath);
  });
});

describe('test getBridgeRouterAlias: should return the correct alias for react-router-dom v5/v6 and react-router v7/v8', () => {
  it('should return the correct alias for router v5', () => {
    const res = getBridgeRouterAlias(resolveRouterV5);
    expect(res).toEqual({
      'react-router-dom$':
        '@module-federation/bridge-react/dist/router-v5.es.js',
      '@module-federation/bridge-react/router-runtime$':
        '@module-federation/bridge-react/dist/router-v5.es.js',
      'react-router-dom/index.js': resolveRouterV5,
    });
  });

  it('should return the correct alias for router v6', () => {
    const res = getBridgeRouterAlias(resolveRouterV6);
    expect(res).toEqual({
      'react-router-dom$':
        '@module-federation/bridge-react/dist/router-v6.es.js',
      '@module-federation/bridge-react/router-runtime$':
        '@module-federation/bridge-react/dist/router-v6.es.js',
      'react-router-dom/dist/index.js': resolveRouterV6,
    });
  });

  it('should return the correct alias for router v7', () => {
    const res = getBridgeRouterAlias(resolveRouterV7);
    expect(res).toEqual({
      'react-router$': '@module-federation/bridge-react/dist/router-v7.es.js',
      'react-router-dom$':
        '@module-federation/bridge-react/dist/router-v7.es.js',
      '@module-federation/bridge-react/router-runtime$':
        '@module-federation/bridge-react/dist/router-v7.es.js',
      'react-router/dist/development/index.js': resolveRouterV7,
      'react-router/dist/production/index.js': resolveRouterV7,
      'react-router-dom/dist/index.js': resolveRouterV7,
    });
  });

  it('should return the correct alias for router v8', () => {
    const res = getBridgeRouterAlias(resolveRouterV8);
    expect(res).toEqual({
      'react-router$': '@module-federation/bridge-react/dist/router-v8.es.js',
      'react-router/dom$':
        '@module-federation/bridge-react/dist/router-v8-dom.es.js',
      '@module-federation/bridge-react/router-runtime$':
        '@module-federation/bridge-react/dist/router-v8.es.js',
      'react-router/dist/development/index.js': resolveRouterV8,
      'react-router/dist/production/index.js': resolveRouterV8,
      'react-router/dist/development/dom-export.js': path.join(
        resolveRouterV8,
        'dist/development/dom-export.js',
      ),
      'react-router/dist/production/dom-export.js': path.join(
        resolveRouterV8,
        'dist/production/dom-export.js',
      ),
    });
  });

  it('should prefer an explicit react-router alias for router v8', () => {
    const res = getBridgeRouterAlias({ reactRouterAlias: resolveRouterV8 });
    expect(res['react-router$']).toBe(
      '@module-federation/bridge-react/dist/router-v8.es.js',
    );
    expect(res['react-router/dom$']).toBe(
      '@module-federation/bridge-react/dist/router-v8-dom.es.js',
    );
    expect(res['@module-federation/bridge-react/router-runtime$']).toBe(
      '@module-federation/bridge-react/dist/router-v8.es.js',
    );
  });

  it('should normalize an explicit react-router entry alias for router v8', () => {
    const res = getBridgeRouterAlias({
      reactRouterAlias: resolveRouterV8Entry,
    });

    expect(res['react-router/dist/production/index.js']).toBe(resolveRouterV8);
    expect(res['react-router/dist/production/dom-export.js']).toBe(
      path.join(resolveRouterV8, 'dist/production/dom-export.js'),
    );
  });

  it('should prefer an explicit react-router-dom alias for router v6 when both aliases exist', () => {
    const res = getBridgeRouterAlias({
      reactRouterAlias: resolveRouterV6Core,
      reactRouterDomAlias: resolveRouterV6,
    });

    expect(res).toEqual({
      'react-router-dom$':
        '@module-federation/bridge-react/dist/router-v6.es.js',
      '@module-federation/bridge-react/router-runtime$':
        '@module-federation/bridge-react/dist/router-v6.es.js',
      'react-router-dom/dist/index.js': resolveRouterV6,
    });
  });

  it('should fall back to the installed react-router-dom package for router v6 core aliases', () => {
    const packageJsonPath = path.join(resolveRouterV6App, 'package.json');
    const domPackageJsonPath = path.join(resolveRouterV6AppDom, 'package.json');
    const existsSync = fs.existsSync;
    const readFileSync = fs.readFileSync;
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(resolveRouterV6App);
    const existsSpy = vi
      .spyOn(fs, 'existsSync')
      .mockImplementation((filePath) => {
        const filePathString = String(filePath);
        if (
          filePathString === packageJsonPath ||
          filePathString === domPackageJsonPath
        ) {
          return true;
        }

        return existsSync(filePath);
      });
    const readFileSpy = vi
      .spyOn(fs, 'readFileSync')
      .mockImplementation((filePath, options) => {
        const filePathString = String(filePath);
        if (filePathString === packageJsonPath) {
          return JSON.stringify({
            dependencies: {
              'react-router-dom': '6.30.3',
            },
          });
        }

        if (filePathString === domPackageJsonPath) {
          return JSON.stringify({
            name: 'react-router-dom',
            version: '6.30.3',
          });
        }

        return readFileSync(filePath, options);
      });

    try {
      const res = getBridgeRouterAlias({
        reactRouterAlias: resolveRouterV6Core,
      });

      expect(res).toEqual({
        'react-router-dom$':
          '@module-federation/bridge-react/dist/router-v6.es.js',
        '@module-federation/bridge-react/router-runtime$':
          '@module-federation/bridge-react/dist/router-v6.es.js',
        'react-router-dom/dist/index.js': resolveRouterV6AppDom,
      });
    } finally {
      readFileSpy.mockRestore();
      existsSpy.mockRestore();
      cwdSpy.mockRestore();
    }
  });

  it('should prefer an explicit react-router alias for router v7 when both aliases exist', () => {
    const res = getBridgeRouterAlias({
      reactRouterAlias: resolveRouterV7,
      reactRouterDomAlias: resolveRouterV6,
    });

    expect(res['react-router$']).toBe(
      '@module-federation/bridge-react/dist/router-v7.es.js',
    );
    expect(res['react-router-dom/dist/index.js']).toBe(resolveRouterV7);
  });
});
