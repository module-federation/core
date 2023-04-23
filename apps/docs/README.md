Documentation website consists of 2 applications:

- `docs-ui` holds the visual part of the documentation website. When serving\building the `docs` app, `docs-ui` will be prebuilt as its dependency.
- `docs` is the one that is meant to contain all the actual documentation. By default, serving\building will pull the changes from the main branch. To use it, run `nx run docs:serve`. Along with it there's a `local` configuration, that provides an ability to rely on the files within the filesystem. Can be used by running `nx run docs:serve:local`
