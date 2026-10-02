import { describe, expect, it, rs } from '@rstest/core';
import { createRemoteRevalidateMiddleware } from './ssrDevReload';

rs.mock('@module-federation/node/utils', () => ({
  usedChunks: new Set<string>(),
  flushChunks: rs.fn(async () => []),
}));

rs.mock('@module-federation/bridge-react/data-fetch', () => ({
  flushDataFetch: rs.fn(),
}));

const pageRequest = { method: 'GET', headers: { accept: 'text/html' } } as any;
const assetRequest = { method: 'GET', headers: { accept: '*/*' } } as any;

const run = (
  middleware: ReturnType<typeof createRemoteRevalidateMiddleware>,
  req: any,
) => new Promise<void>((resolve) => middleware(req, {} as any, resolve));

describe('createRemoteRevalidateMiddleware', () => {
  it('clears stale chunk tracking without collecting assets from reset remotes', async () => {
    const { usedChunks, flushChunks } =
      await import('@module-federation/node/utils');
    const { flushDataFetch } =
      await import('@module-federation/bridge-react/data-fetch');
    usedChunks.add('shop/Button');
    const middleware = createRemoteRevalidateMiddleware(
      rs.fn(),
      async () => true,
    );

    await run(middleware, pageRequest);

    expect(usedChunks.size).toBe(0);
    expect(flushChunks).not.toHaveBeenCalled();
    expect(flushDataFetch).toHaveBeenCalledTimes(1);
  });

  it('does not check remotes for non-page requests', async () => {
    const revalidate = rs.fn(async () => true);
    const middleware = createRemoteRevalidateMiddleware(rs.fn(), revalidate);

    await run(middleware, assetRequest);

    expect(revalidate).not.toHaveBeenCalled();
  });

  it('leaves pages alone when no remote changed', async () => {
    const sockWrite = rs.fn();
    const flush = rs.fn(async () => {});
    const middleware = createRemoteRevalidateMiddleware(
      sockWrite,
      async () => false,
      flush,
    );

    await run(middleware, pageRequest);

    expect(flush).not.toHaveBeenCalled();
    expect(sockWrite).not.toHaveBeenCalled();
  });

  it('flushes remote state and reloads pages through the socket before rendering', async () => {
    const order: string[] = [];
    const middleware = createRemoteRevalidateMiddleware(
      (type) => order.push(`sockWrite:${type}`),
      async () => true,
      async () => {
        order.push('flush');
      },
    );

    await run(middleware, pageRequest);
    order.push('render');

    expect(order).toEqual(['flush', 'sockWrite:full-reload', 'render']);
  });

  it('shares one check between concurrent page requests', async () => {
    let finish!: (changed: boolean) => void;
    const revalidate = rs.fn(
      () => new Promise<boolean>((resolve) => (finish = resolve)),
    );
    const sockWrite = rs.fn();
    const middleware = createRemoteRevalidateMiddleware(
      sockWrite,
      revalidate,
      async () => {},
    );

    const first = run(middleware, pageRequest);
    const second = run(middleware, pageRequest);
    finish(true);
    await Promise.all([first, second]);

    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(sockWrite).toHaveBeenCalledTimes(1);
  });

  it('still renders when the check fails', async () => {
    const middleware = createRemoteRevalidateMiddleware(rs.fn(), async () => {
      throw new Error('remote offline');
    });

    await expect(run(middleware, pageRequest)).resolves.toBeUndefined();
  });
});
