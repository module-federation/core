import { describe, expect, it, rs } from '@rstest/core';
import { rest } from 'msw';
import fs from 'fs';
import path from 'path';
import { ModuleFederation } from '../src';
import { server } from './mock/server';

const base = 'http://localhost:1111/resources';
const remoteA = `${base}/snapshot/remote1/federation-manifest.json`;
const remoteB = `${base}/snapshot/remote2/federation-manifest.json`;
const manifest = (remote: string) =>
  JSON.parse(
    fs.readFileSync(
      path.resolve(
        __dirname,
        `resources/snapshot/${remote}/federation-manifest.json`,
      ),
      'utf-8',
    ),
  );

const createHost = (
  remotes: { name: string; entry: string }[],
  errorLoadRemote = rs.fn(),
) =>
  new ModuleFederation({
    name: 'share-failure-host',
    shareStrategy: 'version-first',
    remotes,
    shared: {
      lodash: {
        version: '4.17.21',
        scope: ['default'],
        get: () => Promise.resolve(() => ({ version: '4.17.21' })),
      },
    },
    plugins: [{ name: 'observe-share-remote-errors', errorLoadRemote }],
  });

describe('version-first sharing with unavailable remotes', () => {
  it('uses the host share when a manifest fails and retries that remote later', async () => {
    let remoteBAvailable = false;
    const errors = rs.fn();
    const remoteBManifest = manifest('remote2');
    server.use(
      rest.get(remoteA, (_req, res, ctx) =>
        res(
          ctx.json({
            ...manifest('remote1'),
            shared: [
              {
                id: 'lodash',
                name: 'lodash',
                version: '4.17.20',
                singleton: false,
                requiredVersion: '*',
                hash: '',
                assets: {
                  js: { async: [], sync: [] },
                  css: { async: [], sync: [] },
                },
              },
            ],
          }),
        ),
      ),
      rest.get(remoteB, (_req, res, ctx) =>
        remoteBAvailable
          ? res(ctx.json(remoteBManifest))
          : res(ctx.status(503), ctx.text('unavailable')),
      ),
    );
    const host = createHost(
      [
        { name: '@snapshot/remote1', entry: remoteA },
        { name: '@snapshot/remote2', entry: remoteB },
      ],
      errors,
    );

    const lodash = await host.loadShare<{ version: string }>('lodash');
    expect(lodash && lodash()).toEqual({ version: '4.17.21' });
    expect(errors).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '@snapshot/remote2',
        lifecycle: 'beforeLoadShare',
        remote: undefined,
        error: expect.any(Error),
      }),
    );
    expect(
      errors.mock.calls.filter(
        ([args]) => args.lifecycle === 'beforeLoadShare',
      ),
    ).toHaveLength(1);
    expect(host.snapshotHandler.manifestCache.has(remoteB)).toBe(false);

    remoteBAvailable = true;
    const remoteModule = await host.loadRemote<() => string>(
      '@snapshot/remote2/say',
    );
    expect(remoteModule?.()).toBe('hello world "@snapshot/remote2"');
  });

  it('uses the host share when a remote container init throws', async () => {
    const errors = rs.fn();
    const host = createHost(
      [{ name: 'remote', entry: `${base}/load/init-error.js` }],
      errors,
    );

    const lodash = await host.loadShare<{ version: string }>('lodash');
    expect(lodash && lodash()).toEqual({ version: '4.17.21' });
    expect(errors).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'remote',
        lifecycle: 'beforeLoadShare',
        remote: expect.objectContaining({ name: 'remote' }),
      }),
    );
  });
});
