# Module Federation Import Remote

Allow a host application to dynamically import remotely exposed modules using Webpack Module Federation

# Notes

This library exports an **importRemote()** function which will enable dynamic imports of remotely exposed modules using the Module Federation plugin. It uses the method described in the official Webpack configuration under <a href="https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers" target="_blank">Dynamic Remote Containers</a>.

# Example

1. Expose a module in the remote application's Webpack configuration:

```
  new ModuleFederationPlugin({
    name: "Foo",
    library: { type: "var", name: "Foo" },
    filename: "remoteEntry.js",
    exposes: {
      "./Bar": "./src/Bar",
    },
  })
```

2. Build the remote application and serve it so that remoteEntry.js is accessible for example in the following URL http://localhost:3001.

3. Load the remotely exposed module in the host application using **importRemote()** and use it:

```
  import { importRemote } from "module-federation-import-remote";

  // If it's a regular js module:
  importRemote({ url: "http://localhost:3001", scope: 'Foo', module: 'Bar' }).then(({/* list of Bar exports */}) => {
    // Use Bar exports
  });

  // If Bar is a React component you can use it with lazy and Suspense just like a dynamic import:
  const Bar = lazy(() => importRemote({ url: "http://localhost:3001", scope: 'Foo', module: 'Bar' }));

  return (
    <Suspense fallback={<div>Loading Bar...</div>}>
      <Bar />
    </Suspense>
  );
```

# Additional Options

Apart from **url**, **scope** and **module** you can also pass additional options to the **importRemote()** function:

- **remoteEntryFileName**: The name of the remote entry file. Defaults to "remoteEntry.js".
- **bustRemoteEntryCache**: Whether to add a cache busting query parameter to the remote entry file URL. Defaults to **true**. You can disable it if cachebusting is handled by the server.
