async function testWebpackExport() {
  try {
    console.log('Testing webpack export...');
    const bundleExport = require('./dist/hmr-client-demo.js');
    console.log('Bundle export type:', typeof bundleExport);
    console.log('Is Promise:', bundleExport instanceof Promise);

    if (bundleExport instanceof Promise) {
      console.log('Awaiting promise...');
      const result = await bundleExport;
      console.log('Resolved type:', typeof result);
      console.log('Resolved keys:', Object.keys(result || {}));
      console.log('Has hmrClient:', !!result?.hmrClient);
      console.log('Has demoAPI:', !!result?.demoAPI);

      if (result?.hmrClient) {
        const status = result.hmrClient.getStatus();
        console.log('HMR Client attached:', status.isAttached);
        console.log('Has webpack runtime:', status.hasWebpackRequire);
      }
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testWebpackExport();
