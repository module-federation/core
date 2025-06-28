#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Module Federation Hydration Fix E2E Test Runner');
console.log('================================================\n');

const SHOP_PAGE_PATH = path.join(__dirname, 'apps/3001-shop/pages/shop/index.tsx');

// Check if shop page contains the user's current modification
function checkShopPageContent() {
  try {
    const content = fs.readFileSync(SHOP_PAGE_PATH, 'utf8');
    if (content.includes('HYDRATION FIX TEST 123')) {
      console.log('✅ Shop page contains user modification: "HYDRATION FIX TEST 123"');
      return true;
    } else {
      console.log('⚠️  Shop page does not contain expected user modification');
      return false;
    }
  } catch (error) {
    console.error('❌ Error reading shop page:', error.message);
    return false;
  }
}

// Function to run a specific Cypress test
function runCypressTest(testFile, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔬 Running: ${description}`);
    console.log(`📁 Test file: ${testFile}`);
    console.log('─'.repeat(60));
    
    const cypressCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const args = [
      'nx', 'run', '3000-home:e2e:development',
      `--spec=apps/3000-home/cypress/e2e/${testFile}`,
      '--browser=chrome',
      '--headless'
    ];
    
    const cypress = spawn(cypressCmd, args, {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    cypress.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} - PASSED`);
        resolve();
      } else {
        console.log(`❌ ${description} - FAILED (exit code: ${code})`);
        reject(new Error(`Test failed with exit code ${code}`));
      }
    });
    
    cypress.on('error', (error) => {
      console.error(`❌ Error running ${description}:`, error.message);
      reject(error);
    });
  });
}

// Function to start Next.js apps
function startApps() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Next.js applications...');
    
    const startCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
    const appProcess = spawn(startCmd, ['app:next:dev'], {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    let startupComplete = false;
    
    appProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready in') && !startupComplete) {
        startupComplete = true;
        console.log('✅ Applications started successfully');
        setTimeout(resolve, 3000); // Give extra time for federation to initialize
      }
    });
    
    appProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready in') && !startupComplete) {
        startupComplete = true;
        console.log('✅ Applications started successfully');
        setTimeout(resolve, 3000);
      }
    });
    
    // Timeout after 60 seconds
    setTimeout(() => {
      if (!startupComplete) {
        console.log('⚠️  Apps may still be starting, proceeding with tests...');
        resolve();
      }
    }, 60000);
    
    appProcess.on('error', (error) => {
      console.error('❌ Error starting applications:', error.message);
      reject(error);
    });
  });
}

// Main test execution
async function runHydrationTests() {
  try {
    console.log('🔍 Pre-flight checks...');
    
    // Check shop page content
    if (!checkShopPageContent()) {
      console.log('📝 Note: Shop page will be modified during tests to include user changes');
    }
    
    // Start applications
    await startApps();
    
    console.log('\n🎯 Running Hydration Fix Validation Tests');
    console.log('==========================================');
    
    // Test 1: Critical second load hydration test
    await runCypressTest(
      'second-load-hydration.cy.ts',
      'Second Load Hydration Validation (CRITICAL)'
    );
    
    // Test 2: Comprehensive hydration validation
    await runCypressTest(
      'hydration-fix-validation.cy.ts',
      'Comprehensive Hydration Fix Validation'
    );
    
    console.log('\n🎉 ALL HYDRATION TESTS COMPLETED SUCCESSFULLY!');
    console.log('==============================================');
    console.log('✅ No hydration errors detected during second page loads');
    console.log('✅ Server-client content synchronization working');
    console.log('✅ HMR updates applied without hydration mismatches');
    console.log('✅ Federation module cache invalidation working');
    
  } catch (error) {
    console.error('\n❌ HYDRATION TESTS FAILED!');
    console.error('===========================');
    console.error('Error:', error.message);
    console.error('\nThis indicates potential hydration issues that need investigation.');
    process.exit(1);
  }
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test execution interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test execution terminated');
  process.exit(0);
});

// Run the tests
if (require.main === module) {
  runHydrationTests().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { runHydrationTests };