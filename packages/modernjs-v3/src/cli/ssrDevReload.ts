import type { IncomingMessage, ServerResponse } from 'http';
import type { RsbuildDevServer, RsbuildPlugin } from '@rsbuild/core';
import logger from '../logger';

type Revalidate = () => Promise<boolean>;
type FlushRemoteState = () => Promise<void>;

const isPageRequest = (req: IncomingMessage) =>
  req.method === 'GET' && Boolean(req.headers.accept?.includes('text/html'));

const revalidateRemotes: Revalidate = async () => {
  const { revalidate } = await import('@module-federation/node/utils');
  return revalidate();
};

const flushRemoteState: FlushRemoteState = async () => {
  const [{ usedChunks }, { flushDataFetch }] = await Promise.all([
    import('@module-federation/node/utils'),
    import('@module-federation/bridge-react/data-fetch'),
  ]);
  usedChunks.clear();
  flushDataFetch();
};

/**
 * Before each SSR page request, check whether a remote changed. When one did,
 * drop the server-side federation caches and tell every open page to reload
 * through the dev-server socket.
 */
export const createRemoteRevalidateMiddleware = (
  sockWrite: RsbuildDevServer['sockWrite'],
  revalidate: Revalidate = revalidateRemotes,
  flush: FlushRemoteState = flushRemoteState,
) => {
  let pending: Promise<void> | undefined;
  const check = async () => {
    if (!(await revalidate())) {
      return;
    }
    await flush();
    sockWrite('full-reload');
  };

  return (req: IncomingMessage, _res: ServerResponse, next: () => void) => {
    if (!isPageRequest(req)) {
      next();
      return;
    }
    pending ||= check().finally(() => {
      pending = undefined;
    });
    pending.then(
      () => next(),
      (err: unknown) => {
        logger.error(
          'Failed to check remotes for changes; the page may render a stale remote. Restart the dev server if it persists.',
          err,
        );
        next();
      },
    );
  };
};

export const mfSSRDevReloadPlugin = (): RsbuildPlugin => ({
  name: '@module-federation/modern-js-v3/ssr-dev-reload',
  setup(api) {
    api.onBeforeStartDevServer(({ server }) => {
      server.middlewares.use(
        createRemoteRevalidateMiddleware(server.sockWrite),
      );
    });
  },
});
