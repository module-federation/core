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

- next ^14 || ^13 || ^12
- SSR included!
- App router included (experimental)

I highly recommend referencing this application which takes advantage of the best capabilities:
https://github.com/module-federation/module-federation-examples

## This project supports federated SSR

# We are building a micro-frontend ecosystem!

While NextFederationPlugin "works", Next.js is staunchly opposed to the technology and Next is very difficult to support.

This plugin attempts to make the experience as seamless as possible, but it is not perfect.

We are building a micro-frontend ecosystem that is much more powerful than Next.js, built to support micro-frontends from the ground up.

**If Federation is a big enabler for your teams and projects, please consider using our ecosystem thats designed for it**

|    [Rspack](https://github.com/web-infra-dev/rspack)    |  <a href="https://github.com/web-infra-dev/rspack" target="blank"><img src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/Rspack-1850.png" width="400" /></a>   |
| :-----------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| [Modern.js](https://github.com/web-infra-dev/modern.js) | <a href="https://github.com/web-infra-dev/modern.js" target="blank"><img src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/Modern-0550.png" width="400" /></a> |
|   [Garfish](https://github.com/web-infra-dev/garfish)   | <a href="https://github.com/web-infra-dev/garfish" target="blank"><img src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/Garfish-1630.png" width="400" /></a>  |
|       [Oxc](https://github.com/web-infra-dev/oxc)       |     <a href="https://github.com/web-infra-dev/oxc" target="blank"><img src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/Oxc-0724.png" width="400" /></a>      |

## Whats shared by default?

Under the hood we share some next internals automatically
You do not need to share these packages, sharing next internals yourself will cause errors.

<details>
<summary> See DEFAULT_SHARE_SCOPE:</summary>

```ts
export const DEFAULT_SHARE_SCOPE: SharedObject = {
  'next/dynamic': {
    eager: false,
    requiredVersion: false,
    singleton: true,
    import: undefined,
  },
  'next/head': {
    eager: false,
    requiredVersion: false,
    singleton: true,
    import: undefined,
  },
  'next/link': {
    eager: true,
    requiredVersion: false,
    singleton: true,
    import: undefined,
  },
  'next/router': {
    requiredVersion: false,
    singleton: true,
    import: false,
    eager: false,
  },
  'next/script': {
    requiredVersion: false,
    singleton: true,
    import: undefined,
    eager: false,
  },
  react: {
    singleton: true,
    requiredVersion: false,
    eager: false,
    import: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: false,
    eager: false,
    import: false,
  },
  'react/jsx-dev-runtime': {
    singleton: true,
    requiredVersion: false,
    import: undefined,
    eager: false,
  },
  'react/jsx-runtime': {
    singleton: true,
    requiredVersion: false,
    eager: false,
    import: false,
  },
  'styled-jsx': {
    requiredVersion: false,
    singleton: true,
    import: undefined,
    eager: false,
  },
  'styled-jsx/style': {
    requiredVersion: false,
    singleton: true,
    import: undefined,
    eager: false,
  },
};
```

</details>

## Requirement

I set `process.env.NEXT_PRIVATE_LOCAL_WEBPACK = 'true'` inside this plugin, but its best if its set in env or command line export.

"Local Webpack" means you must have webpack installed as a dependency, and next will not use its bundled copy of webpack which cannot be used as i need access to all of webpack internals

- `NEXT_PRIVATE_LOCAL_WEBPACK=true next dev` or `next build`
- `npm install webpack`

## Usage

```js
import React, { lazy } from 'react';
const SampleComponent = lazy(() => import('next2/sampleComponent'));
```

To avoid hydration errors, use `React.lazy` instead of `next/dynamic` for lazy loading federated components.

#### See the implementation here: https://github.com/module-federation/module-federation-examples/tree/master/nextjs-v13/home/pages

With async boundary installed at the page level. You can then do the following

```js
const SomeHook = require('next2/someHook');
import SomeComponent from 'next2/someComponent';
```

## Demo

You can see it in action here: https://github.com/module-federation/module-federation-examples/tree/master/nextjs-ssr

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
    debug: boolean, // `false` by default
    exposePages: boolean, // `false` by default
    enableImageLoaderFix: boolean, // `false` by default
    enableUrlLoaderFix: boolean, // `false` by default
    skipSharingNextInternals: boolean, // `false` by default
  },
});
```

- `debug` – enables debug mode. It will print additional information about what is going on under the hood.
- `exposePages` – exposes automatically all nextjs pages for you and theirs `./pages-map`.
- `enableImageLoaderFix` – adds public hostname to all assets bundled by `nextjs-image-loader`. So if you serve remoteEntry from `http://example.com` then all bundled assets will get this hostname in runtime. It's something like Base URL in HTML but for federated modules.
- `enableUrlLoaderFix` – adds public hostname to all assets bundled by `url-loader`.
- `skipSharingNextInternals` – disables sharing of next internals. You can use it if you want to share next internals yourself or want to use this plugin on non next applications

## Demo

You can see it in action here: https://github.com/module-federation/module-federation-examples/pull/2147

## Implementing the Plugin

1. Use `NextFederationPlugin` in your `next.config.js` of the app that you wish to expose modules from. We'll call this "next2".

```js
// next.config.js
// either from default
const NextFederationPlugin = require('@module-federation/nextjs-mf');

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
      }),
    );

    return config;
  },
};
```

```js
// next.config.js

const NextFederationPlugin = require('@module-federation/nextjs-mf');

module.exports = {
  webpack(config, options) {
    const { isServer } = options;
    config.plugins.push(
      new NextFederationPlugin({
        name: 'next1',
        remotes: {
          next2: `next2@http://localhost:3000/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
        },
      }),
    );

    return config;
  },
};
```

4. Use react.lazy, low level api, or require/import from to import remotes.

```js
import React, { lazy } from 'react';

const SampleComponent = lazy(() =>
  window.next2.get('./sampleComponent').then((factory) => {
    return { default: factory() };
  }),
);

// or

const SampleComponent = lazy(() => import('next2/sampleComponent'));

//or

import Sample from 'next2/sampleComponent';
```

## RuntimePlugins

To provide extensibility and "middleware" for federation, you can refer to `@module-federation/runtime`

```js
// next.config.js
new NextFederationPlugin({
  runtimePlugins: [require.resolve('./path/to/myRuntimePlugin.js')],
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

## For Express.js

Hot reloading Express.js required additional steps: https://github.com/module-federation/universe/blob/main/packages/node/README.md

## Contact

If you have any questions or need to report a bug
<a href="https://twitter.com/ScriptedAlchemy"> Reach me on Twitter @ScriptedAlchemy</a>

Or join this discussion thread: https://github.com/module-federation/module-federation-examples/discussions/978
