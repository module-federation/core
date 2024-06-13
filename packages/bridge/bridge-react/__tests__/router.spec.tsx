import { assert, describe, it } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { BrowserRouter } from '../src/router';
import { JSDOM } from 'jsdom';
import { prettyDOM } from '@testing-library/react';

describe('react router proxy', () => {
  it('BrowserRouter not wraper context', async () => {
    let { container } = render(
      <BrowserRouter basename="/" window={getWindowImpl('/', false)}>
        <ul>
          <li>
            <Link to="/" className="self-remote1-home-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/detail" className="self-remote1-detail-link">
              Detail
            </Link>
          </li>
        </ul>
        <Routes>
          <Route path="/" Component={() => <div>home page</div>} />
          <Route path="/detail" Component={() => <div>detail page</div>} />
        </Routes>
      </BrowserRouter>,
    );
    expect(getHtml(container)).toMatch('home page');
  });

  it('The host snapshot is automatically completed', async () => {
    expect(1).toBe(2);
  });
});

function getWindowImpl(initialUrl: string, isHash = false): Window {
  // Need to use our own custom DOM in order to get a working history
  const dom = new JSDOM(`<!DOCTYPE html>`, { url: 'http://localhost/' });
  dom.window.history.replaceState(null, '', (isHash ? '#' : '') + initialUrl);
  return dom.window as unknown as Window;
}

function getHtml(container: HTMLElement) {
  return prettyDOM(container, undefined, {
    highlight: false,
  });
}
