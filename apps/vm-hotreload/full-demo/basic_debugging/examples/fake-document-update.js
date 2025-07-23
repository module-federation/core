// Fake Document Update Example - Following example-usage.js pattern
// This creates and sends fake update chunks specifically for _document.js replacement

const {
  setUpdateProvider,
  createQueueUpdateProvider,
  createCallbackUpdateProvider,
  applyUpdates,
  forceUpdate,
} = require('../examples/demo/index.js');

const { HMRClient } = require('@module-federation/node/utils/hmr-client');

console.log('\n🔥 === Fake Document Update Example ===');

// Create fake document update payload following example-usage.js structure
const fakeDocumentUpdates = [
  {
    manifest: {
      h: 'fake-doc-v1.0.0',
      c: ['pages/_document'], // chunk name for document (Next.js format)
      r: [], // removed chunks
      m: ['./pages/_document.js'], // correct module ID
    },
    script: `
      // FAKE UPDATE CHUNK for _document.js replacement (Next.js webpack format)
      (() => {
        var exports = {};
        exports.id = "pages/_document";
        exports.ids = ["pages/_document"];
        exports.modules = {
          "./pages/_document.js": function(module, __webpack_exports__, __webpack_require__) {
          __webpack_require__.r(__webpack_exports__);
          __webpack_require__.d(__webpack_exports__, {
            "default": () => (__WEBPACK_DEFAULT_EXPORT__)
          });

          const React = require('react');
          const Document = require('next/document').default;
          const { Html, Head, Main, NextScript } = require('next/document');

          console.log('🔥 HELLO WORLD DOCUMENT MODULE LOADED VIA HMR UPDATE CHUNK');

          class HelloWorldDocument extends Document {
            static async getInitialProps(ctx) {
              console.log('[HMR] 👋 Hello World Document getInitialProps called');
              const initialProps = await Document.getInitialProps(ctx);
              return {
                ...initialProps,
                helloWorld: true,
                hmrTimestamp: Date.now(),
                hmrUpdateId: 'hello-world-' + Math.random().toString(36).substr(2, 9)
              };
            }

            render() {
              console.log('[HMR] 👋 Hello World Document render called');
              return React.createElement(Html, { lang: 'en' }, [
                React.createElement(Head, { key: 'head' }, [
                  React.createElement('title', { key: 'title' }, 'Hello World HMR Document'),
                  React.createElement('meta', {
                    key: 'hello-meta',
                    name: 'description',
                    content: 'Hello World from HMR Updated Document'
                  }),
                  React.createElement('style', {
                    key: 'hello-styles',
                    dangerouslySetInnerHTML: {
                      __html: \`
                        body {
                          margin: 0;
                          padding: 0;
                          font-family: 'Arial', sans-serif;
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          color: white;
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          min-height: 100vh;
                        }
                        .hello-container {
                          text-align: center;
                          padding: 40px;
                          background: rgba(255, 255, 255, 0.1);
                          border-radius: 20px;
                          backdrop-filter: blur(10px);
                          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                        }
                        .hello-title {
                          font-size: 3rem;
                          margin-bottom: 20px;
                          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                        }
                        .hello-subtitle {
                          font-size: 1.5rem;
                          margin-bottom: 30px;
                          opacity: 0.9;
                        }
                        .hello-info {
                          font-size: 1rem;
                          opacity: 0.8;
                          margin-top: 20px;
                        }
                        .pulse {
                          animation: pulse 2s infinite;
                        }
                        @keyframes pulse {
                          0% { transform: scale(1); }
                          50% { transform: scale(1.05); }
                          100% { transform: scale(1); }
                        }
                      \`
                    }
                  })
                ]),
                React.createElement('body', { key: 'body' }, [
                  React.createElement('div', {
                    key: 'hello-container',
                    className: 'hello-container pulse'
                  }, [
                    React.createElement('h1', {
                      key: 'title',
                      className: 'hello-title'
                    }, '👋 Hello World!'),
                    React.createElement('p', {
                      key: 'subtitle',
                      className: 'hello-subtitle'
                    }, 'This document was hot-reloaded via HMR! 🔥'),
                    React.createElement('div', {
                      key: 'info',
                      className: 'hello-info'
                    }, [
                      React.createElement('p', { key: 'timestamp' }, 'Updated at: ' + new Date().toLocaleString()),
                      React.createElement('p', { key: 'id' }, 'Update ID: ' + this.props.hmrUpdateId),
                      React.createElement('p', { key: 'success' }, '✅ HMR Document Replacement Successful!')
                    ])
                  ]),
                  React.createElement(Main, { key: 'main', style: { display: 'none' } }),
                  React.createElement(NextScript, { key: 'script' })
                ])
              ]);
            }
          }

          const __WEBPACK_DEFAULT_EXPORT__ = HelloWorldDocument;
          module.exports = HelloWorldDocument;
        }
      };

      exports.runtime = function(__webpack_require__) {
        console.log('[FAKE HMR] 🔧 Fake document update chunk v1.0.0 runtime executed');
        if (__webpack_require__ && __webpack_require__.m) {
          console.log('[FAKE HMR] 📦 Available modules after fake update:', Object.keys(__webpack_require__.m));
        }
      };
    `,
    originalInfo: {
      updateId: 'fake-document-update-v1.0.0',
      webpackHash: 'fake-doc-v1.0.0',
    },
  },
  {
    manifest: {
      h: 'fake-doc-v2.0.0',
      c: ['_document'],
      r: [],
      m: ['./_document'],
    },
    script: `
      // FAKE UPDATE CHUNK v2.0.0 for _document.js replacement
      exports.modules = {
        './_document': function(module, exports, __webpack_require__) {
          const React = require('react');
          const Document = require('next/document').default;
          const { Html, Head, Main, NextScript } = require('next/document');

          console.log('🚀 FAKE DOCUMENT MODULE v2.0.0 LOADED VIA HMR UPDATE CHUNK');

          class SuperFakeUpdatedDocument extends Document {
            static async getInitialProps(ctx) {
              console.log('[FAKE HMR] 🎉 Super Fake Document v2.0.0 getInitialProps called');
              const initialProps = await Document.getInitialProps(ctx);
              return {
                ...initialProps,
                fakeVersion: '2.0.0',
                hmrTimestamp: Date.now(),
                hmrUpdateId: 'super-fake-document-v2.0.0-' + Math.random().toString(36).substr(2, 9),
                isFakeUpdate: true,
                superFake: true
              };
            }

            render() {
              console.log('[FAKE HMR] 🎉 Super Fake Document v2.0.0 render called');
              return React.createElement(Html, { lang: 'en', 'data-fake-version': '2.0.0' }, [
                React.createElement(Head, { key: 'head' }, [
                  React.createElement('meta', {
                    key: 'fake-version',
                    name: 'fake-document-version',
                    content: 'v2.0.0-SUPER'
                  }),
                  React.createElement('meta', {
                    key: 'hmr-meta',
                    name: 'hmr-updated',
                    content: 'super-fake-document-updated-' + this.props.hmrTimestamp
                  }),
                  React.createElement('style', {
                    key: 'super-fake-styles',
                    dangerouslySetInnerHTML: {
                      __html: \`
                        body {
                          background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
                          animation: rainbow 3s infinite;
                        }
                        @keyframes rainbow {
                          0% { filter: hue-rotate(0deg); }
                          100% { filter: hue-rotate(360deg); }
                        }
                      \`
                    }
                  })
                ]),
                React.createElement('body', { key: 'body', className: 'super-fake-updated' }, [
                  React.createElement('div', {
                    key: 'super-fake-banner',
                    style: {
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      padding: '15px',
                      textAlign: 'center',
                      zIndex: 9999,
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }
                  }, '🎉 SUPER FAKE DOCUMENT UPDATE v2.0.0 WITH RAINBOW BACKGROUND!'),
                  React.createElement(Main, { key: 'main' }),
                  React.createElement(NextScript, { key: 'script' })
                ])
              ]);
            }
          }

          module.exports = SuperFakeUpdatedDocument;
          exports.default = SuperFakeUpdatedDocument;
        }
      };

      exports.runtime = function(__webpack_require__) {
        console.log('[FAKE HMR] 🎉 Super fake document update chunk v2.0.0 runtime executed');
        if (__webpack_require__ && __webpack_require__.m) {
          console.log('[FAKE HMR] 🌈 Available modules after super fake update:', Object.keys(__webpack_require__.m));
        }
      };
    `,
    originalInfo: {
      updateId: 'super-fake-document-update-v2.0.0',
      webpackHash: 'fake-doc-v2.0.0',
    },
  },
];

// Method 1: Using Queue Provider (like example-usage.js)
async function sendFakeDocumentUpdateViaQueue() {
  console.log(
    '\n🔄 Method 1: Sending fake document updates via Queue Provider',
  );

  const queueProvider = createQueueUpdateProvider(fakeDocumentUpdates);
  setUpdateProvider(queueProvider);

  console.log('✅ Queue provider configured with fake document updates');

  // Apply first fake update
  console.log('\n📤 Applying first fake document update...');
  const result1 = await applyUpdates(await queueProvider());
  console.log(
    'Result 1:',
    result1.success ? '✅ Success' : '❌ Failed',
    result1,
  );

  // Apply second fake update
  console.log('\n📤 Applying second fake document update...');
  const result2 = await applyUpdates(await queueProvider());
  console.log(
    'Result 2:',
    result2.success ? '✅ Success' : '❌ Failed',
    result2,
  );

  return { result1, result2 };
}

// Method 2: Using Callback Provider for Dynamic Fake Updates
async function sendFakeDocumentUpdateViaCallback() {
  console.log(
    '\n🔄 Method 2: Sending fake document updates via Callback Provider',
  );

  let callCount = 0;
  const callbackProvider = createCallbackUpdateProvider(async (currentHash) => {
    callCount++;
    console.log(
      `📞 Callback called ${callCount} times with hash: ${currentHash}`,
    );

    if (callCount <= fakeDocumentUpdates.length) {
      const update = fakeDocumentUpdates[callCount - 1];
      console.log(
        `🎯 Returning fake document update ${callCount}: ${update.originalInfo.updateId}`,
      );
      return { update };
    }

    console.log('📭 No more fake updates available');
    return { update: null };
  });

  setUpdateProvider(callbackProvider);

  // Apply updates via callback
  const results = [];
  for (let i = 1; i <= 2; i++) {
    console.log(`\n📤 Requesting fake document update ${i} via callback...`);
    const updateData = await callbackProvider();
    if (updateData && updateData.update) {
      const result = await applyUpdates(updateData);
      console.log(
        `Result ${i}:`,
        result.success ? '✅ Success' : '❌ Failed',
        result,
      );
      results.push(result);
    }
  }

  return results;
}

// Method 3: Using HMR Client Force Update
async function sendFakeDocumentUpdateViaHMRClient() {
  console.log(
    '\n🔄 Method 3: Sending fake document updates via HMR Client Force Mode',
  );

  const hmrClient = new HMRClient({ logging: true, autoAttach: true });

  // Set up provider with fake updates
  const queueProvider = createQueueUpdateProvider(fakeDocumentUpdates);
  hmrClient.setUpdateProvider(queueProvider);

  console.log('📊 HMR Client Status:', hmrClient.getStatus());

  // Force apply first update
  console.log('\n💥 Force applying first fake document update...');
  const result1 = await hmrClient.forceUpdate({
    createMinimalUpdate: false,
    updateData: { update: fakeDocumentUpdates[0] },
  });
  console.log('Force Result 1:', result1);

  // Force apply second update
  console.log('\n💥 Force applying second fake document update...');
  const result2 = await hmrClient.forceUpdate({
    createMinimalUpdate: false,
    updateData: { update: fakeDocumentUpdates[1] },
  });
  console.log('Force Result 2:', result2);

  console.log('\n📈 Final HMR Client Stats:', hmrClient.getStats());

  hmrClient.detach();
  return { result1, result2, stats: hmrClient.getStats() };
}

// Method 4: Direct Application (Manual)
async function sendFakeDocumentUpdateDirect() {
  console.log('\n🔄 Method 4: Sending fake document updates directly');

  const results = [];

  for (let i = 0; i < fakeDocumentUpdates.length; i++) {
    const update = fakeDocumentUpdates[i];
    console.log(
      `\n📤 Directly applying fake document update ${i + 1}: ${update.originalInfo.updateId}`,
    );

    const result = await applyUpdates({ update }, true); // Force mode
    console.log(
      `Direct Result ${i + 1}:`,
      result.success ? '✅ Success' : '❌ Failed',
      result,
    );
    results.push(result);
  }

  return results;
}

// Main execution function
async function runFakeDocumentUpdateDemo() {
  try {
    console.log('🎬 Starting Fake Document Update Demo...\n');
    console.log(
      '📋 This demo creates fake HMR update chunks for _document.js replacement',
    );
    console.log(
      '📋 Following the same payload structure as example-usage.js\n',
    );

    // Run all methods
    const queueResults = await sendFakeDocumentUpdateViaQueue();
    const callbackResults = await sendFakeDocumentUpdateViaCallback();
    const hmrClientResults = await sendFakeDocumentUpdateViaHMRClient();
    const directResults = await sendFakeDocumentUpdateDirect();

    console.log('\n🎉 Fake Document Update Demo completed!');
    console.log('\n📊 Summary:');
    console.log(
      '   ✅ Queue Provider:',
      queueResults.result1.success && queueResults.result2.success,
    );
    console.log(
      '   ✅ Callback Provider:',
      callbackResults.every((r) => r.success),
    );
    console.log(
      '   ✅ HMR Client Force:',
      hmrClientResults.result1.success && hmrClientResults.result2.success,
    );
    console.log(
      '   ✅ Direct Application:',
      directResults.every((r) => r.success),
    );

    return {
      queueResults,
      callbackResults,
      hmrClientResults,
      directResults,
      allSuccess:
        queueResults.result1.success &&
        queueResults.result2.success &&
        callbackResults.every((r) => r.success) &&
        hmrClientResults.result1.success &&
        hmrClientResults.result2.success &&
        directResults.every((r) => r.success),
    };
  } catch (error) {
    console.error('❌ Fake Document Update Demo failed:', error);
    return { error };
  }
}

// Export for use in other files
module.exports = {
  fakeDocumentUpdates,
  sendFakeDocumentUpdateViaQueue,
  sendFakeDocumentUpdateViaCallback,
  sendFakeDocumentUpdateViaHMRClient,
  sendFakeDocumentUpdateDirect,
  runFakeDocumentUpdateDemo,
};

// Run demo if this file is executed directly
if (require.main === module) {
  runFakeDocumentUpdateDemo()
    .then((results) => {
      console.log('\n✅ Demo completed successfully!');
      console.log(
        'Results:',
        results.allSuccess ? 'ALL METHODS SUCCESSFUL' : 'SOME METHODS FAILED',
      );
    })
    .catch(console.error);
}
