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
    "styled-jsx": {
        requiredVersion: false,
        singleton: true,
    },
    "next/link": {
        requiredVersion: false,
        singleton: true,
    },
    "next/router": {
        requiredVersion: false,
        singleton: true,
    },
    "next/script": {
        requiredVersion: false,
        singleton: true,
    },
    "next/head": {
        requiredVersion: false,
        singleton: true,
    },
    react: {
        singleton: true,
        import: false,
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
          next2: "next2",
        },
        shared: {
         
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

4. Use next/dynamic or low level api to import remotes.

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


# The New Beta

I have recently redesigned this plugin from the ground up. From my testing so far, Ive not been able to find any limitations.

If you wish to start working with what will become the next major release, follow the documentation below AND NOT what is documented above


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

This plugin works exactly like ModuleFederationPlugin, use it as you'd normally.
Note that we already share react and next stuff for you automatically.

## Demo

You can see it in action here: https://github.com/module-federation/module-federation-examples/pull/2147

## Implementing the Plugin

1. Use `NextFederationPlugin` in your `next.config.js` of the app that you wish to expose modules from. We'll call this "next2".

```js
// next.config.js
const NextFederationPlugin = require('@module-federation/nextjs-mf/beta/NextFederationPlugin');

module.exports = {
  webpack(config, options) {
    if (!options.isServer) {
      config.plugins.push(
        new NextFederationPlugin({
          name: 'next2',
          remotes: {
            next1: `next1@http://localhost:3001/_next/static/chunks/remoteEntry.js`,
          },
          filename: 'static/chunks/remoteEntry.js',
          exposes: {
            './title': './components/exposedTitle.js',
            './checkout': './pages/checkout',
            './pages-map': './pages-map.js',
          },
          shared: {
            // whatever else
          },
        }),
      );
    }

    return config;
  },
};

// _app.js or some other file in as high up in the app (like next's new layouts)
// this ensures various parts of next.js are imported and "used" somewhere so that they wont be tree shaken out
import '@module-federation/nextjs-mf/beta/include-defaults';

```

2. For the consuming application, we'll call it "next1", add an instance of the ModuleFederationPlugin to your webpack config, and ensure you have a [custom Next.js App](https://nextjs.org/docs/advanced-features/custom-app) `pages/_app.js` (or `.tsx`):
   Inside that _app.js or layout.js file, ensure you import `include-defaults` file

```js
// next.config.js

const NextFederationPlugin = require('@module-federation/nextjs-mf/beta/NextFederationPlugin');

module.exports = {
  webpack(config, options) {
    if (!options.isServer) {
      config.plugins.push(
        new NextFederationPlugin({
          name: 'next1',
          remotes: {
            next2: `next2@http://localhost:3000/_next/static/chunks/remoteEntry.js`,
          },
        }),
      );
    }

    return config;
  },
};

// _app.js or some other file in as high up in the app (like next's new layouts)
// this ensures various parts of next.js are imported and "used" somewhere so that they wont be tree shaken out
import '@module-federation/nextjs-mf/beta/include-defaults';

```

4. Use next/dynamic or low level api to import remotes.

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
