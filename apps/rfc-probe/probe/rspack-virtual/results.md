# rspack composed-entry probe (Q1 alias to virtual/real file, Q2 resolverFactory conditions)

Generated 2026-09-25T04:11:14.786Z by probe/rspack-virtual/run.mjs. Profile ALL-OFF+expose, production. M2 = minimize:false. Smoke loads remoteEntry.js under a DOM stub.

Alias key (absolute, what the native plugin imports): `/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/index.cjs`

## @rspack/core 2.1.8

| build | mode | composed path | in graph | wbr .cjs in graph | wbr .js in graph | fed cjs/esm | built/total | tag in JS | smoke | ms |
|---|---|---|---|---|---|---|---|---|---|---|
| control-none | M2 | - | - | true | false | 152/0 | 80/81 | - | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=undefined | 281 |
| virtual-user-alias | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 152 |
| virtual-wrapper-M1 | M1 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | - | ok instance=rfcprobe sharedHandler=Y remoteHandler=V tag=A | 229 |
| virtual-wrapper-hash-cache1-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 239 |
| virtual-wrapper-hash-cache2-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.7c863a6ddc84.mjs, .federation/rspack/host.7c863a6ddc84.mjs | false | true | 0/78 | 0/7 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 231 |
| virtual-wrapper-hash-cache3-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.7c863a6ddc84.mjs, .federation/rspack/host.7c863a6ddc84.mjs | false | true | 0/78 | 0/6 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 209 |
| virtual-wrapper-hash-cache4-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/7 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 201 |
| virtual-wrapper-fixed-cache1-A | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 271 |
| virtual-wrapper-fixed-cache2-B | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/7 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 204 |
| virtual-wrapper-fixed-cache3-B | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/6 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 198 |
| virtual-wrapper-fixed-cache4-A | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/7 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 290 |
| file-wrapper-M1 | M1 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | - | ok instance=rfcprobe sharedHandler=Y remoteHandler=V tag=A | 236 |
| file-wrapper-hash-cache1-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 241 |
| file-wrapper-hash-cache2-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 259 |
| file-wrapper-hash-cache3-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 293 |
| file-wrapper-hash-cache4-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 290 |
| file-wrapper-fixed-cache1-A | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 338 |
| file-wrapper-fixed-cache2-B | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/7 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 465 |
| file-wrapper-fixed-cache3-B | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/6 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 388 |
| file-wrapper-fixed-cache4-A | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/7 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 476 |
| file-prune-wrapper-M1 | M1 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | - | ok instance=rfcprobe sharedHandler=Y remoteHandler=V tag=A | 258 |
| file-prune-wrapper-hash-cache1-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 489 |
| file-prune-wrapper-hash-cache2-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.7c863a6ddc84.mjs, .federation/rspack/host.7c863a6ddc84.mjs | false | true | 0/78 | 0/7 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 379 |
| file-prune-wrapper-hash-cache3-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.7c863a6ddc84.mjs, .federation/rspack/host.7c863a6ddc84.mjs | false | true | 0/78 | 0/6 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 443 |
| file-prune-wrapper-hash-cache4-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/7 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 489 |
| file-user-hash-cache1-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 386 |
| file-user-hash-cache2-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 351 |
| file-user-hash-cache3-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 439 |
| file-user-hash-cache4-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 331 |
| q2-afterEnvironment+make | M2 | - | - | true | false | 152/0 | 80/81 | - | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=undefined | 292 |
| q2-make-only | M2 | - | - | true | false | 152/0 | 80/81 | - | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=undefined | 311 |

### q2-afterEnvironment+make

| when | variant | from | request | resolved |
|---|---|---|---|---|
| afterEnvironment | esm | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| afterEnvironment | esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| afterEnvironment | esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| afterEnvironment | esm | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| afterEnvironment | commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| afterEnvironment | commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| afterEnvironment | commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | none | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | none | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | none | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| afterEnvironment | none | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| afterEnvironment | none | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| afterEnvironment | none | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | none | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | none | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | none | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | none | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | none | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | none | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | none | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | none | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | none | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | esm+byDependency.esm | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm+byDependency.esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| afterEnvironment | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| afterEnvironment | esm+byDependency.esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| afterEnvironment | esm+byDependency.esm | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm+byDependency.esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | esm+byDependency.esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | esm+byDependency.esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm+byDependency.esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | esm+byDependency.esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | commonjs+byDependency.commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| afterEnvironment | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| afterEnvironment | commonjs+byDependency.commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | commonjs+byDependency.commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | esm | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| make | commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| make | commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| make | commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | none | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| make | none | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | none | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | none | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | none | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | none | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| make | none | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | none | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | none | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | none | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | none | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| make | none | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | none | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | none | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | none | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm+byDependency.esm | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm+byDependency.esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | esm+byDependency.esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | esm+byDependency.esm | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm+byDependency.esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm+byDependency.esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |

### q2-make-only

| when | variant | from | request | resolved |
|---|---|---|---|---|
| make | esm | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | esm | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.cjs |
| make | commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | none | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | none | runtime | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | none | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | none | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | none | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.cjs |
| make | none | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | none | wbr | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | none | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | none | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | none | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | none | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | none | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | none | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | none | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | none | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm+byDependency.esm | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm+byDependency.esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | esm+byDependency.esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | esm+byDependency.esm | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm+byDependency.esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm+byDependency.esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |

## @rspack/core 2.1.10

| build | mode | composed path | in graph | wbr .cjs in graph | wbr .js in graph | fed cjs/esm | built/total | tag in JS | smoke | ms |
|---|---|---|---|---|---|---|---|---|---|---|
| control-none | M2 | - | - | true | false | 152/0 | 80/81 | - | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=undefined | 253 |
| virtual-user-alias | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 231 |
| virtual-wrapper-M1 | M1 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | - | ok instance=rfcprobe sharedHandler=Y remoteHandler=V tag=A | 319 |
| virtual-wrapper-hash-cache1-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 449 |
| virtual-wrapper-hash-cache2-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.7c863a6ddc84.mjs, .federation/rspack/host.7c863a6ddc84.mjs | false | true | 0/78 | 0/7 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 451 |
| virtual-wrapper-hash-cache3-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.7c863a6ddc84.mjs, .federation/rspack/host.7c863a6ddc84.mjs | false | true | 0/78 | 0/6 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 663 |
| virtual-wrapper-hash-cache4-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/7 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 520 |
| virtual-wrapper-fixed-cache1-A | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 462 |
| virtual-wrapper-fixed-cache2-B | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/7 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 509 |
| virtual-wrapper-fixed-cache3-B | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/6 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 413 |
| virtual-wrapper-fixed-cache4-A | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/7 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 407 |
| file-wrapper-M1 | M1 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | - | ok instance=rfcprobe sharedHandler=Y remoteHandler=V tag=A | 224 |
| file-wrapper-hash-cache1-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 433 |
| file-wrapper-hash-cache2-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 340 |
| file-wrapper-hash-cache3-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 291 |
| file-wrapper-hash-cache4-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 266 |
| file-wrapper-fixed-cache1-A | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 360 |
| file-wrapper-fixed-cache2-B | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/7 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 322 |
| file-wrapper-fixed-cache3-B | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/6 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 312 |
| file-wrapper-fixed-cache4-A | M2 | node_modules/.federation/rspack/host.mjs | .federation/rspack/host.mjs, .federation/rspack/host.mjs | false | true | 0/78 | 0/7 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 303 |
| file-prune-wrapper-M1 | M1 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | - | ok instance=rfcprobe sharedHandler=Y remoteHandler=V tag=A | 185 |
| file-prune-wrapper-hash-cache1-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 471 |
| file-prune-wrapper-hash-cache2-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.7c863a6ddc84.mjs, .federation/rspack/host.7c863a6ddc84.mjs | false | true | 0/78 | 0/7 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 252 |
| file-prune-wrapper-hash-cache3-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.7c863a6ddc84.mjs, .federation/rspack/host.7c863a6ddc84.mjs | false | true | 0/78 | 0/6 | B | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=B | 256 |
| file-prune-wrapper-hash-cache4-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/7 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 236 |
| file-user-hash-cache1-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 3/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 254 |
| file-user-hash-cache2-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 244 |
| file-user-hash-cache3-B | M2 | node_modules/.federation/rspack/host.7c863a6ddc84.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 298 |
| file-user-hash-cache4-A | M2 | node_modules/.federation/rspack/host.f1ee15f98057.mjs | .federation/rspack/host.f1ee15f98057.mjs, .federation/rspack/host.f1ee15f98057.mjs | false | true | 0/78 | 0/6 | A | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=A | 261 |
| q2-afterEnvironment+make | M2 | - | - | true | false | 152/0 | 80/81 | - | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=undefined | 197 |
| q2-make-only | M2 | - | - | true | false | 152/0 | 80/81 | - | ok instance=rfcprobe sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler tag=undefined | 130 |

### q2-afterEnvironment+make

| when | variant | from | request | resolved |
|---|---|---|---|---|
| afterEnvironment | esm | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| afterEnvironment | esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| afterEnvironment | esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| afterEnvironment | esm | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| afterEnvironment | commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| afterEnvironment | commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| afterEnvironment | commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | none | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | none | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | none | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| afterEnvironment | none | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| afterEnvironment | none | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| afterEnvironment | none | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | none | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | none | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | none | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | none | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | none | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | none | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | none | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | none | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | none | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | esm+byDependency.esm | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm+byDependency.esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| afterEnvironment | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| afterEnvironment | esm+byDependency.esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| afterEnvironment | esm+byDependency.esm | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm+byDependency.esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | esm+byDependency.esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | esm+byDependency.esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| afterEnvironment | esm+byDependency.esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| afterEnvironment | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| afterEnvironment | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | esm+byDependency.esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | commonjs+byDependency.commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| afterEnvironment | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| afterEnvironment | commonjs+byDependency.commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | commonjs+byDependency.commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| afterEnvironment | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| afterEnvironment | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| afterEnvironment | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | esm | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| make | commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| make | commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| make | commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | none | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| make | none | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | none | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | none | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | none | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | none | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| make | none | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | none | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | none | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | none | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | none | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| make | none | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | none | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | none | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | none | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm+byDependency.esm | runtime | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm+byDependency.esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | esm+byDependency.esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | esm+byDependency.esm | wbr | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm+byDependency.esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm+byDependency.esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |

### q2-make-only

| when | variant | from | request | resolved |
|---|---|---|---|---|
| make | esm | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | esm | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.cjs |
| make | commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | none | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | none | runtime | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | none | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | none | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | none | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.cjs |
| make | none | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | none | wbr | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | none | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | none | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | none | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | none | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | none | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | none | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | none | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | none | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm+byDependency.esm | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm+byDependency.esm | runtime | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | esm+byDependency.esm | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | esm+byDependency.esm | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.js |
| make | esm+byDependency.esm | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm+byDependency.esm | wbr | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm+byDependency.esm | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm+byDependency.esm | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | esm+byDependency.esm | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/webpack-bundler-runtime/bundler | ERR RspackResolver(NotFound("@module-federation/webpack-bundler-runtime/bundler")) |
| make | commonjs+byDependency.commonjs | runtime | @module-federation/runtime-core | packages/runtime-core/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs+byDependency.commonjs | wbr | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime | packages/runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime/core | packages/runtime/dist/core.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime | packages/webpack-bundler-runtime/dist/index.cjs |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/webpack-bundler-runtime/bundler | packages/webpack-bundler-runtime/dist/bundler.js |
| make | commonjs+byDependency.commonjs | runtime-tools | @module-federation/runtime-core | ERR RspackResolver(NotFound("@module-federation/runtime-core")) |

## Verdict (hand-written; run.mjs appends this file to results.md)

All rows are identical on @rspack/core 2.1.8 and 2.1.10 (checked in results.json, ms excluded).

### Q1. Alias the native plugin's absolute .cjs to a composed entry: yes, and VirtualModulesPlugin is the better target

The working calls, from the wrapper's own `apply`, after it applies the native plugin:

- `new compiler.rspack.experiments.VirtualModulesPlugin({ [file]: content }).apply(compiler)`, with `file` = `<context>/node_modules/.federation/rspack/host.<sha12>.mjs`. It must be applied before `afterEnvironment` fires: the plugin records static modules in its `afterEnvironment` tap, and rspack hands them to the native compiler when the JsCompiler instance is created. `writeModule` only works after that.
- `compiler.hooks.afterPlugins.tap(..., () => { compiler.options.resolve.alias = { ...alias, [<abs webpack-bundler-runtime/dist/index.cjs>]: file, '@module-federation/runtime': <abs runtime/dist/index.js> } })`. The key is the exact string the native plugin computes with `require.resolve('@module-federation/webpack-bundler-runtime', { paths: [<runtime-tools bundler.js>] })`. The value is the absolute virtual path. The directory does not need to exist on disk. User-level `resolve.alias` with the same key and value works too (row virtual-user-alias).

Evidence, ALL-OFF+expose, production (M1) and production minimize:false (M2):

- Graph. control-none has `webpack-bundler-runtime/dist/index.cjs` in chunks and 152 federation module entries, all .cjs. Every alias row has the composed module in chunks, no `dist/index.cjs`, `dist/index.js` present, 0 .cjs and 78 ESM federation module entries.
- Smoke. remoteEntry.js creates the instance with `DisabledSharedHandler` / `DisabledRemoteHandler` (minified `Y`/`V` in M1), and `globalThis.__MF_COMPOSED_TAG__` equals the tag written into the composed module. The native bootstrap's `for (key in federation)` copy works with `export default federation`.

Persistent cache (`cache: { type: 'persistent', storage: { type: 'filesystem', directory } }`, one process per build, tags A, B, B, A). A warm build shows `built` = 0 modules in stats, so the cache is hit:

- Virtual module, content-hashed path: every build picks the new path and the new tag. No stale reuse.
- Virtual module, fixed path with changed content: also correct.
- Real file, fixed path, write-then-rename: correct.
- Real file, content-hashed path, old file left on disk: **stale**. Builds 2 and 3 alias to `host.7c86...mjs` but the graph and the emitted JS still carry `host.f1ee...mjs` and tag A. The same happens with a plain user `resolve.alias` change (row file-user-hash). rspack's persistent cache does not key cached resolutions on `resolve.alias`. The cached resolution of the absolute .cjs request stays valid while its target file still exists.
- Real file, content-hashed path, siblings pruned before writing: correct. Deleting the old file invalidates the cached resolution. The virtual path gets this for free because the old virtual path is simply not registered in the next build.

Caveat. The virtual row's freshness depends on the old path disappearing. Anything that keeps an old composed path resolvable (two compilers sharing a directory, a stale real file at a virtual path) reintroduces the stale-alias hazard. A wrapper could also fold the sha into `cache.version`. That was not tested.

### Q2. Resolve exports subpaths with rspack's resolver from the wrapper: yes from `make`, only with explicit conditionNames from `afterEnvironment`

API: `compiler.resolverFactory.get('normal', opts).resolveSync({}, <directory>, <request>)` returns the path string (it throws `RspackResolver(NotFound(...))` on a miss). The `_context` argument is ignored.

- `make`: `{ dependencyType: 'esm' }` resolves `@module-federation/runtime/core` to `dist/core.js` and `@module-federation/webpack-bundler-runtime` to `dist/index.js`. `{ dependencyType: 'commonjs' }` and `{}` resolve them to the `.cjs` files. The bare `@module-federation/runtime` always resolves to `dist/index.cjs`, because the native plugin's non-`$` alias applies. `/bundler` is a plain string export, so it resolves to `dist/bundler.js` under every condition.
- `afterEnvironment`: `dependencyType` is ignored. esm, commonjs and `{}` all return the `.js` files, so `import` wins only by accident. The native binding's resolver factory was built in the `Compiler` constructor from the pre-defaults options, before `byDependency` defaults and plugin aliases existed. Spreading `compiler.options.resolve.byDependency.esm` (already defaulted by then) or `.commonjs` into the options gives the right `.js` / `.cjs` split. Plugin aliases are still not applied, so the bare runtime resolves to `dist/index.js` here.
- Hazard: `ResolverFactory.get` caches by `JSON.stringify(opts)`. A `get('normal', { dependencyType: 'esm' })` made in `afterEnvironment` returns the same stale resolver in `make`: 24 of 75 `make` results change between q2-afterEnvironment+make and q2-make-only. The compilation's own module resolution is unaffected (both q2 builds match control-none).
- Self-reference works. `@module-federation/webpack-bundler-runtime` resolves from `packages/webpack-bundler-runtime`, which has no node_modules entry for itself. The same holds for `@module-federation/runtime/core` from `packages/runtime`.
