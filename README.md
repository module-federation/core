# ModuleFederation

# Documentation

[module-federation/nextjs-mf](./packages/nextjs-mf)

[module-federation/node](./packages/node)

[module-federation/utilities](./packages/utilities)

## Generate an application

Run `nx g @nrwl/next:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate a library

Run `nx g @nrwl/js:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are shareable across libraries and applications. They can be imported from `@module-federation/mylib`.

## Development server

Run `nx serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `nx test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Publishing packages to local registry

Run local npm registry, please refer to local-registry scripts related document [scripts/README.md](./scripts/README.md)

First, you need to enable local registry. To do so, run:

```bash
# npm
npm run local-registry enable
# yarn
yarn local-registry enable
```

Then, you need to start local registry. To do so, run:

```bash
# npm
npm run local-registry start
# yarn
yarn local-registry start
```

After that, you can publish packages to local registry. To do so, run:

```bash
# npm
npm run force-publish
# yarn
yarn force-publish
```

After all done, you can disable local registry. To do so, run:

```bash
# npm
npm run local-registry disable
# yarn
yarn local-registry disable
```

## Publishing

On a local machine run `yarn lerna version` or `npm run lerna version` and follow prompts.

This will bump the version of all packages and create a git tag.

Then run `yarn lerna publish from-git` or `npm run lerna publish from-git` to publish the packages to npm.
