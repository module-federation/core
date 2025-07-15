#!/usr/bin/env node

/**
 * Integration test for MCP with Module Federation
 * This script demonstrates how the host loads and uses MCP servers from remotes
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 MCP Module Federation Integration Test');
console.log('=========================================\n');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  try {
    console.log('📦 Building all MCP apps...\n');

    // Build remotes
    console.log('Building Remote 1...');
    await runCommand('nx', ['build', 'mcp-example-remote1']);

    console.log('\nBuilding Remote 2...');
    await runCommand('nx', ['build', 'mcp-example-remote2']);

    // Build host
    console.log('\nBuilding Host...');
    await runCommand('nx', ['build', 'mcp-example-host']);

    console.log('\n✅ Build complete!');
    console.log('\n🚀 Starting remote servers...\n');

    // Start remote servers in background
    const remote1 = spawn('nx', ['serve', 'mcp-example-remote1'], {
      stdio: 'pipe',
      shell: true,
    });

    const remote2 = spawn('nx', ['serve', 'mcp-example-remote2'], {
      stdio: 'pipe',
      shell: true,
    });

    // Wait for servers to start
    console.log('Waiting for servers to start...');
    await sleep(5000);

    console.log('\n🏃 Running MCP Host Demo...\n');

    // Run the host
    await runCommand('node', ['apps/mcp-example/host/dist/main.js']);

    console.log('\n🎉 Integration test complete!');

    // Cleanup
    remote1.kill();
    remote2.kill();

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Integration test failed:', error);
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  process.exit(0);
});

main();
