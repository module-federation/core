import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document'
import {revalidate, FlushedChunks} from "@module-federation/nextjs-mf/utils";
import {flushChunks} from '@module-federation/node/utils'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const chunks = await flushChunks()
    ctx?.res?.on('finish', () => {
      revalidate().then((shouldUpdate) => {
        console.log('finished sending response', shouldUpdate);
      })
    })

    return {
      ...initialProps,
      chunks
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <FlushedChunks chunks={this.props.chunks}/>
        </Head>
        <body>
        <Main />
        <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
