import { test, expect, chromium } from '@playwright/test';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';

// This fixture provides the host API contract. It tests the real unpacked
// extension, not native WebMCP discovery in a particular browser product.
const fixture = `<!doctype html><title>MF WebMCP fixture</title><script>
window.registeredTools = new Map();
Object.defineProperty(document, 'modelContext', { value: {
  registerTool(tool) { window.registeredTools.set(tool.name, tool); },
  unregisterTool(name) { window.registeredTools.delete(name); }
}});
window.earlyPlugins = (window.__FEDERATION__?.__GLOBAL_PLUGIN__ || []).map(p => p.name);
window.earlyConfig = JSON.parse(localStorage.getItem('__MF_DEVTOOLS__') || '{}');
Object.assign(window.__FEDERATION__, {
  moduleInfo: { host: { name: 'host', remotesInfo: { remote: { matchedVersion: 'old' } } } },
  __SHARE__: {}
});
</script><h1>Module Federation test host</h1>`;

for (const variant of ['chrome', 'browser']) {
  test(`${variant}: page tools, startup state and popup layout`, async ({}, testInfo) => {
    const server = createServer((_request, response) => {
      response.setHeader('Content-Type', 'text/html');
      response.end(fixture);
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const extensionPath = path.resolve(__dirname, '../dist', variant);
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
      viewport: { width: 800, height: 600 },
    });
    try {
      const page = await context.newPage();
      await page.goto(origin);
      await page.waitForFunction(
        () => (window as any).registeredTools?.size === 10,
      );
      expect(
        await page.evaluate(() => (window as any).__MF_DEVTOOLS_WEBMCP__),
      ).toMatchObject({
        status: 'registered',
        tools: expect.arrayContaining(['mf_get_state', 'mf_set_hmr']),
      });
      const execute = (name: string, input = {}) =>
        page.evaluate(
          async ({ name, input }) => {
            const result = await (window as any).registeredTools
              .get(name)
              .execute(input);
            if (result.isError) throw new Error(result.content[0].text);
            return JSON.parse(result.content[0].text);
          },
          { name, input },
        );
      expect(await page.evaluate(() => (window as any).earlyPlugins)).toContain(
        'mf-fast-refresh-plugin',
      );
      expect(await execute('mf_set_hmr', { enabled: true })).toMatchObject({
        saved: true,
        reloadRequired: true,
      });
      await execute('mf_set_proxy', {
        rules: [{ key: 'remote', value: `${origin}/mf-manifest.json` }],
      });
      await page.reload();
      await page.waitForFunction(
        () => (window as any).registeredTools?.size === 10,
      );
      expect(
        await page.evaluate(() => (window as any).earlyConfig),
      ).toMatchObject({
        enableFastRefresh: true,
        overrides: { remote: `${origin}/mf-manifest.json` },
      });
      expect((await execute('mf_get_state')).config.enableFastRefresh).toBe(
        true,
      );
      await execute('mf_clear_proxy');
      expect((await execute('mf_get_state')).config.overrides).toEqual({});

      if (variant === 'browser') {
        const [worker] = context.serviceWorkers().length
          ? context.serviceWorkers()
          : [await context.waitForEvent('serviceworker')];
        const extensionId = new URL(worker.url()).host;
        const popup = await context.newPage();
        await page.bringToFront();
        const errors: string[] = [];
        popup.on('pageerror', (error) => errors.push(error.message));
        await popup.goto(
          `chrome-extension://${extensionId}/html/main/index.html?view=popup`,
        );
        await expect(popup.locator('html')).toHaveAttribute(
          'data-devtools-view',
          'popup',
        );
        await expect(popup.locator('header')).toContainText(
          'MF WebMCP fixture',
        );
        await expect(popup.locator('[data-set-e2e=e2eAdd]')).toBeVisible();
        // Opening the UI must not resurrect cleared rules or reset page HMR.
        expect((await execute('mf_get_state')).config).toMatchObject({
          enableFastRefresh: true,
          overrides: {},
        });
        await execute('mf_set_hmr', { enabled: false });
        await expect(popup.locator('.arco-switch').nth(1)).toHaveAttribute(
          'aria-checked',
          'false',
        );
        for (let index = 0; index < 6; index++)
          await popup.locator('[data-set-e2e=e2eAdd]').click();
        const content = popup
          .locator('section')
          .first()
          .locator(':scope > div > div');
        expect(
          await content.evaluate(
            (element) => element.scrollHeight > element.clientHeight,
          ),
        ).toBe(true);
        await content.evaluate((element) => {
          element.scrollTop = element.scrollHeight;
        });
        await expect(popup.locator('aside')).toBeVisible();
        await expect(popup.locator('header')).toBeVisible();
        await content.evaluate((element) => {
          element.scrollTop = 0;
        });
        const viewport = await popup.evaluate(() => ({
          height: document.documentElement.scrollHeight,
          width: document.documentElement.scrollWidth,
        }));
        expect(viewport.height).toBeLessThanOrEqual(600);
        expect(viewport.width).toBeLessThanOrEqual(800);
        await popup.screenshot({
          path: testInfo.outputPath('popup-proxy.png'),
        });
        const nav = popup.locator('aside button');
        for (let index = 0; index < 6; index++) {
          await nav.nth(index).click();
          await expect(popup.locator('header')).toBeVisible();
        }
        expect(errors).toEqual([]);
        await popup.close();
        // Tools remain on the inspected page after the popup closes.
        expect((await execute('mf_get_modules')).host).toBeTruthy();
      }
    } finally {
      await context.close();
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
}
