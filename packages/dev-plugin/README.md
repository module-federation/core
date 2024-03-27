# @module-federation/dev-plugin

- This plugin supports the implementation of types hot reload for Module Federation Projects

## Usage

1. install the plugin

```bash
npm i @module-federation/dev-plugin
```

2. apply plugin

```javascript
import { DevPlugin } from '@module-federation/dev-plugin';

new DevPlugin(MFPluginOptions).apply(compiler);
```
