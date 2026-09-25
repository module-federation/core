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
  type Participant,
  type RuntimeFamily,
  type RuntimeMode,
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
  ) {}

  apply(compiler: Compiler): void {
    let composition: Composition | undefined;
    let deciding: Promise<RuntimeMode> | undefined;
    let mode: RuntimeMode | undefined;

    // VirtualModulesPlugin reads its modules in afterEnvironment.
    compiler.hooks.environment.tap(PLUGIN_NAME, () => {
      composition = this._render(compiler);
    });
    // rspack reads resolve.alias and its builtin plugins when it creates its native
    // compiler, after beforeRun and watchRun.
    const decide = async () => {
      deciding ??= this._decide(compiler, composition!);
      mode = await deciding;
    };
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, decide);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, decide);
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      const { WebpackError } = compiler.rspack;
      if (mode?.mode === 'unsupported') {
        compilation.errors.push(
          new WebpackError(
            `The federation runtime cannot be composed: ${mode.reason}.`,
          ),
        );
        return;
      }
      if (mode?.mode === 'legacy' && !mode.requested) {
        compilation.warnings.push(
          new WebpackError(
            `This build uses the full federation runtime because ${mode.reason}.`,
          ),
        );
      }
    });
  }

  private _render(compiler: Compiler): Composition {
    const family = resolveRuntimeFamily(this._native.runtimeTools);
    const VirtualModulesPlugin =
      compiler.rspack.experiments.VirtualModulesPlugin;
    if (!VirtualModulesPlugin) return { family };
    const participants: Participant[] = [optionsParticipant(this._options)];
    // rspack's async startup runtime installs its consumes handler even without shared modules.
    if (this._options.experiments?.asyncStartup) {
      participants.push({ kind: 'needs', needs: ['consumes'] });
    }
    const plan = planComposition(
      participants,
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
  ): Promise<RuntimeMode> {
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
    if (mode.mode !== 'composed') return mode;
    if (!bootstrapPath) throw renderError;
    if (alias[this._native.bundlerRuntime] !== undefined) {
      return {
        mode: 'legacy',
        reason: `resolve.alias already maps ${this._native.bundlerRuntime}`,
      };
    }
    const runtime = alias[RUNTIME];
    resolve.alias = {
      ...alias,
      [this._native.bundlerRuntime]: bootstrapPath,
      ...(runtime === this._native.runtime && {
        [RUNTIME]: resolveRuntimeEsm(family),
      }),
    } as typeof resolve.alias;
    return mode;
  }
}

function resolveRuntimeEsm({ members }: RuntimeFamily): string {
  return require.resolve(`${RUNTIME}/bundler`, {
    paths: [members['@module-federation/webpack-bundler-runtime']!.root],
  });
}
