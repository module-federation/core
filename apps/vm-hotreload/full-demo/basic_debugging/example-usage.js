// Example usage of the new callback-based update provider system

const {
  setUpdateProvider,
  createQueueUpdateProvider,
  createCallbackUpdateProvider,
  incrementCounter,
  getCounter,
  forceUpdate,
  applyUpdates,
  runDemo,
  startUpdatePolling,
} = require('./src/index.js');

// Example 1: Using a queue-based update provider
console.log('\n=== Example 1: Queue-based Updates ===');

const testUpdates = [
  {
    manifest: {
      h: 'abc123',
      c: ['index'],
      r: ['index'],
      m: ['./src/index.js'],
    },
    script: `
      // Updated module code
      exports.modules = {
        './src/index.js': function(module, exports, require) {
          console.log('🚀 Updated module loaded!');
          module.exports = { message: 'Updated!' };
        }
      };
    `,
    originalInfo: {
      updateId: 'update-001',
      webpackHash: 'abc123',
    },
  },
  {
    manifest: {
      h: 'def456',
      c: ['index'],
      r: ['index'],
      m: ['./src/index.js'],
    },
    script: `
      // Another updated module code
      exports.modules = {
        './src/index.js': function(module, exports, require) {
          console.log('🎉 Second update loaded!');
          module.exports = { message: 'Second Update!' };
        }
      };
    `,
    originalInfo: {
      updateId: 'update-002',
      webpackHash: 'def456',
    },
  },
];

const queueProvider = createQueueUpdateProvider(testUpdates);
setUpdateProvider(queueProvider);

console.log('✅ Queue provider configured with test updates');

// Example 2: Using a callback-based update provider
console.log('\n=== Example 2: Callback-based Updates ===');

const callbackProvider = createCallbackUpdateProvider(async (currentHash) => {
  console.log(`📋 Callback called with current hash: ${currentHash}`);

  // Simulate some logic to determine if an update is available
  const shouldUpdate = Math.random() > 0.7; // 30% chance of update

  if (shouldUpdate) {
    return {
      update: {
        manifest: {
          h: 'callback-hash-' + Date.now(),
          c: ['index'],
          r: ['index'],
          m: ['./src/index.js'],
        },
        script: `
          exports.modules = {
            './src/index.js': function(module, exports, require) {
              console.log('📞 Callback-generated update!');
              module.exports = { message: 'Callback Update!' };
            }
          };
        `,
        originalInfo: {
          updateId: 'callback-update-' + Date.now(),
          webpackHash: 'callback-hash-' + Date.now(),
        },
      },
    };
  }

  return { update: null };
});

// setUpdateProvider(callbackProvider);
// console.log('✅ Callback provider configured');

// Example 3: Creating a custom file-based update provider
console.log('\n=== Example 3: Custom File-based Provider ===');

const fs = require('fs');
const path = require('path');

function createFileUpdateProvider(updatesDir) {
  return async function fileUpdateProvider() {
    try {
      const updatesPath = path.join(__dirname, updatesDir);

      if (!fs.existsSync(updatesPath)) {
        return { update: null };
      }

      const files = fs
        .readdirSync(updatesPath)
        .filter((f) => f.endsWith('.json'));

      if (files.length === 0) {
        return { update: null };
      }

      // Get the most recent update file
      const latestFile = files.sort().pop();
      const updatePath = path.join(updatesPath, latestFile);
      const updateData = JSON.parse(fs.readFileSync(updatePath, 'utf8'));

      // Remove the file after reading to prevent reprocessing
      fs.unlinkSync(updatePath);

      console.log(`📁 Loaded update from file: ${latestFile}`);
      return { update: updateData };
    } catch (error) {
      console.error('Error in file update provider:', error);
      return { update: null };
    }
  };
}

// Uncomment to use file-based provider:
// const fileProvider = createFileUpdateProvider('updates');
// setUpdateProvider(fileProvider);
// console.log('✅ File provider configured');

console.log('\n=== Testing Counter Functionality ===');
console.log('Current counter:', getCounter());
incrementCounter();
incrementCounter();
console.log('After increments:', getCounter());

console.log('\n=== Example 4: Force Update Mode ===');

async function demonstrateForceMode() {
  console.log('🔧 Demonstrating force update capabilities...');

  // Force update with no provider (will create default update)
  console.log('1. Force update with no update data:');
  await forceUpdate();

  // Force update with empty update data
  console.log('\n2. Force apply with empty update data:');
  await applyUpdates(null, true);

  // Force update with existing update data
  console.log(
    '\n3. Force apply with existing update (will populate manifest):',
  );
  const partialUpdate = {
    update: {
      manifest: { h: 'test', c: [], r: [], m: [] }, // Empty arrays will be populated
      script: 'console.log("Force applied partial update");',
      originalInfo: { updateId: 'force-test', webpackHash: 'test' },
    },
  };
  await applyUpdates(partialUpdate, true);

  // Demonstrate force polling
  console.log(
    '\n4. Starting force polling (will apply updates even when none available):',
  );
  console.log('   This would continuously force reinstall current modules');
  // const forcePollingInterval = await startUpdatePolling(2000, true);
  // setTimeout(() => clearInterval(forcePollingInterval), 10000); // Stop after 10 seconds
}

// Uncomment to run force mode demonstration:
// demonstrateForceMode();

console.log('\n=== Provider System Ready ===');
console.log('💡 The HMR system is now using configurable update providers!');
console.log('💡 You can switch providers anytime using setUpdateProvider()');
console.log(
  '💡 Use force mode to reinstall current modules: forceUpdate() or applyUpdates(data, true)',
);
console.log(
  '💡 Force polling will continuously reinstall even with no updates: startUpdatePolling(interval, true)',
);
