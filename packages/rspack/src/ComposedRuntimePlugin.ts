import { createHash } from 'node:crypto';
import path from 'node:path';
import type { Compiler } from '@rspack/core';
import {
  planComposition,
  renderComposition,
  resolveImports,
  resolveRuntimeFamily,
  optionsParticipant,
  selectMode,
  type RuntimeFamily,
} from '@module-federation/managers';
import type { moduleFederationPlugin } from '@module-federation/sdk';

const PLUGIN_NAME = 'RspackComposedRuntimePlugin';
const RUNTIME = '@module-federation/runtime';

type Options = moduleFederationPlugin.ModuleFederationPluginOptions;

interface Composition {
  family: RuntimeFamily;
  bootstrapPath?: string;
  renderError?: unknown;
}

export class ComposedRuntimePlugin {
  constructor(
    private readonly _options: Options,
    private readonly _native: {
      runtimeTools: string;
      bundlerRuntime: string;
      runtime: string;
    },
    private readonly _buildId: string,
    private readonly _defines: Record<string, string | boolean>,
  ) {}

  apply(compiler: Compiler): void {
    let composition: Composition | undefined;
    let deciding: Promise<string | undefined> | undefined;
    let legacyReason: string | undefined;

    // VirtualModulesPlugin reads its modules in afterEnvironment.
    compiler.hooks.environment.tap(PLUGIN_NAME, () => {
      composition = this._render(compiler);
    });
    // rspack reads resolve.alias and its builtin plugins when it creates its native
    // compiler, after beforeRun and watchRun.
    const decide = async () => {
      deciding ??= this._decide(compiler, composition!).then((reason) => {
        this._applyDefines(compiler, reason === undefined);
        return reason;
      });
      legacyReason = await deciding;
    };
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, decide);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, decide);
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      if (legacyReason === undefined) return;
      compilation.warnings.push(
        new compiler.rspack.WebpackError(
          `experiments.composedRuntime is set, but this build uses the full federation runtime because ${legacyReason}.`,
        ),
      );
    });
  }

  private _render(compiler: Compiler): Composition {
    const family = resolveRuntimeFamily(this._native.runtimeTools);
    const VirtualModulesPlugin =
      compiler.rspack.experiments.VirtualModulesPlugin;
    if (!VirtualModulesPlugin) return { family };
    const plan = planComposition(
      [optionsParticipant(this._options)],
      this._options.experiments?.optimization?.target ?? 'universal',
    );
    let source: string;
    try {
      source = renderComposition(
        plan,
        resolveImports(plan, family),
        this._buildId,
      );
    } catch (renderError) {
      return { family, renderError };
    }
    const name = this._options.name!.replace(/[^\w.-]/g, '_');
    const hash = createHash('sha256')
      .update(JSON.stringify(plan))
      .digest('hex')
      .slice(0, 12);
    const file = path.resolve(
      compiler.context,
      `node_modules/.federation/rspack/${name}.${hash}.mjs`,
    );
    new VirtualModulesPlugin({ [file]: source }).apply(compiler);
    return { family, bootstrapPath: file };
  }

  private async _decide(
    compiler: Compiler,
    { family, bootstrapPath, renderError }: Composition,
  ): Promise<string | undefined> {
    const { resolve } = compiler.options;
    const alias = (resolve.alias ?? {}) as Record<string, unknown>;
    const mode = await selectMode(family, {
      experiments: this._options.experiments,
      externals: compiler.options.externals as never,
      context: compiler.context,
      alias: alias as never,
      aliasExemptions: [this._native.runtimeTools, this._native.runtime],
      virtualModulesPlugin: Boolean(
        compiler.rspack.experiments.VirtualModulesPlugin,
      ),
    });
    if (mode.mode === 'legacy') return mode.reason;
    if (!bootstrapPath) throw renderError;
    if (alias[this._native.bundlerRuntime] !== undefined) {
      return `resolve.alias already maps ${this._native.bundlerRuntime}`;
    }
    const runtime = alias[RUNTIME];
    resolve.alias = {
      ...alias,
      [this._native.bundlerRuntime]: bootstrapPath,
      ...(runtime === this._native.runtime && {
        [RUNTIME]: resolveRuntimeEsm(family),
      }),
    } as typeof resolve.alias;
    return undefined;
  }

  private _applyDefines(compiler: Compiler, composed: boolean) {
    const { DefinePlugin } = compiler.rspack;
    if (!composed) return new DefinePlugin(this._defines).apply(compiler);
    const { ENV_TARGET } = this._defines;
    if (ENV_TARGET !== undefined)
      new DefinePlugin({ ENV_TARGET }).apply(compiler);
  }
}

function resolveRuntimeEsm({ members }: RuntimeFamily): string {
  return require.resolve(`${RUNTIME}/bundler`, {
    paths: [members['@module-federation/webpack-bundler-runtime']!.root],
  });
}
