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

## How to add a sidecar for exposes to your nextjs app

1. Use `withFederatedSidecar` in your `next.config.js` of the app that you wish to expose modules from. We'll call this "next2".

```js
// next.config.js
const { withFederatedSidecar } = require("@module-federation/nextjs-mf");

module.exports = withFederatedSidecar({
  name: "next2",
  filename: "static/chunks/remoteEntry.js",
  exposes: {
    "./sampleComponent": "./components/sampleComponent.js",
  },
  shared: {
    react: {
      // Notice shared are NOT eager here.
      requiredVersion: false,
      singleton: true,
    }
  },
})({
  // your original next.config.js export
});
```

2. For the consuming application, we'll call it "next1", add an instance of the ModuleFederationPlugin to your webpack config:

```js
module.exports = {
  webpack(config) {
    config.plugins.push(
      new options.webpack.container.ModuleFederationPlugin({
        remoteType: "var",
        remotes: {
          next2: "next2",
        },
        shared: {
          react: {
            // Notice shared ARE eager here.
            eager: true,
            singleton: true,
            requiredVersion: false,
          }
        },
      })
    );

    return config;
  },
};
```

3. Make sure you have an `_app.js` file, then add the loader

```js
// we attach next internals to share scope at runtime
config.module.rules.push({
  test: /_app.js/,
  loader: "@module-federation/nextjs-mf/lib/federation-loader.js",
});
```

4. Add the remote entry for "next2" to the \_document for "next1"

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
          <script src="http://next2-domain-here.com/_next/static/chunks/remoteEntry.js" />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

5. Use next/dynamic to import from your remotes

```js
const SampleComponent = dynamic(() => import("next2/sampleComponent"), {
  ssr: false,
});
```
