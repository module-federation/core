# @module-federation/retry-plugin

> A plugin for retrying failed module requests.

## Usage

```js
// ./src/runtime-plugin/retry.ts
import { RetryPlugin } from '@module-federation/retry-plugin';
const retryPlugin = () => RetryPlugin({
    fetch: {
        url: 'http://localhost:2008/not-exist-mf-manifest.json',
        fallback: () => 'http://localhost:2001/mf-manifest.json',
    },
    script: {
        // url: 'http://localhost:2008/not-exist-mf-manifest.json',
        url: 'http://localhost:2001/static/js/async/src_App_tsx.js',
        customCreateScript: (url: string, attrs: Record<string, string>) => {
            let script = document.createElement('script');
            script.src = `http://localhost:2011/static/js/async/src_App_tsx.js`;
            script.setAttribute('loader-hoos', 'isTrue');
            script.setAttribute('crossorigin', 'anonymous');
            return script;
        },
    }
})

export default defineConfig({
  tools: {
    rspack: (config, { appendPlugins }) => {
      appendPlugins([
        new ModuleFederationPlugin({
          ...,
+         runtimePlugins: [
+            path.join(__dirname, './src/runtime-plugin/retry.ts'),
+         ],
        }),
      ]);
    },
  },
  plugins: [pluginReact()],
});

```

## Documentation

See [https://module-federation.io/plugin/plugins/retry-plugin.html](https://module-federation.io/plugin/plugins/retry-plugin.html) for details.

## License

`@module-federation/retry-plugin` is [MIT licensed](https://github.com/module-federation/core/blob/main/packages/retry-plugin/LICENSE).
