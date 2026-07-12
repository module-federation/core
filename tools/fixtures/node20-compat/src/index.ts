import { init } from '@module-federation/runtime';
import type * as dtsPlugin from '@module-federation/dts-plugin';
import type * as enhanced from '@module-federation/enhanced';
import type * as node from '@module-federation/node';
import type * as runtime from '@module-federation/runtime';
import type * as runtimeCore from '@module-federation/runtime-core';
import type * as sdk from '@module-federation/sdk';

export type PublicPackageTypes = {
  sdk: typeof sdk;
  runtimeCore: typeof runtimeCore;
  runtime: typeof runtime;
  dtsPlugin: typeof dtsPlugin;
  enhanced: typeof enhanced;
  node: typeof node;
};

export const runtimeInitType = typeof init;

console.log(`[node20-compat] Bundled runtime init type: ${runtimeInitType}`);
