import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import {
  ensureRemoteHotReload,
  flushChunks,
} from '@module-federation/node/utils';

const REMOTE_ENTRY_URLS = [
  'http://localhost:3000/_next/static/chunks/remoteEntry.js',
  'http://localhost:3001/_next/static/chunks/remoteEntry.js',
];

const shouldEnableRemoteHotReload =
  process.env.MF_REMOTE_HOT_RELOAD === 'true' ||
  (process.env.NODE_ENV === 'production' &&
    process.env.MF_REMOTE_HOT_RELOAD !== 'false');

const remoteHotReload = ensureRemoteHotReload({
  enabled: shouldEnableRemoteHotReload,
  intervalMs: Number(process.env.MF_REMOTE_REVALIDATE_INTERVAL_MS || 10_000),
  immediate: false,
});

const FlushedChunks = ({ chunks = [] }) => {
  const combinedChunks = Array.from(new Set([...REMOTE_ENTRY_URLS, ...chunks]));
  const scripts = combinedChunks
    .filter((chunk) => chunk.endsWith('.js'))
    .map((chunk) => {
      const isRemoteEntry = chunk.includes('remoteEntry');
      return <script key={chunk} src={chunk} async={!isRemoteEntry} />;
    });

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
    void remoteHotReload;

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
