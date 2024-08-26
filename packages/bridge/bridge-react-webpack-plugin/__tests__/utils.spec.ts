import path from 'node:path';
import {
  checkVersion,
  findPackageJson,
  getBridgeRouterAlias,
} from '../src/utis';

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
const resolveRouterV6_PkgPath = path.resolve(
  __dirname,
  '../__tests__/mockRouterDir/router-v6/react-router-dom/package.json',
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
});

describe('test findPackageJson: should return the correct package.json path for react-router-dom v5 and v6', () => {
  it('should return the package.json path', () => {
    expect(findPackageJson(resolveRouterV5)).toBe(resolveRouterV5_PkgPath);
    expect(findPackageJson(resolveRouterV6)).toBe(resolveRouterV6_PkgPath);
  });
});

describe('test getBridgeRouterAlias: should return the correct alias for react-router-dom v5 and v6', () => {
  it('should return the correct alias for router v5', () => {
    const res = getBridgeRouterAlias(resolveRouterV5);
    expect(res).toEqual({
      'react-router-dom$':
        '@module-federation/bridge-react/dist/router-v5.es.js',
      'react-router-dom/index.js': resolveRouterV5,
    });
  });

  it('should return the correct alias for router v6', () => {
    const res = getBridgeRouterAlias(resolveRouterV6);
    expect(res).toEqual({
      'react-router-dom$':
        '@module-federation/bridge-react/dist/router-v6.es.js',
    });
  });
});
