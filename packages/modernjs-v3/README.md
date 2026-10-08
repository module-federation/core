# @module-federation/modern-js-v3

This plugin provides Module Federation supporting functions for Modern.js

See [documentation](https://module-federation.io/guide/framework/modernjs.html) for more details .

## SSR cache updates (opt-in)

This requires the companion Modern `server-core` selective application owner and
Rspack's MF invalidation graph (verified with
`2.2.3-canary-ba52386c-20260916132656`). Enable `ssr: { cacheUpdates: true }` in
this plugin's options to emit entry ownership metadata and install its Node-only
consumption tracker. It also installs a browser release bootstrap reader and
shares `react`, `react-dom` and `react-dom/server` as singletons on the server.
An explicit `singleton: false` for these dependencies is rejected. Re-executing
React's server renderer during every rebuild can retain previous renderers through
its dispatcher chain, including old application and request objects. The renderer
must share the lifetime of the consumed React singleton.

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
  hydration: {
    remotes: [{ name: 'remote', entry: 'https://cdn.example.com/v1/mf-manifest.json' }],
  },
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
  async validate(resources) {
    adapter.prepareResources(resources);
    // Validate any other unpublished application resources here.
  },
  async dispose(_resources, entries) {
    await adapter.dispose(entries);
    // Await any additional cleanup owned by this application here.
  },
};
// Pass ssrApplication to createProdServer with your other server options.
// Invoke from the control plane, outside a rendering request:
const result = await adapter.update(
  application,
  'remote',
  {
    entry: 'https://internal.example.com/v2/mf-manifest.json',
    client: { entry: 'https://cdn.example.com/v2/mf-manifest.json' },
  },
  { revision: 2 },
);
// result also includes revision, appliedRevision, operationId and timingsMs.
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
remain. Numeric module IDs, minification and module concatenation pass selective
artifact tests with the verified preview. It fixes the missing concatenated
consumer ancestry in the earlier 76e8f696 preview. An incomplete graph still returns
`incomplete-parent-closure` and triggers whole-application rebuilding. Code merged
inside one affected emitted module necessarily executes again with that module;
unrelated emitted modules remain cached.

`staticOnly` is a contract, not a claim to analyze arbitrary JavaScript. Runtime
`loadRemote` or out-of-owner registrations/removals permanently invalidate the
instance's static proof. During a selective update, a newly attempted dynamic
load rejects before executing; concurrent out-of-owner mutations also reject.
Applications needing those operations must use the dynamic/mixed mode and perform
updates through this adapter. Source scanning is an additional conservative check,
not the sole proof. Do not independently mutate the same instance from another
control plane.

After mutation/publication failure, affected SSR scopes stay closed. The default request policy returns 503; an explicit CSR policy may serve the last published public HTML shell. Explicit retry
expands to whole-application rebuilding, including when removal succeeded but
registration failed. `updateRemotes` also registers unknown names; a runtime-only
remote uses whole-application rebuilding.
There is no rollback promise. Drain timeout occurs before mutation and restores
serving. Configure a trusted liveness bypass separately from readiness.

This owner does not restart deployment workers, undo arbitrary globals/listeners
or discover unregistered background promises. Work that outlives rendering must
be explicitly tracked. CommonJS application roots are supported; native ESM roots
and RSC are outside this implementation.

### Request policy and notifications detected during SSR

Configure a server-owned function in `ssrApplication.requestPolicy` (or choose the
fixed value `wait`, `csr`, or `reject`). Import the function from a server file; it
must not live in the retiring SSR bundle. It runs synchronously before SSR
admission, only for affected requests during updates and terminal wait conditions.

```ts
// host/server/request-policy.ts
export default function requestPolicy({ request, update }) {
  const url = new URL(request.url);
  // Public HTML shells only; loaders/actions still need the server application.
  if (request.method === 'GET' && url.pathname === '/public-weather' && !url.searchParams.has('__loader')) return 'csr';
  return update.reason === 'updating' ? 'wait' : 'reject';
}
```

`update` contains `phase`, `generation`, `affectedEntries` (undefined means the
whole application), `activeRequests`, `pendingRequests`, `waitedMs` and `reason`.
Reasons are `updating`, `timeout`, `queue-full`, or `unavailable`. `wait` at a
terminal reason returns 503. Policy errors and unsupported async results also
return 503. Queued requests resume in arrival order, with at most
`maxResumeConcurrency` complete request leases at once (default 8); this does not
limit ordinary or unaffected traffic.

CSR responds from the last successfully published template, including its public
release mapping, without executing SSR handlers, loaders or downstream business
middleware. Use it for public shells or enforce authorization before the admission
gate; downstream authentication, rewrite and per-request CSP middleware do not run
for this response. Loader/action requests cannot be converted into HTML. Pages
requiring server loaders must wait for their data requests or use an independent
client data path. CSR responses are `no-store`; old client assets must remain
available at immutable URLs.

A version service or deployment platform supplies an application-wide monotonic
`revision` and complete replacement information. The adapter does not poll or
infer changes behind the same URL. A newer revision can refresh an unchanged URL.

```ts
const release = await fetchRelease(); // Your version service; bounded timeout.
if (
  adapter.shouldUpdateRemotes(application, release.remotes, {
    revision: release.revision,
  })
) {
  // Outside SSR: resolves only after successful publication.
  await adapter.updateRemotes(application, release.remotes, {
    revision: release.revision,
  });
}
```

The check is read-only. Already applied/stale revisions return false; pending or
failed revisions return true. Duplicate pending calls reuse the operation; a
conflicting payload under one revision throws. Remote aliases, batch order and
client metadata use the same normalization for checking and updating. Keep one
adapter per application, and use the same authoritative revision sequence across
all remotes in that application.

When server-side business code discovers a change while rendering, submit it
through the bound service with an explicit deferred option:

```ts
const receipt = adapter.updateRemotes(application, release.remotes, {
  revision: release.revision,
  defer: 'after-response',
});
// receipt: { operationId, revision, phase: 'scheduled' | 'pending' | 'applied' }
// Returned synchronously; continue producing the current response.
```

The deferred overload returns `SSRUpdateReceipt` synchronously, not a Promise.
Submission errors, such as invalid input or a full deferred queue, throw
synchronously and can be caught around this call. Receiving a receipt does not
mean the release has been published.

Modern waits for that response stream and its registered producer work to settle,
then executes the submission outside the request context and enters its normal
update queue. Other affected in-flight requests are drained before mutation.
`adapter.status(application)` reports scheduled/pending/applied/failed state;
`appliedRevision` advances only on successful publication. Accepted operations
that later fail record their errors in this status; they do not throw back into
the completed render.
`maxPendingUpdates` bounds deferred operations (default 32). Newer accepted
notifications supersede older deferred revisions that have not started. A rejected
submission does not supersede an earlier accepted release.

The ordinary overload still returns a Promise that resolves after publication,
and rejects inside an active SSR request,
including duplicate notifications. Do not use timers to escape this rule: they
inherit the request context. The `updateRemotes` bound above belongs to this Modern
adapter, not the generic `@module-federation/enhanced/runtime` API.

### Public release mapping and hydration

When `hydration` is enabled, every update requires explicitly public `client`
metadata paired with the server release. Missing or invalid metadata rejects
before mutation. `prepareResources` inserts a JSON release mapping before browser
startup in the candidate templates; publication occurs through Modern's validation
hook. An old HTML response therefore starts with its old public remote entry while
new HTML starts with the new entry. Aliases resolve to the configured provider name.
Only `name`, `entry`, `type` and `entryGlobalName` cross this boundary; server URLs
and server-only options are never inferred into HTML. Do not put secrets in these
explicit public fields. URL credentials are rejected.

Serve immutable versioned manifests, remote entries and chunks, and retain old
assets for the maximum HTML/cache/session lifetime supported by the service. This
adapter does not upload or retain CDN assets, switch an already-running browser
session, or update consumed React/shared singleton versions. Private server entry
URLs can differ from public client URLs, but both must describe the same release.
Without `hydration`, template injection is disabled and the caller owns release
pinning; server cache invalidation alone cannot guarantee hydration consistency.

Keep dynamic registration/update state in the persistent control plane. A rebuilt
business module must not replay `registerRemotes` with stale initial targets:
registration is new-only, identical configurations are idempotent, and conflicts
must use `updateRemotes`. The compiler-generated bootstrap preserves accepted
targets. Revisions are positive safe integers ordered per application/worker;
duplicate pending/applied messages reuse the operation, while stale/conflicting
messages reject. A failed revision can be explicitly retried.

### Diagnostics and acceptance

`adapter.status(application)` exposes the latest operation, phase, stage,
applied revision and completed stage durations. Results contain `timingsMs` for
queue, analyze, drain, clear, rebuild and total time. Rejected operations include
`failedStage`, timings and `mutationStarted`; they do not advance `appliedRevision`.
Read Modern's application status for active/pending counts and serving readiness.
Use a trusted direct bypass for liveness so failed publication does not trigger an
unnecessary process restart. Queue limits and timeouts must be chosen for the
service's measured capacity; the fixture's limits are test settings.

The reproducible production fixture is `apps/modernjs-ssr/cache-updates/e2e/production.cjs`. It builds
real Modern host/provider applications, serves their compiled output, checks new
and delayed old HTML hydration in Chromium, exercises stream/loader/action and
failure paths, and measures repeated same-process rebuilds after GC. See
`tools/ssr-cache/VALIDATION.md` for exact versions, results and release acceptance
limits. This bounded fixture is not a deployment-specific capacity benchmark.
