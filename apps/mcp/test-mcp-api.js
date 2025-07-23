#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');

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
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testMcpServer() {
  try {
    log('\n🧪 Testing MCP API Integration', 'bright');

    // Import and create the MCP host
    log('\n📦 Loading MCP Host...', 'blue');
    const hostModule = require('./host/dist/main.js');

    if (!hostModule.createMcpHost) {
      log('❌ createMcpHost function not found in host module', 'red');
      return false;
    }

    const { hostServer, registry, loader } = await hostModule.createMcpHost();

    log('✅ MCP Host created successfully', 'green');

    // Test registry stats
    log('\n📊 Getting registry statistics...', 'blue');
    const stats = registry.getStats();
    log(`Server count: ${stats.serverCount}`, 'cyan');
    log(`Total tools: ${stats.totalTools}`, 'cyan');

    if (stats.serverCount === 0) {
      log('❌ No servers registered', 'red');
      return false;
    }

    // Test tool listing
    log('\n🔧 Testing tool listing...', 'blue');
    const listToolsResult = await hostServer.request({
      method: 'tools/list',
      params: {},
    });

    if (!listToolsResult.tools || listToolsResult.tools.length === 0) {
      log('❌ No tools returned from list request', 'red');
      return false;
    }

    log(`✅ Found ${listToolsResult.tools.length} tools:`, 'green');
    listToolsResult.tools.forEach((tool) => {
      log(`  • ${tool.name} - ${tool.description}`, 'cyan');
    });

    // Test individual tool calls
    const testCases = [
      {
        name: 'filesystem.read_file',
        description: 'Test filesystem read_file tool',
        args: { path: './package.json' },
      },
      {
        name: 'database.db_set',
        description: 'Test database set operation',
        args: { key: 'test_key', value: '{"message": "Hello from API test!"}' },
      },
      {
        name: 'database.db_get',
        description: 'Test database get operation',
        args: { key: 'test_key' },
      },
      {
        name: 'database.db_info',
        description: 'Test database info',
        args: {},
      },
    ];

    let successCount = 0;

    for (const testCase of testCases) {
      log(`\n🧪 Testing: ${testCase.description}`, 'yellow');

      try {
        const result = await hostServer.request({
          method: 'tools/call',
          params: {
            name: testCase.name,
            arguments: testCase.args,
          },
        });

        if (result.isError) {
          log(
            `❌ Tool call failed: ${result.content[0]?.text || 'Unknown error'}`,
            'red',
          );
        } else {
          log(`✅ Tool call succeeded`, 'green');
          if (result.content && result.content[0]?.text) {
            // Truncate long responses for readability
            const text = result.content[0].text;
            const preview =
              text.length > 200 ? text.substring(0, 200) + '...' : text;
            log(`Response: ${preview}`, 'cyan');
          }
          successCount++;
        }
      } catch (error) {
        log(`❌ Tool call error: ${error.message}`, 'red');
      }
    }

    // Test git tools if available
    const gitTools = listToolsResult.tools.filter((tool) =>
      tool.name.startsWith('git.'),
    );
    if (gitTools.length > 0) {
      log(`\n🔍 Testing git tools...`, 'yellow');

      try {
        const gitStatusResult = await hostServer.request({
          method: 'tools/call',
          params: {
            name: 'git.git_status',
            arguments: { path: process.cwd() },
          },
        });

        if (!gitStatusResult.isError) {
          log(`✅ Git status tool works`, 'green');
          successCount++;
        } else {
          log(
            `❌ Git status failed: ${gitStatusResult.content[0]?.text}`,
            'red',
          );
        }
      } catch (error) {
        log(`❌ Git test error: ${error.message}`, 'red');
      }
    }

    // Summary
    log(`\n📈 Test Summary:`, 'bright');
    log(`• Servers registered: ${stats.serverCount}`, 'cyan');
    log(`• Tools available: ${stats.totalTools}`, 'cyan');
    log(
      `• Successful tool calls: ${successCount}`,
      successCount > 0 ? 'green' : 'red',
    );

    const success =
      stats.serverCount > 0 && stats.totalTools > 0 && successCount > 0;

    if (success) {
      log('\n🎉 MCP API test passed!', 'green');
    } else {
      log('\n💥 MCP API test failed!', 'red');
    }

    return success;
  } catch (error) {
    log(`\n💥 Test error: ${error.message}`, 'red');
    if (error.stack) {
      log(`Stack trace: ${error.stack}`, 'red');
    }
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  testMcpServer()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      log(`💥 Fatal test error: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { testMcpServer };
