import { test, expect, chromium } from '@playwright/test';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';

for (const variant of ['chrome', 'browser']) {
  test(`${variant}: React 19 renders offline with the bundled development runtime`, async () => {
    const server = createServer((_request, response) => {
      response.setHeader('Content-Type', 'text/html');
      response.end('<!doctype html><div id="app"></div>');
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const extensionPath = path.resolve(__dirname, '../dist', variant);
    let context;
    try {
      context = await chromium.launchPersistentContext('', {
        channel: 'chromium',
        headless: true,
        args: [
          `--disable-extensions-except=${extensionPath}`,
          `--load-extension=${extensionPath}`,
        ],
      });
      const remoteRequests: string[] = [];
      await context.route('https://**/*', (route) => {
        remoteRequests.push(route.request().url());
        return route.abort();
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(
        `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
      );
      // Exercise the cached eager path on the next document_start as well.
      await page.evaluate(() =>
        localStorage.setItem(
          '__MF_DEVTOOLS__',
          JSON.stringify({
            enableFastRefresh: true,
            eagerShare: ['react', '19.0.0', ['scope']],
          }),
        ),
      );
      await page.reload();
      const result = await page.evaluate(async () => {
        const target = window as any;
        const plugin = target.__FEDERATION__.__GLOBAL_PLUGIN__.find(
          (item: any) => item.name === 'mf-fast-refresh-plugin',
        );
        const react: any = {
          version: '19.1.1',
          scope: ['scope'],
          shareConfig: {},
        };
        const client: any = {
          version: '19.0.0',
          scope: ['scope'],
          shareConfig: {},
        };
        const dom: any = {
          version: '19.2.0',
          scope: ['scope'],
          shareConfig: { eager: true },
        };
        plugin.beforeRegisterShare({ pkgName: 'react', shared: react });
        plugin.beforeRegisterShare({
          pkgName: 'react-dom/client',
          shared: client,
        });
        plugin.beforeRegisterShare({ pkgName: 'react-dom', shared: dom });
        const ReactDOM = (await client.get())();
        const React = (await react.get())();
        function Counter() {
          const [count, setCount] = React.useState(0);
          return React.createElement(
            'button',
            { onClick: () => setCount(count + 1) },
            `Count: ${count}`,
          );
        }
        const root = ReactDOM.createRoot(document.getElementById('app'));
        ReactDOM.flushSync(() => root.render(React.createElement(Counter)));
        return {
          version: React.version,
          development: Object.isFrozen(React.createElement('div')),
          sameDom: dom.lib() === ReactDOM,
          sameReact: target.scope_react === React,
        };
      });
      expect(result).toEqual({
        version: '19.2.4',
        development: true,
        sameDom: true,
        sameReact: true,
      });
      await page.getByRole('button', { name: 'Count: 0' }).click();
      await expect(
        page.getByRole('button', { name: 'Count: 1' }),
      ).toBeVisible();
      expect(remoteRequests).toEqual([]);
      expect(errors).toEqual([]);
    } finally {
      await context?.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
}
