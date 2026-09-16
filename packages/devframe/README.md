# @module-federation/devframe

A small, read-only Module Federation integration for [Devframe](https://devfra.me/). It has no UI, runtime plugin, instrumentation, or standalone MCP server.

> This integration exposes the current Module Federation runtime state. Historical lifecycle and performance data require instrumentation to be enabled before the relevant runtime events occur.

## Setup

Install in your development tooling (Devframe 1.x, tested with 1.0.0):

```sh
pnpm add -D @module-federation/devframe devframe @devframes/hub @devframes/agentic
```

Mount the definition in your existing Devframe host. For example, with a Node development server:

```ts
// devtools.ts — server only
import { initHub } from '@devframes/hub/initiate';
import { createModuleFederationDevframe } from '@module-federation/devframe';

export const hub = initHub({
  base: '/__devframes/',
  devframes: [createModuleFederationDevframe()],
});

await hub.ready;
// Connect-compatible hosts: server.middlewares.use(hub.nodeMiddleware).
// Web Standard hosts: route /__devframes/* to hub.handler(request).
// The host must also serve Devframe's live transport; see its hosting guide.
// Dispose the host with await hub.close().
```

The Hub owns authentication, transport and MCP exposure. With `@devframes/agentic` installed, its default `mcp: 'auto'` exposes the registered agent surface. Keep the host development-only and use Devframe's normal trusted-client authentication. See [Hub hosting](https://devfra.me/guide/hub) and [Agent exposure](https://devfra.me/guide/agent-native).

**Also connect from the application page**, using your bundler's development-only entry/guard. Mounting a definition on the server alone cannot read a browser's globals:

```ts
// Application's development entry — browser only
import { connectModuleFederationDevframe } from '@module-federation/devframe/client';

const reader = await connectModuleFederationDevframe({
  baseURL: '/__devframes/',
  // Supply authToken here if your host manages Devframe authentication.
});

// On HMR disposal or development-entry teardown:
// reader.close();
```

Connecting after MF initialization or remote loading is supported. No navigation, early injection or Observability Plugin is required. Connect in the inspected application realm, not in a DevTools iframe. Each connected page/frame is a separate candidate. The integration opens its own connection; `close()` releases it.

## Read-only capabilities

| Devframe ID                     | Result                                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `module-federation:status`      | Presence, all retained instances, per-instance runtime/application versions, supported current-state fields |
| `module-federation:remotes`     | Configured remotes, aliases, sanitized entries, cached producer metadata and initialization state           |
| `module-federation:shared`      | One row per instance, scope, package and version; provider, loaded flag and share configuration             |
| `module-federation:module-info` | Allowlisted SDK module snapshot metadata and exposed module names/paths                                     |

Every capability is a `query` with read safety and an agent description. Devframe's MCP adapter normalizes colons to underscores (for example `module-federation_status`). There is one non-agent transport handshake, `module-federation:connect-reader`; it only associates an authenticated Devframe session with the browser reader, and cannot mutate MF.

Queries accept an optional `{ pageId }`. With several connected readers, queries return `{ state: 'ambiguous', candidates: [{ pageId }, ...] }`. Supply a candidate explicitly; no page is selected silently. For MCP, the optional object is the positional `arg0`:

```json
{ "arg0": { "pageId": "page-1" } }
```

Page IDs last for a transport connection. Instance IDs last for a browser reader's lifetime and distinguish duplicate visible names. A reconnect can change the page ID; rediscover candidates. All instances are returned, so no instance selector is needed.

No connected reader, a disconnected page, an invalid snapshot or a three-second read timeout returns `state: 'unavailable'`. A reachable page without MF returns `state: 'available', present: false` with empty lists. Missing optional fields are `null`; capability flags distinguish unavailable structures from empty ones. Every successful query reads live state; there is no history or last-known snapshot cache.

## Data sources and interpretation

The independent `createModuleFederationReader()` factory in `/reader` reads only existing MF-owned structures: `__FEDERATION__.__INSTANCES__`, instance `options`, `version`, `shareScopeMap`, `moduleCache`, and SDK `__FEDERATION__.moduleInfo`. It does not import/initialize runtime-core or add any MF public runtime API. Existing runtime imports initialize federation globals; the Observability Plugin's richer state API depends on its event manager, so neither is a runtime dependency here.

- `loaded: 'loaded'` means a cached MF `Module.inited` is `true`, i.e. its remote container initialized. It does not prove that a particular exposed module factory ran. `not-initialized` is an explicit current `inited: false`; absent cache/flags give `unknown`, never “never loaded”.
- The instance role is `consumer` when remotes are configured, otherwise `unknown`. A producer-only container need not have its own MF runtime instance. V1 does not infer a producer role from a same-named snapshot. `producer` on a remote is cached `remoteInfo`, while `candidateInstanceIds` are only exact name/version candidates, not confirmed ownership relationships.
- Shared versions are never collapsed. `loaded` is the runtime's explicit flag. Multiple loaded versions are possible; no selected winner or resolution reason is inferred. Scope maps absent from an instance are not guessed from name-keyed global maps.
- Module info is a metadata snapshot, not a list of evaluated modules. It can be unavailable when runtime snapshot support is disabled. Relative entry/path values remain relative; dynamic `getPublicPath` code is never evaluated or returned.
- Limits: 32 instances; 256 total remotes, Shared rows, module-info records, and exposed module records; 240 characters per text field; 16 connected readers. Truncation is explicit. These are bounded summaries, not a paginated inventory.
- Only data properties on allowlisted fields are read. No factories, containers, component objects, arbitrary application metadata, cookies, response bodies or function source are serialized. HTTP(S) URLs lose credentials, query and fragment; unsafe schemes are omitted. Snapshot keys containing URLs are sanitized too. The server validates the snapshot's shape and bounds before agent exposure.

The channel is Devframe's supported bidirectional RPC: browser `connectDevframe` + client RPC registration → live snapshot → server query → `ctx.agent` → Hub/MCP. The server never reads its own `globalThis` as a substitute for the application. No browser tool registration internals or manual MCP protocol are used.

## Further diagnostics

Lifecycle traces, Shared selection/registration history, Bridge events, resource/navigation/paint timing, performance, proxy remotes, runtime replacement and all MF mutation actions are intentionally outside V1. Use the MF Observability Plugin and the [Divebell MF extension](https://github.com/2heal1/divebell/tree/main/packages/extensions/mf) for diagnostics that require early instrumentation; neither is a dependency.

API references checked against Devframe 1.0.0 and source `790b76de65cd11fb4589e78ab76b25d3253111ec`: [RPC](https://devfra.me/guide/rpc), [browser client](https://devfra.me/guide/client), [agent surface](https://devfra.me/guide/agent-native). Divebell source `cb227ea8a48864e035545d0d0f9e22b2dc3d5a0a` informed the explicit identities, ambiguity handling and multi-version Shared model.
