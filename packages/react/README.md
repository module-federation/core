# Module Federation React Integration

This library aims to make working with module federation in React seemless and natural. Using hooks, abstracting (but not limiting access to) webpack config, and adding quality of life items such as Error Boundaries and Verbose Logging; **I want to make working with Module Federation simple and easy.**

## Library Features
- React Hooks
- Remote Error Boundary
- Remote Logger Component
- Event based logging
- Console based debugging
- Starter WebPack Configuration
- Event Flags
- Full type support
- Dependency free
- Babel support with tree shaking

## More Project Details
- [Changelog](./changelog.md)
- [Todo](./todo.md)

# Getting started

Adding Module Federation support to your existing or new react application is simple, just start by opening a terminal and installing the package.

```bash
npm install @module-federation/react
```

Next, Lets walk through using some of the features this library provides...

- [Setup using Webpack](./docs/getting_started_webpack.md)
- [Using the Hooks](./docs/using_hooks.md)
- [Logging and Debugging](./docs/logging_debugging.md)