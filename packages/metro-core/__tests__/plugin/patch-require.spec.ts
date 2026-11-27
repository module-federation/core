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
      global.__accept = metroHotUpdateModule;
      RefreshRuntime.register(type, moduleId + ' ' + id);
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

  it("prefixes only the require globals in Expo CLI's require runtime", () => {
    const code = transform(
      '/repo/node_modules/@expo/cli/build/metro-require/require.js',
    );

    for (const name of ['__r', '__c', '__registerSegment', '__accept']) {
      expect(code).toContain(`global[\`\${__METRO_GLOBAL_PREFIX__}${name}\`]`);
    }
    // Expo's copy prefixes module IDs itself
    expect(code).not.toMatch(/__METRO_GLOBAL_PREFIX__ \+/);
  });
});
