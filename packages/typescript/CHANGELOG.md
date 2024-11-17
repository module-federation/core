# @module-federation/typescript

## 3.1.4

### Patch Changes

- b1a73a2: Add missing axios dependency

## 3.1.3

### Patch Changes

- 16eaf3f: add missing lodash.get dep

## 3.1.2

### Patch Changes

- 3d4fb69: import path on Windows

### Bug Fixes

- **deps:** update dependency antd to v4.24.15 ([de857c4](https://github.com/module-federation/core/commit/de857c45af92b3a2584cd3319263417a36f9977a))
- **deps:** update dependency axios to v1.6.0 [security] ([71bd7be](https://github.com/module-federation/core/commit/71bd7becbc201d69b11f0975d5a56548facb3242))
- **deps:** update dependency core-js to v3.33.3 ([6100431](https://github.com/module-federation/core/commit/6100431155a53c6e34092baf6c0e4d5dd578a53d))
- **deps:** update dependency typedoc to v0.25.3 ([10477bf](https://github.com/module-federation/core/commit/10477bf1f16d695b792d97919e83a8920ee15c01))
- **deps:** update dependency unplugin to v1.5.1 ([e2ea98b](https://github.com/module-federation/core/commit/e2ea98b1a8e67c53c79e41dab0398e8a75434362))

# [3.1.0](https://github.com/module-federation/core/compare/typescript-3.0.1...typescript-3.1.0) (2023-11-13)

### Bug Fixes

- add missing comma ([541dd28](https://github.com/module-federation/core/commit/541dd28959dae614e8dc2717eafe2c567cdda1f6))
- **deps:** update dependency typedoc to v0.25.2 ([46c6524](https://github.com/module-federation/core/commit/46c65247e187cee9e15625402c1570ac351bb1fe))
- **deps:** update dependency undici to v5.26.2 [security] ([410a8b8](https://github.com/module-federation/core/commit/410a8b8bd1558dfb5119ae10941d2b3816a0d0e0))
- override semantic-release-plugin-decorators ([18675de](https://github.com/module-federation/core/commit/18675defef65570d2b3bb6a9caa3fd039badee29))
- switch to @goestav/nx-semantic-release ([63a3350](https://github.com/module-federation/core/commit/63a3350a6a1a12235e3c9f1e7c724d54f0476356))

### Features

- add test setup to typescript package ([bccb789](https://github.com/module-federation/core/commit/bccb7893d321357e5de54752d30e9b18ba6e5f0d))
- new actions, remove gpt integration ([370229e](https://github.com/module-federation/core/commit/370229e02cc352fcfaeaa0f3cf1f9f2d4966d1bb))

# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [3.0.1](https://github.com/module-federation/nextjs-mf/compare/typescript-3.0.0...typescript-3.0.1) (2023-10-05)

# [3.0.0](https://github.com/module-federation/nextjs-mf/compare/typescript-2.4.2...typescript-3.0.0) (2023-09-13)

### Dependency Updates

- `utils` updated to version `3.0.0`

### Features

- core package for module federation ([#1093](https://github.com/module-federation/nextjs-mf/issues/1093)) ([d460400](https://github.com/module-federation/nextjs-mf/commit/d46040053e9b627321b5fe8e05556c5bb727c238)), closes [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#835](https://github.com/module-federation/nextjs-mf/issues/835) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#871](https://github.com/module-federation/nextjs-mf/issues/871) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#872](https://github.com/module-federation/nextjs-mf/issues/872) [#875](https://github.com/module-federation/nextjs-mf/issues/875) [#884](https://github.com/module-federation/nextjs-mf/issues/884) [#887](https://github.com/module-federation/nextjs-mf/issues/887) [#893](https://github.com/module-federation/nextjs-mf/issues/893) [#885](https://github.com/module-federation/nextjs-mf/issues/885) [#899](https://github.com/module-federation/nextjs-mf/issues/899) [#904](https://github.com/module-federation/nextjs-mf/issues/904) [#932](https://github.com/module-federation/nextjs-mf/issues/932) [#936](https://github.com/module-federation/nextjs-mf/issues/936) [#959](https://github.com/module-federation/nextjs-mf/issues/959) [#960](https://github.com/module-federation/nextjs-mf/issues/960) [#969](https://github.com/module-federation/nextjs-mf/issues/969) [#971](https://github.com/module-federation/nextjs-mf/issues/971) [#1234](https://github.com/module-federation/nextjs-mf/issues/1234) [#1235](https://github.com/module-federation/nextjs-mf/issues/1235)
- **typedoc-parsetr:** merged main ([2ff0d5a](https://github.com/module-federation/nextjs-mf/commit/2ff0d5a075df3f241742cc7e516cd0378e8e1b3e))
- **typedoc-parsetr:** python script implementation ([0a533cb](https://github.com/module-federation/nextjs-mf/commit/0a533cb60e0c3ca269ab45df740c1367be175e80))

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

## [2.4.2](https://github.com/module-federation/nextjs-mf/compare/typescript-2.4.1...typescript-2.4.2) (2023-08-09)

## [2.4.1](https://github.com/module-federation/nextjs-mf/compare/typescript-2.4.0...typescript-2.4.1) (2023-07-23)

### Dependency Updates

- `utils` updated to version `2.0.4`

### Bug Fixes

- **typescript:** add types field to package.json exports ([#1154](https://github.com/module-federation/nextjs-mf/issues/1154)) ([ec37484](https://github.com/module-federation/nextjs-mf/commit/ec374846567e4941ab42d18623642f90b3d70591))

# [2.4.0](https://github.com/module-federation/nextjs-mf/compare/typescript-2.2.3...typescript-2.4.0) (2023-07-19)

### Dependency Updates

- `utils` updated to version `2.0.3`
- `utils` updated to version `2.0.3`

### Bug Fixes

- Add an error message when no MFP is present during build ([#1150](https://github.com/module-federation/nextjs-mf/issues/1150)) ([dff5153](https://github.com/module-federation/nextjs-mf/commit/dff5153f1fc0ad0499c360eeafd612dec564767b))

### Features

- Allow Container Utils to work Server Side ([#723](https://github.com/module-federation/nextjs-mf/issues/723)) ([232ba24](https://github.com/module-federation/nextjs-mf/commit/232ba24072f19bd32d1f745d4edf1518e548df50))
- release to npm with next tag to not ruine latest one ([#763](https://github.com/module-federation/nextjs-mf/issues/763)) ([f2d199b](https://github.com/module-federation/nextjs-mf/commit/f2d199b3b3fbbd428514b1ce1f139efc82f7fff0))

## [2.3.0](https://github.com/module-federation/nextjs-mf/compare/typescript-2.2.1...typescript-2.2.2) (2023-04-05)

### Bug Fixes

- Add timeout to `importRemoteTypes`, reduce error log ([#695](https://github.com/module-federation/nextjs-mf/issues/695)) ([85563ef](https://github.com/module-federation/nextjs-mf/commit/85563efaffb041abe02bf6704ec7ac254634f9d0))
- release typescript ([946c052](https://github.com/module-federation/nextjs-mf/commit/946c052d1b3268e27a221ce49453e94aa0e98fbd))
- remove unused dependencies nx added to typescript package ([#690](https://github.com/module-federation/nextjs-mf/issues/690)) ([c87e7d7](https://github.com/module-federation/nextjs-mf/commit/c87e7d74226f060bbd2aff7e65df691e69f6f82a))
- safely build url to download type files ([#694](https://github.com/module-federation/nextjs-mf/issues/694)) ([ee5429d](https://github.com/module-federation/nextjs-mf/commit/ee5429dea3469ff1bf020f84d88e96caf1075d07))

### Features

- Remove MF plugin from Typescript plugin ([#607](https://github.com/module-federation/nextjs-mf/issues/607)) ([94e9149](https://github.com/module-federation/nextjs-mf/commit/94e9149c4be12cc3e2627da7d7a9e11289cab894)), closes [#608](https://github.com/module-federation/nextjs-mf/issues/608) [#608](https://github.com/module-federation/nextjs-mf/issues/608)

# [2.3.0](https://github.com/module-federation/nextjs-mf/compare/typescript-2.2.1...typescript-2.3.0) (2023-04-05)

### Bug Fixes

- Add timeout to `importRemoteTypes`, reduce error log ([#695](https://github.com/module-federation/nextjs-mf/issues/695)) ([85563ef](https://github.com/module-federation/nextjs-mf/commit/85563efaffb041abe02bf6704ec7ac254634f9d0))
- release typescript ([946c052](https://github.com/module-federation/nextjs-mf/commit/946c052d1b3268e27a221ce49453e94aa0e98fbd))
- remove unused dependencies nx added to typescript package ([#690](https://github.com/module-federation/nextjs-mf/issues/690)) ([c87e7d7](https://github.com/module-federation/nextjs-mf/commit/c87e7d74226f060bbd2aff7e65df691e69f6f82a))
- safely build url to download type files ([#694](https://github.com/module-federation/nextjs-mf/issues/694)) ([ee5429d](https://github.com/module-federation/nextjs-mf/commit/ee5429dea3469ff1bf020f84d88e96caf1075d07))

### Features

- Remove MF plugin from Typescript plugin ([#607](https://github.com/module-federation/nextjs-mf/issues/607)) ([94e9149](https://github.com/module-federation/nextjs-mf/commit/94e9149c4be12cc3e2627da7d7a9e11289cab894)), closes [#608](https://github.com/module-federation/nextjs-mf/issues/608) [#608](https://github.com/module-federation/nextjs-mf/issues/608)

# [2.3.0](https://github.com/module-federation/nextjs-mf/compare/typescript-2.2.1...typescript-2.3.0) (2023-04-05)

### Dependency Updates

- `utils` updated to version `1.4.1`
- `utils` updated to version `1.4.1`

### Bug Fixes

- Add timeout to `importRemoteTypes`, reduce error log ([#695](https://github.com/module-federation/nextjs-mf/issues/695)) ([85563ef](https://github.com/module-federation/nextjs-mf/commit/85563efaffb041abe02bf6704ec7ac254634f9d0))
- release typescript ([946c052](https://github.com/module-federation/nextjs-mf/commit/946c052d1b3268e27a221ce49453e94aa0e98fbd))
- remove unused dependencies nx added to typescript package ([#690](https://github.com/module-federation/nextjs-mf/issues/690)) ([c87e7d7](https://github.com/module-federation/nextjs-mf/commit/c87e7d74226f060bbd2aff7e65df691e69f6f82a))
- safely build url to download type files ([#694](https://github.com/module-federation/nextjs-mf/issues/694)) ([ee5429d](https://github.com/module-federation/nextjs-mf/commit/ee5429dea3469ff1bf020f84d88e96caf1075d07))

### Features

- Remove MF plugin from Typescript plugin ([#607](https://github.com/module-federation/nextjs-mf/issues/607)) ([94e9149](https://github.com/module-federation/nextjs-mf/commit/94e9149c4be12cc3e2627da7d7a9e11289cab894)), closes [#608](https://github.com/module-federation/nextjs-mf/issues/608) [#608](https://github.com/module-federation/nextjs-mf/issues/608)

# [2.3.0](https://github.com/module-federation/nextjs-mf/compare/typescript-2.2.1...typescript-2.3.0) (2023-04-05)

### Dependency Updates

- `utils` updated to version `1.4.1`
- `utils` updated to version `1.4.1`

### Bug Fixes

- Add timeout to `importRemoteTypes`, reduce error log ([#695](https://github.com/module-federation/nextjs-mf/issues/695)) ([85563ef](https://github.com/module-federation/nextjs-mf/commit/85563efaffb041abe02bf6704ec7ac254634f9d0))
- release typescript ([946c052](https://github.com/module-federation/nextjs-mf/commit/946c052d1b3268e27a221ce49453e94aa0e98fbd))
- remove unused dependencies nx added to typescript package ([#690](https://github.com/module-federation/nextjs-mf/issues/690)) ([c87e7d7](https://github.com/module-federation/nextjs-mf/commit/c87e7d74226f060bbd2aff7e65df691e69f6f82a))
- safely build url to download type files ([#694](https://github.com/module-federation/nextjs-mf/issues/694)) ([ee5429d](https://github.com/module-federation/nextjs-mf/commit/ee5429dea3469ff1bf020f84d88e96caf1075d07))

### Features

- Remove MF plugin from Typescript plugin ([#607](https://github.com/module-federation/nextjs-mf/issues/607)) ([94e9149](https://github.com/module-federation/nextjs-mf/commit/94e9149c4be12cc3e2627da7d7a9e11289cab894)), closes [#608](https://github.com/module-federation/nextjs-mf/issues/608) [#608](https://github.com/module-federation/nextjs-mf/issues/608)

# [2.3.0](https://github.com/module-federation/nextjs-mf/compare/typescript-2.2.1...typescript-2.3.0) (2023-03-07)

### Dependency Updates

- `utils` updated to version `1.3.0`

### Features

- Remove MF plugin from Typescript plugin ([#607](https://github.com/module-federation/nextjs-mf/issues/607)) ([94e9149](https://github.com/module-federation/nextjs-mf/commit/94e9149c4be12cc3e2627da7d7a9e11289cab894)), closes [#608](https://github.com/module-federation/nextjs-mf/issues/608) [#608](https://github.com/module-federation/nextjs-mf/issues/608)

## [2.2.1](https://github.com/module-federation/nextjs-mf/compare/typescript-2.2.0...typescript-2.2.1) (2023-02-09)

### Dependency Updates

- `utils` updated to version `1.2.1`

### Bug Fixes

- **typescript:** fix import path for generated dts in Windows ([#566](https://github.com/module-federation/nextjs-mf/issues/566)) ([80d09c4](https://github.com/module-federation/nextjs-mf/commit/80d09c40a4ca8f72a4dd0077936959c9f9bdddd2))
- **typescript:** use node-fetch to download TS types ([#565](https://github.com/module-federation/nextjs-mf/issues/565)) ([f668b1f](https://github.com/module-federation/nextjs-mf/commit/f668b1fa11f05ff5d15e6581c27b5da9ad454ed2))

# [2.2.0](https://github.com/module-federation/nextjs-mf/compare/typescript-2.1.6...typescript-2.2.0) (2023-01-31)

### Dependency Updates

- `utils` updated to version `1.2.0`

### Bug Fixes

- **typescript:** ensure consistent file paths ([#528](https://github.com/module-federation/nextjs-mf/issues/528)) ([209d346](https://github.com/module-federation/nextjs-mf/commit/209d346035d91c39bc00be0fb21fea521d221665))
- **typescript:** set vue-tsc as optional peer dep ([#546](https://github.com/module-federation/nextjs-mf/issues/546)) ([5b34bfa](https://github.com/module-federation/nextjs-mf/commit/5b34bfab879ba7d97c4fc5081eb4906b3c607597))
- **typescript:** throw error when `vue-tsc` is requested and is not available ([#547](https://github.com/module-federation/nextjs-mf/issues/547)) ([c6f7998](https://github.com/module-federation/nextjs-mf/commit/c6f79981f84fd0042447037c1323fa750566ac0d))
- **typescript:** webpack bails when remote is unavailable ([#544](https://github.com/module-federation/nextjs-mf/issues/544)) ([61539c3](https://github.com/module-federation/nextjs-mf/commit/61539c3af14a9ecd34b485a73f0ba3a6f3718df2)), closes [#516](https://github.com/module-federation/nextjs-mf/issues/516)

### Features

- **typescript:** support vue typescript compiler ([#542](https://github.com/module-federation/nextjs-mf/issues/542)) ([cde5952](https://github.com/module-federation/nextjs-mf/commit/cde5952c42ec19f87c5bc4dddb8d8be6f97c1c55)), closes [#502](https://github.com/module-federation/nextjs-mf/issues/502)

## [2.1.6](https://github.com/module-federation/nextjs-mf/compare/typescript-2.1.5...typescript-2.1.6) (2023-01-26)

### Bug Fixes

- **typescript:** wildcards from regex watch options ([#521](https://github.com/module-federation/nextjs-mf/issues/521)) ([c8d75c8](https://github.com/module-federation/nextjs-mf/commit/c8d75c8f66950a7d42f7d8679038a521670b322a))

## [2.1.5](https://github.com/module-federation/nextjs-mf/compare/typescript-2.1.4...typescript-2.1.5) (2023-01-21)

### Dependency Updates

- `utils` updated to version `1.1.2`

### Bug Fixes

- **typescript:** webpack bails out when `statsJson` isn't found ([#507](https://github.com/module-federation/nextjs-mf/issues/507)) ([eb5e002](https://github.com/module-federation/nextjs-mf/commit/eb5e0022381b525e8bcc6dbfa95d23ef9a414cfb)), closes [#498](https://github.com/module-federation/nextjs-mf/issues/498)

## [2.1.4](https://github.com/module-federation/nextjs-mf/compare/typescript-2.1.3...typescript-2.1.4) (2023-01-11)

### Dependency Updates

- `utils` updated to version `1.1.1`

### Bug Fixes

- **federatedtypesplugin:** modify remote url used to import remote types ([#496](https://github.com/module-federation/nextjs-mf/issues/496)) ([e91a68a](https://github.com/module-federation/nextjs-mf/commit/e91a68a96bb2c374f3a0e84eba73baeeb2913698)), closes [#495](https://github.com/module-federation/nextjs-mf/issues/495)
- **typescript:** generated types doesn't get included in types index ([#487](https://github.com/module-federation/nextjs-mf/issues/487)) ([e79eb88](https://github.com/module-federation/nextjs-mf/commit/e79eb884c1898b64254c2907c459499dd2f6ea58))
- **typescript:** unable to download types from multiple remotes ([#492](https://github.com/module-federation/nextjs-mf/issues/492)) ([c598b41](https://github.com/module-federation/nextjs-mf/commit/c598b4197fb4fcf1a7f8baff19051c39f03a9aa0)), closes [#455](https://github.com/module-federation/nextjs-mf/issues/455)

## [2.1.3](https://github.com/module-federation/nextjs-mf/compare/typescript-2.1.2...typescript-2.1.3) (2022-12-30)

### Dependency Updates

- `utils` updated to version `1.1.0`

## [2.1.2](https://github.com/module-federation/nextjs-mf/compare/typescript-2.1.1...typescript-2.1.2) (2022-12-29)

### Dependency Updates

- `utils` updated to version `1.0.4`

### Bug Fixes

- **typescript:** compiler host re-writes compiled files in case-insensitive file systems ([#451](https://github.com/module-federation/nextjs-mf/issues/451)) ([448bab5](https://github.com/module-federation/nextjs-mf/commit/448bab571779a193ee7d333a0c2619008f999831))

## [2.1.1](https://github.com/module-federation/nextjs-mf/compare/typescript-2.1.0...typescript-2.1.1) (2022-12-27)

### Dependency Updates

- `utils` updated to version `1.0.3`

# [2.1.0](https://github.com/module-federation/nextjs-mf/compare/typescript-2.0.3...typescript-2.1.0) (2022-12-27)

### Dependency Updates

- `utils` updated to version `1.0.2`

### Bug Fixes

- **typescript:** nextJs host can't resolve Types index file ([#449](https://github.com/module-federation/nextjs-mf/issues/449)) ([116690e](https://github.com/module-federation/nextjs-mf/commit/116690eafeadbdd3ca8ebeb46288cd3d964a0362)), closes [#435](https://github.com/module-federation/nextjs-mf/issues/435)
- **typescript:** typescript compiler is losing `this` reference ([#452](https://github.com/module-federation/nextjs-mf/issues/452)) ([a4b437a](https://github.com/module-federation/nextjs-mf/commit/a4b437a4402db95f9da5871e53e9cd3b686761d8)), closes [#432](https://github.com/module-federation/nextjs-mf/issues/432)

### Features

- normalize paths for watch options ([#441](https://github.com/module-federation/nextjs-mf/issues/441)) ([be191e1](https://github.com/module-federation/nextjs-mf/commit/be191e160c370d282a72b81343340f7df59b0a4c)), closes [#394](https://github.com/module-federation/nextjs-mf/issues/394)

## [2.0.3](https://github.com/module-federation/nextjs-mf/compare/typescript-2.0.2...typescript-2.0.3) (2022-12-20)

### Bug Fixes

- Typescript - Allow custom remote filename ([#413](https://github.com/module-federation/nextjs-mf/issues/413)) ([7eda5d8](https://github.com/module-federation/nextjs-mf/commit/7eda5d8172a6e77ff4a8db13b6ec4d7c88003840))
- **typescript:** set noEmit: false when compiling types ([#416](https://github.com/module-federation/nextjs-mf/issues/416)) ([ec420d8](https://github.com/module-federation/nextjs-mf/commit/ec420d83b5ce5bc62b4245310510a6024cf718e9))

## [2.0.2](https://github.com/module-federation/nextjs-mf/compare/typescript-2.0.1...typescript-2.0.2) (2022-12-18)

### Bug Fixes

- **typescript:** fix parsing of tsconfig options for compiler ([#414](https://github.com/module-federation/nextjs-mf/issues/414)) ([5673452](https://github.com/module-federation/nextjs-mf/commit/56734522df3f1b568f8a6e7e661efb72b9894aff))

## [2.0.1](https://github.com/module-federation/nextjs-mf/compare/typescript-2.0.0...typescript-2.0.1) (2022-12-18)

### Bug Fixes

- cannot convert undefined object ([#406](https://github.com/module-federation/nextjs-mf/issues/406)) ([f049bc9](https://github.com/module-federation/nextjs-mf/commit/f049bc93c987f0ba918ecb345d1b3ee824715672))
- throw correct error object instead of an empty error in FederatedTypesPlugin ([#407](https://github.com/module-federation/nextjs-mf/issues/407)) ([1ee9ffe](https://github.com/module-federation/nextjs-mf/commit/1ee9ffe46534f854aecbde8cc20bcd3e8866274a))

# [2.0.0](https://github.com/module-federation/nextjs-mf/compare/typescript-1.1.0...typescript-2.0.0) (2022-11-20)

### Dependency Updates

- `utils` updated to version `1.0.1`

### Features

- **typescript:** excessive recompilation prevention ([#306](https://github.com/module-federation/nextjs-mf/issues/306)) ([6e1967f](https://github.com/module-federation/nextjs-mf/commit/6e1967f019afb25dfbcfe83627b08ae8b1fe97b2))

### BREAKING CHANGES

- **typescript:** Reimplemented the whole plugin from round-up to enhance performance, prevent excessive recompilation and other issues.

Some key changes to the plugin includes:

- Downloading remote types before compilation starts.
- Caching remote types for better performance.
- Ability to provide Plugin options.

Please go through plugin `readme.md` file to understand what's changed and how to use the plugin.

# [2.0.0](https://github.com/module-federation/nextjs-mf/compare/typescript-1.1.0...typescript-2.0.0) (2022-11-20)

### Dependency Updates

- `utils` updated to version `1.0.0`

### Features

- **typescript:** excessive recompilation prevention ([#306](https://github.com/module-federation/nextjs-mf/issues/306)) ([6e1967f](https://github.com/module-federation/nextjs-mf/commit/6e1967f019afb25dfbcfe83627b08ae8b1fe97b2))

### BREAKING CHANGES

- **typescript:** Reimplemented the whole plugin from round-up to enhance performance, prevent excessive recompilation and other issues.

Some key changes to the plugin includes:

- Downloading remote types before compilation starts.
- Caching remote types for better performance.
- Ability to provide Plugin options.

Please go through plugin `readme.md` file to understand what's changed and how to use the plugin.

# [1.1.0](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.9...typescript-1.1.0) (2022-11-02)

### Features

- **typescript:** provide additional files for the typescript compiler ([#349](https://github.com/module-federation/nextjs-mf/issues/349)) ([a4d9d97](https://github.com/module-federation/nextjs-mf/commit/a4d9d976c4cf1c51352a266cadccf966c3f19fd3))

## [1.0.9](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.8...typescript-1.0.9) (2022-10-31)

### Dependency Updates

- `utils` updated to version `0.5.0`

## [1.0.8](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.7...typescript-1.0.8) (2022-10-26)

### Dependency Updates

- `utils` updated to version `0.4.1`

## [1.0.7](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.6...typescript-1.0.7) (2022-10-26)

### Dependency Updates

- `utils` updated to version `0.4.0`

## [1.0.6](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.5...typescript-1.0.6) (2022-10-18)

## [1.0.5](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.4...typescript-1.0.5) (2022-10-17)

### Dependency Updates

- `utils` updated to version `0.3.4`

## [1.0.4](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.3...typescript-1.0.4) (2022-10-13)

### Dependency Updates

- `utils` updated to version `0.3.3`

## [1.0.3](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.2...typescript-1.0.3) (2022-10-12)

### Dependency Updates

- `utils` updated to version `0.3.2`

## [1.0.2](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.1...typescript-1.0.2) (2022-10-11)

### Dependency Updates

- `utils` updated to version `0.3.1`

## [1.0.2](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.1...typescript-1.0.2) (2022-10-11)

### Dependency Updates

- `utils` updated to version `0.3.1`

## [1.0.1](https://github.com/module-federation/nextjs-mf/compare/typescript-1.0.0...typescript-1.0.1) (2022-10-10)

### Bug Fixes

- get types on remote url with subdirectory ([#302](https://github.com/module-federation/nextjs-mf/issues/302)) ([d3f9060](https://github.com/module-federation/nextjs-mf/commit/d3f9060586b671ce1dd18ab5ef45e1fb5f7d5172))

# [1.0.0](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.8...typescript-1.0.0) (2022-10-08)

- feat(typescript)!: Use expose public path as basis for @mf-typescript output structure (#252) ([ae4e6f9](https://github.com/module-federation/nextjs-mf/commit/ae4e6f993ee7293250cd9bac94d5076c0800aebc)), closes [#252](https://github.com/module-federation/nextjs-mf/issues/252)

### BREAKING CHANGES

- Updates to @mf-typescript folder structure, references to imported types need updating

## [0.2.8](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.7...typescript-0.2.8) (2022-10-07)

### Dependency Updates

- `utils` updated to version `0.3.0`

## [0.2.7](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.6...typescript-0.2.7) (2022-10-07)

### Dependency Updates

- `utils` updated to version `0.2.1`

## [0.2.6](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.5...typescript-0.2.6) (2022-10-06)

### Performance Improvements

- implement simple caching mechanism for fs lookup ([#282](https://github.com/module-federation/nextjs-mf/issues/282)) ([5d78834](https://github.com/module-federation/nextjs-mf/commit/5d78834b7ed2b6bd387a28c470aa2a094ee703a3))

## [0.2.5](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.4...typescript-0.2.5) (2022-10-06)

## [0.2.4](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.3...typescript-0.2.4) (2022-10-06)

## [0.2.3](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.2...typescript-0.2.3) (2022-10-06)

## [0.2.2](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.1...typescript-0.2.2) (2022-10-06)

## [0.2.1](https://github.com/module-federation/nextjs-mf/compare/typescript-0.2.0...typescript-0.2.1) (2022-10-06)

# [0.2.0](https://github.com/module-federation/nextjs-mf/compare/typescript-0.1.1...typescript-0.2.0) (2022-10-06)

## [0.1.1](https://github.com/module-federation/nextjs-mf/compare/typescript-0.1.0...typescript-0.1.1) (2022-10-06)

# 0.1.0 (2022-10-06)

### Bug Fixes

- preserve path of exposed `.d.ts` files ([#265](https://github.com/module-federation/nextjs-mf/issues/265)) ([cc1c1f7](https://github.com/module-federation/nextjs-mf/commit/cc1c1f782477fd6b22c46fc3454de4e250d0d910))

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-06)

### Bug Fixes

- preserve path of exposed `.d.ts` files ([#265](https://github.com/module-federation/nextjs-mf/issues/265)) ([cc1c1f7](https://github.com/module-federation/nextjs-mf/commit/cc1c1f782477fd6b22c46fc3454de4e250d0d910))

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-04)

### Dependency Updates

- `utils` updated to version `0.0.4`

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-04)

### Dependency Updates

- `utils` updated to version `0.0.4`

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-04)

### Dependency Updates

- `utils` updated to version `0.0.4`

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-04)

### Dependency Updates

- `utils` updated to version `0.0.4`

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-04)

### Dependency Updates

- `utils` updated to version `0.0.4`

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-04)

### Dependency Updates

- `utils` updated to version `0.0.4`

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-04)

### Dependency Updates

- `utils` updated to version `0.0.4`

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-04)

### Dependency Updates

- `utils` updated to version `0.0.4`

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-04)

### Dependency Updates

- `utils` updated to version `0.0.4`

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-04)

### Dependency Updates

- `utils` updated to version `0.0.4`

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)

# 0.1.0 (2022-10-04)

### Dependency Updates

- `utils` updated to version `0.0.1`

### Features

- federated types for Typescript based projects ([#245](https://github.com/module-federation/nextjs-mf/issues/245)) ([4a5e282](https://github.com/module-federation/nextjs-mf/commit/4a5e2824400cc843fa0c0504936a68c6c9f33946)), closes [#244](https://github.com/module-federation/nextjs-mf/issues/244)
