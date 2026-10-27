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
