/**
 * E2E tests for RSC Notes App (app2)
 *
 * Mirrors the app1 RSC tests but runs against app2.
 */
const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const path = require('path');

const app1Root = path.dirname(require.resolve('app1/package.json'));
const app2Root = path.dirname(require.resolve('app2/package.json'));

const APP1_PORT = 4101;
const PORT = 4001;
const BASE_URL = `http://localhost:${PORT}`;
const APP1_BASE_URL = `http://localhost:${APP1_PORT}`;

async function waitFor(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return;
    } catch (err) {
      // ignore until timeout
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startServer() {
  // No --conditions flag is needed at runtime because the app
  // uses the bundled RSC server (server.rsc.js).
  const child = spawn('node', ['server/api.server.js'], {
    cwd: app2Root,
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'production',
    },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  child.unref();
  return child;
}

function startHostServer() {
  const child = spawn('node', ['server/api.server.js'], {
    cwd: app1Root,
    env: {
      ...process.env,
      PORT: String(APP1_PORT),
      NODE_ENV: 'production',
    },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  child.unref();
  return child;
}

test.describe.configure({ mode: 'serial' });

let serverProc;
let hostProc;

test.beforeAll(async () => {
  hostProc = startHostServer();
  await waitFor(`${APP1_BASE_URL}/mf-manifest.server.json`);
  serverProc = startServer();
  await waitFor(`${BASE_URL}/`);
});

test.afterAll(async () => {
  try {
    if (serverProc?.pid) process.kill(serverProc.pid, 'SIGTERM');
  } catch {}
  try {
    if (hostProc?.pid) process.kill(hostProc.pid, 'SIGTERM');
  } catch {}
});

// ---------------------------------------------------------------------------
// SERVER COMPONENTS
// ---------------------------------------------------------------------------

test.describe('App2 Server Components', () => {
  test('app shell renders from server', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/`, {
      waitUntil: 'networkidle',
    });
    expect(response.status()).toBe(200);

    await expect(page.locator('.sidebar')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.sidebar-header strong')).toContainText(
      'React Notes',
    );
  });

  test('SSR HTML is present before hydration (JS disabled)', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const noJsPage = await context.newPage();

    await noJsPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    await expect(noJsPage.locator('.sidebar-header strong')).toContainText(
      'React Notes',
    );
    // DemoCounterButton is a client component; SSR should still render its HTML.
    await expect(
      noJsPage.locator('[data-testid="demo-counter-button"]'),
    ).toBeVisible({ timeout: 5000 });

    await context.close();
  });
});

// ---------------------------------------------------------------------------
// CLIENT COMPONENTS / HYDRATION
// ---------------------------------------------------------------------------

test.describe('App2 Client Components - Hydration', () => {
  test('SearchField hydrates and is interactive', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    const searchInput = page.locator('#sidebar-search-input');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('app2 search');
    await expect(searchInput).toHaveValue('app2 search');
  });
});

// ---------------------------------------------------------------------------
// SERVER ACTIONS
// ---------------------------------------------------------------------------

test.describe('App2 Server Actions', () => {
  test('incrementCount action is invoked when button is clicked', async ({
    page,
  }) => {
    const actionRequests = [];

    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/react')) {
        actionRequests.push({ url: request.url(), headers: request.headers() });
      }
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    const incrementButton = page.getByRole('button', {
      name: /increment on server/i,
    });
    // Wait for hydration to complete - button should be enabled and interactive
    await expect(incrementButton).toBeEnabled({ timeout: 5000 });

    await incrementButton.click();

    // Wait for action to complete
    await page.waitForTimeout(1000);

    // Check if POST request was made
    expect(actionRequests.length).toBeGreaterThan(0);
    expect(actionRequests[0].headers['rsc-action']).toContain('incrementCount');
  });
});

// ---------------------------------------------------------------------------
// INLINE SERVER ACTIONS
// ---------------------------------------------------------------------------

test.describe('App2 Inline Server Actions', () => {
  test('InlineActionDemo renders and inline actions work', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    await expect(page.getByText('Inline Server Action Demo')).toBeVisible();

    const messageInput = page.locator('input[placeholder="Enter a message"]');
    const addButton = page.getByRole('button', { name: /add message/i });
    const clearButton = page.getByRole('button', { name: /clear all/i });
    const getCountButton = page.getByRole('button', { name: /get count/i });

    await expect(messageInput).toBeVisible();
    await expect(addButton).toBeVisible();

    // Clear, then add two messages and get count
    await clearButton.click();
    await expect(clearButton).not.toBeDisabled({ timeout: 5000 });

    await messageInput.fill('One');
    await addButton.click();
    await expect(addButton).not.toBeDisabled({ timeout: 5000 });

    await messageInput.fill('Two');
    await addButton.click();
    await expect(addButton).not.toBeDisabled({ timeout: 5000 });

    await getCountButton.click();
    await expect(getCountButton).not.toBeDisabled({ timeout: 5000 });

    const status = page.getByText(/Last action result:/);
    await expect(status).toBeVisible({ timeout: 10000 });
    const text = await status.textContent();
    expect(text).toMatch(/Last action result: \d+ message/);
  });
});

// ---------------------------------------------------------------------------
// RSC FLIGHT PROTOCOL (app2)
// ---------------------------------------------------------------------------

test.describe('App2 RSC Flight Protocol', () => {
  test('GET /react returns RSC flight stream', async ({ page }) => {
    const location = { selectedId: null, isEditing: false, searchText: '' };
    const response = await page.request.get(
      `${BASE_URL}/react?location=${encodeURIComponent(JSON.stringify(location))}`,
    );

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('$');
    expect(body).toMatch(/\$L/);
  });
});
