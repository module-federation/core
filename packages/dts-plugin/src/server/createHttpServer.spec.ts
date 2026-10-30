import fs from 'fs';
import os from 'os';
import path from 'path';
import type { AddressInfo } from 'net';
import { afterEach, describe, expect, it } from '@rstest/core';
import { createHttpServer } from './createHttpServer';
import { DEFAULT_TAR_NAME } from './constant';

describe('createHttpServer', () => {
  const servers: Array<Awaited<ReturnType<typeof createHttpServer>>> = [];
  let dir: string | undefined;

  afterEach(async () => {
    try {
      await Promise.all(
        servers
          .splice(0)
          .map(({ server }) => new Promise((resolve) => server.close(resolve))),
      );
    } finally {
      if (dir) {
        fs.rmSync(dir, { recursive: true, force: true });
        dir = undefined;
      }
    }
  });

  it('binds concurrent servers to distinct ports it is already listening on', async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-dts-http-'));
    const typeTarPath = path.join(dir, DEFAULT_TAR_NAME);
    fs.writeFileSync(typeTarPath, 'types');

    const results = await Promise.allSettled(
      Array.from({ length: 8 }, async () => {
        servers.push(await createHttpServer({ typeTarPath }));
      }),
    );
    results.forEach((result) => {
      if (result.status === 'rejected') {
        throw result.reason;
      }
    });

    const ports = servers.map(
      ({ server }) => (server.address() as AddressInfo).port,
    );
    expect(servers.every(({ server }) => server.listening)).toBe(true);
    expect(new Set(ports).size).toBe(ports.length);
    servers.forEach(({ serverAddress }, index) => {
      expect(serverAddress.endsWith(`:${ports[index]}`)).toBe(true);
    });

    const { port } = servers[0].server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}/${DEFAULT_TAR_NAME}`);
    expect(await res.text()).toBe('types');
  });
});
