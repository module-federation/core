# Long-Chain Capture

Keep a tab alive across multiple steps — navigate, click through interactions, then capture.

## Usage

```bash
# Step 1 — open tab, keep it alive
TAB=$(node ../scripts/browser-capture.mjs "https://example.com" --keep-tab | jq -r .tabId)

# Step 2 — click through the interaction chain (faster: domcontentloaded/none)
node ../scripts/browser-capture.mjs --tab-id "$TAB" --click "Profile" --action-wait domcontentloaded
node ../scripts/browser-capture.mjs --tab-id "$TAB" --click "Favorites" --action-wait none

# Step 3 — final action, capture variables, close tab
node ../scripts/browser-capture.mjs --tab-id "$TAB" --click "Add" --vars __FEDERATION__ --action-wait networkidle --close
```

## Flags

| Flag | Description |
|---|---|
| `--keep-tab` | Don't close tab after capture; outputs `tabId` in result |
| `--tab-id <id>` | Attach to existing tab instead of navigating |
| `--click "<text or selector>"` | Click an element; matching prefers CSS/interactive elements first |
| `--fill "placeholder::text"` | Type into an input/textarea located by placeholder |
| `--select "placeholder::value"` | Choose an option in a select located by placeholder |
| `--action-wait <auto|networkidle|domcontentloaded|timeout|none>` | Wait strategy after click/fill/select (`auto` is default; use `networkidle` on the final step when strict consistency is needed) |
| `--no-entries` | Exclude entries logs to speed up capture and reduce output size |
| `--dump-dom` | Output page DOM structure (for identifying selectors) |
| `--close` | Close the tab after this step |

## Click matching

Applied in order:
1. If query starts with `#`, `.`, `[`, or contains `>` → CSS selector
2. Strong interactive elements (`button`, `a`, role/button/tab/menuitem/option, submit/button inputs)
3. Weak interactive elements (`div`/`span`/`li`) only when they look clickable (`cursor:pointer`, `onclick`, or focusable tabindex)
4. Text match priority inside each layer: **exact** → **prefix** → **contains**

## Fill (input/textarea)

Locates the field by `placeholder` attribute, injects text using native value setter — compatible with React and Vue controlled inputs.

```bash
node ../scripts/browser-capture.mjs --tab-id "$TAB" --fill "Enter keyword::Module Federation"
```

## Select (dropdown)

Locates by `placeholder` attribute or default option text, then:
- **Native `<select>`** — sets value directly and dispatches `change`
- **Custom dropdown** — clicks the trigger to open, then clicks the matching option

```bash
node ../scripts/browser-capture.mjs --tab-id "$TAB" --select "Select environment::Production"
```

## When element is not found

Use `--dump-dom` to let Claude inspect the page and identify the correct selector:

```bash
node ../scripts/browser-capture.mjs --tab-id "$TAB" --dump-dom
# Claude analyzes the DOM, then:
node ../scripts/browser-capture.mjs --tab-id "$TAB" --click "#profile-nav-btn"
```

## Tab lifecycle

- New tab (no `--tab-id`) → auto-closes unless `--keep-tab`
- Existing tab (`--tab-id`) → stays open unless `--close`
