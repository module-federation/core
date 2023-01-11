# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [2.1.4](https://github.com/module-federation/nextjs-mf/compare/typescript-2.1.3...typescript-2.1.4) (2023-01-11)

### Dependency Updates

* `utils` updated to version `1.1.1`

### Bug Fixes

* **federatedtypesplugin:** modify remote url used to import remote types ([#496](https://github.com/module-federation/nextjs-mf/issues/496)) ([e91a68a](https://github.com/module-federation/nextjs-mf/commit/e91a68a96bb2c374f3a0e84eba73baeeb2913698)), closes [#495](https://github.com/module-federation/nextjs-mf/issues/495)
* **typescript:** generated types doesn't get included in types index ([#487](https://github.com/module-federation/nextjs-mf/issues/487)) ([e79eb88](https://github.com/module-federation/nextjs-mf/commit/e79eb884c1898b64254c2907c459499dd2f6ea58))
* **typescript:** unable to download types from multiple remotes ([#492](https://github.com/module-federation/nextjs-mf/issues/492)) ([c598b41](https://github.com/module-federation/nextjs-mf/commit/c598b4197fb4fcf1a7f8baff19051c39f03a9aa0)), closes [#455](https://github.com/module-federation/nextjs-mf/issues/455)



## [2.1.3](https://github.com/module-federation/nextjs-mf/compare/typescript-2.1.2...typescript-2.1.3) (2022-12-30)

### Dependency Updates

* `utils` updated to version `1.1.0`


## [2.1.2](https://github.com/module-federation/nextjs-mf/compare/typescript-2.1.1...typescript-2.1.2) (2022-12-29)

### Dependency Updates

* `utils` updated to version `1.0.4`

### Bug Fixes

* **typescript:** compiler host re-writes compiled files in case-insensitive file systems ([#451](https://github.com/module-federation/nextjs-mf/issues/451)) ([448bab5](https://github.com/module-federation/nextjs-mf/commit/448bab571779a193ee7d333a0c2619008f999831))



## [2.1.1](https://github.com/module-federation/nextjs-mf/compare/typescript-2.1.0...typescript-2.1.1) (2022-12-27)

### Dependency Updates

* `utils` updated to version `1.0.3`


# [2.1.0](https://github.com/module-federation/nextjs-mf/compare/typescript-2.0.3...typescript-2.1.0) (2022-12-27)

### Dependency Updates

* `utils` updated to version `1.0.2`

### Bug Fixes

* **typescript:** nextJs host can't resolve Types index file ([#449](https://github.com/module-federation/nextjs-mf/issues/449)) ([116690e](https://github.com/module-federation/nextjs-mf/commit/116690eafeadbdd3ca8ebeb46288cd3d964a0362)), closes [#435](https://github.com/module-federation/nextjs-mf/issues/435)
* **typescript:** typescript compiler is losing `this` reference ([#452](https://github.com/module-federation/nextjs-mf/issues/452)) ([a4b437a](https://github.com/module-federation/nextjs-mf/commit/a4b437a4402db95f9da5871e53e9cd3b686761d8)), closes [#432](https://github.com/module-federation/nextjs-mf/issues/432)


### Features

* normalize paths for watch options ([#441](https://github.com/module-federation/nextjs-mf/issues/441)) ([be191e1](https://github.com/module-federation/nextjs-mf/commit/be191e160c370d282a72b81343340f7df59b0a4c)), closes [#394](https://github.com/module-federation/nextjs-mf/issues/394)



## [2.0.3](https://github.com/module-federation/nextjs-mf/compare/typescript-2.0.2...typescript-2.0.3) (2022-12-20)


### Bug Fixes

* Typescript - Allow custom remote filename ([#413](https://github.com/module-federation/nextjs-mf/issues/413)) ([7eda5d8](https://github.com/module-federation/nextjs-mf/commit/7eda5d8172a6e77ff4a8db13b6ec4d7c88003840))
* **typescript:** set noEmit: false when compiling types ([#416](https://github.com/module-federation/nextjs-mf/issues/416)) ([ec420d8](https://github.com/module-federation/nextjs-mf/commit/ec420d83b5ce5bc62b4245310510a6024cf718e9))



## [2.0.2](https://github.com/module-federation/nextjs-mf/compare/typescript-2.0.1...typescript-2.0.2) (2022-12-18)


### Bug Fixes

* **typescript:** fix parsing of tsconfig options for compiler ([#414](https://github.com/module-federation/nextjs-mf/issues/414)) ([5673452](https://github.com/module-federation/nextjs-mf/commit/56734522df3f1b568f8a6e7e661efb72b9894aff))



## [2.0.1](https://github.com/module-federation/nextjs-mf/compare/typescript-2.0.0...typescript-2.0.1) (2022-12-18)


### Bug Fixes

* cannot convert undefined object ([#406](https://github.com/module-federation/nextjs-mf/issues/406)) ([f049bc9](https://github.com/module-federation/nextjs-mf/commit/f049bc93c987f0ba918ecb345d1b3ee824715672))
* throw correct error object instead of an empty error in FederatedTypesPlugin ([#407](https://github.com/module-federation/nextjs-mf/issues/407)) ([1ee9ffe](https://github.com/module-federation/nextjs-mf/commit/1ee9ffe46534f854aecbde8cc20bcd3e8866274a))



# [2.0.0](https://github.com/module-federation/nextjs-mf/compare/typescript-1.1.0...typescript-2.0.0) (2022-11-20)

### Dependency Updates

* `utils` updated to version `1.0.1`

### Features

* **typescript:** excessive recompilation prevention ([#306](https://github.com/module-federation/nextjs-mf/issues/306)) ([6e1967f](https://github.com/module-federation/nextjs-mf/commit/6e1967f019afb25dfbcfe83627b08ae8b1fe97b2))


### BREAKING CHANGES

* **typescript:** Reimplemented the whole plugin from round-up to enhance performance, prevent excessive recompilation and other issues.

Some key changes to the plugin includes:

- Downloading remote types before compilation starts.
- Caching remote types for better performance.
- Ability to provide Plugin options.

Please go through plugin `readme.md` file to understand what's changed and how to use the plugin.



# [2.0.0](https://github.com/module-federation/nextjs-mf/compare/typescript-1.1.0...typescript-2.0.0) (2022-11-20)

### Dependency Updates

* `utils` updated to version `1.0.0`

### Features

* **typescript:** excessive recompilation prevention ([#306](https://github.com/module-federation/nextjs-mf/issues/306)) ([6e1967f](https://github.com/module-federation/nextjs-mf/commit/6e1967f019afb25dfbcfe83627b08ae8b1fe97b2))


### BREAKING CHANGES

* **typescript:** Reimplemented the whole plugin from round-up to enhance performance, prevent excessive recompilation and other issues.

Some key changes to the plugin includes:

- Downloading remote types before compilation starts.
- Caching remote types for better performance.
- Ability to provide Plugin options.

Please go through plugin `readme.md` file to understand what's changed and how to use the plugin.



# [1.1.0](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.9...typescript-1.1.0) (2022-11-02)


### Features

* **typescript:** provide additional files for the typescript compiler ([#349](https://github.com/module-federation/nextjs-mf/issues/349)) ([a4d9d97](https://github.com/module-federation/nextjs-mf/commit/a4d9d976c4cf1c51352a266cadccf966c3f19fd3))



## [1.0.9](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.8...typescript-1.0.9) (2022-10-31)

### Dependency Updates

* `utils` updated to version `0.5.0`


## [1.0.8](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.7...typescript-1.0.8) (2022-10-26)

### Dependency Updates

* `utils` updated to version `0.4.1`


## [1.0.7](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.6...typescript-1.0.7) (2022-10-26)

### Dependency Updates

* `utils` updated to version `0.4.0`


## [1.0.6](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.5...typescript-1.0.6) (2022-10-18)



## [1.0.5](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.4...typescript-1.0.5) (2022-10-17)

### Dependency Updates

* `utils` updated to version `0.3.4`


## [1.0.4](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.3...typescript-1.0.4) (2022-10-13)

### Dependency Updates

* `utils` updated to version `0.3.3`


## [1.0.3](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.2...typescript-1.0.3) (2022-10-12)

### Dependency Updates

* `utils` updated to version `0.3.2`


## [1.0.2](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.1...typescript-1.0.2) (2022-10-11)

### Dependency Updates

* `utils` updated to version `0.3.1`


## [1.0.2](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.1...typescript-1.0.2) (2022-10-11)

### Dependency Updates

* `utils` updated to version `0.3.1`


## [1.0.1](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.0...typescript-1.0.1) (2022-10-10)


### Bug Fixes

* get types on remote url with subdirectory ([#302](https://github.com/module-federation/nextjs-mf/issues/302)) ([d3f9060](https://github.com/module-federation/nextjs-mf/commit/d3f9060586b671ce1dd18ab5ef45e1fb5f7d5172))



# [1.0.0](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.8...typescript-1.0.0) (2022-10-08)


* feat(typescript)!: Use expose public path as basis for @mf-typescript output structure (#252) ([ae4e6f9](https://github.com/module-federation/nextjs-mf/commit/ae4e6f993ee7293250cd9bac94d5076c0800aebc)), closes [#252](https://github.com/module-federation/nextjs-mf/issues/252)


### BREAKING CHANGES

* Updates to @mf-typescript folder structure, references to imported types need updating



## [0.2.8](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.7...typescript-0.2.8) (2022-10-07)

### Dependency Updates

* `utils` updated to version `0.3.0`


## [0.2.7](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.6...typescript-0.2.7) (2022-10-07)

### Dependency Updates

* `utils` updated to version `0.2.1`


## [0.2.6](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.5...typescript-0.2.6) (2022-10-06)


### Performance Improvements

* implement simple caching mechanism for fs lookup ([#282](https://github.com/module-federation/nextjs-mf/issues/282)) ([5d78834](https://github.com/module-federation/nextjs-mf/commit/5d78834b7ed2b6bd387a28c470aa2a094ee703a3))



## [0.2.5](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.4...typescript-0.2.5) (2022-10-06)



## [0.2.4](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.3...typescript-0.2.4) (2022-10-06)



## [0.2.3](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.2...typescript-0.2.3) (2022-10-06)



## [0.2.2](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.1...typescript-0.2.2) (2022-10-06)



## [0.2.1](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.0...typescript-0.2.1) (2022-10-06)



# [0.2.0](https://github.com/module-federation/nextjs-mf/compare/typescript-0.1.1...typescript-0.2.0) (2022-10-06)



## [0.1.1](https://github.com/module-federation/nextjs-mf/compare/typescript-0.1.0...typescript-0.1.1) (2022-10-06)



# 0.1.0 (2022-10-06)


### Bug Fixes

* preserve path of exposed `.d.ts` files ([#265](https://github.com/module-federation/nextjs-mf/issues/265)) ([cc1c1f7](https://github.com/module-federation/nextjs-mf/commit/cc1c1f782477fd6b22c46fc3454de4e250d0d910))


### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-06)


### Bug Fixes

* preserve path of exposed `.d.ts` files ([#265](https://github.com/module-federation/nextjs-mf/issues/265)) ([cc1c1f7](https://github.com/module-federation/nextjs-mf/commit/cc1c1f782477fd6b22c46fc3454de4e250d0d910))


### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-04)

### Dependency Updates

* `utils` updated to version `0.0.4`

### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-04)

### Dependency Updates

* `utils` updated to version `0.0.4`

### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-04)

### Dependency Updates

* `utils` updated to version `0.0.4`

### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-04)

### Dependency Updates

* `utils` updated to version `0.0.4`

### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-04)

### Dependency Updates

* `utils` updated to version `0.0.4`

### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-04)

### Dependency Updates

* `utils` updated to version `0.0.4`

### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-04)

### Dependency Updates

* `utils` updated to version `0.0.4`

### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-04)

### Dependency Updates

* `utils` updated to version `0.0.4`

### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-04)

### Dependency Updates

* `utils` updated to version `0.0.4`

### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-04)

### Dependency Updates

* `utils` updated to version `0.0.4`

### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)



# 0.1.0 (2022-10-04)

### Dependency Updates

* `utils` updated to version `0.0.1`

### Features

* federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)
