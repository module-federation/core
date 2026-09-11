# @module-federation/modern-js-v3

This plugin provides Module Federation supporting functions for Modern.js

See [documentation](https://module-federation.io/guide/framework/modernjs.html) for more details .

## SSR cache updates (R4, opt-in)

This requires the companion Modern `server-core` selective application owner and
Rspack's MF invalidation graph (verified with
`2.2.3-canary-76e8f696-20260911033013`). Enable `ssr: { cacheUpdates: true }` in
this plugin's options to emit entry ownership metadata and install its Node-only
consumption tracker. Browser behavior is unchanged.

Use `createSSRUpdateAdapter` from `@module-federation/modern-js-v3/server` with the
MF application `name` and the complete list of Modern **entry names**. The
following illustrates the hooks to supply to `createProdServer` alongside your
normal server options:

```ts
const adapter = createSSRUpdateAdapter({
  name: 'host',
  entries: ['main', 'admin'],
  // Enable only if all request-side remote consumption is compiled static imports.
  staticOnly: true,
});
let application;
const ssrApplication = {
  // Choose these limits for the service's measured latency and capacity.
  maxPendingRequests: limits.maxPendingRequests,
  requestTimeoutMs: limits.requestTimeoutMs,
  drainTimeoutMs: limits.drainTimeoutMs,
  onReady(value) {
    application = value;
  },
  resolveScope(request) {
    // Return all entries this request can consume, using the service's routing.
    // Return undefined for unknown scope; it intersects every update.
    return classifyRequestEntries(request);
  },
  reloadEntry: adapter.reload,
  async dispose(_resources, entries) {
    adapter.dispose(entries);
    // Await any additional cleanup owned by this application here.
  },
};
// Pass ssrApplication to createProdServer with your other server options.
// Invoke from the control plane, outside a rendering request:
const result = await adapter.update(application, 'remote', {
  entry: 'https://example.com/v2/mf-manifest.json',
});
// result: { mode: 'entries' | 'application', entries?, reasons, generation }
```

The classifier must describe actual middleware, render and loader ownership. It
must not infer ownership from a URL prefix unless the service's routing guarantees
that mapping. A renderer rewrite into an entry outside the admitted scope returns 503. Custom middleware that consumes multiple entries must declare all of them or
return unknown scope. Empty scopes are rejected, not treated as a bypass.

Planning runs inside Modern's update queue before admission closes. The plugin
traverses Rspack module/chunk graphs, links remote consumers to entry roots, and
checks the native invalidation ancestor closure. Merely locating a chunk is not
proof. Entries sharing a bundler runtime drain together. Modern waits for affected
requests, response bodies and tracked producer work, replaces the remote, reloads
invalidated render/loader roots in the existing runtimes, validates, and publishes
new resources and HTML-cache namespaces. Other entries continue serving; unrelated
compiled modules and shared identities are retained. Several routes within one
Modern entry share App/runtime hooks and therefore update together.

With dynamic/mixed consumption (the default when `staticOnly` is omitted), missing
ownership, or an incomplete native graph, the adapter reports reasons and rebuilds
the whole application in the same process. The HTTP server and listening port
remain. Numeric module IDs and minification pass selective artifact tests. **With
module concatenation, the tested preview can omit a path to an entry root; this
returns `incomplete-parent-closure` and uses whole-application rebuilding.** R4 does
not claim fine-grained updates for every optimized graph.

`staticOnly` is a contract, not a claim to analyze arbitrary JavaScript. Runtime
`loadRemote` or out-of-owner registrations/removals permanently invalidate the
instance's static proof. During a selective update, a newly attempted dynamic
load rejects before executing; concurrent out-of-owner mutations also reject.
Applications needing those operations must use the dynamic/mixed mode and perform
updates through this adapter. Source scanning is an additional conservative check,
not the sole proof. Do not independently mutate the same instance from another
control plane.

After mutation/publication failure, affected scopes return 503. Explicit retry
expands to whole-application rebuilding, including when removal succeeded but
registration failed. Unknown remote names fail preflight before closing admission.
There is no rollback promise. Drain timeout occurs before mutation and restores
serving. Configure a trusted liveness bypass separately from readiness.

This owner does not restart deployment workers, undo arbitrary globals/listeners
or discover unregistered background promises. Work that outlives rendering must
be explicitly tracked. CommonJS application roots are supported; native ESM roots
and RSC are outside this implementation. R5's generic `updateRemotes`/registration
API migration and R6's browser hydration, load and long-running resource acceptance
remain separate work; this adapter currently composes the existing MF operations.
