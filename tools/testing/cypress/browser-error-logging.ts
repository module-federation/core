const BROWSER_LOG_STORE_KEY = '__mfCypressBrowserLogs__' as const;
const MAX_BROWSER_LOGS = 120;

type BrowserLogWindow = Window & {
  [BROWSER_LOG_STORE_KEY]?: string[];
};

let bufferedBrowserLogs: string[] = [];

function serialize(value: unknown): string {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value == null) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function pushBrowserLog(win: BrowserLogWindow, message: string) {
  const logs = [...(win[BROWSER_LOG_STORE_KEY] ?? []), message].slice(
    -MAX_BROWSER_LOGS,
  );
  win[BROWSER_LOG_STORE_KEY] = logs;
  bufferedBrowserLogs = logs;
}

function resetBufferedBrowserLogs() {
  bufferedBrowserLogs = [];
}

function formatFetchUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }

  if (
    typeof input === 'object' &&
    input !== null &&
    'href' in input &&
    typeof input.href === 'string'
  ) {
    return input.href;
  }

  if (
    typeof input === 'object' &&
    input !== null &&
    'url' in input &&
    typeof input.url === 'string'
  ) {
    return input.url;
  }

  return String(input);
}

Cypress.on('window:before:load', (win) => {
  const anyWin = win as unknown as BrowserLogWindow;
  resetBufferedBrowserLogs();
  anyWin[BROWSER_LOG_STORE_KEY] = [];

  const wrapConsole = (level: 'error' | 'warn') => {
    const original = win.console[level].bind(win.console);
    win.console[level] = (...args: unknown[]) => {
      pushBrowserLog(
        anyWin,
        `[browser console.${level}] ${args.map((arg) => serialize(arg)).join(' ')}`,
      );
      original(...args);
    };
  };

  wrapConsole('error');
  wrapConsole('warn');

  win.addEventListener('error', (event) => {
    pushBrowserLog(
      anyWin,
      `[browser window.error] ${event.message} @ ${event.filename}:${event.lineno}:${event.colno}`,
    );
  });

  win.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    pushBrowserLog(
      anyWin,
      `[browser unhandledrejection] ${serialize(event.reason)}`,
    );
  });

  const originalFetch = win.fetch.bind(win);
  win.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl = formatFetchUrl(input);
    try {
      const response = await originalFetch(input, init);
      if (
        !response.ok &&
        (requestUrl.includes('mf-manifest.json') ||
          requestUrl.includes('remoteEntry.js'))
      ) {
        pushBrowserLog(
          anyWin,
          `[browser fetch] ${requestUrl} -> ${response.status}`,
        );
      }
      return response;
    } catch (error) {
      pushBrowserLog(
        anyWin,
        `[browser fetch] ${requestUrl} failed: ${serialize(error)}`,
      );
      throw error;
    }
  };
});

Cypress.on('fail', (error) => {
  for (const logLine of bufferedBrowserLogs) {
    // eslint-disable-next-line no-console
    console.error(logLine);
    Cypress.log({
      name: 'browser-log',
      message: logLine,
    });
  }
  resetBufferedBrowserLogs();
  throw error;
});

afterEach(() => {
  for (const logLine of bufferedBrowserLogs) {
    cy.log(logLine);
  }
  resetBufferedBrowserLogs();
});
