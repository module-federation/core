# manifest-demo

This example demos manifest

- `manifest-webpack-host` consumes remote and generate manifest.
- `3009-webpack-provider` exposes a blue button component and generate manifest.
- `3010-rspack-provider` exposes a red button component and generate manifest.
- `3011-rspack-manifest-provider`: expose component and generate manifest.
- `3012-rspack-js-entry-provider`: expose component and not generate manifest.

# Running Demo

Run `pnpm run app:manifest:dev` to start examples

- manifest-webpack-host: [localhost:3013](http://localhost:3013/)
  - view http://localhost:3013/basic to see the basic usage with manifest provider , just the same as js entry provider.
  - view http://localhost:3013/preload to see manifest provider can use preloadRemote to optimize page performance
