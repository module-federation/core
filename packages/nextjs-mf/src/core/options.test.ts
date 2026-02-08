import {
  assertLocalWebpackEnabled,
  assertWebpackBuildInvocation,
  isNextBuildOrDevCommand,
  normalizeNextFederationOptions,
  resolveFederationRemotes,
} from './options';
import { NextFederationError } from './errors';

describe('core/options', () => {
  const originalArgv = process.argv;
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.argv = originalArgv;
    process.env = { ...originalEnv };
  });

  it('throws NMF001 when webpack flag is missing in next build command', () => {
    process.argv = ['node', '/tmp/next/dist/bin/next', 'build'];

    expect(() => assertWebpackBuildInvocation()).toThrow(NextFederationError);
    expect(() => assertWebpackBuildInvocation()).toThrow('[NMF001]');
  });

  it('passes webpack invocation when build command includes --webpack', () => {
    process.argv = ['node', '/tmp/next/dist/bin/next', 'build', '--webpack'];

    expect(() => assertWebpackBuildInvocation()).not.toThrow();
  });

  it('does not treat next start as a webpack build/dev invocation', () => {
    process.argv = ['node', '/tmp/next/dist/bin/next', 'start'];

    expect(isNextBuildOrDevCommand()).toBe(false);
    expect(() => assertWebpackBuildInvocation()).not.toThrow();
  });

  it('passes when NEXT_PRIVATE_LOCAL_WEBPACK is set', () => {
    process.env['NEXT_PRIVATE_LOCAL_WEBPACK'] = 'true';

    expect(() => assertLocalWebpackEnabled()).not.toThrow();
    expect(process.env['NEXT_PRIVATE_LOCAL_WEBPACK']).toBe('true');
  });

  it('throws NMF002 when NEXT_PRIVATE_LOCAL_WEBPACK is missing', () => {
    delete process.env['NEXT_PRIVATE_LOCAL_WEBPACK'];

    expect(() => assertLocalWebpackEnabled()).toThrow(NextFederationError);
    expect(() => assertLocalWebpackEnabled()).toThrow('[NMF002]');
    expect(process.env['NEXT_PRIVATE_LOCAL_WEBPACK']).toBeUndefined();
  });

  it('normalizes defaults and resolves remotes resolver', () => {
    const normalized = normalizeNextFederationOptions({
      name: 'home',
      remotes: ({ isServer }) => ({
        shop: `shop@http://localhost:3001/_next/static/${
          isServer ? 'ssr' : 'chunks'
        }/remoteEntry.js`,
      }),
    });

    expect(normalized.mode).toBe('hybrid');
    expect(normalized.filename).toBe('static/chunks/remoteEntry.js');
    expect(normalized.pages.pageMapFormat).toBe('routes-v2');

    const resolvedServerRemotes = resolveFederationRemotes(normalized, {
      isServer: true,
      compilerName: 'server',
      nextRuntime: 'nodejs',
    }) as Record<string, string>;

    expect(resolvedServerRemotes['shop']).toContain('/ssr/remoteEntry.js');
  });

  it('throws NMF005 for legacy extraOptions usage', () => {
    expect(() =>
      normalizeNextFederationOptions({
        name: 'legacy',
        extraOptions: {
          exposePages: true,
        },
      } as any),
    ).toThrow('[NMF005]');
  });
});
