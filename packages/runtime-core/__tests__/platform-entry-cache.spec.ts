import { afterAll, afterEach, describe, expect, it } from '@rstest/core';
import { FederationKernel } from '../src/kernel';
import { remote } from '../src/remote/capability';
import { node } from '../src/platform/node';
import { web } from '../src/platform/web';
import { getRemoteEntry, getRemoteInfo } from '../src/utils/load';
import { removeScriptTags } from './mock/utils';
import type {
  ModuleFederationRuntimePlugin,
  RemoteEntryExports,
} from '../src/type';

const nodeGlobal = 'cacheProofNodeEntry';
const browserGlobal = 'cacheProofBrowserEntry';
const original = 'http://localhost:1111/resources/load/browser-cache-A.js';
const data = (source: string) =>
  `data:text/javascript,${encodeURIComponent(source)}`;
const nodeEntry = (name: string) =>
  data(`module.exports={init(){},get(expose){return()=> '${name}:'+expose}};`);

function nodeHost(name: string, record: () => void) {
  return new FederationKernel(
    {
      name: 'same-host',
      remotes: [{ name: 'app', entry: original, entryGlobalName: nodeGlobal }],
      plugins: [
        {
          name: `node-${name}`,
          createScript() {
            record();
            return { url: nodeEntry(name) };
          },
        },
      ],
    },
    { remote, platform: node },
  );
}

function browserHost(name: string, record: () => void) {
  return new FederationKernel(
    {
      name: 'same-host',
      remotes: [
        { name: 'app', entry: original, entryGlobalName: browserGlobal },
      ],
      plugins: [
        {
          name: `browser-${name}`,
          createScript() {
            record();
            const script = document.createElement('script');
            script.src = `http://localhost:1111/resources/load/browser-cache-${name}.js`;
            return script;
          },
        },
      ],
    },
    { remote, platform: web },
  );
}

describe('actual platform entry evaluators', () => {
  const previousEsmBuild = process.env.IS_ESM_BUILD;
  process.env.IS_ESM_BUILD = 'true';
  afterAll(() => {
    if (previousEsmBuild === undefined) {
      delete process.env.IS_ESM_BUILD;
    } else {
      process.env.IS_ESM_BUILD = previousEsmBuild;
    }
  });

  afterEach(() => {
    delete globalThis.cacheProofNodeEntry;
    delete globalThis.cacheProofNodeDefaults;
    delete globalThis.cacheProofBrowserEntry;
    delete globalThis.cacheProofBrowserEvaluations;
    Reflect.deleteProperty(globalThis, 'cacheProofBrowserA');
    Reflect.deleteProperty(globalThis, 'cacheProofBrowserB');
    removeScriptTags();
  });

  for (const customFirst of [true, false]) {
    for (const concurrent of [false, true]) {
      it(`isolates actual Node custom/default loads customFirst=${customFirst}, concurrent=${concurrent}`, async () => {
        globalThis.cacheProofNodeDefaults = 0;
        const entry = data(
          `globalThis.cacheProofNodeDefaults += 1; module.exports={init(){},get(expose){return()=> 'B:'+expose}};`,
        );
        let customCalls = 0;
        let announce = () => {};
        let release = () => {};
        const evaluated = new Promise<void>((resolve) => {
          announce = resolve;
        });
        const gate = new Promise<void>((resolve) => {
          release = resolve;
        });
        const make = (custom: boolean, observe: boolean) => {
          const plugins: ModuleFederationRuntimePlugin[] = [];
          if (custom) {
            plugins.push({
              name: 'custom-A',
              createScript() {
                customCalls += 1;
                return { url: nodeEntry('A') };
              },
            });
          }
          if (observe) {
            plugins.push({
              name: 'hold-evaluated-entry',
              async afterLoadEntry() {
                announce();
                await gate;
              },
            });
          }
          return new FederationKernel(
            {
              name: 'same-host',
              remotes: [{ name: 'app', entry, entryGlobalName: nodeGlobal }],
              plugins,
            },
            { remote, platform: node },
          );
        };
        const first = make(customFirst, concurrent);
        const second = make(!customFirst, false);
        let actual;
        if (concurrent) {
          const pending = first.loadRemote('app/Button');
          // The first SDK evaluation has published its global, while its
          // entry promise remains pending. Exercise the second evaluator then.
          await evaluated;
          let later;
          try {
            later = await second.loadRemote('app/Button');
          } finally {
            release();
          }
          actual = [await pending, later];
        } else {
          actual = [
            await first.loadRemote('app/Button'),
            await second.loadRemote('app/Button'),
          ];
        }
        expect(actual).toEqual(
          customFirst
            ? ['A:./Button', 'B:./Button']
            : ['B:./Button', 'A:./Button'],
        );
        expect(customCalls).toBe(1);
        expect(globalThis.cacheProofNodeDefaults).toBe(1);
      });
    }
  }

  it('deduplicates actual Node defaults across hosts and later requests', async () => {
    globalThis.cacheProofNodeDefaults = 0;
    const entry = data(
      `globalThis.cacheProofNodeDefaults += 1; module.exports={init(){},get(expose){return()=> 'default:'+expose}};`,
    );
    const make = () =>
      new FederationKernel(
        {
          name: 'same-host',
          remotes: [{ name: 'app', entry, entryGlobalName: nodeGlobal }],
        },
        { remote, platform: node },
      );
    expect(
      await Promise.all([
        make().loadRemote('app/Button'),
        make().loadRemote('app/Button'),
      ]),
    ).toEqual(['default:./Button', 'default:./Button']);
    expect(await make().loadRemote('app/Button')).toBe('default:./Button');
    expect(globalThis.cacheProofNodeDefaults).toBe(1);
  });

  it('preserves direct legacy Node platform reuse without a loading context', async () => {
    const cached: RemoteEntryExports = {
      init() {},
      get: () => async () => 'legacy',
    };
    globalThis.cacheProofNodeEntry = cached;
    const origin = new FederationKernel(
      { name: 'legacy-host' },
      { platform: node },
    );
    const loaded = await node.loadEntry({
      remoteInfo: getRemoteInfo({
        name: 'app',
        entry: nodeEntry('unexpected'),
        entryGlobalName: nodeGlobal,
      }),
      loaderHook: origin.loaderHook,
    });
    expect(loaded).toBe(cached);
    expect(loaded && (await (await loaded.get('./Button'))())).toBe('legacy');
  });

  for (const [a, b] of [
    ['A', 'B'],
    ['B', 'A'],
  ]) {
    for (const concurrent of [false, true]) {
      it(`loads actual Node createScript evaluators ${a}->${b}, concurrent=${concurrent}`, async () => {
        let firstCalls = 0;
        let secondCalls = 0;
        const first = nodeHost(a, () => {
          firstCalls += 1;
        });
        const second = nodeHost(b, () => {
          secondCalls += 1;
        });
        const actual = concurrent
          ? await Promise.all([
              first.loadRemote('app/Button'),
              second.loadRemote('app/Button'),
            ])
          : [
              await first.loadRemote('app/Button'),
              await second.loadRemote('app/Button'),
            ];
        expect(actual).toEqual([`${a}:./Button`, `${b}:./Button`]);
        expect(firstCalls).toBe(1);
        expect(secondCalls).toBe(1);
      });

      it(`uses actual Node URL transforms ${a}->${b}, concurrent=${concurrent}`, async () => {
        const origin = new FederationKernel(
          { name: 'same-host' },
          { platform: node },
        );
        const remoteInfo = getRemoteInfo({
          name: 'app',
          entry: nodeEntry('original'),
          entryGlobalName: nodeGlobal,
        });
        const firstArgs = {
          origin,
          remoteInfo,
          getEntryUrl: () => nodeEntry(a),
        };
        const secondArgs = {
          origin,
          remoteInfo,
          getEntryUrl: () => nodeEntry(b),
        };
        const entries = concurrent
          ? await Promise.all([
              getRemoteEntry(firstArgs),
              getRemoteEntry(secondArgs),
            ])
          : [await getRemoteEntry(firstArgs), await getRemoteEntry(secondArgs)];
        expect(entries[0] && (await (await entries[0].get('./Button'))())).toBe(
          `${a}:./Button`,
        );
        expect(entries[1] && (await (await entries[1].get('./Button'))())).toBe(
          `${b}:./Button`,
        );
        expect(await getRemoteEntry(firstArgs)).toBe(entries[0]);
      });

      it(`refuses browser IIFE global aliasing ${a}->${b}, concurrent=${concurrent}`, async () => {
        globalThis.cacheProofBrowserEvaluations = 0;
        let firstCalls = 0;
        let secondCalls = 0;
        const first = browserHost(a, () => {
          firstCalls += 1;
        });
        const second = browserHost(b, () => {
          secondCalls += 1;
        });
        const firstLoad = first.loadRemote('app/Button');
        if (!concurrent) {
          expect(await firstLoad).toBe(`${a}:./Button`);
        }
        const outcomes = await Promise.allSettled([
          firstLoad,
          second.loadRemote('app/Button'),
        ]);
        expect(outcomes[0]).toMatchObject({
          status: 'fulfilled',
          value: `${a}:./Button`,
        });
        expect(outcomes[1].status).toBe('rejected');
        if (outcomes[1].status !== 'rejected') {
          throw new Error('The second browser evaluator unexpectedly loaded');
        }
        expect(outcomes[1].reason.message).toContain(
          'Unsupported browser global entry isolation',
        );
        expect(firstCalls).toBe(1);
        expect(secondCalls).toBe(0);
        expect(globalThis.cacheProofBrowserEvaluations).toBe(1);
      });
    }
  }

  it('deduplicates compatible browser defaults', async () => {
    globalThis.cacheProofBrowserEvaluations = 0;
    const make = () =>
      new FederationKernel(
        {
          name: 'default-host',
          remotes: [
            { name: 'app', entry: original, entryGlobalName: browserGlobal },
          ],
        },
        { remote, platform: web },
      );
    expect(
      await Promise.all([
        make().loadRemote('app/Button'),
        make().loadRemote('app/Button'),
      ]),
    ).toEqual(['A:./Button', 'A:./Button']);
    expect(globalThis.cacheProofBrowserEvaluations).toBe(1);
  });

  it('deduplicates same-host custom browser requests', async () => {
    globalThis.cacheProofBrowserEvaluations = 0;
    let calls = 0;
    const origin = browserHost('B', () => {
      calls += 1;
    });
    expect(
      await Promise.all([
        origin.loadRemote('app/Button'),
        origin.loadRemote('app/Button'),
      ]),
    ).toEqual(['B:./Button', 'B:./Button']);
    expect(calls).toBe(1);
    expect(globalThis.cacheProofBrowserEvaluations).toBe(1);
  });

  it('allows custom browser evaluators using distinct physical globals', async () => {
    const make = (name: string) =>
      new FederationKernel(
        {
          name: 'same-host',
          remotes: [
            {
              name: 'app',
              entry: original,
              entryGlobalName: `cacheProofBrowser${name}`,
            },
          ],
          plugins: [
            {
              name: `distinct-${name}`,
              createScript() {
                const script = document.createElement('script');
                script.src = `http://localhost:1111/resources/load/browser-global-${name}.js`;
                return script;
              },
            },
          ],
        },
        { remote, platform: web },
      );
    expect(
      await Promise.all([
        make('A').loadRemote('app/Button'),
        make('B').loadRemote('app/Button'),
      ]),
    ).toEqual(['distinct-A:./Button', 'distinct-B:./Button']);
  });

  it('refuses a custom browser evaluator borrowing an unknown physical global', async () => {
    globalThis.cacheProofBrowserEntry = {
      init() {},
      get: () => async () => 'unknown:./Button',
    };
    let calls = 0;
    await expect(
      browserHost('B', () => {
        calls += 1;
      }).loadRemote('app/Button'),
    ).rejects.toThrow('Unsupported browser global entry isolation');
    expect(calls).toBe(0);
  });
});

declare global {
  // eslint-disable-next-line no-var
  var cacheProofNodeEntry: RemoteEntryExports | undefined;
  // eslint-disable-next-line no-var
  var cacheProofNodeDefaults: number | undefined;
  // eslint-disable-next-line no-var
  var cacheProofBrowserEntry: RemoteEntryExports | undefined;
  // eslint-disable-next-line no-var
  var cacheProofBrowserEvaluations: number | undefined;
}
