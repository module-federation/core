import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from '@rstest/core';
import { FederationKernel } from '../src/kernel';
import { ModuleFederation } from '../src';
import { remote } from '../src/remote/capability';
import { globalLoading, resetFederationGlobalInfo } from '../src/global';
import {
  getRemoteEntry,
  getRemoteInfo,
  getRemoteEntryUniqueKey,
} from '../src/utils/load';
import type {
  ModuleFederationRuntimePlugin,
  Platform,
  RemoteEntryExports,
} from '../src/type';

const entry = pathToFileURL(
  `${__dirname}/resources/load/evaluator-entry.js`,
).href;

function evaluator(evaluatorName: string, failures = 0) {
  let evaluations = 0;
  const platform: Platform = {
    isBrowser: () => false,
    loadScript: async () => undefined,
    async loadEntry({ remoteInfo, loaderHook, getEntryUrl }) {
      const script = loaderHook.lifecycle.createScript.emit({
        url: getEntryUrl ? getEntryUrl(remoteInfo.entry) : remoteInfo.entry,
        remoteInfo,
      });
      const url =
        script && 'url' in script
          ? script.url
          : getEntryUrl
            ? getEntryUrl(remoteInfo.entry)
            : remoteInfo.entry;
      const response = await loaderHook.lifecycle.fetch.emit(
        url,
        {},
        remoteInfo,
      );
      const source = response
        ? await response.text()
        : await readFile(new URL(url), 'utf8');
      evaluations += 1;
      const container: RemoteEntryExports = runInNewContext(source, {
        evaluatorName:
          new URL(url).searchParams.get('evaluator') ?? evaluatorName,
        failEvaluation: evaluations <= failures,
      });
      return container;
    },
  };
  return { platform, evaluations: () => evaluations };
}

function host(
  platform: Platform,
  plugins: ModuleFederationRuntimePlugin[] = [],
) {
  return new FederationKernel(
    { name: 'same-host', remotes: [{ name: 'app', entry }], plugins },
    { remote, platform },
  );
}

describe('evaluated entry cache identity through loadRemote', () => {
  for (const [firstName, secondName] of [
    ['A', 'B'],
    ['B', 'A'],
  ]) {
    for (const concurrent of [false, true]) {
      it(`isolates ${firstName} then ${secondName}, concurrent=${concurrent}`, async () => {
        const first = evaluator(firstName);
        const second = evaluator(secondName);
        const firstHost = host(first.platform);
        const secondHost = host(second.platform);
        const loads = concurrent
          ? await Promise.all([
              firstHost.loadRemote('app/Button'),
              secondHost.loadRemote('app/Button'),
            ])
          : [
              await firstHost.loadRemote('app/Button'),
              await secondHost.loadRemote('app/Button'),
            ];

        expect(loads).toEqual([
          `${firstName}:./Button`,
          `${secondName}:./Button`,
        ]);
        expect(first.evaluations()).toBe(1);
        expect(second.evaluations()).toBe(1);
      });
    }
  }

  for (const concurrent of [false, true]) {
    it(`deduplicates compatible evaluators, concurrent=${concurrent}`, async () => {
      const compatible = evaluator('shared');
      const first = host(compatible.platform);
      const second = host(compatible.platform);
      const loads = concurrent
        ? await Promise.all([
            first.loadRemote('app/Button'),
            second.loadRemote('app/Button'),
          ])
        : [
            await first.loadRemote('app/Button'),
            await second.loadRemote('app/Button'),
          ];

      expect(loads).toEqual(['shared:./Button', 'shared:./Button']);
      expect(compatible.evaluations()).toBe(1);
    });
  }

  it('retries a rejected evaluator without borrowing another successful entry', async () => {
    const rejected = evaluator('retry', 1);
    const successful = evaluator('other');
    const retryHost = host(rejected.platform);
    await expect(retryHost.loadRemote('app/Button')).rejects.toThrow(
      'transient evaluator failure',
    );
    await expect(
      host(successful.platform).loadRemote('app/Button'),
    ).resolves.toBe('other:./Button');
    await expect(retryHost.loadRemote('app/Button')).resolves.toBe(
      'retry:./Button',
    );
    expect(rejected.evaluations()).toBe(2);
    expect(successful.evaluations()).toBe(1);
  });

  it('clears evaluated entry promises on federation reset', async () => {
    const compatible = evaluator('reset');
    await expect(
      host(compatible.platform).loadRemote('app/Button'),
    ).resolves.toBe('reset:./Button');
    resetFederationGlobalInfo();
    await expect(
      host(compatible.platform).loadRemote('app/Button'),
    ).resolves.toBe('reset:./Button');
    expect(compatible.evaluations()).toBe(2);
  });

  it('allows equivalent factory evaluators to load independently', async () => {
    const first = evaluator('equivalent');
    const second = evaluator('equivalent');
    await expect(host(first.platform).loadRemote('app/Button')).resolves.toBe(
      'equivalent:./Button',
    );
    await expect(host(second.platform).loadRemote('app/Button')).resolves.toBe(
      'equivalent:./Button',
    );
    expect(first.evaluations()).toBe(1);
    expect(second.evaluations()).toBe(1);
  });

  it('allows an identical shared entry callback on isolated hosts', async () => {
    const evaluated = evaluator('callback');
    const plugin: ModuleFederationRuntimePlugin = {
      name: 'shared-callback',
      loadEntry({ remoteInfo, loaderHook }) {
        return evaluated.platform.loadEntry({ remoteInfo, loaderHook });
      },
    };
    const platform = evaluator('fallback');
    const loads = await Promise.all([
      host(platform.platform, [plugin]).loadRemote('app/Button'),
      host(platform.platform, [plugin]).loadRemote('app/Button'),
    ]);
    expect(loads).toEqual(['callback:./Button', 'callback:./Button']);
    expect(evaluated.evaluations()).toBe(2);
    expect(platform.evaluations()).toBe(0);
  });

  it('deduplicates identical callbacks for concurrent loads on the same host', async () => {
    const evaluated = evaluator('callback');
    const origin = host(evaluated.platform, [
      {
        name: 'shared-callback',
        loadEntry: ({ remoteInfo, loaderHook }) =>
          evaluated.platform.loadEntry({ remoteInfo, loaderHook }),
      },
    ]);
    expect(
      await Promise.all([
        origin.loadRemote('app/Button'),
        origin.loadRemote('app/Button'),
      ]),
    ).toEqual(['callback:./Button', 'callback:./Button']);
    expect(evaluated.evaluations()).toBe(1);
  });

  it('isolates the same entry callback when it reads host state', async () => {
    const first = evaluator('host-A');
    const second = evaluator('host-B');
    const fallback = evaluator('fallback');
    const plugin: ModuleFederationRuntimePlugin = {
      name: 'host-sensitive-callback',
      loadEntry({ origin, remoteInfo, loaderHook }) {
        const selected = origin.options.id === 'A' ? first : second;
        return selected.platform.loadEntry({ remoteInfo, loaderHook });
      },
    };
    const firstHost = new FederationKernel(
      {
        name: 'same-host',
        id: 'A',
        remotes: [{ name: 'app', entry }],
        plugins: [plugin],
      },
      { remote, platform: fallback.platform },
    );
    const secondHost = new FederationKernel(
      {
        name: 'same-host',
        id: 'B',
        remotes: [{ name: 'app', entry }],
        plugins: [plugin],
      },
      { remote, platform: fallback.platform },
    );
    expect(
      await Promise.all([
        firstHost.loadRemote('app/Button'),
        secondHost.loadRemote('app/Button'),
      ]),
    ).toEqual(['host-A:./Button', 'host-B:./Button']);
    expect(first.evaluations()).toBe(1);
    expect(second.evaluations()).toBe(1);
    expect(fallback.evaluations()).toBe(0);
  });

  it('isolates distinct entry callbacks on the same platform', async () => {
    const platform = evaluator('fallback');
    const first = evaluator('callback-A');
    const second = evaluator('callback-B');
    const loads = await Promise.all([
      host(platform.platform, [
        {
          name: 'callback-A',
          loadEntry: ({ remoteInfo, loaderHook }) =>
            first.platform.loadEntry({ remoteInfo, loaderHook }),
        },
      ]).loadRemote('app/Button'),
      host(platform.platform, [
        {
          name: 'callback-B',
          loadEntry: ({ remoteInfo, loaderHook }) =>
            second.platform.loadEntry({ remoteInfo, loaderHook }),
        },
      ]).loadRemote('app/Button'),
    ]);
    expect(loads).toEqual(['callback-A:./Button', 'callback-B:./Button']);
    expect(first.evaluations()).toBe(1);
    expect(second.evaluations()).toBe(1);
    expect(platform.evaluations()).toBe(0);
  });

  it('allows equivalent entry callback factories on the same platform', async () => {
    const fallback = evaluator('fallback');
    const evaluated = evaluator('equivalent-callback');
    const callback = (): ModuleFederationRuntimePlugin => ({
      name: 'equivalent-callback',
      loadEntry: ({ remoteInfo, loaderHook }) =>
        evaluated.platform.loadEntry({ remoteInfo, loaderHook }),
    });
    const loads = await Promise.all([
      host(fallback.platform, [callback()]).loadRemote('app/Button'),
      host(fallback.platform, [callback()]).loadRemote('app/Button'),
    ]);
    expect(loads).toEqual([
      'equivalent-callback:./Button',
      'equivalent-callback:./Button',
    ]);
    expect(evaluated.evaluations()).toBe(2);
    expect(fallback.evaluations()).toBe(0);
  });

  it('does not borrow cached entries after a platform loader changes', async () => {
    const first = evaluator('before');
    const replacement = evaluator('after');
    await expect(host(first.platform).loadRemote('app/Button')).resolves.toBe(
      'before:./Button',
    );
    first.platform.loadEntry = replacement.platform.loadEntry;
    await expect(host(first.platform).loadRemote('app/Button')).resolves.toBe(
      'after:./Button',
    );
    expect(first.evaluations()).toBe(1);
    expect(replacement.evaluations()).toBe(1);
  });

  it('isolates entry URL transforms for the same host and source URL', async () => {
    const evaluated = evaluator('fallback');
    const origin = host(evaluated.platform);
    const info = getRemoteInfo({ name: 'app', entry });
    const transformA = (url: string) => `${url}?evaluator=url-A`;
    const transformB = (url: string) => `${url}?evaluator=url-B`;
    const [first, second] = await Promise.all([
      getRemoteEntry({ origin, remoteInfo: info, getEntryUrl: transformA }),
      getRemoteEntry({ origin, remoteInfo: info, getEntryUrl: transformB }),
    ]);
    expect(first && (await (await first.get('./Button'))())).toBe(
      'url-A:./Button',
    );
    expect(second && (await (await second.get('./Button'))())).toBe(
      'url-B:./Button',
    );
    const cached = await getRemoteEntry({
      origin,
      remoteInfo: info,
      getEntryUrl: transformA,
    });
    expect(cached).toBe(first);
    expect(evaluated.evaluations()).toBe(2);
  });

  it('does not borrow cached entries after a loading callback changes', async () => {
    const fallback = evaluator('fallback');
    const first = evaluator('before-hook');
    const second = evaluator('after-hook');
    const origin = host(fallback.platform);
    const info = getRemoteInfo({ name: 'app', entry });
    const before: NonNullable<ModuleFederationRuntimePlugin['loadEntry']> = ({
      remoteInfo,
      loaderHook,
    }) => first.platform.loadEntry({ remoteInfo, loaderHook });
    const after: NonNullable<ModuleFederationRuntimePlugin['loadEntry']> = ({
      remoteInfo,
      loaderHook,
    }) => second.platform.loadEntry({ remoteInfo, loaderHook });
    const hook = origin.remoteHandler.hooks.lifecycle.loadEntry;
    hook.on(before);
    const beforeEntry = await getRemoteEntry({ origin, remoteInfo: info });
    expect(beforeEntry && (await (await beforeEntry.get('./Button'))())).toBe(
      'before-hook:./Button',
    );
    hook.remove(before);
    hook.on(after);
    const afterEntry = await getRemoteEntry({ origin, remoteInfo: info });
    expect(afterEntry && (await (await afterEntry.get('./Button'))())).toBe(
      'after-hook:./Button',
    );
    expect(first.evaluations()).toBe(1);
    expect(second.evaluations()).toBe(1);
  });

  it('isolates createScript rewrites on the same platform', async () => {
    const evaluated = evaluator('fallback');
    const first = host(evaluated.platform, [
      {
        name: 'rewrite-A',
        createScript: ({ url }) => ({ url: `${url}?evaluator=rewrite-A` }),
      },
    ]);
    const second = host(evaluated.platform, [
      {
        name: 'rewrite-B',
        createScript: ({ url }) => ({ url: `${url}?evaluator=rewrite-B` }),
      },
    ]);
    expect(
      await Promise.all([
        first.loadRemote('app/Button'),
        second.loadRemote('app/Button'),
      ]),
    ).toEqual(['rewrite-A:./Button', 'rewrite-B:./Button']);
    expect(evaluated.evaluations()).toBe(2);
  });

  it('isolates fetch hooks on the same platform', async () => {
    const evaluated = evaluator('fallback');
    const source = await readFile(new URL(entry), 'utf8');
    const first = host(evaluated.platform, [
      {
        name: 'fetch-A',
        fetch: async () =>
          new Response(`evaluatorName = 'fetch-A';\n${source}`),
      },
    ]);
    const second = host(evaluated.platform, [
      {
        name: 'fetch-B',
        fetch: async () =>
          new Response(`evaluatorName = 'fetch-B';\n${source}`),
      },
    ]);
    expect(
      await Promise.all([
        first.loadRemote('app/Button'),
        second.loadRemote('app/Button'),
      ]),
    ).toEqual(['fetch-A:./Button', 'fetch-B:./Button']);
    expect(evaluated.evaluations()).toBe(2);
  });

  it('excludes afterLoadEntry observers from evaluator identity', async () => {
    const evaluated = evaluator('observed');
    let observations = 0;
    const first = host(evaluated.platform, [
      {
        name: 'observer-A',
        afterLoadEntry() {
          observations += 1;
        },
      },
    ]);
    const second = host(evaluated.platform, [
      {
        name: 'observer-B',
        afterLoadEntry() {
          observations += 1;
        },
      },
    ]);
    expect(
      await Promise.all([
        first.loadRemote('app/Button'),
        second.loadRemote('app/Button'),
      ]),
    ).toEqual(['observed:./Button', 'observed:./Button']);
    expect(observations).toBe(2);
    expect(evaluated.evaluations()).toBe(1);
  });

  it('does not borrow a legacy cache entry lacking evaluator identity', async () => {
    const evaluated = evaluator('identified');
    const info = getRemoteInfo({ name: 'app', entry });
    globalLoading[getRemoteEntryUniqueKey(info)] = Promise.resolve({
      init() {},
      get: async () => () => 'legacy:./Button',
    });
    await expect(
      host(evaluated.platform).loadRemote('app/Button'),
    ).resolves.toBe('identified:./Button');
    expect(evaluated.evaluations()).toBe(1);
  });

  it('shares the default loader across separate hosts', async () => {
    const first = new ModuleFederation({ name: 'default-A' });
    const second = new ModuleFederation({ name: 'default-B' });
    const info = getRemoteInfo({
      name: 'default-cache-proof',
      entry: 'http://localhost:1111/resources/load/default-cache-entry.js',
      entryGlobalName: 'defaultCacheProof',
    });
    delete globalThis.defaultCacheProof;
    globalThis.defaultCacheProofEvaluations = 0;
    const [firstEntry, secondEntry] = await Promise.all([
      getRemoteEntry({ origin: first, remoteInfo: info }),
      getRemoteEntry({ origin: second, remoteInfo: info }),
    ]);
    expect(first.platform).toBe(second.platform);
    expect(firstEntry).toBe(secondEntry);
    expect(globalThis.defaultCacheProofEvaluations).toBe(1);
    expect(firstEntry && (await (await firstEntry.get('./Button'))())).toBe(
      'default:./Button',
    );
    delete globalThis.defaultCacheProof;
    delete globalThis.defaultCacheProofEvaluations;
  });
});

declare global {
  // eslint-disable-next-line no-var
  var defaultCacheProof: RemoteEntryExports | undefined;
  // eslint-disable-next-line no-var
  var defaultCacheProofEvaluations: number | undefined;
}
