import { render } from '@testing-library/react';
import React from 'react';

describe('react router v8 package layout', () => {
  afterEach(() => {
    jest.dontMock('react');
    jest.dontMock('react-router');
    jest.dontMock('react-router/dom');
    jest.resetModules();
  });

  it('reads browser router APIs from the root react-router export', () => {
    const BrowserRouter = jest.fn(({ children }) => <div>{children}</div>);
    const RouterProvider = jest.fn(() => <div>router provider</div>);
    const createBrowserRouter = jest.fn(() => ({ source: 'browser' }));

    jest.doMock('react', () => React);
    jest.doMock('react-router', () => ({
      BrowserRouter,
      MemoryRouter: jest.fn(() => <div>memory router</div>),
      RouterProvider,
      createBrowserRouter,
      createMemoryRouter: jest.fn(() => ({ source: 'memory' })),
    }));
    jest.doMock('react-router/dom', () => ({
      RouterProvider: jest.fn(() => <div>dom router provider</div>),
    }));

    const {
      BrowserRouter: BridgeBrowserRouter,
      RouterProvider: BridgeRouterProvider,
    } = require('../src/router/v8');
    const { RouterContext } = require('../src/provider/context');
    const router = {
      basename: '/app',
      routes: [{ path: '/' }],
    };

    render(
      <RouterContext.Provider value={{ basename: '/host' }}>
        <BridgeBrowserRouter basename="/app">home</BridgeBrowserRouter>
        <BridgeRouterProvider router={router} />
      </RouterContext.Provider>,
    );

    expect(BrowserRouter).toHaveBeenCalled();
    expect(BrowserRouter.mock.calls[0][0].basename).toBe('/host');
    expect(createBrowserRouter).toHaveBeenCalledWith(
      router.routes,
      expect.objectContaining({ basename: '/host' }),
    );
    expect(RouterProvider).toHaveBeenCalled();
  });

  it('keeps DOM subpath RouterProvider while using root browser constructors', () => {
    const BrowserRouter = jest.fn(({ children }) => <div>{children}</div>);
    const DomRouterProvider = jest.fn(() => <div>dom router provider</div>);
    const createBrowserRouter = jest.fn(() => ({ source: 'browser' }));

    jest.doMock('react', () => React);
    jest.doMock('react-router', () => ({
      BrowserRouter,
      MemoryRouter: jest.fn(() => <div>memory router</div>),
      RouterProvider: jest.fn(() => <div>root router provider</div>),
      createBrowserRouter,
      createMemoryRouter: jest.fn(() => ({ source: 'memory' })),
    }));
    jest.doMock('react-router/dom', () => ({
      RouterProvider: DomRouterProvider,
    }));

    const {
      BrowserRouter: BridgeBrowserRouter,
      RouterProvider: BridgeRouterProvider,
    } = require('../src/router/v8-dom');
    const { RouterContext } = require('../src/provider/context');
    const router = {
      basename: '/app',
      routes: [{ path: '/' }],
    };

    render(
      <RouterContext.Provider value={{ basename: '/host' }}>
        <BridgeBrowserRouter basename="/app">home</BridgeBrowserRouter>
        <BridgeRouterProvider router={router} />
      </RouterContext.Provider>,
    );

    expect(BrowserRouter).toHaveBeenCalled();
    expect(createBrowserRouter).toHaveBeenCalledWith(
      router.routes,
      expect.objectContaining({ basename: '/host' }),
    );
    expect(DomRouterProvider).toHaveBeenCalled();
  });
});
