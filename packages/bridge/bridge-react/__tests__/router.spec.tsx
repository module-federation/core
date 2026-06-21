// Test file for router
import { render } from '@testing-library/react';
import React from 'react';
import {
  Link,
  Routes,
  Route,
  Outlet,
  createBrowserRouter,
} from 'react-router-dom';
import {
  Link as LinkV8,
  Routes as RoutesV8,
  Route as RouteV8,
  Outlet as OutletV8,
  createBrowserRouter as createBrowserRouterV8,
} from 'react-router';
import { BrowserRouter, RouterProvider } from '../src/router/default';
import {
  BrowserRouter as BrowserRouterV8,
  RouterProvider as RootRouterProviderV8,
} from '../src/router/v8';
import { RouterProvider as RouterProviderV8 } from '../src/router/v8-dom';
import { RouterContext } from '../src/provider/context';
import { getHtml, getWindowImpl } from './util';

describe('react router proxy', () => {
  it('BrowserRouter not wraper context', async () => {
    let { container } = render(
      <RouterContext.Provider value={{ basename: '/test' } as any}>
        <BrowserRouter basename="/" window={getWindowImpl('/test', false)}>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/detail">Detail</Link>
            </li>
          </ul>
          <Routes>
            <Route path="/" Component={() => <div>home page</div>} />
            <Route path="/detail" Component={() => <div>detail page</div>} />
          </Routes>
        </BrowserRouter>
      </RouterContext.Provider>,
    );
    expect(getHtml(container)).toMatch('home page');
  });

  it('RouterProvider', async () => {
    function Layout() {
      return (
        <>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/detail">Detail</Link>
            </li>
          </ul>
          <Outlet />
        </>
      );
    }
    const router = createBrowserRouter(
      [
        {
          path: '/',
          element: <Layout />,
          children: [
            {
              index: true,
              element: <div>home page</div>,
            },
            {
              path: '/detail',
              element: <div>detail page</div>,
            },
          ],
        },
      ],
      {
        window: getWindowImpl('/test', false),
      },
    );
    let { container } = render(
      <RouterContext.Provider value={{ basename: '/test' } as any}>
        <RouterProvider router={router} />
      </RouterContext.Provider>,
    );
    expect(getHtml(container)).toMatch('home page');
  });
});

describe('react router v8 proxy', () => {
  it('BrowserRouter uses the bridge basename context', async () => {
    let { container } = render(
      <RouterContext.Provider value={{ basename: '/test' } as any}>
        <BrowserRouterV8 basename="/" window={getWindowImpl('/test', false)}>
          <ul>
            <li>
              <LinkV8 to="/">Home</LinkV8>
            </li>
            <li>
              <LinkV8 to="/detail">Detail</LinkV8>
            </li>
          </ul>
          <RoutesV8>
            <RouteV8 path="/" Component={() => <div>home page</div>} />
            <RouteV8 path="/detail" Component={() => <div>detail page</div>} />
          </RoutesV8>
        </BrowserRouterV8>
      </RouterContext.Provider>,
    );
    expect(getHtml(container)).toMatch('home page');
  });

  it('RouterProvider uses the bridge basename context', async () => {
    function Layout() {
      return (
        <>
          <ul>
            <li>
              <LinkV8 to="/">Home</LinkV8>
            </li>
            <li>
              <LinkV8 to="/detail">Detail</LinkV8>
            </li>
          </ul>
          <OutletV8 />
        </>
      );
    }
    const router = createBrowserRouterV8(
      [
        {
          path: '/',
          element: <Layout />,
          children: [
            {
              index: true,
              element: <div>home page</div>,
            },
            {
              path: '/detail',
              element: <div>detail page</div>,
            },
          ],
        },
      ],
      {
        window: getWindowImpl('/test', false),
      },
    );
    let { container } = render(
      <RouterContext.Provider value={{ basename: '/test' } as any}>
        <RouterProviderV8 router={router} />
      </RouterContext.Provider>,
    );
    expect(getHtml(container)).toMatch('home page');
  });

  it('root RouterProvider export uses the bridge basename context', async () => {
    function Layout() {
      return (
        <>
          <ul>
            <li>
              <LinkV8 to="/">Home</LinkV8>
            </li>
            <li>
              <LinkV8 to="/detail">Detail</LinkV8>
            </li>
          </ul>
          <OutletV8 />
        </>
      );
    }
    const router = createBrowserRouterV8(
      [
        {
          path: '/',
          element: <Layout />,
          children: [
            {
              index: true,
              element: <div>home page</div>,
            },
            {
              path: '/detail',
              element: <div>detail page</div>,
            },
          ],
        },
      ],
      {
        window: getWindowImpl('/test', false),
      },
    );
    let { container } = render(
      <RouterContext.Provider value={{ basename: '/test' } as any}>
        <RootRouterProviderV8 router={router} />
      </RouterContext.Provider>,
    );
    expect(getHtml(container)).toMatch('home page');
  });
});
