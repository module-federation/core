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

describe('End-to-End Webpack HMR Tests', () => {
  const projectRoot = path.join(__dirname, '..');
  const distDir = path.join(projectRoot, 'dist');
  const builtIndexPath = path.join(distDir, 'index.js');
  let buildSuccessful = false;

  before(async () => {
    console.log('🔧 Setting up E2E tests...');

    // Ensure we're in the right directory
    process.chdir(projectRoot);

    // Clean dist directory
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }

    // Build the project once for all tests
    try {
      console.log('📦 Building webpack bundle for testing...');
      const { stdout, stderr } = await execAsync('npm run build', {
        cwd: projectRoot,
        timeout: 30000,
      });

      // Check if build completed successfully
      if (fs.existsSync(builtIndexPath)) {
        buildSuccessful = true;
        console.log('✅ Webpack build completed successfully');

        // Verify the built file contains expected content
        const builtContent = fs.readFileSync(builtIndexPath, 'utf8');
        console.log(
          '📝 Built file size:',
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
      } else {
        throw new Error('Built file does not exist after build');
      }
    } catch (error) {
      console.error('❌ Build failed during setup:', error.message);
      if (error.stdout) console.error('Build stdout:', error.stdout);
      if (error.stderr) console.error('Build stderr:', error.stderr);
      throw error;
    }
  });

  after(() => {
    console.log('🧹 Cleaning up E2E test artifacts...');
    // Clean up dist directory
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
      console.log('✅ Dist directory cleaned');
    }
  });

  describe('Webpack Build Process', () => {
    it('should have built the project successfully', () => {
      assert.ok(
        buildSuccessful,
        'Build should have completed successfully in setup',
      );
      assert.ok(fs.existsSync(builtIndexPath), 'Built index.js should exist');
    });

    it('should create proper webpack bundle structure', () => {
      assert.ok(buildSuccessful, 'Build should have completed successfully');
      assert.ok(fs.existsSync(builtIndexPath), 'index.js should be built');

      const builtContent = fs.readFileSync(builtIndexPath, 'utf8');

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
      // Check for HMR testing functions instead of generic update handler
      assert.ok(
        builtContent.includes('getModuleState') ||
          builtContent.includes('applyUpdates'),
        'Should contain HMR test functions',
      );
    });

    it('should contain HMR testing functionality', () => {
      assert.ok(buildSuccessful, 'Build should have completed successfully');

      const builtContent = fs.readFileSync(builtIndexPath, 'utf8');

      // Check for our specific HMR testing functions
      assert.ok(
        builtContent.includes('HMR Testing Module'),
        'Should contain HMR testing module marker',
      );
      assert.ok(
        builtContent.includes('moduleState'),
        'Should contain module state management',
      );
      assert.ok(
        builtContent.includes('forceUpdate'),
        'Should contain force update functionality',
      );
      assert.ok(
        builtContent.includes('applyUpdates'),
        'Should contain apply updates functionality',
      );
    });
  });

  describe('Built Application Execution', () => {
    it('should run the built application', (t, done) => {
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

      const child = spawn('node', [builtIndexPath], {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let hasOutput = false;

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        hasOutput = true;

        // Check for expected output from HMR test module
        if (stdout.includes('HMR Test Module Started')) {
          console.log('✅ HMR Test Module started successfully');
          // Kill after successful startup
          setTimeout(() => {
            if (!child.killed) {
              child.kill('SIGTERM');
            }
          }, 1000);
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        try {
          // We expect the process to be killed, so code might not be 0
          assert.ok(hasOutput, 'Should have produced output');
          assert.ok(
            stdout.includes('HMR Test Module Started'),
            'Should output HMR test module start message',
          );
          assert.ok(
            stdout.includes('Initial State:'),
            'Should show initial module state',
          );

          if (stderr && !stderr.includes('DeprecationWarning')) {
            console.warn('Stderr output:', stderr);
          }

          safeComplete();
        } catch (error) {
          safeComplete(error);
        }
      });

      child.on('error', (error) => {
        safeComplete(error);
      });

      // Timeout safety
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
          safeComplete(new Error('Application timed out'));
        }
      }, 10000);
    });

    it('should handle HMR update providers in built application', (t, done) => {
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

      // Create a test script that uses the built application with custom providers
      const testScript = `
        const app = require('${builtIndexPath}');

        console.log('Testing update providers...');

        // Test queue provider
        const testUpdate = {
          manifest: { h: 'test123', c: [], r: [], m: [] },
          script: 'console.log("Test update applied");',
          originalInfo: { updateId: 'test-001', webpackHash: 'test123' }
        };

        const queueProvider = app.createQueueUpdateProvider([testUpdate]);
        app.setUpdateProvider(queueProvider);

        app.fetchUpdates().then(result => {
          console.log('Fetch result:', result.update ? 'SUCCESS' : 'FAILED');

          // Test force update
          return app.forceUpdate();
        }).then(() => {
          console.log('Force update: SUCCESS');
          process.exit(0);
        }).catch(error => {
          console.error('Test failed:', error);
          process.exit(1);
        });
      `;

      const testScriptPath = path.join(distDir, 'test-hmr.js');
      fs.writeFileSync(testScriptPath, testScript);

      const child = spawn('node', [testScriptPath], {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        try {
          // Clean up test script
          if (fs.existsSync(testScriptPath)) {
            fs.unlinkSync(testScriptPath);
          }

          assert.strictEqual(
            code,
            0,
            `Test script should exit with code 0, got ${code}`,
          );
          assert.ok(
            stdout.includes('Testing update providers'),
            'Should start provider tests',
          );
          assert.ok(
            stdout.includes('Fetch result: SUCCESS'),
            'Should fetch update successfully',
          );
          assert.ok(
            stdout.includes('Force update: SUCCESS'),
            'Should complete force update',
          );

          if (stderr && !stderr.includes('DeprecationWarning')) {
            console.warn('Test stderr:', stderr);
          }

          console.log('✅ HMR providers work in built application');
          safeComplete();
        } catch (error) {
          safeComplete(error);
        }
      });

      child.on('error', (error) => {
        safeComplete(error);
      });

      // Timeout safety
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
          safeComplete(new Error('HMR provider test timed out'));
        }
      }, 15000);
    });
  });

  describe('Real HMR Capability Tests', () => {
    it('should simulate HMR update with real webpack runtime', (t, done) => {
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

      // Create a realistic HMR test that simulates an actual update
      const hmrTestScript = `
        // Load the built application
        const builtApp = require('${builtIndexPath}');

        console.log('Starting HMR simulation test...');

        // Create a realistic update that would come from webpack
        const realisticUpdate = {
          manifest: {
            h: 'hmr-test-hash-456',
            c: ['index'],
            r: [],
            m: ['./src/index.js']
          },
          script: \`
            exports.modules = {
              './src/index.js': function(module, exports, __webpack_require__) {
                console.log('🔥 HMR: Updated module loaded successfully!');

                // Updated counter function
                let counter = 100; // Start from 100 to show it's updated

                function incrementCounter() {
                  counter++;
                  console.log('Updated Counter: ' + counter);
                  return counter;
                }

                function getCounter() {
                  return counter;
                }

                module.exports = {
                  incrementCounter: incrementCounter,
                  getCounter: getCounter,
                  updated: true,
                  version: '2.0.0'
                };
              }
            };

            exports.runtime = function(__webpack_require__) {
              console.log('🚀 HMR: Runtime update applied');
            };
          \`,
          originalInfo: {
            updateId: 'hmr-simulation-001',
            webpackHash: 'hmr-test-hash-456'
          }
        };

        // Set up the update provider
        const hmrProvider = builtApp.createQueueUpdateProvider([realisticUpdate]);
        builtApp.setUpdateProvider(hmrProvider);

        console.log('Provider configured, testing HMR flow...');

        // Test the complete HMR flow
        Promise.resolve()
          .then(() => {
            console.log('1. Fetching update...');
            return builtApp.fetchUpdates();
          })
          .then(updateData => {
            console.log('2. Update fetched:', updateData.update ? 'SUCCESS' : 'FAILED');

            console.log('3. Applying update...');
            return builtApp.applyUpdates(updateData, false);
          })
          .then(() => {
            console.log('4. Update applied successfully');

            console.log('5. Testing force update...');
            return builtApp.forceUpdate();
          })
          .then(() => {
            console.log('6. Force update completed');

            console.log('7. Testing module state functionality...');
            const initialState = builtApp.getModuleState();
            builtApp.updateModuleState({ testValue: 'updated' });
            const updatedState = builtApp.getModuleState();

            console.log('Module state test:', initialState.reloadCount, '->', updatedState.reloadCount);

            console.log('✅ All HMR tests completed successfully!');
            process.exit(0);
          })
          .catch(error => {
            console.error('❌ HMR test failed:', error.message);
            console.error(error.stack);
            process.exit(1);
          });
      `;

      const hmrTestPath = path.join(distDir, 'test-real-hmr.js');
      fs.writeFileSync(hmrTestPath, hmrTestScript);

      const child = spawn('node', [hmrTestPath], {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        try {
          // Clean up test script
          if (fs.existsSync(hmrTestPath)) {
            fs.unlinkSync(hmrTestPath);
          }

          if (code !== 0) {
            console.log('Test stdout:', stdout);
            console.log('Test stderr:', stderr);
          }

          assert.strictEqual(
            code,
            0,
            `HMR test should exit with code 0, got ${code}`,
          );
          assert.ok(
            stdout.includes('Starting HMR simulation test'),
            'Should start HMR test',
          );
          assert.ok(
            stdout.includes('Update fetched: SUCCESS'),
            'Should fetch update',
          );
          assert.ok(
            stdout.includes('Update applied successfully'),
            'Should apply update',
          );
          assert.ok(
            stdout.includes('Force update completed'),
            'Should complete force update',
          );
          assert.ok(
            stdout.includes('All HMR tests completed successfully'),
            'Should complete all tests',
          );

          console.log('✅ Real HMR capability verified');
          safeComplete();
        } catch (error) {
          console.log('Failed test stdout:', stdout);
          console.log('Failed test stderr:', stderr);
          safeComplete(error);
        }
      });

      child.on('error', (error) => {
        safeComplete(error);
      });

      // Longer timeout for complex HMR operations
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
          safeComplete(new Error('Real HMR test timed out'));
        }
      }, 20000);
    });

    it('should handle webpack build with different configurations', async () => {
      // Test that the webpack config is properly set up for HMR
      const webpackConfigPath = path.join(projectRoot, 'webpack.config.js');
      assert.ok(
        fs.existsSync(webpackConfigPath),
        'Webpack config should exist',
      );

      const configContent = fs.readFileSync(webpackConfigPath, 'utf8');
      assert.ok(
        configContent.includes('HotModuleReplacementPlugin'),
        'Should include HMR plugin',
      );
      assert.ok(
        configContent.includes("mode: 'development'"),
        'Should be in development mode',
      );
      assert.ok(
        configContent.includes("target: 'async-node'"),
        'Should target Node.js',
      );
    });
  });


  describe('Package Integration', () => {
    it('should have correct package.json configuration', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      assert.ok(fs.existsSync(packagePath), 'package.json should exist');

      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      assert.ok(packageContent.scripts.build, 'Should have build script');
      assert.ok(packageContent.scripts.start, 'Should have start script');
      assert.ok(
        packageContent.scripts['start:hmr-client'],
        'Should have start:hmr-client script',
      );
      assert.ok(
        packageContent.dependencies.webpack,
        'Should have webpack dependency',
      );
      assert.ok(
        packageContent.dependencies['webpack-cli'],
        'Should have webpack-cli dependency',
      );
    });

    it('should run start command successfully', (t, done) => {
      let completed = false;
      const safeComplete = (error) => {
        if (completed) return;
        completed = true;
        done(error);
      };

      const child = spawn('npm', ['run', 'start'], {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let buildCompleted = false;
      let appStarted = false;

      child.stdout.on('data', (data) => {
        stdout += data.toString();

        if (stdout.includes('webpack') && stdout.includes('compiled')) {
          buildCompleted = true;
          console.log('✅ Webpack compilation completed');
        }

        if (stdout.includes('HMR Test Module Started')) {
          appStarted = true;
          console.log('✅ Application started via npm start');
          // Kill after successful startup
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
          assert.ok(buildCompleted, 'Webpack build should complete');
          assert.ok(appStarted, 'Application should start');

          if (stderr && !stderr.includes('DeprecationWarning')) {
            console.warn('Start command stderr:', stderr);
          }

          console.log('✅ npm run start works correctly');
          safeComplete();
        } catch (error) {
          console.log('Start stdout:', stdout);
          console.log('Start stderr:', stderr);
          safeComplete(error);
        }
      });

      child.on('error', (error) => {
        safeComplete(error);
      });

      // Timeout for npm start
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
          safeComplete(new Error('npm start timed out'));
        }
      }, 30000);
    });
  });
});
