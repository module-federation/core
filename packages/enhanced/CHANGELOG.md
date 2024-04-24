# [0.2.0-canary.5](https://github.com/module-federation/universe/compare/enhanced-0.2.0-canary.4...enhanced-0.2.0-canary.5) (2023-11-20)

## 0.1.8

### Patch Changes

- 56eb56a: add chunk matcher logic to federation runtime module
- b120511: Improve Async Boundary Plugin on entry that use dependOn and improve chunk dep search
  - @module-federation/rspack@0.1.8
  - @module-federation/sdk@0.1.8
  - @module-federation/runtime-tools@0.1.8
  - @module-federation/managers@0.1.8
  - @module-federation/manifest@0.1.8
  - @module-federation/dts-plugin@0.1.8

## 0.1.7

### Patch Changes

- 648353b: Check that runtime plugins are not undefined or tree shaken out before calling the factory functions
  - @module-federation/runtime-tools@0.1.7
  - @module-federation/rspack@0.1.7
  - @module-federation/sdk@0.1.7
  - @module-federation/managers@0.1.7
  - @module-federation/manifest@0.1.7
  - @module-federation/dts-plugin@0.1.7

## 0.1.6

### Patch Changes

- 72c7b80: chore: fix release tag
- Updated dependencies [72c7b80]
  - @module-federation/dts-plugin@0.1.6
  - @module-federation/managers@0.1.6
  - @module-federation/manifest@0.1.6
  - @module-federation/rspack@0.1.6
  - @module-federation/runtime-tools@0.1.6
  - @module-federation/sdk@0.1.6

## 0.1.5

### Patch Changes

- 876a4ff: feat: support config shared import:false in runtime
- e0acf83: chore: downgrade template code to es5
- 1a9c6e7: feat: support config multiple versions shared
- Updated dependencies [f9b8af7]
- Updated dependencies [71559fb]
- Updated dependencies [ca271ab]
- Updated dependencies [1a9c6e7]
  - @module-federation/dts-plugin@0.1.5
  - @module-federation/manifest@0.1.5
  - @module-federation/sdk@0.1.5
  - @module-federation/runtime-tools@0.1.5
  - @module-federation/rspack@0.1.5
  - @module-federation/managers@0.1.5

## 0.1.4

### Patch Changes

- 8f3a440: fix: detect whether the project is ts
- 2f697b9: fix: fixed type declaration in pkg
- 8f3a440: allow dts plugin to be disabled
- Updated dependencies [8f3a440]
- Updated dependencies [2f697b9]
  - @module-federation/dts-plugin@0.1.4
  - @module-federation/sdk@0.1.4
  - @module-federation/runtime-tools@0.1.4
  - @module-federation/manifest@0.1.4
  - @module-federation/rspack@0.1.4
  - @module-federation/managers@0.1.4

## 0.1.3

### Patch Changes

- 32eba3c: fix: chunkId may equal number 0
- 6b3b210: revert chunk integration
- Updated dependencies [f926b6c]
  - @module-federation/dts-plugin@0.1.3
  - @module-federation/manifest@0.1.3
  - @module-federation/runtime-tools@0.1.3
  - @module-federation/rspack@0.1.3
  - @module-federation/sdk@0.1.3
  - @module-federation/managers@0.1.3

## 0.1.2

### Patch Changes

- c1efbbf: chore: convergence of all package entries
  chore: 收敛所有包的入口
- c8c0ad2: feat: enhance type capability
- 1bb03d1: chore: rename @module-federation/enhanced-rspack to @module-federation/rspack
- 1bb03d1: chore: enhanced export runtime
- Updated dependencies [c8c0ad2]
- Updated dependencies [1bb03d1]
  - @module-federation/rspack@0.1.2
  - @module-federation/dts-plugin@0.1.2
  - @module-federation/manifest@0.1.2
  - @module-federation/sdk@0.1.2
  - @module-federation/managers@0.1.2
  - @module-federation/runtime-tools@0.1.2

## 0.1.1

### Patch Changes

- ee57fb0: update chunk integration for entry modules
  - @module-federation/sdk@0.1.1
  - @module-federation/runtime-tools@0.1.1
  - @module-federation/managers@0.1.1
  - @module-federation/manifest@0.1.1

## 0.1.0

### Minor Changes

- df3ef24: use chunk integration to initalize federation runtime and plugins in runtime bootstrap

### Patch Changes

- df3ef24: Support multiple runtime chunks, single runtime chunks in reference hoisting
- df3ef24: chore: adjust add federation init process
- Updated dependencies [df3ef24]
- Updated dependencies [df3ef24]
- Updated dependencies [df3ef24]
- Updated dependencies [df3ef24]
  - @module-federation/sdk@0.1.0
  - @module-federation/runtime-tools@0.1.0
  - @module-federation/managers@0.1.0
  - @module-federation/manifest@0.1.0

## 0.0.17

### Patch Changes

- @module-federation/runtime-tools@0.0.17
- @module-federation/sdk@0.0.17
- @module-federation/managers@0.0.17
- @module-federation/manifest@0.0.17

## 0.0.16

### Patch Changes

- Updated dependencies [ccafac3]
  - @module-federation/manifest@0.0.16
  - @module-federation/sdk@0.0.16
  - @module-federation/runtime-tools@0.0.16
  - @module-federation/managers@0.0.16

## 0.0.15

### Patch Changes

- ba5bedd: feat: support manifest
- Updated dependencies [3a45d99]
- Updated dependencies [ba5bedd]
  - @module-federation/sdk@0.0.15
  - @module-federation/managers@0.0.15
  - @module-federation/manifest@0.0.15
  - @module-federation/runtime-tools@0.0.15

## 0.0.14

### Patch Changes

- Updated dependencies [cd8c7bf]
- Updated dependencies [5576c6b]
  - @module-federation/sdk@0.0.14
  - @module-federation/runtime-tools@0.0.14

## 0.0.13

### Patch Changes

- Updated dependencies [804447c]
  - @module-federation/sdk@0.0.13
  - @module-federation/runtime-tools@0.0.13

## 0.0.12

### Patch Changes

- 4ca0c7b: fix(enhanced): use upath to against more edge cases between different OS
  - @module-federation/sdk@0.0.12
  - @module-federation/runtime-tools@0.0.12

## 0.0.11

### Patch Changes

- 5c17bc4: normalize bundler runtime import paths
  - @module-federation/runtime-tools@0.0.11
  - @module-federation/sdk@0.0.11

## 0.0.10

### Patch Changes

- 51b18e0: Fix bug in AyncBoundaryPlugin when chunkID is not set to named and dependOn exists
  - @module-federation/runtime-tools@0.0.10
  - @module-federation/sdk@0.0.10

## 0.0.9

### Patch Changes

- 1147f48: fix: not duplicate set resolve.alias
- cf8634d: fix: copy decalaration files to output
- 2ad29a6: fix: remove duplicate init shareScopeMap
  fix: normalize schemas path
  fix: shared is loaded if it has lib attr
  - @module-federation/runtime-tools@0.0.9
  - @module-federation/sdk@0.0.9

## 0.0.8

### Patch Changes

- 98eb40d: feat: enhanced
- Updated dependencies [98eb40d]
- Updated dependencies [98eb40d]
  - @module-federation/sdk@0.0.8
  - @module-federation/runtime-tools@0.0.8

## 0.0.7

### Patch Changes

- @module-federation/sdk@0.0.7

## 0.0.6

### Patch Changes

- @module-federation/sdk@0.0.6

## 0.0.5

### Patch Changes

- Updated dependencies [5a79cb3]
  - @module-federation/sdk@0.0.5

## 0.0.4

### Patch Changes

- @module-federation/sdk@0.0.4

### Bug Fixes

- align with bytedance linting ([8000055](https://github.com/module-federation/universe/commit/800005571f37e0d1b31590834ddcd4d98bbd3086))
- **enhanced:** refactory async boundary plugin ([230a105](https://github.com/module-federation/universe/commit/230a105b230ba108318d3e0aab6bea8e94fb3699))
- nx build dep sync ([38c0902](https://github.com/module-federation/universe/commit/38c09025aeee8b3bb91f45721678d59ff814b8ba))

# [0.2.0-canary.4](https://github.com/module-federation/universe/compare/enhanced-0.2.0-canary.3...enhanced-0.2.0-canary.4) (2023-11-20)

### Bug Fixes

- **enhanced:** use getAllReferencedChunks api for federation indexing ([b8846be](https://github.com/module-federation/universe/commit/b8846be5135c58841c3c22453e45751bebbecdeb))
- **nextjs-mf:** Improved async startup dep track ([839e47b](https://github.com/module-federation/universe/commit/839e47bc7e1b887f0729c17257e6dd17cc3e3a5d))
- rename plugin took tap ([b1e0f58](https://github.com/module-federation/universe/commit/b1e0f58d689a60223b03277fbffe3c5bd18dd481))

### Features

- **enhanced:** ✨ Reference Hoisting ([6ab3e72](https://github.com/module-federation/universe/commit/6ab3e72b147bf8338a4e50fee2ff49cc79c53195))
- **enhanced:** HoistContainerReferencesPlugin ([adc00e7](https://github.com/module-federation/universe/commit/adc00e744522d3a96cbac7ff4f6fdfa435f77896))
- **nextjs-mf:** Use HoistReferencePlugin over DelegatePlugin ([e8f1e43](https://github.com/module-federation/universe/commit/e8f1e437f13ad0b922c7e147c4911d83ebf1b226))

# [0.2.0-canary.3](https://github.com/module-federation/universe/compare/enhanced-0.2.0-canary.2...enhanced-0.2.0-canary.3) (2023-11-08)

### Bug Fixes

- **enhanced:** correct schema validation issues ([5a04a81](https://github.com/module-federation/universe/commit/5a04a812f505ab8287d206abd0a6996057a994fc))

# [0.2.0-canary.2](https://github.com/module-federation/universe/compare/enhanced-0.2.0-canary.1...enhanced-0.2.0-canary.2) (2023-11-07)

### Bug Fixes

- issues with integrated runtime chunk ([edc4d97](https://github.com/module-federation/universe/commit/edc4d97393c8ad04adecc53062f40a80735defb7))
- issues with integrated runtime chunk ([d4fa90d](https://github.com/module-federation/universe/commit/d4fa90de214e5b15957c208436878d82ce223a22))
- issues with integrated runtime chunk ([aa1b137](https://github.com/module-federation/universe/commit/aa1b13791e353433d2a219addbef1443b853c2f0))

### Features

- **enhanced:** AsyncBoundary support ESM targets and remix_run framework outputs ([0100694](https://github.com/module-federation/universe/commit/0100694a07044460dc44a73cfb4ecff619177457))

# [0.2.0-canary.1](https://github.com/module-federation/universe/compare/enhanced-0.1.0...enhanced-0.2.0-canary.1) (2023-11-06)

### Bug Fixes

- **deps:** update dependency typedoc to v0.25.2 ([46c6524](https://github.com/module-federation/universe/commit/46c65247e187cee9e15625402c1570ac351bb1fe))
- **deps:** update dependency undici to v5.26.2 [security] ([410a8b8](https://github.com/module-federation/universe/commit/410a8b8bd1558dfb5119ae10941d2b3816a0d0e0))
- override semantic-release-plugin-decorators ([18675de](https://github.com/module-federation/universe/commit/18675defef65570d2b3bb6a9caa3fd039badee29))
- switch to @goestav/nx-semantic-release ([63a3350](https://github.com/module-federation/universe/commit/63a3350a6a1a12235e3c9f1e7c724d54f0476356))

### Features

- **enhanced:** new async boundary plugin design ([a4ac1ac](https://github.com/module-federation/universe/commit/a4ac1acff974f74db6395c31134de14d9c344b6f))
- **enhanced:** Rewrite Async Boundary based on bytedance version ([fa05dd6](https://github.com/module-federation/universe/commit/fa05dd6bce2dd577b1e3fd84533459a04dbe195a))
- **enhanced:** Support Async Mode and option ([3c33b8e](https://github.com/module-federation/universe/commit/3c33b8ea3b483de5dcc3e5da9fb40c9826fdb7f7))
- new actions, remove gpt integration ([370229e](https://github.com/module-federation/universe/commit/370229e02cc352fcfaeaa0f3cf1f9f2d4966d1bb))

# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

# [0.1.0](https://github.com/module-federation/nextjs-mf/compare/enhanced-0.0.4-0...enhanced-0.1.0) (2023-10-07)

### Bug Fixes

- ensure chunk handler exists before calling it ([98ba838](https://github.com/module-federation/nextjs-mf/commit/98ba838f979bbef11f5d678c3bf27a4de534cf9d))

### Features

- AddRuntimeRequirementToPromiseExternal ([9bc5a20](https://github.com/module-federation/nextjs-mf/commit/9bc5a20b54228de7d1f2554eee10360a34e8d8a1))

## [0.0.4-0](https://github.com/module-federation/nextjs-mf/compare/enhanced-0.0.3...enhanced-0.0.4-0) (2023-10-03)

### Bug Fixes

- no external helpers ([6c47fd4](https://github.com/module-federation/nextjs-mf/commit/6c47fd4ce19f2292f6718d201005fba4a8552252))

## [0.0.3](https://github.com/module-federation/nextjs-mf/compare/enhanced-0.0.2...enhanced-0.0.3) (2023-10-03)

## [0.0.2](https://github.com/module-federation/nextjs-mf/compare/enhanced-0.0.1...enhanced-0.0.2) (2023-10-03)

## [0.0.1](https://github.com/module-federation/nextjs-mf/compare/enhanced-0.0.1-rc.0...enhanced-0.0.1) (2023-10-03)

## 0.0.1-rc.0 (2023-10-03)

### Bug Fixes

- add missing serialize method on RemoteModule ([e7ac801](https://github.com/module-federation/nextjs-mf/commit/e7ac801151b08dbb5ca025bd8ac03683f792f92f))
- add override to remoteModule ([875038a](https://github.com/module-federation/nextjs-mf/commit/875038ad68dfed05822c1bc7c68ae91e57282f4f))
- bad impleentation during federation port ([cc2e53f](https://github.com/module-federation/nextjs-mf/commit/cc2e53f0351fb94c9068223ad6b8d990a913ab53))
- broken versioning issues in consumes ([e7fada2](https://github.com/module-federation/nextjs-mf/commit/e7fada211b1e58dc52eafeff4210a9ce62636f9d))
- change exports for module info runtime ([f40c538](https://github.com/module-federation/nextjs-mf/commit/f40c538221353a61938cadf624c9235ec8eb4cce))
- **enhanced:** module info duplication ([49b4a57](https://github.com/module-federation/nextjs-mf/commit/49b4a5736714c1db4510d10cdd5fe0277123caa8))
- **enhanced:** syntax issue in proxy ([2e5848b](https://github.com/module-federation/nextjs-mf/commit/2e5848b4be3e3bba46508a427c1bc8f2d3043c8d))
- improve backward compat **remote_scope** global ([ac0efa3](https://github.com/module-federation/nextjs-mf/commit/ac0efa37d975a130aa3badc657fa66d723865a5b))
- improve logic in runtime module info proxy ([8eea1a8](https://github.com/module-federation/nextjs-mf/commit/8eea1a84ae6a12f69dbb16d00f52ec902efbdda6))
- legacy scope duplication on recreation ([347e4c9](https://github.com/module-federation/nextjs-mf/commit/347e4c96e87ff4f28dce319fc6b2fe40f1cbabee))
- package data ([992d298](https://github.com/module-federation/nextjs-mf/commit/992d2985c29d0bf86de6739f728fbf64749e7fd0))
- remote global share scope ([e05d32f](https://github.com/module-federation/nextjs-mf/commit/e05d32f489880d6b4e0fc21a3807e619a40bc5b3))
- Ts import error ([6e7974c](https://github.com/module-federation/nextjs-mf/commit/6e7974c22874378122ab31eea27dddd0604505db))
- TS imports to webpack ([d506b49](https://github.com/module-federation/nextjs-mf/commit/d506b492b724ccfb7fdcf6234196ac421564c153))
- TS imports, missing module methods ([8eb422d](https://github.com/module-federation/nextjs-mf/commit/8eb422d30e149cb0d96835f036ec73ce1ccafe53))
- ts in template string ([579b341](https://github.com/module-federation/nextjs-mf/commit/579b341a5eb38ca6396da15f9667729ab84d2ff6))
- ts in template string ([37e790a](https://github.com/module-federation/nextjs-mf/commit/37e790a7b46ff6d8c8fd2c12cfd5629900db1b53))
- ts in template string ([0edbbea](https://github.com/module-federation/nextjs-mf/commit/0edbbeaa42503237b88132252e29a34a79bade51))
- ts in template string ([1d56efd](https://github.com/module-federation/nextjs-mf/commit/1d56efdf3d0bc78d19d187fe561fbbf453bada87))
- ts in template string ([113d703](https://github.com/module-federation/nextjs-mf/commit/113d7037de8238ed0bcf9418ac1bf3d082fbea66))
- typescript issues ([0a07481](https://github.com/module-federation/nextjs-mf/commit/0a07481552e1df6b35506165cbc649996004c318))
- use ES5 for renderStartup of entrypoint ([d14324a](https://github.com/module-federation/nextjs-mf/commit/d14324a9af856fca974a8f9945ba7d0d2a96be48))

### Features

- additional plugin exports ([0604461](https://github.com/module-federation/nextjs-mf/commit/0604461ea8806d4e064955f5edef571a9a45d8d0))
- AsyncBoundaryPlugin ([00227ca](https://github.com/module-federation/nextjs-mf/commit/00227cabf3a1e7286148e84d5714e020391771f7))
- checkInvalidContext as tapable hook ([a3eb553](https://github.com/module-federation/nextjs-mf/commit/a3eb5537ff462ead2230615f578569ec46199f50))
- **ContainerEntryModule:** fix TypeScript issue, enhance needBuild method [#398](https://github.com/module-federation/nextjs-mf/issues/398)a60e ([c561e11](https://github.com/module-federation/nextjs-mf/commit/c561e111a54b253fd194c3b75041577dda50ad4b)), closes [#398a60](https://github.com/module-federation/nextjs-mf/issues/398a60)
- **enhanced:** Fork Module Federation ([8682990](https://github.com/module-federation/nextjs-mf/commit/8682990e7fec6309ce20572958916f747737af90))
- **enhanced:** Refactor ContainerEntryDependency and ContainerEntryModule for better code readability and maintainability ([e93e7d2](https://github.com/module-federation/nextjs-mf/commit/e93e7d2fafe2e22f7d2c613095ce1900d7531f29))
- fork module federation ([0ad7430](https://github.com/module-federation/nextjs-mf/commit/0ad7430f6170458a47144be392133b7b2fa1ade0))
- improved async init ([17b1419](https://github.com/module-federation/nextjs-mf/commit/17b1419ef31ec5661fa06b9f0c297e2771e2a86c))
- support lazy compilation ([29c234c](https://github.com/module-federation/nextjs-mf/commit/29c234c14315e000acefc60d635ee486205ca83e))
- Use enhanced Federation Plugin ([e021d66](https://github.com/module-federation/nextjs-mf/commit/e021d6667996962f154137d164bed13f53a6a135))

### Reverts

- Revert "add migration / sync steps" ([5511559](https://github.com/module-federation/nextjs-mf/commit/5511559b86937b2733ac2e8db7e0a4fb33293778))

## 0.0.1-0 (2023-10-03)

### Bug Fixes

- add missing serialize method on RemoteModule ([e7ac801](https://github.com/module-federation/nextjs-mf/commit/e7ac801151b08dbb5ca025bd8ac03683f792f92f))
- add override to remoteModule ([875038a](https://github.com/module-federation/nextjs-mf/commit/875038ad68dfed05822c1bc7c68ae91e57282f4f))
- bad impleentation during federation port ([cc2e53f](https://github.com/module-federation/nextjs-mf/commit/cc2e53f0351fb94c9068223ad6b8d990a913ab53))
- broken versioning issues in consumes ([e7fada2](https://github.com/module-federation/nextjs-mf/commit/e7fada211b1e58dc52eafeff4210a9ce62636f9d))
- change exports for module info runtime ([f40c538](https://github.com/module-federation/nextjs-mf/commit/f40c538221353a61938cadf624c9235ec8eb4cce))
- **enhanced:** module info duplication ([49b4a57](https://github.com/module-federation/nextjs-mf/commit/49b4a5736714c1db4510d10cdd5fe0277123caa8))
- **enhanced:** syntax issue in proxy ([2e5848b](https://github.com/module-federation/nextjs-mf/commit/2e5848b4be3e3bba46508a427c1bc8f2d3043c8d))
- improve backward compat **remote_scope** global ([ac0efa3](https://github.com/module-federation/nextjs-mf/commit/ac0efa37d975a130aa3badc657fa66d723865a5b))
- improve logic in runtime module info proxy ([8eea1a8](https://github.com/module-federation/nextjs-mf/commit/8eea1a84ae6a12f69dbb16d00f52ec902efbdda6))
- legacy scope duplication on recreation ([347e4c9](https://github.com/module-federation/nextjs-mf/commit/347e4c96e87ff4f28dce319fc6b2fe40f1cbabee))
- package data ([992d298](https://github.com/module-federation/nextjs-mf/commit/992d2985c29d0bf86de6739f728fbf64749e7fd0))
- remote global share scope ([e05d32f](https://github.com/module-federation/nextjs-mf/commit/e05d32f489880d6b4e0fc21a3807e619a40bc5b3))
- Ts import error ([6e7974c](https://github.com/module-federation/nextjs-mf/commit/6e7974c22874378122ab31eea27dddd0604505db))
- TS imports to webpack ([d506b49](https://github.com/module-federation/nextjs-mf/commit/d506b492b724ccfb7fdcf6234196ac421564c153))
- TS imports, missing module methods ([8eb422d](https://github.com/module-federation/nextjs-mf/commit/8eb422d30e149cb0d96835f036ec73ce1ccafe53))
- ts in template string ([579b341](https://github.com/module-federation/nextjs-mf/commit/579b341a5eb38ca6396da15f9667729ab84d2ff6))
- ts in template string ([37e790a](https://github.com/module-federation/nextjs-mf/commit/37e790a7b46ff6d8c8fd2c12cfd5629900db1b53))
- ts in template string ([0edbbea](https://github.com/module-federation/nextjs-mf/commit/0edbbeaa42503237b88132252e29a34a79bade51))
- ts in template string ([1d56efd](https://github.com/module-federation/nextjs-mf/commit/1d56efdf3d0bc78d19d187fe561fbbf453bada87))
- ts in template string ([113d703](https://github.com/module-federation/nextjs-mf/commit/113d7037de8238ed0bcf9418ac1bf3d082fbea66))
- typescript issues ([0a07481](https://github.com/module-federation/nextjs-mf/commit/0a07481552e1df6b35506165cbc649996004c318))
- use ES5 for renderStartup of entrypoint ([d14324a](https://github.com/module-federation/nextjs-mf/commit/d14324a9af856fca974a8f9945ba7d0d2a96be48))

### Features

- additional plugin exports ([0604461](https://github.com/module-federation/nextjs-mf/commit/0604461ea8806d4e064955f5edef571a9a45d8d0))
- AsyncBoundaryPlugin ([00227ca](https://github.com/module-federation/nextjs-mf/commit/00227cabf3a1e7286148e84d5714e020391771f7))
- checkInvalidContext as tapable hook ([a3eb553](https://github.com/module-federation/nextjs-mf/commit/a3eb5537ff462ead2230615f578569ec46199f50))
- **ContainerEntryModule:** fix TypeScript issue, enhance needBuild method [#398](https://github.com/module-federation/nextjs-mf/issues/398)a60e ([c561e11](https://github.com/module-federation/nextjs-mf/commit/c561e111a54b253fd194c3b75041577dda50ad4b)), closes [#398a60](https://github.com/module-federation/nextjs-mf/issues/398a60)
- **enhanced:** Fork Module Federation ([8682990](https://github.com/module-federation/nextjs-mf/commit/8682990e7fec6309ce20572958916f747737af90))
- **enhanced:** Refactor ContainerEntryDependency and ContainerEntryModule for better code readability and maintainability ([e93e7d2](https://github.com/module-federation/nextjs-mf/commit/e93e7d2fafe2e22f7d2c613095ce1900d7531f29))
- fork module federation ([0ad7430](https://github.com/module-federation/nextjs-mf/commit/0ad7430f6170458a47144be392133b7b2fa1ade0))
- improved async init ([17b1419](https://github.com/module-federation/nextjs-mf/commit/17b1419ef31ec5661fa06b9f0c297e2771e2a86c))
- support lazy compilation ([29c234c](https://github.com/module-federation/nextjs-mf/commit/29c234c14315e000acefc60d635ee486205ca83e))
- Use enhanced Federation Plugin ([e021d66](https://github.com/module-federation/nextjs-mf/commit/e021d6667996962f154137d164bed13f53a6a135))

### Reverts

- Revert "add migration / sync steps" ([5511559](https://github.com/module-federation/nextjs-mf/commit/5511559b86937b2733ac2e8db7e0a4fb33293778))
