import {
  resolveRspackRuntimeAlias,
  resolveRspackRuntimeImplementation,
} from '../src/ModuleFederationPlugin';

describe('runtime resolution compatibility', () => {
  it('prefers the bundler implementation when available', () => {
    const resolve = jest.fn((request: string) => {
      if (request === '@module-federation/runtime-tools/bundler') {
        return '/workspace/runtime-tools/dist/bundler.js';
      }

      throw new Error(`Unexpected request: ${request}`);
    }) as typeof require.resolve;

    expect(resolveRspackRuntimeImplementation(undefined, resolve)).toBe(
      '/workspace/runtime-tools/dist/bundler.js',
    );
  });

  it('falls back to legacy esm runtime entries for older implementations', () => {
    const resolve = jest.fn(
      (request: string, options?: { paths?: string[] }) => {
        const basedFromLegacy = options?.paths?.[0] === '/legacy/runtime-tools';

        if (
          basedFromLegacy &&
          request === '@module-federation/runtime/bundler'
        ) {
          throw new Error(`Cannot find module '${request}'`);
        }
        if (request === '@module-federation/runtime/dist/index.js') {
          return '/legacy/runtime/dist/index.js';
        }

        throw new Error(`Unexpected request: ${request}`);
      },
    ) as typeof require.resolve;

    expect(resolveRspackRuntimeAlias('/legacy/runtime-tools', resolve)).toBe(
      '/legacy/runtime/dist/index.js',
    );
  });

  it('falls back to legacy cjs runtime entries when esm legacy builds are unavailable', () => {
    const resolve = jest.fn(
      (request: string, options?: { paths?: string[] }) => {
        const basedFromLegacy = options?.paths?.[0] === '/legacy/runtime-tools';

        if (
          basedFromLegacy &&
          (request === '@module-federation/runtime/bundler' ||
            request === '@module-federation/runtime/dist/index.js')
        ) {
          throw new Error(`Cannot find module '${request}'`);
        }
        if (request === '@module-federation/runtime/dist/index.cjs') {
          return '/legacy/runtime/dist/index.cjs';
        }

        throw new Error(`Unexpected request: ${request}`);
      },
    ) as typeof require.resolve;

    expect(resolveRspackRuntimeAlias('/legacy/runtime-tools', resolve)).toBe(
      '/legacy/runtime/dist/index.cjs',
    );
  });
});
