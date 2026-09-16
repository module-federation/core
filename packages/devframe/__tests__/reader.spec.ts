import { describe, expect, it } from '@rstest/core';
import { createModuleFederationReader } from '../src/reader';
import { snapshotSchema } from '../src/types';
import { LIMITS } from '../src/constants';

const instance = (name = 'host') => ({
  options: {
    name,
    remotes: [
      {
        name: 'remote',
        entry: 'https://user:secret@cdn.test/mf.json?token=secret#private',
        alias: 'shop',
      },
    ],
    shareStrategy: 'version-first',
  },
  version: '2.6.0',
  moduleCache: new Map(),
  shareScopeMap: {},
});
const scope = (...instances: unknown[]) => ({
  __FEDERATION__: { __INSTANCES__: instances, moduleInfo: {} },
});

describe('current-state reader', () => {
  it('returns structured absence without creating federation globals', () => {
    const global = {};
    const result = createModuleFederationReader(() => global)();
    expect(result.present).toBe(false);
    expect(result.instances).toEqual([]);
    expect(result.remotes).toEqual([]);
    expect(result.shared).toEqual([]);
    expect(global).toEqual({});
    expect(snapshotSchema.parse(result)).toEqual(result);
  });

  it('reports a consumer and sanitizes the configured entry', () => {
    const result = createModuleFederationReader(() => scope(instance()))();
    expect(result.instances[0]).toMatchObject({
      name: 'host',
      runtimeVersion: '2.6.0',
      role: 'consumer',
    });
    expect(result.remotes[0]).toMatchObject({
      name: 'remote',
      alias: 'shop',
      entry: 'https://cdn.test/mf.json',
      loaded: 'unknown',
    });
  });

  it('distinguishes same-named instances and preserves identity after reorder', () => {
    const a = instance('same');
    const b = instance('same');
    const global = scope(a, b);
    const read = createModuleFederationReader(() => global);
    const first = read().instances;
    expect(first[0].instanceId).not.toBe(first[1].instanceId);
    global.__FEDERATION__.__INSTANCES__.reverse();
    expect(read().instances.map((i) => i.instanceId)).toEqual(
      first.map((i) => i.instanceId).reverse(),
    );
  });

  it('reads already initialized and not-yet-initialized containers without calling them', () => {
    const host = instance();
    const module = {
      inited: true,
      remoteInfo: {
        name: 'remote',
        version: '1',
        entry: 'https://cdn.test/entry.js?secret=yes',
      },
      get: () => {
        throw new Error('never call');
      },
    };
    host.moduleCache.set('remote', module);
    const read = createModuleFederationReader(() => scope(host));
    expect(read().remotes[0]).toMatchObject({
      loaded: 'loaded',
      producer: { name: 'remote', entry: 'https://cdn.test/entry.js' },
    });
    module.inited = false;
    expect(read().remotes[0].loaded).toBe('not-initialized');
    host.moduleCache.clear();
    expect(read().remotes[0].loaded).toBe('unknown');
  });

  it('keeps ambiguous producer candidates without claiming a resolved relationship', () => {
    const result = createModuleFederationReader(() =>
      scope(instance(), instance('remote'), instance('remote')),
    )();
    expect(result.remotes[0].candidateInstanceIds).toEqual(
      result.instances.slice(1).map((i) => i.instanceId),
    );
  });

  it('preserves one Shared version including explicit false values', () => {
    const host = instance();
    host.shareScopeMap = {
      default: {
        react: {
          '18.3.0': {
            from: 'provider',
            loaded: false,
            shareConfig: {
              singleton: false,
              eager: false,
              requiredVersion: false,
            },
          },
        },
      },
    };
    expect(createModuleFederationReader(() => scope(host))().shared).toEqual([
      {
        instanceId: 'instance-1',
        scope: 'default',
        name: 'react',
        version: '18.3.0',
        provider: 'provider',
        loaded: false,
        singleton: false,
        eager: false,
        requiredVersion: false,
        strategy: 'version-first',
      },
    ]);
  });

  it('preserves multiple versions, scopes, and owning instances without selecting a winner', () => {
    const host = instance();
    host.shareScopeMap = {
      default: {
        react: {
          '18': { from: 'a', loaded: true },
          '19': { from: 'b', loaded: true },
        },
      },
      other: { react: { '19': { from: 'c' } } },
    };
    const other = { ...instance('other'), shareScopeMap: host.shareScopeMap };
    const result = createModuleFederationReader(() => scope(host, other))();
    expect(result.shared).toHaveLength(6);
    expect(
      result.shared
        .slice(0, 3)
        .map((s) => [s.scope, s.version, s.provider, s.loaded]),
    ).toEqual([
      ['default', '18', 'a', true],
      ['default', '19', 'b', true],
      ['other', '19', 'c', null],
    ]);
    expect(new Set(result.shared.map((s) => s.instanceId)).size).toBe(2);
  });

  it('handles missing optional metadata and empty collections', () => {
    const result = createModuleFederationReader(() =>
      scope({}, { options: { name: 'empty', remotes: [] }, shareScopeMap: {} }),
    )();
    expect(result.instances[0]).toMatchObject({
      name: null,
      runtimeVersion: null,
      role: 'unknown',
      capabilities: { remotes: false, shared: false, remoteLoaded: false },
    });
    expect(result.remotes).toEqual([]);
    expect(result.shared).toEqual([]);
    expect(snapshotSchema.parse(result)).toEqual(result);
  });

  it('allowlists SDK module metadata and never serializes functions, cycles, getters or business data', () => {
    const host = instance();
    const secret = {
      cookie: 'DO_NOT_LEAK',
      token: 'DO_NOT_LEAK',
      component: () => {},
      self: {},
    };
    secret.self = secret;
    Object.defineProperty(host, 'name', {
      get() {
        throw new Error('getter executed');
      },
    });
    host.shareScopeMap = {
      default: {
        react: {
          '19': {
            lib: () => secret,
            get: () => secret,
            from: 'provider',
            business: secret,
          },
        },
      },
    };
    const global = scope(host);
    global.__FEDERATION__.moduleInfo = {
      'remote:https://user:DO_NOT_LEAK@cdn.test/mf.json?token=DO_NOT_LEAK': {
        version: 'https://cdn.test/mf.json?token=DO_NOT_LEAK',
        buildVersion: '1',
        remoteEntry: '/entry.js?token=DO_NOT_LEAK',
        publicPath: 'https://cdn.test/assets/#DO_NOT_LEAK',
        globalName: 'remote',
        getPublicPath: 'DO_NOT_LEAK',
        modules: [
          {
            moduleName: './Button',
            modulePath: './src/Button.tsx',
            factory: () => secret,
            assets: secret,
          },
        ],
        ...secret,
      },
    };
    const result = createModuleFederationReader(() => global)();
    const json = JSON.stringify(result);
    expect(json).not.toContain('DO_NOT_LEAK');
    expect(json).not.toContain('factory');
    expect(json).not.toContain('getPublicPath');
    expect(JSON.parse(json)).toEqual(result);
    expect(result.moduleInfo[0].modules[0].name).toBe('./Button');
    expect(result.shared[0].loaded).toBeNull();
  });

  it('bounds instance counts, total Shared versions, module names and text, and signals truncation', () => {
    const host = instance('x'.repeat(1000));
    host.shareScopeMap = {
      default: {
        react: Object.fromEntries(
          Array.from({ length: 300 }, (_, i) => [String(i), { from: 'p' }]),
        ),
      },
    };
    const result = createModuleFederationReader(() =>
      scope(...Array.from({ length: 40 }, () => ({ ...host }))),
    )();
    expect(result.instances).toHaveLength(LIMITS.instances);
    expect(result.instances[0].name).toHaveLength(LIMITS.text);
    expect(result.shared).toHaveLength(LIMITS.entries);
    expect(result.truncated).toBe(true);
    expect(snapshotSchema.parse(result)).toEqual(result);
  });

  it('does not expose unsafe URL schemes', () => {
    const host = instance();
    host.options.remotes[0].entry = 'data:text/javascript,secret';
    expect(
      createModuleFederationReader(() => scope(host))().remotes[0].entry,
    ).toBeNull();
  });
});
