import { test, expect } from './index';

let targetPage: any;
let devtoolsPage: any;

test.beforeEach(async ({ page, context: browserContext, extensionId }) => {
  // const openUrl = 'http://localhost:8080';
  const openUrl = 'https://garfish.bytedance.net/vmok-e2e/edenx-demo-app1';
  targetPage = await browserContext.newPage();
  await targetPage.goto(openUrl);
  devtoolsPage = await browserContext.newPage();
  const extensionUrl = `chrome-extension://${extensionId}/html/main/index.html`;
  await devtoolsPage.goto(extensionUrl);
  await devtoolsPage.evaluate((openUrl: string) => {
    chrome.tabs
      .query({
        url: `${openUrl}/*`,
      })
      .then(tabs => {
        // @ts-expect-error
        window.targetTab = tabs[0];
      });
  }, openUrl);
});

test('test', async () => {
  await targetPage.waitForSelector('#dynamic-contents');
  const buttonValue = await targetPage.$eval(
    '#dynamic-contents',
    el => el.innerHTML,
  );
  expect(buttonValue).toBe('dynamic content app3 local');
});
