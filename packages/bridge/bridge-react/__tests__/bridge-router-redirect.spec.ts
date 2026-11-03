import 'whatwg-fetch';
import { waitFor } from '@testing-library/react';
import { createBrowserRouter, createHashRouter, redirect } from 'react-router';
import {
  createBrowserRouter as createBrowserRouter6,
  createHashRouter as createHashRouter6,
} from 'react-router-dom';
import {
  createBridgeRouterConnector,
  type BridgeRouterConnector,
} from '../../bridge-shared/src/router';

const variants = [
  { name: 'React Router 6 Browser', create: createBrowserRouter6, hash: false },
  { name: 'React Router 6 Hash', create: createHashRouter6, hash: true },
  { name: 'React Router 7 Browser', create: createBrowserRouter, hash: false },
  { name: 'React Router 7 Hash', create: createHashRouter, hash: true },
];

function fixture(variant: (typeof variants)[number]) {
  const href = (url: string) => (variant.hash ? `/#${url}` : url);
  const location = () =>
    variant.hash
      ? window.location.hash.slice(1)
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.history.replaceState({ idx: 0 }, '', href('/start'));
  const pending: { signal: AbortSignal; resolve: () => void }[] = [];
  const start = jest.fn(() => {
    const response = redirect('/detail?from=redirect#summary');
    // whatwg-fetch does not implement the body stream property. React Router
    // checks for it when identifying a Response, including bodyless redirects.
    Object.defineProperty(response, 'body', { value: null });
    return response;
  });
  const detail = jest.fn(({ request }: { request: Request }) => {
    if (!new URL(request.url).searchParams.has('from')) return null;
    return new Promise<null>((resolve) => {
      pending.push({ signal: request.signal, resolve: () => resolve(null) });
    });
  });
  const router = variant.create(
    [
      { id: 'start', path: '/start', loader: start },
      { id: 'detail', path: '/detail', loader: detail },
      { id: 'outside', path: '/outside', loader: () => null },
    ],
    { window, hydrationData: { loaderData: { start: null } } },
  );
  const hostListeners = new Set<() => void>();
  const onError = jest.fn();
  const notifyPeers = jest.fn();
  let connector!: BridgeRouterConnector;
  // Keep a regression bounded even if it restarts a redirect in a microtask loop.
  const syncFromHistory = jest.fn(() => {
    if (syncFromHistory.mock.calls.length === 5) {
      connector.dispose();
      return;
    }
    window.dispatchEvent(
      new PopStateEvent('popstate', { state: window.history.state }),
    );
  });
  connector = createBridgeRouterConnector({
    navigation: {
      getLocation: location,
      subscribe(listener) {
        hostListeners.add(listener);
        window.addEventListener('popstate', listener);
        return () => {
          hostListeners.delete(listener);
          window.removeEventListener('popstate', listener);
        };
      },
    },
    onError,
  });
  const routerLocation = (value: typeof router.state.location) => ({
    url: `${value.pathname}${value.search}${value.hash}`,
    key: value.key,
  });
  connector.attach({
    getSnapshot: () => ({
      location: routerLocation(router.state.location),
      pendingLocation: router.state.navigation.location
        ? routerLocation(router.state.navigation.location)
        : undefined,
      action: router.state.historyAction,
      initialized: router.state.initialized,
    }),
    getHistoryLocation: () => ({
      url: location(),
      key: window.history.state?.key ?? 'default',
    }),
    subscribe: (listener) => router.subscribe(listener),
    syncFromHistory,
    notifyPeers,
  });
  return {
    router,
    start,
    detail,
    pending,
    onError,
    notifyPeers,
    syncFromHistory,
    location,
    async backToRedirect() {
      await router.navigate('/detail');
      await waitFor(() => expect(notifyPeers).toHaveBeenCalledTimes(1));
      notifyPeers.mockClear();
      window.history.back();
      await waitFor(() => expect(pending.length).toBeGreaterThan(0));
    },
    hostMove(url: string) {
      // A Host Router writes a new history key and publishes its state. This
      // does not dispatch a native POP, so the connector must consume it once.
      window.history.replaceState(
        { ...window.history.state, key: 'host-new' },
        '',
        href(url),
      );
      for (const listener of hostListeners) listener();
    },
    dispose() {
      connector.dispose();
      router.dispose();
      pending.forEach(({ resolve }) => resolve());
    },
  };
}

describe.each(variants)(
  '$name loader redirects after a native POP',
  (variant) => {
    it('loads the redirected destination once and lets it commit', async () => {
      const live = fixture(variant);
      try {
        await live.backToRedirect();
        expect(live.start).toHaveBeenCalledTimes(1);
        expect(live.pending).toHaveLength(1);
        expect(live.syncFromHistory).not.toHaveBeenCalled();
        expect(live.pending[0].signal.aborted).toBe(false);
        expect(live.location()).toBe('/start');
        expect(live.router.state.navigation.location?.pathname).toBe('/detail');
        live.pending[0].resolve();
        await waitFor(() =>
          expect(live.router.state.navigation.state).toBe('idle'),
        );
        expect(live.location()).toBe('/detail?from=redirect#summary');
        expect(live.notifyPeers).toHaveBeenCalledTimes(1);
        expect(live.onError).not.toHaveBeenCalled();
      } finally {
        live.dispose();
      }
    });

    it.each(['/start', '/outside'])(
      'cancels the redirect when the Host writes a new entry at %s',
      async (target) => {
        const live = fixture(variant);
        try {
          await live.backToRedirect();
          expect(live.start).toHaveBeenCalledTimes(1);
          const previous = live.pending[0];
          live.hostMove(target);
          await waitFor(() => expect(previous.signal.aborted).toBe(true));
          expect(live.syncFromHistory).toHaveBeenCalledTimes(1);
          if (target === '/start') {
            await waitFor(() => expect(live.pending).toHaveLength(2));
            expect(live.start).toHaveBeenCalledTimes(2);
            expect(live.pending[1].signal.aborted).toBe(false);
            live.pending[1].resolve();
          }
          await waitFor(() =>
            expect(live.router.state.navigation.state).toBe('idle'),
          );
          expect(live.location()).toBe(
            target === '/start' ? '/detail?from=redirect#summary' : '/outside',
          );
          expect(live.onError).not.toHaveBeenCalled();
        } finally {
          live.dispose();
        }
      },
    );
  },
);
