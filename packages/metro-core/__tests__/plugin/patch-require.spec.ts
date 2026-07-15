import { createRequire } from 'node:module';
import { describe, expect, it } from '@rstest/core';

const require = createRequire(import.meta.url);
const { transformSync } = require('@babel/core');
const patchRequire = require('../../babel-plugin/patch-require');

function transform(filename: string) {
  const result = transformSync(
    `
      global.__r = metroRequire;
      global.__c = clear;
      global.__registerSegment = registerSegment;
    `,
    {
      babelrc: false,
      configFile: false,
      filename,
      plugins: [patchRequire],
    },
  );

  return result?.code ?? '';
}

describe('patch-require babel plugin', () => {
  it('patches Metro require globals with POSIX paths', () => {
    const code = transform(
      '/repo/node_modules/metro-runtime/src/polyfills/require.js',
    );

    expect(code).toContain('global[`${__METRO_GLOBAL_PREFIX__}__r`]');
    expect(code).toContain('global[`${__METRO_GLOBAL_PREFIX__}__c`]');
    expect(code).toContain(
      'global[`${__METRO_GLOBAL_PREFIX__}__registerSegment`]',
    );
  });

  it('patches Metro require globals with Windows paths', () => {
    const code = transform(
      'C:\\repo\\node_modules\\metro-runtime\\src\\polyfills\\require.js',
    );

    expect(code).toContain('global[`${__METRO_GLOBAL_PREFIX__}__r`]');
    expect(code).toContain('global[`${__METRO_GLOBAL_PREFIX__}__c`]');
    expect(code).toContain(
      'global[`${__METRO_GLOBAL_PREFIX__}__registerSegment`]',
    );
  });
});
