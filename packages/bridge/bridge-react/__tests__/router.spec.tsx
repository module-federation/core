import { assert, describe, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import {
  Link,
  Routes,
  Route,
  Outlet,
  createBrowserRouter,
} from 'react-router-dom';
import { BrowserRouter, RouterProvider } from '../src/router/default';
import { RouterContext } from '../src/provider/context';
import { getHtml, getWindowImpl } from './util';

describe('react router proxy', () => {
  it('BrowserRouter not wraper context', async () => {
    let { container } = render(
      <RouterContext.Provider value={{ name: 'test', basename: '/test' }}>
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
      <RouterContext.Provider value={{ name: 'test', basename: '/test' }}>
        <RouterProvider router={router} />
      </RouterContext.Provider>,
    );
    expect(getHtml(container)).toMatch('home page');
  });
});
