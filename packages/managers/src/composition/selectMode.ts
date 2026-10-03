import { FAMILY_PACKAGES, RUNTIME_FAMILY, type RuntimeFamily } from './family';
import { resolveCompositionEntry } from './resolveImports';

type ExternalCallback = (err?: Error | null, value?: unknown) => void;
type ExternalFunction = (...args: any[]) => unknown;
type ExternalItem =
  | string
  | RegExp
  | Record<string, unknown>
  | ExternalFunction;
type AliasValue = string | false | readonly string[];

export interface ModeInputs {
  experiments?: { externalRuntime?: unknown; provideExternalRuntime?: unknown };
  externals?: ExternalItem | readonly ExternalItem[];
  /** Passed to function externals as `context`. */
  context?: string;
  alias?:
    | Record<string, AliasValue>
    | readonly { name: string; alias: AliasValue }[];
  /** Alias targets written by the bundler or the wrapper, not by the user. */
  aliasExemptions?: readonly string[];
  /** Rspack only: whether `compiler.rspack.experiments.VirtualModulesPlugin` exists. */
  virtualModulesPlugin?: boolean;
}

export type RuntimeMode =
  | { mode: 'composed' }
  | { mode: 'legacy'; reason: string };

const hasOwn = (object: object, key: string) =>
  Object.prototype.hasOwnProperty.call(object, key);

export async function selectMode(
  family: RuntimeFamily,
  inputs: ModeInputs,
): Promise<RuntimeMode> {
  const reason =
    familyProblem(family) ??
    experimentProblem(inputs) ??
    (await externalsProblem(inputs)) ??
    aliasProblem(inputs) ??
    (inputs.virtualModulesPlugin === false
      ? 'this @rspack/core has no experiments.VirtualModulesPlugin'
      : undefined);
  return reason === undefined
    ? { mode: 'composed' }
    : { mode: 'legacy', reason };
}

function familyProblem({ anchor, members }: RuntimeFamily): string | undefined {
  let from = anchor;
  for (const pkg of FAMILY_PACKAGES) {
    const member = members[pkg];
    if (!member) return `${pkg} could not be resolved from ${from}`;
    if (member.name !== pkg) {
      return `${pkg} at ${member.root} is named ${JSON.stringify(member.name)}`;
    }
    const missing = RUNTIME_FAMILY[pkg].find(
      (key) => !declaresExportKey(member.exports, key),
    );
    if (missing) return `${pkg} at ${member.root} does not export "${missing}"`;
    for (const key of RUNTIME_FAMILY[pkg]) {
      try {
        const resolved = resolveCompositionEntry(
          member.root,
          `${pkg}/${key.slice(2)}`,
        );
        if (typeof resolved !== 'string') {
          throw new Error('the export did not resolve to a file');
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.startsWith(`"${key}" is not exported under `)
        ) {
          return `${pkg} at ${member.root} cannot resolve "${key}" for ESM composition`;
        }
        throw Object.assign(
          new Error(
            `${pkg} at ${member.root} failed to resolve "${key}" for ESM composition: ${error instanceof Error ? error.message : String(error)}`,
          ),
          { cause: error },
        );
      }
    }
    from = member.root;
  }
  return undefined;
}

const declaresExportKey = (exportsField: unknown, key: string) =>
  typeof exportsField === 'object' &&
  exportsField !== null &&
  hasOwn(exportsField, key);

function experimentProblem({ experiments }: ModeInputs): string | undefined {
  if (experiments?.externalRuntime) return 'experiments.externalRuntime is set';
  if (experiments?.provideExternalRuntime) {
    return 'experiments.provideExternalRuntime is set';
  }
  return undefined;
}

async function externalsProblem({
  externals,
  context = '',
}: ModeInputs): Promise<string | undefined> {
  if (externals === undefined) return undefined;
  const items = Array.isArray(externals) ? externals : [externals];
  const requests = FAMILY_PACKAGES.flatMap((pkg) => [
    pkg,
    ...RUNTIME_FAMILY[pkg].map((key) => `${pkg}/${key.slice(2)}`),
  ]);
  for (const request of requests) {
    for (const item of items) {
      try {
        if (await matchesExternal(item, request, context)) {
          return `${request} is externalized`;
        }
      } catch (error) {
        return `externals could not be checked for ${request}: ${(error as Error)?.message ?? error}`;
      }
    }
  }
  return undefined;
}

// Mirrors webpack's ExternalModuleFactoryPlugin: `false` and `undefined` mean not external.
async function matchesExternal(
  item: ExternalItem,
  request: string,
  context: string,
): Promise<boolean> {
  if (typeof item === 'string') return item === request;
  if (item instanceof RegExp) return item.test(request);
  if (typeof item === 'function') {
    const value = await callExternal(item, request, context);
    return value !== undefined && value !== false;
  }
  const { byLayer } = item;
  if (typeof byLayer === 'function') {
    throw new Error(
      'externals.byLayer is a function, so its layers cannot be listed',
    );
  }
  if (typeof byLayer === 'object' && byLayer !== null) {
    for (const layer of Object.values(byLayer)) {
      if (await matchesExternal(layer as ExternalItem, request, context)) {
        return true;
      }
    }
  }
  return (
    hasOwn(item, request) &&
    item[request] !== false &&
    item[request] !== undefined
  );
}

const resolveUnavailable = (
  _context: string,
  request: string,
  callback?: ExternalCallback,
) => {
  const error = new Error(
    `externals cannot resolve "${request}" before the compilation exists`,
  );
  if (!callback) return Promise.reject(error);
  callback(error);
  return undefined;
};

function callExternal(
  fn: ExternalFunction,
  request: string,
  context: string,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const callback: ExternalCallback = (err, value) =>
      err ? reject(err) : resolve(value);
    const result =
      fn.length === 3
        ? fn(context, request, callback)
        : fn(
            {
              request,
              context,
              dependencyType: 'esm',
              contextInfo: {
                issuer: '',
                issuerLayer: null,
                compiler: undefined,
              },
              getResolve: () => resolveUnavailable,
            },
            callback,
          );
    // An undefined return means the answer comes through the callback, as in
    // webpack; fn.length misses callbacks with default values.
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      (result as Promise<unknown>).then(resolve, reject);
    } else if (result !== undefined) {
      resolve(result);
    }
  });
}

function aliasProblem({
  alias,
  aliasExemptions = [],
}: ModeInputs): string | undefined {
  if (!alias) return undefined;
  const entries = Array.isArray(alias)
    ? alias.map(({ name, alias: value }) => [name, value] as const)
    : Object.entries(alias);
  for (const [key, value] of entries) {
    const name = key.endsWith('$') ? key.slice(0, -1) : key;
    const pkg = FAMILY_PACKAGES.find(
      (pkg) =>
        pkg === name ||
        pkg.startsWith(`${name}/`) ||
        name.startsWith(`${pkg}/`),
    );
    if (!pkg) continue;
    const targets = Array.isArray(value) ? value : [value];
    if (!targets.every((target) => aliasExemptions.includes(target))) {
      return `${pkg} is aliased by resolve.alias["${key}"]`;
    }
  }
  return undefined;
}
