const BROWSER_LOG_STORE_KEY = '__mfCypressBrowserLogs__';
const MAX_BROWSER_LOGS = 120;

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

function pushBrowserLog(win: Record<string, unknown>, message: string) {
  const logs = ((win[BROWSER_LOG_STORE_KEY] as string[]) || []).concat(message);
  win[BROWSER_LOG_STORE_KEY] = logs.slice(-MAX_BROWSER_LOGS);
}

function formatFetchUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

Cypress.on('window:before:load', (win) => {
  const anyWin = win as Window & Record<string, unknown>;
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

  win.addEventListener('unhandledrejection', (event) => {
    pushBrowserLog(
      anyWin,
      `[browser unhandledrejection] ${serialize(
        (event as PromiseRejectionEvent).reason,
      )}`,
    );
  });

  const originalFetch = win.fetch.bind(win);
  win.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl = formatFetchUrl(input);
    try {
      const response = await originalFetch(input as RequestInfo, init);
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
  const win = Cypress.state('window') as
    | (Window & Record<string, unknown>)
    | undefined;
  const logs = (win?.[BROWSER_LOG_STORE_KEY] as string[]) || [];
  for (const logLine of logs) {
    // eslint-disable-next-line no-console
    console.error(logLine);
    Cypress.log({
      name: 'browser-log',
      message: logLine,
    });
  }
  throw error;
});

afterEach(() => {
  cy.window({ log: false, timeout: 1000 }).then(
    (win) => {
      const anyWin = win as Window & Record<string, unknown>;
      const logs = (anyWin[BROWSER_LOG_STORE_KEY] as string[]) || [];
      for (const logLine of logs) {
        cy.log(logLine);
      }
      anyWin[BROWSER_LOG_STORE_KEY] = [];
    },
    () => {
      // No active application window (for example, when visit fails very early).
    },
  );
});
