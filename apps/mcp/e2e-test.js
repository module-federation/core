#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString().substring(11, 23);
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test configuration
const TEST_CONFIG = {
  remotes: [
    {
      name: 'remote1',
      port: 3030,
      expectedUrl: 'http://localhost:3030/remoteEntry.js',
    },
    {
      name: 'remote2',
      port: 3031,
      expectedUrl: 'http://localhost:3031/remoteEntry.js',
    },
  ],
  host: { port: 3032 },
  timeout: 30000,
  healthCheckRetries: 10,
  healthCheckInterval: 2000,
};

class TestResults {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  add(name, passed, details = '', duration = 0) {
    this.results.push({
      name,
      passed,
      details,
      duration,
      timestamp: Date.now(),
    });

    const status = passed ? '✅' : '❌';
    const durationStr = duration > 0 ? ` (${duration}ms)` : '';
    log(`${status} ${name}${durationStr}`, passed ? 'green' : 'red');
    if (details) {
      log(`   ${details}`, 'cyan');
    }
  }

  summary() {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;

    log('\n📊 Test Summary:', 'bright');
    log(`   Total tests: ${this.results.length}`, 'cyan');
    log(`   Passed: ${passed}`, passed > 0 ? 'green' : 'yellow');
    log(`   Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`   Duration: ${totalDuration}ms`, 'cyan');

    if (failed > 0) {
      log('\n❌ Failed tests:', 'red');
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          log(`   • ${r.name}: ${r.details}`, 'red');
        });
    }

    return failed === 0;
  }
}

class ServerManager {
  constructor() {
    this.processes = new Map();
  }

  async startServer(name, command, port, cwd = '../../') {
    return new Promise((resolve, reject) => {
      log(`🚀 Starting ${name} on port ${port}...`, 'yellow');

      const child = spawn('bash', ['-c', command], {
        cwd,
        stdio: 'pipe',
        env: { ...process.env, PORT: port.toString() },
      });

      let output = '';
      let isReady = false;

      const readyPatterns = [
        /listening on/i,
        /server ready/i,
        /webpack compiled/i,
        /ready on/i,
        new RegExp(`port ${port}`, 'i'),
      ];

      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        log(`[${name}] ${text.trim()}`, 'cyan');

        if (!isReady && readyPatterns.some((pattern) => pattern.test(text))) {
          isReady = true;
          resolve(child);
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;
        log(`[${name}] ${text.trim()}`, 'magenta');

        if (!isReady && readyPatterns.some((pattern) => pattern.test(text))) {
          isReady = true;
          resolve(child);
        }
      });

      child.on('error', (error) => {
        log(`❌ Failed to start ${name}: ${error.message}`, 'red');
        reject(error);
      });

      child.on('exit', (code, signal) => {
        if (!isReady && code !== 0) {
          log(`❌ ${name} exited with code ${code}, signal ${signal}`, 'red');
          reject(new Error(`Server ${name} failed to start`));
        }
      });

      // Timeout fallback
      setTimeout(() => {
        if (!isReady) {
          log(`⏰ ${name} startup timeout, assuming ready...`, 'yellow');
          resolve(child);
        }
      }, 10000);

      this.processes.set(name, child);
    });
  }

  async stopServer(name) {
    const process = this.processes.get(name);
    if (process && !process.killed) {
      log(`🛑 Stopping ${name}...`, 'yellow');
      process.kill('SIGTERM');

      // Force kill after 5 seconds
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      }, 5000);

      this.processes.delete(name);
    }
  }

  async stopAll() {
    log('🧹 Stopping all servers...', 'blue');
    const stopPromises = Array.from(this.processes.keys()).map((name) =>
      this.stopServer(name),
    );
    await Promise.all(stopPromises);
  }
}

class FederationTester {
  constructor() {
    this.results = new TestResults();
    this.serverManager = new ServerManager();
  }

  async checkHttpEndpoint(url, expectedContent = null) {
    const startTime = Date.now();

    try {
      const response = await axios.get(url, { timeout: 5000 });
      const duration = Date.now() - startTime;

      if (response.status === 200) {
        if (expectedContent && !response.data.includes(expectedContent)) {
          return {
            success: false,
            error: `Content check failed for ${url}`,
            duration,
          };
        }
        return { success: true, data: response.data, duration };
      } else {
        return { success: false, error: `HTTP ${response.status}`, duration };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return { success: false, error: error.message, duration };
    }
  }

  async waitForServerReady(url, maxRetries = TEST_CONFIG.healthCheckRetries) {
    for (let i = 0; i < maxRetries; i++) {
      const result = await this.checkHttpEndpoint(url);
      if (result.success) {
        return true;
      }

      if (i < maxRetries - 1) {
        log(
          `⏳ Waiting for ${url} (attempt ${i + 1}/${maxRetries})...`,
          'yellow',
        );
        await sleep(TEST_CONFIG.healthCheckInterval);
      }
    }
    return false;
  }

  async buildProjects() {
    log('🏗️  Building all projects...', 'blue');
    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execAsync('pnpm run build:all', {
        cwd: '.',
      });
      const duration = Date.now() - startTime;

      this.results.add(
        'Build Projects',
        true,
        `Built in ${duration}ms`,
        duration,
      );
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.add(
        'Build Projects',
        false,
        `Build failed: ${error.message}`,
        duration,
      );
      return false;
    }
  }

  async startRemoteServers() {
    log('🌐 Starting remote servers...', 'blue');

    try {
      // Start remote servers
      for (const remote of TEST_CONFIG.remotes) {
        const command = `npx nx serve mcp-${remote.name} --port=${remote.port}`;
        await this.serverManager.startServer(remote.name, command, remote.port);

        // Wait for server to be ready
        const isReady = await this.waitForServerReady(remote.expectedUrl);
        this.results.add(
          `Start ${remote.name}`,
          isReady,
          isReady
            ? `Ready on port ${remote.port}`
            : `Failed to start on port ${remote.port}`,
        );

        if (!isReady) {
          throw new Error(`Remote ${remote.name} failed to start`);
        }
      }

      return true;
    } catch (error) {
      log(`❌ Failed to start remote servers: ${error.message}`, 'red');
      return false;
    }
  }

  async testHttpAccessibility() {
    log('🌍 Testing HTTP accessibility of remotes...', 'blue');

    for (const remote of TEST_CONFIG.remotes) {
      const startTime = Date.now();
      const result = await this.checkHttpEndpoint(remote.expectedUrl);

      this.results.add(
        `HTTP Access ${remote.name}`,
        result.success,
        result.success
          ? `Accessible at ${remote.expectedUrl}`
          : `Failed: ${result.error}`,
        result.duration,
      );

      // Test that the remote entry contains expected Module Federation exports
      if (result.success) {
        const containsFederation =
          result.data.includes('__webpack_require__') ||
          result.data.includes('remoteEntry') ||
          result.data.includes('federation');

        this.results.add(
          `Federation Bundle ${remote.name}`,
          containsFederation,
          containsFederation
            ? 'Contains Module Federation code'
            : 'Missing expected federation exports',
        );
      }
    }
  }

  async testFederationLoading() {
    log('🔗 Testing federation loading...', 'blue');

    try {
      // Import and test the host creation
      const hostModule = require('./host/dist/main.js');

      if (!hostModule.createMcpHost) {
        this.results.add(
          'Host Module Import',
          false,
          'createMcpHost function not found',
        );
        return false;
      }

      this.results.add(
        'Host Module Import',
        true,
        'Successfully imported host module',
      );

      // Create MCP host and test federation loading
      const startTime = Date.now();
      const { hostServer, registry, loader } = await hostModule.createMcpHost();
      const duration = Date.now() - startTime;

      this.results.add(
        'Create MCP Host',
        true,
        `Host created successfully`,
        duration,
      );

      // Test registry stats
      const stats = registry.getStats();
      this.results.add(
        'Server Registration',
        stats.serverCount > 0,
        `${stats.serverCount} servers, ${stats.totalTools} tools`,
      );

      // Test loaded remotes
      const loadedRemotes = loader.getLoadedRemotes();
      this.results.add(
        'Remote Loading',
        loadedRemotes.length > 0,
        `Loaded remotes: ${loadedRemotes.join(', ')}`,
      );

      return { hostServer, registry, loader, stats };
    } catch (error) {
      this.results.add('Federation Loading', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testToolFunctionality(hostServer, registry) {
    log('🔧 Testing tool functionality...', 'blue');

    // Test tool listing
    try {
      const listResult = await hostServer.request({
        method: 'tools/list',
        params: {},
      });

      const toolCount = listResult.tools ? listResult.tools.length : 0;
      this.results.add(
        'Tool Listing',
        toolCount > 0,
        `Found ${toolCount} tools`,
      );

      if (toolCount === 0) return false;

      // Test specific tool calls
      const testCases = [
        {
          name: 'filesystem.process_info',
          args: {},
          description: 'Process info tool',
        },
        {
          name: 'database.db_set',
          args: { key: 'e2e_test', value: '{"test": "federation_e2e"}' },
          description: 'Database set operation',
        },
        {
          name: 'database.db_get',
          args: { key: 'e2e_test' },
          description: 'Database get operation',
        },
        {
          name: 'git.git_status',
          args: { path: process.cwd() },
          description: 'Git status tool',
        },
      ];

      let successfulCalls = 0;

      for (const testCase of testCases) {
        try {
          const startTime = Date.now();
          const result = await hostServer.request({
            method: 'tools/call',
            params: {
              name: testCase.name,
              arguments: testCase.args,
            },
          });
          const duration = Date.now() - startTime;

          const success = !result.isError;
          if (success) successfulCalls++;

          this.results.add(
            `Tool Call: ${testCase.name}`,
            success,
            success
              ? `Call succeeded`
              : `Call failed: ${result.content?.[0]?.text || 'Unknown error'}`,
            duration,
          );
        } catch (error) {
          this.results.add(
            `Tool Call: ${testCase.name}`,
            false,
            `Exception: ${error.message}`,
          );
        }
      }

      this.results.add(
        'Overall Tool Testing',
        successfulCalls > 0,
        `${successfulCalls}/${testCases.length} tool calls succeeded`,
      );

      return successfulCalls > 0;
    } catch (error) {
      this.results.add('Tool Testing', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testErrorScenarios() {
    log('💥 Testing error scenarios...', 'blue');

    // Test with one remote down
    log('🔌 Testing with remote1 down...', 'yellow');
    await this.serverManager.stopServer('remote1');

    try {
      // Try to create host with one remote down
      const hostModule = require('./host/dist/main.js');
      const { registry } = await hostModule.createMcpHost();
      const stats = registry.getStats();

      // Should still work with remaining servers
      this.results.add(
        'Partial Remote Failure',
        stats.serverCount > 0,
        `Still functional with ${stats.serverCount} servers`,
      );
    } catch (error) {
      this.results.add(
        'Partial Remote Failure',
        false,
        `Complete failure: ${error.message}`,
      );
    }

    // Restart remote1
    const remote1Config = TEST_CONFIG.remotes.find((r) => r.name === 'remote1');
    if (remote1Config) {
      const command = `npx nx serve mcp-${remote1Config.name} --port=${remote1Config.port}`;
      await this.serverManager.startServer(
        remote1Config.name,
        command,
        remote1Config.port,
      );
      await this.waitForServerReady(remote1Config.expectedUrl);
    }
  }

  async runFullTest() {
    log('🚀 Starting MCP Federation E2E Test Suite', 'bright');

    try {
      // Build projects
      if (!(await this.buildProjects())) {
        return false;
      }

      // Start remote servers
      if (!(await this.startRemoteServers())) {
        return false;
      }

      // Test HTTP accessibility
      await this.testHttpAccessibility();

      // Test federation loading
      const federationResult = await this.testFederationLoading();
      if (!federationResult) {
        return false;
      }

      const { hostServer, registry } = federationResult;

      // Test tool functionality
      await this.testToolFunctionality(hostServer, registry);

      // Test error scenarios
      await this.testErrorScenarios();

      return true;
    } catch (error) {
      log(`💥 Test suite crashed: ${error.message}`, 'red');
      this.results.add('Test Suite', false, `Crashed: ${error.message}`);
      return false;
    } finally {
      // Cleanup
      await this.serverManager.stopAll();
    }
  }
}

// Main execution
async function main() {
  const tester = new FederationTester();

  try {
    const success = await tester.runFullTest();
    const overallSuccess = tester.results.summary();

    if (overallSuccess && success) {
      log('\n🎉 All E2E tests passed!', 'green');
      process.exit(0);
    } else {
      log('\n💥 Some E2E tests failed!', 'red');
      process.exit(1);
    }
  } catch (error) {
    log(`💥 Fatal error: ${error.message}`, 'red');
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { FederationTester, ServerManager, TestResults };
