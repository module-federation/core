import { Page, Request } from '@playwright/test';

import { test, expect } from './index';

let targetPage: Page;
let devtoolsPage: Page;

const beforeProxyRequest: Array<string> = [];
const afterProxyRequest: Array<string> = [];
const proxyUrl = 'http://localhost:3009/mf-manifest.json';
const mockUrl = 'http://localhost:6666/mf-manifest.json';

const sleep = (timeout: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });

const beforeHandler = (request: Request) => {
  const url = request.url();
  if (url.includes('manifest.json') && !beforeProxyRequest.includes(url)) {
    beforeProxyRequest.push(url);
  }
};
const afterHandler = (request: Request) => {
  const url = request.url();
  if (url.includes('manifest.json')) {
    afterProxyRequest.push(url);
  }
};

test.beforeEach(async ({ context: browserContext, extensionId }) => {
  const openUrl = 'http://localhost:3008/basic';
  targetPage = await browserContext.newPage();
  targetPage.on('request', beforeHandler);
  await targetPage.goto(openUrl);

  devtoolsPage = await browserContext.newPage();
  const extensionUrl = `chrome-extension://${extensionId}/html/main/index.html`;
  await devtoolsPage.goto(extensionUrl);
  await devtoolsPage.evaluate((openUrl: string) => {
    chrome.tabs
      .query({
        url: `${openUrl}/*`,
      })
      .then((tabs) => {
        window.targetTab = tabs[0];
      });
  }, openUrl);
});

test('test proxy', async ({ request }) => {
  targetPage.removeListener('request', beforeHandler);

  await devtoolsPage.click('div[data-set-e2e=e2eProxyKey]');
  const moduleKeys = await devtoolsPage.$$('.arco-select-option');
  for (let i = 0; i < moduleKeys.length; i++) {
    const optionEl = moduleKeys[i];
    const text = await (await optionEl.getProperty('textContent')).jsonValue();
    if (text === 'webpack_provider') {
      await optionEl.click();
      break;
    }
  }

  await sleep(5000);
  targetPage.on('request', afterHandler);
  const response = await request.fetch(proxyUrl);
  const json = await response.json();
  await targetPage.route(mockUrl, async (route) => {
    await route.fulfill({ json });
  });
  await targetPage.bringToFront();

  await devtoolsPage.getByPlaceholder('Custom Manifest URL').fill(mockUrl);
  await sleep(5000);
  expect(beforeProxyRequest).toContain(proxyUrl);
  expect(beforeProxyRequest).not.toContain(mockUrl);

  expect(afterProxyRequest).toContain(mockUrl);
  expect(afterProxyRequest).not.toContain(proxyUrl);
  console.log(beforeProxyRequest, afterProxyRequest);
});
