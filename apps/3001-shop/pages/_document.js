import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import {
  revalidate,
  FlushedChunks,
  flushChunks,
} from '@module-federation/nextjs-mf/utils';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    await revalidate().then((shouldUpdate) => {
      if (shouldUpdate) {
        ctx.res.writeHead(307, { Location: ctx.req.url });
        ctx.res.end();
      }
    });
    const initialProps = await Document.getInitialProps(ctx);
    const chunks = await flushChunks();
    ctx?.res?.on('finish', () => {
      // revalidate().then((shouldUpdate) => {
      //   if (shouldUpdate) {
      //     console.log('should HMR', shouldUpdate);
      //   }
      // });
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
