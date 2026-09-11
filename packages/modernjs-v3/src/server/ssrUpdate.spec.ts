import { AsyncLocalStorage } from 'node:async_hooks';
import { afterEach, describe, expect, it } from '@rstest/core';
import { createSSRUpdateAdapter } from './ssrUpdate';

const key = Symbol.for('modern-js.mf.ssr.entries');
const stateKey = Symbol.for('modern-js.mf.ssr.consumption');
const previous = (globalThis as any)[key];
afterEach(() => {
  (globalThis as any)[key] = previous;
});
function fixture() {
  const state = { dynamic: false };
  const runtime = {
    federation: { instance: { [stateKey]: state } },
    remotesLoadingData: {
      remoteKeyToRemoteModuleIds: { remote: [1] },
      remoteModuleIdToConsumerModuleIds: { 1: [2] },
      consumerModuleIdToParentModuleIds: { 2: [3] },
    },
  };
  const a = {
    application: 'host',
    entry: 'a',
    owner: 'a',
    rootIds: [3],
    remoteNames: ['remote'],
    reasons: [],
    chunks: [10],
    runtime,
    load: () => ({}),
  };
  const b = { ...a, entry: 'b', owner: 'b', remoteNames: [], rootIds: [4] };
  const unrelated = {
    ...a,
    application: 'host:other',
    entry: 'unknown',
    owner: 'unknown',
  };
  (globalThis as any)[key] = new Map(
    [a, b, unrelated].map((record) => [
      JSON.stringify([record.application, record.entry]),
      record,
    ]),
  );
  return {
    state,
    runtime,
    a,
    b,
    adapter: createSSRUpdateAdapter({
      name: 'host',
      entries: ['a', 'b'],
      staticOnly: true,
    }),
  };
}
describe('SSR static scope proof', () => {
  it('expands across a shared runtime and isolates application names containing separators', () => {
    const { adapter } = fixture();
    expect(adapter.plan('remote')).toEqual({
      mode: 'entries',
      entries: ['a', 'b'],
      reasons: [],
    });
  });
  it('falls back even when a chunk exists if the native parent closure cannot reach its entry', () => {
    const { adapter, runtime } = fixture();
    runtime.remotesLoadingData.consumerModuleIdToParentModuleIds[2] = [];
    expect(adapter.plan('remote')).toEqual({
      mode: 'application',
      reasons: ['incomplete-parent-closure'],
    });
  });
  it('requires the complete entry inventory and explicit static-only contract', () => {
    fixture();
    expect(
      createSSRUpdateAdapter({
        name: 'host',
        entries: ['a', 'missing'],
        staticOnly: true,
      }).plan('remote').reasons,
    ).toContain('missing-entry-metadata');
    expect(
      createSSRUpdateAdapter({ name: 'host', entries: ['a', 'b'] }).plan(
        'remote',
      ).reasons,
    ).toContain('dynamic-or-mixed-consumption');
  });
  it('invalidates the proof on runtime consumption and unknown remote names', () => {
    const { adapter, state } = fixture();
    state.dynamic = true;
    expect(adapter.plan('remote').reasons).toContain(
      'runtime-consumption-observed',
    );
    expect(adapter.plan('new-remote').reasons).toContain(
      'remote-not-in-static-graph',
    );
  });
});

describe('SSR replacement recovery', () => {
  it('remembers each instance registration when a replacement fails after removal', async () => {
    const { runtime, adapter } = fixture();
    let fail = true;
    const instance = Object.assign(runtime.federation.instance, {
      options: { remotes: [{ name: 'remote', entry: 'v1', alias: 'alias' }] },
      removeRemote() {
        this.options.remotes = [];
      },
      registerRemotes(remotes: any[]) {
        if (fail) {
          fail = false;
          throw new Error('registration failed');
        }
        this.options.remotes = remotes;
      },
    });
    Object.assign(instance[stateKey], { context: new AsyncLocalStorage() });
    let failed = false;
    const application = {
      async update(
        invalidate: (entries?: readonly string[]) => Promise<void>,
        scope?: () => readonly string[] | undefined,
      ) {
        const entries = scope?.();
        try {
          await invalidate(failed ? undefined : entries);
        } catch (error) {
          failed = true;
          throw error;
        }
        return 1;
      },
    };
    await expect(
      adapter.update(application, 'remote', { entry: 'v2' }),
    ).rejects.toThrow('SSR remote replacement failed');
    expect(instance.options.remotes).toEqual([]);
    expect(
      await adapter.update(application, 'remote', { entry: 'v3' }),
    ).toMatchObject({
      mode: 'application',
      reasons: ['failed-update-recovery'],
    });
    expect(instance.options.remotes).toEqual([
      { name: 'remote', entry: 'v3', alias: 'alias' },
    ]);
    let mutated = false;
    await expect(
      adapter.update(
        {
          async update(invalidate, scope) {
            scope?.();
            mutated = true;
            await invalidate();
            return 2;
          },
        },
        'unknown',
        { entry: 'v2' },
      ),
    ).rejects.toThrow('Remote is not registered');
    expect(mutated).toBe(false);
  });
});
