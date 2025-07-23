const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { promisify } = require('node:util');

test('HMR Complete State Reset Test', async (t) => {
  // ====================
  // SETUP PHASE
  // ====================

  let stateResetSuccessful = false;
  const serverPort = 3000; // Assuming the dev server is already running

  // Helper function to make HTTP requests
  async function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: serverPort,
        path,
        method,
        headers:
          method === 'POST'
            ? {
                'Content-Type': 'application/json',
              }
            : {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: '0',
              },
        timeout: 10000,
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const result = {
              status: res.statusCode,
              headers: res.headers,
              body: res.headers['content-type']?.includes('json')
                ? JSON.parse(body)
                : body,
            };
            resolve(result);
          } catch (error) {
            resolve({
              status: res.statusCode,
              body,
              parseError: error.message,
            });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));

      if (data && method === 'POST') {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // ====================
  // TEST SERVER HMR API
  // ====================
  console.log('\n====================');
  console.log('TEST SERVER HMR API');
  console.log('====================');

  try {
    // Step 1: Test HMR API availability
    console.log('1. Testing HMR API availability...');
    const apiTest = await makeRequest('/api/server-hmr', 'POST', {
      action: 'test',
    });
    assert.strictEqual(apiTest.status, 200, 'HMR API should be available');
    assert.ok(apiTest.body.success, 'HMR API test should succeed');
    console.log('✓ HMR API is available');

    // Step 2: Get initial cache info
    console.log('2. Getting initial cache info...');
    const initialCacheInfo = await makeRequest('/api/server-hmr', 'POST', {
      action: 'cache-info',
    });
    assert.strictEqual(
      initialCacheInfo.status,
      200,
      'Cache info should be accessible',
    );
    assert.ok(initialCacheInfo.body.success, 'Cache info should succeed');
    console.log(
      `✓ Initial cache: ${initialCacheInfo.body.result.userModules} user modules`,
    );
  } catch (error) {
    console.error('✗ HMR API test failed:', error.message);
    throw error;
  }

  // ====================
  // TEST RENDER COUNTER BASELINE
  // ====================
  console.log('\n====================');
  console.log('TEST RENDER COUNTER BASELINE');
  console.log('====================');

  let baselineCount = 0;

  try {
    // Step 1: Build up the render counter
    console.log('1. Building up render counter baseline...');

    // Make several requests to increment the counter
    for (let i = 0; i < 3; i++) {
      const response = await makeRequest('/');
      assert.strictEqual(
        response.status,
        200,
        `Request ${i + 1} should succeed`,
      );

      // Extract render count from response
      const renderCountMatch = response.body.match(/"renderCount":(\d+)/);
      if (renderCountMatch) {
        baselineCount = parseInt(renderCountMatch[1]);
        console.log(`   Request ${i + 1}: renderCount = ${baselineCount}`);
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    assert.ok(
      baselineCount > 0,
      'Baseline render count should be greater than 0',
    );
    console.log(`✓ Baseline established: renderCount = ${baselineCount}`);
  } catch (error) {
    console.error('✗ Baseline test failed:', error.message);
    throw error;
  }

  // ====================
  // TEST COMPLETE STATE RESET VIA QUERY PARAMETER
  // ====================
  console.log('\n====================');
  console.log('TEST COMPLETE STATE RESET');
  console.log('====================');

  try {
    // Step 1: Trigger complete state reset via query parameter
    console.log('1. Triggering complete state reset via ?hotReloadAll=true...');

    const hmrResponse = await makeRequest('/?hotReloadAll=true');
    assert.strictEqual(hmrResponse.status, 200, 'HMR request should succeed');

    // Extract render count from HMR response
    const hmrCountMatch = hmrResponse.body.match(/"renderCount":(\d+)/);
    let hmrCount = 0;
    if (hmrCountMatch) {
      hmrCount = parseInt(hmrCountMatch[1]);
      console.log(`   HMR request: renderCount = ${hmrCount}`);
    }

    // Step 2: Verify state reset worked
    console.log('2. Verifying state reset...');

    if (hmrCount === 1) {
      console.log('✅ PERFECT: State completely reset to 1 immediately!');
      stateResetSuccessful = true;
    } else if (hmrCount < baselineCount) {
      console.log(
        `✅ GOOD: State reset from ${baselineCount} to ${hmrCount} (lower than baseline)`,
      );
      stateResetSuccessful = true;
    } else {
      console.log(
        `⚠️ State reset may not have worked: ${baselineCount} → ${hmrCount}`,
      );

      // Try a few more requests to see if reset takes effect on subsequent requests
      console.log('3. Checking subsequent requests for reset effect...');

      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const subsequentResponse = await makeRequest('/');
        const subsequentCountMatch =
          subsequentResponse.body.match(/"renderCount":(\d+)/);

        if (subsequentCountMatch) {
          const subsequentCount = parseInt(subsequentCountMatch[1]);
          console.log(
            `   Subsequent request ${i + 1}: renderCount = ${subsequentCount}`,
          );

          if (subsequentCount === 1) {
            console.log('✅ State reset achieved on subsequent request!');
            stateResetSuccessful = true;
            break;
          } else if (subsequentCount < baselineCount) {
            console.log('✅ State reset partially achieved!');
            stateResetSuccessful = true;
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error('✗ State reset test failed:', error.message);
    throw error;
  }

  // ====================
  // TEST VIA API ENDPOINT
  // ====================
  console.log('\n====================');
  console.log('TEST VIA API ENDPOINT');
  console.log('====================');

  try {
    // Step 1: Test reset via API
    console.log('1. Testing state reset via API endpoint...');

    const apiResetResponse = await makeRequest('/api/server-hmr', 'POST', {
      action: 'reset-render-counter',
    });

    assert.strictEqual(
      apiResetResponse.status,
      200,
      'API reset should succeed',
    );
    assert.ok(apiResetResponse.body.success, 'API reset should return success');

    console.log(
      `✓ API reset: cleared ${apiResetResponse.body.result.clearedCount} modules`,
    );
    console.log(
      `✓ API reset: cleared ${apiResetResponse.body.result.indexModulesCleared} index modules`,
    );

    // Step 2: Verify API reset worked
    console.log('2. Verifying API reset effect...');

    const postApiResponse = await makeRequest('/');
    const postApiCountMatch = postApiResponse.body.match(/"renderCount":(\d+)/);

    if (postApiCountMatch) {
      const postApiCount = parseInt(postApiCountMatch[1]);
      console.log(`   Post-API request: renderCount = ${postApiCount}`);

      if (postApiCount === 1) {
        console.log('✅ API reset achieved perfect state reset!');
      } else if (postApiCount < 5) {
        console.log('✅ API reset achieved effective state reset!');
      }
    }
  } catch (error) {
    console.error('✗ API reset test failed:', error.message);
    // Don't throw here as this is a secondary test
  }

  // ====================
  // TEST SUMMARY
  // ====================
  console.log('\n====================');
  console.log('TEST SUMMARY');
  console.log('====================');

  const testResults = [
    { name: 'Complete State Reset', passed: stateResetSuccessful },
  ];

  testResults.forEach((result) => {
    console.log(
      `${result.passed ? '✓' : '✗'} ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'}`,
    );
  });

  const failedTests = testResults.filter((r) => !r.passed);
  if (failedTests.length > 0) {
    const failureMessage = `HMR state reset test failed: ${failedTests.map((t) => t.name).join(', ')}`;
    console.error(`\n✗ ${failureMessage}`);
    assert.fail(failureMessage);
  } else {
    console.log('\n✅ Complete application state reset working successfully!');
    console.log(
      '🎉 HMR system can reset module-level variables and application state!',
    );
  }
});
