# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [2.0.6](https://github.com/module-federation/nextjs-mf/compare/utils-2.0.5...utils-2.0.6) (2023-08-14)


### Bug Fixes

* workaround to self ref module error in prod ([e134caa](https://github.com/module-federation/nextjs-mf/commit/e134caa9a914da6a226e73dc877a108456b1053f))



## [2.0.5](https://github.com/module-federation/nextjs-mf/compare/utils-2.0.4...utils-2.0.5) (2023-08-11)


### Bug Fixes

* improve import ordering ([#1199](https://github.com/module-federation/nextjs-mf/issues/1199)) ([7354ed2](https://github.com/module-federation/nextjs-mf/commit/7354ed2b412bd9fd8745778e5212e10e8a3bf17f))



## [2.0.4](https://github.com/module-federation/nextjs-mf/compare/utils-2.0.3...utils-2.0.4) (2023-07-19)



## [2.0.3](https://github.com/module-federation/nextjs-mf/compare/utils-2.0.2...utils-2.0.3) (2023-07-19)


### Bug Fixes

* Fix call undefined delegate ([#1149](https://github.com/module-federation/nextjs-mf/issues/1149)) ([87a5896](https://github.com/module-federation/nextjs-mf/commit/87a5896221a726578c3433071755fba3465824f4)), closes [#1151](https://github.com/module-federation/nextjs-mf/issues/1151)



## [2.0.2](https://github.com/module-federation/nextjs-mf/compare/utils-2.0.1...utils-2.0.2) (2023-07-18)



## [2.0.1](https://github.com/module-federation/nextjs-mf/compare/utils-2.0.0...utils-2.0.1) (2023-07-17)



## [2.0.1](https://github.com/module-federation/nextjs-mf/compare/utils-2.0.0...utils-2.0.1) (2023-07-17)



# [2.0.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.9.1...utils-2.0.0) (2023-07-01)


### Features

* Next Federation 7 ([#726](https://github.com/module-federation/nextjs-mf/issues/726)) ([d50ca1e](https://github.com/module-federation/nextjs-mf/commit/d50ca1e4636c4e0a402190f6e9c3f69ed9ec8eac)), closes [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#835](https://github.com/module-federation/nextjs-mf/issues/835) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#871](https://github.com/module-federation/nextjs-mf/issues/871) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#872](https://github.com/module-federation/nextjs-mf/issues/872) [#875](https://github.com/module-federation/nextjs-mf/issues/875) [#884](https://github.com/module-federation/nextjs-mf/issues/884) [#887](https://github.com/module-federation/nextjs-mf/issues/887) [#893](https://github.com/module-federation/nextjs-mf/issues/893) [#885](https://github.com/module-federation/nextjs-mf/issues/885) [#899](https://github.com/module-federation/nextjs-mf/issues/899) [#904](https://github.com/module-federation/nextjs-mf/issues/904) [#932](https://github.com/module-federation/nextjs-mf/issues/932) [#936](https://github.com/module-federation/nextjs-mf/issues/936) [#959](https://github.com/module-federation/nextjs-mf/issues/959) [#960](https://github.com/module-federation/nextjs-mf/issues/960) [#969](https://github.com/module-federation/nextjs-mf/issues/969) [#971](https://github.com/module-federation/nextjs-mf/issues/971) [#974](https://github.com/module-federation/nextjs-mf/issues/974) [#984](https://github.com/module-federation/nextjs-mf/issues/984) [#986](https://github.com/module-federation/nextjs-mf/issues/986) [#1015](https://github.com/module-federation/nextjs-mf/issues/1015) [#1086](https://github.com/module-federation/nextjs-mf/issues/1086) [#1084](https://github.com/module-federation/nextjs-mf/issues/1084)


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



## [1.9.2-rc.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.9.2-rc.0...utils-1.9.2-rc.1) (2023-07-01)


### Features

* support edge workers ([#1084](https://github.com/module-federation/nextjs-mf/issues/1084)) ([3f5df94](https://github.com/module-federation/nextjs-mf/commit/3f5df944ea787cf958fd4cf7fabed84432a50a10))



## [1.9.2-rc.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.9.1...utils-1.9.2-rc.0) (2023-06-30)



## [1.8.2-rc8.2](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.2-rc8.1...utils-1.8.2-rc8.2) (2023-06-28)



## [1.8.2-rc8.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.2-rc8.0...utils-1.8.2-rc8.1) (2023-06-28)


### Bug Fixes

* disable flushing remotes to ssr for now ([6c5cfae](https://github.com/module-federation/nextjs-mf/commit/6c5cfaec3be94aeb3f1e12c24965b3904da23bae))



## [1.8.2-rc8.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.2-rc7.1...utils-1.8.2-rc8.0) (2023-06-27)



## [1.8.2-rc7.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.2-rc7.0...utils-1.8.2-rc7.1) (2023-06-27)



## [1.8.2-rc7.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.2-rc6.0...utils-1.8.2-rc7.0) (2023-06-27)



## [1.8.2-rc6.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.2-rc5.0...utils-1.8.2-rc6.0) (2023-06-23)



## [1.8.2-rc5.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.2-rc4.0...utils-1.8.2-rc5.0) (2023-06-23)



## [1.8.2-rc4.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.2-rc3.1...utils-1.8.2-rc4.0) (2023-06-21)


### Bug Fixes

* Resolve condition names ([#974](https://github.com/module-federation/nextjs-mf/issues/974)) ([5e8b49c](https://github.com/module-federation/nextjs-mf/commit/5e8b49cf60f19dae6be4818a1c0ff783c7689393))
* Runtime module checking ([#969](https://github.com/module-federation/nextjs-mf/issues/969)) ([b5c7af1](https://github.com/module-federation/nextjs-mf/commit/b5c7af1697a63d9e19f901238a4c0382ea0c3f50))



## [1.8.2-rc3.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.2-rc3.0...utils-1.8.2-rc3.1) (2023-06-09)


### Bug Fixes

* Path loader patches ([#960](https://github.com/module-federation/nextjs-mf/issues/960)) ([d362a77](https://github.com/module-federation/nextjs-mf/commit/d362a7752c4364cc499a27f2b6eeb5399543cb29))



## [1.8.2-rc3.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.2-beta.0...utils-1.8.2-rc3.0) (2023-06-09)



## [1.8.2-beta.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.1...utils-1.8.2-beta.0) (2023-05-26)



## [1.8.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.1-rc1.0...utils-1.8.1) (2023-05-26)


### Bug Fixes

* Improve chunk correlation ([#936](https://github.com/module-federation/nextjs-mf/issues/936)) ([4dad1eb](https://github.com/module-federation/nextjs-mf/commit/4dad1eb370feacd6ecb4c1726c435d5c579f424d))



## [1.8.1-rc1.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.1-rc.1...utils-1.8.1-rc1.0) (2023-05-25)



## [1.8.1-rc.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.1-rc.0...utils-1.8.1-rc.1) (2023-05-23)



## [1.8.1-rc.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.0...utils-1.8.1-rc.0) (2023-05-23)


### Bug Fixes

* client prod build issues ([#899](https://github.com/module-federation/nextjs-mf/issues/899)) ([470d7ad](https://github.com/module-federation/nextjs-mf/commit/470d7ad408ae8d64dbccc5a9528eaa2ed60fa2ca))
* externalization and missing runtime chunks ([#887](https://github.com/module-federation/nextjs-mf/issues/887)) ([c79cd62](https://github.com/module-federation/nextjs-mf/commit/c79cd6226d3134f1d6294cd8eba40c8c33af5cb5))



## [1.7.6-rc.2](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.6-rc.1...utils-1.7.6-rc.2) (2023-05-17)



## [1.7.6-rc.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.6-rc.0...utils-1.7.6-rc.1) (2023-05-17)



## [1.7.6-rc.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.6-beta.2...utils-1.7.6-rc.0) (2023-05-16)



## [1.7.6-beta.2](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.6-beta.1...utils-1.7.6-beta.2) (2023-05-16)



## [1.7.6-beta.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.6-beta.0...utils-1.7.6-beta.1) (2023-05-16)



## [1.7.6-beta.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.5...utils-1.7.6-beta.0) (2023-05-16)



## [1.7.5](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.5-beta.0...utils-1.7.5) (2023-05-16)



## [1.7.5-beta.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.4...utils-1.7.5-beta.0) (2023-05-16)


### Bug Fixes

* Improved Share Scope Properties and Fixed Production Build Issues ([#884](https://github.com/module-federation/nextjs-mf/issues/884)) ([de7b2ce](https://github.com/module-federation/nextjs-mf/commit/de7b2cec7518f6b069818a511275e359c616bb73))



## [1.7.4](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.3...utils-1.7.4) (2023-05-16)



## [1.7.3](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.3-beta.0...utils-1.7.3) (2023-05-13)



## [1.7.3-beta.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.2...utils-1.7.3-beta.0) (2023-05-13)


### Features

* [v7] Async boundary runtime ([#835](https://github.com/module-federation/nextjs-mf/issues/835)) ([840e3b5](https://github.com/module-federation/nextjs-mf/commit/840e3b5bddfbb99b5d8d0f5f24bf5e179e8b52ad)), closes [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864)


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



## [1.7.2](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.2-beta.0...utils-1.7.2) (2023-05-03)



## [1.7.2-beta.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.1...utils-1.7.2-beta.0) (2023-05-03)



## [1.7.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.1-beta.0...utils-1.7.1) (2023-04-28)



## [1.7.1-beta.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.0...utils-1.7.1-beta.0) (2023-04-28)


### Features

* Improve module chunk connections ([#802](https://github.com/module-federation/nextjs-mf/issues/802)) ([ce0bd7b](https://github.com/module-federation/nextjs-mf/commit/ce0bd7b16e080f712e6db0bdcd3955a8167c274f)), closes [#803](https://github.com/module-federation/nextjs-mf/issues/803) [#808](https://github.com/module-federation/nextjs-mf/issues/808) [#811](https://github.com/module-federation/nextjs-mf/issues/811)



## [1.5.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.5.1-beta.0...utils-1.5.1) (2023-04-19)



## [1.5.1-beta.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.5.0...utils-1.5.1-beta.0) (2023-04-19)


### Bug Fixes

*  use container proxy on script VM instead of host resolver point ([2929d0f](https://github.com/module-federation/nextjs-mf/commit/2929d0f64d4b8edf268af5ca83f807a02b121861))
* cache busting and async quirks when mixing delegates ([1fc6e67](https://github.com/module-federation/nextjs-mf/commit/1fc6e67ee33a3efb53ff59d2b3ac333f1d42a158))
* get delegates working ([#527](https://github.com/module-federation/nextjs-mf/issues/527)) ([7655568](https://github.com/module-federation/nextjs-mf/commit/7655568fcef8dbfda40573deb5d3d029c101074c))
* improved asset pipeline ([63928b2](https://github.com/module-federation/nextjs-mf/commit/63928b28150c2c4e3adb9e14fb7aa54f5cf1578d))
* peer dependencies metadata ([d3a2ed0](https://github.com/module-federation/nextjs-mf/commit/d3a2ed0e378b59afdeb632d1e2e0290f05cbca19))
* put error triggers if delegates are passed non-primitives ([2469383](https://github.com/module-federation/nextjs-mf/commit/2469383de68a8b6ffb7375ad335a2039e563fd71))
* use EntryPlugin for injection of remotes ([e522c5a](https://github.com/module-federation/nextjs-mf/commit/e522c5ad2b7adcbd6c39f9c5fdb7a3e418277b7a))


### Features

* chunk flushing in delegates ([07aebc4](https://github.com/module-federation/nextjs-mf/commit/07aebc428166b3f19bb49071fa6745ed705413b8))
* chunk flushing in delegates ([f8b8af6](https://github.com/module-federation/nextjs-mf/commit/f8b8af6e9e748605dd55d19ae50b0d60b1b0a83f))
* chunk flushing in delegates ([5e2375f](https://github.com/module-federation/nextjs-mf/commit/5e2375f598437803105ac4bc2237f6b652554d00))
* delegate module support ([18c9491](https://github.com/module-federation/nextjs-mf/commit/18c94914e5429584e66be49d92781b781adddb38))
* delegate module support ([8dd154c](https://github.com/module-federation/nextjs-mf/commit/8dd154c261b34183b12250ce204904cd3e085658))
* delegates part two ([1be2686](https://github.com/module-federation/nextjs-mf/commit/1be2686624798a7df9f447b48279294985b3f592))
* implement basic single runtime ([2432c3e](https://github.com/module-federation/nextjs-mf/commit/2432c3ec553759ca24d17a46b696c1123a86ec5a))
* improve chunk correlation ([22d8afc](https://github.com/module-federation/nextjs-mf/commit/22d8afccff101044fcdeba390656950dbc6eafed))
* new chunk flushing system for exposed modules ([97a75d8](https://github.com/module-federation/nextjs-mf/commit/97a75d8702f2ddc5e12cff2ac4d24aca1df6f990))
* prepare for v7 ([7bc4b3b](https://github.com/module-federation/nextjs-mf/commit/7bc4b3bd44e0926a52d6a9cbe56f0c4d7bb700ae))
* support dynamic containers on server ([a2a81dd](https://github.com/module-federation/nextjs-mf/commit/a2a81dd4d54da55dfc132583d9e0d7c75771fb4c))


### BREAKING CHANGES

* safety breaking change note
BREAKING_CHANGE: safety breaking change note



## [1.9.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.9.0...utils-1.9.1) (2023-06-30)



# [1.9.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.0...utils-1.9.0) (2023-06-29)


### Bug Fixes

* use react.lazy instead of next/dynamic ([#951](https://github.com/module-federation/nextjs-mf/issues/951)) ([a27ff6e](https://github.com/module-federation/nextjs-mf/commit/a27ff6eb28acd93a7fcd8a011f76bd65e18d6b1f))
* **Utils:** Unable to use importRemote util for root exported modules ([#970](https://github.com/module-federation/nextjs-mf/issues/970)) ([7bf6ecb](https://github.com/module-federation/nextjs-mf/commit/7bf6ecb602958ab5991d9c18f17e3d3755d84e91))



## [1.8.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.8.0...utils-1.8.1) (2023-06-28)


### Bug Fixes

* use react.lazy instead of next/dynamic ([#951](https://github.com/module-federation/nextjs-mf/issues/951)) ([a27ff6e](https://github.com/module-federation/nextjs-mf/commit/a27ff6eb28acd93a7fcd8a011f76bd65e18d6b1f))
* **Utils:** Unable to use importRemote util for root exported modules ([#970](https://github.com/module-federation/nextjs-mf/issues/970)) ([7bf6ecb](https://github.com/module-federation/nextjs-mf/commit/7bf6ecb602958ab5991d9c18f17e3d3755d84e91))



# [1.8.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.7.0...utils-1.8.0) (2023-05-22)


### Bug Fixes

* [#827](https://github.com/module-federation/nextjs-mf/issues/827) ([3e4268f](https://github.com/module-federation/nextjs-mf/commit/3e4268fc6c9719f993037de42784e426ddb5305a))


### Features

* **website:** initial version of module federation website ([#751](https://github.com/module-federation/nextjs-mf/issues/751)) ([9b4ec04](https://github.com/module-federation/nextjs-mf/commit/9b4ec048652f0d2237e9401912ead7c5bbe060c4))



# [1.7.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.6.0...utils-1.7.0) (2023-04-27)


### Features

* add storybook addon that supports Module Federation remote containers ([#598](https://github.com/module-federation/nextjs-mf/issues/598)) ([7547b02](https://github.com/module-federation/nextjs-mf/commit/7547b02937fdef2831060d6a7bfd337d2cc3355c))
* release to npm with next tag to not ruine latest one ([#763](https://github.com/module-federation/nextjs-mf/issues/763)) ([f2d199b](https://github.com/module-federation/nextjs-mf/commit/f2d199b3b3fbbd428514b1ce1f139efc82f7fff0))



# [1.6.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.5.0...utils-1.6.0) (2023-04-19)



## [1.5.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.5.0...utils-1.5.1) (2023-04-19)



# [1.5.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.4.1...utils-1.5.0) (2023-04-09)


### Features

* Allow Container Utils to work Server Side ([#723](https://github.com/module-federation/nextjs-mf/issues/723)) ([232ba24](https://github.com/module-federation/nextjs-mf/commit/232ba24072f19bd32d1f745d4edf1518e548df50))



## [1.4.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.4.0...utils-1.4.1) (2023-04-05)



# [1.4.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.3.0...utils-1.4.0) (2023-03-14)


### Features

* Medusa Support in NextFederationPlugin ([#609](https://github.com/module-federation/nextjs-mf/issues/609)) ([0bbba38](https://github.com/module-federation/nextjs-mf/commit/0bbba384c45b7d149b7a6be2dfbe9851b541b528)), closes [#606](https://github.com/module-federation/nextjs-mf/issues/606)



# [1.3.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.2.1...utils-1.3.0) (2023-02-09)


### Features

* Delegate Modules ([#509](https://github.com/module-federation/nextjs-mf/issues/509)) ([1a085e7](https://github.com/module-federation/nextjs-mf/commit/1a085e7e03ca0afd5c64389b4b169f3db3382f6b))



## [1.2.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.2.0...utils-1.2.1) (2023-02-09)


### Bug Fixes

* **federation-boundary:** make custom boundary optional ([#570](https://github.com/module-federation/nextjs-mf/issues/570)) ([e43a387](https://github.com/module-federation/nextjs-mf/commit/e43a387f90587d62a78c40584ed9104328202f8e))
* **utilities:** fix FederationBoundary implementation ([#575](https://github.com/module-federation/nextjs-mf/issues/575)) ([b94fc28](https://github.com/module-federation/nextjs-mf/commit/b94fc282503c4f5ce2ae267518f7d6f5d4746c24))



# [1.2.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.1.2...utils-1.2.0) (2023-01-31)

### Bug Fixes

- **typescript:** throw error when `vue-tsc` is requested and is not available ([#547](https://github.com/module-federation/nextjs-mf/issues/547)) ([c6f7998](https://github.com/module-federation/nextjs-mf/commit/c6f79981f84fd0042447037c1323fa750566ac0d))

### Features

- add getModule and getContainer to utilities ([#476](https://github.com/module-federation/nextjs-mf/issues/476)) ([fe381e3](https://github.com/module-federation/nextjs-mf/commit/fe381e33cfb20b3b723daffca2f5c4fb4b843cfb))
- **typescript:** support vue typescript compiler ([#542](https://github.com/module-federation/nextjs-mf/issues/542)) ([cde5952](https://github.com/module-federation/nextjs-mf/commit/cde5952c42ec19f87c5bc4dddb8d8be6f97c1c55)), closes [#502](https://github.com/module-federation/nextjs-mf/issues/502)

## [1.1.2](https://github.com/module-federation/nextjs-mf/compare/utils-1.1.1...utils-1.1.2) (2023-01-21)

### Bug Fixes

- Utilities - Remove module side effect ([#488](https://github.com/module-federation/nextjs-mf/issues/488)) ([3554de7](https://github.com/module-federation/nextjs-mf/commit/3554de7912eaf7b379a6a863677c4b01da0ccf2c)), closes [#487](https://github.com/module-federation/nextjs-mf/issues/487) [#500](https://github.com/module-federation/nextjs-mf/issues/500) [#496](https://github.com/module-federation/nextjs-mf/issues/496) [#495](https://github.com/module-federation/nextjs-mf/issues/495) [#492](https://github.com/module-federation/nextjs-mf/issues/492) [#455](https://github.com/module-federation/nextjs-mf/issues/455) [#491](https://github.com/module-federation/nextjs-mf/issues/491) [#496](https://github.com/module-federation/nextjs-mf/issues/496) [#495](https://github.com/module-federation/nextjs-mf/issues/495)

## [1.1.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.1.0...utils-1.1.1) (2023-01-11)

# [1.1.0](https://github.com/module-federation/nextjs-mf/compare/utils-1.0.4...utils-1.1.0) (2022-12-30)

### Bug Fixes

- **utilities:** move tslib from peer deps into deps ([#474](https://github.com/module-federation/nextjs-mf/issues/474)) ([792806c](https://github.com/module-federation/nextjs-mf/commit/792806c805c746cd681d6345bec88a47462cb26f))
- **utilities:** set webpack peer dep to ^5.40.0 ([#473](https://github.com/module-federation/nextjs-mf/issues/473)) ([d1ae77e](https://github.com/module-federation/nextjs-mf/commit/d1ae77e63993b6f67d329bce5a30d04776a02b76))

### Features

- Utilities - Add async callback to importRemote ([#459](https://github.com/module-federation/nextjs-mf/issues/459)) ([508d83c](https://github.com/module-federation/nextjs-mf/commit/508d83ca1060e1fcc80cde44978b186bdf1feefc)), closes [#461](https://github.com/module-federation/nextjs-mf/issues/461) [#451](https://github.com/module-federation/nextjs-mf/issues/451) [#463](https://github.com/module-federation/nextjs-mf/issues/463)

## [1.0.4](https://github.com/module-federation/nextjs-mf/compare/utils-1.0.3...utils-1.0.4) (2022-12-29)

## [1.0.3](https://github.com/module-federation/nextjs-mf/compare/utils-1.0.2...utils-1.0.3) (2022-12-27)

### Bug Fixes

- bad references to webpack globals ([#458](https://github.com/module-federation/nextjs-mf/issues/458)) ([8ef224b](https://github.com/module-federation/nextjs-mf/commit/8ef224bd08f1e39475cac3795f09debae50bbc0f))

## [1.0.2](https://github.com/module-federation/nextjs-mf/compare/utils-1.0.1...utils-1.0.2) (2022-12-27)

## [1.0.1](https://github.com/module-federation/nextjs-mf/compare/utils-1.0.0...utils-1.0.1) (2022-11-20)

# [1.0.0](https://github.com/module-federation/nextjs-mf/compare/utils-0.5.0...utils-1.0.0) (2022-11-20)

### Features

- **typescript:** excessive recompilation prevention ([#306](https://github.com/module-federation/nextjs-mf/issues/306)) ([6e1967f](https://github.com/module-federation/nextjs-mf/commit/6e1967f019afb25dfbcfe83627b08ae8b1fe97b2))

### BREAKING CHANGES

- **typescript:** Reimplemented the whole plugin from round-up to enhance performance, prevent excessive recompilation and other issues.

Some key changes to the plugin includes:

- Downloading remote types before compilation starts.
- Caching remote types for better performance.
- Ability to provide Plugin options.

Please go through plugin `readme.md` file to understand what's changed and how to use the plugin.

# [1.0.0](https://github.com/module-federation/nextjs-mf/compare/utils-0.5.0...utils-1.0.0) (2022-11-20)

### Features

- **typescript:** excessive recompilation prevention ([#306](https://github.com/module-federation/nextjs-mf/issues/306)) ([6e1967f](https://github.com/module-federation/nextjs-mf/commit/6e1967f019afb25dfbcfe83627b08ae8b1fe97b2))

### BREAKING CHANGES

- **typescript:** Reimplemented the whole plugin from round-up to enhance performance, prevent excessive recompilation and other issues.

Some key changes to the plugin includes:

- Downloading remote types before compilation starts.
- Caching remote types for better performance.
- Ability to provide Plugin options.

Please go through plugin `readme.md` file to understand what's changed and how to use the plugin.

# [0.5.0](https://github.com/module-federation/nextjs-mf/compare/utils-0.4.1...utils-0.5.0) (2022-10-31)

### Features

- **utils:** configurable logger using webpack infrastructure logger ([#355](https://github.com/module-federation/nextjs-mf/issues/355)) ([d6ffcd0](https://github.com/module-federation/nextjs-mf/commit/d6ffcd0de1662c410f33a7742db1fd02aba24aef)), closes [#243](https://github.com/module-federation/nextjs-mf/issues/243)

## [0.4.1](https://github.com/module-federation/nextjs-mf/compare/utils-0.4.0...utils-0.4.1) (2022-10-26)

### Bug Fixes

- set peer dependencies ([#341](https://github.com/module-federation/nextjs-mf/issues/341)) ([fec9608](https://github.com/module-federation/nextjs-mf/commit/fec960813a4e3859a5fb24863bb55e463a2fdfa3))

# [0.4.0](https://github.com/module-federation/nextjs-mf/compare/utils-0.3.4...utils-0.4.0) (2022-10-26)

### Features

- Automatic Async boundary loader ([#330](https://github.com/module-federation/nextjs-mf/issues/330)) ([7e3c08c](https://github.com/module-federation/nextjs-mf/commit/7e3c08cf7835c0407bdce7ed6865b864153074a4))

## [0.3.4](https://github.com/module-federation/nextjs-mf/compare/utils-0.3.3...utils-0.3.4) (2022-10-17)

### Bug Fixes

- remove exports field from package.json ([#318](https://github.com/module-federation/nextjs-mf/issues/318)) ([a9148ae](https://github.com/module-federation/nextjs-mf/commit/a9148ae27f1c05fe4c1586ed5769c79054a7033e))

## [0.3.3](https://github.com/module-federation/nextjs-mf/compare/utils-0.3.2...utils-0.3.3) (2022-10-13)

### Bug Fixes

- **typescript:** fix exposePages type ([#309](https://github.com/module-federation/nextjs-mf/issues/309)) ([c0be839](https://github.com/module-federation/nextjs-mf/commit/c0be839787f97c5e23cea3d7cf501caaa469972f))

## [0.3.2](https://github.com/module-federation/nextjs-mf/compare/utils-0.3.1...utils-0.3.2) (2022-10-12)

## [0.3.1](https://github.com/module-federation/nextjs-mf/compare/utils-0.3.0...utils-0.3.1) (2022-10-11)

# [0.3.0](https://github.com/module-federation/nextjs-mf/compare/utils-0.2.1...utils-0.3.0) (2022-10-07)

### Features

- implement **webpack_require**.l functionality in server builds ([99d1231](https://github.com/module-federation/nextjs-mf/commit/99d12314f68ac526000fa5410a14072a11b260a4))

## [0.2.1](https://github.com/module-federation/nextjs-mf/compare/utils-0.2.0...utils-0.2.1) (2022-10-07)

### Bug Fixes

- fix node plugin fs augments when outside next child compiler ([#284](https://github.com/module-federation/nextjs-mf/issues/284)) ([dfa99c8](https://github.com/module-federation/nextjs-mf/commit/dfa99c86fdd8d73091764532d52be5f81b89a508))
- **package.json:** fix package export fields for utils ([#285](https://github.com/module-federation/nextjs-mf/issues/285)) ([99d6b77](https://github.com/module-federation/nextjs-mf/commit/99d6b779696b5dbebea9cf3c870a5caa5d9d7c6f))

## [0.2.1](https://github.com/module-federation/nextjs-mf/compare/utils-0.2.0...utils-0.2.1) (2022-10-07)

### Bug Fixes

- fix node plugin fs augments when outside next child compiler ([#284](https://github.com/module-federation/nextjs-mf/issues/284)) ([dfa99c8](https://github.com/module-federation/nextjs-mf/commit/dfa99c86fdd8d73091764532d52be5f81b89a508))
- **package.json:** fix package export fields for utils ([#285](https://github.com/module-federation/nextjs-mf/issues/285)) ([99d6b77](https://github.com/module-federation/nextjs-mf/commit/99d6b779696b5dbebea9cf3c870a5caa5d9d7c6f))

## [0.2.1](https://github.com/module-federation/nextjs-mf/compare/utils-0.2.0...utils-0.2.1) (2022-10-06)

### Bug Fixes

- fix node plugin fs augments when outside next child compiler ([#284](https://github.com/module-federation/nextjs-mf/issues/284)) ([dfa99c8](https://github.com/module-federation/nextjs-mf/commit/dfa99c86fdd8d73091764532d52be5f81b89a508))
- **package.json:** fix package export fields for utils ([#285](https://github.com/module-federation/nextjs-mf/issues/285)) ([99d6b77](https://github.com/module-federation/nextjs-mf/commit/99d6b779696b5dbebea9cf3c870a5caa5d9d7c6f))

## [0.2.1](https://github.com/module-federation/nextjs-mf/compare/utils-0.2.0...utils-0.2.1) (2022-10-06)

### Bug Fixes

- fix node plugin fs augments when outside next child compiler ([#284](https://github.com/module-federation/nextjs-mf/issues/284)) ([dfa99c8](https://github.com/module-federation/nextjs-mf/commit/dfa99c86fdd8d73091764532d52be5f81b89a508))

# [0.2.0](https://github.com/module-federation/nextjs-mf/compare/utils-0.1.0...utils-0.2.0) (2022-10-06)

## [0.1.1](https://github.com/module-federation/nextjs-mf/compare/utils-0.1.0...utils-0.1.1) (2022-10-06)

## [0.1.1](https://github.com/module-federation/nextjs-mf/compare/utils-0.1.0...utils-0.1.1) (2022-10-06)

## [0.1.1](https://github.com/module-federation/nextjs-mf/compare/utils-0.1.0...utils-0.1.1) (2022-10-06)

## [0.1.1](https://github.com/module-federation/nextjs-mf/compare/utils-0.1.0...utils-0.1.1) (2022-10-06)

# [0.2.0](https://github.com/module-federation/nextjs-mf/compare/utils-0.1.0...utils-0.2.0) (2022-10-05)

# [0.1.0](https://github.com/module-federation/nextjs-mf/compare/utils-0.0.3...utils-0.1.0) (2022-10-05)

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.0.4](https://github.com/module-federation/nextjs-mf/compare/utils-0.0.3...utils-0.0.4) (2022-10-05)

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.0.4](https://github.com/module-federation/nextjs-mf/compare/utils-0.0.3...utils-0.0.4) (2022-10-05)

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.0.4](https://github.com/module-federation/nextjs-mf/compare/utils-0.0.3...utils-0.0.4) (2022-10-04)

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.0.4](https://github.com/module-federation/nextjs-mf/compare/utils-0.0.3...utils-0.0.4) (2022-10-04)

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.0.4](https://github.com/module-federation/nextjs-mf/compare/utils-0.0.3...utils-0.0.4) (2022-10-04)

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## [0.0.5](https://github.com/module-federation/nextjs-mf/compare/utils-0.0.4...utils-0.0.5) (2022-10-04)

## [0.0.4](https://github.com/module-federation/nextjs-mf/compare/utils-0.0.3...utils-0.0.4) (2022-10-04)

### Bug Fixes

- **update versions:** bumping versions ([f72209a](https://github.com/module-federation/nextjs-mf/commit/f72209ae070fb50c9d317e764caf872facd4b887))

## 0.0.1 (2022-10-04)

## [0.0.2](https://github.com/module-federation/nextjs-mf/compare/utils-0.0.1...utils-0.0.2) (2022-09-29)

## 0.0.1 (2022-09-29)

## 0.0.1 (2022-09-29)
