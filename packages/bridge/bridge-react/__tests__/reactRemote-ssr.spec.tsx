/** @jest-environment node */
import React from 'react';
import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server.node';
import { createReactRemote } from '../src/reactRemote';
import { remoteRuntime } from './reactRemote-utils';

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
