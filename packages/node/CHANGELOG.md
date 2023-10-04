# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [2.0.2-beta.5](https://github.com/module-federation/nextjs-mf/compare/node-2.0.2-beta.4...node-2.0.2-beta.5) (2023-10-04)


### Bug Fixes

* remove logs from flush chunks ([b7d317c](https://github.com/module-federation/nextjs-mf/commit/b7d317c4b2b0eda2f3530315dbf471289fa6918b))



## [2.0.2-beta.4](https://github.com/module-federation/nextjs-mf/compare/node-2.0.2-beta.3...node-2.0.2-beta.4) (2023-10-03)



## [2.0.2-beta.3](https://github.com/module-federation/nextjs-mf/compare/node-2.0.2-beta.2...node-2.0.2-beta.3) (2023-10-03)


### Bug Fixes

* add exported file ([19b1afb](https://github.com/module-federation/nextjs-mf/commit/19b1afbd58572897f36b16926f841e35d154c712))
* bad impleentation during federation port ([cc2e53f](https://github.com/module-federation/nextjs-mf/commit/cc2e53f0351fb94c9068223ad6b8d990a913ab53))
* chunk flushing ([c9df545](https://github.com/module-federation/nextjs-mf/commit/c9df5451c84e6458b392884492bf669bf7383d5c))
* dont crash offline remotes ([f0d7671](https://github.com/module-federation/nextjs-mf/commit/f0d7671569ac34f64017a303739b54880f5220e6))
* export parseRemotes ([12ed54c](https://github.com/module-federation/nextjs-mf/commit/12ed54c87ba539bc2a79cdee86058f0a2776653e))
* hot reloading system ([99f733b](https://github.com/module-federation/nextjs-mf/commit/99f733bbdbd727a99fbaaeab3f92f4b65fa568dd))
* remove logger in filesystem ([c370ed5](https://github.com/module-federation/nextjs-mf/commit/c370ed5fdc5fe3423703f29daa40a4227ac51cf2))
* remove logging on DFS ([40b8c28](https://github.com/module-federation/nextjs-mf/commit/40b8c28fac9c39fec8623415a36e487152c2ef34))
* search registry for both ident and unique name ([f22dc25](https://github.com/module-federation/nextjs-mf/commit/f22dc25e5a6374273b1bc51b0e101b57226c5906))
* simplify template ([b4e633b](https://github.com/module-federation/nextjs-mf/commit/b4e633b6624264456800bc7351c6d815430d42b5))
* stats plugin updates ([c1db325](https://github.com/module-federation/nextjs-mf/commit/c1db325d3311b2126964f4ad2ddbfa9d82a50674))
* ts in template string ([0edbbea](https://github.com/module-federation/nextjs-mf/commit/0edbbeaa42503237b88132252e29a34a79bade51))
* ts in template string ([9b8f652](https://github.com/module-federation/nextjs-mf/commit/9b8f652f96bf6f29d5fc238bb616e19187158a57))


### Features

* create and expose AutomaticPublicPathPlugin.ts ([9d0fcdd](https://github.com/module-federation/nextjs-mf/commit/9d0fcdd2e36fae971f2eec3269980baedf276b35))
* improve options logic in node federation plugin ([b69b70d](https://github.com/module-federation/nextjs-mf/commit/b69b70d200c63e3557089e8a0669fc43330c988c))
* improved async init ([bb19b07](https://github.com/module-federation/nextjs-mf/commit/bb19b07b5be1bbc28bd6b049ea7aea6510ad17a2))
* improved async init ([019694e](https://github.com/module-federation/nextjs-mf/commit/019694e55fe1f6bebfdab0701bf9087bf0034b8f))
* Static fallback to non auto public path ([3c58780](https://github.com/module-federation/nextjs-mf/commit/3c587809f1e936fba291eab3d7c790115be5102c))
* support vmok conventions ([0501da8](https://github.com/module-federation/nextjs-mf/commit/0501da86eaaab6ea79a3397c2c683086cc591309))
* support vmok conventions ([d53b586](https://github.com/module-federation/nextjs-mf/commit/d53b5867719eb7fff32bee2edd3255023d598f44))
* Use enhanced Federation Plugin ([e021d66](https://github.com/module-federation/nextjs-mf/commit/e021d6667996962f154137d164bed13f53a6a135))



## [2.0.2-beta.2](https://github.com/module-federation/nextjs-mf/compare/node-2.0.2-beta.1...node-2.0.2-beta.2) (2023-09-15)

### Bug Fixes

- Auto Public Path, detect multiple output targets ([65f17b1](https://github.com/module-federation/nextjs-mf/commit/65f17b189f37e0ad9e72bb0bf04463e9c5455929))
- ensure custom FS works with target: node or async node preset ([a08fcab](https://github.com/module-federation/nextjs-mf/commit/a08fcab7dde903966d34be9dab0b34c8896948ca))

## [2.0.2-beta.1](https://github.com/module-federation/nextjs-mf/compare/node-2.0.2-beta.0...node-2.0.2-beta.1) (2023-09-14)

## [2.0.2-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-2.0.1...node-2.0.2-beta.0) (2023-09-14)

### Bug Fixes

- import utils manually ([2767191](https://github.com/module-federation/nextjs-mf/commit/2767191467d9d685704b747d42b5f170da233847))
- **node:** use ES6 imports and override method in FederationModuleInfoRuntimeModule (#bytedance) ([d420ad9](https://github.com/module-federation/nextjs-mf/commit/d420ad94b7515123254af45c61704abcc0971511))
- remove ensure remote runtime module ([d06c082](https://github.com/module-federation/nextjs-mf/commit/d06c0823435063dcd277897ab551cd3a9c996d3d))

### Features

- add auto public path support for remote modules (node_auto_public_path) ([b12c984](https://github.com/module-federation/nextjs-mf/commit/b12c9841aa55027cb7b77e768ff9c0b456120d51))
- Dynamic Filesystem ([#1274](https://github.com/module-federation/nextjs-mf/issues/1274)) ([2bec98a](https://github.com/module-federation/nextjs-mf/commit/2bec98a2472b44898a7f14ec6868a2368cfb6d82))
- FederationModuleInfo Runtime Module ([50a1a0c](https://github.com/module-federation/nextjs-mf/commit/50a1a0c7a37bbe42ab6f2f5559b411567fee0fe9))
- FederationModuleInfo Runtime Module ([7b09ef6](https://github.com/module-federation/nextjs-mf/commit/7b09ef6c0f4ee68a1b5caa5f021632059c522b8f))
- implement Bytedance Infra Node Plugin ([82e6801](https://github.com/module-federation/nextjs-mf/commit/82e680157bbad68fa93800a69149c4c28652cfed))
- implement Bytedance Infra Node Plugin ([97f283e](https://github.com/module-federation/nextjs-mf/commit/97f283e4746bf6f048ee27584adde5249c8e577c))
- native self forming node federation ([#1291](https://github.com/module-federation/nextjs-mf/issues/1291)) ([1dd5ed1](https://github.com/module-federation/nextjs-mf/commit/1dd5ed17c981e036336925e807203e94b58c36d6))
- **node-remote:** Improve module federation runtime compatibility ([5eb2092](https://github.com/module-federation/nextjs-mf/commit/5eb209249c44d525c12eff5739bf23a93db08e4f))
- **node:** auto set public path and improve chunk loading strategy #node_auto_public_path ([65989da](https://github.com/module-federation/nextjs-mf/commit/65989dab95ee2acee7ec9a5ab321921a278cd078))
- **node:** enhance error handling and remote container registry in RemotePublicPathRuntimeModule (#bytedance) ([061285e](https://github.com/module-federation/nextjs-mf/commit/061285e0b6210baa1dd502dc94fd57fd9a8af822))
- **NodeFederationPlugin:** assign remoteContainerRegistry to importMetaName ([ca33d98](https://github.com/module-federation/nextjs-mf/commit/ca33d98df63fdb8dac402b1cc0ec8bf95f9f1971))
- **node:** remove unused import from DynamicFilesystemRuntimeModule ([f9787a9](https://github.com/module-federation/nextjs-mf/commit/f9787a9a67da936679db388e5c66e012e7452d8a))
- remove old loadScript hack ([fbe19bc](https://github.com/module-federation/nextjs-mf/commit/fbe19bc76694c14b6a95c577669c2e8656ede1ba))
- **utilities:** update DelegateModulesPlugin and tests (#node_auto_public_path) ([df8bb79](https://github.com/module-federation/nextjs-mf/commit/df8bb791c3fedef299cb15960546ff5ad9c665ef))

## [2.0.1](https://github.com/module-federation/nextjs-mf/compare/node-2.0.0...node-2.0.1) (2023-09-13)

### Dependency Updates

- `utils` updated to version `3.0.1`
- `utils` updated to version `3.0.1`

# [2.0.0](https://github.com/module-federation/nextjs-mf/compare/node-1.0.6...node-2.0.0) (2023-09-09)

### Dependency Updates

- `utils` updated to version `3.0.0`
- `utils` updated to version `3.0.0`

### Bug Fixes

- workaround to self ref module error in prod ([#1205](https://github.com/module-federation/nextjs-mf/issues/1205)) ([1d88beb](https://github.com/module-federation/nextjs-mf/commit/1d88beb0da629f036e132573fee9f05494b1f540))

### Features

- core package for module federation ([#1093](https://github.com/module-federation/nextjs-mf/issues/1093)) ([d460400](https://github.com/module-federation/nextjs-mf/commit/d46040053e9b627321b5fe8e05556c5bb727c238)), closes [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#835](https://github.com/module-federation/nextjs-mf/issues/835) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#871](https://github.com/module-federation/nextjs-mf/issues/871) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#872](https://github.com/module-federation/nextjs-mf/issues/872) [#875](https://github.com/module-federation/nextjs-mf/issues/875) [#884](https://github.com/module-federation/nextjs-mf/issues/884) [#887](https://github.com/module-federation/nextjs-mf/issues/887) [#893](https://github.com/module-federation/nextjs-mf/issues/893) [#885](https://github.com/module-federation/nextjs-mf/issues/885) [#899](https://github.com/module-federation/nextjs-mf/issues/899) [#904](https://github.com/module-federation/nextjs-mf/issues/904) [#932](https://github.com/module-federation/nextjs-mf/issues/932) [#936](https://github.com/module-federation/nextjs-mf/issues/936) [#959](https://github.com/module-federation/nextjs-mf/issues/959) [#960](https://github.com/module-federation/nextjs-mf/issues/960) [#969](https://github.com/module-federation/nextjs-mf/issues/969) [#971](https://github.com/module-federation/nextjs-mf/issues/971) [#1234](https://github.com/module-federation/nextjs-mf/issues/1234) [#1235](https://github.com/module-federation/nextjs-mf/issues/1235)

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

## [1.0.7](https://github.com/module-federation/nextjs-mf/compare/node-1.0.6...node-1.0.7) (2023-08-14)

### Dependency Updates

- `utils` updated to version `2.0.6`
- `utils` updated to version `2.0.6`

## [1.0.6](https://github.com/module-federation/nextjs-mf/compare/node-1.0.5...node-1.0.6) (2023-08-11)

### Dependency Updates

- `utils` updated to version `2.0.5`
- `utils` updated to version `2.0.5`

## [1.0.5](https://github.com/module-federation/nextjs-mf/compare/node-1.0.4...node-1.0.5) (2023-07-19)

### Dependency Updates

- `utils` updated to version `2.0.4`
- `utils` updated to version `2.0.4`

### Bug Fixes

- Fix call undefined delegate ([#1149](https://github.com/module-federation/nextjs-mf/issues/1149)) ([87a5896](https://github.com/module-federation/nextjs-mf/commit/87a5896221a726578c3433071755fba3465824f4)), closes [#1151](https://github.com/module-federation/nextjs-mf/issues/1151)
- thrown error during chunk correlation of empty graph connection ([#1146](https://github.com/module-federation/nextjs-mf/issues/1146)) ([508d754](https://github.com/module-federation/nextjs-mf/commit/508d754baa746b9d6575cd5d8b1faa22d24396c0))

## [1.0.4](https://github.com/module-federation/nextjs-mf/compare/node-1.0.3...node-1.0.4) (2023-07-18)

### Dependency Updates

- `utils` updated to version `2.0.2`
- `utils` updated to version `2.0.2`

## [1.0.3](https://github.com/module-federation/nextjs-mf/compare/node-1.0.2...node-1.0.3) (2023-07-17)

### Dependency Updates

- `utils` updated to version `2.0.1`
- `utils` updated to version `2.0.1`

## [1.0.2](https://github.com/module-federation/nextjs-mf/compare/node-1.0.1...node-1.0.2) (2023-07-05)

### Bug Fixes

- do not assign remotes to the registry from within chunk loading runtime modules ([#1111](https://github.com/module-federation/nextjs-mf/issues/1111)) ([e255c15](https://github.com/module-federation/nextjs-mf/commit/e255c15a05c8b691b6bed3a3653bc3fc92cd21d8))

## [1.0.1](https://github.com/module-federation/nextjs-mf/compare/node-1.0.0...node-1.0.1) (2023-07-05)

### Bug Fixes

- better automatic server build detection ([#1106](https://github.com/module-federation/nextjs-mf/issues/1106)) ([6763cd6](https://github.com/module-federation/nextjs-mf/commit/6763cd60549d77add4745629bf6855e370d1375f))

# [1.0.0](https://github.com/module-federation/nextjs-mf/compare/node-0.16.2...node-1.0.0) (2023-07-01)

### Dependency Updates

- `utils` updated to version `2.0.0`
- `utils` updated to version `2.0.0`

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

## [0.16.3-rc.1](https://github.com/module-federation/nextjs-mf/compare/node-0.16.3-rc.0...node-0.16.3-rc.1) (2023-07-01)

### Features

- support edge workers ([4c43729](https://github.com/module-federation/nextjs-mf/commit/4c43729153a4130d84f92ea2e56f771f2e63abc8))
- support edge workers ([#1084](https://github.com/module-federation/nextjs-mf/issues/1084)) ([3f5df94](https://github.com/module-federation/nextjs-mf/commit/3f5df944ea787cf958fd4cf7fabed84432a50a10))

## [0.16.3-rc.0](https://github.com/module-federation/nextjs-mf/compare/node-0.16.2...node-0.16.3-rc.0) (2023-06-30)

## [0.15.2-rc8.1](https://github.com/module-federation/nextjs-mf/compare/node-0.15.2-rc8.0...node-0.15.2-rc8.1) (2023-06-28)

## [0.15.2-rc8.0](https://github.com/module-federation/nextjs-mf/compare/node-0.15.2-rc7.0...node-0.15.2-rc8.0) (2023-06-27)

### Bug Fixes

- disable flushing remotes to ssr for now ([2495582](https://github.com/module-federation/nextjs-mf/commit/249558248682896ccb05a9517d8540b97379b1bc))

## [0.15.2-rc7.0](https://github.com/module-federation/nextjs-mf/compare/node-0.15.2-rc6.0...node-0.15.2-rc7.0) (2023-06-27)

## [0.15.2-rc6.0](https://github.com/module-federation/nextjs-mf/compare/node-0.15.2-rc5.0...node-0.15.2-rc6.0) (2023-06-23)

## [0.15.2-rc5.0](https://github.com/module-federation/nextjs-mf/compare/node-0.15.2-rc4.0...node-0.15.2-rc5.0) (2023-06-23)

## [0.15.2-rc4.0](https://github.com/module-federation/nextjs-mf/compare/node-0.15.2-rc3.1...node-0.15.2-rc4.0) (2023-06-21)

### Bug Fixes

- Resolve condition names ([#974](https://github.com/module-federation/nextjs-mf/issues/974)) ([5e8b49c](https://github.com/module-federation/nextjs-mf/commit/5e8b49cf60f19dae6be4818a1c0ff783c7689393))
- Runtime module checking ([#969](https://github.com/module-federation/nextjs-mf/issues/969)) ([b5c7af1](https://github.com/module-federation/nextjs-mf/commit/b5c7af1697a63d9e19f901238a4c0382ea0c3f50))

## [0.15.2-rc3.1](https://github.com/module-federation/nextjs-mf/compare/node-0.15.2-rc3.0...node-0.15.2-rc3.1) (2023-06-09)

### Bug Fixes

- Path loader patches ([#960](https://github.com/module-federation/nextjs-mf/issues/960)) ([d362a77](https://github.com/module-federation/nextjs-mf/commit/d362a7752c4364cc499a27f2b6eeb5399543cb29))

## [0.15.2-rc3.0](https://github.com/module-federation/nextjs-mf/compare/node-0.15.2-beta.0...node-0.15.2-rc3.0) (2023-06-09)

## [0.15.2-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.15.2-rc1.0...node-0.15.2-beta.0) (2023-05-26)

### Bug Fixes

- Improve chunk correlation ([#936](https://github.com/module-federation/nextjs-mf/issues/936)) ([4dad1eb](https://github.com/module-federation/nextjs-mf/commit/4dad1eb370feacd6ecb4c1726c435d5c579f424d))

## [0.15.2-rc1.0](https://github.com/module-federation/nextjs-mf/compare/node-0.15.2-rc.0...node-0.15.2-rc1.0) (2023-05-25)

## [0.15.2-rc.0](https://github.com/module-federation/nextjs-mf/compare/node-0.15.1...node-0.15.2-rc.0) (2023-05-23)

### Bug Fixes

- chunk and module duplications ([#885](https://github.com/module-federation/nextjs-mf/issues/885)) ([199e6b9](https://github.com/module-federation/nextjs-mf/commit/199e6b9937f4a2ca6caedb3ae4767342de463cb6))
- client prod build issues ([#899](https://github.com/module-federation/nextjs-mf/issues/899)) ([470d7ad](https://github.com/module-federation/nextjs-mf/commit/470d7ad408ae8d64dbccc5a9528eaa2ed60fa2ca))
- externalization and missing runtime chunks ([#887](https://github.com/module-federation/nextjs-mf/issues/887)) ([c79cd62](https://github.com/module-federation/nextjs-mf/commit/c79cd6226d3134f1d6294cd8eba40c8c33af5cb5))
- missing chunk hashes on exposed modules ([#893](https://github.com/module-federation/nextjs-mf/issues/893)) ([cfa43f5](https://github.com/module-federation/nextjs-mf/commit/cfa43f506999d5ce3ab6afeea513d50d85f7886e))

## [0.14.7-rc.2](https://github.com/module-federation/nextjs-mf/compare/node-0.14.7-rc.1...node-0.14.7-rc.2) (2023-05-17)

## [0.14.7-rc.1](https://github.com/module-federation/nextjs-mf/compare/node-0.14.7-rc.0...node-0.14.7-rc.1) (2023-05-17)

### Bug Fixes

- **chunk-module-duplication:** prevent runtime reset and share scope loss ([14bfc38](https://github.com/module-federation/nextjs-mf/commit/14bfc38515a4da3be7321d4b6d876905d45ad20b))

## [0.14.7-rc.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.7-beta.3...node-0.14.7-rc.0) (2023-05-16)

## [0.14.7-beta.3](https://github.com/module-federation/nextjs-mf/compare/node-0.14.7-beta.2...node-0.14.7-beta.3) (2023-05-16)

## [0.14.7-beta.2](https://github.com/module-federation/nextjs-mf/compare/node-0.14.7-beta.1...node-0.14.7-beta.2) (2023-05-16)

## [0.14.7-beta.1](https://github.com/module-federation/nextjs-mf/compare/node-0.14.7-beta.0...node-0.14.7-beta.1) (2023-05-16)

## [0.14.7-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.6...node-0.14.7-beta.0) (2023-05-16)

## [0.14.6](https://github.com/module-federation/nextjs-mf/compare/node-0.14.5...node-0.14.6) (2023-05-16)

## [0.14.5](https://github.com/module-federation/nextjs-mf/compare/node-0.14.5-beta.0...node-0.14.5) (2023-05-15)

## [0.14.5-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.4...node-0.14.5-beta.0) (2023-05-15)

### Features

- Quantum Modules ([#872](https://github.com/module-federation/nextjs-mf/issues/872)) ([2991039](https://github.com/module-federation/nextjs-mf/commit/299103932b4e0aa6d8017be588ffa5272f519260))

## [0.14.4](https://github.com/module-federation/nextjs-mf/compare/node-0.14.4-beta.0...node-0.14.4) (2023-05-13)

## [0.14.4-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.3...node-0.14.4-beta.0) (2023-05-13)

### Bug Fixes

- remove container proxy code ([6123d98](https://github.com/module-federation/nextjs-mf/commit/6123d9846606d76be949492ca04474f5c8164bc7))

### Features

- [7] Async boundary runtime server ([#851](https://github.com/module-federation/nextjs-mf/issues/851)) ([7fa792a](https://github.com/module-federation/nextjs-mf/commit/7fa792a4b518cd007b5ac41db225e20521063e73)), closes [#864](https://github.com/module-federation/nextjs-mf/issues/864)

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

## [0.14.3](https://github.com/module-federation/nextjs-mf/compare/node-0.14.3-beta.0...node-0.14.3) (2023-05-03)

## [0.14.3-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.2...node-0.14.3-beta.0) (2023-05-03)

## [0.14.2](https://github.com/module-federation/nextjs-mf/compare/node-0.14.2-beta.1...node-0.14.2) (2023-04-28)

## [0.14.2-beta.1](https://github.com/module-federation/nextjs-mf/compare/node-0.14.2-beta.0...node-0.14.2-beta.1) (2023-04-28)

## [0.14.2-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.1...node-0.14.2-beta.0) (2023-04-28)

### Bug Fixes

- use [fullhash] if no hash exists / in development mode. ([dfa7fb3](https://github.com/module-federation/nextjs-mf/commit/dfa7fb3a49b81b87dae43ec57ff2f86f5c2b7501))

## [0.14.1](https://github.com/module-federation/nextjs-mf/compare/node-0.14.1-beta.0...node-0.14.1) (2023-04-28)

## [0.14.1-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.0...node-0.14.1-beta.0) (2023-04-28)

### Features

- Improve module chunk connections ([#802](https://github.com/module-federation/nextjs-mf/issues/802)) ([ce0bd7b](https://github.com/module-federation/nextjs-mf/commit/ce0bd7b16e080f712e6db0bdcd3955a8167c274f)), closes [#803](https://github.com/module-federation/nextjs-mf/issues/803) [#808](https://github.com/module-federation/nextjs-mf/issues/808) [#811](https://github.com/module-federation/nextjs-mf/issues/811)

## [0.13.1](https://github.com/module-federation/nextjs-mf/compare/node-0.13.1-beta.0...node-0.13.1) (2023-04-19)

## [0.13.1-beta.0](https://github.com/module-federation/nextjs-mf/compare/node-0.13.0...node-0.13.1-beta.0) (2023-04-19)

### Bug Fixes

- use container proxy on script VM instead of host resolver point ([2929d0f](https://github.com/module-federation/nextjs-mf/commit/2929d0f64d4b8edf268af5ca83f807a02b121861))
- get delegates working ([#527](https://github.com/module-federation/nextjs-mf/issues/527)) ([7655568](https://github.com/module-federation/nextjs-mf/commit/7655568fcef8dbfda40573deb5d3d029c101074c))
- improved asset pipeline ([63928b2](https://github.com/module-federation/nextjs-mf/commit/63928b28150c2c4e3adb9e14fb7aa54f5cf1578d))
- peer dependencies metadata ([d3a2ed0](https://github.com/module-federation/nextjs-mf/commit/d3a2ed0e378b59afdeb632d1e2e0290f05cbca19))
- solve externalization ([49f52e5](https://github.com/module-federation/nextjs-mf/commit/49f52e53ddddc990d31e6aa510d67dc0552a9d9a))
- use EntryPlugin for injection of remotes ([e522c5a](https://github.com/module-federation/nextjs-mf/commit/e522c5ad2b7adcbd6c39f9c5fdb7a3e418277b7a))

### Features

- delegate module support ([5061d3d](https://github.com/module-federation/nextjs-mf/commit/5061d3d64d7d83dbb25b4ef2378d434545186cb1))
- chunk flushing in delegates ([5e2375f](https://github.com/module-federation/nextjs-mf/commit/5e2375f598437803105ac4bc2237f6b652554d00))
- delegate module support ([8dd154c](https://github.com/module-federation/nextjs-mf/commit/8dd154c261b34183b12250ce204904cd3e085658))
- delegate module support ([d242163](https://github.com/module-federation/nextjs-mf/commit/d24216324183bfec5c7ba672ba6da05679f67809))
- delegates part two ([1be2686](https://github.com/module-federation/nextjs-mf/commit/1be2686624798a7df9f447b48279294985b3f592))
- improve chunk correlation ([22d8afc](https://github.com/module-federation/nextjs-mf/commit/22d8afccff101044fcdeba390656950dbc6eafed))
- new chunk flushing system for exposed modules ([97a75d8](https://github.com/module-federation/nextjs-mf/commit/97a75d8702f2ddc5e12cff2ac4d24aca1df6f990))
- prepare for v7 ([7bc4b3b](https://github.com/module-federation/nextjs-mf/commit/7bc4b3bd44e0926a52d6a9cbe56f0c4d7bb700ae))

### BREAKING CHANGES

- safety breaking change note
  BREAKING_CHANGE: safety breaking change note

## [0.16.2](https://github.com/module-federation/nextjs-mf/compare/node-0.16.1...node-0.16.2) (2023-06-30)

### Dependency Updates

- `utils` updated to version `1.9.1`
- `utils` updated to version `1.9.1`

## [0.16.1](https://github.com/module-federation/nextjs-mf/compare/node-0.16.0...node-0.16.1) (2023-06-29)

# [0.16.0](https://github.com/module-federation/nextjs-mf/compare/node-0.15.1...node-0.16.0) (2023-06-29)

## [0.15.1](https://github.com/module-federation/nextjs-mf/compare/node-0.15.0...node-0.15.1) (2023-05-22)

### Bug Fixes

- Add ./src/ export to package.json ([#898](https://github.com/module-federation/nextjs-mf/issues/898)) ([acbdda6](https://github.com/module-federation/nextjs-mf/commit/acbdda6c5dd499828f9e65ed3b774b50048f9021))

# [0.15.0](https://github.com/module-federation/nextjs-mf/compare/node-0.14.0...node-0.15.0) (2023-05-22)

### Dependency Updates

- `utils` updated to version `1.8.0`
- `utils` updated to version `1.8.0`

### Features

- release to npm with next tag to not ruine latest one ([#763](https://github.com/module-federation/nextjs-mf/issues/763)) ([f2d199b](https://github.com/module-federation/nextjs-mf/commit/f2d199b3b3fbbd428514b1ce1f139efc82f7fff0))

# [0.14.0](https://github.com/module-federation/nextjs-mf/compare/node-0.13.0...node-0.14.0) (2023-04-19)

# [0.13.0](https://github.com/module-federation/nextjs-mf/compare/node-0.12.3...node-0.13.0) (2023-04-09)

### Dependency Updates

- `utils` updated to version `1.5.0`
- `utils` updated to version `1.5.0`

### Features

- Allow Container Utils to work Server Side ([#723](https://github.com/module-federation/nextjs-mf/issues/723)) ([232ba24](https://github.com/module-federation/nextjs-mf/commit/232ba24072f19bd32d1f745d4edf1518e548df50))

## [0.12.3](https://github.com/module-federation/nextjs-mf/compare/node-0.12.2...node-0.12.3) (2023-04-09)

### Dependency Updates

- `utils` updated to version `1.4.1`
- `utils` updated to version `1.4.1`

## [0.12.2](https://github.com/module-federation/nextjs-mf/compare/node-0.12.1...node-0.12.2) (2023-03-24)

### Bug Fixes

- Medusa hot reloading ([#685](https://github.com/module-federation/nextjs-mf/issues/685)) ([6f14306](https://github.com/module-federation/nextjs-mf/commit/6f143068252eefec7a717ea0b8fef51a709ba539))

## [0.12.1](https://github.com/module-federation/nextjs-mf/compare/node-0.12.0...node-0.12.1) (2023-03-24)

### Bug Fixes

- enable chunk hashing all the time ([#669](https://github.com/module-federation/nextjs-mf/issues/669)) ([7417bc2](https://github.com/module-federation/nextjs-mf/commit/7417bc2acead56aa066a6b14ddb57a2474ea72e0))

# [0.12.0](https://github.com/module-federation/nextjs-mf/compare/node-0.11.1...node-0.12.0) (2023-03-14)

### Dependency Updates

- `utils` updated to version `1.4.0`

### Features

- Medusa Support in NextFederationPlugin ([#609](https://github.com/module-federation/nextjs-mf/issues/609)) ([0bbba38](https://github.com/module-federation/nextjs-mf/commit/0bbba384c45b7d149b7a6be2dfbe9851b541b528)), closes [#606](https://github.com/module-federation/nextjs-mf/issues/606)

## [0.11.1](https://github.com/module-federation/nextjs-mf/compare/node-0.11.0...node-0.11.1) (2023-02-09)

### Bug Fixes

- backward compatability with older versions pre 6.1.x ([f27b57a](https://github.com/module-federation/nextjs-mf/commit/f27b57a36a61280124bab4a309edaa1c3fd04ced))

# [0.11.0](https://github.com/module-federation/nextjs-mf/compare/node-0.10.5...node-0.11.0) (2023-02-09)

### Dependency Updates

- `utils` updated to version `1.3.0`

### Features

- Delegate Modules ([#509](https://github.com/module-federation/nextjs-mf/issues/509)) ([1a085e7](https://github.com/module-federation/nextjs-mf/commit/1a085e7e03ca0afd5c64389b4b169f3db3382f6b))

## [0.10.5](https://github.com/module-federation/nextjs-mf/compare/node-0.10.4...node-0.10.5) (2023-02-09)

### Dependency Updates

- `utils` updated to version `1.2.1`

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
