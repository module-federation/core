import {
  loadReactRouter,
  readReactRouter,
  resetReactRouterRuntime,
} from '../src/remote/router-component/router-runtime';

describe('router runtime', () => {
  afterEach(() => {
    resetReactRouterRuntime();
  });

  it('uses react-router-dom from CommonJS require when it is available', () => {
    const router = { useLocation: jest.fn() };
    const requireFn = jest.fn((id: 'react-router-dom' | 'react-router') => {
      if (id === 'react-router-dom') {
        return router;
      }
      throw new Error('react-router should not be required');
    });

    expect(readReactRouter({ requireFn })).toBe(router);
    expect(requireFn).toHaveBeenCalledTimes(1);
    expect(requireFn).toHaveBeenCalledWith('react-router-dom');
  });

  it('falls back to react-router from CommonJS require', () => {
    const router = { useLocation: jest.fn() };
    const requireFn = jest.fn((id: 'react-router-dom' | 'react-router') => {
      if (id === 'react-router') {
        return router;
      }
      throw new Error('react-router-dom is unavailable');
    });

    expect(readReactRouter({ requireFn })).toBe(router);
    expect(requireFn).toHaveBeenCalledWith('react-router-dom');
    expect(requireFn).toHaveBeenCalledWith('react-router');
  });

  it('returns null in browser ESM without probing bare router imports', async () => {
    const importRouterPackage = jest.fn();

    expect(
      readReactRouter({
        requireFn: undefined,
        importRouterPackage,
        isServer: false,
      }),
    ).toBeNull();
    await expect(
      loadReactRouter({
        requireFn: undefined,
        importRouterPackage,
        isServer: false,
      }),
    ).resolves.toBeNull();
    expect(importRouterPackage).not.toHaveBeenCalled();
  });

  it('suspends while resolving routers in native ESM SSR', async () => {
    const router = { useLocation: jest.fn() };
    const importRouterPackage = jest.fn(
      (id: 'react-router-dom' | 'react-router') => {
        if (id === 'react-router') {
          return Promise.resolve({ default: router });
        }
        return Promise.reject(new Error('react-router-dom is unavailable'));
      },
    );

    let thrownPromise: Promise<unknown> | undefined;

    try {
      readReactRouter({
        requireFn: undefined,
        importRouterPackage,
        isServer: true,
      });
    } catch (error) {
      thrownPromise = error as Promise<unknown>;
    }

    expect(thrownPromise).toBeInstanceOf(Promise);
    await thrownPromise;
    expect(readReactRouter({ requireFn: undefined })).toBe(router);
    expect(importRouterPackage).toHaveBeenCalledWith('react-router-dom');
    expect(importRouterPackage).toHaveBeenCalledWith('react-router');
  });

  it('returns null after server-side router imports fail', async () => {
    let thrownPromise: Promise<unknown> | undefined;

    try {
      readReactRouter({
        requireFn: undefined,
        importRouterPackage: () =>
          Promise.reject(new Error('router is unavailable')),
        isServer: true,
      });
    } catch (error) {
      thrownPromise = error as Promise<unknown>;
    }

    expect(thrownPromise).toBeInstanceOf(Promise);
    await thrownPromise;
    expect(readReactRouter({ requireFn: undefined })).toBeNull();
  });
});
