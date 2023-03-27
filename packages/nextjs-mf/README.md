<div align="center">
	<!--  for version -->
  <img src="https://img.shields.io/npm/v/@module-federation/nextjs-mf" alt="version" >
	<img src="https://img.shields.io/npm/l/@module-federation/nextjs-mf.svg?" alt="license" >
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

<details>
<summary> See DEFAULT_SHARE_SCOPE:</summary>

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

</details>

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
  name: '',
  filename: '',
  remotes: {},
  exposes: {},
  shared: {},
  extraOptions: {
    verbose: boolean, // `false` by default
    exposePages: boolean, // `false` by default
    enableImageLoaderFix: boolean, // `false` by default
    enableUrlLoaderFix: boolean, // `false` by default
    automaticAsyncBoundary: boolean, // `false` by default
    skipSharingNextInternals: boolean, // `false` by default
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
    import: 'lodash',
    shareKey: 'lodash',
  },
};
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
   Inside that \_app.js or layout.js file, ensure you import `include-defaults` file (this is now optional as include-defaults is auto injected into \_app)

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

const SampleComponent = dynamic(() => window.next2.get('./sampleComponent').then((factory) => factory()), {
  ssr: false,
});

// or

const SampleComponent = dynamic(() => import('next2/sampleComponent'), {
  ssr: false,
});
```

## Beta: Delegate modules

Delegate modules are a new feature in module federation that allow you to control the
loading process of remote modules by delegating it to an internal file bundled by webpack.
This is done by exporting a promise in the delegate file that resolves to a remote/container interface.

A container interface is the low-level `{get, init}` API that remote entries expose to a consuming app.
In the browser, a remote container would be window.app1, and in Node, it would be `global.__remote_scope__.app1`.

To use delegate modules, a method for script loading must be implemented in the delegate file.
A common method is to use webpack's built-in `__webpack_require__.l` method, but any method can be used.
This method is exposed to the runtime and is the same method that webpack uses internally to load remotes.

**Delegate modules will require a minimum version of 6.1.x across all apps,
since consumers will need to be able to handle the new container interface.**

The beta does not currently support chunk flushing, this will be added in a future release.

Here's an example of using a delegate module with `__webpack_require__.l`:

<details>
  <summary>See Example: (click)  </summary>
In this example, the delegate module exports a promise that
loads the remote entry script located at "http://localhost:3000/_next/static/chunks/remoteEntry.js" 
based on the `__resourceQuery` variable, which is set by webpack at runtime.
If an error occurs while loading the script, a custom error object is created and the promise is rejected with this error.

```js
//next.config.js
const { createDelegatedModule } = require('@module-federation/utilities');
const remotes = {
  checkout: createDelegatedModule(require.resolve('./remote-delegate.js'), {
    remote: `checkout@http://localhost:3002/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
  }),
};

//remote-delegate.js
import { importDelegatedModule } from '@module-federation/utilities';
//Delegate MUST use module.exports, not export default - this is a webpack limitation
module.exports = new Promise((resolve, reject) => {
  console.log('Delegate being called for', __resourceQuery);
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');

  const [global, url] = currentRequest.split('@');

  importDelegatedModule({
    global,
    url,
  })
    .then((container) => {
      resolve(container);
    })
    .catch((err) => reject(err));
});
```

</details>

In the `next.config.js` file, where remotes are configured in the module federation plugin,
you can use the internal hint to tell webpack to use an internal file as the remote entry.
This is done by replacing the typical global@url syntax with `internal ./path/to/module`.

Webpack has several hint types:

- `internal `
- `promise `
- `import `
- `external `
- `script `

The `global@url` syntax is actually script hint: `script global@url`

If you want to use the same file for handling all remote entries, you can pass information to the delegate module using query parameters.
Webpack will pass the query parameters to the module as a string, this is known as `__resourceQuery`.
It allows you to pass information to the delegate module, so it knows what webpack is currently asking for.

You can use query parameters to pass data to a module, webpack will pass the query parameters to the module as a string.

For more information on `__resourceQuery` visit: https://webpack.js.org/api/module-variables/#__resourcequery-webpack-specific.

```js
// next.config.js

const remotes = {
  // pass pointer to remote-delegate, pass delegate remote name as query param,
  // at runtime webpack will pass this as __resourceQuery
  shop: `internal ./remote-delegate.js?remote=shop@http://localhost:3001/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
  checkout: `internal ./remote-delegate.js?remote=checkout@http://localhost:3002/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
};
```

#### Expand below to see a full example:

<details>
  <summary>See Full configuration with no helpers: (click) </summary>

```js
// next.config.js

const remotes = {
  // pass pointer to remote-delegate, pass deletae remote name as query param,
  // at runtime webpack will pass this as __resourceQuery
  shop: `internal ./remote-delegate.js?remote=shop@http://localhost:3001/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
  checkout: `internal ./remote-delegate.js?remote=checkout@http://localhost:3002/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
};

// remote-delegate.js
module.exports = new Promise((resolve, reject) => {
  // some node specific for NodeFederation
  if (!global.__remote_scope__) {
    // create a global scope for container, similar to how remotes are set on window in the browser
    global.__remote_scope__ = {
      _config: {},
    };
  }
  console.log('Delegate being called for', __resourceQuery);
  // get "remote" off resource query, returns url@global
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');
  // parse syntax
  const [containerGlobal, url] = currentRequest.split('@');
  // if node server, register the containers known origins
  if (typeof window === 'undefined') {
    global.__remote_scope__._config[global] = url;
  }
  const __webpack_error__ = new Error();
  // if you use NodeFederationPlugin, ive build a server-side version of __webpack_require__.l, with the same api.
  // this is how module federation works on the server, i wrote server-side chunk loading.
  __webpack_require__.l(
    url,
    function (event) {
      // resolve promise with container, for browser env or node env.
      const container = typeof window === 'undefined' ? global.__remote_scope__[containerGlobal] : window[containerGlobal];
      console.log('delegate resolving', container);
      if (typeof container !== 'undefined') return resolve(container);
      var realSrc = event && event.target && event.target.src;
      __webpack_error__.message = 'Loading script failed.\\n(' + event.message + ': ' + realSrc + ')';
      __webpack_error__.name = 'ScriptExternalLoadError';
      __webpack_error__.stack = event.stack;
      reject(__webpack_error__);
    },
    containerGlobal
  );
});
```

</details>

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
      });
    });

    return initialProps;
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
