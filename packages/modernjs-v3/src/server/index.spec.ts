import { it, expect, describe, rs, beforeEach } from '@rstest/core';

rs.mock('@module-federation/runtime/helpers', () => ({
  default: { global: { resetFederationRuntime: rs.fn() } },
}));

import helpers from '@module-federation/runtime/helpers';
import { staticServePlugin } from './index';

type OnReset = (params: { event: { type: string } }) => void;

function setupPlugin(): OnReset {
  let onReset: OnReset | undefined;
  staticServePlugin().setup!({
    onReset: (fn: OnReset) => {
      onReset = fn;
    },
    onPrepare: rs.fn(),
  } as any);
  return onReset!;
}

describe('module federation server plugin', () => {
  beforeEach(() => {
    rs.clearAllMocks();
  });

  it('resets the federation runtime when the server bundles are rebuilt', () => {
    setupPlugin()({ event: { type: 'repack' } });

    expect(helpers.global.resetFederationRuntime).toHaveBeenCalledTimes(1);
  });

  it('keeps the federation runtime on plain file changes', () => {
    setupPlugin()({ event: { type: 'file-change' } });

    expect(helpers.global.resetFederationRuntime).not.toHaveBeenCalled();
  });
});
