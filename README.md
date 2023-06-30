# ModuleFederation

# Documentation

[module-federation/nextjs-mf](./packages/nextjs-mf)

[module-federation/node](./packages/node)

[module-federation/utilities](./packages/utilities)

[module-federation/typescript](./packages/typescript)

[module-federation/storybook-addon](./packages/storybook-addon)

[module-federation/native-federation-typescript](./packages/native-federation-typescript)

[module-federation/native-federation-tests](./packages/native-federation-tests)

## Generate an application

Run `nx g @nx/next:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate a library

Run `nx g @nx/js:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are shareable across libraries and applications. They can be imported from `@module-federation/mylib`.

## Development server

Run `nx serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `nx test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Social links

We are excited to announce the new [Discord community](https://discord.gg/T8c6yAxkbv) for Module Federation has been recently launched! This space will be used to discuss and share knowledge about the latest advancements in module federation and how to use it effectively. See you there!
