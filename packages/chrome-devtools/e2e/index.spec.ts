import { Page, Request } from '@playwright/test';

import { test, expect } from './index';

let targetPage: Page;
let devtoolsPage: Page;

const beforeProxyRequest: Array<string> = [];
const afterProxyRequest: Array<string> = [];
const proxyUrl = 'http://localhost:3009/mf-manifest.json';
const mockUrl = 'http://localhost:6666/mf-manifest.json';
const targetOrigin = 'http://localhost:3013/basic';

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
  beforeProxyRequest.length = 0;
  afterProxyRequest.length = 0;
  targetPage = await browserContext.newPage();
  targetPage.on('request', beforeHandler);
  await targetPage.goto(targetOrigin);

  devtoolsPage = await browserContext.newPage();
  const extensionUrl = `chrome-extension://${extensionId}/html/main/index.html`;
  await devtoolsPage.goto(extensionUrl);
  await devtoolsPage.waitForLoadState('domcontentloaded');
  await devtoolsPage.evaluate(async (openUrl: string) => {
    const queryTabs = async () => {
      try {
        const result = chrome.tabs.query(
          {
            url: `${openUrl}/*`,
          },
          (tabs) => {
            if (tabs && tabs.length) {
              window.targetTab = tabs[0];
            }
          },
        );
        if (result && typeof (result as any).then === 'function') {
          return await result;
        }
      } catch (e) {
        // fall through to callback-based query
      }
      return await new Promise<any[]>((resolve) => {
        chrome.tabs.query({ url: `${openUrl}/*` }, (tabs) => {
          resolve(tabs || []);
        });
      });
    };
    const tabs = await queryTabs();
    if (Array.isArray(tabs) && tabs.length) {
      window.targetTab = tabs[0];
    }
  }, targetOrigin);
  await devtoolsPage.waitForFunction(() => Boolean(window.targetTab?.id));
});

test('test proxy', async ({ request }) => {
  targetPage.removeListener('request', beforeHandler);
  await sleep(3000);
  await sleep(3000);

  // Setting proxy logic
  const addButton = devtoolsPage.locator('[data-set-e2e=e2eAdd]');
  await expect(addButton).toBeVisible({ timeout: 60000 });
  await addButton.click();
  const proxyKeySelect = devtoolsPage.locator('[data-set-e2e=e2eProxyKey]');
  await expect(proxyKeySelect).toBeVisible();
  await proxyKeySelect.click();
  const moduleKeys = await devtoolsPage.$$('.arco-select-option');
  for (let i = 0; i < moduleKeys.length; i++) {
    const optionEl = moduleKeys[i];
    const text = await (await optionEl.getProperty('textContent')).jsonValue();
    if (text === 'webpack_provider') {
      await optionEl.click();
      break;
    }
  }

  await sleep(3000);
  // Configure resource forwarding in advance
  targetPage.on('request', afterHandler);
  const response = await request.fetch(proxyUrl);
  const json = await response.json();
  await targetPage.route(mockUrl, async (route) => {
    await route.fulfill({ json });
  });
  await sleep(2000);
  await sleep(3000);

  await devtoolsPage.getByPlaceholder('Custom Manifest URL').fill(mockUrl);
  const optionsEle = await devtoolsPage.$$('.arco-select-option');
  await optionsEle[0].click();

  await sleep(3000);

  await targetPage.bringToFront();

  expect(beforeProxyRequest).toContain(proxyUrl);
  expect(beforeProxyRequest).not.toContain(mockUrl);

  expect(afterProxyRequest).toContain(mockUrl);
  expect(afterProxyRequest).not.toContain(proxyUrl);

  console.log(beforeProxyRequest, afterProxyRequest);
});
