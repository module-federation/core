#!/usr/bin/env node

/**
 * E2E Test for Module Federation HMR with Navigation
 * 
 * This test simulates a real user workflow:
 * 1. Start dev servers
 * 2. Visit home page
 * 3. Navigate to shop page (federated remote)
 * 4. Edit a shop component file on filesystem
 * 5. Verify HMR triggers and page reloads with changes
 * 6. Navigate back to home to verify it also sees the changes
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const crypto = require('crypto');

// Configuration
const SHOP_COMPONENT_PATH = './apps/3001-shop/components/exposedTitle.tsx';
const HOME_URL = 'http://localhost:3000';
const SHOP_URL = 'http://localhost:3000/shop';
const TEST_CHANGE_MARKER = 'HMR E2E TEST CHANGE';
const ORIGINAL_CONTENT_BACKUP = SHOP_COMPONENT_PATH + '.backup';

let serversProcess = null;
let originalContent = '';

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

const extractPageContent = (html, selector = 'This came fom') => {
  // Extract relevant content that shows the federated component
  const match = html.match(new RegExp(`${selector}.*?</p>`, 'g'));
  return match ? match.join('\n') : '';
};

const backupOriginalFile = () => {
  originalContent = fs.readFileSync(SHOP_COMPONENT_PATH, 'utf8');
  fs.writeFileSync(ORIGINAL_CONTENT_BACKUP, originalContent);
  console.log('📦 Backed up original component file');
};

const restoreOriginalFile = () => {
  if (fs.existsSync(ORIGINAL_CONTENT_BACKUP)) {
    fs.writeFileSync(SHOP_COMPONENT_PATH, fs.readFileSync(ORIGINAL_CONTENT_BACKUP, 'utf8'));
    fs.unlinkSync(ORIGINAL_CONTENT_BACKUP);
    console.log('🔄 Restored original component file');
  }
};

const modifyShopComponent = (testMessage = 'HMR Working!') => {
  let content = fs.readFileSync(SHOP_COMPONENT_PATH, 'utf8');
  
  // Replace the description with our test message
  content = content.replace(
    /And it works like a charm v2/g,
    `${TEST_CHANGE_MARKER}: ${testMessage} - ${new Date().toISOString()}`
  );
  
  fs.writeFileSync(SHOP_COMPONENT_PATH, content);
  console.log(`✏️  Modified shop component with test message: "${testMessage}"`);
  return content;
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
    let readyCount = 0;
    
    serversProcess.stdout.on('data', (data) => {
      const output = data.toString();
      startupOutput += output;
      
      // Count Ready messages
      const newReadyCount = (startupOutput.match(/Ready in \d+\.?\d*s/g) || []).length;
      if (newReadyCount > readyCount) {
        readyCount = newReadyCount;
        console.log(`✅ Server ${readyCount}/3 ready`);
      }
      
      // All servers ready
      if (readyCount >= 3) {
        setTimeout(() => resolve(startupOutput), 3000); // Give servers time to fully start
      }
    });

    serversProcess.stderr.on('data', (data) => {
      const output = data.toString();
      // Only log significant errors, not warnings
      if (output.includes('Error') && !output.includes('Warning')) {
        console.error('Server Error:', output);
      }
    });

    serversProcess.on('error', reject);
    
    // Timeout after 2 minutes 
    setTimeout(() => {
      reject(new Error('Servers took too long to start'));
    }, 120000);
  });
};

const stopServers = () => {
  if (serversProcess) {
    console.log('🛑 Stopping servers...');
    serversProcess.kill('SIGTERM');
    
    // Force kill if still running after 5 seconds
    setTimeout(() => {
      if (serversProcess) {
        serversProcess.kill('SIGKILL');
      }
    }, 5000);
    
    serversProcess = null;
  }
};

const runNavigationHMRTest = async () => {
  try {
    console.log('🧪 Starting Module Federation HMR Navigation E2E Test\n');
    
    // Step 0: Backup original file
    backupOriginalFile();
    
    // Step 1: Start servers
    await startServers();
    console.log('✅ All servers started successfully\n');
    
    // Step 2: Wait for servers to be fully ready
    console.log('⏳ Waiting for servers to be fully ready...');
    await sleep(5000);
    
    // Step 3: Visit home page
    console.log('🏠 Step 1: Visiting home page...');
    const homeResponse1 = await makeRequest(HOME_URL);
    console.log(`   Home page loaded (${homeResponse1.length} chars)`);
    await sleep(2000);
    
    // Step 4: Navigate to shop page (federated remote)
    console.log('🛍️  Step 2: Navigating to shop page...');
    const shopResponse1 = await makeRequest(SHOP_URL);
    const originalShopContent = extractPageContent(shopResponse1);
    console.log(`   Shop page loaded with federated content:`);
    console.log(`   "${originalShopContent.replace(/\n/g, ' ').substring(0, 100)}..."`);
    await sleep(2000);
    
    // Step 5: Edit the shop component file
    console.log('✏️  Step 3: Modifying shop component file...');
    const testMessage = `Navigation HMR Test - ${Date.now()}`;
    modifyShopComponent(testMessage);
    
    // Give file system and webpack time to detect the change
    console.log('⏳ Waiting for file system change detection...');
    await sleep(3000);
    
    // Step 6: Visit shop page again to trigger server-side revalidation
    console.log('🔄 Step 4: Revisiting shop page to trigger revalidation...');
    const shopResponse2 = await makeRequest(SHOP_URL);
    const updatedShopContent = extractPageContent(shopResponse2);
    console.log(`   Updated shop content:`);
    console.log(`   "${updatedShopContent.replace(/\n/g, ' ').substring(0, 100)}..."`);
    
    // Step 7: Check if content changed
    const contentChanged = updatedShopContent.includes(TEST_CHANGE_MARKER);
    console.log(`   Content changed: ${contentChanged ? '✅ YES' : '❌ NO'}`);
    
    if (contentChanged) {
      console.log(`   ✅ Found test marker: "${TEST_CHANGE_MARKER}"`);
    }
    
    await sleep(2000);
    
    // Step 8: Navigate back to home to verify it also sees changes
    console.log('🏠 Step 5: Navigating back to home page...');
    const homeResponse2 = await makeRequest(HOME_URL);
    console.log(`   Home page loaded again (${homeResponse2.length} chars)`);
    
    // Step 9: Visit shop from home again to verify persistent changes
    console.log('🛍️  Step 6: Final shop page visit from home...');
    const shopResponse3 = await makeRequest(SHOP_URL);
    const finalShopContent = extractPageContent(shopResponse3);
    const finalContentChanged = finalShopContent.includes(TEST_CHANGE_MARKER);
    
    console.log(`   Final shop content:`);
    console.log(`   "${finalShopContent.replace(/\n/g, ' ').substring(0, 100)}..."`);
    console.log(`   Final content changed: ${finalContentChanged ? '✅ YES' : '❌ NO'}`);
    
    // Step 10: Additional requests to trigger more revalidation cycles
    console.log('🔄 Step 7: Making additional requests to observe HMR behavior...');
    for (let i = 1; i <= 3; i++) {
      console.log(`   Additional request ${i}/3...`);
      await makeRequest(SHOP_URL);
      await sleep(1000);
    }
    
    // Summary
    console.log('\n📊 TEST RESULTS:');
    console.log(`   Original content contained: "And it works like a charm v2"`);
    console.log(`   Modified content should contain: "${TEST_CHANGE_MARKER}"`);
    console.log(`   Content change detected: ${contentChanged ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Persistent after navigation: ${finalContentChanged ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    console.log('\n🔍 CHECK SERVER LOGS FOR:');
    console.log('   - "🔥 SERVER-SIDE REMOTE CHANGE DETECTED" messages');
    console.log('   - "🔥 Marking module graph as DIRTY" messages');
    console.log('   - "🚀 TRIGGERING FORCE RELOAD" messages');
    console.log('   - Hash change logs with before/after values');
    
    if (contentChanged && finalContentChanged) {
      console.log('\n🎉 HMR NAVIGATION TEST PASSED! The system successfully:');
      console.log('   ✅ Detected file system changes');
      console.log('   ✅ Triggered server-side revalidation');
      console.log('   ✅ Updated federated content');
      console.log('   ✅ Persisted changes across navigation');
    } else {
      console.log('\n❌ HMR NAVIGATION TEST FAILED - check server logs for details');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    restoreOriginalFile();
    stopServers();
    
    // Wait a bit for graceful shutdown
    await sleep(2000);
    process.exit(0);
  }
};

// Handle cleanup on exit
const cleanup = () => {
  console.log('\n🛑 Test interrupted. Cleaning up...');
  restoreOriginalFile();
  stopServers();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  cleanup();
});

// Run the test
runNavigationHMRTest();