import path from 'node:path';
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
});

describe('test findPackageJson: should return the correct package.json path for react-router-dom v5, v6 and react-router v7', () => {
  it('should return the package.json path', () => {
    expect(findPackageJson(resolveRouterV5)).toBe(resolveRouterV5_PkgPath);
    expect(findPackageJson(resolveRouterV6)).toBe(resolveRouterV6_PkgPath);
    expect(findPackageJson(resolveRouterV7)).toBe(resolveRouterV7_PkgPath);
  });
});

describe('test getBridgeRouterAlias: should return the correct alias for react-router-dom v5, v6 and react-router v7', () => {
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
      'react-router-dom/dist/index.js': resolveRouterV6,
    });
  });

  it('should return the correct alias for router v7', () => {
    const res = getBridgeRouterAlias(resolveRouterV7);
    expect(res).toEqual({
      'react-router$': '@module-federation/bridge-react/dist/router-v7.es.js',
      'react-router-dom$':
        '@module-federation/bridge-react/dist/router-v7.es.js',
      'react-router/dist/development/index.js': resolveRouterV7,
      'react-router/dist/production/index.js': resolveRouterV7,
      'react-router-dom/dist/index.js': resolveRouterV7,
    });
  });
});
