# Browser Capture Setup

One-time setup: create a debug Chrome profile that shares your real cookies/auth.

---

## Why a separate profile directory?

Chrome **refuses** to enable remote debugging on the default profile directory
(`~/Library/Application Support/Google/Chrome`) as a security measure:

```
DevTools remote debugging requires a non-default data directory.
```

The workaround: copy your real profile to a non-default path. Because macOS Chrome
encrypts cookies using the system Keychain (`Chrome Safe Storage` key), a copied
profile can still decrypt cookies — so you stay logged into all your sites.

---

## One-time setup (macOS)

**Step 1 — See which profiles you have:**
```bash
node -e "
const fs = require('fs');
const base = process.env.HOME + '/Library/Application Support/Google/Chrome';
const state = JSON.parse(fs.readFileSync(base + '/Local State', 'utf8'));
const cache = state.profile.info_cache;
const last  = state.profile.last_used;
console.log('Available Chrome profiles:\n');
Object.entries(cache).forEach(([dir, info]) => {
  const tag = dir === last ? ' ← current' : '';
  console.log('  ' + dir.padEnd(12) + info.name + tag);
});
console.log('\nDefault: ' + last);
"
```

**Step 2 — Sync the chosen profile to the debug location:**
```bash
# Set PROFILE to the dir you want (default: current profile, usually "Default")
PROFILE="Default"   # ← change to e.g. "Profile 1" if needed
REAL="$HOME/Library/Application Support/Google/Chrome/$PROFILE"
DEBUG_DIR="$HOME/Library/Application Support/Google/ChromeDebug"
mkdir -p "$DEBUG_DIR"
rsync -a --delete "$REAL/" "$DEBUG_DIR/Default/"
echo "Debug profile ready: $DEBUG_DIR (sourced from $PROFILE)"
```

> **Note:** `rsync --delete` is incremental — fast after the first sync. Re-run any time
> sessions have expired. The Keychain entry (`Chrome Safe Storage`) is shared, so
> encrypted cookies still decrypt correctly from the copied profile.

---

## Launch with remote debugging

```bash
CHROME=$(find /Applications ~/Applications -name "Google Chrome" -path "*/MacOS/Google Chrome" 2>/dev/null | head -1)
DEBUG_DIR="$HOME/Library/Application Support/Google/ChromeDebug"

killall "Google Chrome" 2>/dev/null; sleep 1
"$CHROME" --remote-debugging-port=9222 --user-data-dir="$DEBUG_DIR" &
```

**One-time alias** — add to `~/.zshrc`:
```bash
# Usage: chrome-debug [ProfileDir]   e.g. chrome-debug "Profile 1"
chrome-debug() {
  local PROFILE="${1:-Default}"
  local REAL="$HOME/Library/Application Support/Google/Chrome/$PROFILE"
  local DEBUG_DIR="$HOME/Library/Application Support/Google/ChromeDebug"
  local CHROME=$(find /Applications ~/Applications -name "Google Chrome" -path "*/MacOS/Google Chrome" 2>/dev/null | head -1)
  echo "Syncing profile: $PROFILE → $DEBUG_DIR"
  mkdir -p "$DEBUG_DIR"
  rsync -a --delete "$REAL/" "$DEBUG_DIR/Default/"
  killall "Google Chrome" 2>/dev/null; sleep 1
  "$CHROME" --remote-debugging-port=9222 --user-data-dir="$DEBUG_DIR" &
  echo "Chrome launching with debug profile (port 9222)..."
}
```

Then run (using current/default profile):
```bash
chrome-debug
```

Or pick a specific profile:
```bash
chrome-debug "Profile 1"
```

---

## Verify

```bash
curl -s http://localhost:9222/json/version
```

Should return something like:
```json
{
  "Browser": "Chrome/124.0.0.0",
  "webSocketDebuggerUrl": "ws://localhost:9222/devtools/browser/..."
}
```

---

## Prerequisites

- **Node.js 21+** — required for built-in WebSocket support

## Usage

```bash
node ../scripts/browser-capture.mjs "<url>" [timeout_ms] [--vars var1,var2,...]
```

- Default timeout: 15 000ms
- Script opens a new tab in your Chrome debug profile (inherits its cookies/auth), navigates to the URL, waits for network to settle, then returns logs as JSON
- The tab is automatically closed after capture

---

## Troubleshooting

**`DevTools remote debugging requires a non-default data directory`**
→ Chrome blocks debugging on the default profile. Follow the one-time setup above to
create `~/Library/Application Support/Google/ChromeDebug`.

**Connection refused / port still closed**
→ `open -na` silently reuses the existing Chrome process. Use the binary path approach above.

**Cookies expired / not logged in after copying profile**
→ Re-run the profile copy command to refresh it from your real profile.

**`Node.js 21+ required` error**
→ Upgrade Node.js: `nvm install 21 && nvm use 21` (or install from nodejs.org).

**`PUT /json/new` fails (older Chrome)**
→ Try downgrading to Node's `fetch` with `GET /json/new` — edit the `fetch(..., { method: 'PUT' })` line in `browser-capture.mjs` to remove the method option (defaults to GET).

**Page loads but no logs captured**
→ The page may have errored before CDP attached. Try increasing timeout, or check if the error only triggers on user interaction.
