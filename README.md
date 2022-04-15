# Module Federation For Next.js

This plugin enables Module Federation on Next.js

### Supports

- next ^10.2.x || ^11.x.x || ^12.x.x
- Client side only, SSR is another package currently in beta

I highly recommend referencing this application which takes advantage of the best capabilities:
https://github.com/module-federation/module-federation-examples

## Looking for SSR support?
SSR support for federated applications is much harder, as such - it utilizes a different licensing model.
If you need SSR support, consider this package instead - it does everything that nextjs-mf does, and them some.
https://app.privjs.com/buy/packageDetail?pkg=@module-federation/nextjs-ssr

## Whats shared by default?

Under the hood we share some next internals automatically
You do not need to share these packages, sharing next internals yourself will cause errors.

```js
const shared = {
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
  "next/router": {
    requiredVersion: false,
    singleton: true,
  },
};
```

## Usage

```js
const SampleComponent = dynamic(() => import("next2/sampleComponent"), {
  ssr: false,
});
```

If you want support for sync imports. It is possible in next@12 as long as there is an async boundary.
#### See the implementation here: https://github.com/module-federation/module-federation-examples/tree/master/nextjs/home/pages

With async boundary installed at the page level. You can then do the following

```js
if (process.browser) {
  const SomeHook = require("next2/someHook");
}
// if client only file
import SomeComponent from "next2/someComponent";
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

2. For the consuming application, we'll call it "next1", add an instance of the ModuleFederationPlugin to your webpack config, and ensure you have a [custom Next.js App](https://nextjs.org/docs/advanced-features/custom-app) `pages/_app.js` (or `.tsx`):

```js
module.exports = {
  webpack(config, options) {
    config.plugins.push(
      new options.webpack.container.ModuleFederationPlugin({
        remotes: {
          next2: "next2@http://pathToRemotejs",
          // if you embed the script into the document manually
          next2: 'next2'
        },
        shared: {
          react: {
            // Notice shared ARE eager here.
            eager: true,
            singleton: true,
            requiredVersion: false,
          },
        },
      })
    );

    // we attach next internals to share scope at runtime
    config.module.rules.push({
      test: /pages\/_app.[jt]sx?/,
      loader: "@module-federation/nextjs-mf/lib/federation-loader.js",
    });

    return config;
  },
};
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
          Scipt is only needed if you are not using the federation @ syntax when setting your remotes. 
          <script src="http://next2-domain-here.com/_next/static/chunks/remoteEntry.js" />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

5. Use next/dynamic or low level api to import remotes.

```js
import dynamic from "next/dynamic";

const SampleComponent = dynamic(
  () => window.next2.get("./sampleComponent").then((factory) => factory()),
  {
    ssr: false,
  }
);

// or

const SampleComponent = dynamic(() => import("next2/sampleComponent"), {
  ssr: false,
});
```

## Contact

If you have any questions or need to report a bug
<a href="https://twitter.com/ScriptedAlchemy"> Reach me on Twitter @ScriptedAlchemy</a>

Or join this discussion thread: https://github.com/module-federation/module-federation-examples/discussions/978
