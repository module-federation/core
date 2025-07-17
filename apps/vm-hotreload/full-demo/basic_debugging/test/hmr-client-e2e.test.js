const {
  describe,
  it,
  before,
  after,
  beforeEach,
  afterEach,
} = require('node:test');
const assert = require('node:assert');
const { spawn, exec } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');

const execAsync = promisify(exec);

describe('HMR Client Demo End-to-End Tests', () => {
  const projectRoot = path.join(__dirname, '..');
  const distDir = path.join(projectRoot, 'dist');
  const hmrClientDemoPath = path.join(distDir, 'hmr-client-demo.js');
  let buildSuccessful = false;

  before(async () => {
    console.log('🔧 Setting up HMR Client Demo E2E tests...');

    // Ensure we're in the right directory
    process.chdir(projectRoot);

    // Clean dist directory
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }

    // Build the project once for all tests
    try {
      console.log('📦 Building webpack bundle for HMR Client Demo testing...');
      const { stdout, stderr } = await execAsync('npm run build', {
        cwd: projectRoot,
        timeout: 30000,
      });

      // Check if build completed successfully
      if (fs.existsSync(hmrClientDemoPath)) {
        buildSuccessful = true;
        console.log('✅ Webpack build completed successfully');

        // Verify the built file contains expected content
        const builtContent = fs.readFileSync(hmrClientDemoPath, 'utf8');
        console.log(
          '📝 Built HMR Client Demo file size:',
          Math.round(builtContent.length / 1024),
          'KB',
        );
        console.log(
          '🔍 Webpack runtime detected:',
          builtContent.includes('__webpack_require__'),
        );
        console.log(
          '🔥 HMR support detected:',
          builtContent.includes('module.hot'),
        );
        console.log(
          '📚 HMR Client library detected:',
          builtContent.includes('HMRClient') ||
            builtContent.includes('createHMRClient'),
        );
      } else {
        throw new Error(
          'Built HMR Client Demo file does not exist after build',
        );
      }
    } catch (error) {
      console.error('❌ Build failed during setup:', error.message);
      if (error.stdout) console.error('Build stdout:', error.stdout);
      if (error.stderr) console.error('Build stderr:', error.stderr);
      throw error;
    }
  });

  after(() => {
    console.log('🧹 Cleaning up HMR Client Demo E2E test artifacts...');
    // Clean up dist directory
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
      console.log('✅ Dist directory cleaned');
    }
  });

  describe('HMR Client Demo Build Verification', () => {
    it('should have built the HMR Client Demo successfully', () => {
      assert.ok(
        buildSuccessful,
        'Build should have completed successfully in setup',
      );
      assert.ok(
        fs.existsSync(hmrClientDemoPath),
        'Built hmr-client-demo.js should exist',
      );
    });

    it('should create proper webpack bundle with HMR Client library', () => {
      assert.ok(buildSuccessful, 'Build should have completed successfully');
      assert.ok(
        fs.existsSync(hmrClientDemoPath),
        'hmr-client-demo.js should be built',
      );

      const builtContent = fs.readFileSync(hmrClientDemoPath, 'utf8');

      // Check for webpack runtime
      assert.ok(
        builtContent.includes('__webpack_require__'),
        'Should contain webpack require',
      );
      assert.ok(
        builtContent.includes('__webpack_modules__'),
        'Should contain webpack modules',
      );

      // Check for HMR runtime
      assert.ok(
        builtContent.includes('module.hot'),
        'Should contain module.hot',
      );

      // Check for HMR Client library
      assert.ok(
        builtContent.includes('HMRClient') ||
          builtContent.includes('createHMRClient'),
        'Should contain HMR Client library',
      );

      // Check for demo-specific content
      assert.ok(
        builtContent.includes('HMR Client Demo'),
        'Should contain demo-specific content',
      );
    });
  });

  describe('HMR Client Demo Execution', () => {
    it('should start HMR Client Demo successfully', (t, done) => {
      if (!buildSuccessful) {
        done(new Error('Build was not successful'));
        return;
      }

      let completed = false;
      const safeComplete = (error) => {
        if (completed) return;
        completed = true;
        done(error);
      };

      const child = spawn('node', [hmrClientDemoPath], {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, HMR_DEMO_AUTOSTART: 'true' },
      });

      let stdout = '';
      let stderr = '';
      let demoStarted = false;
      let hasInitialStatus = false;

      child.stdout.on('data', (data) => {
        stdout += data.toString();

        if (stdout.includes('HMR Client Demo Starting')) {
          demoStarted = true;
          console.log('✅ HMR Client Demo started');
        }

        if (stdout.includes('Initial HMR Client Status')) {
          hasInitialStatus = true;
          console.log('✅ HMR Client Demo completed');
          // Kill after we see the initial status (don't wait for full completion)
          setTimeout(() => {
            if (!child.killed) {
              child.kill('SIGTERM');
            }
          }, 2000);
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        try {
          assert.ok(demoStarted, 'Demo should have started');
          assert.ok(hasInitialStatus, 'Demo should show initial status');

          // Verify key demo functionality
          assert.ok(
            stdout.includes('Initial HMR Client Status'),
            'Should show initial status',
          );

          if (
            stderr &&
            !stderr.includes('DeprecationWarning') &&
            !stderr.includes('ENOENT')
          ) {
            console.warn('HMR Client Demo stderr:', stderr);
          }

          safeComplete();
        } catch (error) {
          console.log('Demo stdout:', stdout);
          console.log('Demo stderr:', stderr);
          safeComplete(error);
        }
      });

      child.on('error', (error) => {
        safeComplete(error);
      });

      // Shorter timeout since we're not waiting for full completion
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
          safeComplete(new Error('HMR Client Demo timed out'));
        }
      }, 10000);
    });
  });

  describe('HMR Client Library Integration', () => {
    it('should demonstrate HMR Client library features in bundle', async (t) => {
      if (!buildSuccessful) {
        throw new Error('Build was not successful');
      }

      try {
        // Test direct import of webpack bundle
        const hmrDemo = await require(hmrClientDemoPath);

        // Verify basic structure
        assert.ok(hmrDemo, 'Should export demo object');
        assert.ok(hmrDemo.hmrClient, 'Should export hmrClient');
        assert.ok(hmrDemo.demoAPI, 'Should export demoAPI');

        // Test HMR Client functionality
        const client = hmrDemo.hmrClient;
        const status = client.getStatus();

        assert.strictEqual(
          typeof status,
          'object',
          'Should return status object',
        );
        assert.strictEqual(
          status.isAttached,
          true,
          'Should show client as attached',
        );
        assert.strictEqual(
          status.hasWebpackRequire,
          true,
          'Should have webpack runtime in built bundle',
        );
        assert.strictEqual(
          status.hasModuleHot,
          true,
          'Should have module.hot support',
        );
        assert.strictEqual(
          typeof status.webpackHash,
          'string',
          'Should have webpack hash',
        );

        // Test client methods
        const stats = client.getStats();
        assert.strictEqual(
          typeof stats,
          'object',
          'Should return stats object',
        );
        assert.strictEqual(
          typeof stats.totalUpdates,
          'number',
          'Should track total updates',
        );

        const chunks = client.getCurrentChunks();
        assert.ok(Array.isArray(chunks), 'Should return chunks array');

        const modules = client.getCurrentModules();
        assert.ok(Array.isArray(modules), 'Should return modules array');
        assert.ok(modules.length > 0, 'Should have modules');

        // Test Demo API functionality
        const demoAPI = hmrDemo.demoAPI;

        const greeting = demoAPI.greet('Tester');
        assert.ok(
          greeting.includes('Hello, Tester'),
          'Should generate greeting',
        );
        assert.ok(greeting.includes('v1.0.0'), 'Should include version');

        const calcResult = demoAPI.calculate(10);
        assert.strictEqual(
          typeof calcResult,
          'object',
          'Should return calculation object',
        );
        assert.strictEqual(
          calcResult.originalInput,
          10,
          'Should preserve original input',
        );
        assert.strictEqual(
          calcResult.processed,
          30,
          'Should process calculation correctly',
        );
        assert.strictEqual(
          calcResult.version,
          '1.0.0',
          'Should include version',
        );

        const testData = [{ id: 1, name: 'Test' }];
        const processed = demoAPI.processData(testData);
        assert.ok(Array.isArray(processed), 'Should return processed array');
        assert.strictEqual(
          processed[0].processed,
          true,
          'Should mark as processed',
        );
        assert.strictEqual(processed[0].version, '1.0.0', 'Should add version');

        const demoStatus = demoAPI.getStatus();
        assert.strictEqual(
          typeof demoStatus,
          'object',
          'Should return demo status',
        );
        assert.strictEqual(
          demoStatus.version,
          '1.0.0',
          'Should have correct version',
        );

        console.log(
          '✅ HMR Client Demo library integration verified via direct testing',
        );
      } catch (error) {
        throw new Error(`Direct bundle test failed: ${error.message}`);
      }
    });

    it('should handle HMR Client updates in bundle environment', async (t) => {
      if (!buildSuccessful) {
        throw new Error('Build was not successful');
      }

      try {
        // Test direct import and HMR update functionality
        const hmrDemo = await require(hmrClientDemoPath);
        const client = hmrDemo.hmrClient;

        assert.ok(client, 'Should have HMR client');

        // Test initial status
        const initialStatus = client.getStatus();
        assert.strictEqual(
          initialStatus.isAttached,
          true,
          'Should show client as attached',
        );
        assert.strictEqual(
          initialStatus.hasWebpackRequire,
          true,
          'Should have webpack runtime in bundle',
        );
        assert.strictEqual(
          initialStatus.hasModuleHot,
          true,
          'Should have module.hot support',
        );

        // Test update checking functionality
        const checkResult = await client.checkForUpdates();
        assert.strictEqual(
          typeof checkResult,
          'object',
          'Should return check result object',
        );
        assert.strictEqual(
          typeof checkResult.success,
          'boolean',
          'Should have success property',
        );
        assert.strictEqual(
          typeof checkResult.reason,
          'string',
          'Should have reason property',
        );

        // Test force update functionality
        const forceResult = await client.forceUpdate();
        assert.strictEqual(
          typeof forceResult,
          'object',
          'Should return force result object',
        );
        assert.strictEqual(
          typeof forceResult.success,
          'boolean',
          'Should have success property',
        );
        assert.ok(
          forceResult.updateId || forceResult.reason,
          'Should have updateId or reason',
        );

        // Test stats tracking after operations
        const finalStats = client.getStats();
        assert.strictEqual(
          typeof finalStats.totalUpdates,
          'number',
          'Should track total updates',
        );
        assert.strictEqual(
          typeof finalStats.successfulUpdates,
          'number',
          'Should track successful updates',
        );
        assert.strictEqual(
          typeof finalStats.failedUpdates,
          'number',
          'Should track failed updates',
        );

        // Test webpack integration status after operations
        const finalStatus = client.getStatus();
        assert.strictEqual(
          finalStatus.isAttached,
          true,
          'Should remain attached after operations',
        );
        assert.strictEqual(
          typeof finalStatus.webpackHash,
          'string',
          'Should have webpack hash',
        );
        assert.strictEqual(
          typeof finalStatus.isPolling,
          'boolean',
          'Should have polling status',
        );

        // Test webpack-specific functionality
        const chunks = client.getCurrentChunks();
        assert.ok(Array.isArray(chunks), 'Should return chunks array');

        const modules = client.getCurrentModules();
        assert.ok(Array.isArray(modules), 'Should return modules array');
        assert.ok(modules.length > 0, 'Should have modules loaded');

        console.log(
          '✅ HMR Client update functionality verified via direct testing',
        );
      } catch (error) {
        throw new Error(`HMR update test failed: ${error.message}`);
      }
    });
  });

  describe('HMR Client Demo Complete Workflow', () => {
    it('should demonstrate complete HMR Client workflow in bundle', async (t) => {
      if (!buildSuccessful) {
        throw new Error('Build was not successful');
      }

      try {
        // Test complete workflow with direct function calls
        const hmrDemo = await require(hmrClientDemoPath);
        const client = hmrDemo.hmrClient;

        assert.ok(client, 'Should have HMR client');

        // Test initial state verification
        const initialStatus = client.getStatus();
        assert.strictEqual(
          initialStatus.isAttached,
          true,
          'Should show initial client state as attached',
        );
        assert.strictEqual(
          initialStatus.hasWebpackRequire,
          true,
          'Should show webpack runtime available',
        );
        assert.strictEqual(
          typeof initialStatus.hotStatus,
          'string',
          'Should have hot status',
        );

        // Test demo functions are available and callable
        assert.ok(
          typeof hmrDemo.runDemoTests === 'function',
          'Should have runDemoTests function',
        );

        // Execute demo tests (this tests the internal functionality)
        // Note: runDemoTests() may not return a value, but should execute without error
        assert.doesNotThrow(() => {
          hmrDemo.runDemoTests();
        }, 'Should execute demo tests without throwing');

        // Test complete update workflow
        const forceResult = await client.forceUpdate();
        assert.strictEqual(
          typeof forceResult.success,
          'boolean',
          'Should have force update result',
        );

        const checkResult = await client.checkForUpdates();
        assert.strictEqual(
          typeof checkResult.success,
          'boolean',
          'Should have check update result',
        );

        // Verify final state after workflow
        const finalStats = client.getStats();
        assert.strictEqual(
          typeof finalStats.totalUpdates,
          'number',
          'Should track final update count',
        );

        const finalStatus = client.getStatus();
        assert.strictEqual(
          finalStatus.isAttached,
          true,
          'Should maintain client attachment',
        );
        assert.strictEqual(
          finalStatus.hasWebpackRequire,
          true,
          'Should maintain webpack integration',
        );

        // Test business logic functions work throughout workflow
        const greeting = hmrDemo.demoAPI.greet('Developer');
        assert.ok(
          greeting.includes('Hello, Developer'),
          'Should maintain API functionality',
        );

        const calculation = hmrDemo.demoAPI.calculate(5);
        assert.strictEqual(
          calculation.originalInput,
          5,
          'Should maintain calculation functionality',
        );
        assert.strictEqual(
          calculation.processed,
          20,
          'Should process calculations correctly',
        );

        // Test data processing throughout workflow
        const testData = [
          { id: 1, name: 'Test Item 1' },
          { id: 2, name: 'Test Item 2' },
        ];
        const processedData = hmrDemo.demoAPI.processData(testData);
        assert.ok(
          Array.isArray(processedData),
          'Should maintain data processing',
        );
        assert.strictEqual(processedData.length, 2, 'Should process all items');
        assert.strictEqual(
          processedData[0].processed,
          true,
          'Should mark items as processed',
        );

        // Test status retrieval throughout workflow
        const workflowStatus = hmrDemo.demoAPI.getStatus();
        assert.strictEqual(
          typeof workflowStatus.version,
          'string',
          'Should maintain version info',
        );
        assert.ok(
          workflowStatus.hmrStatus,
          'Should include HMR status in workflow',
        );
        assert.strictEqual(
          typeof workflowStatus.uptime,
          'number',
          'Should track uptime',
        );

        console.log(
          '✅ HMR Client complete workflow verified via direct testing',
        );
      } catch (error) {
        throw new Error(`Complete workflow test failed: ${error.message}`);
      }
    });

    it('should run HMR Client Demo via npm script', (t, done) => {
      let completed = false;
      const safeComplete = (error) => {
        if (completed) return;
        completed = true;
        done(error);
      };

      const child = spawn('npm', ['run', 'start:hmr-client'], {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let buildCompleted = false;
      let demoStarted = false;

      child.stdout.on('data', (data) => {
        stdout += data.toString();

        if (stdout.includes('webpack') && stdout.includes('compiled')) {
          buildCompleted = true;
          console.log('✅ Webpack compilation for HMR Client Demo completed');
        }

        if (stdout.includes('HMR Client Demo Starting')) {
          demoStarted = true;
          console.log('✅ HMR Client Demo started via npm script');
          // Kill after successful startup
          setTimeout(() => {
            if (!child.killed) {
              child.kill('SIGTERM');
            }
          }, 3000);
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        try {
          assert.ok(buildCompleted, 'Webpack build should complete');
          assert.ok(demoStarted, 'HMR Client Demo should start');

          if (
            stderr &&
            !stderr.includes('DeprecationWarning') &&
            !stderr.includes('ENOENT')
          ) {
            console.warn('HMR Client Demo script stderr:', stderr);
          }

          console.log('✅ npm run start:hmr-client works correctly');
          safeComplete();
        } catch (error) {
          console.log('HMR Client Demo script stdout:', stdout);
          console.log('HMR Client Demo script stderr:', stderr);
          safeComplete(error);
        }
      });

      child.on('error', (error) => {
        safeComplete(error);
      });

      // Timeout for npm script
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
          safeComplete(new Error('npm run start:hmr-client timed out'));
        }
      }, 40000);
    });
  });
});
