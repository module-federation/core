# `@module-federation/webpack-bundler-runtime`

- Extract the build runtime and combine it with the internal runtime
- Used with webpack/rspack

## Shared tree-shaking snapshots

The host snapshot describes its build's local shared fallbacks. During
initialization, snapshot metadata is matched to each fallback by name, version,
scope, and layer. It does not describe the provider that version negotiation
will later select. This applies to unlayered shares too: metadata for a different
version or scope cannot install its secondary getter or tree-shaking status on
that fallback.
Older snapshots without version or scope metadata retain their existing matching
behavior.

For example, a host's local fallback can be version 1 while the shared scope
supplies version 2. The version 1 snapshot applies only to the local fallback;
the runtime can still select version 2 under the configured sharing strategy.
Initialization first saves the configured local getter as `treeShaking.get`
and wraps `get` to load the full fallback entry. This replaces any pre-existing
`treeShaking.get`. A matching snapshot can then install a secondary entry getter.
If no snapshot matches, `treeShaking.get` keeps the configured local getter and
the existing tree-shaking status stays unchanged. The wrapped `get` still loads
the full fallback entry.

## Usage

The package needs to be used with webpack/rspack bundler. It will export federation object which includes runtime, instance, bundlerRuntime, initOptions, attachShareScopeMap, bundlerRuntimeOptions.

After referencing, mount it to the corresponding bundler runtime, and then use the corresponding api/instance.

- example

```ts
import federation from '@module-federation/webpack-bundler-runtime';

__webpack_require__.federation = federation;

__webpack_require__.f.remotes = __webpack_require__.federation.remotes(options);
__webpack_require__.f.consumes = __webpack_require__.federation.remotes(options);
```
