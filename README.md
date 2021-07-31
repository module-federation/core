# Module Federation For Next.js

This plugin enables Module Federation on Next.js

This is a stable and viable solution to leverage Module Federation [until this issue is resolved](https://github.com/webpack/webpack/issues/11811).

### Supports

- next ^10.2.x || ^11.x.x
- Client side only

## Whats shared by default?

Under the hood we share some next internals automatically
You do not need to share these packages, sharing next internals yourself will cause errors.

```js
 "next/dynamic": {
    requiredVersion: false,
    singleton: true,
  },
  "next/link": {
    requiredVersion: false,
    singleton: true,
  },
  "next/head": {
    requiredVersion: false,
    singleton: true,
  },
```

## Things to watch out for

There's a big in next.js which causes it to attempt and fail to resolve federated imports on files imported into the `pages/index.js`

Its recommended using the low-level api to be safe.

```js
const SampleComponent = dynamic(
  () => window.next2.get("./sampleComponent").then((factory) => factory()),
  {
    ssr: false,
  }
);
```

Make sure you are using `mini-css-extract-plugin@2` - version 2 supports resolving assets through `publicPath:'auto'`

## Options

```js
withFederatedSidecar(
  {
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
      },
    },
  },
  {
    removePlugins: [
      // optional
      // these are the defaults
      "BuildManifestPlugin",
      "ReactLoadablePlugin",
      "DropClientPage",
      "WellKnownErrorsPlugin",
      "ModuleFederationPlugin",
    ],
    publicPath: "auto", // defaults to 'auto', is optional
  }
);
```

## Demo

You can see it in action here: https://github.com/module-federation/module-federation-examples/tree/master/nextjs

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
    },
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
          // we have to share something to ensure share scope is initialized
          "@module-federation/nextjs-mf/lib/noop": {
            eager: false,
          },
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
const SampleComponent = dynamic(
  () => window.next2.get("./sampleComponent").then((factory) => factory()),
  {
    ssr: false,
  }
);
```

## Contact

If you have any questions or need to report a bug
<a href="https://twitter.com/ScriptedAlchemy"> Reach me on Twitter @ScriptedAlchemy</a>

Or join this discussion thread: https://github.com/module-federation/module-federation-examples/discussions/978
