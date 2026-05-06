# @module-federation/metro-plugin-rock

Module Federation for [Rock](https://rockjs.dev) (formerly RNEF) using Metro bundler. This plugin integrates the `@module-federation/metro` package with Rock, providing commands to bundle Module Federation host and remotes.

## Installation

1. First, ensure you have [Rock](https://rockjs.dev) set up in your project.

2. Install the plugin:

```bash
npm install --save-dev @module-federation/metro-plugin-rock
```

3. Add the plugin to your Rock configuration (typically in `rock.config.mjs`):

```typescript
import { pluginMetro } from '@rock-js/plugin-metro';
import moduleFederation from '@module-federation/metro-plugin-rock';

/** @type {import('@rock-js/config').Config} */
export default {
  bundler: pluginMetro(),
  plugins: [moduleFederation()],
};
```

## Usage

### Bundle a Module Federation Host

```bash
# Bundle for iOS
rock bundle-mf-host --entry-file index.js --platform ios

# Bundle for Android
rock bundle-mf-host --entry-file index.js --platform android
```

### Bundle a Module Federation Remote

```bash
# Bundle for iOS
rock bundle-mf-remote --platform ios

# Bundle for Android
rock bundle-mf-remote --platform android
```

### Available Options

#### `bundle-mf-host`

- `--entry-file <path>`: Path to the root JavaScript entry file
- `--platform <string>`: Target platform (default: "ios") - Either "ios" or "android"
- `--transformer <string>`: Specify a custom transformer
- `--dev [boolean]`: If false, warnings are disabled and the bundle is minified (default: true)
- `--minify [boolean]`: Allows overriding whether bundle is minified. This defaults to false if dev is true, and true if dev is false. Disabling minification can be useful for speeding up production builds for testing purposes.
- `--bundle-output <string>`: File path where to store the resulting bundle
- `--bundle-encoding <string>`: Encoding the bundle should be written in (default: "utf8")
- `--resolver-option <string...>`: Custom resolver options (key=value format, URL-encoded, can be specified multiple times)
- `--sourcemap-output <string>`: File name where to store the sourcemap file for resulting bundle, ex. /tmp/groups.map
- `--sourcemap-sources-root <string>`: Path to make sourcemap's sources entries relative to, ex. /root/dir
- `--sourcemap-use-absolute-path`: Report SourceMapURL using its full path (default: false)
- `--max-workers <number>`: Specifies the maximum number of workers the worker-pool will spawn for transforming files. This defaults to the number of the cores available on your machine.
- `--assets-dest <string>`: Directory name where to store assets referenced in the bundle
- `--reset-cache`: Removes cached files (default: false)
- `--read-global-cache`: Try to fetch transformed JS code from the global cache, if configured (default: false)
- `--config <string>`: Path to the CLI configuration file

#### `bundle-mf-remote`

- `--platform <string>`: Target platform (default: "ios") - Either "ios" or "android"
- `--dev [boolean]`: If false, warnings are disabled and the bundle is minified (default: true)
- `--minify [boolean]`: Allows overriding whether bundle is minified. This defaults to false if dev is true, and true if dev is false. Disabling minification can be useful for speeding up production builds for testing purposes.
- `--bundle-encoding <string>`: Encoding the bundle should be written in (default: "utf8")
- `--max-workers <number>`: Specifies the maximum number of workers the worker-pool will spawn for transforming files. This defaults to the number of the cores available on your machine.
- `--bundle-output <string>`: File path where to store the resulting bundle
- `--sourcemap-output <string>`: File name where to store the sourcemap file for resulting bundle, ex. /tmp/groups.map
- `--sourcemap-sources-root <string>`: Path to make sourcemap's sources entries relative to, ex. /root/dir
- `--sourcemap-use-absolute-path`: Report SourceMapURL using its full path (default: false)
- `--assets-dest <string>`: Directory name where to store assets referenced in the bundle
- `--asset-catalog-dest [string]`: Path where to create an iOS Asset Catalog for images
- `--reset-cache`: Removes cached files (default: false)
- `--config <string>`: Path to the CLI configuration file

## Migrating from RNEF

If you're migrating from `@module-federation/metro-plugin-rnef`, update your imports:

```diff
-import moduleFederation from '@module-federation/metro-plugin-rnef';
+import moduleFederation from '@module-federation/metro-plugin-rock';
```

And update your config file from `rnef.config.mjs` to `rock.config.mjs` as per the [Rock migration guide](https://rockjs.dev).
