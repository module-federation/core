import {
  createObservability as createBaseObservability,
  type ObservabilityController,
  type ObservabilityEvent,
  type ObservabilityEventContext,
  type ObservabilityRuntimePlugin,
  type ObservabilityPluginOptions,
  type ObservabilityReport,
} from './core';

export interface ObservabilityNodeOptions extends Omit<
  ObservabilityPluginOptions,
  'browser'
> {
  fileOutput?: boolean;
  directory?: string;
  latestFile?: string;
  eventsFile?: string;
}

interface NodeOutputModules {
  fs: {
    mkdirSync(path: string, options?: { recursive?: boolean }): void;
    writeFileSync(path: string, data: string, encoding?: string): void;
    appendFileSync(path: string, data: string, encoding?: string): void;
  };
  path: {
    isAbsolute(path: string): boolean;
    join(...paths: string[]): string;
    resolve(...paths: string[]): string;
  };
}

const DEFAULT_NODE_DIRECTORY = '.mf/observability';
const DEFAULT_LATEST_FILE = 'latest.json';
const DEFAULT_EVENTS_FILE = 'events.jsonl';

let nodeOutputModulesPromise:
  | Promise<NodeOutputModules | undefined>
  | undefined;

declare const __non_webpack_require__: ((id: string) => unknown) | undefined;

function getNodeProcess():
  | { versions?: { node?: string }; cwd?: () => string }
  | undefined {
  return (
    globalThis as {
      process?: { versions?: { node?: string }; cwd?: () => string };
    }
  ).process;
}

function isNodeEnvironment() {
  return Boolean(getNodeProcess()?.versions?.node);
}

export function getNativeNodeRequire(): ((id: string) => unknown) | undefined {
  if (typeof __non_webpack_require__ === 'function') {
    return __non_webpack_require__;
  }

  const globalRequire = (
    globalThis as {
      __non_webpack_require__?: (id: string) => unknown;
    }
  ).__non_webpack_require__;
  if (typeof globalRequire === 'function') {
    return globalRequire;
  }

  try {
    return Function(
      'return typeof require === "function" ? require : undefined',
    )() as ((id: string) => unknown) | undefined;
  } catch {
    return undefined;
  }
}

function getRuntimeImport():
  | ((specifier: string) => Promise<Record<string, unknown>>)
  | undefined {
  try {
    return Function('specifier', 'return import(specifier)') as (
      specifier: string,
    ) => Promise<Record<string, unknown>>;
  } catch {
    return undefined;
  }
}

function unwrapDefaultExport<T>(moduleValue: T & { default?: T }) {
  return moduleValue.default || moduleValue;
}

async function getNodeOutputModules(): Promise<NodeOutputModules | undefined> {
  if (!isNodeEnvironment()) {
    return undefined;
  }

  if (nodeOutputModulesPromise) {
    return nodeOutputModulesPromise;
  }

  nodeOutputModulesPromise = (async () => {
    const nativeRequire = getNativeNodeRequire();
    if (nativeRequire) {
      try {
        const fs = nativeRequire('node:fs');
        const path = nativeRequire('node:path');
        return {
          fs,
          path,
        } as NodeOutputModules;
      } catch {
        // Fall through to dynamic import for ESM-only Node environments.
      }
    }

    const runtimeImport = getRuntimeImport();
    if (!runtimeImport) {
      return undefined;
    }

    try {
      const [fsModule, pathModule] = await Promise.all([
        runtimeImport('node:fs'),
        runtimeImport('node:path'),
      ]);

      return {
        fs: unwrapDefaultExport(fsModule),
        path: unwrapDefaultExport(pathModule),
      } as NodeOutputModules;
    } catch {
      return undefined;
    }
  })();

  return nodeOutputModulesPromise;
}

function getNodeOutputConfig(options: ObservabilityNodeOptions) {
  return {
    directory: options.directory || DEFAULT_NODE_DIRECTORY,
    latestFile: options.latestFile || DEFAULT_LATEST_FILE,
    eventsFile: options.eventsFile || DEFAULT_EVENTS_FILE,
  };
}

function shouldUseNodeOutput(options: ObservabilityNodeOptions) {
  return (
    options.enabled !== false &&
    options.fileOutput === true &&
    isNodeEnvironment()
  );
}

function shouldUseConsole(options: ObservabilityNodeOptions) {
  return options.console !== false;
}

function getNodeLatestPathForConsole(options: ObservabilityNodeOptions) {
  const config = getNodeOutputConfig(options);
  return `${config.directory}/${config.latestFile}`;
}

function getNodeEventsPathForConsole(options: ObservabilityNodeOptions) {
  const config = getNodeOutputConfig(options);
  return `${config.directory}/${config.eventsFile}`;
}

function isErrorEvent(event: ObservabilityEvent) {
  return (
    event.status === 'error' ||
    (event.status === 'complete' &&
      Boolean(event.errorName || event.errorMessage))
  );
}

function getRawStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  return undefined;
}

async function writeNodeOutput(
  options: ObservabilityNodeOptions,
  event: ObservabilityEvent,
  report: ObservabilityReport,
) {
  const modules = await getNodeOutputModules();
  if (!modules) {
    return;
  }

  const config = getNodeOutputConfig(options);
  const cwd = getNodeProcess()?.cwd?.() || '.';
  const directory = modules.path.isAbsolute(config.directory)
    ? config.directory
    : modules.path.resolve(cwd, config.directory);
  const latestFile = modules.path.join(directory, config.latestFile);
  const eventsFile = modules.path.join(directory, config.eventsFile);

  modules.fs.mkdirSync(directory, { recursive: true });
  modules.fs.writeFileSync(
    latestFile,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
  modules.fs.appendFileSync(eventsFile, `${JSON.stringify(event)}\n`, 'utf8');
}

function emitNodeConsoleHint(
  options: ObservabilityNodeOptions,
  event: ObservabilityEvent,
  report: ObservabilityReport,
  context: ObservabilityEventContext | undefined,
  reportedTraceIds: Set<string>,
  rawStack?: string,
) {
  if (
    !isErrorEvent(event) ||
    !shouldUseConsole(options) ||
    reportedTraceIds.has(report.traceId)
  ) {
    return;
  }

  reportedTraceIds.add(report.traceId);

  const lines = [
    '[Module Federation] Observability report generated',
    `traceId: ${report.traceId}`,
    `phase: ${report.failedPhase || event.phase}`,
  ];

  if (report.requestId) {
    lines.push(`requestId: ${report.requestId}`);
  }
  if (report.errorCode) {
    lines.push(`errorCode: ${report.errorCode}`);
  }
  if (report.shared?.name) {
    lines.push(`shared: ${report.shared.name}`);
  }

  if (shouldUseNodeOutput(options)) {
    lines.push(`latest: ${getNodeLatestPathForConsole(options)}`);
    lines.push(`events: ${getNodeEventsPathForConsole(options)}`);
  } else {
    lines.push('read: enable fileOutput or use onReport(report)');
  }

  if (options.printRawStack === true && rawStack) {
    lines.push('rawStack:', rawStack);
  }

  try {
    console.error(lines.join('\n'));
  } catch {
    // Console output is best-effort observability only.
  }
}

export function createNodeObservability(
  options: ObservabilityNodeOptions = {},
): ObservabilityController {
  let nodeWriteQueue: Promise<void> = Promise.resolve();
  const consoleReportedTraceIds = new Set<string>();
  const rawStackByTraceId = new Map<string, string>();
  const observability = createBaseObservability({
    ...options,
    console: false,
    browser: undefined,
    onRawError(error, context) {
      const rawStack = getRawStack(error);
      if (rawStack) {
        rawStackByTraceId.set(context.report.traceId, rawStack);
      }

      options.onRawError?.(error, context);
    },
    onEvent(event, report, context) {
      if (shouldUseNodeOutput(options)) {
        nodeWriteQueue = nodeWriteQueue
          .catch(() => undefined)
          .then(() => writeNodeOutput(options, event, report))
          .catch(() => undefined);
      }

      emitNodeConsoleHint(
        options,
        event,
        report,
        context,
        consoleReportedTraceIds,
        rawStackByTraceId.get(report.traceId),
      );
      try {
        options.onEvent?.(event, report, context);
      } finally {
        if (isErrorEvent(event)) {
          rawStackByTraceId.delete(report.traceId);
        }
      }
    },
    onReport(report, context) {
      options.onReport?.(report, context);
    },
  });

  observability.plugin.name = 'observability-node-plugin';

  const clear = observability.clear;
  observability.clear = () => {
    clear();
    nodeWriteQueue = Promise.resolve();
    consoleReportedTraceIds.clear();
    rawStackByTraceId.clear();
  };

  return observability;
}

export function ObservabilityPlugin(
  options: ObservabilityNodeOptions = {},
): ObservabilityRuntimePlugin {
  return createNodeObservability(options).plugin;
}

export default ObservabilityPlugin;
