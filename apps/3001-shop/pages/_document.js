import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import {
  FlushedChunks,
  flushChunks,
  withFederatedRequest,
} from '@module-federation/nextjs-mf/server';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const { initialProps, chunks } = await withFederatedRequest(async () => {
      const initialProps = await Document.getInitialProps(ctx);
      const chunks = await flushChunks();

      return {
        initialProps,
        chunks,
      };
    });

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
