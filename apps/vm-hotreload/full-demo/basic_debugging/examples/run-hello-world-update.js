// Simple script to run the Hello World document update
// This demonstrates sending a fake HMR chunk to replace _document.js with a Hello World page

const {
  fakeDocumentUpdates,
  sendFakeDocumentUpdateViaHMRClient,
  sendFakeDocumentUpdateDirect,
} = require('./fake-document-update.js');

console.log('🚀 Running Hello World Document Update...\n');

// Simple function to apply just the hello world update
async function runHelloWorldUpdate() {
  try {
    console.log(
      '📋 This will replace the _document.js with a Hello World page',
    );
    console.log(
      '📋 Using the exact webpack module format: "./pages/_document.js"\n',
    );

    // Get the first update (Hello World)
    const helloWorldUpdate = fakeDocumentUpdates[0];

    console.log('📦 Update Details:');
    console.log('   - Module ID:', helloWorldUpdate.manifest.m[0]);
    console.log('   - Chunk ID:', helloWorldUpdate.manifest.c[0]);
    console.log('   - Update ID:', helloWorldUpdate.originalInfo.updateId);
    console.log(
      '   - Webpack Hash:',
      helloWorldUpdate.originalInfo.webpackHash,
    );

    console.log('\n🔥 Applying Hello World Document Update...');

    // Method 1: Direct application
    const { applyUpdates } = require('../examples/demo/index.js');
    const result = await applyUpdates({ update: helloWorldUpdate }, true); // Force mode

    if (result.success) {
      console.log('✅ Hello World Document Update Applied Successfully!');
      console.log('📊 Result:', result);
      console.log(
        '\n🎉 The _document.js has been replaced with a Hello World page!',
      );
      console.log(
        '🌐 When you visit the Next.js app, you should see the Hello World page',
      );
    } else {
      console.log('❌ Hello World Document Update Failed:', result);
    }

    return result;
  } catch (error) {
    console.error('💥 Error applying Hello World update:', error);
    return { success: false, error };
  }
}

// Alternative method using HMR Client
async function runHelloWorldUpdateViaHMRClient() {
  try {
    console.log('\n🔄 Alternative: Using HMR Client Force Mode...');

    const { HMRClient } = require('@module-federation/node/utils/hmr-client');
    const hmrClient = new HMRClient({ logging: true, autoAttach: true });

    const helloWorldUpdate = fakeDocumentUpdates[0];

    const result = await hmrClient.forceUpdate({
      createMinimalUpdate: false,
      updateData: { update: helloWorldUpdate },
    });

    console.log('🔧 HMR Client Result:', result);

    hmrClient.detach();
    return result;
  } catch (error) {
    console.error('💥 HMR Client error:', error);
    return { success: false, error };
  }
}

// Main execution
async function main() {
  console.log('🎬 Starting Hello World Document HMR Update Demo\n');

  // Try direct application first
  const directResult = await runHelloWorldUpdate();

  // Also try HMR client method
  const hmrClientResult = await runHelloWorldUpdateViaHMRClient();

  console.log('\n📊 Final Results Summary:');
  console.log(
    '   ✅ Direct Application:',
    directResult.success ? 'SUCCESS' : 'FAILED',
  );
  console.log(
    '   ✅ HMR Client Method:',
    hmrClientResult.success ? 'SUCCESS' : 'FAILED',
  );

  if (directResult.success || hmrClientResult.success) {
    console.log(
      '\n🎉 Hello World Document Update Demo Completed Successfully!',
    );
    console.log('\n💡 What happened:');
    console.log(
      '   • The _document.js module was replaced with a Hello World version',
    );
    console.log(
      '   • The new document creates a full-page Hello World display',
    );
    console.log(
      '   • It hides the normal Next.js content and shows custom content',
    );
    console.log('   • The update used the exact webpack module format');
    console.log(
      '\n🌐 To see the result: Visit your Next.js app and you should see the Hello World page!',
    );
  } else {
    console.log('\n❌ Hello World Document Update Demo Failed');
    console.log('💡 Check the logs above for error details');
  }

  return {
    directResult,
    hmrClientResult,
    success: directResult.success || hmrClientResult.success,
  };
}

// Export for use in other files
module.exports = {
  runHelloWorldUpdate,
  runHelloWorldUpdateViaHMRClient,
  main,
};

// Run if this file is executed directly
if (require.main === module) {
  main()
    .then((results) => {
      console.log('\n✅ Demo completed!');
      process.exit(results.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Demo failed:', error);
      process.exit(1);
    });
}
