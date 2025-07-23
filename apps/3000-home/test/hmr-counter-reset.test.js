const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const { setTimeout } = require('node:timers/promises');

// Test configuration
const TEST_URL = 'http://localhost:3000';
const HMR_API_URL = 'http://localhost:3000/api/server-hmr';
const SERVER_START_TIMEOUT = 60000; // 60 seconds
const SERVER_READY_TIMEOUT = 30000; // 30 seconds
const CLEANUP_TIMEOUT = 10000; // 10 seconds for cleanup

describe('HMR Counter Reset Integration Tests', () => {
  let serverProcess = null;

  // Helper function to extract counter value from HTML
  async function getCounterValue() {
    const response = await fetch(TEST_URL);
    assert.strictEqual(response.status, 200, 'Server should respond with 200');

    const html = await response.text();
    const counterMatch = html.match(/font-size:36px[^>]*>(\d+)</);
    assert.ok(counterMatch, 'Should find counter value in HTML');

    return parseInt(counterMatch[1]);
  }

  // Helper function to call HMR API
  async function callHMRAPI(action) {
    const response = await fetch(HMR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    assert.strictEqual(
      response.status,
      200,
      `HMR API should respond with 200 for action: ${action}`,
    );
    const result = await response.json();
    assert.strictEqual(
      result.success,
      true,
      `HMR operation should succeed for action: ${action}`,
    );

    return result;
  }

  before(async () => {
    console.log('🚀 Starting Next.js development servers...');

    // Start the development servers
    serverProcess = spawn('pnpm', ['run', 'app:next:dev'], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'development' },
      cwd: '/Users/bytedance/dev/universe',
    });

    // Capture server output for debugging
    let serverOutput = '';
    serverProcess.stdout.on('data', (data) => {
      serverOutput += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      serverOutput += data.toString();
    });

    // Wait for servers to be ready
    const startTime = Date.now();
    while (Date.now() - startTime < SERVER_START_TIMEOUT) {
      try {
        const response = await fetch(TEST_URL, { method: 'HEAD' });
        if (response.status === 200) {
          console.log('✅ Next.js server is ready');
          // Wait a bit more for full initialization
          await setTimeout(3000);
          return;
        }
      } catch (error) {
        // Server not ready yet, continue waiting
      }
      await setTimeout(2000);
    }

    throw new Error(
      `Server failed to start within ${SERVER_START_TIMEOUT}ms. Output: ${serverOutput}`,
    );
  });

  after(async () => {
    if (serverProcess) {
      console.log('🛑 Stopping Next.js development servers...');

      return new Promise((resolve) => {
        const cleanupTimer = setTimeout(() => {
          console.log('⚠️ Cleanup timeout reached, force killing servers');
          if (serverProcess && !serverProcess.killed) {
            serverProcess.kill('SIGKILL');
          }
          resolve();
        }, CLEANUP_TIMEOUT);

        serverProcess.on('exit', () => {
          clearTimeout(cleanupTimer);
          console.log('✅ Servers stopped gracefully');
          resolve();
        });

        // Try graceful shutdown first
        serverProcess.kill('SIGTERM');

        // Force kill after a shorter timeout
        setTimeout(() => {
          if (serverProcess && !serverProcess.killed) {
            console.log('🔧 Force killing servers after graceful timeout');
            serverProcess.kill('SIGKILL');
          }
        }, 3000);
      });
    }
  });

  test('should extract render counter from HTML', async () => {
    const counterValue = await getCounterValue();
    assert.ok(
      counterValue >= 1,
      `Counter should be >= 1, got: ${counterValue}`,
    );
    console.log(`📊 Initial counter value: ${counterValue}`);
  });

  test('should increment counter on multiple requests', async () => {
    // Get initial counter
    const response1 = await fetch(TEST_URL);
    const html1 = await response1.text();
    const counter1 = parseInt(html1.match(/font-size:36px[^>]*>(\d+)/)[1]);

    // Make another request
    const response2 = await fetch(TEST_URL);
    const html2 = await response2.text();
    const counter2 = parseInt(html2.match(/font-size:36px[^>]*>(\d+)/)[1]);

    assert.ok(
      counter2 > counter1,
      `Counter should increment: ${counter1} -> ${counter2}`,
    );
    console.log(`📈 Counter incremented: ${counter1} -> ${counter2}`);
  });

  test('should reset counter via unified reloadAll API', async () => {
    // Make several requests to increase counter
    await fetch(TEST_URL);
    await fetch(TEST_URL);

    // Get counter before reset
    const beforeCounter = await getCounterValue();
    console.log(`📊 Counter before reloadAll: ${beforeCounter}`);
    assert.ok(
      beforeCounter > 1,
      `Counter should be > 1 before reset, got: ${beforeCounter}`,
    );

    // Trigger unified reloadAll
    const hmrResult = await callHMRAPI('reload-all');
    assert.ok(
      hmrResult.result.totalCleared > 0,
      `reloadAll should clear modules, got: ${hmrResult.result.totalCleared}`,
    );

    console.log(
      `🔄 reloadAll cleared ${hmrResult.result.totalCleared} modules using ${hmrResult.result.method}`,
    );

    // Wait for HMR to take effect
    await setTimeout(1000);

    // Get counter after reset
    const afterCounter = await getCounterValue();
    console.log(`📊 Counter after reloadAll: ${afterCounter}`);
    assert.strictEqual(
      afterCounter,
      1,
      `Counter should reset to 1 after reloadAll, got: ${afterCounter}`,
    );
  });

  test('should handle invalid API endpoints correctly', async () => {
    // Test that removed legacy endpoints return proper errors
    const invalidActions = ['clear-all-pages', 'reset-render-counter'];

    for (const action of invalidActions) {
      try {
        const response = await fetch(HMR_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        assert.strictEqual(
          response.status,
          400,
          `${action} should return 400 error`,
        );

        const result = await response.json();
        assert.ok(
          result.error.includes('Unknown action'),
          `Should indicate unknown action for ${action}`,
        );
        assert.ok(
          result.availableActions.includes('reload-all'),
          'Should list reload-all as available action',
        );

        console.log(`✅ Legacy action ${action} properly rejected`);
      } catch (error) {
        assert.fail(
          `Unexpected error testing invalid action ${action}: ${error.message}`,
        );
      }
    }
  });

  test('should validate HMR cache info API', async () => {
    const response = await fetch(HMR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cache-info' }),
    });

    assert.strictEqual(
      response.status,
      200,
      'Cache info API should respond with 200',
    );

    const result = await response.json();
    assert.strictEqual(result.success, true, 'Cache info should succeed');
    assert.ok(result.result.totalCacheSize > 0, 'Should have modules in cache');
    assert.ok(
      result.result.nativeAPIsAvailable.deleteCache,
      'deleteCache API should be available',
    );
    assert.ok(
      result.result.nativeAPIsAvailable.clearModuleContext,
      'clearModuleContext API should be available',
    );

    console.log(
      `📈 Cache info: ${result.result.totalCacheSize} modules, Native APIs: ${JSON.stringify(result.result.nativeAPIsAvailable)}`,
    );
  });

  test('should reset counter via reloadAll query parameter', async () => {
    // Test reloadAll query parameter
    await fetch(TEST_URL); // Increase counter
    await fetch(TEST_URL);

    const beforeCounter = await getCounterValue();
    assert.ok(
      beforeCounter > 1,
      `Counter should be > 1 before reset, got: ${beforeCounter}`,
    );

    // Reset via reloadAll query parameter
    await fetch(`${TEST_URL}?reloadAll=true`);
    await setTimeout(500);

    const afterCounter = await getCounterValue();
    assert.strictEqual(
      afterCounter,
      1,
      `Counter should reset to 1 via reloadAll=true, got: ${afterCounter}`,
    );

    console.log(
      `🔗 Query string reset via reloadAll=true: ${beforeCounter} -> ${afterCounter}`,
    );
  });

  test('should not trigger HMR with invalid query parameters', async () => {
    // Test that legacy query parameters no longer work
    const invalidParams = [
      'clearCache=true',
      'resetCounter=true',
      'hotReloadAll=true',
    ];

    for (const queryParam of invalidParams) {
      await fetch(TEST_URL); // Increase counter
      await fetch(TEST_URL);

      const beforeCounter = await getCounterValue();
      assert.ok(
        beforeCounter > 1,
        `Counter should be > 1 before reset, got: ${beforeCounter}`,
      );

      // Try to reset via invalid query parameter (should not work)
      await fetch(`${TEST_URL}?${queryParam}`);
      await setTimeout(500);

      const afterCounter = await getCounterValue();
      assert.ok(
        afterCounter > 1,
        `Counter should NOT reset via invalid ${queryParam}, got: ${afterCounter}`,
      );

      console.log(
        `🔗 Invalid query ${queryParam} correctly ignored: ${beforeCounter} -> ${afterCounter}`,
      );

      // Clean up by using valid reloadAll
      await fetch(`${TEST_URL}?reloadAll=true`);
      await setTimeout(500);
    }
  });

  test('should reset counter from different pages via query string', async () => {
    // Increase counter from home page
    await fetch(TEST_URL);
    await fetch(TEST_URL);

    const beforeCounter = await getCounterValue();
    assert.ok(
      beforeCounter > 1,
      `Counter should be > 1 before reset, got: ${beforeCounter}`,
    );

    // Reset via shop page with reloadAll query parameter (new unified approach)
    await fetch(`${TEST_URL}/shop?reloadAll=true`);
    await setTimeout(500);

    const afterCounter = await getCounterValue();
    assert.strictEqual(
      afterCounter,
      1,
      `Counter should reset to 1 via shop page query, got: ${afterCounter}`,
    );

    console.log(`🌐 Cross-page reset: ${beforeCounter} -> ${afterCounter}`);
  });

  test('should maintain functionality after multiple HMR cycles', async () => {
    const cycles = 3;
    const methods = ['API', 'query string'];

    for (let i = 0; i < cycles; i++) {
      const method = methods[i % methods.length];
      console.log(`🔄 HMR cycle ${i + 1}/${cycles} using ${method}`);

      // Increase counter
      await fetch(TEST_URL);
      await fetch(TEST_URL);

      const beforeCounter = await getCounterValue();
      assert.ok(
        beforeCounter > 1,
        `Cycle ${i + 1}: Counter should be > 1 before reset`,
      );

      // Reset using different methods
      if (method === 'API') {
        await callHMRAPI('reload-all');
      } else if (method === 'query string') {
        await fetch(`${TEST_URL}?reloadAll=true`);
      }

      await setTimeout(500);

      // Verify reset
      const afterCounter = await getCounterValue();
      assert.strictEqual(
        afterCounter,
        1,
        `Cycle ${i + 1}: Counter should reset to 1 using ${method}`,
      );
    }

    console.log(
      `✅ Successfully completed ${cycles} HMR cycles with reloadAll`,
    );
  });
});
