#!/usr/bin/env node
// capture.mjs — collect browser logs + JS variables via Chrome DevTools Protocol
//
// New tab:      node capture.mjs <url> [timeout_ms] [--vars v1,v2] [--keep-tab] [--click "text"] [--dump-dom] [--action-wait auto|networkidle|domcontentloaded|timeout|none] [--no-entries]
// Existing tab: node capture.mjs --tab-id <id> [--click "text"] [--fill "ph::text"] [--select "ph::value"] [--vars v1,v2] [--dump-dom] [--close] [--action-wait auto|networkidle|domcontentloaded|timeout|none]
//
// Long-chain example:
//   TAB=$(node capture.mjs https://example.com --keep-tab | jq -r .tabId)
//   node capture.mjs --tab-id $TAB --click "个人"
//   node capture.mjs --tab-id $TAB --fill "搜索框placeholder::关键词"
//   node capture.mjs --tab-id $TAB --select "请选择::选项A"
//   node capture.mjs --tab-id $TAB --click "添加" --vars __FEDERATION__ --close

const CDP_BASE = 'http://localhost:9222';
const IDLE_MS = 500;

// ── argument parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function flagVal(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}

const tabId = flagVal('--tab-id');
const clickTarget = flagVal('--click');
const fillArg = flagVal('--fill'); // "placeholder::text"
const selectArg = flagVal('--select'); // "placeholder::value"
const varNamesRaw = flagVal('--vars');
const varNames = varNamesRaw
  ? varNamesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : [];
const evalExpr = flagVal('--eval');
const keepTab = args.includes('--keep-tab');
const closeTab = args.includes('--close');
const dumpDom = args.includes('--dump-dom');
const noEntriesFlag = args.includes('--no-entries');
const entriesLimitRaw = flagVal('--entries-limit');
const entriesLimit = entriesLimitRaw ? Number(entriesLimitRaw) : null;
const waitUntilRaw = flagVal('--wait-until');
const actionWaitRaw = flagVal('--action-wait');
const hasWaitUntilFlag = waitUntilRaw != null;
const hasActionWaitFlag = actionWaitRaw != null;

const parsedWaitUntil =
  waitUntilRaw === 'domcontentloaded' ||
  waitUntilRaw === 'networkidle' ||
  waitUntilRaw === 'timeout' ||
  waitUntilRaw === 'auto'
    ? waitUntilRaw
    : null;
const parsedActionWait =
  actionWaitRaw === 'networkidle' ||
  actionWaitRaw === 'domcontentloaded' ||
  actionWaitRaw === 'timeout' ||
  actionWaitRaw === 'none' ||
  actionWaitRaw === 'auto'
    ? actionWaitRaw
    : null;

const disableEarlyStop = args.includes('--disable-early-stop');
const followNewTab = !args.includes('--no-follow-new-tab');

// positional args: skip flag names and their values
const flagsWithValues = new Set([
  '--tab-id',
  '--click',
  '--fill',
  '--select',
  '--vars',
  '--eval',
  '--wait-until',
  '--action-wait',
  '--entries-limit',
]);
const skipIdx = new Set();
args.forEach((a, i) => {
  if (flagsWithValues.has(a)) {
    skipIdx.add(i);
    skipIdx.add(i + 1);
  }
});
const positional = args.filter(
  (a, i) => !a.startsWith('--') && !skipIdx.has(i),
);

const targetUrl = positional[0] ?? null;
const timeout = Number(positional[1] ?? 15_000);

if (!targetUrl && !tabId) {
  process.stderr.write(
    'Usage:\n' +
      '  node capture.mjs <url> [timeout_ms] [--vars v1,v2] [--keep-tab] [--click "text"] [--dump-dom] [--eval "expr"] [--wait-until auto|domcontentloaded|networkidle|timeout] [--action-wait auto|networkidle|domcontentloaded|timeout|none] [--no-entries] [--entries-limit N]\n' +
      '  node capture.mjs --tab-id <id> [--click "text"] [--vars v1,v2] [--dump-dom] [--close] [--eval "expr"] [--action-wait auto|networkidle|domcontentloaded|timeout|none] [--no-follow-new-tab]\n',
  );
  process.exit(1);
}

if (!Number.isFinite(timeout) || timeout <= 0) {
  process.stderr.write(
    `Invalid timeout: ${String(positional[1])}. timeout_ms must be a positive number.\n`,
  );
  process.exit(1);
}

if (
  entriesLimitRaw != null &&
  (!Number.isInteger(entriesLimit) || entriesLimit <= 0)
) {
  process.stderr.write(
    `Invalid --entries-limit: ${entriesLimitRaw}. It must be a positive integer.\n`,
  );
  process.exit(1);
}

if (waitUntilRaw != null && parsedWaitUntil == null) {
  process.stderr.write(
    `Invalid --wait-until: ${waitUntilRaw}. Valid values: auto, domcontentloaded, networkidle, timeout.\n`,
  );
  process.exit(1);
}

if (actionWaitRaw != null && parsedActionWait == null) {
  process.stderr.write(
    `Invalid --action-wait: ${actionWaitRaw}. Valid values: auto, networkidle, domcontentloaded, timeout, none.\n`,
  );
  process.exit(1);
}

const AUTO_NETWORKIDLE_MAX_MS = 6_000;
const hasInteractionAction = Boolean(clickTarget || fillArg || selectArg);
const hasPostActionCapture = Boolean(evalExpr || varNames.length || dumpDom);
// Auto-enable --no-entries for pure interaction steps on an existing tab (click/fill/select
// with no variable/eval/dom capture): entries are noise and slow down the chain.
const noEntries =
  noEntriesFlag ||
  Boolean(tabId && hasInteractionAction && !hasPostActionCapture);
const waitUntil = parsedWaitUntil ?? 'auto';
const actionWait = parsedActionWait ?? 'auto';
const effectiveWaitUntil =
  waitUntil === 'auto' ? 'domcontentloaded' : waitUntil;
const effectiveActionWait =
  actionWait === 'auto'
    ? hasInteractionAction
      ? 'domcontentloaded'
      : 'none'
    : actionWait;
const navigateWaitBudgetMs = hasWaitUntilFlag
  ? timeout
  : Math.min(timeout, AUTO_NETWORKIDLE_MAX_MS);
const actionWaitBudgetMs = hasActionWaitFlag
  ? timeout
  : Math.min(timeout, AUTO_NETWORKIDLE_MAX_MS);

if (typeof WebSocket === 'undefined') {
  process.stderr.write(
    'Node.js 21+ required (built-in WebSocket). Current: ' +
      process.version +
      '\n',
  );
  process.exit(1);
}

// ── CDP session ───────────────────────────────────────────────────────────────

class Session {
  #ws;
  #nextId = 1;
  #pending = new Map();
  #listeners = new Map();

  constructor(wsUrl) {
    this.#ws = new WebSocket(wsUrl);
    this.#ws.addEventListener('message', ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.id != null) {
        const p = this.#pending.get(msg.id);
        this.#pending.delete(msg.id);
        msg.error
          ? p?.reject(new Error(msg.error.message))
          : p?.resolve(msg.result);
      }
      if (msg.method)
        this.#listeners.get(msg.method)?.forEach((fn) => fn(msg.params));
    });
  }

  open() {
    return new Promise((resolve, reject) => {
      this.#ws.addEventListener('open', resolve, { once: true });
      this.#ws.addEventListener(
        'error',
        (e) => reject(new Error(String(e.message ?? e))),
        { once: true },
      );
    });
  }

  send(method, params = {}) {
    const id = this.#nextId++;
    this.#ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) =>
      this.#pending.set(id, { resolve, reject }),
    );
  }

  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(fn);
  }

  close() {
    this.#ws.close();
  }
}

// ── verify Chrome reachable ───────────────────────────────────────────────────

try {
  await fetch(`${CDP_BASE}/json/version`);
} catch {
  process.stderr.write(
    'Cannot reach Chrome on port 9222.\n\n' +
      'Quit Chrome and relaunch with remote debugging (macOS):\n' +
      '  CHROME=$(find /Applications ~/Applications -name "Google Chrome" -path "*/MacOS/Google Chrome" 2>/dev/null | head -1)\n' +
      '  killall "Google Chrome" 2>/dev/null; sleep 1\n' +
      '  "$CHROME" --remote-debugging-port=9222 --user-data-dir="$HOME/Library/Application Support/Google/Chrome" &\n\n' +
      'This uses your REAL Chrome profile — all cookies and login sessions are preserved.\n',
  );
  process.exit(1);
}

// ── get or create tab ─────────────────────────────────────────────────────────

let tab;

if (tabId) {
  const tabs = await (await fetch(`${CDP_BASE}/json/list`)).json();
  tab = tabs.find((t) => t.id === tabId);
  if (!tab) {
    process.stderr.write(`Tab not found: ${tabId}\nActive tabs:\n`);
    tabs.forEach((t) => process.stderr.write(`  ${t.id}  ${t.url}\n`));
    process.exit(1);
  }
  process.stderr.write(`Attaching to tab: ${tab.url}\n`);
} else {
  process.stderr.write(
    `Navigating to ${targetUrl} (timeout: ${timeout / 1000}s)...\n`,
  );
  tab = await (await fetch(`${CDP_BASE}/json/new`, { method: 'PUT' })).json();
}

let session = new Session(tab.webSocketDebuggerUrl);
await session.open();

// ── log collection ────────────────────────────────────────────────────────────

const logs = [];
const stamp = () => new Date().toISOString();

session.on('Runtime.consoleAPICalled', ({ type, args: a, stackTrace }) => {
  const msg = a
    .map((x) =>
      x.type === 'string'
        ? x.value
        : x.description
          ? x.description
          : x.value != null
            ? String(x.value)
            : x.type,
    )
    .join(' ');
  const f = stackTrace?.callFrames?.[0];
  logs.push({
    t: stamp(),
    level: type === 'warning' ? 'warn' : type,
    msg,
    stack: f ? `${f.url}:${f.lineNumber + 1}:${f.columnNumber + 1}` : null,
  });
});

session.on('Runtime.exceptionThrown', ({ exceptionDetails: ex }) => {
  const msg = ex.exception?.description ?? ex.text ?? 'Unknown exception';
  const f = ex.stackTrace?.callFrames?.[0];
  logs.push({
    t: stamp(),
    level: 'error',
    msg,
    stack: f ? `${f.url}:${f.lineNumber + 1}` : null,
  });
});

session.on('Network.responseReceived', ({ response }) => {
  if (response.status < 400) return;
  logs.push({
    t: stamp(),
    level: response.status >= 500 ? 'error' : 'warn',
    msg: `[HTTP] ${response.status} ${response.statusText} — ${response.url}`,
    stack: null,
  });
});

const pendingUrls = new Map();
session.on('Network.requestWillBeSent', ({ requestId, request }) =>
  pendingUrls.set(requestId, request.url),
);
session.on(
  'Network.loadingFailed',
  ({ requestId, errorText, blockedReason, canceled }) => {
    if (canceled) return;
    logs.push({
      t: stamp(),
      level: 'error',
      msg: `[network] ${blockedReason ?? errorText} — ${pendingUrls.get(requestId) ?? '?'}`,
      stack: null,
    });
    pendingUrls.delete(requestId);
  },
);

session.on('Log.entryAdded', ({ entry }) => {
  if (entry.level === 'verbose') return;
  logs.push({
    t: stamp(),
    level: entry.level === 'warning' ? 'warn' : entry.level,
    msg: entry.text,
    stack: entry.url ? `${entry.url}:${entry.lineNumber ?? 0}` : null,
  });
});

// ── reusable network-idle waiter ──────────────────────────────────────────────

let inflight = 0;
let idleTimer = null;
const idleCallbacks = new Set();
let lastWait = { earlyStop: false, timedOut: false };

function fireIdle() {
  const cbs = [...idleCallbacks];
  idleCallbacks.clear();
  cbs.forEach((cb) => cb());
}
function scheduleIdle() {
  if (inflight === 0 && idleCallbacks.size > 0) {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(fireIdle, IDLE_MS);
  }
}

session.on('Network.requestWillBeSent', () => {
  inflight++;
  clearTimeout(idleTimer);
  idleTimer = null;
});
session.on('Network.loadingFinished', () => {
  inflight = Math.max(0, inflight - 1);
  scheduleIdle();
});
session.on('Network.loadingFailed', () => {
  inflight = Math.max(0, inflight - 1);
  scheduleIdle();
});

function waitForNetworkIdle(maxMs = timeout) {
  return new Promise((resolve) => {
    let done = false;
    const cb = () => {
      if (done) return;
      done = true;
      lastWait = { earlyStop: true, timedOut: false };
      resolve();
    };
    idleCallbacks.add(cb);
    scheduleIdle();
    setTimeout(() => {
      if (done) return;
      done = true;
      lastWait = { earlyStop: false, timedOut: true };
      resolve();
    }, maxMs);
  });
}

async function waitAfterAction(mode, maxMs = timeout) {
  if (mode === 'none') {
    lastWait = { earlyStop: true, timedOut: false };
    return;
  }
  if (mode === 'networkidle') {
    await waitForNetworkIdle(maxMs);
    return;
  }
  if (mode === 'timeout') {
    await new Promise((r) => setTimeout(r, maxMs));
    lastWait = { earlyStop: false, timedOut: true };
    return;
  }
  await new Promise((r) => setTimeout(r, Math.min(500, maxMs)));
  lastWait = { earlyStop: true, timedOut: false };
}

// ── enable domains & navigate ─────────────────────────────────────────────────

await Promise.all([
  session.send('Runtime.enable'),
  session.send('Network.enable'),
  session.send('Log.enable'),
  session.send('Page.enable'),
]);

const timings = {
  navigateMs: null,
  clickMs: null,
  fillMs: null,
  selectMs: null,
  evalMs: null,
  varsMs: null,
  totalMs: null,
};
let tabTransition = null;
const tStart = Date.now();

if (!tabId && targetUrl) {
  const navigateStart = Date.now();
  const pageLoaded = new Promise((r) => session.on('Page.loadEventFired', r));
  await session.send('Page.navigate', { url: targetUrl });
  await pageLoaded;
  if (!disableEarlyStop && effectiveWaitUntil === 'networkidle') {
    await waitForNetworkIdle(navigateWaitBudgetMs);
  } else if (effectiveWaitUntil === 'domcontentloaded') {
    // do nothing extra
  } else {
    // timeout-only
    await new Promise((r) => setTimeout(r, timeout));
    lastWait = { earlyStop: false, timedOut: true };
  }
  timings.navigateMs = Date.now() - navigateStart;
}

// ── click element ─────────────────────────────────────────────────────────────

let clickResult = null;

if (clickTarget) {
  const clickStart = Date.now();
  process.stderr.write(`Clicking: \"${clickTarget}\"\\n`);

  const beforeTabs = followNewTab
    ? await (await fetch(`${CDP_BASE}/json/list`)).json()
    : null;

  const r = await session.send('Runtime.evaluate', {
    expression: `(function(q) {
      const toText = (node) => (node?.textContent || '').trim();
      const byText = (nodes) => {
        const exact = nodes.find(n => toText(n) === q);
        if (exact) return { el: exact, matchType: 'exact' };
        const prefix = nodes.find(n => toText(n).startsWith(q));
        if (prefix) return { el: prefix, matchType: 'prefix' };
        const contains = nodes.find(n => toText(n).includes(q));
        if (contains) return { el: contains, matchType: 'contains' };
        return null;
      };

      const isSelector = q.startsWith('#') || q.startsWith('.') || q.startsWith('[') || q.includes('>');
      let el = null;
      let matchStrategy = 'none';
      let matchType = 'none';

      if (isSelector) {
        try {
          el = document.querySelector(q);
          if (el) {
            matchStrategy = 'css';
            matchType = 'selector';
          }
        } catch(e) {}
      }

      if (!el) {
        const strongCandidates = Array.from(document.querySelectorAll(
          'button, a, [role=button], [role=tab], [role=menuitem], [role=option], input[type=button], input[type=submit]'
        ));
        const hit = byText(strongCandidates);
        if (hit) {
          el = hit.el;
          matchStrategy = 'interactive';
          matchType = hit.matchType;
        }
      }

      if (!el) {
        const weakCandidates = Array.from(document.querySelectorAll('div, span, li')).filter(node => {
          const hasOnclick = typeof node.onclick === 'function';
          const tabIndex = node.getAttribute('tabindex');
          const focusable = tabIndex !== null && Number(tabIndex) >= 0;
          let pointer = false;
          try { pointer = window.getComputedStyle(node).cursor === 'pointer'; } catch(e) {}
          return hasOnclick || focusable || pointer;
        });
        const hit = byText(weakCandidates);
        if (hit) {
          el = hit.el;
          matchStrategy = 'weak-interactive';
          matchType = hit.matchType;
        }
      }

      if (!el) return JSON.stringify({ found: false, tried: q, matchStrategy: 'none' });
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      el.click();
      return JSON.stringify({
        found: true,
        tag: el.tagName.toLowerCase(),
        text: toText(el).slice(0, 80),
        id: el.id || null,
        className: typeof el.className === 'string' ? el.className : null,
        matchStrategy,
        matchType,
      });
    })(${JSON.stringify(clickTarget)})`,
    returnByValue: true,
  });

  clickResult = JSON.parse(r?.result?.value ?? '{\"found\":false}');

  if (!clickResult.found) {
    process.stderr.write(
      `  Warning: element not found for \"${clickTarget}\"\\n`,
    );
  } else {
    process.stderr.write(
      `  Clicked: <${clickResult.tag}> \"${clickResult.text}\" (${clickResult.matchStrategy}/${clickResult.matchType})\\n`,
    );
    // wait briefly for click-triggered requests to start, then wait by action mode
    await new Promise((r) => setTimeout(r, 200));
    await waitAfterAction(effectiveActionWait, actionWaitBudgetMs);

    // follow new tab if opened
    if (followNewTab && beforeTabs) {
      const beforeIds = new Set(beforeTabs.map((t) => t.id));
      let newTarget = null;
      const deadline = Date.now() + 3000;
      while (Date.now() < deadline && !newTarget) {
        const now = await (await fetch(`${CDP_BASE}/json/list`)).json();
        newTarget = now.find(
          (t) => !beforeIds.has(t.id) && (t.type === 'page' || !t.type),
        );
        if (!newTarget) await new Promise((r) => setTimeout(r, 250));
      }
      if (newTarget) {
        // switch session to new tab
        const fromTabId = tab.id;
        const toTabId = newTarget.id;
        session.close();
        tab = newTarget;
        session = new Session(tab.webSocketDebuggerUrl);
        await session.open();
        await Promise.all([
          session.send('Runtime.enable'),
          session.send('Network.enable'),
          session.send('Log.enable'),
          session.send('Page.enable'),
        ]);
        const readyState = await session.send('Runtime.evaluate', {
          expression: 'document.readyState',
          returnByValue: true,
        });
        tabTransition = {
          fromTabId,
          toTabId,
          reason: 'new-tab-after-click',
          readyState: readyState?.result?.value ?? null,
        };
        // annotate click result with tab switch
        clickResult.switchedToNewTab = true;
        clickResult.fromTabId = fromTabId;
        clickResult.toTabId = toTabId;
      }
    }
  }

  timings.clickMs = Date.now() - clickStart;
}

// ── fill input (locate by placeholder) ───────────────────────────────────────

let fillResult = null;

if (fillArg) {
  const fillStart = Date.now();
  const sep = fillArg.indexOf('::');
  const placeholder = sep !== -1 ? fillArg.slice(0, sep) : fillArg;
  const text = sep !== -1 ? fillArg.slice(sep + 2) : '';
  process.stderr.write(
    `Filling: placeholder="${placeholder}" text="${text}"\n`,
  );

  const r = await session.send('Runtime.evaluate', {
    expression: `(function(ph, txt) {
      const el = document.querySelector('input[placeholder="' + ph + '"], textarea[placeholder="' + ph + '"]');
      if (!el) return JSON.stringify({ found: false, tried: ph });
      el.focus();
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      // React/Vue-compatible: use native setter to trigger synthetic events
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, txt);
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return JSON.stringify({ found: true, tag: el.tagName.toLowerCase(), placeholder: el.placeholder });
    })(${JSON.stringify(placeholder)}, ${JSON.stringify(text)})`,
    returnByValue: true,
  });

  fillResult = JSON.parse(r?.result?.value ?? '{"found":false}');
  if (!fillResult.found) {
    process.stderr.write(
      `  Warning: input not found for placeholder="${placeholder}"\n`,
    );
  } else {
    process.stderr.write(
      `  Filled: <${fillResult.tag}> placeholder="${fillResult.placeholder}"\n`,
    );
    await new Promise((r) => setTimeout(r, 200));
    await waitAfterAction(effectiveActionWait, actionWaitBudgetMs);
  }

  timings.fillMs = Date.now() - fillStart;
}

// ── select option (locate by placeholder) ────────────────────────────────────

let selectResult = null;

if (selectArg) {
  const selectStart = Date.now();
  const sep = selectArg.indexOf('::');
  const placeholder = sep !== -1 ? selectArg.slice(0, sep) : selectArg;
  const value = sep !== -1 ? selectArg.slice(sep + 2) : '';
  process.stderr.write(
    `Selecting: placeholder="${placeholder}" value="${value}"\n`,
  );

  // Step 1: try native <select>, otherwise click the custom dropdown trigger
  const r1 = await session.send('Runtime.evaluate', {
    expression: `(function(ph, val) {
      // native <select>: match by placeholder attr or first option text
      const selects = Array.from(document.querySelectorAll('select'));
      const nativeSel = selects.find(s =>
        s.getAttribute('placeholder') === ph ||
        (s.options[0] && s.options[0].text.trim() === ph)
      );
      if (nativeSel) {
        const opt = Array.from(nativeSel.options).find(o => o.text.trim() === val || o.value === val);
        if (!opt) return JSON.stringify({ found: false, reason: 'option not found', tried: val });
        nativeSel.value = opt.value;
        nativeSel.dispatchEvent(new Event('change', { bubbles: true }));
        return JSON.stringify({ found: true, type: 'native', value: opt.value, text: opt.text.trim() });
      }
      // custom dropdown: find trigger by placeholder attr or visible placeholder text
      let trigger = document.querySelector('[placeholder="' + ph + '"]');
      if (!trigger) {
        const candidates = Array.from(document.querySelectorAll(
          '[role=combobox], [aria-haspopup], [class*=select], [class*=dropdown]'
        ));
        trigger = candidates.find(e => e.textContent.trim() === ph);
      }
      if (!trigger) return JSON.stringify({ found: false, reason: 'trigger not found', tried: ph });
      trigger.scrollIntoView({ behavior: 'instant', block: 'center' });
      trigger.click();
      return JSON.stringify({ found: true, type: 'custom', step: 'trigger_clicked' });
    })(${JSON.stringify(placeholder)}, ${JSON.stringify(value)})`,
    returnByValue: true,
  });

  selectResult = JSON.parse(r1?.result?.value ?? '{"found":false}');

  if (
    selectResult.type === 'custom' &&
    selectResult.step === 'trigger_clicked'
  ) {
    // Step 2: wait for dropdown to open, then click the matching option
    await new Promise((r) => setTimeout(r, 300));
    const r2 = await session.send('Runtime.evaluate', {
      expression: `(function(val) {
        const opts = Array.from(document.querySelectorAll(
          'option, [role=option], [role=menuitem], [class*=option-item], [class*=dropdown-item]'
        ));
        const opt = opts.find(e => e.textContent.trim() === val)
          ?? opts.find(e => e.textContent.trim().includes(val));
        if (!opt) return JSON.stringify({ found: false, tried: val });
        opt.click();
        return JSON.stringify({ found: true, type: 'custom', text: opt.textContent.trim() });
      })(${JSON.stringify(value)})`,
      returnByValue: true,
    });
    selectResult = JSON.parse(r2?.result?.value ?? '{"found":false}');
  }

  if (!selectResult.found) {
    process.stderr.write(
      `  Warning: select target not found (${selectResult.reason ?? 'unknown'})\n`,
    );
  } else {
    process.stderr.write(
      `  Selected: [${selectResult.type}] "${selectResult.text ?? selectResult.value}"\n`,
    );
    await new Promise((r) => setTimeout(r, 200));
    await waitAfterAction(effectiveActionWait, actionWaitBudgetMs);
  }

  timings.selectMs = Date.now() - selectStart;
}

// ── DOM dump (for Claude to identify selectors) ───────────────────────────────

let domSnapshot = null;

if (dumpDom) {
  const r = await session.send('Runtime.evaluate', {
    expression: `(function() {
      function walk(el, depth) {
        if (depth > 4) return null;
        const tag = el.tagName?.toLowerCase();
        if (!tag || ['script','style','svg','noscript','head'].includes(tag)) return null;
        const text = el.children.length === 0 ? el.textContent.trim().slice(0, 120) : '';
        const attrs = {};
        if (el.id) attrs.id = el.id;
        if (el.className && typeof el.className === 'string') {
          const cls = el.className.split(' ').filter(Boolean);
          if (cls.length) attrs.class = cls.slice(0, 4).join(' ');
        }
        const role = el.getAttribute('role'); if (role) attrs.role = role;
        const children = Array.from(el.children).map(c => walk(c, depth + 1)).filter(Boolean);
        if (!text && !children.length && !Object.keys(attrs).length) return null;
        return { tag, ...(Object.keys(attrs).length ? { attrs } : {}), ...(text ? { text } : {}), ...(children.length ? { children } : {}) };
      }
      return JSON.stringify(walk(document.body, 0));
    })()`,
    returnByValue: true,
  });
  domSnapshot = JSON.parse(r?.result?.value ?? 'null');
}

// ── variable capture / eval ───────────────────────────────────────────────────

let evalResult = null;
if (evalExpr) {
  const evalStart = Date.now();
  process.stderr.write(`Evaluating expression: ${evalExpr}\n`);
  try {
    const r = await session.send('Runtime.evaluate', {
      expression: evalExpr,
      returnByValue: true,
    });
    evalResult = r?.result?.value ?? null;
  } catch (e) {
    evalResult = { error: String(e.message) };
  }
  timings.evalMs = Date.now() - evalStart;
}

const variables = {};

if (varNames.length) {
  const varsStart = Date.now();
  process.stderr.write(`Capturing variables: ${varNames.join(', ')}\n`);

  const safeSerializerSrc = `
    (function captureVar(pathExpr) {
      const skipped = [];
      const seen = new WeakMap();

      function safe(val, path, depth) {
        if (depth > 5) { skipped.push({ path, reason: 'max_depth' }); return '[max depth]'; }
        if (val === null || val === undefined) return val;
        const t = typeof val;
        if (t === 'boolean' || t === 'number' || t === 'string') return val;
        if (t === 'bigint') return val.toString() + 'n';
        if (t === 'symbol') return val.toString();
        if (t === 'function') {
          skipped.push({ path, reason: 'function', detail: val.name || 'anonymous' });
          return '[Function: ' + (val.name || 'anonymous') + ']';
        }
        if (seen.has(val)) {
          skipped.push({ path, reason: 'circular', circularRef: seen.get(val) });
          return '[Circular -> ' + seen.get(val) + ']';
        }
        seen.set(val, path);
        if (Array.isArray(val)) return val.map((v, i) => safe(v, path + '[' + i + ']', depth + 1));
        const obj = {};
        for (const k of Object.keys(val)) {
          try { obj[k] = safe(val[k], path + '.' + k, depth + 1); }
          catch (e) { skipped.push({ path: path + '.' + k, reason: 'error', detail: e.message }); obj[k] = '[Error: ' + e.message + ']'; }
        }
        return obj;
      }

      function normalizePath(path) {
        return path
          .replace(/\[(\d+)\]/g, '.$1')
          .replace(/\[['\"]([^'\"]+)['\"]\]/g, '.$1');
      }

      function getByPath(root, path) {
        if (Object.prototype.hasOwnProperty.call(root, path)) return root[path];
        const normalized = normalizePath(path);
        const parts = normalized.split('.').filter(Boolean);
        let cur = root;
        for (const part of parts) {
          if (cur == null) return undefined;
          cur = cur[part];
        }
        return cur;
      }

      let val;
      try { val = getByPath(window, pathExpr); } catch(e) { return JSON.stringify({ exists: false, error: e.message, skippedPaths: [] }); }
      if (val === undefined) return JSON.stringify({ exists: false, skippedPaths: [] });
      return JSON.stringify({ exists: true, value: safe(val, pathExpr, 0), skippedPaths: skipped });
    })
  `;

  for (const varName of varNames) {
    try {
      const r = await session.send('Runtime.evaluate', {
        expression: `(${safeSerializerSrc})(${JSON.stringify(varName)})`,
        returnByValue: true,
      });
      variables[varName] = r?.result?.value
        ? JSON.parse(r.result.value)
        : { exists: false, error: r?.result?.description ?? 'unknown' };
    } catch (e) {
      variables[varName] = { exists: false, error: String(e.message) };
    }
    process.stderr.write(
      `  ${varName}: ${variables[varName].exists ? 'found' : 'not found'}${variables[varName].skippedPaths?.length ? ` (${variables[varName].skippedPaths.length} paths skipped)` : ''}\n`,
    );
  }

  timings.varsMs = Date.now() - varsStart;
}

// ── close or keep tab ─────────────────────────────────────────────────────────
// Default behaviour:
//   new tab  (no --tab-id)  → close unless --keep-tab
//   existing tab (--tab-id) → keep unless --close

const shouldClose = closeTab || (!keepTab && !tabId);
session.close();
if (shouldClose) await fetch(`${CDP_BASE}/json/close/${tab.id}`);

// ── output ────────────────────────────────────────────────────────────────────

const elapsedMs = Date.now() - tStart;
timings.totalMs = elapsedMs;
const result = {
  ...(keepTab || tabId ? { tabId: tab.id } : {}),
  activeTabId: tab.id,
  url: targetUrl ?? tab.url,
  capturedAt: stamp(),
  elapsedMs,
  waitUntil: effectiveWaitUntil,
  actionWait: effectiveActionWait,
  requestedWaitUntil: waitUntil,
  requestedActionWait: actionWait,
  earlyStop: lastWait.earlyStop,
  timedOut: lastWait.timedOut,
  timings,
  total: logs.length,
  errors: logs.filter((l) => l.level === 'error').length,
  warns: logs.filter((l) => l.level === 'warn').length,
  ...(tabTransition ? { tabTransition } : {}),
  ...(clickTarget ? { click: clickResult } : {}),
  ...(fillArg ? { fill: fillResult } : {}),
  ...(selectArg ? { select: selectResult } : {}),
  ...(dumpDom ? { dom: domSnapshot } : {}),
  ...(evalExpr ? { evalResult } : {}),
  ...(varNames.length ? { variables } : {}),
  ...(noEntries
    ? {}
    : {
        entries: entriesLimit
          ? logs.slice(Math.max(0, logs.length - entriesLimit))
          : logs,
      }),
};

process.stderr.write(
  `Done: ${result.errors} errors, ${result.warns} warns, ${result.total} total\n`,
);
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
