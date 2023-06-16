# Getting started using WebPack

To start using this, we first need to install the library to a react application which will behave as our host ...

```bash
npm install @module-federation/react
```

Next we need to ensure the host is using webpack to function, we do this by updating `package.json`... Your start scripts should looke like this:

```json
{
    "start": "webpack-cli serve",
    "build": "webpack --mode production",
    "serve": "serve dist",
    "clean": "rm -rf dist"
}
```

Next we need to configure Webpack for module federation. Luckily, we have a minimal base webpack config you can use in the next section, if you want to create your own from scratch, feel free to use this link for more information: https://module-federation.io/docs/en/mf-docs/0.19/setup/


Once you have `webpack.config.js` in place, Lets try out our solution and ensure it works with webpack:

```bash
npm start
```

You should be able to see your application still runs by visiting

```http://localhost:3000```

## Setting up a default webpack config

This library comes with a minimal webpack configuration that you can use, as well as override for your own purposes. This is not manditory to use, just a good place to start from.

Example `webpack.config.js` in your host:

```javascript
import { ScopeType, DefaultConfiguration } from "@module-federation/react";

const webpackConfig = DefaultConfiguration({
	devPort: 3000,
	scopeType: ScopeType.Host,
	useTypescript: true
});

module.exports = (env, argv) => {
	return {
		...webpackConfig
		// Override properties and values here
	}
};
```