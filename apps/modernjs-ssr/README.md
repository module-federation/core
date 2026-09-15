# Modern SSR Playground

One workspace for SSR rendering, static and dynamic remotes, cache updates,
hydration, concurrent traffic, and process memory.

## Start locally

Use Node 24 and pnpm 10.28.0 from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@module-federation/modern-js-v3
pnpm run demo:modern:ssr
```

Open <http://127.0.0.1:3058/> after the terminal prints `PLAYGROUND_READY`.
The command builds two hosts and immutable v1/v2 providers, then serves their
production output. It keeps running until Ctrl+C. Host processes, asset serving
and the traffic generator are managed automatically; no remote terminals are
needed. Set `SSR_CACHE_DEMO_PORT` to change the control page port.

The workspace has two pages:

- **Functionality** (`/`): SSR previews, version updates and real concurrent traffic.
- **Memory** (`/memory`): explicit samples, GC comparisons and repeated updates.

### SSR, cache and hydration

1. Select **静态 remote**. The two previews are actual SSR documents in iframes.
2. Wait for **Hydrated**, then increase the BPM in the left preview.
3. Choose **更新至 v2**, then **重新请求右侧页面**. The new release changes the purple
   bars to a mint ring. The old preview retains its release and BPM.
4. Open **本次服务端渲染信息** to inspect the request ID, server PID, generation,
   loader module instance and (entry A) remote module instance/release.
5. Use **查看原始 SSR HTML** to inspect the actual response before browser scripts.
6. Switch the right preview to entry B. It is an independent local palette panel.
   Static updates target entry A; entry B's modules and traffic are retained.

The dynamic host is a separate process/build. Choose **动态 remote** to load the
independent palette provider in the browser, or **注册 remote B 并在 SSR 加载**
to register it on the server and request HTML that contains it. Its name is the
provider's actual MF name (`lab_palette`); it is absent from the host's compiled
remote configuration. Dynamic/mixed updates rebuild the application in place.

“Cache” here means SSR/MF module caching, not a whole-page HTML cache. Actual
adapter plans and results are shown; the UI does not infer success from a color
change. In particular, an application fallback is never labelled selective.

### Real requests during updates

Choose **开始并发实验**. A separate Node process:

1. Starts an SSR request that waits inside the real loader.
2. Waits for that loader to enter, then initiates an actual remote update.
3. Waits for Modern's draining state, then sends the configured HTTP requests.
4. Reads every complete response and reports timing, HTTP status and release.

Use **释放旧请求** before three seconds to observe queued requests resume.
Delay release to observe real queue timeouts. Raise the request count to exceed
the 16-request queue and observe real 503 responses. The drain timeout is 15
seconds. A failed drain is reported; release the old request and retry the update.

Every fourth new request targets entry B. It continues during a selective entry A
update, but waits during a whole-app update. Server counters are actual admission
state. “Sent, waiting for response” is deliberately distinct from confirmed
loader entry: transport latency is not asserted to be Modern queue time.
The timeline measures send-to-completion latency, not a fabricated internal
stage breakdown. A 503 is a rejected request, not an automatic stale-HTML fallback.

## Memory and manual debugging

Start with GC enabled:

```bash
pnpm run demo:modern:ssr:memory
```

Open <http://127.0.0.1:3058/memory>. Select the host process, then use **采样一次**,
**GC 后采样**, or **运行重复更新实验**. GC/snapshots require an idle application.
The experiment sends eight real requests per update and samples after GC every
five updates. Treat the first ten cycles as warm-up; use more than ten cycles to
compare the retained heap. Samples and server event buffers are bounded.

The charts separate GC heap and RSS; the table includes external memory,
ArrayBuffers and MF instance count. PID identifies the measured SSR process.
Controller/build/load-generator memory is excluded. Export JSON for comparison.
These trends are diagnostic, not proof that arbitrary business code cannot leak.

For Node Inspector:

```bash
pnpm run demo:modern:ssr:debug
```

This starts the static host with `--inspect=9230 --expose-gc` and the dynamic host
with `--inspect=9231 --expose-gc`. Open `chrome://inspect`, connect to the desired
process and take heap snapshots before/after updates. The memory page also has
an explicit snapshot button; it pauses the selected process and prints the saved
file path. Snapshots are never taken by periodic polling.

The underlying manual startup command is:

```bash
node apps/modernjs-ssr/cache-updates/playground/start.cjs --debug
```

The terminal prints the generated build directory, host URLs and PIDs. All
fixtures are temporary and retained for diagnosis. The demo control endpoints
listen on loopback and are local test tooling, not a production administration API.

## Preview dependency fix

This checkout applies a pnpm patch to the pinned Modern runtime preview for
[Modern #8872](https://github.com/web-infra-dev/modern.js/pull/8872). The playground
reproduced a repeated React `pipe()` call after a lazy remote resolved; without
the fix, subsequent all-ready SSR responses can abort. The patch contains the
same one-time pipeline-start guard as the upstream source PR. Frozen installs
apply it automatically. Remove it after switching to a preview containing that
fix; an independently installed published-package directory must also contain
the fix before running the new playground suite.

## E2E

```bash
# The same playground UI, real traffic and memory experiment:
pnpm --filter modernjs-ssr-cache-updates run e2e:playground

# Static artifact variants, production lifecycle/resource regression, playground:
pnpm run e2e:modern:ssr:cache

# Full Modern SSR CI entry, including retained legacy regressions:
pnpm run e2e:modern:ssr
```

The former demo page has been replaced by this playground. Older app fixtures
remain internal regression inputs for manifest/nested/shared-cache coverage;
they are not additional manual setup steps. Their removal requires migrating
those distinct compatibility assertions, not simply deleting the tests.

Workspace MF build outputs are copied into a temporary consumer-style
`node_modules` layout. Static analysis treats application sources outside
`node_modules` conservatively, so testing linked MF internals directly would
produce an application fallback. This copy uses current workspace code, not
an older published version.

The demo disables server splitChunks to give its MPA entries independent,
loadable runtimes. The default shared-entry split output failed SSR startup in
the tested preview combination; this demo does not claim that configuration is
fixed. Numeric/minified/concatenated artifact cases remain separately tested.

For the exact published-package combination and full validation history, see
[cache E2E](./cache-updates/README.md) and
[validation](../../tools/ssr-cache/VALIDATION.md).
