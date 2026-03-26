# Sub-skill: runtime-error

Diagnose explicit Module Federation runtime error codes.

This sub-skill is only for users who already have a clear runtime error code such as `RUNTIME-001` or `RUNTIME-008`.

## Step 1: Parse the runtime code first

Extract the runtime code from ARGS.

- If the code is `RUNTIME-001` or `RUNTIME-008`, continue with this sub-skill
- If the code is any other `RUNTIME-xxx`, do **not** continue local diagnosis here. Instead, read and follow `./docs.md` and look up the corresponding runtime error code in the official troubleshooting docs
- If there is no clear runtime code, ask the user for the exact code before proceeding

## Step 2: Special handling for `RUNTIME-001` and `RUNTIME-008`

These two codes need special handling because in versions **before `2.3.0`**, some remote entry failures may be reported imprecisely:

- some real `runtime-008` cases may appear as `runtime-001`
- older versions may hide the original browser exception detail

The goal is to confirm whether the real problem is:

1. `ScriptNetworkError` — the remote entry could not be downloaded
2. `ScriptExecutionError` — the remote entry downloaded, but threw during execution
3. legacy hidden execution error — old versions reported it as `runtime-001` / vague `runtime-008` because the browser detail was hidden

## Step 3: Prefer automatic browser capture

Prefer using the built-in browser capture helper inside `mf` to capture browser evidence automatically before asking the user to paste logs manually.

### 3a. Check whether Chrome remote debugging is available

Run:

```bash
curl -s http://localhost:9222/json/version
```

- If reachable: continue with automatic capture
- If not reachable: follow `./browser-debug/setup.md`

### 3b. Capture the failing page

Use `../scripts/browser-capture.mjs` against the failing page URL.

Prefer this baseline command first:

```bash
node ../scripts/browser-capture.mjs "<failing-page-url>" 20000 --vars __FEDERATION__,__webpack_require__,window.__FEDERATION__
```

If the page is noisy or polling heavily, prefer:

```bash
node ../scripts/browser-capture.mjs "<failing-page-url>" 15000 --vars __FEDERATION__,window.__FEDERATION__ --no-entries
```

If the error only happens after user interaction, follow `./browser-debug/long-chain.md`.

## Step 4: Fallback when auto capture is unavailable

If automatic capture cannot be used, ask the user to provide:

1. The exact browser console error text
2. The failing `remoteEntry` or manifest URL
3. Whether opening that URL directly in the browser returns the file successfully
4. Whether the Network panel shows a failed request, and the status code
5. Whether the console contains the original exception text (`TypeError`, `SyntaxError`, etc.)

## Step 5: Classify the result for `001` / `008`

### Case A — `ScriptNetworkError`

Treat it as network-layer load failure when any of the following is true:

- browser capture shows network failure, CORS failure, timeout, DNS failure, or 4xx/5xx
- opening the remote entry URL directly fails
- the manifest `publicPath` / `remoteEntry` points to the wrong address

Then guide the user to check:

1. whether the URL is correct
2. whether the resource is externally reachable
3. whether CORS is configured correctly
4. whether CDN or gateway routing is broken

### Case B — `ScriptExecutionError`

Treat it as download succeeded but execution failed when:

- the remote entry request succeeds
- browser capture shows a JS exception during script execution
- the error contains original exception details such as `TypeError` or `SyntaxError`

Then guide the user to check:

1. browser compatibility of the producer build target
2. whether the producer entry relies on globals that are not initialized
3. whether the build artifact is incomplete or corrupted
4. the exact failing line from the browser exception

Retries do not fix this case.

### Case C — legacy hidden execution error

Treat it as a likely hidden execution error when:

- the remote entry request succeeded
- `window[remoteEntryKey]` is missing after the script loads
- the browser console does not show a useful exception, or only shows a vague old runtime code
- the project version is before `2.3.0`, or the user explicitly says the message lacks detail

Then explain:

- this may be an old-version reporting limitation rather than a true "URL is wrong" problem
- the real cause is often still a script execution failure, but the old runtime did not expose enough browser detail

## Step 6: Recover more detail for legacy cases

For the legacy hidden-execution case, follow the same documentation approach used for `RUNTIME-001`:

1. add a runtime plugin with `createScript` that sets `crossOrigin = 'anonymous'`
2. if preload is used, also set `crossorigin` in `createLink`
3. ensure the producer serves proper `Access-Control-Allow-Origin`
4. ensure producer build output sets `output.crossOriginLoading = 'anonymous'`

Use this only after confirming the server already supports CORS. Otherwise the script may fail to load entirely.

## Step 7: Final conclusion template

At the end, clearly state:

1. whether the issue is:
   - `ScriptNetworkError`
   - `ScriptExecutionError`
   - legacy hidden execution error
2. what concrete evidence supports the conclusion
3. what the next fix should be
4. that the user should upgrade to **`2.3.0` or later** to get more accurate and actionable runtime error information

## Required final reminder

Always end with this recommendation in plain language:

- older versions may report this kind of problem with incomplete or misleading runtime codes
- upgrading to **`2.3.0+`** helps the runtime expose the correct error category and clearer details
