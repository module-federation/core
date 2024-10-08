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
  const openUrl = 'http://localhost:3013/basic';
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
  await sleep(3000);

  // Check the page proxy status
  let targetPageModuleInfo = await targetPage.evaluate(() => {
    return (window as any)?.__FEDERATION__?.moduleInfo ?? {};
  });

  expect(targetPageModuleInfo).toMatchObject({
    manifest_host: {
      remotesInfo: {
        webpack_provider: {
          matchedVersion: proxyUrl,
        },
      },
    },
  });
  await sleep(3000);

  // Setting proxy logic
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
  optionsEle[0].click();

  await sleep(3000);

  await targetPage.bringToFront();

  expect(beforeProxyRequest).toContain(proxyUrl);
  expect(beforeProxyRequest).not.toContain(mockUrl);

  expect(afterProxyRequest).toContain(mockUrl);
  expect(afterProxyRequest).not.toContain(proxyUrl);

  // check proxy snapshot
  let targetPageModuleInfoNew = await targetPage.evaluate(() => {
    return (window as any)?.__FEDERATION__?.moduleInfo ?? {};
  });

  expect(targetPageModuleInfoNew).toMatchObject({
    manifest_host: {
      remotesInfo: {
        webpack_provider: {
          matchedVersion: mockUrl,
        },
      },
    },
  });

  console.log(beforeProxyRequest, afterProxyRequest);
});
