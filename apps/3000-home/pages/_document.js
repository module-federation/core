import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import {
  revalidate,
  FlushedChunks,
  flushChunks,
} from '@module-federation/nextjs-mf/utils';

// Import HMR utilities directly for server-side use
import { HMRClient } from '@module-federation/node/utils/hmr-client';

// Create and send in-memory update chunk for _document.js module (SERVER-SIDE ONLY)
async function sendDocumentUpdateChunk() {
  try {
    console.log(
      '[HMR] 🚀 Creating fake update chunk for _document.js (force mode)',
    );

    // Use HMR client with force mode
    const hmrClient = new HMRClient({ logging: true });

    // Create fake document module content for replacement
    const fakeDocumentModuleContent = `
      // FAKE UPDATE CHUNK for _document.js module via Force HMR
      exports.modules = {
        './_document': function(module, exports, __webpack_require__) {
          const React = require('react');
          const Document = require('next/document').default;
          const { Html, Head, Main, NextScript } = require('next/document');

          console.log('[HMR] 🔥 FAKE DOCUMENT MODULE LOADED VIA FORCE UPDATE CHUNK');

          class FakeUpdatedMyDocument extends Document {
            static async getInitialProps(ctx) {
              console.log('[HMR] 🆕 FAKE Updated Document getInitialProps called');
              const initialProps = await Document.getInitialProps(ctx);
              return {
                ...initialProps,
                hmrTimestamp: Date.now(),
                hmrUpdateId: 'fake-document-hmr-' + Math.random().toString(36).substr(2, 9),
                isFakeUpdate: true
              };
            }

            render() {
              console.log('[HMR] 🆕 FAKE Updated Document render called');
              return React.createElement(Html, null, [
                React.createElement(Head, { key: 'head' }, [
                  React.createElement('meta', {
                    key: 'hmr-meta',
                    name: 'hmr-updated',
                    content: 'fake-document-updated-' + this.props.hmrTimestamp
                  }),
                  React.createElement('meta', {
                    key: 'fake-meta',
                    name: 'fake-update',
                    content: 'true'
                  })
                ]),
                React.createElement('body', { key: 'body' }, [
                  React.createElement(Main, { key: 'main' }),
                  React.createElement(NextScript, { key: 'script' })
                ])
              ]);
            }
          }

          module.exports = FakeUpdatedMyDocument;
          exports.default = FakeUpdatedMyDocument;
        }
      };

      exports.runtime = function(__webpack_require__) {
        console.log('[HMR] 🔧 FAKE Document update chunk runtime executed');
        if (__webpack_require__ && __webpack_require__.m) {
          console.log('[HMR] 📦 Available modules:', Object.keys(__webpack_require__.m));
        }
      };
    `;

    // Create fake manifest for the update
    const fakeUpdateManifest = {
      h: 'fake-doc-hash-' + Date.now(),
      c: ['pages/_document'], // chunks to update
      r: ['pages/_document'], // removed chunks
      m: ['./pages/_document.js'], // updated modules
    };

    // Set up custom update provider with fake chunk
    const fakeUpdateProvider = async () => {
      return {
        update: {
          manifest: fakeUpdateManifest,
          script: fakeDocumentModuleContent,
          originalInfo: {
            updateId: 'fake-document-update-' + Date.now(),
            webpackHash: fakeUpdateManifest.h,
            isFakeUpdate: true,
          },
        },
      };
    };

    hmrClient.setUpdateProvider(fakeUpdateProvider);

    console.log(
      '[HMR] 📤 Applying fake document update chunk via force mode...',
    );
    const result = await hmrClient.forceUpdate({
      createMinimalUpdate: false, // We're providing our own fake update
      updateData: await fakeUpdateProvider(),
    });

    console.log('[HMR] 📥 Fake document update result:', result);

    return result;
  } catch (error) {
    console.error('[HMR] ❌ Error applying fake document update chunk:', error);
    return { success: false, error };
  }
}

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    console.log(
      '[Module Federation Document] Processing request for:',
      ctx.pathname,
    );

    if (ctx.pathname) {
      if (!ctx.pathname.endsWith('_error')) {
        // Use HMR client directly instead of revalidate
        try {
          console.log(
            '[Module Federation Document] 🔥 Using HMR client directly for change detection',
          );

          // Initialize HMR client and check for changes (using eager imports)
          const hmrClient = new HMRClient();
          const hasChanges = await hmrClient.checkForUpdates();
          console.log(
            '[Module Federation Document] HMR client change detection:',
            hasChanges,
          );

          if (hasChanges && hasChanges.success) {
            console.log(
              '[Module Federation Document] 🔥 CHANGES DETECTED via HMR client:',
              hasChanges,
            );
          } else {
            console.log(
              '[Module Federation Document] No changes detected by HMR client',
            );
          }
        } catch (error) {
          console.error(
            '[Module Federation Document] Error using HMR client:',
            error,
          );

          // Fallback to standard revalidation
          await revalidate().then((shouldUpdate) => {
            if (shouldUpdate) {
              console.log(
                '[Module Federation Document] 🔥 FALLBACK: Remote changes detected via standard revalidation',
                shouldUpdate,
              );
            } else {
              console.log(
                '[Module Federation Document] FALLBACK: No remote changes detected',
              );
            }
          });
        }
      }
    }

    const initialProps = await Document.getInitialProps(ctx);

    const chunks = await flushChunks();

    return {
      ...initialProps,
      chunks,
    };
  }

  render() {
    return (
      <Html>
        <Head>
          <FlushedChunks chunks={this.props.chunks} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// Enable comprehensive HMR self-acceptance for Next.js _document.js
if (typeof module !== 'undefined' && module.hot) {
  // Self-accept this module
  module.hot.accept(function (err) {
    if (err) {
      console.error('[HMR] Error during document hot update:', err);
      return;
    }
    console.log('[HMR] 🔥 Document component self-accepted and updated');
  });

  // Accept dependencies that might affect this document
  module.hot.accept(
    [
      // Fixed: Check if webpack require exists before using it
      (function () {
        try {
          return typeof __webpack_require__ !== 'undefined'
            ? Object.keys(__webpack_require__.m || {})
            : [];
        } catch (e) {
          return [];
        }
      })(),
    ],
    function (updatedDependencies) {
      console.log(
        '[HMR] 🔄 Document dependencies updated:',
        updatedDependencies,
      );

      // Server-side dependency change handling
      console.log(
        '[HMR] 🔄 Server-side document dependencies changed, triggering module reload',
      );
    },
  );

  // Dispose handler for cleanup
  module.hot.dispose(function (data) {
    console.log('[HMR] 🗑️ Disposing document module');
    data.wasDocumentDisposed = true;
  });

  // Accept data from the disposed module
  if (module.hot.data && module.hot.data.wasDocumentDisposed) {
    console.log('[HMR] 📦 Restored document from disposed state');
  }

  // Status change handler
  module.hot.addStatusHandler(function (status) {
    console.log('[HMR] 📊 Document HMR status changed to:', status);

    switch (status) {
      case 'check':
        console.log('[HMR] 🔍 Checking for document updates...');
        break;
      case 'prepare':
        console.log('[HMR] 🛠️ Preparing document update...');
        break;
      case 'ready':
        console.log('[HMR] ✅ Document update ready');
        break;
      case 'dispose':
        console.log('[HMR] 🗑️ Disposing old document version');
        break;
      case 'apply':
        console.log('[HMR] 🚀 Applying document update');
        break;
      case 'idle':
        console.log('[HMR] 😴 Document HMR idle');
        break;
      case 'fail':
        console.error('[HMR] ❌ Document HMR failed');
        break;
      case 'abort':
        console.error('[HMR] 🛑 Document HMR aborted');
        break;
    }
  });

  // Make the document module self-accepting for all scenarios
  module.hot.accept(() => {
    console.log('[HMR] 🔥 Document module hot reloaded successfully');
  });

  // Server-side auto-trigger for testing (no window dependency)
  setTimeout(() => {
    console.log('[HMR] 🕐 Auto-triggering server-side FAKE document update...');
    sendDocumentUpdateChunk().catch((err) => {
      console.error('[HMR] ❌ Fake auto-update failed:', err);
    });
  }, 5000); // Send fake update after 5 seconds

  // Expose function on global scope for server-side access
  if (typeof global !== 'undefined') {
    global.sendFakeDocumentUpdate = sendDocumentUpdateChunk;
    console.log(
      '[HMR] 🌐 Server-side function available: global.sendFakeDocumentUpdate()',
    );
  }
}

export default MyDocument;
