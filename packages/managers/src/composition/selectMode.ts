import { FAMILY_PACKAGES, RUNTIME_FAMILY, type RuntimeFamily } from './family';

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
    const exportsField = member.exports;
    for (const key of RUNTIME_FAMILY[pkg]) {
      // Own keys only: a "./*" pattern key does not prove the subpath exists.
      if (
        typeof exportsField !== 'object' ||
        exportsField === null ||
        !hasOwn(exportsField, key)
      ) {
        return `${pkg} at ${member.root} does not export "${key}"`;
      }
    }
    from = member.root;
  }
  return undefined;
}

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
  for (const pkg of FAMILY_PACKAGES) {
    for (const item of items) {
      try {
        if (await matchesExternal(item, pkg, context)) {
          return `${pkg} is externalized`;
        }
      } catch (error) {
        return `an externals function threw for ${pkg}: ${(error as Error)?.message ?? error}`;
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
  return (
    hasOwn(item, request) &&
    item[request] !== false &&
    item[request] !== undefined
  );
}

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
        : fn({ request, context }, callback);
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      (result as Promise<unknown>).then(resolve, reject);
    } else if (fn.length < 2) {
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
