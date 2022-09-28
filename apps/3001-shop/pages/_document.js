import Document, { Html, Head, Main, NextScript } from 'next/document'
import {revalidate} from "@module-federation/node/utils";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    ctx?.res?.on('finish', () => {
      console.log(global.__remote_scope__);
      revalidate().then((shouldUpdate) => {
        console.log('finished sending response', shouldUpdate);
      })
    })

    return initialProps
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
        <Main />
        <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
