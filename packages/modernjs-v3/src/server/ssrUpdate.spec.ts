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
  const state = { dynamic: false, context: new AsyncLocalStorage() };
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
  it('publishes a batch once and includes a previously failed target in whole-application recovery', async () => {
    const { adapter, runtime } = fixture();
    const instance = runtime.federation.instance as any;
    instance.options = { remotes: [{ name: 'remote', entry: 'v1' }] };
    let fail = true;
    const batches: any[][] = [];
    instance.updateRemotes = async (remotes: any[]) => {
      batches.push(remotes);
      instance.options.remotes = [];
      if (fail) throw new Error('partial mutation');
      instance.options.remotes = remotes;
    };
    let publications = 0;
    const application = {
      status: { phase: 'serving' },
      async update(
        invalidate: (entries?: readonly string[]) => Promise<void>,
        scope?: () => readonly string[] | undefined,
      ) {
        const entries = scope?.();
        try {
          await invalidate(
            this.status.phase === 'unavailable' ? undefined : entries,
          );
        } catch (error) {
          this.status.phase = 'unavailable';
          throw error;
        }
        this.status.phase = 'serving';
        return ++publications;
      },
    };
    await expect(
      adapter.update(application, 'remote', { entry: 'v2' }, { revision: 1 }),
    ).rejects.toThrow('SSR remote replacement failed');
    expect(adapter.status(application)).toMatchObject({
      mutationStarted: true,
      application: { phase: 'unavailable' },
    });
    fail = false;
    const result = await adapter.updateRemotes(
      application,
      [
        { name: 'new-a', entry: 'a' },
        { name: 'new-b', entry: 'b' },
      ],
      { revision: 2 },
    );
    expect(result).toMatchObject({
      mode: 'application',
      reasons: ['failed-update-recovery'],
      generation: 1,
    });
    expect(batches[1].map(({ name, entry }) => [name, entry])).toEqual([
      ['remote', 'v2'],
      ['new-a', 'a'],
      ['new-b', 'b'],
    ]);
    expect(publications).toBe(1);
  });

  it('deduplicates pending and applied revisions and rejects stale or conflicting messages', async () => {
    const { adapter, runtime } = fixture();
    const instance = runtime.federation.instance as any;
    instance.options = { remotes: [{ name: 'remote', entry: 'v1' }] };
    instance.updateRemotes = async (remotes: any[]) => {
      instance.options.remotes = remotes;
    };
    instance[stateKey].context = new AsyncLocalStorage();
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    let publications = 0;
    const application = {
      async update(
        invalidate: (entries?: readonly string[]) => Promise<void>,
        scope?: () => readonly string[] | undefined,
      ) {
        const entries = scope?.();
        await barrier;
        await invalidate(entries);
        return ++publications;
      },
    };
    const first = adapter.update(
      application,
      'remote',
      { entry: 'v2' },
      { revision: 2 },
    );
    expect(
      adapter.update(application, 'remote', { entry: 'v2' }, { revision: 2 }),
    ).toBe(first);
    expect(adapter.status(application)).toMatchObject({
      phase: 'pending',
      revision: 2,
    });
    await expect(
      adapter.update(application, 'remote', { entry: 'v1' }, { revision: 1 }),
    ).rejects.toThrow('Stale');
    await expect(
      adapter.update(
        application,
        'remote',
        { entry: 'other' },
        { revision: 2 },
      ),
    ).rejects.toThrow('different replacement');
    release();
    expect(await first).toMatchObject({ generation: 1, revision: 2 });
    await adapter.update(
      application,
      'remote',
      { entry: 'v2' },
      { revision: 2 },
    );
    expect(publications).toBe(1);
    expect(adapter.status(application)).toMatchObject({
      phase: 'applied',
      appliedRevision: 2,
    });
    await adapter.update(
      application,
      'remote',
      { entry: 'v1' },
      { revision: 3 },
    );
    expect(publications).toBe(2);
    expect(instance.options.remotes[0].entry).toBe('v1');
  });

  it('keeps appliedRevision unchanged on failure and retries the same revision explicitly', async () => {
    const { adapter } = fixture();
    let fail = true;
    let attempts = 0;
    const application = {
      async update() {
        attempts++;
        if (fail) throw new Error('load failed');
        return 1;
      },
    };
    await expect(
      adapter.update(application, 'remote', { entry: 'v2' }, { revision: 7 }),
    ).rejects.toThrow('load failed');
    expect(adapter.status(application)).toMatchObject({
      revision: 7,
      phase: 'failed',
      appliedRevision: undefined,
    });
    fail = false;
    await adapter.update(
      application,
      'remote',
      { entry: 'v2' },
      { revision: 7 },
    );
    expect(attempts).toBe(2);
    expect(adapter.status(application)).toMatchObject({
      appliedRevision: 7,
      phase: 'applied',
    });
  });

  it('publishes paired public targets once across alias changes and reports failure stages', async () => {
    const { runtime } = fixture();
    const instance = runtime.federation.instance as any;
    instance.options = {
      remotes: [{ name: 'remote', alias: 'alias', entry: 'private-v1' }],
    };
    instance.updateRemotes = async (remotes: any[]) => {
      instance.options.remotes = remotes;
    };
    const adapter = createSSRUpdateAdapter({
      name: 'host',
      entries: ['a', 'b'],
      hydration: {
        remotes: [{ name: 'remote', entry: 'https://cdn.test/v1.json' }],
      },
    });
    let fail = false;
    let generation = 0;
    const application = {
      async update(
        invalidate: () => Promise<void>,
        scope?: () => readonly string[] | undefined,
      ) {
        scope?.();
        await invalidate();
        if (fail) throw new Error('candidate validation failed');
        return ++generation;
      },
    };
    const resources = { templates: { a: '<html><head></head></html>' } };
    adapter.prepareResources(resources);
    const old = resources.templates.a;
    await adapter.update(application, 'alias', {
      entry: 'private-v2',
      client: { entry: 'https://cdn.test/v2.json' },
    });
    const result = await adapter.update(application, 'remote', {
      entry: 'private-v3',
      client: { entry: 'https://cdn.test/v3.json' },
    });
    adapter.prepareResources(resources);
    expect(old).toContain('v1.json');
    expect(resources.templates.a).toContain('v3.json');
    expect(resources.templates.a).not.toContain('v2.json');
    expect(resources.templates.a).not.toContain('private');
    expect(instance.options.remotes[0]).not.toHaveProperty('client');
    expect(Object.keys(result.timingsMs)).toEqual(
      expect.arrayContaining([
        'queue',
        'analyze',
        'drain',
        'clear',
        'rebuild',
        'total',
      ]),
    );
    expect(Object.values(result.timingsMs).every((value) => value >= 0)).toBe(
      true,
    );
    fail = true;
    await expect(
      adapter.update(application, 'alias', {
        entry: 'private-v4',
        client: { entry: 'https://cdn.test/v4.json' },
      }),
    ).rejects.toMatchObject({
      failedStage: 'rebuild',
      appliedRevision: 2,
      mutationStarted: true,
    });
    expect(adapter.status(application)).toMatchObject({
      phase: 'failed',
      stage: 'failed',
      appliedRevision: 2,
    });
  });

  it('remembers each instance registration when a replacement fails after removal', async () => {
    const { runtime, adapter } = fixture();
    let fail = true;
    const instance = Object.assign(runtime.federation.instance, {
      options: { remotes: [{ name: 'remote', entry: 'v1', alias: 'alias' }] },
      removeRemote() {
        this.options.remotes = [];
      },
      async updateRemotes(remotes: any[]) {
        this.removeRemote();
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
        { entry: '' },
      ),
    ).rejects.toThrow('replacement entries are required');
    expect(mutated).toBe(false);
  });
});
