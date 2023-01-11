# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [6.0.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.1...nextjs-mf-6.0.2) (2023-01-11)

### Dependency Updates

* `node` updated to version `0.10.0`


## [6.0.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.0...nextjs-mf-6.0.1) (2022-12-30)

### Dependency Updates

* `node` updated to version `0.9.11`
* `utils` updated to version `1.1.0`

### Bug Fixes

* dont apply async boundary loader to api routes ([#472](https://github.com/module-federation/nextjs-mf/issues/472)) ([52d0b6b](https://github.com/module-federation/nextjs-mf/commit/52d0b6bf453ca775c4f4e50bd645a28cbe341aa0))



# [6.0.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.14...nextjs-mf-6.0.0) (2022-12-29)

### Dependency Updates

* `node` updated to version `0.9.10`
* `utils` updated to version `1.0.4`

### Features

* change module sharing strategy ([#469](https://github.com/module-federation/nextjs-mf/issues/469)) ([5fecf86](https://github.com/module-federation/nextjs-mf/commit/5fecf867f34b20e2c7cea3909a1f306d46d92bf3))


### BREAKING CHANGES

* Previously, we used to "rekey" all shared packages used in a host in order to prevent eager consumption issues. However, this caused unforeseen issues when trying to share a singleton package, as the package would end up being bundled multiple times per page.

As a result, we have had to stop rekeying shared modules in userland and only do so on internal Next packages themselves.

If you need to dangerously share a package using the old method, you can do so by using the following code:

                 const shared = {
                   fakeLodash: {
                     import: "lodash",
                     shareKey: "lodash",
                   }
                 }

Please note that this method is now considered dangerous and should be used with caution.

* update build release

* update build release



## [5.12.14](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.13...nextjs-mf-5.12.14) (2022-12-27)

### Dependency Updates

* `node` updated to version `0.9.9`
* `utils` updated to version `1.0.3`


## [5.12.13](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.12...nextjs-mf-5.12.13) (2022-12-27)

### Dependency Updates

* `node` updated to version `0.9.8`
* `utils` updated to version `1.0.2`

### Bug Fixes

* **nextjs-mf:** fix client-side compilation ([#453](https://github.com/module-federation/nextjs-mf/issues/453)) ([d97d764](https://github.com/module-federation/nextjs-mf/commit/d97d764ded8d3cb1b5e04829eaf226f0c5a3baa3))



## [5.12.12](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.11...nextjs-mf-5.12.12) (2022-12-20)


### Bug Fixes

* **async-boundary-loader:** use relativeResource instead of this.resouce ([#421](https://github.com/module-federation/nextjs-mf/issues/421)) ([e1f4402](https://github.com/module-federation/nextjs-mf/commit/e1f4402a9c77709a4d3cd0ae87a28b961e1483d3))



## [5.12.11](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.10...nextjs-mf-5.12.11) (2022-12-18)

### Dependency Updates

* `node` updated to version `0.9.7`


## [5.12.10](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.9...nextjs-mf-5.12.10) (2022-11-23)


### Bug Fixes

* next images when debugging locally ([#395](https://github.com/module-federation/nextjs-mf/issues/395)) ([0379baa](https://github.com/module-federation/nextjs-mf/commit/0379baaae14960d0e7c7353e7d2b0aa1a4a02aa4))



## [5.12.9](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.8...nextjs-mf-5.12.9) (2022-11-23)


### Bug Fixes

* support images for storages and local debug ([#391](https://github.com/module-federation/nextjs-mf/issues/391)) ([9a72311](https://github.com/module-federation/nextjs-mf/commit/9a72311f18b5b3f1ae0badda3f25bd71cc6c8a3b))



## [5.12.8](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.7...nextjs-mf-5.12.8) (2022-11-22)

### Dependency Updates

* `node` updated to version `0.9.6`

### Bug Fixes

* normalize options private variable on plugin constructors ([#390](https://github.com/module-federation/nextjs-mf/issues/390)) ([5654acd](https://github.com/module-federation/nextjs-mf/commit/5654acdf8e79f0b10f34bb58c6eb09c1b83675cb))



## [5.12.7](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.6...nextjs-mf-5.12.7) (2022-11-22)


### Bug Fixes

*  improve syntax of loaders ([#389](https://github.com/module-federation/nextjs-mf/issues/389)) ([d7b7910](https://github.com/module-federation/nextjs-mf/commit/d7b79109343e4e39fc1f97cef999cb7620d80081))



## [5.12.6](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.5...nextjs-mf-5.12.6) (2022-11-22)

### Dependency Updates

* `node` updated to version `0.9.5`

### Bug Fixes

* Improve logic ([#387](https://github.com/module-federation/nextjs-mf/issues/387)) ([0eb7f1b](https://github.com/module-federation/nextjs-mf/commit/0eb7f1bb77ef0a72ad26adeea1b508fbae60656f))



## [5.12.5](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.4...nextjs-mf-5.12.5) (2022-11-20)



## [5.12.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.3...nextjs-mf-5.12.4) (2022-11-20)

### Dependency Updates

* `node` updated to version `0.9.4`


## [5.12.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.2...nextjs-mf-5.12.3) (2022-11-20)



## [5.12.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.1...nextjs-mf-5.12.2) (2022-11-20)



## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

* `node` updated to version `0.9.3`


## [5.12.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.1...nextjs-mf-5.12.2) (2022-11-20)



## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

* `node` updated to version `0.9.1`


## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

* `node` updated to version `0.9.1`


## [5.12.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.1...nextjs-mf-5.12.2) (2022-11-20)



## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

* `node` updated to version `0.9.1`


## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

* `node` updated to version `0.9.1`


## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

* `node` updated to version `0.9.1`


# [5.12.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.11.2...nextjs-mf-5.12.0) (2022-11-20)

### Dependency Updates

* `node` updated to version `0.9.0`
* `utils` updated to version `1.0.1`

### Bug Fixes

* Better page regex ([#346](https://github.com/module-federation/nextjs-mf/issues/346)) ([b525d3b](https://github.com/module-federation/nextjs-mf/commit/b525d3b579af2ac3a8b502f3c996de8726dbcadd))
* better page regex for adding loaders ([72fef27](https://github.com/module-federation/nextjs-mf/commit/72fef2792dc39c7605f8b9f8136f5d18a46a3fe5))
* Fix peer deps ([#343](https://github.com/module-federation/nextjs-mf/issues/343)) ([8e7b087](https://github.com/module-federation/nextjs-mf/commit/8e7b0871507911bb81161b9786901877259edaed))
* include styled-jsx/style in defaults share ([#347](https://github.com/module-federation/nextjs-mf/issues/347)) ([cb0675b](https://github.com/module-federation/nextjs-mf/commit/cb0675be8e3a4fe0ec89ef7f190610392bb16b6d))
* update version ([70bda37](https://github.com/module-federation/nextjs-mf/commit/70bda37744f55af849bd5c28684f42851bbf7d1f))


### Features

* support ssr remote entry images ([9ab2afa](https://github.com/module-federation/nextjs-mf/commit/9ab2afaef5115ae6677641cb9d021273dafebf86))



# [5.12.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.11.2...nextjs-mf-5.12.0) (2022-11-20)

### Dependency Updates

* `node` updated to version `0.9.0`
* `utils` updated to version `1.0.0`

### Bug Fixes

* Better page regex ([#346](https://github.com/module-federation/nextjs-mf/issues/346)) ([b525d3b](https://github.com/module-federation/nextjs-mf/commit/b525d3b579af2ac3a8b502f3c996de8726dbcadd))
* better page regex for adding loaders ([72fef27](https://github.com/module-federation/nextjs-mf/commit/72fef2792dc39c7605f8b9f8136f5d18a46a3fe5))
* Fix peer deps ([#343](https://github.com/module-federation/nextjs-mf/issues/343)) ([8e7b087](https://github.com/module-federation/nextjs-mf/commit/8e7b0871507911bb81161b9786901877259edaed))
* include styled-jsx/style in defaults share ([#347](https://github.com/module-federation/nextjs-mf/issues/347)) ([cb0675b](https://github.com/module-federation/nextjs-mf/commit/cb0675be8e3a4fe0ec89ef7f190610392bb16b6d))
* update version ([70bda37](https://github.com/module-federation/nextjs-mf/commit/70bda37744f55af849bd5c28684f42851bbf7d1f))


### Features

* support ssr remote entry images ([9ab2afa](https://github.com/module-federation/nextjs-mf/commit/9ab2afaef5115ae6677641cb9d021273dafebf86))



## [5.11.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.11.2...nextjs-mf-5.11.3) (2022-10-26)


### Bug Fixes

* Fix peer deps ([#343](https://github.com/module-federation/nextjs-mf/issues/343)) ([8e7b087](https://github.com/module-federation/nextjs-mf/commit/8e7b0871507911bb81161b9786901877259edaed))



## [5.11.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.11.1...nextjs-mf-5.11.2) (2022-10-26)

### Dependency Updates

* `node` updated to version `0.8.2`


## [5.11.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.11.0...nextjs-mf-5.11.1) (2022-10-26)

### Dependency Updates

* `node` updated to version `0.8.1`
* `utils` updated to version `0.4.1`


# [5.11.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.5...nextjs-mf-5.11.0) (2022-10-26)

### Dependency Updates

* `node` updated to version `0.8.0`
* `utils` updated to version `0.4.0`

### Features

*  Automatic Async boundary loader ([#330](https://github.com/module-federation/nextjs-mf/issues/330)) ([7e3c08c](https://github.com/module-federation/nextjs-mf/commit/7e3c08cf7835c0407bdce7ed6865b864153074a4))



## [5.10.5](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.4...nextjs-mf-5.10.5) (2022-10-26)


### Bug Fixes

* improve loader paths for including defaults ([#338](https://github.com/module-federation/nextjs-mf/issues/338)) ([a99fe97](https://github.com/module-federation/nextjs-mf/commit/a99fe977eeaecce54e5241b42aabd552c52b8129))



## [5.10.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.3...nextjs-mf-5.10.4) (2022-10-26)


### Bug Fixes

* update next peer dep to 12.3.0 ([#328](https://github.com/module-federation/nextjs-mf/issues/328)) ([841be9d](https://github.com/module-federation/nextjs-mf/commit/841be9d027b6b33cca27b884f87f27dd7a9bdee5))



## [5.10.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.2...nextjs-mf-5.10.3) (2022-10-26)


### Bug Fixes

* share styled-jsx/style as singleton ([#333](https://github.com/module-federation/nextjs-mf/issues/333)) ([dd2c2d1](https://github.com/module-federation/nextjs-mf/commit/dd2c2d173000e7f89ecc7961255c6a29b769f278))



## [5.10.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.1...nextjs-mf-5.10.2) (2022-10-24)


### Bug Fixes

* support include defaults for windows ([#327](https://github.com/module-federation/nextjs-mf/issues/327)) ([059db4e](https://github.com/module-federation/nextjs-mf/commit/059db4eb604368e14eef464caca6d16463a6d706))



## [5.10.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.0...nextjs-mf-5.10.1) (2022-10-19)



# [5.10.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.17...nextjs-mf-5.10.0) (2022-10-19)

### Dependency Updates

* `node` updated to version `0.7.0`

### Features

* consolidate promise factories in server ([#297](https://github.com/module-federation/nextjs-mf/issues/297)) ([55387ee](https://github.com/module-federation/nextjs-mf/commit/55387eeb952fb3164900d73ddcb0007f644c766f))



## [5.9.17](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.16...nextjs-mf-5.9.17) (2022-10-18)

### Dependency Updates

* `node` updated to version `0.6.7`

### Bug Fixes

* reduce stats serialization ([#322](https://github.com/module-federation/nextjs-mf/issues/322)) ([c7ab66d](https://github.com/module-federation/nextjs-mf/commit/c7ab66dce01ac4509f16b0e8f20b43134376f841))



## [5.9.16](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.15...nextjs-mf-5.9.16) (2022-10-17)

### Dependency Updates

* `node` updated to version `0.6.6`


## [5.9.15](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.14...nextjs-mf-5.9.15) (2022-10-17)

### Dependency Updates

* `node` updated to version `0.6.5`
* `utils` updated to version `0.3.4`


## [5.9.14](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.13...nextjs-mf-5.9.14) (2022-10-14)


### Bug Fixes

* isolate loader scope to just js files ([#317](https://github.com/module-federation/nextjs-mf/issues/317)) ([ac56950](https://github.com/module-federation/nextjs-mf/commit/ac56950cba8f23fcb58ac83fed29766608aaabc8))



## [5.9.13](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.12...nextjs-mf-5.9.13) (2022-10-14)


### Bug Fixes

* improve include defaults loader ([#315](https://github.com/module-federation/nextjs-mf/issues/315)) ([f228e49](https://github.com/module-federation/nextjs-mf/commit/f228e49afbbe54950b4187b72aabaef8174d0758))



## [5.9.12](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.11...nextjs-mf-5.9.12) (2022-10-13)

### Dependency Updates

* `node` updated to version `0.6.4`
* `utils` updated to version `0.3.3`


## [5.9.11](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.10...nextjs-mf-5.9.11) (2022-10-12)


### Bug Fixes

* revert prettier ([cef32b8](https://github.com/module-federation/nextjs-mf/commit/cef32b82ca124e8d707193ddd70371a009641665))



## [5.9.10](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.9...nextjs-mf-5.9.10) (2022-10-12)


### Bug Fixes

* do not push tags ([ba8a811](https://github.com/module-federation/nextjs-mf/commit/ba8a811592329b78eac0c3d1c9dae07927a804b1))



## [5.9.9](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.8...nextjs-mf-5.9.9) (2022-10-12)



## [5.9.8](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.7...nextjs-mf-5.9.8) (2022-10-12)



## [5.9.7](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.6...nextjs-mf-5.9.7) (2022-10-12)



## [5.9.6](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.5...nextjs-mf-5.9.6) (2022-10-12)



## [5.9.5](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.4...nextjs-mf-5.9.5) (2022-10-12)



## [5.9.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.1...nextjs-mf-5.9.2) (2022-10-11)

### Dependency Updates

* `node` updated to version `0.6.2`
* `utils` updated to version `0.3.1`


## [5.9.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.0...nextjs-mf-5.9.1) (2022-10-10)

### Dependency Updates

* `node` updated to version `0.6.1`


# [5.9.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.5...nextjs-mf-5.9.0) (2022-10-08)

### Dependency Updates

* `node` updated to version `0.6.0`
* `utils` updated to version `0.3.0`

### Features

* implement __webpack_require__.l functionality in server builds ([99d1231](https://github.com/module-federation/nextjs-mf/commit/99d12314f68ac526000fa5410a14072a11b260a4))



# [5.9.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.5...nextjs-mf-5.9.0) (2022-10-08)

### Dependency Updates

* `node` updated to version `0.6.0`
* `utils` updated to version `0.3.0`

### Features

* implement __webpack_require__.l functionality in server builds ([99d1231](https://github.com/module-federation/nextjs-mf/commit/99d12314f68ac526000fa5410a14072a11b260a4))



## [5.8.5](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.4...nextjs-mf-5.8.5) (2022-10-07)

### Dependency Updates

* `node` updated to version `0.5.7`
* `utils` updated to version `0.2.1`


## [5.8.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.3...nextjs-mf-5.8.4) (2022-10-06)



## [5.8.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.2...nextjs-mf-5.8.3) (2022-10-06)



## [5.8.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.1...nextjs-mf-5.8.2) (2022-10-06)



## [5.8.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.0...nextjs-mf-5.8.1) (2022-10-06)



# [5.8.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.2...nextjs-mf-5.8.0) (2022-10-06)



# [5.8.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.2...nextjs-mf-5.8.0) (2022-10-06)



## [5.7.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.1...nextjs-mf-5.7.2) (2022-10-06)



## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-06)


### Bug Fixes

* flush CSS chunks, cache bust remote entry on render ([#269](https://github.com/module-federation/nextjs-mf/issues/269)) ([85a216a](https://github.com/module-federation/nextjs-mf/commit/85a216a8fd34ae849630ff5b42bacb26c855a9ce))
* improve handling of offline remotes ([#263](https://github.com/module-federation/nextjs-mf/issues/263)) ([e0eb437](https://github.com/module-federation/nextjs-mf/commit/e0eb437bbc0259a8f263ededa505a397fa59b97b))
* **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))



## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-06)


### Bug Fixes

* flush CSS chunks, cache bust remote entry on render ([#269](https://github.com/module-federation/nextjs-mf/issues/269)) ([85a216a](https://github.com/module-federation/nextjs-mf/commit/85a216a8fd34ae849630ff5b42bacb26c855a9ce))
* improve handling of offline remotes ([#263](https://github.com/module-federation/nextjs-mf/issues/263)) ([e0eb437](https://github.com/module-federation/nextjs-mf/commit/e0eb437bbc0259a8f263ededa505a397fa59b97b))
* **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))



# [5.8.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.8.0) (2022-10-05)


### Bug Fixes

* improve handling of offline remotes ([3ae596e](https://github.com/module-federation/nextjs-mf/commit/3ae596ee82d2ccf0d828d7928cbdc4fbec509d55))
* patch share scope on client server ([fc7f82f](https://github.com/module-federation/nextjs-mf/commit/fc7f82fd1f299a078552ce811d074b816e796109))
* patch share scope on client server ([b4461fd](https://github.com/module-federation/nextjs-mf/commit/b4461fdbe6999390cbf4b57c18c537563cf04cc9))
* patch share scope on client server ([31b4c24](https://github.com/module-federation/nextjs-mf/commit/31b4c24112e27630b588410d9d78e89acc579d26))
* patch share scope on client server ([272c110](https://github.com/module-federation/nextjs-mf/commit/272c110a9cd3a194d2fdeaf1d620b14b29330b30))
* **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))



## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-05)


### Bug Fixes

* improve handling of offline remotes ([3ae596e](https://github.com/module-federation/nextjs-mf/commit/3ae596ee82d2ccf0d828d7928cbdc4fbec509d55))
* patch share scope on client server ([fc7f82f](https://github.com/module-federation/nextjs-mf/commit/fc7f82fd1f299a078552ce811d074b816e796109))
* patch share scope on client server ([b4461fd](https://github.com/module-federation/nextjs-mf/commit/b4461fdbe6999390cbf4b57c18c537563cf04cc9))
* patch share scope on client server ([31b4c24](https://github.com/module-federation/nextjs-mf/commit/31b4c24112e27630b588410d9d78e89acc579d26))
* patch share scope on client server ([272c110](https://github.com/module-federation/nextjs-mf/commit/272c110a9cd3a194d2fdeaf1d620b14b29330b30))
* **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))



## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

* `node` updated to version `0.4.2`
* `utils` updated to version `0.0.4`

### Bug Fixes

* removing debug loggers from child federation plugin hooks ([00deec7](https://github.com/module-federation/nextjs-mf/commit/00deec72585675591ad39f64f0c5f94355f4bd53))
* **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))



## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

* `node` updated to version `0.4.2`
* `utils` updated to version `0.0.4`

### Bug Fixes

* removing debug loggers from child federation plugin hooks ([00deec7](https://github.com/module-federation/nextjs-mf/commit/00deec72585675591ad39f64f0c5f94355f4bd53))
* **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))



## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

* `node` updated to version `0.4.2`
* `utils` updated to version `0.0.4`

### Bug Fixes

* removing debug loggers from child federation plugin hooks ([00deec7](https://github.com/module-federation/nextjs-mf/commit/00deec72585675591ad39f64f0c5f94355f4bd53))
* **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))



## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

* `node` updated to version `0.4.2`
* `utils` updated to version `0.0.4`

### Bug Fixes

* removing debug loggers from child federation plugin hooks ([00deec7](https://github.com/module-federation/nextjs-mf/commit/00deec72585675591ad39f64f0c5f94355f4bd53))
* **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))



## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

* `node` updated to version `0.4.2`
* `utils` updated to version `0.0.4`

### Bug Fixes

* **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))



## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

* `node` updated to version `0.4.2`
* `utils` updated to version `0.0.4`

### Bug Fixes

* **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))



## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

* `node` updated to version `0.4.1`
* `utils` updated to version `0.0.4`

### Bug Fixes

* **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))



## [5.6.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-0.1.0...nextjs-mf-5.6.4) (2022-10-04)

### Dependency Updates

* `node` updated to version `0.1.0`
* `utils` updated to version `0.0.1`


# 0.1.0 (2022-10-04)

### Dependency Updates

* `node` updated to version `0.1.0`
* `utils` updated to version `0.0.1`

### Bug Fixes

* **fixing chunk naming prefixes on server builds:** fix server name prefix on chunks ([7839713](https://github.com/module-federation/nextjs-mf/commit/78397136d3bf6677c1eae895853cbe36202125c3))
* SSR files not getting generated when enabled ([#227](https://github.com/module-federation/nextjs-mf/issues/227)) ([a5f476a](https://github.com/module-federation/nextjs-mf/commit/a5f476aeee2dd42e75ef5f3217791308f1515634)), closes [#226](https://github.com/module-federation/nextjs-mf/issues/226)


### Features

* **chunk flushing:** enable Chunk Flushing for SSR, includes both plugin utils and React utils ([4e99290](https://github.com/module-federation/nextjs-mf/commit/4e99290d365cb46873eda052fb006172e99e4b24)), closes [#133](https://github.com/module-federation/nextjs-mf/issues/133)
* Move Repo to NX ([#154](https://github.com/module-federation/nextjs-mf/issues/154)) ([d2a4dfa](https://github.com/module-federation/nextjs-mf/commit/d2a4dfac7fcdaa2b6a21e3d2973808d01649da61)), closes [#199](https://github.com/module-federation/nextjs-mf/issues/199) [#205](https://github.com/module-federation/nextjs-mf/issues/205) [#144](https://github.com/module-federation/nextjs-mf/issues/144) [#212](https://github.com/module-federation/nextjs-mf/issues/212)
* update the `next` peer dep in nextjs-mf ([#221](https://github.com/module-federation/nextjs-mf/issues/221)) ([d9b1677](https://github.com/module-federation/nextjs-mf/commit/d9b16776b1c4ed61e6c0e0414ed452d7312c1806))
