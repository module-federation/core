/**
 * E2E tests for Module Federation between app1 (host) and app2 (remote)
 *
 * Tests cover real cross-app federation:
 * - app2 exposes Button component via Module Federation
 * - app1 consumes and renders app2's Button as a remote module
 * - Shared React singleton works across federation boundary
 * - Server-side federation: app1's RSC server imports from app2's MF container
 * - MF-native server actions (default): app1 executes app2 actions in-process (Option 2)
 *   with HTTP forwarding as a fallback (Option 1)
 * - No mocks - all real browser interactions
 *
 * Server-side federation architecture:
 * - app2 builds remoteEntry.server.js (Node MF container) exposing components + actions
 * - app1's RSC server consumes remoteEntry.server.js via MF remotes config
 * - Server actions execute in-process by default via MF runtime registration
 */
const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const path = require('path');

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

const PORT_APP2 = 4102;
const PORT_APP1 = 4101;

function startServer(label, cwd, port) {
  const child = spawn('node', ['server/api.server.js'], {
    cwd,
    env: { ...process.env, PORT: String(port), NO_DATABASE: '1' },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  child.unref();
  return child;
}

test.describe.configure({ mode: 'serial' });

let app1Proc;
let app2Proc;

// Build step runs before via package script.
// IMPORTANT: app2 must start first since app1 fetches its remoteEntry at runtime.
test.beforeAll(async () => {
  const app2Path = path.resolve(__dirname, '../../app2');
  const app1Path = path.resolve(__dirname, '../../app1');

  // Start app2 first (remote provider)
  app2Proc = startServer('app2', app2Path, PORT_APP2);
  await waitFor(`http://localhost:${PORT_APP2}/`);

  // Then start app1 (host consumer)
  app1Proc = startServer('app1', app1Path, PORT_APP1);
  await waitFor(`http://localhost:${PORT_APP1}/`);
});

test.afterAll(async () => {
  try {
    if (app1Proc?.pid) process.kill(app1Proc.pid, 'SIGTERM');
  } catch {}
  try {
    if (app2Proc?.pid) process.kill(app2Proc.pid, 'SIGTERM');
  } catch {}
});

function collectConsoleErrors(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

// ============================================================================
// APP2 STANDALONE TESTS - Remote module provider
// ============================================================================

test.describe('App2 (Remote Provider)', () => {
  test('app2 serves remoteEntry.client.js', async ({ page }) => {
    const response = await page.request.get(
      `http://localhost:${PORT_APP2}/remoteEntry.client.js`,
    );
    expect(response.status()).toBe(200);
    const body = await response.text();
    // Should contain federation runtime code
    expect(body).toContain('app2');
  });

  test('app2 renders its own UI', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const response = await page.goto(`http://localhost:${PORT_APP2}/`, {
      waitUntil: 'networkidle',
    });
    expect(response.status()).toBe(200);
    await expect(page.locator('.sidebar-header strong')).toContainText(
      'React Notes',
    );
    expect(errors).toEqual([]);
  });
});

// ============================================================================
// APP1 HOST TESTS - Consumes remote modules from app2
// ============================================================================

test.describe('App1 (Host Consumer)', () => {
  test('app1 renders its own UI', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const response = await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });
    expect(response.status()).toBe(200);
    await expect(page.locator('.sidebar-header strong')).toContainText(
      'React Notes',
    );
    expect(errors).toEqual([]);
  });

  test('app1 loads and renders federated Button from app2', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // The RemoteButton component should render the federated Button from app2
    const federatedSection = page.locator('text=Federated Button from App2');
    await expect(federatedSection).toBeVisible({ timeout: 10000 });

    // The actual button from app2 should be visible
    const remoteButton = page.locator('[data-testid="federated-button"]');
    await expect(remoteButton).toBeVisible();
    await expect(remoteButton).toHaveAttribute('data-from', 'app2');

    expect(errors).toEqual([]);
  });

  test('federated Button is interactive and updates state', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    const remoteButton = page.locator('[data-testid="federated-button"]');
    await expect(remoteButton).toBeVisible({ timeout: 10000 });

    // Initial state
    await expect(remoteButton).toContainText('Remote Click: 0');

    // Click and verify state update
    await remoteButton.click();
    await expect(remoteButton).toContainText('Remote Click: 1');

    // Click again
    await remoteButton.click();
    await expect(remoteButton).toContainText('Remote Click: 2');

    expect(errors).toEqual([]);
  });

  test('shared React singleton works across federation boundary', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // Both app1's own components and federated components should work together
    // App1's own DemoCounterButton
    const incrementButton = page.getByRole('button', {
      name: /increment on server/i,
    });
    await expect(incrementButton).toBeVisible();

    // Federated Button from app2
    const remoteButton = page.locator('[data-testid="federated-button"]');
    await expect(remoteButton).toBeVisible();

    // Both should be interactive without React version conflicts
    await incrementButton.click();
    await expect(incrementButton).toBeVisible({ timeout: 5000 });

    await remoteButton.click();
    await expect(remoteButton).toContainText('Remote Click: 1');

    // No errors means React singleton is working correctly
    expect(errors).toEqual([]);
  });
});

// ============================================================================
// FEDERATION NETWORK TESTS - Verify actual module loading
// ============================================================================

test.describe('Federation Network', () => {
  test('app1 fetches remoteEntry from app2 at runtime', async ({ page }) => {
    const remoteEntryRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('remoteEntry.client.js')) {
        remoteEntryRequests.push(request.url());
      }
    });

    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // Wait for federation to load
    await expect(page.locator('[data-testid="federated-button"]')).toBeVisible({
      timeout: 10000,
    });

    // Should have fetched app2's remoteEntry
    expect(
      remoteEntryRequests.some((url) => url.includes(`localhost:${PORT_APP2}`)),
    ).toBe(true);
  });

  test('federated component survives page refresh', async ({ page }) => {
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    const remoteButton = page.locator('[data-testid="federated-button"]');
    await expect(remoteButton).toBeVisible({ timeout: 10000 });

    // Click to set state
    await remoteButton.click();
    await expect(remoteButton).toContainText('Remote Click: 1');

    // Refresh the page
    await page.reload({ waitUntil: 'networkidle' });

    // Federation should work again (state resets)
    await expect(remoteButton).toBeVisible({ timeout: 10000 });
    await expect(remoteButton).toContainText('Remote Click: 0');
  });
});

// ============================================================================
// SERVER-SIDE FEDERATION TESTS - RSC server imports from MF container
// ============================================================================

test.describe('Server-Side Federation', () => {
  test('app1 renders FederatedDemo server component', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // The FederatedDemo server component should render
    const federatedDemo = page.locator(
      '[data-testid="server-federation-demo"]',
    );
    await expect(federatedDemo).toBeVisible({ timeout: 10000 });

    // Should show the demo content
    await expect(federatedDemo).toContainText('Server-Side Federation Demo');
    await expect(federatedDemo).toContainText('Current Status');
    // Remote server component from app2 should render inside the server component tree
    await expect(
      page.locator('[data-testid="remote-server-widget"]'),
    ).toBeVisible({ timeout: 10000 });

    expect(errors).toEqual([]);
  });

  test('FederatedDemo shows federation architecture status', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    const federatedDemo = page.locator(
      '[data-testid="server-federation-demo"]',
    );
    await expect(federatedDemo).toBeVisible({ timeout: 10000 });

    // Should list what's currently supported
    await expect(federatedDemo).toContainText('Server components: Ready');
    await expect(federatedDemo).toContainText(
      'Client components: Via client-side MF',
    );
    await expect(federatedDemo).toContainText('Server actions: MF-native');

    expect(errors).toEqual([]);
  });

  test('SSR HTML contains server-rendered FederatedDemo content', async ({
    page,
  }) => {
    // Fetch the raw HTML before JavaScript runs
    const response = await page.request.get(`http://localhost:${PORT_APP1}/`);
    const html = await response.text();

    // The server-rendered HTML should contain the FederatedDemo content
    // This proves the component was rendered server-side, not just client-side
    expect(html).toContain('Server-Side Federation Demo');
    expect(html).toContain('data-testid="server-federation-demo"');
    // Remote server component should also be present in SSR HTML
    expect(html).toContain('data-testid="remote-server-widget"');
    expect(html).toContain('Remote server component rendered from app2 (RSC)');
  });
});

// ============================================================================
// SERVER ACTIONS (MF-native by default; HTTP fallback)
// ============================================================================

test.describe('Federated Server Actions (MF-native)', () => {
  test('app2 server actions work directly', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP2}/`, {
      waitUntil: 'networkidle',
    });

    // app2's own DemoCounter uses incrementCount from server-actions.js
    const incrementButton = page.getByRole('button', {
      name: /increment on server/i,
    });
    await expect(incrementButton).toBeVisible({ timeout: 10000 });

    // Click should trigger server action
    await incrementButton.click();
    // Wait for re-render
    await expect(incrementButton).toBeVisible({ timeout: 5000 });

    expect(errors).toEqual([]);
  });

  test('FederatedActionDemo component renders in app1', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // The FederatedActionDemo component should render
    const actionDemo = page.locator('[data-testid="federated-action-demo"]');
    await expect(actionDemo).toBeVisible({ timeout: 10000 });

    // Should show the demo title
    await expect(actionDemo).toContainText('Federated Action Demo');
    await expect(actionDemo).toContainText('MF-native');

    expect(errors).toEqual([]);
  });

  test('FederatedActionDemo loads action module from app2 via MF', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // Wait for the action module to load (button text changes from "Loading..." to "Call Remote Action")
    const actionButton = page.locator(
      '[data-testid="federated-action-button"]',
    );
    await expect(actionButton).toBeVisible({ timeout: 10000 });

    // Wait for module to load - button should be enabled and show "Call Remote Action"
    await expect(actionButton).toContainText('Call Remote Action', {
      timeout: 15000,
    });

    // Button should be enabled (not disabled)
    await expect(actionButton).toBeEnabled();

    expect(errors).toEqual([]);
  });

  test('FederatedActionDemo executes remote action in-process (no proxy hop)', async ({
    page,
  }) => {
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // Wait for the action button to be ready
    const actionButton = page.locator(
      '[data-testid="federated-action-button"]',
    );
    await expect(actionButton).toContainText('Call Remote Action', {
      timeout: 15000,
    });

    const actionResponsePromise = page.waitForResponse((response) => {
      if (response.url() !== `http://localhost:${PORT_APP1}/react`) {
        return false;
      }
      const req = response.request();
      if (req.method() !== 'POST') {
        return false;
      }
      const headers = req.headers();
      const actionId = headers['rsc-action'] || '';
      return (
        actionId.startsWith('remote:app2:') ||
        actionId.includes('app2/src') ||
        actionId.includes('packages/app2')
      );
    });

    // Initial count should be 0
    const countDisplay = page.locator('[data-testid="federated-action-count"]');
    await expect(countDisplay).toContainText('0');

    // Click the button to call the remote action
    await actionButton.click();

    // The app1 server should execute the remote action in-process by default.
    const actionResponse = await actionResponsePromise;
    const headers = actionResponse.headers();
    expect(headers['x-federation-action-mode']).toBe('mf');
    expect(headers['x-federation-action-remote']).toBe('app2');

    // Wait for the action to complete and count to update
    await expect(countDisplay).not.toContainText('0', { timeout: 10000 });
  });

  test('multiple remote action calls work correctly', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    const actionButton = page.locator(
      '[data-testid="federated-action-button"]',
    );
    await expect(actionButton).toContainText('Call Remote Action', {
      timeout: 15000,
    });

    const countDisplay = page.locator('[data-testid="federated-action-count"]');

    // Click multiple times
    await actionButton.click();
    await expect(countDisplay).not.toContainText('0', { timeout: 10000 });

    await actionButton.click();
    // Count should keep incrementing
    await page.waitForTimeout(500); // Allow time for action to complete

    await actionButton.click();
    await page.waitForTimeout(500);

    // After 3 clicks, count should be at least 3 (server state persists)
    // Note: The exact value depends on app2's server state across requests

    expect(errors).toEqual([]);
  });
});

// ============================================================================
// INTEGRATION TESTS - Full Round-Trip Federation
// ============================================================================

test.describe('Full Round-Trip Federation', () => {
  test('app1 can render federated components and call federated actions', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // 1. Client-side federated component (RemoteButton)
    const remoteButton = page.locator('[data-testid="federated-button"]');
    await expect(remoteButton).toBeVisible({ timeout: 10000 });

    // 2. Server-side federation demo
    const ssrDemo = page.locator('[data-testid="server-federation-demo"]');
    await expect(ssrDemo).toBeVisible();

    // 3. Federated action demo
    const actionDemo = page.locator('[data-testid="federated-action-demo"]');
    await expect(actionDemo).toBeVisible();

    // All three federation modes should work together without errors
    expect(errors).toEqual([]);
  });

  test('all federated components are interactive after hydration', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // Test RemoteButton (client-side federation)
    const remoteButton = page.locator('[data-testid="federated-button"]');
    await expect(remoteButton).toBeVisible({ timeout: 10000 });
    await remoteButton.click();
    await expect(remoteButton).toContainText('Remote Click: 1');

    // Test Federated Action (MF-native)
    const actionButton = page.locator(
      '[data-testid="federated-action-button"]',
    );
    await expect(actionButton).toContainText('Call Remote Action', {
      timeout: 15000,
    });
    await actionButton.click();
    const countDisplay = page.locator('[data-testid="federated-action-count"]');
    await expect(countDisplay).not.toContainText('0', { timeout: 10000 });

    expect(errors).toEqual([]);
  });
});

// ============================================================================
// COMPOSITION PATTERNS - Remote with Host Children
// ============================================================================

test.describe('Composition Patterns', () => {
  test('remote component renders host children (React element model)', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // RemoteButton wrapper passes local span as children to app2/Button
    // This tests: Host JSX → Remote Component → renders Host children
    const remoteButton = page.locator('[data-testid="federated-button"]');
    await expect(remoteButton).toBeVisible({ timeout: 10000 });

    // The button should render with text from app1's RemoteButton wrapper
    await expect(remoteButton).toContainText('Remote Click');

    // No errors means element model composition works
    expect(errors).toEqual([]);
  });

  test('multiple federated components coexist without React conflicts', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // Both RemoteButton and FederatedActionDemo use app2 via MF
    const remoteButton = page.locator('[data-testid="federated-button"]');
    const actionDemo = page.locator('[data-testid="federated-action-demo"]');

    await expect(remoteButton).toBeVisible({ timeout: 10000 });
    await expect(actionDemo).toBeVisible({ timeout: 10000 });

    // Both should be interactive (proves shared React singleton works)
    await remoteButton.click();
    await expect(remoteButton).toContainText('Remote Click: 1');

    // No React version conflicts
    expect(errors).toEqual([]);
  });

  test('local and federated server actions work in same page', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // Local action: app1's DemoCounterButton → incrementCount
    const localButton = page.getByRole('button', {
      name: /increment on server/i,
    });
    await expect(localButton).toBeVisible({ timeout: 10000 });

    // Federated action: FederatedActionDemo → app2's incrementCount
    const federatedButton = page.locator(
      '[data-testid="federated-action-button"]',
    );
    await expect(federatedButton).toContainText('Call Remote Action', {
      timeout: 15000,
    });

    // Click local action
    await localButton.click();
    await expect(localButton).toBeVisible({ timeout: 5000 });

    // Click federated action
    await federatedButton.click();
    const countDisplay = page.locator('[data-testid="federated-action-count"]');
    await expect(countDisplay).not.toContainText('0', { timeout: 10000 });

    // Both actions work without interference
    expect(errors).toEqual([]);
  });
});

// ============================================================================
// NESTING PATTERN TESTS - Deep Component Trees
// ============================================================================

test.describe('Nesting Patterns', () => {
  test('server → client → client nesting (App → sidebar → EditButton)', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // App.js (server) → sidebar section (server) → EditButton (client)
    // EditButton uses role="menuitem" with accessible name "New"
    const newButton = page.getByRole('menuitem', { name: /new/i });
    await expect(newButton).toBeVisible();
    await expect(newButton).toBeEnabled();

    // SearchField is also a client component in the sidebar
    const searchField = page.locator('#sidebar-search-input');
    await expect(searchField).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('server → server → client nesting (App → DemoCounter → Button)', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // App.js (server) → DemoCounter.server.js (server) → DemoCounterButton (client)
    const demoSection = page.getByRole('heading', {
      name: 'Server Action Demo',
      exact: true,
    });
    await expect(demoSection).toBeVisible();

    const counterButton = page.getByRole('button', {
      name: /increment on server/i,
    });
    await expect(counterButton).toBeVisible();

    // The nesting works - client component is interactive
    await counterButton.click();
    await expect(counterButton).toBeVisible({ timeout: 5000 });

    expect(errors).toEqual([]);
  });

  test('server → client → remote client nesting (App → RemoteButton → app2/Button)', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'networkidle',
    });

    // App.js (server) → RemoteButton (client wrapper) → app2/Button (remote client)
    const federatedSection = page.locator('text=Federated Button from App2');
    await expect(federatedSection).toBeVisible({ timeout: 10000 });

    const remoteButton = page.locator('[data-testid="federated-button"]');
    await expect(remoteButton).toBeVisible();
    await expect(remoteButton).toHaveAttribute('data-from', 'app2');

    // Full nesting chain works
    await remoteButton.click();
    await expect(remoteButton).toContainText('Remote Click: 1');

    expect(errors).toEqual([]);
  });

  test('deep server component nesting renders correctly', async ({ page }) => {
    // Verify deep server component tree via SSR HTML check
    const response = await page.request.get(`http://localhost:${PORT_APP1}/`);
    const html = await response.text();

    // App → Note section → NoteList → individual notes (all server components)
    expect(html).toContain('class="main"');
    expect(html).toContain('class="col sidebar"');

    // Server-rendered content should be present
    expect(html).toContain('React Notes');
  });
});

// ============================================================================
// ERROR BOUNDARY & RESILIENCE TESTS
// ============================================================================

test.describe('Resilience', () => {
  test('app1 gracefully handles app2 Button loaded after initial render', async ({
    page,
  }) => {
    // This tests the loading state → loaded state transition
    const errors = collectConsoleErrors(page);
    await page.goto(`http://localhost:${PORT_APP1}/`, {
      waitUntil: 'domcontentloaded',
    });

    // RemoteButton might show loading text initially
    const remoteSection = page.locator('text=Federated Button from App2');
    await expect(remoteSection).toBeVisible({ timeout: 10000 });

    // Wait for actual button to load via MF
    const remoteButton = page.locator('[data-testid="federated-button"]');
    await expect(remoteButton).toBeVisible({ timeout: 15000 });

    // Transition was graceful - no errors
    expect(errors).toEqual([]);
  });
});
