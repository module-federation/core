# Get basic mf configuration

## Get basic configuration

MF mainly consists of three parts: remotes exposes shared. And if divided by role, it can be divided into two parts: consumers and providers. 

If the exposes field has value, can be treated as Provider.

If the remotes field has value, can be treated as Consumer.

The project can both be Provider and Consumer.

Users usually asks:

* "I want to expose a component"
* "I want to import a remote component"

And the below doc reflect on the above command.

### Consumer

If user want to experience consumer , the basic configuration content should be this:

```ts
import { createModuleFederationConfig } from 'build-plugin'; // can be changed your real use plugin

export default createModuleFederationConfig({
  name: 'rsbuild_consumer',
  remotes: {
    // online
    'provider': 'rslib_provider@https://unpkg.com/module-federation-rslib-provider@latest/dist/mf/mf-manifest.json',
    // 'provider': 'rslib_provider@http://localhost:3001/mf-manifest.json',
  },
  shareStrategy:'loaded-first',
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});

```

### Provider

If user want to experience provider , the basic configuration should be this:

```ts
import {createModuleFederationConfig} from 'build-plugin';
import pkg from './package.json';

export default createModuleFederationConfig({
  name: pkg.name,
  exposes: {
    '.': './src/index.tsx',
  },
  shared: {
    react: {
      singleton: true,
    },
    'react-dom': {
      singleton: true,
    },
  },
})
```

### Replace build-plugin

According Build Plugins,infer the project first, if infer failed, ask user which project they used , and then choose the relevant lib, replace `build-plugin`.

### Configuration file 

#### extension

Keep the same as project config extension. eg: If the project config is webpack.config.js, the mf config should be `.js` as well. 

### format

If the extension is js , change the format to `cjs` , otherwise is `esm`. 

## Write configuration

If users has `filepath` file , read it and keep the previous configuration, and then add the key diff content.

The key diff content:

* Provider: exposes
* Consumer: remotes

## Consume remote

If the project is `consumer`, add consume remote usage in entry, eg: `src/index`

```
// The remote-alias is remotes key
import Remote from 'remote-alias';

console.log('Remote: ',Remote);
```

## Apply Module Federation build plugin

If users has `filepath` file , stop it now.

After getting basic configuration(`module-federation.config.j|ts`, ts first), should apply build plugin . 

According different project, has different way to apply:

* Webpack

```js title='webpack.config.js'
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced');
const mfConfig = require('./module-federation.config');

module.exports = {
  // ... keep prev config
  plugins:[
    new ModuleFederationPlugin(mfConfig)
  ]
}

```

* Rspack

```js title='rspack.config.js'
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/rspack');
const mfConfig = require('./module-federation.config');

module.exports = {
  // ... keep prev config
  plugins:[
    new ModuleFederationPlugin(mfConfig)
  ]
}

```


* rsbuild

```ts title='rsbuild.config.ts'
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import mfConfig from './module-federation.config'

export default defineConfig({
  // ... keep prev config
  plugins: [
    pluginModuleFederation(mfConfig),
  ],
});


```

* Modern.js

```ts title='modern.config.ts'
import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  // ... keep prev config
  plugins: [moduleFederationPlugin()],
});

```