<div align="center">
	<!--  for version -->
  <img src="https://img.shields.io/npm/v/@module-federation/nextjs-mf" alt="version" >
	<img src="https://img.shields.io/apm/l/atomic-design-ui.svg?" alt="license" >
  <!-- for downloads -->
  <img src="https://img.shields.io/npm/dt/@module-federation/nextjs-mf" alt="downloads">
 </div>

# Module Federation For Next.js

This plugin enables Module Federation on Next.js

## Supports

- next ^12 || ^13
- SSR included! 

I highly recommend referencing this application which takes advantage of the best capabilities:
https://github.com/module-federation/module-federation-examples

## This project supports federated SSR

## Whats shared by default?

Under the hood we share some next internals automatically
You do not need to share these packages, sharing next internals yourself will cause errors.

```js
const DEFAULT_SHARE_SCOPE = {
  react: {
    singleton: true,
    requiredVersion: false,
  },
  'react/': {
    singleton: true,
    requiredVersion: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: false,
  },
  'next/dynamic': {
    requiredVersion: false,
    singleton: true,
  },
  'styled-jsx': {
    requiredVersion: false,
    singleton: true,
  },
  'styled-jsx/style': {
    requiredVersion: false,
    singleton: true,
  },
  'next/link': {
    requiredVersion: false,
    singleton: true,
  },
  'next/router': {
    requiredVersion: false,
    singleton: true,
  },
  'next/script': {
    requiredVersion: false,
    singleton: true,
  },
  'next/head': {
    requiredVersion: false,
    singleton: true,
  },
};
```

## Usage

```js
const SampleComponent = dynamic(() => import('next2/sampleComponent'), {
  ssr: false,
});
```

If you want support for sync imports. It is possible in next@12 as long as there is an async boundary.

#### See the implementation here: https://github.com/module-federation/module-federation-examples/tree/master/nextjs/home/pages

With async boundary installed at the page level. You can then do the following

```js
if (process.browser) {
  const SomeHook = require('next2/someHook');
}
// if client only file
import SomeComponent from 'next2/someComponent';
```

Make sure you are using `mini-css-extract-plugin@2` - version 2 supports resolving assets through `publicPath:'auto'`

## Demo

You can see it in action here: https://github.com/module-federation/module-federation-examples/tree/master/nextjs

## Options

This plugin works exactly like ModuleFederationPlugin, use it as you'd normally.
Note that we already share react and next stuff for you automatically.

Also NextFederationPlugin has own optional argument `extraOptions` where you can unlock additional features of this plugin:

```js
new NextFederationPlugin({
  name: ...,
  filename: ...,
  remotes: ...,
  exposes: ...,
  shared: ...,
  extraOptions: {
    exposePages: true, // `false` by default
    enableImageLoaderFix: true, // `false` by default
    enableUrlLoaderFix: true, // `false` by default
    automaticAsyncBoundary: true, // `false` by default
    skipSharingNextInternals: false // `false` by default
  },
});
```

- `exposePages` – exposes automatically all nextjs pages for you and theirs `./pages-map`.
- `enableImageLoaderFix` – adds public hostname to all assets bundled by `nextjs-image-loader`. So if you serve remoteEntry from `http://example.com` then all bundled assets will get this hostname in runtime. It's something like Base URL in HTML but for federated modules.
- `enableUrlLoaderFix` – adds public hostname to all assets bundled by `url-loader`.
- `automaticAsyncBoundary` – adds automatic async boundary for all federated modules. It's required for sync imports to work.
- `skipSharingNextInternals` – disables sharing of next internals. You can use it if you want to share next internals yourself or want to use this plugin on non next applications

### BREAKING CHANGE ABOUT SHARED MODULES:

Previously, we used to "rekey" all shared packages used in a host in order to prevent eager consumption issues. However, this caused unforeseen issues when trying to share a singleton package, as the package would end up being bundled multiple times per page.

As a result, we have had to stop rekeying shared modules in userland and only do so on internal Next packages themselves.

If you need to dangerously share a package using the old method, you can do so by using the following code:

```js
const shared = {
  fakeLodash: {
    import: "lodash",
    shareKey: "lodash",
  }
}
```

Please note that this method is now considered dangerous and should be used with caution.

## Demo

You can see it in action here: https://github.com/module-federation/module-federation-examples/pull/2147

## Implementing the Plugin

1. Use `NextFederationPlugin` in your `next.config.js` of the app that you wish to expose modules from. We'll call this "next2".

```js
// next.config.js
// either from default
const NextFederationPlugin = require('@module-federation/nextjs-mf').default;
// or named export
const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

module.exports = {
  webpack(config, options) {
    const { isServer } = options;
    config.plugins.push(
      new NextFederationPlugin({
        name: 'next2',
        remotes: {
          next1: `next1@http://localhost:3001/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
        },
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './title': './components/exposedTitle.js',
          './checkout': './pages/checkout',
        },
        shared: {
          // whatever else
        },
      })
    );

    return config;
  },
};

// _app.js or some other file in as high up in the app (like next's new layouts)
// this ensures various parts of next.js are imported and "used" somewhere so that they wont be tree shaken out
// note: this is optional in the latest release, as it is auto-injected by NextFederationPlugin now
import '@module-federation/nextjs-mf/src/include-defaults';
```

2. For the consuming application, we'll call it "next1", add an instance of the ModuleFederationPlugin to your webpack config, and ensure you have a [custom Next.js App](https://nextjs.org/docs/advanced-features/custom-app) `pages/_app.js` (or `.tsx`):
   Inside that \_app.js or layout.js file, ensure you import `include-defaults` file (this is now optional as include-defaults is auto injected into _app)

```js
// next.config.js

const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

module.exports = {
  webpack(config, options) {
    const { isServer } = options;
    config.plugins.push(
      new NextFederationPlugin({
        name: 'next1',
        remotes: {
          next2: `next2@http://localhost:3000/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
        },
      })
    );

    return config;
  },
};

// _app.js or some other file in as high up in the app (like next's new layouts)
// this ensures various parts of next.js are imported and "used" somewhere so that they wont be tree shaken out
// note: this is optional in the latest release, as it is auto-injected by NextFederationPlugin now
import '@module-federation/nextjs-mf/src/include-defaults';
```

4. Use next/dynamic or low level api to import remotes.

```js
import dynamic from 'next/dynamic';

const SampleComponent = dynamic(
  () => window.next2.get('./sampleComponent').then((factory) => factory()),
  {
    ssr: false,
  }
);

// or

const SampleComponent = dynamic(() => import('next2/sampleComponent'), {
  ssr: false,
});
```

## Utilities

Ive added a util for dynamic chunk loading, in the event you need to load remote containers dynamically.

**InjectScript**

```js
import { injectScript } from '@module-federation/nextjs-mf/utils';
// if i have remotes in my federation plugin, i can pass the name of the remote
injectScript('home').then((remoteContainer) => {
  remoteContainer.get('./exposedModule');
});
// if i want to load a custom remote not known at build time.

injectScript({
  global: 'home',
  url: 'http://somthing.com/remoteEntry.js',
}).then((remoteContainer) => {
  remoteContainer.get('./exposedModule');
});
```

**revalidate**

Enables hot reloading of node server (not client) in production. 
This is recommended, without it - servers will not be able to pull remote updates without a full restart.

More info here: https://github.com/module-federation/nextjs-mf/tree/main/packages/node#utilities

```js
// __document.js

import { revalidate } from '@module-federation/nextjs-mf/utils';
import Document, { Html, Head, Main, NextScript } from 'next/document';
class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    // can be any lifecycle or implementation you want
    ctx?.res?.on('finish', () => {
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
    );
  }
}
```

## Contact

If you have any questions or need to report a bug
<a href="https://twitter.com/ScriptedAlchemy"> Reach me on Twitter @ScriptedAlchemy</a>

Or join this discussion thread: https://github.com/module-federation/module-federation-examples/discussions/978
