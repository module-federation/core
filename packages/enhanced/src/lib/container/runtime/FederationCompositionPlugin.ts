import fs from 'fs';
import type { Compilation, Compiler, Module } from 'webpack';
import {
  checkFederationGraph,
  planComposition,
  renderComposition,
  resolveImports,
  resolveRuntimeFamily,
  selectMode,
  utils,
  type AdapterName,
  type CompositionPlan,
  type GraphModule,
  type Participant,
  type RuntimeFamily,
} from '@module-federation/managers';
import {
  composeKeyWithSeparator,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const WebpackError = require(
  normalizeWebpackPath('webpack/lib/WebpackError'),
) as typeof import('webpack/lib/WebpackError');

const PLUGIN_NAME = 'FederationCompositionPlugin';
// Symbol.for, so every installed copy of enhanced shares one slot per compiler.
const SLOT = Symbol.for('module-federation.composition/1');

export interface ComposedEntry {
  /** A file path or data: URL, as FederationRuntimePlugin names its entry. */
  path: string;
  /** The rendered composition plus the runtime-plugin wiring. */
  source: string;
  adapters: AdapterName[];
}

interface Outcome {
  family: RuntimeFamily;
  entry?: ComposedEntry;
  legacyReason?: string;
  unsupportedReason?: string;
}

export interface CompositionSlot {
  participants: Participant[];
  sealed: boolean;
  planner?: object;
  entry?: ComposedEntry;
}

type SlotCompiler = Compiler & { [SLOT]?: CompositionSlot };

/** Passed by ModuleFederationPlugin to the sub-plugins its options participant covers. */
export const COVERED_BY_OPTIONS = Symbol('covered by ModuleFederationPlugin');
export type CoveredByOptions = typeof COVERED_BY_OPTIONS;

const usesSharedContainerPlugin = (compiler: Compiler) =>
  compiler.options.plugins.some(
    (plugin) =>
      typeof plugin === 'object' &&
      plugin !== null &&
      (plugin as { name?: unknown }).name === 'SharedContainerPlugin',
  );

function slotOf(compiler: Compiler): CompositionSlot {
  const target = compiler as SlotCompiler;
  return (target[SLOT] ??= { participants: [], sealed: false });
}

export const composedEntryOf = (compiler: Compiler) =>
  (compiler as SlotCompiler)[SLOT]?.entry;

type Options = moduleFederationPlugin.ModuleFederationPluginOptions;

const hasEntries = (value: unknown) =>
  Boolean(
    value &&
    (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0),
  );

export function optionsParticipant(options: Options): Participant {
  const optimization = options.experiments?.optimization;
  const disable: Extract<Participant, { kind: 'options' }>['disable'] = {};
  if (optimization?.disableShared) disable.shared = true;
  if (optimization?.disableRemote) disable.remote = true;
  if (optimization?.disableSnapshot) disable.snapshot = true;
  const needs: AdapterName[] = [];
  if (hasEntries(options.remotes)) needs.push('remotes');
  if (options.shared) needs.push('consumes');
  if (hasEntries(options.exposes)) needs.push('container');
  return { kind: 'options', disable, needs };
}

/**
 * Plans the federation bootstrap from the participants every federation plugin registers.
 * The first copy of enhanced applied to a compiler plans; other copies only register.
 */
class FederationCompositionPlugin {
  private _plan?: CompositionPlan;
  private _selecting?: Promise<Outcome | undefined>;
  private _outcome?: Outcome;

  constructor(
    private readonly _options: Options,
    private readonly _createEntry: (
      composition: string,
    ) => Omit<ComposedEntry, 'adapters'>,
  ) {}

  static register(compiler: Compiler, participant: Participant): void {
    if (usesSharedContainerPlugin(compiler)) return;
    const slot = slotOf(compiler);
    if (slot.sealed) {
      throw new Error(
        `A federation plugin needing ${JSON.stringify(participant.needs)} was applied after the federation runtime plan was sealed in afterResolvers. Apply federation plugins from apply() or afterPlugins.`,
      );
    }
    slot.participants.push(participant);
  }

  apply(compiler: Compiler): void {
    if (usesSharedContainerPlugin(compiler)) return;
    const slot = slotOf(compiler);
    if (slot.planner) return;
    slot.planner = this;

    // afterResolvers runs after every afterPlugins tap, where ModuleFederationPlugin applies its sub-plugins.
    compiler.hooks.afterResolvers.tap(PLUGIN_NAME, () => {
      slot.sealed = true;
      this._plan = planComposition(
        slot.participants,
        this._options.experiments?.optimization?.target ?? 'universal',
      );
    });
    // Mode selection may await function externals, so it runs in the first async hook before make.
    compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, async () => {
      this._selecting ??= this._select(compiler, slot);
      this._outcome = await this._selecting;
    });
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      if (this._outcome) this._check(compilation, this._outcome);
    });
  }

  private async _select(
    compiler: Compiler,
    slot: CompositionSlot,
  ): Promise<Outcome | undefined> {
    const plan = this._plan;
    if (!plan) return undefined;
    const family = resolveRuntimeFamily(
      this._options.implementation ?? __dirname,
    );
    const mode = await selectMode(family, {
      experiments: this._options.experiments,
      externals: compiler.options.externals as never,
      context: compiler.context,
      alias: compiler.options.resolve.alias as never,
      aliasExemptions: this._ownAliasTargets(compiler),
    });
    if (mode.mode === 'unsupported') {
      return { family, unsupportedReason: mode.reason };
    }
    if (mode.mode === 'legacy') return { family, legacyReason: mode.reason };
    const composition = renderComposition(
      plan,
      resolveImports(plan, family),
      this._buildId(compiler),
    );
    slot.entry = { ...this._createEntry(composition), adapters: plan.adapters };
    return { family, entry: slot.entry };
  }

  // FederationRuntimePlugin writes these aliases itself; they are not user aliases.
  private _ownAliasTargets(compiler: Compiler): string[] {
    const alias = compiler.options.resolve.alias;
    if (!alias || Array.isArray(alias)) return [];
    const record = alias as Record<string, unknown>;
    return [
      record['@module-federation/runtime$'],
      record['@module-federation/runtime-tools$'],
    ].filter((target): target is string => typeof target === 'string');
  }

  private _buildId(compiler: Compiler): string | undefined {
    const federationPlugins = compiler.options.plugins.filter(
      (plugin) =>
        !!plugin &&
        (plugin as { name?: unknown }).name === 'ModuleFederationPlugin',
    ).length;
    const { name } = this._options;
    return name && federationPlugins < 2
      ? composeKeyWithSeparator(name, utils.getBuildVersion())
      : undefined;
  }

  private _check(
    compilation: Compilation,
    { family, entry, legacyReason, unsupportedReason }: Outcome,
  ) {
    if (unsupportedReason !== undefined) {
      compilation.errors.push(
        new WebpackError(
          `The federation runtime cannot be composed: ${unsupportedReason}.`,
        ),
      );
      return;
    }
    const { externalRuntime, provideExternalRuntime } =
      this._options.experiments ?? {};
    // An externalized runtime is the full runtime by request; the other reasons are worth a warning.
    if (
      legacyReason !== undefined &&
      !externalRuntime &&
      !provideExternalRuntime
    ) {
      compilation.warnings.push(
        new WebpackError(
          `This build uses the full federation runtime because ${legacyReason}.`,
        ),
      );
    }
    compilation.hooks.finishModules.tap(PLUGIN_NAME, (modules) => {
      const findings = checkFederationGraph({
        ...summarize(compilation, modules),
        family,
        composed: entry && {
          adapters: entry.adapters,
          bootstraps: countBootstraps(compilation),
        },
      });
      for (const message of findings.errors)
        compilation.errors.push(new WebpackError(message));
      for (const message of findings.warnings)
        compilation.warnings.push(new WebpackError(message));
    });
  }
}

const CONTAINER_ENTRY_PREFIX = 'container entry ';

function summarize(compilation: Compilation, modules: Iterable<Module>) {
  const summary: { modules: GraphModule[]; externalRequests: string[] } = {
    modules: [],
    externalRequests: [],
  };
  // descriptionFileRoot keeps symlinks; the runtime family records real paths.
  const realRoots = new Map<string, string>();
  const realRoot = (root: string) => {
    let real = realRoots.get(root);
    if (real === undefined) {
      real = fs.realpathSync(root);
      realRoots.set(root, real);
    }
    return real;
  };
  for (const module of modules) {
    const { request, resource, resourceResolveData } = module as Module & {
      request?: unknown;
      resource?: string;
      resourceResolveData?: {
        descriptionFileData?: { name?: unknown };
        descriptionFileRoot?: string;
      };
    };
    if (module.type === 'javascript/dynamic' && isContainerEntry(module)) {
      summary.modules.push({ type: 'container-entry' });
      continue;
    }
    if (module instanceof compilation.compiler.webpack.ExternalModule) {
      const first = Array.isArray(request) ? request[0] : request;
      if (typeof first === 'string') summary.externalRequests.push(first);
      continue;
    }
    const name = resourceResolveData?.descriptionFileData?.name;
    const root = resourceResolveData?.descriptionFileRoot;
    summary.modules.push({
      type: module.type,
      resource,
      package:
        typeof name === 'string' && root
          ? { name, root: realRoot(root) }
          : undefined,
    });
  }
  return summary;
}

const isContainerEntry = (module: Module) =>
  module.identifier().startsWith(CONTAINER_ENTRY_PREFIX);

// Every copy of enhanced includes its bootstrap through a 'federation runtime dependency'.
function countBootstraps(compilation: Compilation): number {
  const bootstraps = new Set<Module>();
  for (const dependency of compilation.globalEntry.includeDependencies) {
    if (dependency.type !== 'federation runtime dependency') continue;
    const module = compilation.moduleGraph.getModule(dependency);
    if (module) bootstraps.add(module);
  }
  return bootstraps.size;
}

export default FederationCompositionPlugin;
