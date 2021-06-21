# Module Federation For Next.js

This plugin enables Module Federation on Next.js

This is a workaround to hard limitations caused by Next.js being synchronous.

I am working on an update to Webpack Core which will circumvent projects with older architecture (like Next.js).

This is a stable and viable workaround to leverage Module Federation [until this issue is resolved](https://github.com/webpack/webpack/issues/11811).

### Supports

- next ^10.2.x
- Client side only

**Once I PR webpack, this workaround will no longer be required.**

# Check out our book

| <a href="https://module-federation.myshopify.com/products/practical-module-federation" target="_blank"><img src="./docs/MFCover.png" alt='Practical Module Federation Book' width="95%"/></a> | <a href="https://module-federation.myshopify.com/products/practical-module-federation" target="_blank">We will be actively updating this book over the next year as we learn more about best practices and what issues people are running into with Module Federation, as well as with every release of Webpack as it moves towards a release candidate and release. So with your one purchase you are buying a whole year of updates.</a> |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

#### Demo

You can see it in action here: https://github.com/module-federation/module-federation-examples/tree/master/nextjs (needs to be updated)

## How to add to a nextjs app

1. Use `withModuleFederation` in your `next.config.js`

```js
// next.config.js
const { withModuleFederation } = require("@module-federation/nextjs-mf");

module.exports = withModuleFederation({
  mergeRuntime: true,
  name: "next2",
  library: { type: "var", name: "next2" },
  filename: "static/chunks/remoteEntry.js",
  remotes: {
    next1: "next1", // for client, treat it as a global
  },
  exposes: {
    "./nav": "./components/nav",
  },
  shared: {
    react: {
      requiredVersion: false,
      singleton: true,
    },
    "next/link": {
      requiredVersion: false,
      singleton: true,
    },
  },
})({
  // your original next.config.js export
});
```

3. Add the remote entry to the \_document

```js
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <script src="http://your-domain-here.com/next1RemoteEntry.js" />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

4. Use next/dynamic to import from your remotes

```js
const SampleComponent = dynamic(() => import("next1/sampleComponent"), {
  ssr: false,
});
```
