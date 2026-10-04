import { MODULE_DEVTOOL_IDENTIFIER } from '@module-federation/sdk';
import {
  BROWSER_ENV_KEY,
  __FEDERATION_DEVTOOLS__,
  __ENABLE_FAST_REFRESH__,
  __EAGER_SHARE__,
} from '../../template/constant';
import { sanitizePostMessagePayload } from './safe-post-message';
import { normalizeObservabilityDevtoolsConfig } from './observability-shared';
import {
  OBSERVABILITY_DEVTOOLS_STORAGE_KEY,
  OBSERVABILITY_DEVTOOLS_SOURCE,
} from './messages';
import { readSnapshotFromPage } from './observability';

const coreModule = require('../../vendor/basic-proxy-core.js');
const core = coreModule.default || coreModule;

type Rule = { key: string; value: string; checked: boolean };
type Config = Record<string, unknown> & {
  overrides?: Record<string, string>;
  proxyRules?: Rule[];
  enableClip?: boolean;
};
type Input = Record<string, unknown>;
export interface DevtoolsTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean };
  execute: (input: Input) => Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }>;
}
export interface ModelContext {
  registerTool: (tool: DevtoolsTool) => void | Promise<void>;
  unregisterTool?: (name: string) => void | Promise<void>;
}

const isRecord = (value: unknown): value is Input =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const readConfig = (): Config => {
  const raw = localStorage.getItem(__FEDERATION_DEVTOOLS__);
  const value: unknown = raw ? JSON.parse(raw) : {};
  if (!isRecord(value))
    throw new Error('Invalid devtools configuration in page storage.');
  return value;
};

// All page storage writes finish before returning reloadRequired. Roll back if
// storage quota/access errors would otherwise leave a partially applied proxy.
const persist = (values: Record<string, string | null>) => {
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, localStorage.getItem(key)]),
  );
  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
  } catch (error) {
    for (const [key, value] of Object.entries(previous)) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        /* Preserve the original storage error. */
      }
    }
    throw error;
  }
  // Reuse the existing read-only page-to-extension snapshot channel so an open
  // popup/side panel sees tool changes without granting page code extension APIs.
  try {
    window.postMessage(
      sanitizePostMessagePayload({
        moduleInfo: modules(),
        share: federation()?.__SHARE__ || {},
      }),
      location.origin,
    );
  } catch {
    /* UI delivery is best effort; persisted state remains authoritative. */
  }
};

const federation = () => window.__FEDERATION__ || (window as any).__VMOK__;
const modules = () => federation()?.moduleInfo || {};
const reloadResult = () => ({
  saved: true,
  reloadRequired: true,
  instruction:
    'Reload this page using browser navigation, then call mf_get_state to verify. No navigation has been started by this tool.',
});
const boolean = (value: unknown, name: string): boolean => {
  if (typeof value !== 'boolean') throw new Error(`${name} must be a boolean.`);
  return value;
};
const validateRules = (value: unknown): Rule[] => {
  if (!Array.isArray(value) || value.length > 100)
    throw new Error('rules must be an array of at most 100 rules.');
  const names = new Set<string>();
  return value.map((rule) => {
    if (
      !isRecord(rule) ||
      typeof rule.key !== 'string' ||
      !rule.key.trim() ||
      typeof rule.value !== 'string' ||
      !rule.value.trim()
    )
      throw new Error('Each rule needs a nonempty key and value.');
    const key = rule.key.trim();
    const destination = rule.value.trim();
    if (
      key
        .split(':')
        .some((part) =>
          ['__proto__', 'constructor', 'prototype'].includes(part),
        ) ||
      names.has(key)
    )
      throw new Error(`Invalid or duplicate remote key: ${key}`);
    names.add(key);
    // The core supports HTTP(S) manifest/entry URLs and registry versions/tags.
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(destination)) {
      const url = new URL(destination, location.href);
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error(
          'Remote URLs must use HTTP(S), without embedded credentials.',
        );
    } else if (!/^[\w.*^~<>=|+ -]+$/.test(destination)) {
      throw new Error('Use an absolute HTTP(S) URL or a registry version/tag.');
    }
    return {
      key,
      value: destination,
      checked:
        rule.checked === undefined ? true : boolean(rule.checked, 'checked'),
    };
  });
};
const writeProxy = (rules: Rule[], clip: boolean) => {
  const active = rules.filter((rule) => rule.checked);
  const snapshot = core.getModuleInfo(active, modules());
  if (clip) {
    for (const entry of Object.values(snapshot.moduleInfo)) {
      if (!isRecord(entry)) continue;
      if (entry.modules) entry.modules = [];
      if (entry.shared) entry.shared = [];
    }
  }
  persist({
    [MODULE_DEVTOOL_IDENTIFIER]: active.length
      ? JSON.stringify(snapshot.moduleInfo)
      : null,
    [BROWSER_ENV_KEY]: active.length ? 'true' : null,
    [__FEDERATION_DEVTOOLS__]: JSON.stringify({
      ...readConfig(),
      overrides: snapshot.overrides,
      proxyRules: rules,
      enableClip: clip,
    }),
  });
  return { ...reloadResult(), rules, clip };
};

const state = () => ({
  url: location.href,
  moduleInfo: modules(),
  shared: federation()?.__SHARE__ || {},
  registeredPlugins: (federation()?.__GLOBAL_PLUGIN__ || []).map(
    (plugin: any) => plugin.name,
  ),
  config: readConfig(),
  observability: readSnapshotFromPage(OBSERVABILITY_DEVTOOLS_STORAGE_KEY),
});

const schema = (properties: Input = {}, required: string[] = []) => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});
const boolSchema = { type: 'boolean' };
const ruleSchema = schema(
  {
    key: { type: 'string', minLength: 1 },
    value: { type: 'string', minLength: 1 },
    checked: boolSchema,
  },
  ['key', 'value'],
);

export const createDevtoolsTools = (): DevtoolsTool[] => {
  const tool = (
    name: string,
    description: string,
    inputSchema: ReturnType<typeof schema>,
    readOnly: boolean,
    execute: (input: Input) => unknown,
  ): DevtoolsTool => ({
    name,
    description,
    inputSchema,
    annotations: { readOnlyHint: readOnly },
    execute: async (input = {}) => {
      try {
        if (
          !isRecord(input) ||
          Object.keys(input).some(
            (key) => !Object.hasOwn(inputSchema.properties, key),
          )
        )
          throw new Error('Unexpected tool arguments.');
        const result = await execute(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(sanitizePostMessagePayload(result)),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: error instanceof Error ? error.message : String(error),
            },
          ],
        };
      }
    },
  });
  return [
    tool(
      'mf_get_state',
      'Read Module Federation runtime, proxy/HMR settings and loading reports for this page. Saved settings may require a page reload before taking effect.',
      schema(),
      true,
      state,
    ),
    tool(
      'mf_get_modules',
      'Read all module snapshots, or one snapshot by its exact module ID.',
      schema({ moduleId: { type: 'string' } }),
      true,
      ({ moduleId }) => {
        if (moduleId === undefined) return modules();
        if (typeof moduleId !== 'string' || !Object.hasOwn(modules(), moduleId))
          throw new Error(
            'Unknown module ID. Call mf_get_modules without arguments to list IDs.',
          );
        return modules()[moduleId];
      },
    ),
    tool(
      'mf_get_dependencies',
      'Read dependency graph data: module snapshots, consumers and remote IDs.',
      schema(),
      true,
      () => ({ modules: modules(), ...core.separateType(modules()) }),
    ),
    tool(
      'mf_get_shared',
      'Read shared dependency scopes, versions and loaded state. Functions are returned as placeholders and are never invoked.',
      schema(),
      true,
      () => federation()?.__SHARE__ || {},
    ),
    tool(
      'mf_set_proxy',
      'Replace all proxy rules on this page. key is a remote name/ID; value is an HTTP(S) manifest/entry URL or registry version. checked=false disables a rule. clip removes module/shared snapshot lists. Returns reloadRequired; CSP/CORS still apply.',
      schema(
        {
          rules: { type: 'array', maxItems: 100, items: ruleSchema },
          clip: boolSchema,
        },
        ['rules'],
      ),
      false,
      ({ rules, clip }) =>
        writeProxy(
          validateRules(rules),
          clip === undefined
            ? Boolean(readConfig().enableClip)
            : boolean(clip, 'clip'),
        ),
    ),
    tool(
      'mf_clear_proxy',
      'Clear all proxy rules and injected snapshot data for this page, preserving HMR and tracing settings. Reload afterwards.',
      schema(),
      false,
      () => writeProxy([], Boolean(readConfig().enableClip)),
    ),
    tool(
      'mf_set_hmr',
      'Enable or disable the extension React Fast Refresh/shared development React replacement for this page. Save first, then reload so document_start scripts apply it before React loads. Eager shares may require an additional automatic reload.',
      schema({ enabled: boolSchema }, ['enabled']),
      false,
      ({ enabled }) => {
        const next = {
          ...readConfig(),
          [__ENABLE_FAST_REFRESH__]: boolean(enabled, 'enabled'),
        };
        if (!enabled) delete next[__EAGER_SHARE__];
        persist({ [__FEDERATION_DEVTOOLS__]: JSON.stringify(next) });
        return reloadResult();
      },
    ),
    tool(
      'mf_configure_loading_trace',
      'Configure the extension Loading Trace plugin on this page. enabled=false disables it on next reload. Does not disable user-installed observability plugins.',
      schema(
        {
          enabled: boolSchema,
          level: { type: 'string', enum: ['error', 'summary', 'verbose'] },
          maxEvents: { type: 'integer', minimum: 10, maximum: 1000 },
          console: boolSchema,
          browserEnabled: boolSchema,
          scope: { type: 'string', minLength: 1 },
          mode: { type: 'string', enum: ['development', 'production'] },
          printStart: boolSchema,
        },
        ['enabled'],
      ),
      false,
      (input) => {
        const enabled = boolean(input.enabled, 'enabled');
        for (const key of ['console', 'browserEnabled', 'printStart'])
          if (input[key] !== undefined) boolean(input[key], key);
        if (
          input.level !== undefined &&
          !['error', 'summary', 'verbose'].includes(String(input.level))
        )
          throw new Error('Invalid trace level.');
        if (
          input.mode !== undefined &&
          !['development', 'production'].includes(String(input.mode))
        )
          throw new Error('Invalid trace mode.');
        if (
          input.scope !== undefined &&
          (typeof input.scope !== 'string' || !input.scope.trim())
        )
          throw new Error('Invalid trace scope.');
        if (
          input.maxEvents !== undefined &&
          (typeof input.maxEvents !== 'number' ||
            !Number.isInteger(input.maxEvents) ||
            input.maxEvents < 10 ||
            input.maxEvents > 1000)
        )
          throw new Error('maxEvents must be an integer between 10 and 1000.');
        const raw = localStorage.getItem(OBSERVABILITY_DEVTOOLS_STORAGE_KEY);
        const old = normalizeObservabilityDevtoolsConfig(
          raw ? JSON.parse(raw) : undefined,
        );
        const config = normalizeObservabilityDevtoolsConfig({
          ...old,
          ...input,
          enabled,
          browser: {
            enabled: input.browserEnabled ?? old.browser.enabled,
            scope: input.scope ?? old.browser.scope,
            mode: input.mode ?? old.browser.mode,
          },
          trace: { printStart: input.printStart ?? old.trace.printStart },
        } as any);
        persist({
          [OBSERVABILITY_DEVTOOLS_STORAGE_KEY]: enabled
            ? JSON.stringify(config)
            : null,
        });
        window.postMessage(
          {
            source: OBSERVABILITY_DEVTOOLS_SOURCE,
            kind: 'config-saved',
            config,
          },
          location.origin,
        );
        return { ...reloadResult(), config };
      },
    ),
    tool(
      'mf_get_loading_reports',
      'Read current loading reports and trace configuration from all available observability scopes.',
      schema(),
      true,
      () => readSnapshotFromPage(OBSERVABILITY_DEVTOOLS_STORAGE_KEY),
    ),
    tool(
      'mf_export_snapshot',
      'Export a JSON snapshot of modules, shared dependencies, proxy/HMR configuration and loading reports. Returns data without initiating a download.',
      schema(),
      true,
      () => ({ exportedAt: new Date().toISOString(), ...state() }),
    ),
  ];
};

export const getModelContext = (): ModelContext | undefined =>
  [(document as any).modelContext, (navigator as any).modelContext].find(
    (context) => typeof context?.registerTool === 'function',
  );

// No polyfill: a JS shim cannot make a browser expose tools to an agent.
// Support current document.modelContext and earlier navigator.modelContext hosts.
export const registerDevtoolsWebMCP = async (
  context: ModelContext | undefined = getModelContext(),
): Promise<() => Promise<void>> => {
  if (typeof context?.registerTool !== 'function') return async () => {};
  const registered: string[] = [];
  const cleanup = async () => {
    for (const name of registered.splice(0)) {
      try {
        if (typeof context.unregisterTool === 'function')
          await context.unregisterTool(name);
      } catch {
        /* Host may already have disposed the document. */
      }
    }
  };
  try {
    for (const tool of createDevtoolsTools()) {
      await context.registerTool(tool);
      registered.push(tool.name);
    }
  } catch (error) {
    await cleanup();
    throw error;
  }
  return cleanup;
};

// Start immediately, but allow an asynchronously installed host API to arrive.
// The diagnostic contains no page data and can be inspected from the console.
export const startDevtoolsWebMCP = (retryMs = 250, maxAttempts = 120) => {
  const diagnostic = {
    status: 'waiting' as
      | 'waiting'
      | 'registering'
      | 'registered'
      | 'unavailable'
      | 'error',
    attempts: 0,
    tools: [] as string[],
    error: undefined as string | undefined,
  };
  (window as any).__MF_DEVTOOLS_WEBMCP__ = diagnostic;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let cleanup: (() => Promise<void>) | undefined;
  const attempt = async () => {
    if (stopped) return;
    diagnostic.attempts++;
    const context = getModelContext();
    if (!context) {
      if (diagnostic.attempts < maxAttempts) {
        timer = setTimeout(() => void attempt(), retryMs);
      } else {
        diagnostic.status = 'unavailable';
        console.warn(
          '[Module Federation Devtools] WebMCP host API unavailable',
          diagnostic,
        );
      }
      return;
    }
    diagnostic.status = 'registering';
    try {
      cleanup = await registerDevtoolsWebMCP(context);
      if (stopped) {
        await cleanup();
        return;
      }
      diagnostic.tools = createDevtoolsTools().map(({ name }) => name);
      diagnostic.status = 'registered';
    } catch (error) {
      diagnostic.status = 'error';
      diagnostic.error = error instanceof Error ? error.message : String(error);
      console.warn(
        '[Module Federation Devtools] WebMCP registration failed',
        error,
      );
    }
  };
  void attempt();
  return async () => {
    stopped = true;
    clearTimeout(timer);
    await cleanup?.();
  };
};
