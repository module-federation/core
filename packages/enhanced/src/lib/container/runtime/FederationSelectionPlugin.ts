import type { Compiler } from 'webpack';
import {
  capabilityDefines,
  finalizeRuntimeSelection,
  getSelectionSlot,
  inheritRuntimeSelection,
  registerRuntimeParticipant,
  type ParticipantRequest,
} from '@module-federation/managers/runtime-selection';

const PLUGIN_NAME = 'FederationSelectionPlugin';

function copySelectionToChild(parent: Compiler, child: Compiler): void {
  inheritRuntimeSelection(parent, child);
}

export function installRuntimeSelection(
  compiler: Compiler,
  request: ParticipantRequest,
): void {
  registerRuntimeParticipant(compiler, request);
  const slot = getSelectionSlot(compiler);
  if (slot.installed) {
    return;
  }
  slot.installed = true;

  const finalize = () => {
    const anchor = require.resolve('@module-federation/runtime-tools');
    const result = finalizeRuntimeSelection(
      compiler,
      compiler.options.target,
      anchor,
    );
    if (!result.profile || !result.image) {
      return;
    }
    new compiler.webpack.DefinePlugin(capabilityDefines(result.profile)).apply(
      compiler,
    );
  };

  compiler.hooks.afterResolvers.tap(PLUGIN_NAME, finalize);

  compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
    compilation.hooks.childCompiler.tap(PLUGIN_NAME, (child) => {
      copySelectionToChild(compiler, child);
    });
  });
}
