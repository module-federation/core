# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [0.14.5-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.4...node-0.14.5-beta.0) (2023-05-15)


### Features

* Quantum Modules ([#872](https://github.com/module-federation/nextjs-mf/issues/872)) ([2991039](https://github.com/module-federation/nextjs-mf/commit/299103932b4e0aa6d8017be588ffa5272f519260))



## [0.14.4](https://github.com/module-federation/nextjs-mf/compare/node-0.14.4-beta.0...node-0.14.4) (2023-05-13)

### Dependency Updates

* `utils` updated to version `1.7.3`
* `utils` updated to version `1.7.3`


## [0.14.4-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.3...node-0.14.4-beta.0) (2023-05-13)


### Bug Fixes

* remove container proxy code ([6123d98](https://github.com/module-federation/nextjs-mf/commit/6123d9846606d76be949492ca04474f5c8164bc7))


### Features

* [7] Async boundary runtime server ([#851](https://github.com/module-federation/nextjs-mf/issues/851)) ([7fa792a](https://github.com/module-federation/nextjs-mf/commit/7fa792a4b518cd007b5ac41db225e20521063e73)), closes [#864](https://github.com/module-federation/nextjs-mf/issues/864)


### BREAKING CHANGES

* automaticAsyncBoundary option has been removed

* fix: exclude specific pages from page map automatically

* refactor: conslidate codebase

* fix: improve hot reload share recovery

* refactor: remove server jsonp template

* chore: remove dead code from runtime modules

* fix: clean up jsonp getCustomJsonpCode

getting chunk loading global from compiler output options

* feat: adding cleanInitArrays runtime helper

* chore: remove share scope hoist and module hoisting system

* chore: cleanup code



## [0.14.3](https://github.com/module-federation/nextjs-mf/compare/node-0.14.3-beta.0...node-0.14.3) (2023-05-03)

### Dependency Updates

* `utils` updated to version `1.7.2`
* `utils` updated to version `1.7.2`


## [0.14.3-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.2...node-0.14.3-beta.0) (2023-05-03)



## [0.14.2](https://github.com/module-federation/nextjs-mf/compare/node-0.14.2-beta.1...node-0.14.2) (2023-04-28)



## [0.14.2-beta.1](https://github.com/module-federation/nextjs-mf/compare/node-0.14.2-beta.0...node-0.14.2-beta.1) (2023-04-28)



## [0.14.2-beta.2](https://github.com/module-federation/nextjs-mf/compare/node-0.14.2-beta.1...node-0.14.2-beta.2) (2023-04-28)



## [0.14.2-beta.1](https://github.com/module-federation/nextjs-mf/compare/node-0.14.2-beta.0...node-0.14.2-beta.1) (2023-04-28)



## [0.14.2-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.1...node-0.14.2-beta.0) (2023-04-28)


### Bug Fixes

* use [fullhash] if no hash exists / in development mode. ([dfa7fb3](https://github.com/module-federation/nextjs-mf/commit/dfa7fb3a49b81b87dae43ec57ff2f86f5c2b7501))



## [0.14.1](https://github.com/module-federation/nextjs-mf/compare/node-0.14.1-beta.0...node-0.14.1) (2023-04-28)

### Dependency Updates

* `utils` updated to version `1.7.1`
* `utils` updated to version `1.7.1`


## [0.14.1-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.0...node-0.14.1-beta.0) (2023-04-28)


### Features

* Improve module chunk connections ([#802](https://github.com/module-federation/nextjs-mf/issues/802)) ([ce0bd7b](https://github.com/module-federation/nextjs-mf/commit/ce0bd7b16e080f712e6db0bdcd3955a8167c274f)), closes [#803](https://github.com/module-federation/nextjs-mf/issues/803) [#808](https://github.com/module-federation/nextjs-mf/issues/808) [#811](https://github.com/module-federation/nextjs-mf/issues/811)
* release to npm with next tag to not ruine latest one ([#763](https://github.com/module-federation/nextjs-mf/issues/763)) ([f2d199b](https://github.com/module-federation/nextjs-mf/commit/f2d199b3b3fbbd428514b1ce1f139efc82f7fff0))



## [0.13.1](https://github.com/module-federation/nextjs-mf/compare/node-0.13.1-beta.0...node-0.13.1) (2023-04-19)



## [0.13.1-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.13.0...node-0.13.1-beta.0) (2023-04-19)


### Bug Fixes

*  use container proxy on script VM instead of host resolver point ([2929d0f](https://github.com/module-federation/nextjs-mf/commit/2929d0f64d4b8edf268af5ca83f807a02b121861))
* get delegates working ([#527](https://github.com/module-federation/nextjs-mf/issues/527)) ([7655568](https://github.com/module-federation/nextjs-mf/commit/7655568fcef8dbfda40573deb5d3d029c101074c))
* improved asset pipeline ([63928b2](https://github.com/module-federation/nextjs-mf/commit/63928b28150c2c4e3adb9e14fb7aa54f5cf1578d))
* peer dependencies metadata ([d3a2ed0](https://github.com/module-federation/nextjs-mf/commit/d3a2ed0e378b59afdeb632d1e2e0290f05cbca19))
* solve externalization ([49f52e5](https://github.com/module-federation/nextjs-mf/commit/49f52e53ddddc990d31e6aa510d67dc0552a9d9a))
* use EntryPlugin for injection of remotes ([e522c5a](https://github.com/module-federation/nextjs-mf/commit/e522c5ad2b7adcbd6c39f9c5fdb7a3e418277b7a))


### Features

*  delegate module support ([5061d3d](https://github.com/module-federation/nextjs-mf/commit/5061d3d64d7d83dbb25b4ef2378d434545186cb1))
* chunk flushing in delegates ([5e2375f](https://github.com/module-federation/nextjs-mf/commit/5e2375f598437803105ac4bc2237f6b652554d00))
* delegate module support ([8dd154c](https://github.com/module-federation/nextjs-mf/commit/8dd154c261b34183b12250ce204904cd3e085658))
* delegate module support ([d242163](https://github.com/module-federation/nextjs-mf/commit/d24216324183bfec5c7ba672ba6da05679f67809))
* delegates part two ([1be2686](https://github.com/module-federation/nextjs-mf/commit/1be2686624798a7df9f447b48279294985b3f592))
* improve chunk correlation ([22d8afc](https://github.com/module-federation/nextjs-mf/commit/22d8afccff101044fcdeba390656950dbc6eafed))
* new chunk flushing system for exposed modules ([97a75d8](https://github.com/module-federation/nextjs-mf/commit/97a75d8702f2ddc5e12cff2ac4d24aca1df6f990))
* prepare for v7 ([7bc4b3b](https://github.com/module-federation/nextjs-mf/commit/7bc4b3bd44e0926a52d6a9cbe56f0c4d7bb700ae))


### BREAKING CHANGES

* safety breaking change note
BREAKING_CHANGE: safety breaking change note



# [0.14.0](https://github.com/module-federation/nextjs-mf/compare/node-0.13.0...node-0.14.0) (2023-04-19)



## [0.13.1](https://github.com/module-federation/nextjs-mf/compare/node-0.13.1-beta.0...node-0.13.1) (2023-04-19)

### Dependency Updates

* `utils` updated to version `1.5.1`
* `utils` updated to version `1.5.1`


## [0.13.1-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.13.0...node-0.13.1-beta.0) (2023-04-19)


### Bug Fixes

*  use container proxy on script VM instead of host resolver point ([2929d0f](https://github.com/module-federation/nextjs-mf/commit/2929d0f64d4b8edf268af5ca83f807a02b121861))
* get delegates working ([#527](https://github.com/module-federation/nextjs-mf/issues/527)) ([7655568](https://github.com/module-federation/nextjs-mf/commit/7655568fcef8dbfda40573deb5d3d029c101074c))
* improved asset pipeline ([63928b2](https://github.com/module-federation/nextjs-mf/commit/63928b28150c2c4e3adb9e14fb7aa54f5cf1578d))
* peer dependencies metadata ([d3a2ed0](https://github.com/module-federation/nextjs-mf/commit/d3a2ed0e378b59afdeb632d1e2e0290f05cbca19))
* solve externalization ([49f52e5](https://github.com/module-federation/nextjs-mf/commit/49f52e53ddddc990d31e6aa510d67dc0552a9d9a))
* use EntryPlugin for injection of remotes ([e522c5a](https://github.com/module-federation/nextjs-mf/commit/e522c5ad2b7adcbd6c39f9c5fdb7a3e418277b7a))


### Features

*  delegate module support ([5061d3d](https://github.com/module-federation/nextjs-mf/commit/5061d3d64d7d83dbb25b4ef2378d434545186cb1))
* chunk flushing in delegates ([5e2375f](https://github.com/module-federation/nextjs-mf/commit/5e2375f598437803105ac4bc2237f6b652554d00))
* delegate module support ([8dd154c](https://github.com/module-federation/nextjs-mf/commit/8dd154c261b34183b12250ce204904cd3e085658))
* delegate module support ([d242163](https://github.com/module-federation/nextjs-mf/commit/d24216324183bfec5c7ba672ba6da05679f67809))
* delegates part two ([1be2686](https://github.com/module-federation/nextjs-mf/commit/1be2686624798a7df9f447b48279294985b3f592))
* improve chunk correlation ([22d8afc](https://github.com/module-federation/nextjs-mf/commit/22d8afccff101044fcdeba390656950dbc6eafed))
* new chunk flushing system for exposed modules ([97a75d8](https://github.com/module-federation/nextjs-mf/commit/97a75d8702f2ddc5e12cff2ac4d24aca1df6f990))
* prepare for v7 ([7bc4b3b](https://github.com/module-federation/nextjs-mf/commit/7bc4b3bd44e0926a52d6a9cbe56f0c4d7bb700ae))


### BREAKING CHANGES

* safety breaking change note
BREAKING_CHANGE: safety breaking change note



# [0.13.0](https://github.com/module-federation/nextjs-mf/compare/node-0.12.3...node-0.13.0) (2023-04-09)

### Dependency Updates

* `utils` updated to version `1.5.0`
* `utils` updated to version `1.5.0`

### Features

* Allow Container Utils to work Server Side ([#723](https://github.com/module-federation/nextjs-mf/issues/723)) ([232ba24](https://github.com/module-federation/nextjs-mf/commit/232ba24072f19bd32d1f745d4edf1518e548df50))



## [0.12.3](https://github.com/module-federation/nextjs-mf/compare/node-0.12.2...node-0.12.3) (2023-04-09)

### Dependency Updates

* `utils` updated to version `1.4.1`
* `utils` updated to version `1.4.1`


## [0.12.2](https://github.com/module-federation/nextjs-mf/compare/node-0.12.1...node-0.12.2) (2023-03-24)


### Bug Fixes

* Medusa hot reloading ([#685](https://github.com/module-federation/nextjs-mf/issues/685)) ([6f14306](https://github.com/module-federation/nextjs-mf/commit/6f143068252eefec7a717ea0b8fef51a709ba539))



## [0.12.1](https://github.com/module-federation/nextjs-mf/compare/node-0.12.0...node-0.12.1) (2023-03-24)


### Bug Fixes

* enable chunk hashing all the time ([#669](https://github.com/module-federation/nextjs-mf/issues/669)) ([7417bc2](https://github.com/module-federation/nextjs-mf/commit/7417bc2acead56aa066a6b14ddb57a2474ea72e0))



# [0.12.0](https://github.com/module-federation/nextjs-mf/compare/node-0.11.1...node-0.12.0) (2023-03-14)

### Dependency Updates

* `utils` updated to version `1.4.0`

### Features

* Medusa Support in NextFederationPlugin ([#609](https://github.com/module-federation/nextjs-mf/issues/609)) ([0bbba38](https://github.com/module-federation/nextjs-mf/commit/0bbba384c45b7d149b7a6be2dfbe9851b541b528)), closes [#606](https://github.com/module-federation/nextjs-mf/issues/606)



## [0.11.1](https://github.com/module-federation/nextjs-mf/compare/node-0.11.0...node-0.11.1) (2023-02-09)


### Bug Fixes

* backward compatability with older versions pre 6.1.x ([f27b57a](https://github.com/module-federation/nextjs-mf/commit/f27b57a36a61280124bab4a309edaa1c3fd04ced))



# [0.11.0](https://github.com/module-federation/nextjs-mf/compare/node-0.10.5...node-0.11.0) (2023-02-09)

### Dependency Updates

* `utils` updated to version `1.3.0`

### Features

* Delegate Modules ([#509](https://github.com/module-federation/nextjs-mf/issues/509)) ([1a085e7](https://github.com/module-federation/nextjs-mf/commit/1a085e7e03ca0afd5c64389b4b169f3db3382f6b))



## [0.10.5](https://github.com/module-federation/nextjs-mf/compare/node-0.10.4...node-0.10.5) (2023-02-09)

### Dependency Updates

* `utils` updated to version `1.2.1`


## [0.10.4](https://github.com/module-federation/nextjs-mf/compare/node-0.10.3...node-0.10.4) (2023-02-02)

## [0.10.5](https://github.com/module-federation/nextjs-mf/compare/node-0.10.4...node-0.10.5) (2023-02-02)

## [0.10.4](https://github.com/module-federation/nextjs-mf/compare/node-0.10.3...node-0.10.4) (2023-02-02)

## [0.10.4](https://github.com/module-federation/nextjs-mf/compare/node-0.10.3...node-0.10.4) (2023-02-02)

## [0.10.4](https://github.com/module-federation/nextjs-mf/compare/node-0.10.3...node-0.10.4) (2023-02-02)

## [0.10.4](https://github.com/module-federation/nextjs-mf/compare/node-0.10.3...node-0.10.4) (2023-02-02)

## [0.10.4](https://github.com/module-federation/nextjs-mf/compare/node-0.10.3...node-0.10.4) (2023-02-02)

## [0.10.3](https://github.com/module-federation/nextjs-mf/compare/node-0.10.2...node-0.10.3) (2023-01-31)

### Dependency Updates

- `utils` updated to version `1.2.0`

## [0.10.2](https://github.com/module-federation/nextjs-mf/compare/node-0.10.1...node-0.10.2) (2023-01-21)

### Dependency Updates

- `utils` updated to version `1.1.2`

## [0.10.1](https://github.com/module-federation/nextjs-mf/compare/node-0.10.0...node-0.10.1) (2023-01-11)

### Dependency Updates

- `utils` updated to version `1.1.1`

# [0.10.0](https://github.com/module-federation/nextjs-mf/compare/node-0.9.11...node-0.10.0) (2023-01-11)

### Bug Fixes

- [node] build error when no remotes are used ([#500](https://github.com/module-federation/nextjs-mf/issues/500)) ([189f3f9](https://github.com/module-federation/nextjs-mf/commit/189f3f95091684ac73a772d9bfd17a1e06ec1d65))

### Features

- [node] build error when no remotes are used ([dc73262](https://github.com/module-federation/nextjs-mf/commit/dc732621b1ede2bd761abaa766c6384ba041b502))

## [0.9.11](https://github.com/module-federation/nextjs-mf/compare/node-0.9.10...node-0.9.11) (2022-12-30)

### Dependency Updates

- `utils` updated to version `1.1.0`

## [0.9.10](https://github.com/module-federation/nextjs-mf/compare/node-0.9.9...node-0.9.10) (2022-12-29)

### Dependency Updates

- `utils` updated to version `1.0.4`

## [0.9.9](https://github.com/module-federation/nextjs-mf/compare/node-0.9.8...node-0.9.9) (2022-12-27)

### Dependency Updates

- `utils` updated to version `1.0.3`

## [0.9.8](https://github.com/module-federation/nextjs-mf/compare/node-0.9.7...node-0.9.8) (2022-12-27)

### Dependency Updates

- `utils` updated to version `1.0.2`

## [0.9.7](https://github.com/module-federation/nextjs-mf/compare/node-0.9.6...node-0.9.7) (2022-12-18)

### Bug Fixes

- **node:** verbose false should not log ([#400](https://github.com/module-federation/nextjs-mf/issues/400)) ([55e8962](https://github.com/module-federation/nextjs-mf/commit/55e89624a557135aaf87a373136da71d00750534))

## [0.9.6](https://github.com/module-federation/nextjs-mf/compare/node-0.9.5...node-0.9.6) (2022-11-22)

### Bug Fixes

- normalize options private variable on plugin constructors ([#390](https://github.com/module-federation/nextjs-mf/issues/390)) ([5654acd](https://github.com/module-federation/nextjs-mf/commit/5654acdf8e79f0b10f34bb58c6eb09c1b83675cb))

## [0.9.5](https://github.com/module-federation/nextjs-mf/compare/node-0.9.4...node-0.9.5) (2022-11-22)

### Bug Fixes

- increase chunk corrolation plugin scope ([#386](https://github.com/module-federation/nextjs-mf/issues/386)) ([ba567c3](https://github.com/module-federation/nextjs-mf/commit/ba567c37ec9d1b1aa9f457f8e9b4152ed5747e81))
- try catch on chunk flushing ([#388](https://github.com/module-federation/nextjs-mf/issues/388)) ([71cc898](https://github.com/module-federation/nextjs-mf/commit/71cc8984a2e6e0b26957d782dcb517d0c7fdc566))
- Improve logic ([#387](https://github.com/module-federation/nextjs-mf/issues/387)) ([0eb7f1b](https://github.com/module-federation/nextjs-mf/commit/0eb7f1bb77ef0a72ad26adeea1b508fbae60656f))

## [0.9.4](https://github.com/module-federation/nextjs-mf/compare/node-0.9.3...node-0.9.4) (2022-11-20)

## [0.9.3](https://github.com/module-federation/nextjs-mf/compare/node-0.9.2...node-0.9.3) (2022-11-20)

### Bug Fixes

- verbose types ([8f21b2a](https://github.com/module-federation/nextjs-mf/commit/8f21b2a4724c64da551fa11e2aad99dcbab75b28))

## [0.9.2](https://github.com/module-federation/nextjs-mf/compare/node-0.9.1...node-0.9.2) (2022-11-20)

## [0.9.1](https://github.com/module-federation/nextjs-mf/compare/node-0.9.0...node-0.9.1) (2022-11-20)

# [0.9.0](https://github.com/module-federation/nextjs-mf/compare/node-0.8.4...node-0.9.0) (2022-11-20)

### Dependency Updates

- `utils` updated to version `1.0.1`

### Bug Fixes

- stringify error ([a7c20f9](https://github.com/module-federation/nextjs-mf/commit/a7c20f9d989c1f27a0b72b9157fc3243020fd252))

### Features

- **node:** add flag to control logging ([eebab83](https://github.com/module-federation/nextjs-mf/commit/eebab83762a08d82393f04ed03c0af026356653a))
- support ssr remote entry images ([9ab2afa](https://github.com/module-federation/nextjs-mf/commit/9ab2afaef5115ae6677641cb9d021273dafebf86))

## [0.9.1](https://github.com/module-federation/nextjs-mf/compare/node-0.9.0...node-0.9.1) (2022-11-20)

### Dependency Updates

- `utils` updated to version `1.0.1`

### Bug Fixes

- stringify error ([a7c20f9](https://github.com/module-federation/nextjs-mf/commit/a7c20f9d989c1f27a0b72b9157fc3243020fd252))

# [0.9.0](https://github.com/module-federation/nextjs-mf/compare/node-0.8.4...node-0.9.0) (2022-11-20)

### Dependency Updates

- `utils` updated to version `1.0.0`

### Features

- **node:** add flag to control logging ([eebab83](https://github.com/module-federation/nextjs-mf/commit/eebab83762a08d82393f04ed03c0af026356653a))
- support ssr remote entry images ([9ab2afa](https://github.com/module-federation/nextjs-mf/commit/9ab2afaef5115ae6677641cb9d021273dafebf86))

## [0.8.4](https://github.com/module-federation/nextjs-mf/compare/node-0.8.3...node-0.8.4) (2022-11-02)

### Bug Fixes

- hot-reload not working when node-fetch is imported from require() ([#352](https://github.com/module-federation/nextjs-mf/issues/352)) ([74c35e6](https://github.com/module-federation/nextjs-mf/commit/74c35e6cf41fe69af6c17c44885663d46e9a1fbf))

## [0.8.3](https://github.com/module-federation/nextjs-mf/compare/node-0.8.2...node-0.8.3) (2022-10-31)

### Dependency Updates

- `utils` updated to version `0.5.0`

## [0.8.2](https://github.com/module-federation/nextjs-mf/compare/node-0.8.1...node-0.8.2) (2022-10-26)

### Bug Fixes

- Fix peer deps ([#342](https://github.com/module-federation/nextjs-mf/issues/342)) ([aa4ad00](https://github.com/module-federation/nextjs-mf/commit/aa4ad00615f4121bca4c2b2011bb6f0acc811919))

## [0.8.1](https://github.com/module-federation/nextjs-mf/compare/node-0.8.0...node-0.8.1) (2022-10-26)

### Dependency Updates

- `utils` updated to version `0.4.1`

# [0.8.0](https://github.com/module-federation/nextjs-mf/compare/node-0.7.0...node-0.8.0) (2022-10-26)

### Dependency Updates

- `utils` updated to version `0.4.0`

### Features

- Automatic Async boundary loader ([#330](https://github.com/module-federation/nextjs-mf/issues/330)) ([7e3c08c](https://github.com/module-federation/nextjs-mf/commit/7e3c08cf7835c0407bdce7ed6865b864153074a4))

# [0.7.0](https://github.com/module-federation/nextjs-mf/compare/node-0.6.7...node-0.7.0) (2022-10-19)

### Features

- consolidate promise factories in server ([#297](https://github.com/module-federation/nextjs-mf/issues/297)) ([55387ee](https://github.com/module-federation/nextjs-mf/commit/55387eeb952fb3164900d73ddcb0007f644c766f))

## [0.6.7](https://github.com/module-federation/nextjs-mf/compare/node-0.6.6...node-0.6.7) (2022-10-18)

### Bug Fixes

- reduce stats serialization ([#322](https://github.com/module-federation/nextjs-mf/issues/322)) ([c7ab66d](https://github.com/module-federation/nextjs-mf/commit/c7ab66dce01ac4509f16b0e8f20b43134376f841))

## [0.6.6](https://github.com/module-federation/nextjs-mf/compare/node-0.6.5...node-0.6.6) (2022-10-17)

### Bug Fixes

- add missing reject to promise new promise ([#319](https://github.com/module-federation/nextjs-mf/issues/319)) ([550a71a](https://github.com/module-federation/nextjs-mf/commit/550a71a2043f97fb5aae0e9fed5a63023db17b11))

## [0.6.5](https://github.com/module-federation/nextjs-mf/compare/node-0.6.4...node-0.6.5) (2022-10-17)

### Dependency Updates

- `utils` updated to version `0.3.4`

## [0.6.4](https://github.com/module-federation/nextjs-mf/compare/node-0.6.3...node-0.6.4) (2022-10-13)

### Dependency Updates

- `utils` updated to version `0.3.3`

## [0.6.3](https://github.com/module-federation/nextjs-mf/compare/node-0.6.2...node-0.6.3) (2022-10-12)

### Dependency Updates

- `utils` updated to version `0.3.2`

## [0.6.3](https://github.com/module-federation/nextjs-mf/compare/node-0.6.2...node-0.6.3) (2022-10-12)

### Dependency Updates

- `utils` updated to version `0.3.2`

## [0.6.2](https://github.com/module-federation/nextjs-mf/compare/node-0.6.1...node-0.6.2) (2022-10-11)

### Dependency Updates

- `utils` updated to version `0.3.1`

## [0.6.1](https://github.com/module-federation/nextjs-mf/compare/node-0.6.0...node-0.6.1) (2022-10-10)

### Bug Fixes

- support dynamic import of esm modules ([#296](https://github.com/module-federation/nextjs-mf/issues/296)) ([cf28356](https://github.com/module-federation/nextjs-mf/commit/cf28356728354e1f63c0d588035dd115398f8641))

# [0.6.0](https://github.com/module-federation/nextjs-mf/compare/node-0.5.7...node-0.6.0) (2022-10-07)

### Features

- implement **webpack_require**.l functionality in server builds ([99d1231](https://github.com/module-federation/nextjs-mf/commit/99d12314f68ac526000fa5410a14072a11b260a4))

# [0.6.0](https://github.com/module-federation/nextjs-mf/compare/node-0.5.7...node-0.6.0) (2022-10-07)

### Features

- implement **webpack_require**.l functionality in server builds ([99d1231](https://github.com/module-federation/nextjs-mf/commit/99d12314f68ac526000fa5410a14072a11b260a4))

## [0.5.7](https://github.com/module-federation/nextjs-mf/compare/node-0.5.6...node-0.5.7) (2022-10-06)

### Bug Fixes

- fix node plugin fs augments when outside next child compiler ([#284](https://github.com/module-federation/nextjs-mf/issues/284)) ([dfa99c8](https://github.com/module-federation/nextjs-mf/commit/dfa99c86fdd8d73091764532d52be5f81b89a508))

## [0.5.6](https://github.com/module-federation/nextjs-mf/compare/node-0.5.5...node-0.5.6) (2022-10-06)

## [0.5.5](https://github.com/module-federation/nextjs-mf/compare/node-0.5.4...node-0.5.5) (2022-10-06)

## [0.5.4](https://github.com/module-federation/nextjs-mf/compare/node-0.5.3...node-0.5.4) (2022-10-06)

## [0.5.4](https://github.com/module-federation/nextjs-mf/compare/node-0.5.3...node-0.5.4) (2022-10-06)

## [0.5.4](https://github.com/module-federation/nextjs-mf/compare/node-0.5.3...node-0.5.4) (2022-10-06)

## [0.5.4](https://github.com/module-federation/nextjs-mf/compare/node-0.5.3...node-0.5.4) (2022-10-06)

## [0.5.4](https://github.com/module-federation/nextjs-mf/compare/node-0.5.3...node-0.5.4) (2022-10-06)

## [0.5.4](https://github.com/module-federation/nextjs-mf/compare/node-0.5.3...node-0.5.4) (2022-10-06)

## [0.5.4](https://github.com/module-federation/nextjs-mf/compare/node-0.5.3...node-0.5.4) (2022-10-06)

## [0.5.4](https://github.com/module-federation/nextjs-mf/compare/node-0.5.3...node-0.5.4) (2022-10-06)

## [0.5.4](https://github.com/module-federation/nextjs-mf/compare/node-0.5.3...node-0.5.4) (2022-10-06)

## [0.5.3](https://github.com/module-federation/nextjs-mf/compare/node-0.5.2...node-0.5.3) (2022-10-06)

## [0.5.2](https://github.com/module-federation/nextjs-mf/compare/node-0.5.1...node-0.5.2) (2022-10-06)

## [0.5.1](https://github.com/module-federation/nextjs-mf/compare/node-0.5.0...node-0.5.1) (2022-10-06)

# [0.5.0](https://github.com/module-federation/nextjs-mf/compare/node-0.4.0...node-0.5.0) (2022-10-06)

### Bug Fixes

- improve handling of offline remotes ([#263](https://github.com/module-federation/nextjs-mf/issues/263)) ([e0eb437](https://github.com/module-federation/nextjs-mf/commit/e0eb437bbc0259a8f263ededa505a397fa59b97b))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

# [0.5.0](https://github.com/module-federation/nextjs-mf/compare/node-0.4.0...node-0.5.0) (2022-10-06)

### Bug Fixes

- improve handling of offline remotes ([#263](https://github.com/module-federation/nextjs-mf/issues/263)) ([e0eb437](https://github.com/module-federation/nextjs-mf/commit/e0eb437bbc0259a8f263ededa505a397fa59b97b))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.4.1](https://github.com/module-federation/nextjs-mf/compare/node-0.4.0...node-0.4.1) (2022-10-06)

### Bug Fixes

- improve handling of offline remotes ([#263](https://github.com/module-federation/nextjs-mf/issues/263)) ([e0eb437](https://github.com/module-federation/nextjs-mf/commit/e0eb437bbc0259a8f263ededa505a397fa59b97b))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

# [0.5.0](https://github.com/module-federation/nextjs-mf/compare/node-0.4.0...node-0.5.0) (2022-10-05)

### Bug Fixes

- improve handling of offline remotes ([3ae596e](https://github.com/module-federation/nextjs-mf/commit/3ae596ee82d2ccf0d828d7928cbdc4fbec509d55))
- improve handling of offline remotes ([#263](https://github.com/module-federation/nextjs-mf/issues/263)) ([e0eb437](https://github.com/module-federation/nextjs-mf/commit/e0eb437bbc0259a8f263ededa505a397fa59b97b))
- patch share scope on client server ([272c110](https://github.com/module-federation/nextjs-mf/commit/272c110a9cd3a194d2fdeaf1d620b14b29330b30))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.4.1](https://github.com/module-federation/nextjs-mf/compare/node-0.4.0...node-0.4.1) (2022-10-04)

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.4.1](https://github.com/module-federation/nextjs-mf/compare/node-0.4.0...node-0.4.1) (2022-10-04)

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.4.2](https://github.com/module-federation/nextjs-mf/compare/node-0.4.1...node-0.4.2) (2022-10-04)

### Bug Fixes

- removing loggers from flush chunks ([cde40ab](https://github.com/module-federation/nextjs-mf/commit/cde40ab3cccc8635cfca5fa37f07388b698e6de6))

## [0.4.1](https://github.com/module-federation/nextjs-mf/compare/node-0.4.0...node-0.4.1) (2022-10-04)

### Bug Fixes

- improve hot reloading, fix hung promises ([30918fe](https://github.com/module-federation/nextjs-mf/commit/30918fe61a6850b20271f8b72f786fd8a610de2a))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.4.1](https://github.com/module-federation/nextjs-mf/compare/node-0.4.0...node-0.4.1) (2022-10-04)

### Bug Fixes

- improve hot reloading, fix hung promises ([30918fe](https://github.com/module-federation/nextjs-mf/commit/30918fe61a6850b20271f8b72f786fd8a610de2a))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.4.1](https://github.com/module-federation/nextjs-mf/compare/node-0.4.0...node-0.4.1) (2022-10-04)

### Bug Fixes

- improve hot reloading, fix hung promises ([30918fe](https://github.com/module-federation/nextjs-mf/commit/30918fe61a6850b20271f8b72f786fd8a610de2a))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.4.1](https://github.com/module-federation/nextjs-mf/compare/node-0.4.0...node-0.4.1) (2022-10-04)

### Bug Fixes

- **fix hot reload:** prod reload fails due to old chunk flushing ([d552afa](https://github.com/module-federation/nextjs-mf/commit/d552afa4c254da1e3c43b9e8c70e945880eee897))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

# 0.1.0 (2022-10-04)

### Bug Fixes

- **node:** add node-fetch fallback in node hot-reload util ([4817463](https://github.com/module-federation/nextjs-mf/commit/4817463452221ca4835726a6a52f3292175a53b6))
- **node:** fix path to webpack hmr runtime ([#231](https://github.com/module-federation/nextjs-mf/issues/231)) ([78e5f3c](https://github.com/module-federation/nextjs-mf/commit/78e5f3cefc1d67a6ec5d66b72b8b35408e19cfc2))

### Features

- **chunk flushing:** enable Chunk Flushing for SSR, includes both plugin utils and React utils ([4e99290](https://github.com/module-federation/nextjs-mf/commit/4e99290d365cb46873eda052fb006172e99e4b24)), closes [#133](https://github.com/module-federation/nextjs-mf/issues/133)
- Move Repo to NX ([#154](https://github.com/module-federation/nextjs-mf/issues/154)) ([d2a4dfa](https://github.com/module-federation/nextjs-mf/commit/d2a4dfac7fcdaa2b6a21e3d2973808d01649da61)), closes [#199](https://github.com/module-federation/nextjs-mf/issues/199) [#205](https://github.com/module-federation/nextjs-mf/issues/205) [#144](https://github.com/module-federation/nextjs-mf/issues/144) [#212](https://github.com/module-federation/nextjs-mf/issues/212)

# 0.1.0 (2022-10-04)

### Bug Fixes

- **node:** add node-fetch fallback in node hot-reload util ([4817463](https://github.com/module-federation/nextjs-mf/commit/4817463452221ca4835726a6a52f3292175a53b6))
- **node:** fix path to webpack hmr runtime ([#231](https://github.com/module-federation/nextjs-mf/issues/231)) ([78e5f3c](https://github.com/module-federation/nextjs-mf/commit/78e5f3cefc1d67a6ec5d66b72b8b35408e19cfc2))

### Features

- **chunk flushing:** enable Chunk Flushing for SSR, includes both plugin utils and React utils ([4e99290](https://github.com/module-federation/nextjs-mf/commit/4e99290d365cb46873eda052fb006172e99e4b24)), closes [#133](https://github.com/module-federation/nextjs-mf/issues/133)
- Move Repo to NX ([#154](https://github.com/module-federation/nextjs-mf/issues/154)) ([d2a4dfa](https://github.com/module-federation/nextjs-mf/commit/d2a4dfac7fcdaa2b6a21e3d2973808d01649da61)), closes [#199](https://github.com/module-federation/nextjs-mf/issues/199) [#205](https://github.com/module-federation/nextjs-mf/issues/205) [#144](https://github.com/module-federation/nextjs-mf/issues/144) [#212](https://github.com/module-federation/nextjs-mf/issues/212)

# [0.3.0](https://github.com/module-federation/nextjs-mf/compare/node-0.2.0...node-0.3.0) (2022-09-29)

# [0.2.0](https://github.com/module-federation/nextjs-mf/compare/node-0.1.0...node-0.2.0) (2022-09-29)

# 0.1.0 (2022-09-29)

### Bug Fixes

- **node:** fix path to webpack hmr runtime ([#231](https://github.com/module-federation/nextjs-mf/issues/231)) ([78e5f3c](https://github.com/module-federation/nextjs-mf/commit/78e5f3cefc1d67a6ec5d66b72b8b35408e19cfc2))

### Features

- Move Repo to NX ([#154](https://github.com/module-federation/nextjs-mf/issues/154)) ([d2a4dfa](https://github.com/module-federation/nextjs-mf/commit/d2a4dfac7fcdaa2b6a21e3d2973808d01649da61)), closes [#199](https://github.com/module-federation/nextjs-mf/issues/199) [#205](https://github.com/module-federation/nextjs-mf/issues/205) [#144](https://github.com/module-federation/nextjs-mf/issues/144) [#212](https://github.com/module-federation/nextjs-mf/issues/212)
