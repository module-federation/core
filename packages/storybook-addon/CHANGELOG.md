# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

# 1.0.0 (2023-08-14)

### Dependency Updates

- `utils` updated to version `2.0.7`
- `utils` updated to version `2.0.7`

### Bug Fixes

- add release tooling to storybook addon ([43c66bb](https://github.com/module-federation/nextjs-mf/commit/43c66bbc10af8198e908d35ffde7b7dc0058f9cb))
- add release tooling to storybook addon ([#817](https://github.com/module-federation/nextjs-mf/issues/817)) ([63d27a8](https://github.com/module-federation/nextjs-mf/commit/63d27a8067a0734d04677948b50454b6704dc387))
- ignore ts error ([86bb46b](https://github.com/module-federation/nextjs-mf/commit/86bb46b0a77617c28d5294c3cc5e266b9360eb65))
- **storybook-addon:** update src path also for stories from v7 ([#1206](https://github.com/module-federation/nextjs-mf/issues/1206)) ([8af9066](https://github.com/module-federation/nextjs-mf/commit/8af906648c3abf8d9a344fec9153b54a02ad3e53)), closes [#1195](https://github.com/module-federation/nextjs-mf/issues/1195)
- workaround to self ref module error in prod ([#1205](https://github.com/module-federation/nextjs-mf/issues/1205)) ([1d88beb](https://github.com/module-federation/nextjs-mf/commit/1d88beb0da629f036e132573fee9f05494b1f540))

### Features

- add storybook addon that supports Module Federation remote containers ([#598](https://github.com/module-federation/nextjs-mf/issues/598)) ([7547b02](https://github.com/module-federation/nextjs-mf/commit/7547b02937fdef2831060d6a7bfd337d2cc3355c))
- Next Federation 7 ([#726](https://github.com/module-federation/nextjs-mf/issues/726)) ([d50ca1e](https://github.com/module-federation/nextjs-mf/commit/d50ca1e4636c4e0a402190f6e9c3f69ed9ec8eac)), closes [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#835](https://github.com/module-federation/nextjs-mf/issues/835) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#871](https://github.com/module-federation/nextjs-mf/issues/871) [#851](https://github.com/module-federation/nextjs-mf/issues/851) [#864](https://github.com/module-federation/nextjs-mf/issues/864) [#872](https://github.com/module-federation/nextjs-mf/issues/872) [#875](https://github.com/module-federation/nextjs-mf/issues/875) [#884](https://github.com/module-federation/nextjs-mf/issues/884) [#887](https://github.com/module-federation/nextjs-mf/issues/887) [#893](https://github.com/module-federation/nextjs-mf/issues/893) [#885](https://github.com/module-federation/nextjs-mf/issues/885) [#899](https://github.com/module-federation/nextjs-mf/issues/899) [#904](https://github.com/module-federation/nextjs-mf/issues/904) [#932](https://github.com/module-federation/nextjs-mf/issues/932) [#936](https://github.com/module-federation/nextjs-mf/issues/936) [#959](https://github.com/module-federation/nextjs-mf/issues/959) [#960](https://github.com/module-federation/nextjs-mf/issues/960) [#969](https://github.com/module-federation/nextjs-mf/issues/969) [#971](https://github.com/module-federation/nextjs-mf/issues/971) [#974](https://github.com/module-federation/nextjs-mf/issues/974) [#984](https://github.com/module-federation/nextjs-mf/issues/984) [#986](https://github.com/module-federation/nextjs-mf/issues/986) [#1015](https://github.com/module-federation/nextjs-mf/issues/1015) [#1086](https://github.com/module-federation/nextjs-mf/issues/1086) [#1084](https://github.com/module-federation/nextjs-mf/issues/1084)
- **storybook-addon:** upgrade nx and refactor util `withModuleFederation` ([#829](https://github.com/module-federation/nextjs-mf/issues/829)) ([5eeab46](https://github.com/module-federation/nextjs-mf/commit/5eeab46861fa1e444b772cdd15ba5472414e5dd8))

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

# [1.0.0](https://github.com/module-federation/nextjs-mf/compare/storybook-addon-0.2.0...storybook-addon-1.0.0) (2023-08-14)

### Dependency Updates

- `utils` updated to version `2.0.7`
- `utils` updated to version `2.0.7`

### Bug Fixes

- ignore ts error ([86bb46b](https://github.com/module-federation/nextjs-mf/commit/86bb46b0a77617c28d5294c3cc5e266b9360eb65))
- **storybook-addon:** update src path also for stories from v7 ([#1206](https://github.com/module-federation/nextjs-mf/issues/1206)) ([8af9066](https://github.com/module-federation/nextjs-mf/commit/8af906648c3abf8d9a344fec9153b54a02ad3e53)), closes [#1195](https://github.com/module-federation/nextjs-mf/issues/1195)
- workaround to self ref module error in prod ([#1205](https://github.com/module-federation/nextjs-mf/issues/1205)) ([1d88beb](https://github.com/module-federation/nextjs-mf/commit/1d88beb0da629f036e132573fee9f05494b1f540))

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

# [1.0.0](https://github.com/module-federation/nextjs-mf/compare/storybook-addon-0.2.0...storybook-addon-1.0.0) (2023-08-14)

### Dependency Updates

- `utils` updated to version `2.0.7`
- `utils` updated to version `2.0.7`

### Bug Fixes

- ignore ts error ([86bb46b](https://github.com/module-federation/nextjs-mf/commit/86bb46b0a77617c28d5294c3cc5e266b9360eb65))
- **storybook-addon:** update src path also for stories from v7 ([#1206](https://github.com/module-federation/nextjs-mf/issues/1206)) ([8af9066](https://github.com/module-federation/nextjs-mf/commit/8af906648c3abf8d9a344fec9153b54a02ad3e53)), closes [#1195](https://github.com/module-federation/nextjs-mf/issues/1195)
- workaround to self ref module error in prod ([#1205](https://github.com/module-federation/nextjs-mf/issues/1205)) ([1d88beb](https://github.com/module-federation/nextjs-mf/commit/1d88beb0da629f036e132573fee9f05494b1f540))

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

# [1.0.0](https://github.com/module-federation/nextjs-mf/compare/storybook-addon-0.2.0...storybook-addon-1.0.0) (2023-08-14)

### Dependency Updates

- `utils` updated to version `2.0.7`
- `utils` updated to version `2.0.7`

### Bug Fixes

- ignore ts error ([86bb46b](https://github.com/module-federation/nextjs-mf/commit/86bb46b0a77617c28d5294c3cc5e266b9360eb65))
- **storybook-addon:** update src path also for stories from v7 ([#1206](https://github.com/module-federation/nextjs-mf/issues/1206)) ([8af9066](https://github.com/module-federation/nextjs-mf/commit/8af906648c3abf8d9a344fec9153b54a02ad3e53)), closes [#1195](https://github.com/module-federation/nextjs-mf/issues/1195)
- workaround to self ref module error in prod ([#1205](https://github.com/module-federation/nextjs-mf/issues/1205)) ([1d88beb](https://github.com/module-federation/nextjs-mf/commit/1d88beb0da629f036e132573fee9f05494b1f540))

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

# [1.0.0](https://github.com/module-federation/nextjs-mf/compare/storybook-addon-0.2.0...storybook-addon-1.0.0) (2023-08-14)

### Dependency Updates

- `utils` updated to version `2.0.6`
- `utils` updated to version `2.0.6`

### Bug Fixes

- ignore ts error ([86bb46b](https://github.com/module-federation/nextjs-mf/commit/86bb46b0a77617c28d5294c3cc5e266b9360eb65))
- **storybook-addon:** update src path also for stories from v7 ([#1206](https://github.com/module-federation/nextjs-mf/issues/1206)) ([8af9066](https://github.com/module-federation/nextjs-mf/commit/8af906648c3abf8d9a344fec9153b54a02ad3e53)), closes [#1195](https://github.com/module-federation/nextjs-mf/issues/1195)

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

# [0.2.0](https://github.com/module-federation/nextjs-mf/compare/storybook-addon-0.1.0...storybook-addon-0.2.0) (2023-05-03)

### Dependency Updates

- `utils` updated to version `1.7.0`
- `utils` updated to version `1.7.0`

### Features

- **storybook-addon:** upgrade nx and refactor util `withModuleFederation` ([#829](https://github.com/module-federation/nextjs-mf/issues/829)) ([5eeab46](https://github.com/module-federation/nextjs-mf/commit/5eeab46861fa1e444b772cdd15ba5472414e5dd8))

# 0.1.0 (2023-04-27)

### Dependency Updates

- `utils` updated to version `1.7.0`
- `utils` updated to version `1.7.0`

### Bug Fixes

- add release tooling to storybook addon ([43c66bb](https://github.com/module-federation/nextjs-mf/commit/43c66bbc10af8198e908d35ffde7b7dc0058f9cb))
- add release tooling to storybook addon ([#817](https://github.com/module-federation/nextjs-mf/issues/817)) ([63d27a8](https://github.com/module-federation/nextjs-mf/commit/63d27a8067a0734d04677948b50454b6704dc387))

### Features

- add storybook addon that supports Module Federation remote containers ([#598](https://github.com/module-federation/nextjs-mf/issues/598)) ([7547b02](https://github.com/module-federation/nextjs-mf/commit/7547b02937fdef2831060d6a7bfd337d2cc3355c))

# 0.1.0 (2023-04-27)

### Dependency Updates

- `utils` updated to version `1.7.0`
- `utils` updated to version `1.7.0`

### Bug Fixes

- add release tooling to storybook addon ([#817](https://github.com/module-federation/nextjs-mf/issues/817)) ([63d27a8](https://github.com/module-federation/nextjs-mf/commit/63d27a8067a0734d04677948b50454b6704dc387))

### Features

- add storybook addon that supports Module Federation remote containers ([#598](https://github.com/module-federation/nextjs-mf/issues/598)) ([7547b02](https://github.com/module-federation/nextjs-mf/commit/7547b02937fdef2831060d6a7bfd337d2cc3355c))

# 0.1.0 (2023-04-27)

### Dependency Updates

- `utils` updated to version `1.7.0`
- `utils` updated to version `1.7.0`

### Bug Fixes

- add release tooling to storybook addon ([#817](https://github.com/module-federation/nextjs-mf/issues/817)) ([63d27a8](https://github.com/module-federation/nextjs-mf/commit/63d27a8067a0734d04677948b50454b6704dc387))

### Features

- add storybook addon that supports Module Federation remote containers ([#598](https://github.com/module-federation/nextjs-mf/issues/598)) ([7547b02](https://github.com/module-federation/nextjs-mf/commit/7547b02937fdef2831060d6a7bfd337d2cc3355c))
