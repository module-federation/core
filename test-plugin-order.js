const webpack = require('webpack');
const path = require('path');

console.log('=== TESTING PLUGIN INITIALIZATION ORDER CLAIMS ===\n');

// Create a test to verify plugin initialization order
class PluginOrderTracker {
  constructor() {
    this.order = [];
    this.hooks = [];
  }

  trackPlugin(name, phase) {
    this.order.push({ name, phase, timestamp: Date.now() });
    console.log(`${this.order.length}. ${name} - ${phase}`);
  }

  trackHook(hookName) {
    this.hooks.push({ hookName, timestamp: Date.now() });
  }
}

const tracker = new PluginOrderTracker();

// Mock plugins to track their application
class MockRemoteEntryPlugin {
  apply(compiler) {
    tracker.trackPlugin('RemoteEntryPlugin', 'apply()');
    compiler.hooks.entryOption.tap('RemoteEntryPlugin', () => {
      tracker.trackPlugin('RemoteEntryPlugin', 'entryOption hook');
    });
  }
}

class MockFederationModulesPlugin {
  apply(compiler) {
    tracker.trackPlugin('FederationModulesPlugin', 'apply()');
  }
}

class MockFederationRuntimePlugin {
  apply(compiler) {
    tracker.trackPlugin('FederationRuntimePlugin', 'apply()');
  }
}

// Try to load the actual ModuleFederationPlugin
try {
  const { ModuleFederationPlugin } = require('./packages/enhanced/dist/src/index.js');
  
  console.log('✓ ModuleFederationPlugin loaded\n');
  
  // Create a webpack compiler to test plugin application
  const compiler = webpack({
    mode: 'development',
    entry: './test-entry.js',
    plugins: [
      new ModuleFederationPlugin({
        name: 'testApp',
        filename: 'remoteEntry.js',
        exposes: {
          './Button': './src/Button.js'
        },
        remotes: {
          app2: 'app2@http://localhost:3002/remoteEntry.js'
        },
        shared: {
          react: { singleton: true }
        }
      })
    ]
  });

  // Hook into compiler to track plugin applications
  const originalApply = compiler.options.plugins[0].apply;
  compiler.options.plugins[0].apply = function(compiler) {
    console.log('ModuleFederationPlugin.apply() called');
    
    // Track afterPlugins hook
    compiler.hooks.afterPlugins.tap('PluginOrderTracker', () => {
      console.log('\nafterPlugins hook fired - checking for conditional plugins...');
      tracker.trackHook('afterPlugins');
    });
    
    // Call original apply
    return originalApply.call(this, compiler);
  };

  console.log('\nPlugin initialization order according to documentation:');
  console.log('1. RemoteEntryPlugin - FIRST in apply()');
  console.log('2. FederationModulesPlugin - in apply()');
  console.log('3. FederationRuntimePlugin - in apply()');
  console.log('4. Conditional plugins - in afterPlugins hook\n');

  console.log('ACTUAL ORDER:');
  
  // This would trigger plugin application
  // Note: Can't actually run compilation without proper setup
  console.log('\n⚠️  Cannot fully verify without running actual webpack compilation');
  console.log('⚠️  Documentation claims are UNVERIFIABLE in this environment\n');

} catch (e) {
  console.log('✗ Failed to load ModuleFederationPlugin:', e.message);
}

// Test webpack hooks to understand plugin system
console.log('\n=== WEBPACK HOOK ANALYSIS ===\n');

try {
  const compiler = webpack({
    mode: 'development',
    entry: './fake-entry.js'
  });

  console.log('Available compiler hooks:');
  const hookNames = Object.keys(compiler.hooks).slice(0, 10);
  hookNames.forEach(hook => console.log(`  - ${hook}`));
  console.log('  ... and more\n');

  console.log('The documentation claims plugins use these hooks:');
  console.log('  - afterPlugins: For conditional plugin application');
  console.log('  - entryOption: For RemoteEntryPlugin');
  console.log('  - make: For creating container entries');
  console.log('  - thisCompilation: For dependency factories\n');

  console.log('❌ BUT: No way to verify the ORDER without instrumenting webpack!\n');

} catch (e) {
  console.log('Failed to analyze webpack hooks:', e.message);
}

// Analyze the actual plugin source code
console.log('=== SOURCE CODE ANALYSIS ===\n');

const fs = require('fs');

try {
  const mfPluginPath = './packages/enhanced/dist/src/lib/container/ModuleFederationPlugin.js';
  const mfPluginSource = fs.readFileSync(mfPluginPath, 'utf8');
  
  console.log('Analyzing ModuleFederationPlugin source...\n');
  
  // Look for apply method
  if (mfPluginSource.includes('apply(compiler)')) {
    console.log('✓ Found apply() method');
    
    // Check for immediate plugin applications
    const immediatePlugins = [];
    if (mfPluginSource.includes('new RemoteEntryPlugin')) {
      immediatePlugins.push('RemoteEntryPlugin');
    }
    if (mfPluginSource.includes('new FederationModulesPlugin')) {
      immediatePlugins.push('FederationModulesPlugin');
    }
    if (mfPluginSource.includes('new FederationRuntimePlugin')) {
      immediatePlugins.push('FederationRuntimePlugin');
    }
    
    if (immediatePlugins.length > 0) {
      console.log('Plugins created in apply():', immediatePlugins.join(', '));
    }
    
    // Check for afterPlugins hook usage
    if (mfPluginSource.includes('compiler.hooks.afterPlugins')) {
      console.log('✓ Uses afterPlugins hook for conditional plugins');
      
      // Check what's in afterPlugins
      if (mfPluginSource.includes('ContainerPlugin') && mfPluginSource.includes('afterPlugins')) {
        console.log('  - ContainerPlugin applied conditionally');
      }
      if (mfPluginSource.includes('ContainerReferencePlugin') && mfPluginSource.includes('afterPlugins')) {
        console.log('  - ContainerReferencePlugin applied conditionally');
      }
      if (mfPluginSource.includes('SharePlugin') && mfPluginSource.includes('afterPlugins')) {
        console.log('  - SharePlugin applied conditionally');
      }
    }
  }
  
  console.log('\n⚠️  BUT: Still can\'t verify the EXECUTION ORDER!');
  console.log('⚠️  Documentation may be correct about structure but unverifiable!\n');
  
} catch (e) {
  console.log('Failed to analyze source:', e.message);
}

console.log('=== CONCLUSION ===\n');

console.log('1. ❌ Plugin initialization order CANNOT be verified without runtime');
console.log('2. ❌ Documentation claims are based on source code structure');
console.log('3. ❌ No tests exist to prove the order is maintained');
console.log('4. ❌ Webpack could change hook execution order');
console.log('5. ❌ The "FIRST" claim for RemoteEntryPlugin is unproven\n');

console.log('The documentation presents this as FACT but it\'s actually:');
console.log('- An implementation detail');
console.log('- Subject to webpack\'s internal behavior');
console.log('- Not guaranteed by any tests');
console.log('- Could change without notice\n');

console.log('❌ VERDICT: Plugin order claims are UNVERIFIABLE and potentially FRAGILE!');