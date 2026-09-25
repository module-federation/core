/**
 * @jest-environment node
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  MIN_RUNTIME_VERSION,
  resolveRuntimeFamily,
} from '../../src/composition/family';
import { selectMode, type ModeInputs } from '../../src/composition/selectMode';
import { composableFamily, packageDir, tempDir } from './fixtures';

const RUNTIME = '@module-federation/runtime';
const composable = () => resolveRuntimeFamily(composableFamily(tempDir()));
const legacyReason = async (inputs: ModeInputs, family = composable()) => {
  const mode = await selectMode(family, inputs);
  return mode.mode === 'legacy' ? mode.reason : undefined;
};
const unsupportedReason = async (family: ReturnType<typeof composable>) => {
  const mode = await selectMode(family, {});
  return mode.mode === 'unsupported' ? mode.reason : undefined;
};

describe('selectMode', () => {
  it('composes a family that exports every required subpath', async () => {
    expect(await selectMode(composable(), {})).toEqual({ mode: 'composed' });
  });

  it('rejects the older runtime-tools in the pnpm store and names the minimum version', async () => {
    const store = path.resolve(__dirname, '../../../../node_modules/.pnpm');
    const [older] = fs
      .readdirSync(store)
      .filter((dir) =>
        /^@module-federation\+runtime-tools@2\.\d+\.\d+$/.test(dir),
      );
    expect(older).toBeDefined();

    const reason = await unsupportedReason(
      resolveRuntimeFamily(
        path.join(
          store,
          older,
          'node_modules/@module-federation/runtime-tools',
        ),
      ),
    );

    expect(reason).toMatch(
      /@module-federation\/webpack-bundler-runtime at .* does not export "\.\/compose"/,
    );
    expect(reason).toContain(`${MIN_RUNTIME_VERSION} or newer`);
  });

  it('does not count a "./*" pattern as the required key', async () => {
    const root = composableFamily(tempDir(), {
      '@module-federation/runtime-core': {
        exports: { '.': './dist/index.js', './*': './dist/*.js' },
      },
    });
    expect(await unsupportedReason(resolveRuntimeFamily(root))).toMatch(
      /runtime-core at .* does not export "\.\/kernel"/,
    );
  });

  it('rejects a member with another name', async () => {
    const root = composableFamily(tempDir(), {
      '@module-federation/runtime-core': { name: 'runtime-core-fork' },
    });
    expect(await unsupportedReason(resolveRuntimeFamily(root))).toMatch(
      /is named "runtime-core-fork"/,
    );
  });

  it('rejects a member that does not resolve', async () => {
    const root = composableFamily(tempDir());
    fs.rmSync(packageDir(root, '@module-federation/sdk'), { recursive: true });
    expect(await unsupportedReason(resolveRuntimeFamily(root))).toMatch(
      /@module-federation\/sdk could not be resolved from/,
    );
  });

  it('rejects an exports string with no subpath keys', async () => {
    const root = composableFamily(tempDir(), {
      '@module-federation/runtime': { exports: './dist/index.js' as never },
    });
    expect(await unsupportedReason(resolveRuntimeFamily(root))).toMatch(
      /runtime at .* does not export "\.\/compose"/,
    );
  });

  it.each([
    ['externalRuntime', { externalRuntime: true }],
    ['provideExternalRuntime', { provideExternalRuntime: true }],
  ])('selects legacy on experiments.%s', async (_, experiments) => {
    expect(await selectMode(composable(), { experiments })).toEqual({
      mode: 'legacy',
      reason: expect.stringMatching(/experiments\./),
      requested: true,
    });
  });

  describe('externals', () => {
    const cases: [string, ModeInputs['externals']][] = [
      ['a string', RUNTIME],
      ['an object key', { [RUNTIME]: 'mf' }],
      ['a RegExp', /^@module-federation\/runtime-core$/],
      ['an array item', ['react', { '@module-federation/sdk': 'sdk' }]],
      [
        'a promise-returning function',
        ({ request }: { request: string }) =>
          request === RUNTIME
            ? Promise.resolve('mf')
            : Promise.resolve(undefined),
      ],
      [
        'a callback function',
        (
          { request }: { request: string },
          callback: (err?: Error | null, value?: string) => void,
        ) => callback(null, request === RUNTIME ? 'mf' : undefined),
      ],
      [
        'an async function',
        async ({ request }: { request: string }) =>
          request === RUNTIME ? 'mf' : undefined,
      ],
      [
        'a deprecated three-argument function',
        (
          _context: string,
          request: string,
          callback: (err?: Error | null, value?: string) => void,
        ) => callback(null, request === RUNTIME ? 'mf' : undefined),
      ],
    ];

    it.each(cases)(
      'selects legacy when %s externalizes a family package',
      async (_, externals) => {
        expect(await legacyReason({ externals })).toMatch(/is externalized/);
      },
    );

    it('passes the request and context to function externals', async () => {
      const seen: unknown[] = [];
      await selectMode(composable(), {
        context: '/app',
        externals: async (data: unknown) => {
          seen.push(data);
          return undefined;
        },
      });
      expect(seen).toContainEqual({ request: RUNTIME, context: '/app' });
    });

    it.each([
      [
        'unrelated externals',
        ['react', /^lodash/, { vue: 'Vue' }, async () => undefined],
      ],
      ['a false object value', { [RUNTIME]: false }],
      ['a subpath-only regexp', /^@module-federation\/runtime\/helpers$/],
    ])('composes with %s', async (_, externals) => {
      expect(
        await legacyReason({ externals: externals as ModeInputs['externals'] }),
      ).toBeUndefined();
    });

    it('selects legacy when a function external throws', async () => {
      expect(
        await legacyReason({
          externals: () => {
            throw new Error('boom');
          },
        }),
      ).toMatch(/boom/);
    });
  });

  describe('alias', () => {
    it.each([
      ['an exact key', { [RUNTIME]: '/fork/runtime' }],
      ['an exact-match key', { [`${RUNTIME}$`]: '/fork/runtime' }],
      [
        'a subpath key',
        { '@module-federation/runtime-core/remote': '/fork/remote' },
      ],
      ['a scope key', { '@module-federation': '/fork' }],
      ['a false value', { '@module-federation/sdk': false }],
      ['the array form', [{ name: RUNTIME, alias: '/fork/runtime' }]],
    ])('selects legacy on %s', async (_, alias) => {
      expect(await legacyReason({ alias })).toMatch(/is aliased/);
    });

    it('ignores aliases whose value is exempt', async () => {
      expect(
        await legacyReason({
          alias: {
            [RUNTIME]: '/computed/runtime.js',
            '@module-federation/webpack-bundler-runtime': ['/virtual/plan.mjs'],
            react: '/x/react',
            '@module-federation/runtime-toolsx': '/x',
          },
          aliasExemptions: ['/computed/runtime.js', '/virtual/plan.mjs'],
        }),
      ).toBeUndefined();
    });
  });

  it('selects legacy when the caller reports VirtualModulesPlugin missing', async () => {
    expect(await legacyReason({ virtualModulesPlugin: false })).toMatch(
      /VirtualModulesPlugin/,
    );
    expect(await legacyReason({ virtualModulesPlugin: true })).toBeUndefined();
  });
});
