import { describe, expect, it } from '@rstest/core';
import {
  CurrentGlobal,
  resetFederationGlobalInfo,
  type UserOptions,
} from '@module-federation/runtime-core';
import { remote } from '@module-federation/runtime-core/remote';
import { shared } from '@module-federation/runtime-core/shared';
import { web } from '@module-federation/runtime-core/platform/web';
import { init as composeInit } from '../src/compose';
import { createInstance, getInstance, init } from '../src';

const initializers = [
  ['public', init],
  [
    'composed',
    (options: UserOptions) =>
      composeInit(options, { remote, shared, platform: web }),
  ],
] as const;

describe('instance lifecycle after a global reset', () => {
  it.each(initializers)(
    'creates a clean %s instance and registers it again',
    (kind, initialize) => {
      const name = `reset-${kind}`;
      const id = `${name}:1.0.0`;
      const oldRemote = {
        name: 'old-remote',
        entry: 'http://localhost:1111/old-remote.js',
      };
      const first = initialize({
        name,
        id,
        remotes: [oldRemote],
        plugins: [{ name: 'old-plugin' }],
        shared: {
          'old-shared': {
            version: '1.0.0',
            lib: () => ({ stale: true }),
          },
        },
      });
      first.initRawContainer(oldRemote.name, oldRemote.entry, {
        init: () => undefined,
        get: async () => () => ({ stale: true }),
      });
      expect(first.moduleCache.has(oldRemote.name)).toBe(true);
      expect(first.options.shared).toHaveProperty('old-shared');

      resetFederationGlobalInfo();
      const second = initialize({ name, id });

      expect(second).not.toBe(first);
      expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toEqual([second]);
      expect(CurrentGlobal.__FEDERATION__.__SHARE__[id]).toBe(
        second.shareScopeMap,
      );
      expect(second.options.remotes).toEqual([]);
      expect(second.options.plugins.map((plugin) => plugin.name)).not.toContain(
        'old-plugin',
      );
      expect(second.options.shared).toEqual({});
      expect(second.shareScopeMap).toEqual({});
      expect(second.moduleCache.size).toBe(0);
      expect(getInstance()).toBe(second);
      expect(init({ name, id })).toBe(second);
      expect(composeInit({ name, id }, {})).toBe(second);
    },
  );

  it.each(initializers)(
    'adopts a registered replacement as the %s default',
    (kind, initialize) => {
      const name = `reset-adopt-${kind}`;
      const first = initialize({ name });

      resetFederationGlobalInfo();
      const replacement = createInstance({ name });
      const adopted = initialize({ name });

      expect(adopted).toBe(replacement);
      expect(adopted).not.toBe(first);
      expect(getInstance()).toBe(replacement);
      expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toEqual([replacement]);
    },
  );
});
