# Module Federation For Next.js

This plugin enables Module Federation on Next.js

This is a workaround to hard limitations caused by Next.js being synchronous.

I am working on an update to Webpack Core which will circumvent projects with older architecture (like Next.js).

This is a stable and viable workaround to leverage Module Federation [until this issue is resolved](https://github.com/webpack/webpack/issues/11811).

**Once I PR webpack, this workaround will no longer be required.**

## How to use it

1. Use `withModuleFederation` in your `next.config.js`

```js
// next.config.js
const {
  withModuleFederation,
} = require("@module-federation/nexjs-mf");
const path = require("path");

module.exports = {
  webpack: (config, options) => {
    const { buildId, dev, isServer, defaultLoaders, webpack } = options;
    const mfConf = {
      name: "next2",
      library: { type: config.output.libraryTarget, name: "next2" },
      filename: "static/runtime/remoteEntry.js",
      remotes: {
        // For SSR, resolve to disk path (or you can use code streaming if you have access)
        next1: isServer
          ? path.resolve(
              __dirname,
              "../next1/.next/server/static/runtime/remoteEntry.js"
            )
          : "next1", // for client, treat it as a global
      },
      exposes: {
        "./nav": "./components/nav",
      },
      shared: ["lodash"],
    };
    // Configures ModuleFederation and other Webpack properties
    withModuleFederation(config, options, mfConf);

    if (!isServer) {
      config.output.publicPath = "http://localhost:3001/_next/";
    }

    return config;
  },
};
```

2. Add the `patchSharing` to `_document.js`. This will solve the react sharing issue.

```jsx
import Document, { Html, Head, Main, NextScript } from "next/document";
import { patchSharing } from "@module-federation/nexjs-mf";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        {patchSharing()}
        <script src="http://localhost:3000/_next/static/chunks/webpack.js" />
        <script src="http://localhost:3000/_next/static/runtime/remoteEntry.js" />
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
```

3. Use top-level-await

```js
// some-component.js
const Nav = (await import("../components/nav")).default;
const _ = await import("lodash");
```

## Experimental

Use at your own risk.

Next.js uses `runtimeChunk:'single'`
Which forces us to also add the webpack script itself. Till this is fixed in webpack, heres a plugin that will merge the runtimes back together for MF

```js
const {MergeRuntime} = require("@module-federation/nexjs-mf");
// in your next config.
config.plugins.push(new MergeRuntime());
```

This allows the following to be done

```diff
  - <script src="http://localhost:3000/_next/static/chunks/webpack.js" />
  - <script src="http://localhost:3000/_next/static/runtime/remoteEntry.js" />
  + <script src="http://localhost:3000/_next/static/remoteEntryMerged.js" />
```
