import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from '@rstest/core';
import { RouterContext } from '../provider/context';
import { RouterProvider } from './v6';

describe('React Router v6 Bridge SSR', () => {
  it('fails clearly when a data router is used for SSR', () => {
    expect(() =>
      renderToStaticMarkup(
        <RouterContext.Provider value={{ ssrLocation: '/detail' }}>
          <RouterProvider router={{ routes: [] } as any} />
        </RouterContext.Provider>,
      ),
    ).toThrow(/does not support React Router data routers/);
  });
});
