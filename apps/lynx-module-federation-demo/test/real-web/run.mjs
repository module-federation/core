import assert from 'node:assert/strict';
import { access, mkdir, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const testRoot = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(testRoot, '../..');
const repoRoot = path.resolve(appRoot, '../..');
const requireFromApp = createRequire(path.join(appRoot, 'package.json'));
const requireFromRepo = createRequire(path.join(repoRoot, 'package.json'));

const resolveFromApp = (specifier) =>
  path.dirname(requireFromApp.resolve(`${specifier}/package.json`));
const webCoreRoot = resolveFromApp('@lynx-js/web-core');
const requireFromWebCore = createRequire(
  path.join(webCoreRoot, 'package.json'),
);
const webElementsRoot = path.dirname(
  requireFromWebCore.resolve('@lynx-js/web-elements/package.json'),
);

const fromAppRoot = (value, fallback) =>
  path.resolve(appRoot, value ?? fallback);
const hostBundlePath = fromAppRoot(
  process.env.LYNX_HOST_WEB_BUNDLE,
  'dist/host-web/main.web.bundle',
);
const remoteManifestPath = fromAppRoot(
  process.env.LYNX_REMOTE_MANIFEST,
  'dist/remote-web/mf-manifest.json',
);
const remoteBundlePath = fromAppRoot(
  process.env.LYNX_REMOTE_WEB_BUNDLE,
  'dist/remote-web/catalog.web.lynx.bundle',
);
const hostOutputRoot = path.dirname(hostBundlePath);
const remoteOutputRoot = path.dirname(remoteManifestPath);
const screenshotPath = fromAppRoot(
  process.env.LYNX_WEB_E2E_SCREENSHOT,
  'test/real-web/artifacts/failure.png',
);
const readinessTimeout = Number(process.env.LYNX_WEB_E2E_TIMEOUT ?? 60_000);

const requiredArtifacts = [
  ['Rspeedy host web bundle', hostBundlePath],
  ['federation manifest', remoteManifestPath],
  ['federated Lynx web bundle', remoteBundlePath],
];
for (const [name, file] of requiredArtifacts) {
  await assert.doesNotReject(
    access(file),
    `${name} is missing at ${file}; build the official Rspeedy demo first`,
  );
}

const contentTypes = new Map([
  ['.bundle', 'application/octet-stream'],
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.wasm', 'application/wasm'],
]);

const inside = (root, pathname) => {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  const file = path.resolve(root, relative);
  const back = path.relative(root, file);
  return back === '' || (!back.startsWith('..') && !path.isAbsolute(back))
    ? file
    : undefined;
};

const routes = [
  ['/dist/host-web/', hostOutputRoot],
  ['/dist/remote-web/', remoteOutputRoot],
  ['/remote-web/', remoteOutputRoot],
  ['/node_modules/@lynx-js/web-core/', webCoreRoot],
  ['/node_modules/@lynx-js/web-elements/', webElementsRoot],
  ['/test/real-web/', testRoot],
];

const requests = [];
let baseUrl;

const resolveAsset = (pathname) => {
  if (pathname === '/') return path.join(testRoot, 'index.html');
  for (const [prefix, root] of routes) {
    if (pathname.startsWith(prefix)) {
      return inside(root, pathname.slice(prefix.length));
    }
  }
  return undefined;
};

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
  requests.push(pathname);
  try {
    const file = resolveAsset(pathname);
    if (!file || !(await stat(file)).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }

    let body = await readFile(file);
    if (path.resolve(file) === path.resolve(remoteManifestPath)) {
      const manifest = JSON.parse(body.toString('utf8'));
      manifest.metaData ??= {};
      manifest.metaData.publicPath = `${baseUrl}/dist/remote-web/`;
      body = Buffer.from(JSON.stringify(manifest));
    }

    response.writeHead(200, {
      'access-control-allow-origin': '*',
      'cache-control': 'no-store',
      'content-length': body.byteLength,
      'content-type':
        contentTypes.get(path.extname(file)) ?? 'application/octet-stream',
      'cross-origin-embedder-policy': 'require-corp',
      'cross-origin-opener-policy': 'same-origin',
    });
    if (request.method === 'HEAD') response.end();
    else response.end(body);
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(500).end(String(error));
  }
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

const address = server.address();
assert.ok(address && typeof address === 'object');
baseUrl = `http://127.0.0.1:${address.port}`;

const playwrightEntry = requireFromRepo.resolve('@playwright/test');
const playwrightModule = await import(pathToFileURL(playwrightEntry));
const { chromium } = playwrightModule.default ?? playwrightModule;
let browser;
let page;

const closeServer = () =>
  new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

const close = async () => {
  await browser?.close();
  await closeServer();
};

const onSignal = () => {
  close().finally(() => process.exit(130));
};
process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);

const poll = async (read, accept, label, timeout = readinessTimeout) => {
  const deadline = Date.now() + timeout;
  let value;
  let lastError;
  while (Date.now() < deadline) {
    try {
      value = await read();
      if (accept(value)) return value;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.fail(
    `${label} did not become ready; last value: ${JSON.stringify(value)}${
      lastError ? `; last error: ${lastError.message}` : ''
    }`,
  );
};

const text = (locator) => locator.textContent({ timeout: 1_000 });
const numberFrom = async (locator) => {
  const value = await text(locator);
  const match = value?.match(/-?\d+/);
  assert.ok(match, `Expected a numeric value in ${JSON.stringify(value)}`);
  return Number(match[0]);
};
const readCounts = (locators) => Promise.all(locators.map(numberFrom));
const allEqual = (values) => values.every((value) => value === values[0]);
const tap = async (locator) => {
  await locator.scrollIntoViewIfNeeded();
  await locator.tap();
};

const pageErrors = [];
const consoleErrors = [];

try {
  browser = await chromium.launch({
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    viewport: { width: 430, height: 932 },
  });
  page = await context.newPage();
  page.on('pageerror', (error) =>
    pageErrors.push(error.stack ?? error.message),
  );
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(`${baseUrl}/`, {
    timeout: 60_000,
    waitUntil: 'domcontentloaded',
  });

  const activePage = page.locator(
    '#orbit-lynx-view [part="page"]:not([l-disposed])',
  );
  await poll(
    () => activePage.count(),
    (count) => count === 1,
    'single active Lynx page',
  );
  const app = activePage.getByTestId('orbit-control-app');
  await app.waitFor({ state: 'visible', timeout: readinessTimeout });
  assert.equal(await app.count(), 1, 'the app must render exactly once');

  await tap(activePage.getByTestId('load-remotes'));
  const ready = /ready|loaded|passed|success/i;
  for (const testId of ['import-status', 'runtime-status']) {
    const locator = activePage.getByTestId(testId);
    const status = await poll(
      () => text(locator),
      (value) => ready.test(value ?? '') || /error/i.test(value ?? ''),
      `${testId} evidence`,
    );
    if (/error/i.test(status ?? '')) {
      assert.fail(
        `${testId} failed: ${await text(activePage.getByTestId('load-error'))}`,
      );
    }
  }

  const remoteCard = activePage.getByTestId('remote-card');
  await remoteCard.waitFor({ state: 'visible', timeout: readinessTimeout });
  assert.equal(await remoteCard.count(), 1, 'remote Card must render once');
  assert.equal(
    await remoteCard.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
    'rgb(239, 252, 246)',
    'remote CSS must be applied through the external Lynx bundle',
  );
  const remoteDetails = activePage.getByTestId('remote-details');
  await remoteDetails.waitFor({ state: 'visible', timeout: readinessTimeout });
  assert.equal(
    await remoteDetails.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
    'rgb(23, 33, 43)',
    'Details must retain its dark remote style',
  );
  assert.equal(
    await app.evaluate((element) => getComputedStyle(element).backgroundColor),
    'rgb(244, 247, 248)',
    'remote CSS must not overwrite the host surface',
  );

  const singletonStatus = activePage.getByTestId('singleton-status');
  await poll(
    () => text(singletonStatus),
    (value) => /shared singleton verified/i.test(value ?? ''),
    'singleton identity proof',
  );

  const counts = [
    activePage.getByTestId('shared-host-count'),
    activePage.getByTestId('shared-card-count'),
    activePage.getByTestId('shared-details-count'),
    activePage.getByTestId('shared-activity-count'),
  ];
  const baseline = await poll(
    () => readCounts(counts),
    allEqual,
    'singleton counts',
  );

  await tap(activePage.getByTestId('increment-shared'));
  const incremented = await poll(
    () => readCounts(counts),
    (values) => allEqual(values) && values[0] > baseline[0],
    'shared singleton increment',
  );
  assert.ok(incremented[0] > baseline[0]);
  await poll(
    () => text(activePage.getByTestId('shared-last-source')),
    (value) => value?.trim() === 'catalog/Card',
    'remote singleton mutation source',
  );

  await tap(activePage.getByTestId('nav-activity'));
  await tap(activePage.getByTestId('reset-feed'));
  await tap(activePage.getByTestId('nav-overview'));
  await poll(
    () => readCounts(counts),
    (values) => allEqual(values) && values[0] === 0,
    'shared singleton reset',
  );

  const modulesNav = activePage.getByTestId('nav-modules');
  await tap(modulesNav);
  await poll(
    async () => ({
      active: await modulesNav.getAttribute('data-active'),
      current: await modulesNav.getAttribute('aria-current'),
      selected: await modulesNav.getAttribute('aria-selected'),
    }),
    ({ active, current, selected }) =>
      active === 'true' || current === 'page' || selected === 'true',
    'modules navigation state',
  );

  await poll(
    () => Promise.resolve(requests),
    (values) =>
      values.includes('/dist/remote-web/mf-manifest.json') ||
      values.includes('/remote-web/mf-manifest.json'),
    'manifest HTTP request',
  );
  assert.ok(
    requests.some((value) =>
      value.endsWith(`/${path.basename(remoteBundlePath)}`),
    ),
    `Remote bundle was not requested: ${JSON.stringify(requests)}`,
  );
  const lazyBundleRequests = requests.filter(
    (value) => value.includes('/async/') && value.endsWith('.bundle'),
  );
  assert.equal(
    lazyBundleRequests.length,
    3,
    `each lazy exposure should be fetched once: ${JSON.stringify(lazyBundleRequests)}`,
  );
  assert.equal(
    new Set(lazyBundleRequests).size,
    3,
    `split mode must fetch one lazy bundle per expose: ${JSON.stringify(lazyBundleRequests)}`,
  );

  const lynxErrors = await page.evaluate(
    () => globalThis.__LYNX_WEB_E2E__?.errors ?? [],
  );
  assert.deepEqual(
    lynxErrors,
    [],
    `lynx-view errors: ${lynxErrors.join('\n')}`,
  );
  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join('\n')}`);
  assert.deepEqual(
    consoleErrors,
    [],
    `console errors: ${consoleErrors.join('\n')}`,
  );

  process.stdout.write(
    `Real Lynx Web E2E passed at ${baseUrl} (${requests.length} requests)\n`,
  );
} catch (error) {
  if (page) {
    await mkdir(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }
  throw new Error(
    [
      error instanceof Error ? error.message : String(error),
      `Failure screenshot: ${screenshotPath}`,
      `Page errors: ${JSON.stringify(pageErrors)}`,
      `Console errors: ${JSON.stringify(consoleErrors)}`,
      `Requests: ${JSON.stringify(requests)}`,
    ].join('\n'),
    { cause: error },
  );
} finally {
  process.removeListener('SIGINT', onSignal);
  process.removeListener('SIGTERM', onSignal);
  await close();
}
