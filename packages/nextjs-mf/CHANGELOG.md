# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

# [8.0.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-7.0.7...nextjs-mf-8.0.0) (2023-09-14)

### Dependency Updates

* `utils` updated to version `3.0.1`
* `node` updated to version `2.0.1`
* `utils` updated to version `3.0.1`
* `node` updated to version `2.0.1`
* `node` updated to version `2.0.1`

### Bug Fixes

* update readme ([#1265](https://github.com/module-federation/nextjs-mf/issues/1265)) ([49d66bc](https://github.com/module-federation/nextjs-mf/commit/49d66bc7d0d2708edda61c246f08553718af81cf))
* workaround to self ref module error in prod ([#1205](https://github.com/module-federation/nextjs-mf/issues/1205)) ([1d88beb](https://github.com/module-federation/nextjs-mf/commit/1d88beb0da629f036e132573fee9f05494b1f540))


### Features

* core package for module federation ([#1093](https://github.com/module-federation/nextjs-mf/issues/1093)) ([d460400](https://github.com/module-federation/nextjs-mf/commit/d46040053e9b627321b5fe8e05556c5bb727c238)), closes [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#835](https://github.com/module-federation/nextjs-mf/issues/835) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#871](https://github.com/module-federation/nextjs-mf/issues/871) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#872](https://github.com/module-federation/nextjs-mf/issues/872) [#875](https://github.com/module-federation/nextjs-mf/issues/875) [#884](https://github.com/module-federation/nextjs-mf/issues/884) [#887](https://github.com/module-federation/nextjs-mf/issues/887) [#893](https://github.com/module-federation/nextjs-mf/issues/893) [#885](https://github.com/module-federation/nextjs-mf/issues/885) [#899](https://github.com/module-federation/nextjs-mf/issues/899) [#904](https://github.com/module-federation/nextjs-mf/issues/904) [#932](https://github.com/module-federation/nextjs-mf/issues/932) [#936](https://github.com/module-federation/nextjs-mf/issues/936) [#959](https://github.com/module-federation/nextjs-mf/issues/959) [#960](https://github.com/module-federation/nextjs-mf/issues/960) [#969](https://github.com/module-federation/nextjs-mf/issues/969) [#971](https://github.com/module-federation/nextjs-mf/issues/971) [#1234](https://github.com/module-federation/nextjs-mf/issues/1234) [#1235](https://github.com/module-federation/nextjs-mf/issues/1235)
* Introduce full test command and improvement on RuntimeRemotesMap manipulation ([61e605d](https://github.com/module-federation/nextjs-mf/commit/61e605dd83c8f95c8ed26237709dba412edf447c))
* Update ESLint configuration, add test file and update TypeScript configuration ([00a73be](https://github.com/module-federation/nextjs-mf/commit/00a73be7c1c8ec792e2adae111f063e3741a4bb4))


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

* chore: remove dead code from add module runtime plugin

likely can remove whole plugin in future

* chore: remove logs from delegate modules

* chore: remove old utils

* fix: add warning on auto page stitch

* fix: remove commented out code from InvertedContainerPlugin.ts

* chore: improve logging to see if its local load or remote load

* chore: clean up old custom promises factories

* fix: remove container proxy code

* fix: remove container proxy code
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

* chore: remove dead code from add module runtime plugin

likely can remove whole plugin in future

* chore: remove logs from delegate modules

* chore: remove old utils

* fix: add warning on auto page stitch

* fix: remove commented out code from InvertedContainerPlugin.ts

* chore: improve logging to see if its local load or remote load

* chore: clean up old custom promises factories

* fix: remove container proxy code

* fix: remove container proxy code

* chore: fix project.json

* debugging

* fix: resolve backmerge issues with build

* Merge branch 'kill_child_compilers' into fix_backmerge_issues

# Conflicts:
#	package-lock.json
#	package.json
#	packages/nextjs-mf/src/plugins/NextFederationPlugin/index.ts
#	packages/nextjs-mf/src/plugins/container/InvertedContainerPlugin.ts
#	packages/nextjs-mf/src/plugins/container/InvertedContainerRuntimeModule.ts

* feat: enable eager sharing

* refactor: improve module hooks for eager loading and search

* refactor: cleanup custom jsonp and make es5

* refactor: cleanup inverted container code

* refactor: cleanup inverted container code
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

* chore: remove dead code from add module runtime plugin

likely can remove whole plugin in future

* chore: remove logs from delegate modules

* chore: remove old utils

* fix: add warning on auto page stitch

* fix: remove commented out code from InvertedContainerPlugin.ts

* chore: improve logging to see if its local load or remote load

* chore: clean up old custom promises factories

* fix: remove container proxy code

* fix: remove container proxy code

* fix: resolve backmerge issues with build

* Merge branch 'kill_child_compilers' into fix_backmerge_issues

# Conflicts:
#	package-lock.json
#	package.json
#	packages/nextjs-mf/src/plugins/NextFederationPlugin/index.ts
#	packages/nextjs-mf/src/plugins/container/InvertedContainerPlugin.ts
#	packages/nextjs-mf/src/plugins/container/InvertedContainerRuntimeModule.ts

* feat: enable eager sharing

* refactor: improve module hooks for eager loading and search

* refactor: cleanup custom jsonp and make es5

* refactor: cleanup inverted container code

* refactor: cleanup inverted container code

* ci: fix install step with npm and NX

* test: remove tests for now

* chore(utils): release version 1.7.3-beta.0

* chore(utils): release version 1.7.3

* chore(node): release version 0.14.4-beta.0

* chore(node): release version 0.14.4

* chore(nextjs-mf): release version 6.4.1-beta.4

* fix: remove debugging runtime variable

* chore(nextjs-mf): release version 6.4.1-beta.5



## [7.0.8](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-7.0.7...nextjs-mf-7.0.8) (2023-08-14)

### Dependency Updates

- `utils` updated to version `2.0.6`
- `node` updated to version `1.0.7`
- `utils` updated to version `2.0.6`
- `node` updated to version `1.0.7`

### Bug Fixes

- workaround to self ref module error in prod ([e134caa](https://github.com/module-federation/nextjs-mf/commit/e134caa9a914da6a226e73dc877a108456b1053f))

## [7.0.7](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-7.0.6...nextjs-mf-7.0.7) (2023-08-11)

### Dependency Updates

- `utils` updated to version `2.0.5`
- `node` updated to version `1.0.6`
- `utils` updated to version `2.0.5`
- `node` updated to version `1.0.6`
- `node` updated to version `1.0.6`

### Bug Fixes

- improve import ordering ([#1199](https://github.com/module-federation/nextjs-mf/issues/1199)) ([7354ed2](https://github.com/module-federation/nextjs-mf/commit/7354ed2b412bd9fd8745778e5212e10e8a3bf17f))

## [7.0.6](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-7.0.5...nextjs-mf-7.0.6) (2023-07-19)

### Dependency Updates

- `utils` updated to version `2.0.4`
- `node` updated to version `1.0.5`
- `utils` updated to version `2.0.4`
- `node` updated to version `1.0.5`
- `node` updated to version `1.0.5`

### Bug Fixes

- Fix call undefined delegate ([#1149](https://github.com/module-federation/nextjs-mf/issues/1149)) ([87a5896](https://github.com/module-federation/nextjs-mf/commit/87a5896221a726578c3433071755fba3465824f4)), closes [#1151](https://github.com/module-federation/nextjs-mf/issues/1151)

## [7.0.5](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-7.0.4...nextjs-mf-7.0.5) (2023-07-18)

### Dependency Updates

- `utils` updated to version `2.0.2`
- `node` updated to version `1.0.4`
- `utils` updated to version `2.0.2`
- `utils` updated to version `2.0.2`
- `node` updated to version `1.0.4`

## [7.0.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-7.0.3...nextjs-mf-7.0.4) (2023-07-17)

### Dependency Updates

- `utils` updated to version `2.0.1`
- `node` updated to version `1.0.3`
- `utils` updated to version `2.0.1`
- `node` updated to version `1.0.3`

## [7.0.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-7.0.2...nextjs-mf-7.0.3) (2023-07-17)

### Bug Fixes

- **invertedmoduleplugin:** added another check for nextjs api routes ([#1134](https://github.com/module-federation/nextjs-mf/issues/1134)) ([aba26be](https://github.com/module-federation/nextjs-mf/commit/aba26bed61bca4816238e7b7b93e88b108b65d9d))

## [7.0.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-7.0.1...nextjs-mf-7.0.2) (2023-07-05)

### Dependency Updates

- `node` updated to version `1.0.2`
- `node` updated to version `1.0.2`
- `node` updated to version `1.0.2`

## [7.0.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-7.0.0...nextjs-mf-7.0.1) (2023-07-05)

### Dependency Updates

- `node` updated to version `1.0.1`
- `node` updated to version `1.0.1`
- `node` updated to version `1.0.1`

### Bug Fixes

- **nextjs-mf:** update broken documentation ([#1103](https://github.com/module-federation/nextjs-mf/issues/1103)) ([f3659b4](https://github.com/module-federation/nextjs-mf/commit/f3659b4f2dec9f37256fc2d87d2799f5d1923df6))

# [7.0.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.7.1...nextjs-mf-7.0.0) (2023-07-01)

### Dependency Updates

- `utils` updated to version `2.0.0`
- `node` updated to version `1.0.0`
- `utils` updated to version `2.0.0`
- `utils` updated to version `2.0.0`
- `node` updated to version `1.0.0`
- `node` updated to version `1.0.0`

### Features

- Next Federation 7 ([#726](https://github.com/module-federation/nextjs-mf/issues/726)) ([d50ca1e](https://github.com/module-federation/nextjs-mf/commit/d50ca1e4636c4e0a402190f6e9c3f69ed9ec8eac)), closes [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#835](https://github.com/module-federation/nextjs-mf/issues/835) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#871](https://github.com/module-federation/nextjs-mf/issues/871) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#872](https://github.com/module-federation/nextjs-mf/issues/872) [#875](https://github.com/module-federation/nextjs-mf/issues/875) [#884](https://github.com/module-federation/nextjs-mf/issues/884) [#887](https://github.com/module-federation/nextjs-mf/issues/887) [#893](https://github.com/module-federation/nextjs-mf/issues/893) [#885](https://github.com/module-federation/nextjs-mf/issues/885) [#899](https://github.com/module-federation/nextjs-mf/issues/899) [#904](https://github.com/module-federation/nextjs-mf/issues/904) [#932](https://github.com/module-federation/nextjs-mf/issues/932) [#936](https://github.com/module-federation/nextjs-mf/issues/936) [#959](https://github.com/module-federation/nextjs-mf/issues/959) [#960](https://github.com/module-federation/nextjs-mf/issues/960) [#969](https://github.com/module-federation/nextjs-mf/issues/969) [#971](https://github.com/module-federation/nextjs-mf/issues/971) [#974](https://github.com/module-federation/nextjs-mf/issues/974) [#984](https://github.com/module-federation/nextjs-mf/issues/984) [#986](https://github.com/module-federation/nextjs-mf/issues/986) [#1015](https://github.com/module-federation/nextjs-mf/issues/1015) [#1086](https://github.com/module-federation/nextjs-mf/issues/1086) [#1084](https://github.com/module-federation/nextjs-mf/issues/1084)

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

## [6.7.2-rc.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.7.2-rc.0...nextjs-mf-6.7.2-rc.1) (2023-07-01)

### Features

- support edge workers ([#1084](https://github.com/module-federation/nextjs-mf/issues/1084)) ([3f5df94](https://github.com/module-federation/nextjs-mf/commit/3f5df944ea787cf958fd4cf7fabed84432a50a10))

## [6.7.2-rc.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.7.1...nextjs-mf-6.7.2-rc.0) (2023-06-30)

### Bug Fixes

- module type errors ([4c7b3ff](https://github.com/module-federation/nextjs-mf/commit/4c7b3ffad0726c6d9f51a8fb72ec7eefb3633073))
- ts errors ([44de0be](https://github.com/module-federation/nextjs-mf/commit/44de0beb8c2d94028f738849f2bab438ce530ebe))

## [6.5.2-rc8.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.2-rc8.0...nextjs-mf-6.5.2-rc8.1) (2023-06-28)

### Bug Fixes

- disable flushing remotes to ssr for now ([6c5cfae](https://github.com/module-federation/nextjs-mf/commit/6c5cfaec3be94aeb3f1e12c24965b3904da23bae))

## [6.5.2-rc8.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.2-rc7.0...nextjs-mf-6.5.2-rc8.0) (2023-06-27)

## [6.5.2-rc7.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.2-rc6.0...nextjs-mf-6.5.2-rc7.0) (2023-06-27)

### Bug Fixes

- image path fallback ([fc176ff](https://github.com/module-federation/nextjs-mf/commit/fc176ffa74a082ab0d7a198315f3b0827eb13037))

## [6.5.2-rc6.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.2-rc5.0...nextjs-mf-6.5.2-rc6.0) (2023-06-23)

### Bug Fixes

- remove loggers ([a86b070](https://github.com/module-federation/nextjs-mf/commit/a86b070e11f31303a8833f806f7d2015e55a441b))

## [6.5.2-rc5.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.2-rc4.0...nextjs-mf-6.5.2-rc5.0) (2023-06-23)

### Bug Fixes

- Non-Deterministic Chunk ID Handling ([#986](https://github.com/module-federation/nextjs-mf/issues/986)) ([b051c12](https://github.com/module-federation/nextjs-mf/commit/b051c12bbaf54f7327a4d25407326b6a7d1d9594))

## [6.5.2-rc4.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.2-rc3.1...nextjs-mf-6.5.2-rc4.0) (2023-06-21)

### Bug Fixes

- Api routes ([#984](https://github.com/module-federation/nextjs-mf/issues/984)) ([903296a](https://github.com/module-federation/nextjs-mf/commit/903296af090d344845288fc940536a3b741eb1e1))
- Resolve condition names ([#974](https://github.com/module-federation/nextjs-mf/issues/974)) ([5e8b49c](https://github.com/module-federation/nextjs-mf/commit/5e8b49cf60f19dae6be4818a1c0ff783c7689393))
- Resolve conditional exports ([#971](https://github.com/module-federation/nextjs-mf/issues/971)) ([1c42e2a](https://github.com/module-federation/nextjs-mf/commit/1c42e2a721a9e93b2e9acebc09099dda66699a42))
- Runtime module checking ([#969](https://github.com/module-federation/nextjs-mf/issues/969)) ([b5c7af1](https://github.com/module-federation/nextjs-mf/commit/b5c7af1697a63d9e19f901238a4c0382ea0c3f50))

## [6.5.2-rc3.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.2-rc3.0...nextjs-mf-6.5.2-rc3.1) (2023-06-09)

### Bug Fixes

- Path loader patches ([#960](https://github.com/module-federation/nextjs-mf/issues/960)) ([d362a77](https://github.com/module-federation/nextjs-mf/commit/d362a7752c4364cc499a27f2b6eeb5399543cb29))

## [6.5.2-rc3.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.2-beta.0...nextjs-mf-6.5.2-rc3.0) (2023-06-09)

### Bug Fixes

- remove logs or wrap in debug flag ([#959](https://github.com/module-federation/nextjs-mf/issues/959)) ([5ea321a](https://github.com/module-federation/nextjs-mf/commit/5ea321a6ee4323456f9ad1e62bb2e765df612017))

## [6.5.2-beta.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.2-rc1.0...nextjs-mf-6.5.2-beta.0) (2023-05-26)

### Bug Fixes

- Improve chunk correlation ([#936](https://github.com/module-federation/nextjs-mf/issues/936)) ([4dad1eb](https://github.com/module-federation/nextjs-mf/commit/4dad1eb370feacd6ecb4c1726c435d5c579f424d))
- remove default props deprecation on flush chunks ([103fa91](https://github.com/module-federation/nextjs-mf/commit/103fa910d39e25d283076755a2eedf4e926ba242))

### Features

- support custom distDir ([3d8d540](https://github.com/module-federation/nextjs-mf/commit/3d8d5408f73be9b8798f02fbd2382457510fdc3f))

## [6.5.2-rc1.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.2-rc.0...nextjs-mf-6.5.2-rc1.0) (2023-05-25)

### Bug Fixes

- Improved Entrypoint Module Detection and Refactoring ([#932](https://github.com/module-federation/nextjs-mf/issues/932)) ([d09e841](https://github.com/module-federation/nextjs-mf/commit/d09e841fb2e01300e61c046e18b9d02842920b4a))
- remove specific module type from package ([ad8caf7](https://github.com/module-federation/nextjs-mf/commit/ad8caf7df575a67a866e882e515d9a4e249f5ad8))

## [6.5.2-rc.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.1...nextjs-mf-6.5.2-rc.0) (2023-05-23)

### Bug Fixes

- chunk and module duplications ([#885](https://github.com/module-federation/nextjs-mf/issues/885)) ([199e6b9](https://github.com/module-federation/nextjs-mf/commit/199e6b9937f4a2ca6caedb3ae4767342de463cb6))
- client prod build issues ([#899](https://github.com/module-federation/nextjs-mf/issues/899)) ([470d7ad](https://github.com/module-federation/nextjs-mf/commit/470d7ad408ae8d64dbccc5a9528eaa2ed60fa2ca))
- deprecation warnings about chunkGraph ([9af484d](https://github.com/module-federation/nextjs-mf/commit/9af484dedba44b346d25ac5cdd10292ad018143d))
- externalization and missing runtime chunks ([#887](https://github.com/module-federation/nextjs-mf/issues/887)) ([c79cd62](https://github.com/module-federation/nextjs-mf/commit/c79cd6226d3134f1d6294cd8eba40c8c33af5cb5))
- missing chunk hashes on exposed modules ([#893](https://github.com/module-federation/nextjs-mf/issues/893)) ([cfa43f5](https://github.com/module-federation/nextjs-mf/commit/cfa43f506999d5ce3ab6afeea513d50d85f7886e))

## [6.4.1-rc.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.1-rc.1...nextjs-mf-6.4.1-rc.2) (2023-05-17)

## [6.4.1-rc.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.1-rc.0...nextjs-mf-6.4.1-rc.1) (2023-05-17)

### Bug Fixes

- **chunk-module-duplication:** prevent runtime reset and share scope loss ([14bfc38](https://github.com/module-federation/nextjs-mf/commit/14bfc38515a4da3be7321d4b6d876905d45ad20b))

## [6.4.1-rc.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.1-beta.7...nextjs-mf-6.4.1-rc.0) (2023-05-16)

### Bug Fixes

- Improved Share Scope Properties and Fixed Production Build Issues ([#884](https://github.com/module-federation/nextjs-mf/issues/884)) ([de7b2ce](https://github.com/module-federation/nextjs-mf/commit/de7b2cec7518f6b069818a511275e359c616bb73))
- remove old files ([fa281ec](https://github.com/module-federation/nextjs-mf/commit/fa281ecf0a5486bcf995f548deaef993f437c068))

### Features

- remove entry injection ([4e6981f](https://github.com/module-federation/nextjs-mf/commit/4e6981f8d8a312ae383b1c2cd337882b268e2b9b))

## [6.4.1-beta.7](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.1-beta.6...nextjs-mf-6.4.1-beta.7) (2023-05-16)

### Bug Fixes

- ensure eager modules always exist in host (inject dependent modules somewhere in build pipeline) ([12bb896](https://github.com/module-federation/nextjs-mf/commit/12bb896d37324b4f3d0d59da04463b1d04428a01))

## [6.4.1-beta.6](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.1-beta.5...nextjs-mf-6.4.1-beta.6) (2023-05-15)

### Features

- Quantum Modules ([#872](https://github.com/module-federation/nextjs-mf/issues/872)) ([2991039](https://github.com/module-federation/nextjs-mf/commit/299103932b4e0aa6d8017be588ffa5272f519260))

## [6.4.1-beta.5](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.1-beta.4...nextjs-mf-6.4.1-beta.5) (2023-05-13)

### Bug Fixes

- remove debugging runtime variable ([d15dc2d](https://github.com/module-federation/nextjs-mf/commit/d15dc2dc6f6297532d89295690c6f561fee7955f))

## [6.4.1-beta.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.1-beta.3...nextjs-mf-6.4.1-beta.4) (2023-05-13)

### Bug Fixes

- add warning on auto page stitch ([2f068cf](https://github.com/module-federation/nextjs-mf/commit/2f068cfd71f0aad12285b9ab4cfbd515f399211c))
- remove commented out code from InvertedContainerPlugin.ts ([7d52961](https://github.com/module-federation/nextjs-mf/commit/7d529612869f061733d7d87c9770036b7c2b0bbb))
- resolve backmerge issues with build ([2ad095c](https://github.com/module-federation/nextjs-mf/commit/2ad095cc3198dfd153644cee5fb4f37fa3bf6f03))

### Features

- [7] Async boundary runtime server ([#851](https://github.com/module-federation/nextjs-mf/issues/851)) ([7fa792a](https://github.com/module-federation/nextjs-mf/commit/7fa792a4b518cd007b5ac41db225e20521063e73)), closes [#864](https://github.com/module-federation/nextjs-mf/issues/864)
- [v7] Async boundary runtime ([#835](https://github.com/module-federation/nextjs-mf/issues/835)) ([840e3b5](https://github.com/module-federation/nextjs-mf/commit/840e3b5bddfbb99b5d8d0f5f24bf5e179e8b52ad)), closes [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864)
- enable eager sharing ([b1e4418](https://github.com/module-federation/nextjs-mf/commit/b1e4418304afd30c5f4719469db50c17c279a021))

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

## [6.4.1-beta.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.1-beta.2...nextjs-mf-6.4.1-beta.3) (2023-05-03)

### Bug Fixes

- implement exact version resolution ([ee95f5f](https://github.com/module-federation/nextjs-mf/commit/ee95f5f3fb2d0d5757bfff85e85dcf6658673b9c))
- improve eager modularization ([f593725](https://github.com/module-federation/nextjs-mf/commit/f593725e24672dbf95eae018f2656cab68ec2c4e))
- improve module and async module loading in runtmie module ([c841a4b](https://github.com/module-federation/nextjs-mf/commit/c841a4bd9e2205b438fc1c8855c66e1eee764e0a))
- improve stability of chunk push ([98ad6ad](https://github.com/module-federation/nextjs-mf/commit/98ad6ad66ae19429a4808dc9215c6efef6b69fee))
- improve startup inversion ([42e59f1](https://github.com/module-federation/nextjs-mf/commit/42e59f1b0c58d98c4a16d1efd1ab00d0748311f0))
- prevent hmr destroying share scope ([ffc1131](https://github.com/module-federation/nextjs-mf/commit/ffc1131b2607387805d3137561df3ae756d07244))

### Features

- eager load initial consumes ([6a05a5f](https://github.com/module-federation/nextjs-mf/commit/6a05a5f456dd0c5047f034cf7e9d3945a99f737b))
- install an async boundary runtime module ([cbbc7f5](https://github.com/module-federation/nextjs-mf/commit/cbbc7f53dd908c42cb1897e3aa9e70a9819a002a))

## [6.4.1-beta.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.1-beta.1...nextjs-mf-6.4.1-beta.2) (2023-04-28)

### Bug Fixes

- disable next chunk splits ([2f731ee](https://github.com/module-federation/nextjs-mf/commit/2f731eee497c0f4d3057600f22bc2556e8b32410))

## [6.4.1-beta.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.1-beta.0...nextjs-mf-6.4.1-beta.1) (2023-04-28)

## [6.4.1-beta.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.0...nextjs-mf-6.4.1-beta.0) (2023-04-28)

### Features

- [v7] host inversion ([#769](https://github.com/module-federation/nextjs-mf/issues/769)) ([53b9e4b](https://github.com/module-federation/nextjs-mf/commit/53b9e4b4a0dd11adfaf394140133e9244156b839))
- Custom Startup Runtime modules ([0f4bb27](https://github.com/module-federation/nextjs-mf/commit/0f4bb278a1e3be602c489d39062e7e236c47cca1))
- Improve module chunk connections ([#802](https://github.com/module-federation/nextjs-mf/issues/802)) ([ce0bd7b](https://github.com/module-federation/nextjs-mf/commit/ce0bd7b16e080f712e6db0bdcd3955a8167c274f)), closes [#803](https://github.com/module-federation/nextjs-mf/issues/803) [#808](https://github.com/module-federation/nextjs-mf/issues/808) [#811](https://github.com/module-federation/nextjs-mf/issues/811)
- remove child compiler pluign ([#780](https://github.com/module-federation/nextjs-mf/issues/780)) ([ed7ce3a](https://github.com/module-federation/nextjs-mf/commit/ed7ce3a6220bf0fa142da50d8101ad4693c8b178))

### BREAKING CHANGES

- Internal child compilers are no longer used
  BREAKING_CHANGE: Internal child compilers are no longer used

## [6.3.1-beta.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.3.1...nextjs-mf-6.3.1-beta.0) (2023-04-19)

### Bug Fixes

- cache busting and async quirks when mixing delegates ([1fc6e67](https://github.com/module-federation/nextjs-mf/commit/1fc6e67ee33a3efb53ff59d2b3ac333f1d42a158))
- ensure app functions with async boundary loader ([717e885](https://github.com/module-federation/nextjs-mf/commit/717e88558475158bf1eb5ae88e53a3624b3277ff))
- get delegates working ([#527](https://github.com/module-federation/nextjs-mf/issues/527)) ([7655568](https://github.com/module-federation/nextjs-mf/commit/7655568fcef8dbfda40573deb5d3d029c101074c))
- improved asset pipeline ([63928b2](https://github.com/module-federation/nextjs-mf/commit/63928b28150c2c4e3adb9e14fb7aa54f5cf1578d))
- move delegate modules into both webpack runtimes ([0570021](https://github.com/module-federation/nextjs-mf/commit/0570021d1040888a9f00394e64f7530a22e74a75))
- move host remote reg into loader ([188b9e4](https://github.com/module-federation/nextjs-mf/commit/188b9e432b95ba4934a838a49571435ea27b4d0b))
- peer dependencies metadata ([b603587](https://github.com/module-federation/nextjs-mf/commit/b6035870e5130bfd5b5c70951cc17bb38a50fbdd))
- put error triggers if delegates are passed non-primitives ([0a780bb](https://github.com/module-federation/nextjs-mf/commit/0a780bb07c9421b58605fc133f236a918ef5a0d8))
- remove dead code, use commonjs for delegate exports ([ad646d7](https://github.com/module-federation/nextjs-mf/commit/ad646d7306a2442ae6d9b2a72b33fb5ce66a9ba4))
- solve double async boundary ([88b3f4f](https://github.com/module-federation/nextjs-mf/commit/88b3f4f08b217e2f88b535ec9c7290bad697888b))
- solve externalization ([49f52e5](https://github.com/module-federation/nextjs-mf/commit/49f52e53ddddc990d31e6aa510d67dc0552a9d9a))
- support windows paths ([98ca26f](https://github.com/module-federation/nextjs-mf/commit/98ca26f3062b9fa67fc8ba8152fd85eda9b5df10))
- use EntryPlugin for injection of remotes ([e522c5a](https://github.com/module-federation/nextjs-mf/commit/e522c5ad2b7adcbd6c39f9c5fdb7a3e418277b7a))

### Features

- delegate module support ([76c9df3](https://github.com/module-federation/nextjs-mf/commit/76c9df3b97d60040466e9a01cfe3f45e8f9c6b78))
- delegate module support ([3567aa5](https://github.com/module-federation/nextjs-mf/commit/3567aa5f6d0a00ca6df103c796657eb8953bc96a))
- delegate module support ([8dd154c](https://github.com/module-federation/nextjs-mf/commit/8dd154c261b34183b12250ce204904cd3e085658))
- delegates part two ([1be2686](https://github.com/module-federation/nextjs-mf/commit/1be2686624798a7df9f447b48279294985b3f592))
- implement basic single runtime ([2432c3e](https://github.com/module-federation/nextjs-mf/commit/2432c3ec553759ca24d17a46b696c1123a86ec5a))
- implement module runtime hoisting ([17c5b2f](https://github.com/module-federation/nextjs-mf/commit/17c5b2fc5f67c4321959ae30a69742c3128bc9a5))
- improve automatic async boundary loader on single compile instance ([63fc327](https://github.com/module-federation/nextjs-mf/commit/63fc3273500d1626c7e8c4dab14268ae5cb9de7a))
- improve chunk correlation ([22d8afc](https://github.com/module-federation/nextjs-mf/commit/22d8afccff101044fcdeba390656950dbc6eafed))
- new chunk flushing system for exposed modules ([97a75d8](https://github.com/module-federation/nextjs-mf/commit/97a75d8702f2ddc5e12cff2ac4d24aca1df6f990))
- new next federation plugin ([7e096df](https://github.com/module-federation/nextjs-mf/commit/7e096df89682369cdc92095be6936b58b9b5787f))
- new output copy plugin for prod server exposure ([85da209](https://github.com/module-federation/nextjs-mf/commit/85da209103046567bdc93f71d421ea413ac1d37b))
- remove child compilers ([c124f37](https://github.com/module-federation/nextjs-mf/commit/c124f3797ad327971066a4ad75f0317531653c08))
- removing old promise template stuff from build utils ([d827cd6](https://github.com/module-federation/nextjs-mf/commit/d827cd60fc12bd65b4091db5f7e3d9b96bcdc12b))

### BREAKING CHANGES

- Plugin No longer uses child sidecars to create containers.
- deleting support for promiseTemplate

## [6.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.7.0...nextjs-mf-6.7.1) (2023-06-30)

### Bug Fixes

- TS builds ([deca4a2](https://github.com/module-federation/nextjs-mf/commit/deca4a22fa83a5f2d7e03de8ff8a2d82b1aecded))

# [6.7.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.6.3...nextjs-mf-6.7.0) (2023-06-30)

### Dependency Updates

- `utils` updated to version `1.9.1`
- `node` updated to version `0.16.2`
- `utils` updated to version `1.9.1`
- `node` updated to version `0.16.2`
- `node` updated to version `0.16.2`

### Features

- support use client directive ([#1069](https://github.com/module-federation/nextjs-mf/issues/1069)) ([e20ade1](https://github.com/module-federation/nextjs-mf/commit/e20ade134d96a339dc53fe886a41f2eb81d878d5))

## [6.6.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.6.2...nextjs-mf-6.6.3) (2023-06-29)

## [6.6.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.6.1...nextjs-mf-6.6.2) (2023-06-29)

## [6.6.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.6.0...nextjs-mf-6.6.1) (2023-06-29)

### Dependency Updates

- `node` updated to version `0.16.1`
- `node` updated to version `0.16.1`

# [6.6.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.1...nextjs-mf-6.6.0) (2023-06-29)

## [6.5.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.5.0...nextjs-mf-6.5.1) (2023-05-22)

### Dependency Updates

- `node` updated to version `0.15.1`
- `node` updated to version `0.15.1`

# [6.5.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.4.0...nextjs-mf-6.5.0) (2023-05-22)

### Dependency Updates

- `utils` updated to version `1.8.0`
- `node` updated to version `0.15.0`
- `utils` updated to version `1.8.0`
- `node` updated to version `0.15.0`

### Bug Fixes

- doc ([#860](https://github.com/module-federation/nextjs-mf/issues/860)) ([cb88646](https://github.com/module-federation/nextjs-mf/commit/cb886469b7d8eddbd2c94c2de88010366bb207d7))

### Features

- release to npm with next tag to not ruine latest one ([#763](https://github.com/module-federation/nextjs-mf/issues/763)) ([f2d199b](https://github.com/module-federation/nextjs-mf/commit/f2d199b3b3fbbd428514b1ce1f139efc82f7fff0))
- **website:** initial version of module federation website ([#751](https://github.com/module-federation/nextjs-mf/issues/751)) ([9b4ec04](https://github.com/module-federation/nextjs-mf/commit/9b4ec048652f0d2237e9401912ead7c5bbe060c4))

# [6.4.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.3.1...nextjs-mf-6.4.0) (2023-04-19)

## [6.3.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.3.0...nextjs-mf-6.3.1) (2023-04-13)

### Bug Fixes

- Add 'react/jsx-dev-runtime' to share scope ([#748](https://github.com/module-federation/nextjs-mf/issues/748)) ([73e870d](https://github.com/module-federation/nextjs-mf/commit/73e870d60e6498e4adcb0e96dfd6b790e079d4ff))

# [6.3.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.2.3...nextjs-mf-6.3.0) (2023-04-10)

### Dependency Updates

- `utils` updated to version `1.5.0`
- `utils` updated to version `1.5.0`
- `node` updated to version `0.13.0`
- `node` updated to version `0.13.0`

### Features

- Allow Container Utils to work Server Side ([#723](https://github.com/module-federation/nextjs-mf/issues/723)) ([232ba24](https://github.com/module-federation/nextjs-mf/commit/232ba24072f19bd32d1f745d4edf1518e548df50))

## [6.2.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.2.2...nextjs-mf-6.2.3) (2023-04-09)

### Dependency Updates

- `utils` updated to version `1.4.1`
- `utils` updated to version `1.4.1`
- `node` updated to version `0.12.3`
- `node` updated to version `0.12.3`

### Bug Fixes

- loader handling of getServerProps ([#697](https://github.com/module-federation/nextjs-mf/issues/697)) ([aade75c](https://github.com/module-federation/nextjs-mf/commit/aade75c450c5773c9c21fe4f3d29ed4c1409a532))

## [6.2.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.2.1...nextjs-mf-6.2.2) (2023-03-24)

### Dependency Updates

- `node` updated to version `0.12.2`
- `node` updated to version `0.12.2`

## [6.2.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.2.0...nextjs-mf-6.2.1) (2023-03-18)

### Bug Fixes

- hoist delegate glue code into container when medusa is used ([#642](https://github.com/module-federation/nextjs-mf/issues/642)) ([a63cd94](https://github.com/module-federation/nextjs-mf/commit/a63cd944546a6e5d62055fcec4d7e1f04f618ded))

# [6.2.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.1.4...nextjs-mf-6.2.0) (2023-03-14)

### Dependency Updates

- `utils` updated to version `1.4.0`
- `node` updated to version `0.12.0`

### Features

- Medusa Support in NextFederationPlugin ([#609](https://github.com/module-federation/nextjs-mf/issues/609)) ([0bbba38](https://github.com/module-federation/nextjs-mf/commit/0bbba384c45b7d149b7a6be2dfbe9851b541b528)), closes [#606](https://github.com/module-federation/nextjs-mf/issues/606)

## [6.1.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.1.3...nextjs-mf-6.1.4) (2023-03-08)

### Bug Fixes

- exclude next middleware from async boundary loader ([#615](https://github.com/module-federation/nextjs-mf/issues/615)) ([9560d92](https://github.com/module-federation/nextjs-mf/commit/9560d926de176e08b6e1b7a32488f5036cb04be3))
- include src folder in paths validation ([#605](https://github.com/module-federation/nextjs-mf/issues/605)) ([89a9417](https://github.com/module-federation/nextjs-mf/commit/89a9417faaad50533c4bca1683ea94406ca6f532))

## [6.1.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.1.2...nextjs-mf-6.1.3) (2023-02-17)

### Bug Fixes

- Don't apply async boundary loader for api routes on Windows ([#587](https://github.com/module-federation/nextjs-mf/issues/587)) ([5173845](https://github.com/module-federation/nextjs-mf/commit/5173845aca15509c363e52e71836303d25c09135))

## [6.1.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.1.1...nextjs-mf-6.1.2) (2023-02-09)

### Dependency Updates

- `node` updated to version `0.11.1`

### Bug Fixes

- backward compatability with older versions pre 6.1.x ([f27b57a](https://github.com/module-federation/nextjs-mf/commit/f27b57a36a61280124bab4a309edaa1c3fd04ced))

## [6.1.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.1.0...nextjs-mf-6.1.1) (2023-02-09)

### Bug Fixes

- resolve NX build version issues ([c5f7274](https://github.com/module-federation/nextjs-mf/commit/c5f7274265ce325dda3c324074c808cce95699fd))

# [6.1.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.8...nextjs-mf-6.1.0) (2023-02-09)

### Dependency Updates

- `utils` updated to version `1.3.0`
- `node` updated to version `0.11.0`

### Features

- Delegate Modules ([#509](https://github.com/module-federation/nextjs-mf/issues/509)) ([1a085e7](https://github.com/module-federation/nextjs-mf/commit/1a085e7e03ca0afd5c64389b4b169f3db3382f6b))

## [6.0.8](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.7...nextjs-mf-6.0.8) (2023-02-09)

### Dependency Updates

- `utils` updated to version `1.2.1`
- `node` updated to version `0.10.5`

## [6.0.7](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.6...nextjs-mf-6.0.7) (2023-02-02)

### Dependency Updates

- `node` updated to version `0.10.4`

## [6.0.7](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.6...nextjs-mf-6.0.7) (2023-02-02)

### Dependency Updates

- `node` updated to version `0.10.5`

## [6.0.6](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.5...nextjs-mf-6.0.6) (2023-01-31)

### Dependency Updates

- `node` updated to version `0.10.3`
- `utils` updated to version `1.2.0`

### Bug Fixes

- **deps:** update dependency eventemitter3 to v5 ([#539](https://github.com/module-federation/nextjs-mf/issues/539)) ([f2d634a](https://github.com/module-federation/nextjs-mf/commit/f2d634ab0f186467120acaac662a13dbeaf3e56e))
- getOutputPath to find if endsWith server ([#555](https://github.com/module-federation/nextjs-mf/issues/555)) ([d5386c4](https://github.com/module-federation/nextjs-mf/commit/d5386c475bc53a28e2348d10d8280714560ccc4b))

## [6.0.5](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.4...nextjs-mf-6.0.5) (2023-01-21)

### Dependency Updates

- `node` updated to version `0.10.2`
- `utils` updated to version `1.1.2`

### Bug Fixes

- **nextjs-mf:** fix list key warning in FlushedChunks ([#508](https://github.com/module-federation/nextjs-mf/issues/508)) ([7694c93](https://github.com/module-federation/nextjs-mf/commit/7694c9350f59e4f626d7fd4da9f3ca42803326ca))

## [6.0.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.3...nextjs-mf-6.0.4) (2023-01-11)

### Bug Fixes

- resolve fake remote if offline ([#503](https://github.com/module-federation/nextjs-mf/issues/503)) ([536243d](https://github.com/module-federation/nextjs-mf/commit/536243dac1f697f2b6b0718f4767988b10ce5344))

## [6.0.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.2...nextjs-mf-6.0.3) (2023-01-11)

### Dependency Updates

- `node` updated to version `0.10.1`
- `utils` updated to version `1.1.1`

### Bug Fixes

- **nextjs-mf:** fix FlushedChunks TS declaration ([#477](https://github.com/module-federation/nextjs-mf/issues/477)) ([afd5a93](https://github.com/module-federation/nextjs-mf/commit/afd5a93af63cb9e79ba424eecabf9f51f76e2ac1))
- resolve fake remote if offline ([#501](https://github.com/module-federation/nextjs-mf/issues/501)) ([004e14d](https://github.com/module-federation/nextjs-mf/commit/004e14df1a6b87d8cca63dceadf9d30805c8d285))

## [6.0.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.1...nextjs-mf-6.0.2) (2023-01-11)

### Dependency Updates

- `node` updated to version `0.10.0`

## [6.0.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-6.0.0...nextjs-mf-6.0.1) (2022-12-30)

### Dependency Updates

- `node` updated to version `0.9.11`
- `utils` updated to version `1.1.0`

### Bug Fixes

- dont apply async boundary loader to api routes ([#472](https://github.com/module-federation/nextjs-mf/issues/472)) ([52d0b6b](https://github.com/module-federation/nextjs-mf/commit/52d0b6bf453ca775c4f4e50bd645a28cbe341aa0))

# [6.0.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.14...nextjs-mf-6.0.0) (2022-12-29)

### Dependency Updates

- `node` updated to version `0.9.10`
- `utils` updated to version `1.0.4`

### Features

- change module sharing strategy ([#469](https://github.com/module-federation/nextjs-mf/issues/469)) ([5fecf86](https://github.com/module-federation/nextjs-mf/commit/5fecf867f34b20e2c7cea3909a1f306d46d92bf3))

### BREAKING CHANGES

- Previously, we used to "rekey" all shared packages used in a host in order to prevent eager consumption issues. However, this caused unforeseen issues when trying to share a singleton package, as the package would end up being bundled multiple times per page.

As a result, we have had to stop rekeying shared modules in userland and only do so on internal Next packages themselves.

If you need to dangerously share a package using the old method, you can do so by using the following code:

                 const shared = {
                   fakeLodash: {
                     import: "lodash",
                     shareKey: "lodash",
                   }
                 }

Please note that this method is now considered dangerous and should be used with caution.

- update build release

- update build release

## [5.12.14](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.13...nextjs-mf-5.12.14) (2022-12-27)

### Dependency Updates

- `node` updated to version `0.9.9`
- `utils` updated to version `1.0.3`

## [5.12.13](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.12...nextjs-mf-5.12.13) (2022-12-27)

### Dependency Updates

- `node` updated to version `0.9.8`
- `utils` updated to version `1.0.2`

### Bug Fixes

- **nextjs-mf:** fix client-side compilation ([#453](https://github.com/module-federation/nextjs-mf/issues/453)) ([d97d764](https://github.com/module-federation/nextjs-mf/commit/d97d764ded8d3cb1b5e04829eaf226f0c5a3baa3))

## [5.12.12](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.11...nextjs-mf-5.12.12) (2022-12-20)

### Bug Fixes

- **async-boundary-loader:** use relativeResource instead of this.resouce ([#421](https://github.com/module-federation/nextjs-mf/issues/421)) ([e1f4402](https://github.com/module-federation/nextjs-mf/commit/e1f4402a9c77709a4d3cd0ae87a28b961e1483d3))

## [5.12.11](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.10...nextjs-mf-5.12.11) (2022-12-18)

### Dependency Updates

- `node` updated to version `0.9.7`

## [5.12.10](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.9...nextjs-mf-5.12.10) (2022-11-23)

### Bug Fixes

- next images when debugging locally ([#395](https://github.com/module-federation/nextjs-mf/issues/395)) ([0379baa](https://github.com/module-federation/nextjs-mf/commit/0379baaae14960d0e7c7353e7d2b0aa1a4a02aa4))

## [5.12.9](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.8...nextjs-mf-5.12.9) (2022-11-23)

### Bug Fixes

- support images for storages and local debug ([#391](https://github.com/module-federation/nextjs-mf/issues/391)) ([9a72311](https://github.com/module-federation/nextjs-mf/commit/9a72311f18b5b3f1ae0badda3f25bd71cc6c8a3b))

## [5.12.8](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.7...nextjs-mf-5.12.8) (2022-11-22)

### Dependency Updates

- `node` updated to version `0.9.6`

### Bug Fixes

- normalize options private variable on plugin constructors ([#390](https://github.com/module-federation/nextjs-mf/issues/390)) ([5654acd](https://github.com/module-federation/nextjs-mf/commit/5654acdf8e79f0b10f34bb58c6eb09c1b83675cb))

## [5.12.7](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.6...nextjs-mf-5.12.7) (2022-11-22)

### Bug Fixes

- improve syntax of loaders ([#389](https://github.com/module-federation/nextjs-mf/issues/389)) ([d7b7910](https://github.com/module-federation/nextjs-mf/commit/d7b79109343e4e39fc1f97cef999cb7620d80081))

## [5.12.6](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.5...nextjs-mf-5.12.6) (2022-11-22)

### Dependency Updates

- `node` updated to version `0.9.5`

### Bug Fixes

- Improve logic ([#387](https://github.com/module-federation/nextjs-mf/issues/387)) ([0eb7f1b](https://github.com/module-federation/nextjs-mf/commit/0eb7f1bb77ef0a72ad26adeea1b508fbae60656f))

## [5.12.5](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.4...nextjs-mf-5.12.5) (2022-11-20)

## [5.12.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.3...nextjs-mf-5.12.4) (2022-11-20)

### Dependency Updates

- `node` updated to version `0.9.4`

## [5.12.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.2...nextjs-mf-5.12.3) (2022-11-20)

## [5.12.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.1...nextjs-mf-5.12.2) (2022-11-20)

## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

- `node` updated to version `0.9.3`

## [5.12.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.1...nextjs-mf-5.12.2) (2022-11-20)

## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

- `node` updated to version `0.9.1`

## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

- `node` updated to version `0.9.1`

## [5.12.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.1...nextjs-mf-5.12.2) (2022-11-20)

## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

- `node` updated to version `0.9.1`

## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

- `node` updated to version `0.9.1`

## [5.12.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.12.0...nextjs-mf-5.12.1) (2022-11-20)

### Dependency Updates

- `node` updated to version `0.9.1`

# [5.12.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.11.2...nextjs-mf-5.12.0) (2022-11-20)

### Dependency Updates

- `node` updated to version `0.9.0`
- `utils` updated to version `1.0.1`

### Bug Fixes

- Better page regex ([#346](https://github.com/module-federation/nextjs-mf/issues/346)) ([b525d3b](https://github.com/module-federation/nextjs-mf/commit/b525d3b579af2ac3a8b502f3c996de8726dbcadd))
- better page regex for adding loaders ([72fef27](https://github.com/module-federation/nextjs-mf/commit/72fef2792dc39c7605f8b9f8136f5d18a46a3fe5))
- Fix peer deps ([#343](https://github.com/module-federation/nextjs-mf/issues/343)) ([8e7b087](https://github.com/module-federation/nextjs-mf/commit/8e7b0871507911bb81161b9786901877259edaed))
- include styled-jsx/style in defaults share ([#347](https://github.com/module-federation/nextjs-mf/issues/347)) ([cb0675b](https://github.com/module-federation/nextjs-mf/commit/cb0675be8e3a4fe0ec89ef7f190610392bb16b6d))
- update version ([70bda37](https://github.com/module-federation/nextjs-mf/commit/70bda37744f55af849bd5c28684f42851bbf7d1f))

### Features

- support ssr remote entry images ([9ab2afa](https://github.com/module-federation/nextjs-mf/commit/9ab2afaef5115ae6677641cb9d021273dafebf86))

# [5.12.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.11.2...nextjs-mf-5.12.0) (2022-11-20)

### Dependency Updates

- `node` updated to version `0.9.0`
- `utils` updated to version `1.0.0`

### Bug Fixes

- Better page regex ([#346](https://github.com/module-federation/nextjs-mf/issues/346)) ([b525d3b](https://github.com/module-federation/nextjs-mf/commit/b525d3b579af2ac3a8b502f3c996de8726dbcadd))
- better page regex for adding loaders ([72fef27](https://github.com/module-federation/nextjs-mf/commit/72fef2792dc39c7605f8b9f8136f5d18a46a3fe5))
- Fix peer deps ([#343](https://github.com/module-federation/nextjs-mf/issues/343)) ([8e7b087](https://github.com/module-federation/nextjs-mf/commit/8e7b0871507911bb81161b9786901877259edaed))
- include styled-jsx/style in defaults share ([#347](https://github.com/module-federation/nextjs-mf/issues/347)) ([cb0675b](https://github.com/module-federation/nextjs-mf/commit/cb0675be8e3a4fe0ec89ef7f190610392bb16b6d))
- update version ([70bda37](https://github.com/module-federation/nextjs-mf/commit/70bda37744f55af849bd5c28684f42851bbf7d1f))

### Features

- support ssr remote entry images ([9ab2afa](https://github.com/module-federation/nextjs-mf/commit/9ab2afaef5115ae6677641cb9d021273dafebf86))

## [5.11.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.11.2...nextjs-mf-5.11.3) (2022-10-26)

### Bug Fixes

- Fix peer deps ([#343](https://github.com/module-federation/nextjs-mf/issues/343)) ([8e7b087](https://github.com/module-federation/nextjs-mf/commit/8e7b0871507911bb81161b9786901877259edaed))

## [5.11.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.11.1...nextjs-mf-5.11.2) (2022-10-26)

### Dependency Updates

- `node` updated to version `0.8.2`

## [5.11.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.11.0...nextjs-mf-5.11.1) (2022-10-26)

### Dependency Updates

- `node` updated to version `0.8.1`
- `utils` updated to version `0.4.1`

# [5.11.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.5...nextjs-mf-5.11.0) (2022-10-26)

### Dependency Updates

- `node` updated to version `0.8.0`
- `utils` updated to version `0.4.0`

### Features

- Automatic Async boundary loader ([#330](https://github.com/module-federation/nextjs-mf/issues/330)) ([7e3c08c](https://github.com/module-federation/nextjs-mf/commit/7e3c08cf7835c0407bdce7ed6865b864153074a4))

## [5.10.5](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.4...nextjs-mf-5.10.5) (2022-10-26)

### Bug Fixes

- improve loader paths for including defaults ([#338](https://github.com/module-federation/nextjs-mf/issues/338)) ([a99fe97](https://github.com/module-federation/nextjs-mf/commit/a99fe977eeaecce54e5241b42aabd552c52b8129))

## [5.10.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.3...nextjs-mf-5.10.4) (2022-10-26)

### Bug Fixes

- update next peer dep to 12.3.0 ([#328](https://github.com/module-federation/nextjs-mf/issues/328)) ([841be9d](https://github.com/module-federation/nextjs-mf/commit/841be9d027b6b33cca27b884f87f27dd7a9bdee5))

## [5.10.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.2...nextjs-mf-5.10.3) (2022-10-26)

### Bug Fixes

- share styled-jsx/style as singleton ([#333](https://github.com/module-federation/nextjs-mf/issues/333)) ([dd2c2d1](https://github.com/module-federation/nextjs-mf/commit/dd2c2d173000e7f89ecc7961255c6a29b769f278))

## [5.10.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.1...nextjs-mf-5.10.2) (2022-10-24)

### Bug Fixes

- support include defaults for windows ([#327](https://github.com/module-federation/nextjs-mf/issues/327)) ([059db4e](https://github.com/module-federation/nextjs-mf/commit/059db4eb604368e14eef464caca6d16463a6d706))

## [5.10.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.10.0...nextjs-mf-5.10.1) (2022-10-19)

# [5.10.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.17...nextjs-mf-5.10.0) (2022-10-19)

### Dependency Updates

- `node` updated to version `0.7.0`

### Features

- consolidate promise factories in server ([#297](https://github.com/module-federation/nextjs-mf/issues/297)) ([55387ee](https://github.com/module-federation/nextjs-mf/commit/55387eeb952fb3164900d73ddcb0007f644c766f))

## [5.9.17](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.16...nextjs-mf-5.9.17) (2022-10-18)

### Dependency Updates

- `node` updated to version `0.6.7`

### Bug Fixes

- reduce stats serialization ([#322](https://github.com/module-federation/nextjs-mf/issues/322)) ([c7ab66d](https://github.com/module-federation/nextjs-mf/commit/c7ab66dce01ac4509f16b0e8f20b43134376f841))

## [5.9.16](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.15...nextjs-mf-5.9.16) (2022-10-17)

### Dependency Updates

- `node` updated to version `0.6.6`

## [5.9.15](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.14...nextjs-mf-5.9.15) (2022-10-17)

### Dependency Updates

- `node` updated to version `0.6.5`
- `utils` updated to version `0.3.4`

## [5.9.14](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.13...nextjs-mf-5.9.14) (2022-10-14)

### Bug Fixes

- isolate loader scope to just js files ([#317](https://github.com/module-federation/nextjs-mf/issues/317)) ([ac56950](https://github.com/module-federation/nextjs-mf/commit/ac56950cba8f23fcb58ac83fed29766608aaabc8))

## [5.9.13](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.12...nextjs-mf-5.9.13) (2022-10-14)

### Bug Fixes

- improve include defaults loader ([#315](https://github.com/module-federation/nextjs-mf/issues/315)) ([f228e49](https://github.com/module-federation/nextjs-mf/commit/f228e49afbbe54950b4187b72aabaef8174d0758))

## [5.9.12](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.11...nextjs-mf-5.9.12) (2022-10-13)

### Dependency Updates

- `node` updated to version `0.6.4`
- `utils` updated to version `0.3.3`

## [5.9.11](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.10...nextjs-mf-5.9.11) (2022-10-12)

### Bug Fixes

- revert prettier ([cef32b8](https://github.com/module-federation/nextjs-mf/commit/cef32b82ca124e8d707193ddd70371a009641665))

## [5.9.10](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.9...nextjs-mf-5.9.10) (2022-10-12)

### Bug Fixes

- do not push tags ([ba8a811](https://github.com/module-federation/nextjs-mf/commit/ba8a811592329b78eac0c3d1c9dae07927a804b1))

## [5.9.9](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.8...nextjs-mf-5.9.9) (2022-10-12)

## [5.9.8](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.7...nextjs-mf-5.9.8) (2022-10-12)

## [5.9.7](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.6...nextjs-mf-5.9.7) (2022-10-12)

## [5.9.6](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.5...nextjs-mf-5.9.6) (2022-10-12)

## [5.9.5](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.4...nextjs-mf-5.9.5) (2022-10-12)

## [5.9.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.1...nextjs-mf-5.9.2) (2022-10-11)

### Dependency Updates

- `node` updated to version `0.6.2`
- `utils` updated to version `0.3.1`

## [5.9.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.9.0...nextjs-mf-5.9.1) (2022-10-10)

### Dependency Updates

- `node` updated to version `0.6.1`

# [5.9.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.5...nextjs-mf-5.9.0) (2022-10-08)

### Dependency Updates

- `node` updated to version `0.6.0`
- `utils` updated to version `0.3.0`

### Features

- implement **webpack_require**.l functionality in server builds ([99d1231](https://github.com/module-federation/nextjs-mf/commit/99d12314f68ac526000fa5410a14072a11b260a4))

# [5.9.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.5...nextjs-mf-5.9.0) (2022-10-08)

### Dependency Updates

- `node` updated to version `0.6.0`
- `utils` updated to version `0.3.0`

### Features

- implement **webpack_require**.l functionality in server builds ([99d1231](https://github.com/module-federation/nextjs-mf/commit/99d12314f68ac526000fa5410a14072a11b260a4))

## [5.8.5](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.4...nextjs-mf-5.8.5) (2022-10-07)

### Dependency Updates

- `node` updated to version `0.5.7`
- `utils` updated to version `0.2.1`

## [5.8.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.3...nextjs-mf-5.8.4) (2022-10-06)

## [5.8.3](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.2...nextjs-mf-5.8.3) (2022-10-06)

## [5.8.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.1...nextjs-mf-5.8.2) (2022-10-06)

## [5.8.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.8.0...nextjs-mf-5.8.1) (2022-10-06)

# [5.8.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.2...nextjs-mf-5.8.0) (2022-10-06)

# [5.8.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.2...nextjs-mf-5.8.0) (2022-10-06)

## [5.7.2](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.1...nextjs-mf-5.7.2) (2022-10-06)

## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-06)

### Bug Fixes

- flush CSS chunks, cache bust remote entry on render ([#269](https://github.com/module-federation/nextjs-mf/issues/269)) ([85a216a](https://github.com/module-federation/nextjs-mf/commit/85a216a8fd34ae849630ff5b42bacb26c855a9ce))
- improve handling of offline remotes ([#263](https://github.com/module-federation/nextjs-mf/issues/263)) ([e0eb437](https://github.com/module-federation/nextjs-mf/commit/e0eb437bbc0259a8f263ededa505a397fa59b97b))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-06)

### Bug Fixes

- flush CSS chunks, cache bust remote entry on render ([#269](https://github.com/module-federation/nextjs-mf/issues/269)) ([85a216a](https://github.com/module-federation/nextjs-mf/commit/85a216a8fd34ae849630ff5b42bacb26c855a9ce))
- improve handling of offline remotes ([#263](https://github.com/module-federation/nextjs-mf/issues/263)) ([e0eb437](https://github.com/module-federation/nextjs-mf/commit/e0eb437bbc0259a8f263ededa505a397fa59b97b))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

# [5.8.0](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.8.0) (2022-10-05)

### Bug Fixes

- improve handling of offline remotes ([3ae596e](https://github.com/module-federation/nextjs-mf/commit/3ae596ee82d2ccf0d828d7928cbdc4fbec509d55))
- patch share scope on client server ([fc7f82f](https://github.com/module-federation/nextjs-mf/commit/fc7f82fd1f299a078552ce811d074b816e796109))
- patch share scope on client server ([b4461fd](https://github.com/module-federation/nextjs-mf/commit/b4461fdbe6999390cbf4b57c18c537563cf04cc9))
- patch share scope on client server ([31b4c24](https://github.com/module-federation/nextjs-mf/commit/31b4c24112e27630b588410d9d78e89acc579d26))
- patch share scope on client server ([272c110](https://github.com/module-federation/nextjs-mf/commit/272c110a9cd3a194d2fdeaf1d620b14b29330b30))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-05)

### Bug Fixes

- improve handling of offline remotes ([3ae596e](https://github.com/module-federation/nextjs-mf/commit/3ae596ee82d2ccf0d828d7928cbdc4fbec509d55))
- patch share scope on client server ([fc7f82f](https://github.com/module-federation/nextjs-mf/commit/fc7f82fd1f299a078552ce811d074b816e796109))
- patch share scope on client server ([b4461fd](https://github.com/module-federation/nextjs-mf/commit/b4461fdbe6999390cbf4b57c18c537563cf04cc9))
- patch share scope on client server ([31b4c24](https://github.com/module-federation/nextjs-mf/commit/31b4c24112e27630b588410d9d78e89acc579d26))
- patch share scope on client server ([272c110](https://github.com/module-federation/nextjs-mf/commit/272c110a9cd3a194d2fdeaf1d620b14b29330b30))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

- `node` updated to version `0.4.2`
- `utils` updated to version `0.0.4`

### Bug Fixes

- removing debug loggers from child federation plugin hooks ([00deec7](https://github.com/module-federation/nextjs-mf/commit/00deec72585675591ad39f64f0c5f94355f4bd53))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

- `node` updated to version `0.4.2`
- `utils` updated to version `0.0.4`

### Bug Fixes

- removing debug loggers from child federation plugin hooks ([00deec7](https://github.com/module-federation/nextjs-mf/commit/00deec72585675591ad39f64f0c5f94355f4bd53))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

- `node` updated to version `0.4.2`
- `utils` updated to version `0.0.4`

### Bug Fixes

- removing debug loggers from child federation plugin hooks ([00deec7](https://github.com/module-federation/nextjs-mf/commit/00deec72585675591ad39f64f0c5f94355f4bd53))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

- `node` updated to version `0.4.2`
- `utils` updated to version `0.0.4`

### Bug Fixes

- removing debug loggers from child federation plugin hooks ([00deec7](https://github.com/module-federation/nextjs-mf/commit/00deec72585675591ad39f64f0c5f94355f4bd53))
- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

- `node` updated to version `0.4.2`
- `utils` updated to version `0.0.4`

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

- `node` updated to version `0.4.2`
- `utils` updated to version `0.0.4`

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [5.7.1](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-5.7.0...nextjs-mf-5.7.1) (2022-10-04)

### Dependency Updates

- `node` updated to version `0.4.1`
- `utils` updated to version `0.0.4`

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [5.6.4](https://github.com/module-federation/nextjs-mf/compare/nextjs-mf-0.1.0...nextjs-mf-5.6.4) (2022-10-04)

### Dependency Updates

- `node` updated to version `0.1.0`
- `utils` updated to version `0.0.1`

# 0.1.0 (2022-10-04)

### Dependency Updates

- `node` updated to version `0.1.0`
- `utils` updated to version `0.0.1`

### Bug Fixes

- **fixing chunk naming prefixes on server builds:** fix server name prefix on chunks ([7839713](https://github.com/module-federation/nextjs-mf/commit/78397136d3bf6677c1eae895853cbe36202125c3))
- SSR files not getting generated when enabled ([#227](https://github.com/module-federation/nextjs-mf/issues/227)) ([a5f476a](https://github.com/module-federation/nextjs-mf/commit/a5f476aeee2dd42e75ef5f3217791308f1515634)), closes [#226](https://github.com/module-federation/nextjs-mf/issues/226)

### Features

- **chunk flushing:** enable Chunk Flushing for SSR, includes both plugin utils and React utils ([4e99290](https://github.com/module-federation/nextjs-mf/commit/4e99290d365cb46873eda052fb006172e99e4b24)), closes [#133](https://github.com/module-federation/nextjs-mf/issues/133)
- Move Repo to NX ([#154](https://github.com/module-federation/nextjs-mf/issues/154)) ([d2a4dfa](https://github.com/module-federation/nextjs-mf/commit/d2a4dfac7fcdaa2b6a21e3d2973808d01649da61)), closes [#199](https://github.com/module-federation/nextjs-mf/issues/199) [#205](https://github.com/module-federation/nextjs-mf/issues/205) [#144](https://github.com/module-federation/nextjs-mf/issues/144) [#212](https://github.com/module-federation/nextjs-mf/issues/212)
- update the `next` peer dep in nextjs-mf ([#221](https://github.com/module-federation/nextjs-mf/issues/221)) ([d9b1677](https://github.com/module-federation/nextjs-mf/commit/d9b16776b1c4ed61e6c0e0414ed452d7312c1806))
