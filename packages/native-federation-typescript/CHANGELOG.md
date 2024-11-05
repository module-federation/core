# @module-federation/native-federation-typescript

## 0.6.0

### Minor Changes

- 8941ef4: feat: support for farm, drop support for node < 16

## 0.5.2

### Patch Changes

- 3082718: ability to use relative paths

## 0.5.1

### Patch Changes

- ea34795: optional vue-tsc

## 0.5.0

### Minor Changes

- 3d61613: perf(native-federation): extract archive only if needed

### Patch Changes

- 677958c: fix: tsup configuration

## 0.4.4

### Patch Changes

- 6f743f0: rollback without piscina

## 0.4.3

### Patch Changes

- 3d4fb69: import path on Windows

## 0.4.2

### Patch Changes

- 671f64b: download retrieves count per file
- bc5c2e0: chore: using piscina, which wraps worker threads, can help us achieving the same result with a more concise code.

## 0.4.1

### Patch Changes

- f926b6c: chore: revert prev implementation

## 0.4.0

### Minor Changes

- b152df2: feat: rolldown support

## 0.3.1

### Patch Changes

- bc053b8: fix: behaviour during vite dev mode

## 0.3.0

### Minor Changes

- bb0302b: feat: configurable maxRetries package unzip

### Bug Fixes

- **deps:** update dependency antd to v4.24.14 ([#1309](https://github.com/module-federation/core/issues/1309)) ([d0a2314](https://github.com/module-federation/core/commit/d0a231470e37dbad85a11df1f12695657ba3b984))
- **deps:** update dependency axios to v1.5.0 ([#1275](https://github.com/module-federation/core/issues/1275)) ([f163df1](https://github.com/module-federation/core/commit/f163df1073740bf4218bb35ba57cea5dc409fe43))
- **deps:** update dependency axios to v1.5.1 ([ae9a06a](https://github.com/module-federation/core/commit/ae9a06a0cc35fad27a0b493a25370b92617c39fb))
- **deps:** update dependency core-js to v3.32.2 ([18d2746](https://github.com/module-federation/core/commit/18d2746763f38fe295a14df3f1bcd4218fade5b8))
- **deps:** update dependency core-js to v3.33.0 ([30894ca](https://github.com/module-federation/core/commit/30894cafbe5dea4350dc7c633548038d7ec5f8a8))
- **deps:** update dependency fast-glob to v3.3.1 ([#1197](https://github.com/module-federation/core/issues/1197)) ([5743543](https://github.com/module-federation/core/commit/57435430bd0912e3bf370ce08b46f610b12d00e3))
- **deps:** update dependency react-router-dom to v6.15.0 ([#1276](https://github.com/module-federation/core/issues/1276)) ([850e2fa](https://github.com/module-federation/core/commit/850e2fac60f49b456aef3b5df9827fc3ac5a6006))
- **deps:** update dependency react-router-dom to v6.16.0 ([0618339](https://github.com/module-federation/core/commit/061833912f7e5748011cd60ed679a68c1b659f77))
- **deps:** update dependency typedoc to ^0.25.0 ([#1277](https://github.com/module-federation/core/issues/1277)) ([8d6a72e](https://github.com/module-federation/core/commit/8d6a72e18a57b69b2f63802621e8b4b479554fed))
- **deps:** update dependency typedoc to v0.25.1 ([#1304](https://github.com/module-federation/core/issues/1304)) ([abf84fe](https://github.com/module-federation/core/commit/abf84fefd5c20b5de7c9a74d1c49235f44d36dc6))
- **deps:** update dependency typedoc to v0.25.2 ([46c6524](https://github.com/module-federation/core/commit/46c65247e187cee9e15625402c1570ac351bb1fe))
- **deps:** update dependency undici to v5.24.0 ([573e644](https://github.com/module-federation/core/commit/573e644333da6d24cb4286ce08221a1aa82415e4))
- **deps:** update dependency undici to v5.25.2 ([da3e539](https://github.com/module-federation/core/commit/da3e539a41ed23ccb5086b1dd428fbee0f8d652c))
- **deps:** update dependency undici to v5.25.4 ([1d4f91e](https://github.com/module-federation/core/commit/1d4f91ec93da4326c8a42eef28f150d5d09738bb))
- **deps:** update dependency undici to v5.26.2 [security] ([410a8b8](https://github.com/module-federation/core/commit/410a8b8bd1558dfb5119ae10941d2b3816a0d0e0))
- **deps:** update dependency unplugin to v1.5.0 ([936b3f8](https://github.com/module-federation/core/commit/936b3f8d8061fd9d481d1788fb35b88588928d14))
- Fix call undefined delegate ([#1149](https://github.com/module-federation/core/issues/1149)) ([87a5896](https://github.com/module-federation/core/commit/87a5896221a726578c3433071755fba3465824f4)), closes [#1151](https://github.com/module-federation/core/issues/1151)
- override semantic-release-plugin-decorators ([18675de](https://github.com/module-federation/core/commit/18675defef65570d2b3bb6a9caa3fd039badee29))
- switch to @goestav/nx-semantic-release ([63a3350](https://github.com/module-federation/core/commit/63a3350a6a1a12235e3c9f1e7c724d54f0476356))

### Features

- core package for module federation ([#1093](https://github.com/module-federation/core/issues/1093)) ([d460400](https://github.com/module-federation/core/commit/d46040053e9b627321b5fe8e05556c5bb727c238)), closes [#851](https://github.com/module-federation/core/issues/851) [#864](https://github.com/module-federation/core/issues/864) [#835](https://github.com/module-federation/core/issues/835) [#851](https://github.com/module-federation/core/issues/851) [#864](https://github.com/module-federation/core/issues/864) [#871](https://github.com/module-federation/core/issues/871) [#851](https://github.com/module-federation/core/issues/851) [#864](https://github.com/module-federation/core/issues/864) [#872](https://github.com/module-federation/core/issues/872) [#875](https://github.com/module-federation/core/issues/875) [#884](https://github.com/module-federation/core/issues/884) [#887](https://github.com/module-federation/core/issues/887) [#893](https://github.com/module-federation/core/issues/893) [#885](https://github.com/module-federation/core/issues/885) [#899](https://github.com/module-federation/core/issues/899) [#904](https://github.com/module-federation/core/issues/904) [#932](https://github.com/module-federation/core/issues/932) [#936](https://github.com/module-federation/core/issues/936) [#959](https://github.com/module-federation/core/issues/959) [#960](https://github.com/module-federation/core/issues/960) [#969](https://github.com/module-federation/core/issues/969) [#971](https://github.com/module-federation/core/issues/971) [#1234](https://github.com/module-federation/core/issues/1234) [#1235](https://github.com/module-federation/core/issues/1235)
- Dynamic Filesystem ([#1274](https://github.com/module-federation/core/issues/1274)) ([2bec98a](https://github.com/module-federation/core/commit/2bec98a2472b44898a7f14ec6868a2368cfb6d82))
- fork module federation ([0ad7430](https://github.com/module-federation/core/commit/0ad7430f6170458a47144be392133b7b2fa1ade0))
- improved async init ([ae3a450](https://github.com/module-federation/core/commit/ae3a4503ff9de86492b13029d6334b281ddd9493))
- native self forming node federation ([#1291](https://github.com/module-federation/core/issues/1291)) ([1dd5ed1](https://github.com/module-federation/core/commit/1dd5ed17c981e036336925e807203e94b58c36d6))
- new actions, remove gpt integration ([370229e](https://github.com/module-federation/core/commit/370229e02cc352fcfaeaa0f3cf1f9f2d4966d1bb))
- **node:** node federation demo/testing apps added ([27d545d](https://github.com/module-federation/core/commit/27d545d99095da7134c392dbcd9fb135a170f6ef))
- **typedoc-parsetr:** merged main ([cf6e65a](https://github.com/module-federation/core/commit/cf6e65a4aa895d7c2dba8fdbd8ec22ec7bd8f514))
- **typedoc-parsetr:** merged main ([2ff0d5a](https://github.com/module-federation/core/commit/2ff0d5a075df3f241742cc7e516cd0378e8e1b3e))
- **typedoc-parsetr:** python script implementation ([0a533cb](https://github.com/module-federation/core/commit/0a533cb60e0c3ca269ab45df740c1367be175e80))

### BREAKING CHANGES

- automaticAsyncBoundary option has been removed

- fix: exclude specific pages from page map automatically

- refactor: conslidate codebase

- fix: improve hot reload share recovery

- refactor: remove server jsonp template

- chore: remove dead code from runtime modules

- fix: clean up jsonp getCustomJsonpCode

getting chunk loading global from compiler output options

- feat: adding cleanInitArrays runtime helper

- chore: remove share scope hoist and module hoisting system

- chore: cleanup code

- chore: remove dead code from add module runtime plugin

likely can remove whole plugin in future

- chore: remove logs from delegate modules

- chore: remove old utils

- fix: add warning on auto page stitch

- fix: remove commented out code from InvertedContainerPlugin.ts

- chore: improve logging to see if its local load or remote load

- chore: clean up old custom promises factories

- fix: remove container proxy code

- fix: remove container proxy code
- automaticAsyncBoundary option has been removed

- fix: exclude specific pages from page map automatically

- refactor: conslidate codebase

- fix: improve hot reload share recovery

- refactor: remove server jsonp template

- chore: remove dead code from runtime modules

- fix: clean up jsonp getCustomJsonpCode

getting chunk loading global from compiler output options

- feat: adding cleanInitArrays runtime helper

- chore: remove share scope hoist and module hoisting system

- chore: cleanup code

- chore: remove dead code from add module runtime plugin

likely can remove whole plugin in future

- chore: remove logs from delegate modules

- chore: remove old utils

- fix: add warning on auto page stitch

- fix: remove commented out code from InvertedContainerPlugin.ts

- chore: improve logging to see if its local load or remote load

- chore: clean up old custom promises factories

- fix: remove container proxy code

- fix: remove container proxy code

- chore: fix project.json

- debugging

- fix: resolve backmerge issues with build

- Merge branch 'kill_child_compilers' into fix_backmerge_issues

# Conflicts:

# package-lock.json

# package.json

# packages/nextjs-mf/src/plugins/NextFederationPlugin/index.ts

# packages/nextjs-mf/src/plugins/container/InvertedContainerPlugin.ts

# packages/nextjs-mf/src/plugins/container/InvertedContainerRuntimeModule.ts

- feat: enable eager sharing

- refactor: improve module hooks for eager loading and search

- refactor: cleanup custom jsonp and make es5

- refactor: cleanup inverted container code

- refactor: cleanup inverted container code
- automaticAsyncBoundary option has been removed

- fix: exclude specific pages from page map automatically

- refactor: conslidate codebase

- fix: improve hot reload share recovery

- refactor: remove server jsonp template

- chore: remove dead code from runtime modules

- fix: clean up jsonp getCustomJsonpCode

getting chunk loading global from compiler output options

- feat: adding cleanInitArrays runtime helper

- chore: remove share scope hoist and module hoisting system

- chore: cleanup code

- chore: remove dead code from add module runtime plugin

likely can remove whole plugin in future

- chore: remove logs from delegate modules

- chore: remove old utils

- fix: add warning on auto page stitch

- fix: remove commented out code from InvertedContainerPlugin.ts

- chore: improve logging to see if its local load or remote load

- chore: clean up old custom promises factories

- fix: remove container proxy code

- fix: remove container proxy code

- fix: resolve backmerge issues with build

- Merge branch 'kill_child_compilers' into fix_backmerge_issues

# Conflicts:

# package-lock.json

# package.json

# packages/nextjs-mf/src/plugins/NextFederationPlugin/index.ts

# packages/nextjs-mf/src/plugins/container/InvertedContainerPlugin.ts

# packages/nextjs-mf/src/plugins/container/InvertedContainerRuntimeModule.ts

- feat: enable eager sharing

- refactor: improve module hooks for eager loading and search

- refactor: cleanup custom jsonp and make es5

- refactor: cleanup inverted container code

- refactor: cleanup inverted container code

- ci: fix install step with npm and NX

- test: remove tests for now

- chore(utils): release version 1.7.3-beta.0

- chore(utils): release version 1.7.3

- chore(node): release version 0.14.4-beta.0

- chore(node): release version 0.14.4

- chore(nextjs-mf): release version 6.4.1-beta.4

- fix: remove debugging runtime variable

- chore(nextjs-mf): release version 6.4.1-beta.5

# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [0.2.6](https://github.com/module-federation/nextjs-mf/compare/native-federation-typescript-0.2.5...native-federation-typescript-0.2.6) (2023-07-01)

## [0.2.5](https://github.com/module-federation/nextjs-mf/compare/native-federation-typescript-0.2.4...native-federation-typescript-0.2.5) (2023-07-01)

## [0.2.4](https://github.com/module-federation/nextjs-mf/compare/native-federation-typescript-0.2.3...native-federation-typescript-0.2.4) (2023-07-01)

## [0.2.3](https://github.com/module-federation/nextjs-mf/compare/native-federation-typescript-0.2.2...native-federation-typescript-0.2.3) (2023-07-01)

## [0.2.2](https://github.com/module-federation/nextjs-mf/compare/native-federation-typescript-0.2.1...native-federation-typescript-0.2.2) (2023-06-28)

### Bug Fixes

- .at(-1) ([8dd0520](https://github.com/module-federation/nextjs-mf/commit/8dd0520b5464c49e89c63307c5388450e4bebbf8))

## [0.2.1](https://github.com/module-federation/nextjs-mf/compare/native-federation-typescript-0.2.0...native-federation-typescript-0.2.1) (2023-05-13)

### Bug Fixes

- [#857](https://github.com/module-federation/nextjs-mf/issues/857) ([#859](https://github.com/module-federation/nextjs-mf/issues/859)) ([2fb609e](https://github.com/module-federation/nextjs-mf/commit/2fb609efb9a3c8f3e6740e0159510d649c1d229d))
- downgrade next to v13.3.1 ([0032452](https://github.com/module-federation/nextjs-mf/commit/0032452980c70b211b6c04332326b7973f7c8446))
- removed lock ([82f578e](https://github.com/module-federation/nextjs-mf/commit/82f578e713734f7f6b06e09b794fab4f66af248a))

# [0.2.0](https://github.com/module-federation/nextjs-mf/compare/native-federation-typescript-0.1.1...native-federation-typescript-0.2.0) (2023-04-29)

### Bug Fixes

- removed any from error logger type ([fb9fcc3](https://github.com/module-federation/nextjs-mf/commit/fb9fcc3a54a13be36335830f076a86557b75bb4a))
- subpath ([1548501](https://github.com/module-federation/nextjs-mf/commit/1548501bb4679c0c534c02609cb6bc5459f224a4))
- subpath ([aaad665](https://github.com/module-federation/nextjs-mf/commit/aaad665307d80b49ee19496a5b8b400df243558e))

### Features

- release to npm with next tag to not ruine latest one ([#763](https://github.com/module-federation/nextjs-mf/issues/763)) ([f2d199b](https://github.com/module-federation/nextjs-mf/commit/f2d199b3b3fbbd428514b1ce1f139efc82f7fff0))

## [0.1.1](https://github.com/module-federation/nextjs-mf/compare/native-federation-typescript-0.1.0...native-federation-typescript-0.1.1) (2023-04-12)

### Bug Fixes

- native build chunks ([d6c9f8a](https://github.com/module-federation/nextjs-mf/commit/d6c9f8a957ed00a8d92332ccc38ed9780f01d54e))

### Reverts

- Revert "chore(native-federation-typescript): release version 0.1.1" ([91786df](https://github.com/module-federation/nextjs-mf/commit/91786df726e5c078ed78e745b6b105e11bd2e39b))
- Revert "chore(native-federation-typescript): release version 0.1.1" ([097f188](https://github.com/module-federation/nextjs-mf/commit/097f188458835457a2713d98bf3eaf291d5ad102))

# 0.1.0 (2023-04-05)

### Bug Fixes

- build ([d0b2f72](https://github.com/module-federation/nextjs-mf/commit/d0b2f72f4fc3647825412be1574311c3152cf167))
- build step ([a217170](https://github.com/module-federation/nextjs-mf/commit/a21717096cbc09bff20d3aeebfea2f3533afb0d7))
- compiler instance ([e5c249d](https://github.com/module-federation/nextjs-mf/commit/e5c249d41d68339886268337654ff47b31b06a3a))
- deps ([a378441](https://github.com/module-federation/nextjs-mf/commit/a37844194a3f189cc5863bbdd4776259bce69fa4))
- dirtree tests ([5cb49fd](https://github.com/module-federation/nextjs-mf/commit/5cb49fd1c6520311a7d2e7d2b37a93389a500715))
- eslintrc ([0f69dee](https://github.com/module-federation/nextjs-mf/commit/0f69dee253c2c608b2367d545c7d4a57ad0c2ca5))
- format ([25fb765](https://github.com/module-federation/nextjs-mf/commit/25fb7659481287a791e9de4fe839e980dbf06968))
- readme ([eaca0b3](https://github.com/module-federation/nextjs-mf/commit/eaca0b311d3b8d9e73309cb92d9a9488f9fc23c0))
- readme ([fc0e5dc](https://github.com/module-federation/nextjs-mf/commit/fc0e5dc26e617664224e1c10548b151a44f8dff9))
- README.md ([9159171](https://github.com/module-federation/nextjs-mf/commit/91591712e9a103fff351f0a168c149470c0d69ad))
- remove changelog ([724918e](https://github.com/module-federation/nextjs-mf/commit/724918ebf888297689b6ed700bd14ec01fd1ef35))
- ts build ([9ed3a52](https://github.com/module-federation/nextjs-mf/commit/9ed3a527d0ba903b6cfa6023a7ad5da63781970c))

### Features

- federated tests plugin ([063ab33](https://github.com/module-federation/nextjs-mf/commit/063ab336c4830aff4f5bd3b9894df60b4651a9be))
- native-federation-typescript plugin ([#692](https://github.com/module-federation/nextjs-mf/issues/692)) ([b41c5aa](https://github.com/module-federation/nextjs-mf/commit/b41c5aacfeda0fada5b426086658235edfd86cdd))
- test command ([3ade629](https://github.com/module-federation/nextjs-mf/commit/3ade629488f4ea1549314b82b41caef9a046da9f))
