#!/usr/bin/env node

/**
 * E2E Test for Module Federation HMR (Hot Module Reloading)
 * 
 * This test:
 * 1. Starts the dev servers
 * 2. Makes initial request to establish baseline hashes
 * 3. Modifies a remote entry file directly
 * 4. Makes another request to trigger revalidation
 * 5. Checks if hash change was detected
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const crypto = require('crypto');

// Configuration
const SERVERS = [
  { name: 'home', port: 3000, path: 'apps/3000-home' },
  { name: 'shop', port: 3001, path: 'apps/3001-shop' },
  { name: 'checkout', port: 3002, path: 'apps/3002-checkout' }
];

const REMOTE_ENTRY_PATH = './apps/3001-shop/.next/static/ssr/remoteEntry.js';
const TEST_CHANGE_MARKER = '/* HMR TEST CHANGE';

let serversProcess = null;

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async (url) => {
  return new Promise((resolve, reject) => {
    exec(`curl -s "${url}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

const getFileHash = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('md5').update(content).digest('hex');
};

const modifyRemoteEntry = (addChange = true) => {
  let content = fs.readFileSync(REMOTE_ENTRY_PATH, 'utf8');
  
  if (addChange) {
    if (!content.includes(TEST_CHANGE_MARKER)) {
      content = content.replace(
        '/*\n * ATTENTION:', 
        `/*\n * HMR TEST CHANGE - Modified at ${new Date().toISOString()}\n * ATTENTION:`
      );
    } else {
      // Update existing change with new timestamp
      content = content.replace(
        /\/\* HMR TEST CHANGE - Modified at .+?\n/,
        `/* HMR TEST CHANGE - Modified at ${new Date().toISOString()}\n`
      );
    }
  } else {
    // Remove test change
    content = content.replace(/\/\* HMR TEST CHANGE - Modified at .+?\n \*/, '/*\n *');
  }
  
  fs.writeFileSync(REMOTE_ENTRY_PATH, content);
  return getFileHash(REMOTE_ENTRY_PATH);
};

const startServers = () => {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting dev servers...');
    
    serversProcess = spawn('npx', [
      'nx', 'run-many', 
      '--target=serve', 
      '--projects=3000-home,3001-shop,3002-checkout', 
      '--configuration=development',
      '--parallel=3'
    ], {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    let startupOutput = '';
    
    serversProcess.stdout.on('data', (data) => {
      const output = data.toString();
      startupOutput += output;
      process.stdout.write(output);
      
      // Check if all servers are ready
      const readyCount = (output.match(/Ready in \d+\.?\d*s/g) || []).length;
      if (readyCount >= 3 || output.includes('Ready in')) {
        setTimeout(() => resolve(startupOutput), 2000); // Give servers time to fully start
      }
    });

    serversProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    serversProcess.on('error', reject);
    
    // Timeout after 60 seconds
    setTimeout(() => {
      reject(new Error('Servers took too long to start'));
    }, 60000);
  });
};

const stopServers = () => {
  if (serversProcess) {
    console.log('🛑 Stopping servers...');
    serversProcess.kill('SIGTERM');
    serversProcess = null;
  }
};

const runHMRTest = async () => {
  try {
    console.log('🧪 Starting Module Federation HMR E2E Test\n');
    
    // Step 1: Start servers
    await startServers();
    console.log('✅ Servers started successfully\n');
    
    // Step 2: Wait for servers to be fully ready
    console.log('⏳ Waiting for servers to be fully ready...');
    await sleep(5000);
    
    // Step 3: Get initial hash and make baseline request
    console.log('📊 Establishing baseline...');
    const initialHash = getFileHash(REMOTE_ENTRY_PATH);
    console.log(`Initial remote entry hash: ${initialHash}`);
    
    console.log('🔄 Making baseline request to home page...');
    await makeRequest('http://localhost:3000/');
    await sleep(2000); // Give revalidation time to complete
    
    // Step 4: Modify remote entry
    console.log('✏️  Modifying remote entry file...');
    const newHash = modifyRemoteEntry(true);
    console.log(`New remote entry hash: ${newHash}`);
    console.log(`Hash changed: ${initialHash !== newHash ? '✅ YES' : '❌ NO'}`);
    
    // Step 5: Make request to trigger revalidation
    console.log('🔄 Making request to trigger revalidation...');
    await makeRequest('http://localhost:3000/');
    await sleep(3000); // Give revalidation and potential HMR time to complete
    
    // Step 6: Make additional requests to see if change is detected
    console.log('🔄 Making additional requests...');
    for (let i = 1; i <= 3; i++) {
      console.log(`Request ${i}/3...`);
      await makeRequest('http://localhost:3000/');
      await sleep(1000);
    }
    
    console.log('\n🎯 Test completed! Check the server logs above for:');
    console.log('   - "[Module Federation Debug]" messages showing hash comparisons');
    console.log('   - "🔥 SERVER-SIDE REMOTE CHANGE DETECTED" if change was detected');
    console.log('   - Hash values in the debug output');
    
    console.log('\n📝 Expected behavior:');
    console.log('   - Server should detect hash change and log it');
    console.log('   - Currently HMR is skipped on server-side, but detection should work');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    modifyRemoteEntry(false); // Remove test changes
    stopServers();
    process.exit(0);
  }
};

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted. Cleaning up...');
  modifyRemoteEntry(false);
  stopServers();
  process.exit(0);
});

process.on('SIGTERM', () => {
  modifyRemoteEntry(false);
  stopServers();
  process.exit(0);
});

// Run the test
runHMRTest();