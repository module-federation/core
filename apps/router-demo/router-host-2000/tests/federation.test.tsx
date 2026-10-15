import { page } from '@rstest/browser';
import { cleanup, render } from '@rstest/browser-react';
import { afterEach, expect, it } from '@rstest/core';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';

async function renderRoute(route: string) {
  window.history.replaceState({}, '', route);
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}

function clickRemoteLink(selector: string) {
  const link = document.querySelector<HTMLAnchorElement>(selector);
  if (!link) throw new Error(`Remote link not rendered: ${selector}`);
  link.click();
}

afterEach(async () => {
  await cleanup();
  window.history.replaceState({}, '', '/');
});

it('passes props and a DOM ref to the React 17 remote', async () => {
  await renderRoute('/remote1');
  await expect.element(page.getByText('Remote1 home page')).toBeVisible();
  await expect.element(page.getByText('name: Ming, age: 12')).toBeVisible();
  await expect.element(page.getByText('Some text')).toBeVisible();
  await page.getByText('Detail', { exact: true }).last().click();
  await expect.element(page.getByText('Remote1 detail page')).toBeVisible();
});

it('renders the named React 18 provider export', async () => {
  await renderRoute('/remote2');
  await expect.element(page.getByText('Remote2 home page')).toBeVisible();
  await page.getByText('Detail', { exact: true }).last().click();
  await expect.element(page.getByText('Remote2 detail page')).toBeVisible();
});

it('renders and navigates a Vue remote in the React host', async () => {
  await renderRoute('/remote3');
  await expect.element(page.getByText('Remote3 home page')).toBeVisible();
  await page.getByText('Detail', { exact: true }).last().click();
  await expect.element(page.getByText('Remote3 detail page')).toBeVisible();
});

it('renders a React 19 remote in the React 18 host', async () => {
  await renderRoute('/remote5');
  await expect
    .element(page.getByText('This is the remote app5 with React 19.'))
    .toBeVisible();
});

it('keeps three remote routers independent', async () => {
  await renderRoute('/memory-router');
  await expect.element(page.getByText('Remote1 home page')).toBeVisible();
  await expect.element(page.getByText('Remote2 detail page')).toBeVisible();
  await expect.element(page.getByText('Remote3 home page')).toBeVisible();

  clickRemoteLink('.self-remote1-detail-link');
  await expect.element(page.getByText('Remote1 detail page')).toBeVisible();
  clickRemoteLink('.self-remote2-home-link');
  await expect.element(page.getByText('Remote2 home page')).toBeVisible();
  clickRemoteLink('.self-remote3-detail-link');
  await expect.element(page.getByText('Remote3 detail page')).toBeVisible();
  await expect.element(page.getByText('Remote1 detail page')).toBeVisible();
  await expect.element(page.getByText('Remote2 home page')).toBeVisible();
});

it('synchronizes remote navigation with the host URL', async () => {
  await renderRoute('/remote6');
  await expect.element(page.getByText('hello remote6 home page')).toBeVisible();
  clickRemoteLink('.self-remote6-about-link');
  await expect.element(page.getByText('Remote6 about page')).toBeVisible();
  expect(window.location.pathname).toBe('/remote6/about');
  await expect
    .element(page.getByText('Enhanced error boundaries'))
    .toBeVisible();
  clickRemoteLink('.self-remote6-detail-link');
  await expect
    .element(page.getByRole('heading', { name: 'Remote6 detail page' }))
    .toBeVisible();
  expect(window.location.pathname).toBe('/remote6/detail');
  clickRemoteLink('.self-remote6-home-link');
  await expect.element(page.getByText('hello remote6 home page')).toBeVisible();
  expect(window.location.pathname).toBe('/remote6');
});

it('preserves inner state when outer props change', async () => {
  await renderRoute('/remote6/detail');
  await expect.element(page.getByTestId('remote6-inner-counter')).toBeVisible();
  await page.getByTestId('remote6-inner-increment').click();
  await page.getByTestId('remote6-inner-increment').click();
  await page.getByTestId('remote6-inner-increment').click();
  await page.getByTestId('remote6-outer-increment').click();
  await page.getByTestId('remote6-outer-increment').click();
  await page.getByTestId('remote6-outer-increment').click();
  await expect.element(page.getByText('Outer Counter: 3')).toBeVisible();
  await expect
    .element(page.getByTestId('remote6-inner-counter'))
    .toHaveText('Inner Counter: 3');
});

it('updates outer props without changing the inner counter', async () => {
  await renderRoute('/remote6/detail');
  await expect.element(page.getByTestId('remote6-inner-counter')).toBeVisible();
  for (let count = 0; count < 4; count++) {
    await page.getByTestId('remote6-outer-increment').click();
  }
  await expect.element(page.getByText('Outer Counter: 4')).toBeVisible();
  await expect
    .element(page.getByTestId('remote6-inner-counter'))
    .toHaveText('Inner Counter: 0');
});

it('keeps alternating inner and outer updates independent', async () => {
  await renderRoute('/remote6/detail');
  await expect.element(page.getByTestId('remote6-inner-counter')).toBeVisible();
  for (let count = 0; count < 2; count++) {
    await page.getByTestId('remote6-outer-increment').click();
    await page.getByTestId('remote6-inner-increment').click();
  }
  await page.getByTestId('remote6-outer-increment').click();
  await page.getByTestId('remote6-outer-increment').click();
  for (let count = 0; count < 3; count++) {
    await page.getByTestId('remote6-inner-increment').click();
  }
  await expect.element(page.getByText('Outer Counter: 4')).toBeVisible();
  await expect
    .element(page.getByTestId('remote6-inner-counter'))
    .toHaveText('Inner Counter: 5');
});
