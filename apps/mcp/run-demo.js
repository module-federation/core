#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
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
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCommand(command, cwd = process.cwd()) {
  log(`\n🔧 Running: ${command}`, 'cyan');

  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    if (stdout) log(stdout, 'green');
    if (stderr) log(stderr, 'yellow');
    return { success: true, stdout, stderr };
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return { success: false, error };
  }
}

async function checkNodeModules() {
  log('\n📦 Checking if node_modules exist...', 'blue');

  try {
    await execAsync('ls node_modules', { cwd: '../../' });
    log('✅ Root node_modules found', 'green');
    return true;
  } catch (error) {
    log('❌ Root node_modules not found. Please run: pnpm install', 'red');
    return false;
  }
}

async function buildProjects() {
  log('\n🏗️  Building MCP projects...', 'blue');

  const projects = ['mcp-remote1', 'mcp-remote2', 'mcp-host'];

  for (const project of projects) {
    log(`\n📦 Building ${project}...`, 'yellow');
    const result = await runCommand(`npx nx build ${project}`, '../../');

    if (!result.success) {
      log(`❌ Failed to build ${project}`, 'red');
      return false;
    }

    log(`✅ ${project} built successfully`, 'green');
  }

  return true;
}

async function startServers() {
  log('\n🚀 Starting MCP servers...', 'blue');

  const servers = [
    { name: 'remote1', cmd: 'npx nx serve mcp-remote1', port: '3001' },
    { name: 'remote2', cmd: 'npx nx serve mcp-remote2', port: '3002' },
  ];

  const processes = [];

  for (const server of servers) {
    log(`\n🔥 Starting ${server.name} on port ${server.port}...`, 'yellow');

    const child = spawn('bash', ['-c', server.cmd], {
      cwd: '../../',
      stdio: 'pipe',
    });

    child.stdout.on('data', (data) => {
      log(`[${server.name}] ${data.toString().trim()}`, 'cyan');
    });

    child.stderr.on('data', (data) => {
      log(`[${server.name}] ${data.toString().trim()}`, 'magenta');
    });

    processes.push({ name: server.name, process: child });
  }

  // Wait for servers to start
  log('\n⏳ Waiting for servers to start...', 'blue');
  await sleep(5000);

  return processes;
}

async function runHostAndTest() {
  log('\n🏠 Starting MCP Host...', 'blue');

  try {
    // Run the host which will attempt to connect to remotes and run demo
    const result = await runCommand('node dist/main.js', './host/');

    if (result.success) {
      log('\n✅ MCP Host demo completed successfully!', 'green');
    } else {
      log('\n❌ MCP Host demo failed', 'red');
    }

    return result.success;
  } catch (error) {
    log(`\n❌ Error running host: ${error.message}`, 'red');
    return false;
  }
}

async function runDemo() {
  try {
    log('🌟 Starting MCP Federation Demo', 'bright');

    // Check prerequisites
    if (!(await checkNodeModules())) {
      process.exit(1);
    }

    // Build all projects
    if (!(await buildProjects())) {
      process.exit(1);
    }

    // Start remote servers
    const processes = await startServers();

    // Run host and demo
    const success = await runHostAndTest();

    // Cleanup: kill all spawned processes
    log('\n🧹 Cleaning up processes...', 'blue');
    processes.forEach(({ name, process }) => {
      log(`Stopping ${name}...`, 'yellow');
      process.kill('SIGTERM');
    });

    if (success) {
      log('\n🎉 Demo completed successfully!', 'green');
      process.exit(0);
    } else {
      log('\n💥 Demo failed!', 'red');
      process.exit(1);
    }
  } catch (error) {
    log(`\n💥 Demo crashed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runDemo().catch((error) => {
    log(`💥 Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runDemo };
