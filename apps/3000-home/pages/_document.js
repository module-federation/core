import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import {
  revalidate,
  FlushedChunks,
  flushChunks,
} from '@module-federation/nextjs-mf/utils';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    console.log(
      '[Module Federation Document] Processing request for:',
      ctx.pathname,
    );

    // Server-side only checks
    if (
      typeof window === 'undefined' &&
      ctx.pathname &&
      process.env.NODE_ENV === 'development'
    ) {
      if (!ctx.pathname.endsWith('_error')) {
        // Check for HMR trigger via reloadAll query parameter
        const query = ctx.query || {};

        if (query.reloadAll === 'true') {
          console.log(`[HMR Document] 🔥 HMR triggered via ?reloadAll=true`);

          try {
            if (
              global.__NATIVE_SERVER_HMR__ &&
              global.__NATIVE_SERVER_HMR__.reloadAll
            ) {
              const result = global.__NATIVE_SERVER_HMR__.reloadAll();
              console.log(
                `[HMR Document] ✅ reloadAll cleared ${result.totalCleared} modules`,
              );
            } else {
              // Fallback to manual HMR
              const { reloadAll } = require('../lib/server-hmr');
              const result = reloadAll();
              console.log(
                `[HMR Document] ✅ Fallback reloadAll cleared ${result.totalCleared} modules`,
              );
            }
          } catch (error) {
            console.error(`[HMR Document] ❌ Error during reloadAll:`, error);
          }
        }

        // Check for remote changes
        await revalidate();
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

export default MyDocument;
