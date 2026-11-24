import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import {
  Link,
  Outlet,
  createBrowserRouter,
  useLocation,
  useNavigate,
} from 'react-router';
import { normalizeBridgeMemoryRoute } from '../src/memoryRoute';
import { RouterContext } from '../src/provider/context';
import { RouterProvider } from '../src/router/v7';
import { validateServiceRequest } from '../src/service/protocol';

const originalRequest = globalThis.Request;

beforeAll(() => {
  if (typeof globalThis.Request === 'undefined') {
    (globalThis as any).Request = class MockRequest {
      url: string;
      method: string;
      signal?: AbortSignal;
      constructor(
        input: string | URL,
        init?: { method?: string; signal?: AbortSignal },
      ) {
        this.url = String(input);
        this.method = init?.method || 'GET';
        this.signal = init?.signal;
      }
    };
  }
});

afterAll(() => {
  if (originalRequest === undefined) {
    delete (globalThis as any).Request;
  } else {
    globalThis.Request = originalRequest;
  }
});

describe('bridge memoryRoute contract & v7 router adapter', () => {
  it('normalizes entryPath, initialState, initialEntries, initialIndex, and basename', () => {
    expect(normalizeBridgeMemoryRoute(undefined)).toBeUndefined();

    expect(normalizeBridgeMemoryRoute({ entryPath: '/detail/42' })).toEqual({
      initialEntries: ['/detail/42'],
      initialIndex: 0,
      activePath: '/detail/42',
      basename: '/',
    });

    expect(
      normalizeBridgeMemoryRoute({
        entryPath: '/detail/42?tab=specs#top',
        initialState: { from: 'card' },
        basename: '/shop',
      }),
    ).toEqual({
      initialEntries: [
        {
          pathname: '/shop/detail/42',
          search: '?tab=specs',
          hash: '#top',
          state: { from: 'card' },
        },
      ],
      initialIndex: 0,
      activePath: '/shop/detail/42?tab=specs#top',
      basename: '/shop',
    });

    expect(
      normalizeBridgeMemoryRoute({
        initialEntries: ['/home', '/detail/1', '/detail/2'],
        initialIndex: 1,
        basename: '/shop',
      }),
    ).toEqual({
      initialEntries: ['/shop/home', '/shop/detail/1', '/shop/detail/2'],
      initialIndex: 1,
      activePath: '/shop/detail/1',
      basename: '/shop',
    });
  });

  it('validates extended memoryRoute payloads in Service App requests', () => {
    const base = {
      instanceId: 'inst-1',
      identifierPrefix: 'mf-1-',
      url: 'https://host.example/page',
      props: {},
    };

    expect(() =>
      validateServiceRequest({
        ...base,
        memoryRoute: { entryPath: '/detail/42' },
      }),
    ).not.toThrow();

    expect(() =>
      validateServiceRequest({
        ...base,
        memoryRoute: {
          initialEntries: [
            '/home',
            {
              pathname: '/detail/42',
              search: '?tab=1',
              state: { from: 'svc' },
            },
          ],
          initialIndex: 1,
          basename: '/shop',
        },
      }),
    ).not.toThrow();

    expect(() =>
      validateServiceRequest({
        ...base,
        memoryRoute: {
          entryPath: '/detail/42',
          initialState: { tab: 'specs' },
        },
      }),
    ).not.toThrow();

    // Reject invalid payloads
    expect(() => validateServiceRequest({ ...base, memoryRoute: {} })).toThrow(
      'Invalid Bridge service request parameters.',
    );

    expect(() =>
      validateServiceRequest({
        ...base,
        memoryRoute: { initialEntries: [] },
      }),
    ).toThrow('Invalid Bridge service request parameters.');

    expect(() =>
      validateServiceRequest({
        ...base,
        memoryRoute: { initialEntries: ['/home'], initialIndex: 2 },
      }),
    ).toThrow('Invalid Bridge service request parameters.');

    expect(() =>
      validateServiceRequest({
        ...base,
        memoryRoute: { initialEntries: ['relative/path'] },
      }),
    ).toThrow('Invalid Bridge service request parameters.');

    expect(() =>
      validateServiceRequest({
        ...base,
        memoryRoute: { entryPath: '/ok', basename: 'no-leading-slash' },
      }),
    ).toThrow('Invalid Bridge service request parameters.');
  });

  it('memoizes the v7 memory router across parent rerenders and preserves navigation history & state', async () => {
    function Detail() {
      const location = useLocation();
      const navigate = useNavigate();
      return (
        <div>
          <p data-testid="v7-loc">
            {location.pathname}
            {location.search}:{(location.state as any)?.from || 'none'}
          </p>
          <button type="button" onClick={() => navigate(-1)}>
            Back
          </button>
          <Link to="/next">Next</Link>
        </div>
      );
    }

    const routes = [
      {
        path: '/',
        element: <Outlet />,
        children: [
          { index: true, element: <p data-testid="v7-loc">home</p> },
          { path: 'detail', element: <Detail /> },
          { path: 'next', element: <p data-testid="v7-loc">next-page</p> },
        ],
      },
    ];
    const sourceRouter = createBrowserRouter(routes);
    const memoryRoute = {
      initialEntries: [
        '/',
        { pathname: '/detail', search: '?a=1', state: { from: 'bridge' } },
      ] as [
        string,
        { pathname: string; search: string; state: { from: string } },
      ],
      initialIndex: 1,
      basename: '/card',
    };

    const view = render(
      <RouterContext.Provider value={{ memoryRoute }}>
        <RouterProvider router={sourceRouter} />
      </RouterContext.Provider>,
    );

    await waitFor(() =>
      expect(view.getByTestId('v7-loc').textContent).toBe('/detail?a=1:bridge'),
    );

    fireEvent.click(view.getByText('Next'));
    await waitFor(() =>
      expect(view.getByTestId('v7-loc').textContent).toBe('next-page'),
    );

    // Rerendering parent with structurally equal memoryRoute must NOT wipe navigation state
    view.rerender(
      <RouterContext.Provider value={{ memoryRoute: { ...memoryRoute } }}>
        <RouterProvider router={sourceRouter} />
      </RouterContext.Provider>,
    );
    expect(view.getByTestId('v7-loc').textContent).toBe('next-page');

    view.unmount();
    sourceRouter.dispose();
  });
});
