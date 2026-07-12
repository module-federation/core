<p align="center">
  <img alt="Module federation Banner"  width="260" src="https://github.com/module-federation/core/assets/27547179/11234712-40fc-4696-a7fd-16e0c631005a">
</p>

# Module Federation

<p align="center">
  <a href="https://www.npmjs.com/package/@module-federation/runtime?activeTab=readme">
   <img src="https://img.shields.io/npm/v/@module-federation/runtime?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <a href="https://npmcharts.com/compare/@module-federation/runtime?minimal=true">
    <img src="https://img.shields.io/npm/dm/@module-federation/runtime.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" />
  </a>
  <a href="https://github.com/web-infra-dev/rspack/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/@module-federation/runtime?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  </a>
</p>

You can consider the module federation capabilities provided by this repository as "module federation 2.0". "Module Federation 2.0" differs from the "Module Federation" built into webpack 5 by offering not only the core features of module export, loading, and dependency sharing but also additional dynamic type hinting, a "Manifest", a "Federation Runtime", and a "Runtime Plugin System". These features make "Module Federation" more suitable for use as a micro-frontend architecture in large-scale web applications.

## 💡 What is Module Federation?

- Module Federation is a concept that allows developers to share code and resources across multiple JavaScript applications

- Module Federation can be used to split monolithic applications into micro-front-end architectures

- Module Federation reuses common dependencies between modules as much as possible

## ✨ What new features does Module Federation provide?

- 🎨 Module Federation Runtime
- 🧩 Runtime Plugins System
- 📝 Manifest
- 🚀 Dynamic type prompt
- 🛠️ Chrome Devtool

## 📚 Getting Started

To get started with Module Federation, see the [Quick Start](https://module-federation.io/guide/start/quick-start.html).

## 🧑‍💻 Community

Come and chat with us on [Discussions](https://github.com/module-federation/universe/discussions) or [Discord](https://discord.gg/n69NnT3ACV)! The Module federation team and users are active there, and we're always looking for contributions.

## 🤝 Contribution

> New contributors welcome!

Please read the [Contributing Guide](https://github.com/module-federation/core/blob/main/CONTRIBUTING.md).

### Node.js support

Working on this repository requires Node.js 24 and pnpm 10.28.0. The repository's
development, test, build, and release workflows run on Node.js 24.

Published packages that execute in Node.js, including build plugins, command-line
tools, type generation, workers, and server-side runtime code, remain compatible
with Node.js 20.19.5. CI builds the packages on Node.js 24, installs the resulting
package tarballs in a clean Node.js 20.19.5 project, and verifies their CommonJS,
ES module, command-line, and type entry points. The clean TypeScript project is
also built with both Webpack and Rspack, and the resulting Node.js bundles are
executed on Node.js 20.19.5.

Browser runtime compatibility is defined by the browser build targets rather than
the Node.js version used to maintain this repository. Node.js 20 compatibility is
provided for legacy consumers even though Node.js 20 no longer receives upstream
maintenance.

![Alt](https://repobeats.axiom.co/api/embed/856dc1d4a6965d225232b1bd2da5d54549dc169e.svg 'Repobeats analytics image')

## 🙌 Code of Conduct

This repo has adopted the Code of Conduct. Please check [Code of Conduct](./CODE_OF_CONDUCT.md) for more details.
