/** @jest-environment node */
import React from 'react';
import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server.node';
import { createReactRemote } from '../src/reactRemote';
import { remoteRuntime } from './reactRemote-utils';
import { snapshotRuntime } from './reactRemote-runtime-utils';
import { helpers } from '@module-federation/enhanced/runtime';

function html(element: React.ReactElement): Promise<string> {
  return new Promise((resolve, reject) => {
    let result = '';
    const output = new Writable({
      write(chunk, _encoding, callback) {
        result += chunk;
        callback();
      },
    });
    output.on('finish', () => resolve(result));
    const stream = renderToPipeableStream(element, {
      onAllReady() {
        stream.pipe(output);
      },
      onError: reject,
    });
  });
}

describe('React remote SSR protocol selection', () => {
  it('renders ordinary component content into the raw response', async () => {
    const { instance } = remoteRuntime(
      { default: () => <strong>server content</strong> },
      'component',
    );
    const Remote = createReactRemote({ remote: 'shop/Card', instance });
    expect(await html(<Remote />)).toContain('<strong>server content</strong>');
  });
  it('renders the configured fallback for server-side loader failures', async () => {
    const { instance, loadRemote } = remoteRuntime({ default: () => null });
    loadRemote.mockRejectedValue(new Error('weather API unavailable'));
    const Remote = createReactRemote({
      remote: 'shop/Card',
      instance,
      fallback: ({ error }) => <p role="alert">{error.message}</p>,
    });
    expect(await html(<Remote />)).toContain('weather API unavailable');
  });
  it('renders the configured server fallback when protocol metadata cannot be loaded', async () => {
    const { instance, loadRemote, snapshotHandler } = remoteRuntime({
      default: () => null,
    });
    snapshotHandler.loadRemoteSnapshotInfo.mockRejectedValue(
      new Error('manifest unavailable'),
    );
    const Remote = createReactRemote({
      remote: 'shop/Card',
      instance,
      fallback: ({ error }) => <p>{error.message}</p>,
    });
    expect(await html(<Remote />)).toContain('manifest unavailable');
    expect(loadRemote).not.toHaveBeenCalled();
  });
  it('outputs a Bridge placeholder without executing its Node expose or provider', async () => {
    const factory = jest.fn();
    const { instance, loadRemote, snapshotHandler } = remoteRuntime(
      { default: factory },
      'bridge',
    );
    const Remote = createReactRemote({
      remote: 'shop/Card',
      instance,
      loading: <span>client application</span>,
    });
    expect(await html(<Remote />)).toContain('client application');
    expect(snapshotHandler.loadRemoteSnapshotInfo).toHaveBeenCalled();
    expect(loadRemote).not.toHaveBeenCalled();
    expect(factory).not.toHaveBeenCalled();
  });
  it('does not load a noSSR component on the server', async () => {
    const { instance, loadRemote } = remoteRuntime({ default: () => null });
    const Remote = createReactRemote({
      remote: 'shop/Card',
      instance,
      noSSR: true,
      loading: <span>client only</span>,
    });
    expect(await html(<Remote />)).toContain('client only');
    expect(loadRemote).not.toHaveBeenCalled();
  });
});

describe('React remote SSR with platform snapshots', () => {
  beforeEach(() => helpers.global.resetFederationGlobalInfo());

  it.each([false, true])(
    'selects Bridge before loading its Node expose (pure entry: %s)',
    async (pureEntry) => {
      const provider = jest.fn();
      const runtime = snapshotRuntime({
        module: { default: provider },
        render: 'bridge',
        pureEntry,
      });
      if (pureEntry) {
        runtime.instance.registerPlugins([
          {
            name: 'platform-entry-snapshot',
            afterResolve: (args) => ({
              ...args,
              remoteSnapshot: runtime.snapshot,
            }),
          },
        ]);
      }
      const Remote = createReactRemote({
        remote: 'alias/Card',
        instance: runtime.instance,
        loading: <span>platform placeholder</span>,
      });
      expect(await html(<Remote />)).toContain('platform placeholder');
      expect(runtime.beforeRequest).toHaveBeenCalledTimes(1);
      expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
      expect(runtime.loadEntry).not.toHaveBeenCalled();
      expect(runtime.get).not.toHaveBeenCalled();
      expect(runtime.factory).not.toHaveBeenCalled();
      expect(provider).not.toHaveBeenCalled();
    },
  );

  it('continues the same resolved request through component SSR', async () => {
    const runtime = snapshotRuntime({
      module: { default: () => <strong>platform server content</strong> },
      render: 'component',
      globalSnapshot: true,
    });
    const Remote = createReactRemote({
      remote: 'alias/Card',
      instance: runtime.instance,
    });
    expect(await html(<Remote />)).toContain(
      '<strong>platform server content</strong>',
    );
    expect(runtime.beforeRequest).toHaveBeenCalledTimes(1);
    expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
    expect(runtime.factory).toHaveBeenCalledTimes(1);
    expect(runtime.onLoad).toHaveBeenCalledTimes(1);
    expect(runtime.afterLoadRemote).toHaveBeenCalledTimes(1);
  });
});

it('preserves component SSR metadata lookup after a deployment request rewrite', async () => {
  const runtime = snapshotRuntime({
    module: { default: () => <strong>rewritten server content</strong> },
    render: 'component',
    globalSnapshot: true,
  });
  runtime.beforeRequest.mockImplementation((args) => ({
    ...args,
    id: `${runtime.name}/Card`,
  }));
  const Remote = createReactRemote({
    remote: 'deployment/Card',
    instance: runtime.instance,
    fallback: ({ error }) => <p>{error.message}</p>,
  });
  expect(await html(<Remote />)).toContain(
    '<strong>rewritten server content</strong>',
  );
  expect(
    runtime.instance.remoteHandler.idToRemoteMap[`${runtime.name}/Card`],
  ).toEqual({
    name: runtime.name,
    expose: './Card',
  });
  expect(runtime.beforeRequest).toHaveBeenCalledTimes(1);
});

describe('remote callback SSR', () => {
  beforeEach(() => helpers.global.resetFederationGlobalInfo());

  it.each([
    'loadRemote',
    'namespace',
    'default',
    'async default',
    'memo',
    'forwardRef',
  ])(
    'renders %s ordinary components after resolving one callback',
    async (kind) => {
      const Body = ({ label }: { label: string }) => <strong>{label}</strong>;
      const Component =
        kind === 'memo'
          ? React.memo(Body)
          : kind === 'forwardRef'
            ? React.forwardRef<HTMLDivElement, { label: string }>(
                (props, _ref) => <Body {...props} />,
              )
            : Body;
      const raw = Object.freeze({ default: Component });
      const runtime = snapshotRuntime({ module: raw, render: 'component' });
      const preloaded =
        kind === 'loadRemote'
          ? undefined
          : await runtime.instance.loadRemote<typeof raw>('alias/Card');
      const loader = jest.fn(() => {
        if (kind === 'loadRemote')
          return runtime.instance.loadRemote('alias/Card');
        if (kind === 'namespace') return preloaded;
        if (kind === 'async default')
          return Promise.resolve(preloaded!.default);
        return preloaded!.default;
      });
      const Remote = createReactRemote<{ label: string }>({
        remote: loader,
        instance: runtime.instance,
      });
      expect(await html(<Remote label="callback SSR body" />)).toContain(
        '<strong>callback SSR body</strong>',
      );
      expect(loader).toHaveBeenCalledTimes(1);
      expect(runtime.beforeRequest).toHaveBeenCalledTimes(1);
      expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
      expect(runtime.factory).toHaveBeenCalledTimes(1);
    },
  );

  it.each([false, true])(
    'keeps Bridge callbacks as server placeholders (default: %s)',
    async (individual) => {
      const provider = jest.fn();
      const runtime = snapshotRuntime({
        module: { default: provider },
        render: 'bridge',
      });
      const loader = jest.fn(async () => {
        const value = await runtime.instance.loadRemote<{
          default: typeof provider;
        }>('alias/Card');
        return individual ? value!.default : value;
      });
      const Remote = createReactRemote({
        remote: loader,
        instance: runtime.instance,
        loading: <span>callback Bridge placeholder</span>,
      });
      expect(await html(<Remote />)).toContain('callback Bridge placeholder');
      expect(provider).not.toHaveBeenCalled();
      expect(loader).toHaveBeenCalledTimes(1);
      expect(runtime.factory).toHaveBeenCalledTimes(1);
      expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
    },
  );

  it('does not invoke noSSR callbacks or resolve their metadata on the server', async () => {
    const runtime = snapshotRuntime({ module: { default: () => null } });
    const loader = jest.fn(() => {
      throw new Error('must not execute on the server');
    });
    const Remote = createReactRemote({
      remote: loader,
      instance: runtime.instance,
      noSSR: true,
      loading: <p>noSSR callback</p>,
    });
    expect(await html(<Remote />)).toContain('noSSR callback');
    expect(loader).not.toHaveBeenCalled();
    expect(runtime.afterResolve).not.toHaveBeenCalled();
  });
});

it('uses the final preloaded snapshot for SSR data and assets without replaying the component request', async () => {
  helpers.global.resetFederationGlobalInfo();
  globalThis.__MF_DATA_FETCH_MAP__ = undefined;
  const dataFetch = jest.fn(async () => ({ weather: 'sunny on server' }));
  const raw = {
    default: ({ mfData }: { mfData?: { weather: string } }) => (
      <strong>{mfData?.weather}</strong>
    ),
  };
  const runtime = snapshotRuntime({
    module: raw,
    dataFetch,
    globalSnapshot: true,
  });
  runtime.afterResolve.mockImplementation((args) => ({
    ...args,
    remoteSnapshot: {
      ...runtime.snapshot,
      publicPath: 'https://selected.test/',
      modules: runtime.snapshot.modules.map((item) =>
        item.modulePath === './Card'
          ? {
              ...item,
              assets: {
                ...item.assets,
                css: { sync: ['selected.css'], async: [] },
              },
            }
          : item,
      ),
    },
  }));
  const preloaded = await runtime.instance.loadRemote<typeof raw>('alias/Card');
  expect(globalThis.__MF_DATA_FETCH_MAP__).toBeUndefined();
  const loader = jest.fn(() => preloaded!.default);
  const Remote = createReactRemote({
    remote: loader,
    instance: runtime.instance,
  });
  const previousSSR = globalThis.FEDERATION_SSR;
  globalThis.FEDERATION_SSR = true;
  let response: string;
  try {
    response = await html(<Remote />);
  } finally {
    globalThis.FEDERATION_SSR = previousSSR;
  }
  expect(response).toContain('<strong>sunny on server</strong>');
  expect(response).toContain('https://selected.test/selected.css');
  expect(dataFetch).toHaveBeenCalledTimes(1);
  expect(loader).toHaveBeenCalledTimes(1);
  expect(runtime.factory).toHaveBeenCalledTimes(1);
  expect(
    runtime.afterResolve.mock.calls.filter(
      ([args]) => args.expose === './Card',
    ),
  ).toHaveLength(1);
});

it('keeps cached data local to each unified consumer SSR request', async () => {
  helpers.global.resetFederationGlobalInfo();
  globalThis.__MF_DATA_FETCH_MAP__ = undefined;
  let request = 'first request';
  const dataFetch = jest.fn(async () => ({ request }));
  const raw = {
    default: ({ mfData }: { mfData?: { request: string } }) => (
      <strong>{mfData?.request}</strong>
    ),
  };
  const runtime = snapshotRuntime({ module: raw, dataFetch });
  const preloaded = await runtime.instance.loadRemote<typeof raw>('alias/Card');
  const Remote = createReactRemote({
    remote: () => preloaded!.default,
    instance: runtime.instance,
  });
  expect(await html(<Remote />)).toContain('<strong>first request</strong>');
  request = 'second request';
  expect(await html(<Remote />)).toContain('<strong>second request</strong>');
  expect(dataFetch).toHaveBeenCalledTimes(2);
});

it('streams a placeholder before an unresolved callback and then component content', async () => {
  const runtime = snapshotRuntime({
    module: { default: () => <strong>streamed callback body</strong> },
  });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const loader = jest.fn(async () => {
    await gate;
    return runtime.instance.loadRemote('alias/Card');
  });
  const Remote = createReactRemote({
    remote: loader,
    instance: runtime.instance,
    loading: <p>waiting for callback</p>,
  });
  let result = '';
  await new Promise<void>((resolve, reject) => {
    let released = false;
    const output = new Writable({
      write(chunk, _encoding, callback) {
        result += chunk;
        if (!released && result.includes('waiting for callback')) {
          released = true;
          expect(result).not.toContain('streamed callback body');
          release();
        }
        callback();
      },
    });
    output.on('finish', resolve);
    const stream = renderToPipeableStream(<Remote />, {
      onShellReady() {
        stream.pipe(output);
      },
      onError: reject,
    });
  });
  expect(result).toContain('waiting for callback');
  expect(result).toContain('<strong>streamed callback body</strong>');
  expect(loader).toHaveBeenCalledTimes(1);
});

it('renders callback recovery content without inheriting failed Bridge metadata on the server', async () => {
  const fallback = { default: () => <strong>recovered component body</strong> };
  const runtime = snapshotRuntime({ module: {}, render: 'bridge' });
  runtime.factory.mockImplementation(() => {
    throw new Error('bridge expose unavailable');
  });
  runtime.instance.registerPlugins([
    {
      name: 'recover-bridge-load',
      errorLoadRemote: ({ lifecycle }) =>
        lifecycle === 'onLoad' ? fallback : undefined,
    },
  ]);
  const Remote = createReactRemote({
    remote: () => runtime.instance.loadRemote('alias/Card'),
    instance: runtime.instance,
  });
  expect(await html(<Remote />)).toContain(
    '<strong>recovered component body</strong>',
  );
  expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
});

it('renders a synthetic static-import namespace from a decorated factory during SSR', async () => {
  const original = { default: () => <strong>original</strong> };
  const decorated = { default: () => <strong>decorated static SSR</strong> };
  const runtime = snapshotRuntime({ module: original });
  runtime.instance.registerPlugins([
    {
      name: 'decorate-static-ssr',
      onLoad: ({ exposeModuleFactory }) =>
        exposeModuleFactory
          ? () => {
              exposeModuleFactory();
              return decorated;
            }
          : undefined,
    },
  ]);
  const factory = await runtime.instance.loadRemote<() => typeof decorated>(
    'alias/Card',
    { loadFactory: false },
  );
  const preloaded = factory!();
  const interop = Object.freeze({
    get default() {
      return preloaded.default;
    },
  });
  const Remote = createReactRemote({
    remote: () => interop,
    instance: runtime.instance,
  });
  expect(await html(<Remote />)).toContain(
    '<strong>decorated static SSR</strong>',
  );
  expect(runtime.afterResolve).toHaveBeenCalledTimes(1);
  expect(runtime.factory).toHaveBeenCalledTimes(1);
});
