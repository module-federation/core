import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { revalidate, flushChunks } from '@module-federation/node/utils';

const FlushedChunks = ({ chunks = [] }) => {
  const scripts = chunks
    .filter((chunk) => chunk.endsWith('.js'))
    .map((chunk) => <script key={chunk} src={chunk} async />);

  const styles = chunks
    .filter((chunk) => chunk.endsWith('.css'))
    .map((chunk) => <link key={chunk} href={chunk} rel="stylesheet" />);

  return (
    <>
      {styles}
      {scripts}
    </>
  );
};

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    if (ctx.pathname) {
      if (!ctx.pathname.endsWith('_error')) {
        await revalidate().then((shouldUpdate) => {
          if (shouldUpdate) {
            console.log('should HMR', shouldUpdate);
          }
        });
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
