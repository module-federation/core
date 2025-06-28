#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
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

class TestRunner {
  constructor() {
    this.testSuites = [
      {
        name: 'Build Test',
        command: 'pnpm run build:all',
        optional: false,
        description: 'Build all projects',
      },
      {
        name: 'API Test',
        command: 'node test-mcp-api.js',
        optional: false,
        description: 'Test MCP API integration',
      },
      {
        name: 'E2E Test',
        command: 'node e2e-test.js',
        optional: false,
        description: 'Full end-to-end federation test',
      },
      {
        name: 'Demo Test',
        command: 'node run-demo.js',
        optional: true,
        description: 'Run interactive demo',
      },
    ];

    this.results = [];
    this.startTime = Date.now();
  }

  async runCommand(command, options = {}) {
    const { cwd = '.', timeout = 300000, optional = false } = options;

    log(`🏃 Running: ${command}`, 'cyan');

    return new Promise((resolve) => {
      const startTime = Date.now();
      const child = spawn('bash', ['-c', command], {
        cwd,
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' },
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timeoutId = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 5000);
      }, timeout);

      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        // Real-time output for debugging
        process.stdout.write(text);
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        // Real-time error output
        process.stderr.write(text);
      });

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        if (timedOut) {
          resolve({
            success: false,
            code: -1,
            stdout,
            stderr: stderr + '\nProcess timed out',
            duration,
            timedOut: true,
          });
        } else {
          resolve({
            success: code === 0,
            code,
            stdout,
            stderr,
            duration,
            timedOut: false,
          });
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        resolve({
          success: false,
          code: -1,
          stdout,
          stderr: stderr + `\nProcess error: ${error.message}`,
          duration,
          error,
        });
      });
    });
  }

  async checkPrerequisites() {
    log('🔍 Checking prerequisites...', 'blue');

    const checks = [
      {
        name: 'Node.js',
        command: 'node --version',
        expected: /v\d+\./,
      },
      {
        name: 'pnpm',
        command: 'pnpm --version',
        expected: /\d+\./,
      },
      {
        name: 'nx',
        command: 'npx nx --version',
        expected: /\d+\./,
      },
    ];

    for (const check of checks) {
      try {
        const result = await this.runCommand(check.command, { timeout: 10000 });
        if (result.success && check.expected.test(result.stdout)) {
          log(`✅ ${check.name}: ${result.stdout.trim()}`, 'green');
        } else {
          log(`❌ ${check.name}: Failed`, 'red');
          return false;
        }
      } catch (error) {
        log(`❌ ${check.name}: ${error.message}`, 'red');
        return false;
      }
    }

    return true;
  }

  async runTestSuite(suite) {
    log(`\n📋 Starting: ${suite.name}`, 'bright');
    log(`   ${suite.description}`, 'cyan');

    const startTime = Date.now();
    const result = await this.runCommand(suite.command, {
      optional: suite.optional,
      timeout: 300000, // 5 minutes per test suite
    });

    const duration = Date.now() - startTime;
    const status = result.success ? '✅' : '❌';
    const statusColor = result.success ? 'green' : 'red';

    log(`${status} ${suite.name} (${duration}ms)`, statusColor);

    if (!result.success && !suite.optional) {
      log(`   Failed with exit code: ${result.code}`, 'red');
      if (result.timedOut) {
        log(`   Test timed out after ${duration}ms`, 'red');
      }
    }

    this.results.push({
      name: suite.name,
      success: result.success,
      optional: suite.optional,
      duration,
      code: result.code,
      timedOut: result.timedOut,
      stdout: result.stdout,
      stderr: result.stderr,
    });

    return result.success || suite.optional;
  }

  async generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter((r) => r.success).length;
    const failed = this.results.filter((r) => !r.success && !r.optional).length;
    const skipped = this.results.filter((r) => !r.success && r.optional).length;

    const reportData = {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      summary: {
        total: this.results.length,
        passed,
        failed,
        skipped,
        success: failed === 0,
      },
      results: this.results.map((r) => ({
        name: r.name,
        success: r.success,
        optional: r.optional,
        duration: r.duration,
        timedOut: r.timedOut,
      })),
    };

    // Write JSON report
    await fs.writeFile('test-report.json', JSON.stringify(reportData, null, 2));

    // Write HTML report
    const htmlReport = this.generateHtmlReport(reportData);
    await fs.writeFile('test-report.html', htmlReport);

    return reportData;
  }

  generateHtmlReport(data) {
    const statusClass = data.summary.success ? 'success' : 'failure';
    const statusIcon = data.summary.success ? '✅' : '❌';

    return `
<!DOCTYPE html>
<html>
<head>
    <title>MCP Federation Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: green; }
        .failure { color: red; }
        .optional { color: orange; }
        .results { margin-top: 20px; }
        .result { padding: 10px; margin: 5px 0; border-radius: 3px; }
        .result.success { background: #d4edda; border-left: 4px solid #28a745; }
        .result.failure { background: #f8d7da; border-left: 4px solid #dc3545; }
        .result.optional { background: #fff3cd; border-left: 4px solid #ffc107; }
        .duration { font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${statusIcon} MCP Federation Test Report</h1>
        <p>Generated: ${data.timestamp}</p>
        <p>Total Duration: ${data.duration}ms</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div style="font-size: 2em;">${data.summary.total}</div>
        </div>
        <div class="metric success">
            <h3>Passed</h3>
            <div style="font-size: 2em;">${data.summary.passed}</div>
        </div>
        <div class="metric failure">
            <h3>Failed</h3>
            <div style="font-size: 2em;">${data.summary.failed}</div>
        </div>
        <div class="metric optional">
            <h3>Skipped</h3>
            <div style="font-size: 2em;">${data.summary.skipped}</div>
        </div>
    </div>
    
    <div class="results">
        <h2>Test Results</h2>
        ${data.results
          .map((result) => {
            const resultClass = result.success
              ? 'success'
              : result.optional
                ? 'optional'
                : 'failure';
            const icon = result.success ? '✅' : result.optional ? '⚠️' : '❌';
            const timedOutText = result.timedOut ? ' (TIMED OUT)' : '';

            return `
            <div class="result ${resultClass}">
                <strong>${icon} ${result.name}</strong>
                <div class="duration">${result.duration}ms${timedOutText}</div>
            </div>
          `;
          })
          .join('')}
    </div>
</body>
</html>
    `;
  }

  async run() {
    log('🚀 Starting MCP Federation Test Runner', 'bright');

    // Check prerequisites
    if (!(await this.checkPrerequisites())) {
      log('❌ Prerequisites check failed', 'red');
      process.exit(1);
    }

    let overallSuccess = true;

    // Run test suites
    for (const suite of this.testSuites) {
      const success = await this.runTestSuite(suite);
      if (!success && !suite.optional) {
        overallSuccess = false;
        // Continue running other tests for better diagnostics
      }
    }

    // Generate report
    const report = await this.generateReport();

    // Summary
    log('\n📋 Test Summary:', 'bright');
    log(`   Total: ${report.summary.total}`, 'cyan');
    log(`   Passed: ${report.summary.passed}`, 'green');
    log(
      `   Failed: ${report.summary.failed}`,
      report.summary.failed > 0 ? 'red' : 'green',
    );
    log(`   Skipped: ${report.summary.skipped}`, 'yellow');
    log(`   Duration: ${report.duration}ms`, 'cyan');
    log(`   Reports: test-report.json, test-report.html`, 'cyan');

    if (report.summary.success && overallSuccess) {
      log('\n🎉 All tests passed!', 'green');
      process.exit(0);
    } else {
      log('\n💥 Some tests failed!', 'red');
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch((error) => {
    log(`💥 Test runner crashed: ${error.message}`, 'red');
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = { TestRunner };
